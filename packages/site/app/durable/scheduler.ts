import { REST } from "@discordjs/rest";
import { parseExpression } from "cron-parser";
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

    const db = getDb(this.env.HYPERDRIVE.connectionString);
    const backup = await db.query.backups.findFirst({
      where: (backups, { eq }) => eq(backups.id, makeSnowflake(backupId)),
      columns: {
        data: true,
        scheduled: true,
        cron: true,
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
    // In the future I want to implement templating for (scheduled) backups
    for (const message of backup.data.messages) {
      messageIndex += 1;
      const target = (backup.data.targets ?? [])[messageIndex];
      if (!target?.url) {
        console.log(`Message ${messageIndex} skipped: no target URL`);
        continue;
      }

      const match = target.url.match(WEBHOOK_URL_RE);
      if (!match) {
        console.log(`Message ${messageIndex} skipped: invalid target URL`);
        continue;
      }
      const [_, webhookId, webhookToken] = match;

      try {
        const result = await submitMessage(
          {
            id: webhookId,
            token: webhookToken,
          },
          message,
          // TODO: pull files from S3
          undefined,
          rest,
        );
        if (
          (status === ScheduledRunStatus.Success &&
            result.status === "error") ||
          (status === ScheduledRunStatus.Failure && result.status === "success")
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
      }
    }

    const nextRunAt = backup.cron
      ? parseExpression(backup.cron).next().toDate()
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
