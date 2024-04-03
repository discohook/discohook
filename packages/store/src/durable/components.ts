import { eq } from "drizzle-orm";
import { z } from "zod";
import { zx } from "zodix";
import { getDb } from "../db.js";
import { discordMessageComponents, makeSnowflake } from "../schema/schema.js";
import { StorableComponent } from "../types/index.js";

export interface DurableStoredComponent {
  id: bigint;
  data: StorableComponent;
  draft?: boolean;
}

export class DurableComponentState implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: {
      DATABASE_URL: string;
    },
  ) {}

  async fetch(request: Request) {
    switch (request.method) {
      case "POST": {
        const { id } = zx.parseQuery(request, { id: z.string() });
        const db = getDb(this.env.DATABASE_URL);
        const component = await db.query.discordMessageComponents.findFirst({
          where: eq(discordMessageComponents.id, makeSnowflake(id)),
          columns: {
            id: true,
            data: true,
            draft: true,
          },
        });
        if (!component) {
          return new Response(undefined, { status: 404 });
        }

        await this.state.storage.put(
          "component",
          component satisfies DurableStoredComponent,
        );
        return new Response(undefined, { status: 201 });
      }
      case "GET": {
        const component =
          await this.state.storage.get<DurableStoredComponent>("component");
        if (!component) {
          return new Response(undefined, { status: 404 });
        }

        return new Response(JSON.stringify(component), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      case "DELETE": {
        await this.state.storage.delete("component");
        return new Response(undefined, { status: 204 });
      }
      default:
        return new Response(undefined, { status: 405 });
    }
  }
}
