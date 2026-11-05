import { REST } from "@discordjs/rest";
import cronParser from "cron-parser";
import { ComponentType } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { z } from "zod/v3";
import { zx } from "zodix";
import { doubleDecode, getUserId } from "~/session.server";
import { backups, getDb } from "~/store.server";
import type {
  RefreshedAttachment,
  RESTPostAPIRefreshAttachmentURLs,
} from "~/types/discord";
import { type QueryData, ZodQueryData } from "~/types/QueryData";
import {
  extractComponentsByType,
  isDiscordAttachmentUrl,
  onlyActionRows,
  parseAttachmentUrl,
} from "~/util/discord";
import {
  type ActionArgs,
  jsonR,
  type LoaderArgs,
  type SerializeFrom,
} from "~/util/loader";
import {
  snowflakeAsString,
  zxParseJson,
  zxParseParams,
  zxParseQuery,
} from "~/util/zod";
import { findMessagesPreviewImageUrl } from "./backups";

// Default-imported cronParser because this CJS package isn't statically
// analyzable for named exports under Vite's SSR module runner.
const { parseExpression } = cronParser;

const MAX_REFRESH_URLS = 50;
const processRefresh = async (
  urls: string[],
  rest: REST,
): Promise<RefreshedAttachment[]> => {
  const refreshed = (await rest.post("/attachments/refresh-urls", {
    body: { attachment_urls: urls },
  })) as RESTPostAPIRefreshAttachmentURLs;
  return refreshed.refreshed_urls;
};

