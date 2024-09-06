import { json } from "@remix-run/cloudflare";
import { getUser } from "~/session.server";
import {
  ScheduledRunStatus,
  backups,
  getDb,
  inArray,
  scheduled_posts,
} from "~/store.server";
import { QueryData } from "~/types/QueryData";
import { LoaderArgs } from "~/util/loader";
import { findMessagesPreviewImageUrl } from "./backups";

export const action = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  const discordId = user.discordId;
  if (discordId === null) {
    throw json({ message: "You have no linked Discord account" }, 400);
  }

  const db = getDb(context.env.HYPERDRIVE);
  const created = await db.transaction(async (tx) => {
    const posts = await tx.query.scheduled_posts.findMany({
      where: (table, { eq }) => eq(table.userId, discordId),
      columns: {
        userId: false,
      },
    });
    if (posts.length === 0) {
      return [];
    }

    const replacedPostIds: number[] = [];
    const created = await tx
      .insert(backups)
      .values(
        posts.map((post) => {
          const data = {
            version: "d2",
            messages:
              (post.messageData as Pick<QueryData, "messages">).messages ?? [],
            targets:
              post.webhookId && post.webhookToken
                ? [
                    {
                      url: `https://discord.com/api/webhooks/${post.webhookId}/${post.webhookToken}`,
                    },
                  ]
                : [],
          } as QueryData;

          let nextRunAt: Date | undefined;
          if (post.future) {
            const now = new Date();
            const date = new Date(post.future);
            if (date.getTime() > now.getTime()) {
              nextRunAt = date;
            }
          }

          replacedPostIds.push(post.id);
          return {
            dataVersion: "d2",
            data,
            previewImageUrl: findMessagesPreviewImageUrl(data.messages),
            ownerId: user.id,
            name: `${post.id} for ${
              post.guildId ? `server ${post.guildId}` : "unknown server"
            }`,
            scheduled: !!nextRunAt,
            nextRunAt,
            lastRunData: post.error
              ? {
                  status: ScheduledRunStatus.Failure,
                  message: post.error,
                }
              : null,
          };
        }),
      )
      .returning({
        id: backups.id,
        scheduled: backups.scheduled,
        nextRunAt: backups.nextRunAt,
      });

    for (const backup of created) {
      if (backup.scheduled && backup.nextRunAt) {
        const doId = context.env.SCHEDULER.idFromName(String(backup.id));
        const stub = context.env.SCHEDULER.get(doId);
        await stub.fetch(
          `http://do/schedule?${new URLSearchParams({
            id: String(backup.id),
            nextRunAt: backup.nextRunAt.toISOString(),
          })}`,
        );
      }
    }

    if (replacedPostIds.length !== 0) {
      await tx
        .delete(scheduled_posts)
        .where(inArray(scheduled_posts.id, replacedPostIds));
    }

    return created;
  });

  return created;
};
