import { z } from "zod";
import { zx } from "zodix";
import { getDb } from "../db.js";
import { makeSnowflake } from "../schema/schema.js";
import type { Flow, StorableComponent } from "../types/index.js";

interface MockStoreEnv {
  HYPERDRIVE: Hyperdrive;
  DATABASE_URL?: string;
  COMPONENTS: DurableObjectNamespace;
}

export interface DurableStoredComponent {
  id: bigint;
  data: StorableComponent;
  componentsToFlows: {
    flow: Flow;
  }[];
  draft?: boolean;
}

enum AlarmType {
  Expiration = 0,
}

export class DurableComponentState implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: MockStoreEnv,
  ) {}

  async fetch(request: Request) {
    const hyperdrive = this.env.HYPERDRIVE ?? {
      connectionString: this.env.DATABASE_URL,
    };

    switch (request.method) {
      case "PUT": {
        const { id, expireAt } = zx.parseQuery(request, {
          id: z.string(),
          expireAt: z
            .string()
            .datetime()
            .transform((v) => new Date(v))
            .optional(),
        });
        const db = getDb(hyperdrive);
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
          return new Response(null, { status: 404 });
        }

        await this.state.storage.put(
          "component",
          component satisfies DurableStoredComponent,
        );
        if (expireAt) {
          await this.state.storage.put("alarmType", AlarmType.Expiration);
          await this.state.storage.setAlarm(expireAt);
        }
        return Response.json(component, { status: 201 });
      }
      case "GET": {
        const component =
          await this.state.storage.get<DurableStoredComponent>("component");
        if (!component) {
          return new Response(null, { status: 404 });
        }

        return Response.json(component, { status: 200 });
      }
      case "DELETE": {
        await this.state.storage.delete("component");
        return new Response(null, { status: 204 });
      }
      default:
        return new Response(null, { status: 405 });
    }
  }

  async alarm() {
    const type = await this.state.storage.get<AlarmType>("alarmType");
    if (type === undefined) return;

    switch (type) {
      case AlarmType.Expiration:
        await this.fetch(new Request("http://do/", { method: "DELETE" }));
        break;
      default:
        break;
    }
  }
}

export const launchComponentDurableObject = async (
  env: MockStoreEnv,
  options: {
    messageId: string;
    customId: string;
    componentId: string | bigint;
  },
) => {
  const doId = env.COMPONENTS.idFromName(
    `${options.messageId}-${options.customId}`,
  );
  const stub = env.COMPONENTS.get(doId);
  const response = await stub.fetch(`http://do/?id=${options.componentId}`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw Error(`${response.status} ${response.statusText}`);
  }

  const raw = await response.text();
  const data = JSON.parse(raw) as DurableStoredComponent;
  return data;
};