export const loader = async ({ request, params, context }: LoaderArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  const { data: returnData, refresh_attachment_urls: refreshAttachments } =
    zxParseQuery(request, {
      data: zx.BoolAsString.optional(),
      refresh_attachment_urls: zx.BoolAsString.optional(),
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
      updatedAt: true,
      cron: true,
      timezone: true,
    },
  });
  if (!backup || backup.ownerId !== userId) {
    throw jsonR(
      { message: "No backup with that ID or you do not own it." },
      404,
    );
  }

  const data = "data" in backup ? (backup.data as QueryData) : undefined;
  const dev = context.env.ENVIRONMENT === "dev";
  if (data && refreshAttachments) {
    let anyChanged = false;
    let refreshFailed = false;
    const now = Date.now();

    const refreshUrlCallbacks = new Map<string, ((newUrl: string) => void)[]>();
    const refreshedUrls = new Map<string, string>();
    const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);

    // add urls to refresh and automatically refresh the chunk then reset
    // if it's about to "overflow"
    const addUrl = async (url: string, replace: (newUrl: string) => void) => {
      if (dev) console.log(`Handling ${url}`);
      if (!isDiscordAttachmentUrl(url)) return;
      // skip future attempts at refreshing if the endpoint failed once
      if (refreshFailed) return;

      const parsed = parseAttachmentUrl(url);
      if (dev) console.log(`Expires: ${parsed.ex?.toString?.()}`);
      if (parsed.ex) {
        // over 2s away from expiring, ignore
        if (parsed.ex.getTime() > now + 2000) {
          return;
        }
      }

      const alreadyRefreshed = refreshedUrls.get(url);
      if (alreadyRefreshed) {
        replace(alreadyRefreshed);
        return;
      }

      const extant = refreshUrlCallbacks.get(url);
      if (extant) extant.push(replace);
      else refreshUrlCallbacks.set(url, [replace]);

      if (dev) {
        console.log(`URLs: ${refreshUrlCallbacks.size}/${MAX_REFRESH_URLS}`);
      }
      if (refreshUrlCallbacks.size >= MAX_REFRESH_URLS) {
        // slice should not actually be necessary, but just in case
        const urls = Array.from(refreshUrlCallbacks.keys()).slice(
          0,
          MAX_REFRESH_URLS,
        );
        let refreshed: RefreshedAttachment[] = [];
        try {
          refreshed = await processRefresh(urls, rest);
          anyChanged = true;
        } catch {
          refreshFailed = true;
        }
        for (const attachment of refreshed) {
          const replaceFuncs =
            refreshUrlCallbacks.get(attachment.original) ?? [];
          for (const replace of replaceFuncs) {
            replace(attachment.refreshed);
          }
          refreshedUrls.set(attachment.original, attachment.refreshed);
        }
        refreshUrlCallbacks.clear();
      }
    };

    // iterate every image prop in every message
    for (const { data: message } of data.messages) {
      if (message.avatar_url) {
        await addUrl(message.avatar_url, (url) => {
          message.avatar_url = url;
        });
      }
      if (message.author?.icon_url) {
        await addUrl(message.author.icon_url, (url) => {
          if (!message.author) return;
          message.author.icon_url = url;
        });
      }
      for (const embed of message.embeds ?? []) {
        if (embed.author?.icon_url) {
          await addUrl(embed.author.icon_url, (url) => {
            if (!embed.author) return;
            embed.author.icon_url = url;
          });
        }
        if (embed.footer?.icon_url) {
          await addUrl(embed.footer.icon_url, (url) => {
            if (!embed.footer) return;
            embed.footer.icon_url = url;
          });
        }
        if (embed.image?.url) {
          await addUrl(embed.image.url, (url) => {
            if (!embed.image) return;
            embed.image.url = url;
          });
        }
        if (embed.thumbnail?.url) {
          await addUrl(embed.thumbnail.url, (url) => {
            if (!embed.thumbnail) return;
            embed.thumbnail.url = url;
          });
        }
      }
      if (message.components) {
        const mediaComponents = extractComponentsByType(message.components, [
          ComponentType.Thumbnail,
          ComponentType.MediaGallery,
        ]);
        for (const component of mediaComponents) {
          switch (component.type) {
            case ComponentType.Thumbnail: {
              await addUrl(component.media.url, (url) => {
                component.media.url = url;
              });
              break;
            }
            case ComponentType.MediaGallery: {
              for (const item of component.items) {
                await addUrl(item.media.url, (url) => {
                  item.media.url = url;
                });
              }
              break;
            }
            default:
              break;
          }
        }
      }
    }

    // replace remainder of urls between e.g. 1-49, 51-99
    if (refreshUrlCallbacks.size !== 0 && !refreshFailed) {
      const urls = Array.from(refreshUrlCallbacks.keys()).slice(
        0,
        MAX_REFRESH_URLS,
      );
      let refreshed: RefreshedAttachment[] = [];
      try {
        refreshed = await processRefresh(urls, rest);
        anyChanged = true;
      } catch {}
      for (const attachment of refreshed) {
        const replaceFuncs = refreshUrlCallbacks.get(attachment.original) ?? [];
        for (const replace of replaceFuncs) {
          replace(attachment.refreshed);
        }
        refreshedUrls.set(attachment.original, attachment.refreshed);
      }
    }

    // save changed data
    if (anyChanged) {
      context.waitUntil(
        db
          .update(backups)
          .set({
            data,
            previewImageUrl: findMessagesPreviewImageUrl(data.messages),
          })
          .where(eq(backups.id, id))
          .catch(() => {}),
      );
    }
  }

  return {
    ...backup,
    data: data ? doubleDecode(data) : null,
  };
};

export type ApiGetBackup = SerializeFrom<typeof loader>;

export type ApiGetBackupWithData = ApiGetBackup & {
  data: QueryData;
};

const removeExtraneousBackupData = (data: QueryData): QueryData => {
  // `_id` is editor-only state
  data.messages = data.messages.map(({ _id: _, ...m }) => {
    for (const row of onlyActionRows(m.data.components ?? [], true)) {
      // We don't want to store flow data in backups since
      // it is already stored in DiscordMessageComponent.data
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
    data: ZodQueryData.transform(removeExtraneousBackupData).optional(),
    scheduleAt: z
      .string()
      .datetime()
      .transform((v) => new Date(v))
      .refine(
        (d) => d.getTime() - Date.now() >= 30_000,
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
    throw jsonR(
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
    throw jsonR(
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
