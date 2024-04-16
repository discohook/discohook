import { z } from "zod";
import { getDb } from "~/store.server";
import { Env } from "~/types/env";
import { snowflakeAsString, zxParseQuery } from "~/util/zod";

export class TokenPersistence implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request) {
    const data = zxParseQuery(request, {
      id: snowflakeAsString(),
      expiresAt: z.string().datetime(),
    });
    await this.state.storage.put("id", String(data.id));
    await this.state.storage.setAlarm(new Date(data.expiresAt));
    return new Response(undefined, { status: 204 });
  }

  async alarm() {
    const tokenId = await this.state.storage.get<string>("id");
    if (!tokenId) {
      console.log("No ID stored for this durable object.");
      return;
    }

    const db = getDb(this.env.DATABASE_URL);
  }
}
