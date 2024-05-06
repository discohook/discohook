import { json } from "@remix-run/cloudflare";
import { CronExpression, parseExpression } from "cron-parser";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { doubleDecode, getUserId } from "~/session.server";
import { backups, getDb } from "~/store.server";
import { QueryData, ZodQueryData } from "~/types/QueryData";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import {
  snowflakeAsString,
  zxParseForm,
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

  const db = getDb(context.env.DATABASE_URL);
  const backup = await db.query.backups.findFirst({
    where: eq(backups.id, id),
    columns: {
      id: true,
      name: true,
      data: returnData,
      dataVersion: true,
      ownerId: true,
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

export const action = async ({ request, params, context }: ActionArgs) => {
  const userId = await getUserId(request, context, true);
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  let parsed: {
    name?: string;
    data?: QueryData;
    scheduleAt?: Date | null;
    cron?: CronExpression<false> | null;
    timezone?: string;
  };
  // We use JSON for editing backup schedules because it's simpler to work
  // with nullish values that way. But the Remix philosophy still "defaults"
  // to form data, so we support it for other locations.
  if (request.headers.get("Content-Type")?.startsWith("application/json")) {
    parsed = await zxParseJson(request, {
      name: z
        .ostring()
        .refine((val) => (val !== undefined ? val.length <= 100 : true)),
      data: ZodQueryData.optional(),
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
        .transform((v) => parseExpression(v))
        .nullable()
        .optional(),
      timezone: z.ostring(),
    });
  } else {
    parsed = await zxParseForm(request, {
      name: z
        .ostring()
        .refine((val) => (val !== undefined ? val.length <= 100 : true)),
      data: ZodQueryData.optional(),
    });
  }
  const { name, data, scheduleAt, cron, timezone } = parsed;

  const db = getDb(context.env.DATABASE_URL);
  const backup = await db.query.backups.findFirst({
    where: eq(backups.id, id),
    columns: {
      ownerId: true,
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
  const nextRunAt = cron ? cron.next().toDate() : scheduleAt || undefined;
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
        cron: cron ? cron.stringify() : undefined,
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
