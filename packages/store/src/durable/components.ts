import { z } from "zod";
import { zx } from "zodix";
import { getDb } from "../db.js";
import { makeSnowflake } from "../schema/schema.js";
import { Flow, StorableComponent } from "../types/index.js";

export interface DurableStoredComponent {
  id: bigint;
  data: StorableComponent;
  componentsToFlows: {
    flow: Flow;
  }[];
  draft?: boolean;
}

export class DurableComponentState implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: {
      HYPERDRIVE: Hyperdrive;
    },
  ) {}

  async fetch(request: Request) {
    switch (request.method) {
      case "POST": {
        const { id } = zx.parseQuery(request, { id: z.string() });
        const db = getDb(this.env.HYPERDRIVE.connectionString);
        const component = await db.query.discordMessageComponents.findFirst({
          where: (table, { eq }) => eq(table.id, makeSnowflake(id)),
          columns: {
            id: true,
            data: true,
            draft: true,
          },
          with: {
            componentsToFlows: {
              columns: {},
              with: {
                flow: {
                  with: { actions: true },
                },
              },
            },
          },
        });
        if (!component) {
          return new Response(undefined, { status: 404 });
        }

        await this.state.storage.put(
          "component",
          component satisfies DurableStoredComponent,
        );
        return new Response(JSON.stringify(component), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
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
