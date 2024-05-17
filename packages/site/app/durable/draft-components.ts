import {
  discordMessageComponents,
  eq,
  getDb,
  makeSnowflake,
} from "~/store.server";
import { Env } from "~/types/env";
import { snowflakeAsString, zxParseQuery } from "~/util/zod";

/**
 * This durable object helps keep the database clean by purging draft
 * components 14 days after they were created.
 *
 * This is necessary because Discohook allows users to register components
 * before actually submitting them to their corresponding message so that an
 * extra edit step is not required. During this period, they are in a draft
 * state and cannot be interacted with.
 */
export class DurableDraftComponentCleaner implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request) {
    const data = zxParseQuery(request, {
      id: snowflakeAsString(),
    });
    await this.state.storage.put("id", String(data.id));
    await this.state.storage.setAlarm(
      // 14 days
      new Date(new Date().getTime() + 1_209_600_000),
    );
    return new Response(undefined, { status: 204 });
  }

  async alarm() {
    const id = await this.state.storage.get<string>("id");
    if (!id) {
      console.log("No ID stored for this durable object.");
      return;
    }

    const db = getDb(this.env.HYPERDRIVE.connectionString);
    const component = await db.query.discordMessageComponents.findFirst({
      where: eq(discordMessageComponents.id, makeSnowflake(id)),
      columns: {
        updatedAt: true,
        draft: true,
      },
    });
    if (!component || !component.draft) {
      // The component no longer exists or it is
      // no longer a draft, don't delete it.
      try {
        await this.state.storage.deleteAll();
      } catch {}
      return;
    }

    const now = new Date();
    if (component.updatedAt) {
      const diff = now.getTime() - component.updatedAt.getTime();
      if (diff < 1_036_800_000) {
        // The component was edited less than 12 days ago.
        // Try again in another 14 days.
        // TODO: warning? might encourage users to
        // delete stale components on their own.
        this.state.storage.setAlarm(now.getTime() + 1_209_600_000);
        return;
      }
    }

    await db
      .delete(discordMessageComponents)
      .where(eq(discordMessageComponents.id, makeSnowflake(id)));
  }
}
