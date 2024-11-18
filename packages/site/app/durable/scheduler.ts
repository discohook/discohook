import { REST } from "@discordjs/rest";
import { parseExpression } from "cron-parser";
import { RESTJSONErrorCodes } from "discord-api-types/v10";
import { z } from "zod";
import { submitMessage } from "~/modals/MessageSendModal";
import {
  ScheduledRunData,
  ScheduledRunStatus,
  backups,
  eq,
  getDb,
  makeSnowflake,
} from "~/store.server";
import { Env } from "~/types/env";
import { WEBHOOK_URL_RE } from "~/util/constants";
import { isDiscordError } from "~/util/discord";
import { snowflakeAsString, zxParseQuery } from "~/util/zod";

export class DurableScheduler implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request) {
    const data = zxParseQuery(request, {
      id: snowflakeAsString(),
      nextRunAt: z.string().datetime(),
    });
    await this.state.storage.put("backupId", String(data.id));
    await this.state.storage.setAlarm(new Date(data.nextRunAt));
    return new Response(undefined, { status: 204 });
  }

  async alarm() {
    const backupId = await this.state.storage.get<string>("backupId");
    if (!backupId) {
      console.log("No backupId stored for this durable object.");
      return;
    }

    const db = getDb(this.env.HYPERDRIVE);
    const backup = await db.query.backups.findFirst({
      where: (backups, { eq }) => eq(backups.id, makeSnowflake(backupId)),
      columns: {
        data: true,
        scheduled: true,
        cron: true,
        timezone: true,
      },
    });
    if (!backup) {
      console.log("The backup for this durable object no longer exists.");
      return;
    }
    if (!backup.scheduled) {
      console.log("This is no longer a scheduled backup.");
      return;
    }

    // Send the message
    const rest = new REST().setToken(this.env.DISCORD_BOT_TOKEN);
    let status: ScheduledRunStatus | undefined;
    let statusMessage = "";
    let messageIndex = -1;

    const targets = (backup.data.targets ?? [])
      .map(({ url }) => {
        const match = url.match(WEBHOOK_URL_RE);
        return match ? { id: match[1], token: match[2] } : undefined;
      })
      .filter((v): v is NonNullable<typeof v> => !!v);
    if (targets.length === 0) {
      status = ScheduledRunStatus.Failure;
      statusMessage = "No targets were available to send to.";
    }

    // In the future I want to implement templating for (scheduled) backups
    for (const message of backup.data.messages) {
      messageIndex += 1;
      for (const target of targets) {
        try {
          const result = await submitMessage(
            target,
            message,
            // TODO: pull files from S3
            undefined,
            rest,
          );
          if (
            (status === ScheduledRunStatus.Success &&
              result.status === "error") ||
            (status === ScheduledRunStatus.Failure &&
              result.status === "success")
          ) {
            status = ScheduledRunStatus.Warning;
          } else if (status !== ScheduledRunStatus.Warning) {
            status =
              result.status === "error"
                ? ScheduledRunStatus.Failure
                : ScheduledRunStatus.Success;
          }
          if (result.status === "error") {
            statusMessage += `\n${result.data.message}`;
          }
        } catch (e) {
          if (status === ScheduledRunStatus.Success) {
            status = ScheduledRunStatus.Warning;
          } else if (status !== ScheduledRunStatus.Warning) {
            status = ScheduledRunStatus.Failure;
          }
          statusMessage += `\n${String(e)}`;

          // webhook doesn't exist, don't keep sending requests to it
          if (
            isDiscordError(e) &&
            e.code === RESTJSONErrorCodes.UnknownWebhook
          ) {
            break;
          }
        }
      }
    }

    const nextRunAt = backup.cron
      ? parseExpression(backup.cron, { tz: backup.timezone ?? undefined })
          .next()
          .toDate()
      : null;
    await db
      .update(backups)
      .set({
        lastRunData: {
          status: status ?? ScheduledRunStatus.Success,
          message: statusMessage,
        } satisfies ScheduledRunData,
        nextRunAt,
        scheduled: backup.cron ? true : false,
      })
      .where(eq(backups.id, makeSnowflake(backupId)));

    if (nextRunAt) {
      await this.state.storage.setAlarm(nextRunAt);
    }
  }
}
