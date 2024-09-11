import { SerializeFrom, json } from "@remix-run/cloudflare";
import { parseExpression } from "cron-parser";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { doubleDecode, getUserId } from "~/session.server";
import { backups, getDb } from "~/store.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import {
  snowflakeAsString,
  zxParseJson,
  zxParseParams,
  zxParseQuery,
} from "~/util/zod";
import { findMessagesPreviewImageUrl } from "./backups";

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  const { data: returnData } = zxParseQuery(request, {
    data: z.optional(zx.BoolAsString),
  });
  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  const backup = await db.query.backups.findFirst({
    where: (backups, { eq }) => eq(backups.id, id),
    columns: {
      id: true,
      name: true,
      data: returnData,
      dataVersion: true,
      ownerId: true,
      previewImageUrl: true,
      importedFromOrg: true,
      scheduled: true,
      nextRunAt: true,
      cron: true,
      timezone: true,
    },
  });
  if (!backup || backup.ownerId !== userId) {
    throw json(
      { message: "No backup with that ID or you do not own it." },
      404,
    );
  }

  return {
    ...backup,
    data:
      "data" in backup
        ? doubleDecode<QueryData>(backup.data as QueryData)
        : null,
  };
};

export type ApiGetBackup = SerializeFrom<typeof loader>;

export type ApiGetBackupWithData = ApiGetBackup & {
  data: QueryData;
};

const fixZodQueryData = (data: QueryData): QueryData => {
  // `_id` is editor-only state
  data.messages = data.messages.map(({ _id: _, ...m }) => {
    for (const row of m.data.components ?? []) {
      // We don't want to store flow data in backups since
      // it is already stored separately.
      row.components = row.components.map((component) => {
        if ("flow" in component) {
          const { flow: _, ...rest } = component;
          return rest;
        }
        if ("flows" in component && component.flows) {
          const { flows: _, ...rest } = component;
          return rest;
        }
        return component;
      });
    }
    return m;
  });
  return data;
};

export const action = async ({ request, params, context }: ActionArgs) => {
  const userId = await getUserId(request, context, true);
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  const {
    name,
    data,
    scheduleAt,
    cron: expression,
    timezone,
  } = await zxParseJson(request, {
    name: z.string().max(100).optional(),
    data: ZodQueryData.transform(fixZodQueryData).optional(),
    scheduleAt: z
      .string()
      .datetime()
      .transform((v) => new Date(v))
      .refine(
        (d) => d.getTime() - new Date().getTime() >= 30_000,
        "Scheduled time must be at least 30 seconds in the future",
      )
      .nullable()
      .optional(),
    cron: z
      .string()
      .refine((v) => {
        try {
          const exp = parseExpression(v);
          if (!exp.hasNext()) return false;

          const next = exp.next();
          const after = exp.next();
          // Maximum closeness is once every two hours
          return after.getTime() - next.getTime() >= 7_200_000;
        } catch {
          return false;
        }
      }, "Scheduled runs cannot be more frequent than once every 2 hours")
      .nullable()
      .optional(),
    timezone: z.ostring(),
  });
  const cron =
    expression === null
      ? null
      : expression
        ? parseExpression(expression, { tz: timezone })
        : undefined;

  const db = getDb(context.env.HYPERDRIVE);
  const backup = await db.query.backups.findFirst({
    where: (backups, { eq }) => eq(backups.id, id),
    columns: {
      ownerId: true,
      data: true,
      scheduled: true,
    },
  });
  if (!backup || backup.ownerId !== userId) {
    throw json(
      { message: "No backup with that ID or you do not own it." },
      404,
    );
  }

  const isScheduled =
    scheduleAt === undefined && cron === undefined
      ? undefined
      : !!(scheduleAt || cron || undefined);

  const targets = data ? data.targets : backup.data.targets;
  if (isScheduled && (!targets || targets.length === 0)) {
    throw json(
      {
        message:
          "This backup does not have any targets, so it cannot be scheduled. Edit the backup and add a webhook.",
      },
      400,
    );
  }

  const nextRunAt = cron ? cron.next().toDate() : scheduleAt;
  const updated = (
    await db
      .update(backups)
      .set({
        name,
        data,
        previewImageUrl: data
          ? findMessagesPreviewImageUrl(data.messages)
          : undefined,
        scheduled: isScheduled,
        nextRunAt,
        cron: cron === null ? null : cron ? cron.stringify() : undefined,
        timezone,
      })
      .where(eq(backups.id, id))
      .returning({
        id: backups.id,
        name: backups.name,
        ownerId: backups.ownerId,
        updatedAt: backups.updatedAt,
        scheduled: backups.scheduled,
        nextRunAt: backups.nextRunAt,
        previewImageUrl: backups.previewImageUrl,
      })
  )[0];

  if (isScheduled && nextRunAt) {
    const doId = context.env.SCHEDULER.idFromName(String(id));
    const stub = context.env.SCHEDULER.get(doId);
    await stub.fetch(
      `http://do/schedule?${new URLSearchParams({
        id: String(id),
        nextRunAt: nextRunAt.toISOString(),
      })}`,
    );
  }

  return updated;
};
