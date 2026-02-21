import { z } from "zod";
import { zx } from "zodix/v4";
import { getDb } from "../db.js";
import { makeSnowflake } from "../schema/schema.js";
import type { DraftComponent } from "../types/index.js";

interface MockStoreEnv {
  HYPERDRIVE: Hyperdrive;
  DATABASE_URL?: string;
  COMPONENTS: DurableObjectNamespace;
}

export interface DurableStoredComponent {
  id: bigint;
  data: DraftComponent;
  draft?: boolean;
}

enum AlarmType {
  Expiration = 0,
}

export class DurableComponentState implements DurableObject {
  private component: DurableStoredComponent | undefined;

  constructor(
    private state: DurableObjectState,
    private env: MockStoreEnv,
  ) {
    // https://developers.cloudflare.com/durable-objects/reference/in-memory-state/
    // May not be necessary because get() does have some caching, but this
    // might make things faster.
    this.state.blockConcurrencyWhile(async () => {
      const component =
        await this.state.storage.get<DurableStoredComponent>("component");
      this.component = component;
    });
  }

  async fetch(request: Request) {
    const hyperdrive = this.env.HYPERDRIVE ?? {
      connectionString: this.env.DATABASE_URL,
    };

    switch (request.method) {
      case "PUT": {
        const { id, expireAt } = zx.parseQuery(request, {
          id: z.string(),
          expireAt: z.iso
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
          this.component ??
          (await this.state.storage.get<DurableStoredComponent>("component"));
        if (!component) {
          return new Response(null, { status: 404 });
        }

        return Response.json(component, { status: 200 });
      }
      case "DELETE": {
        this.component = undefined;
        await this.state.storage.deleteAll();
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

/** @deprecated */
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

/** @deprecated */
export const destroyComponentDurableObject = async (
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
    method: "DELETE",
  });
  if (!response.ok) {
    throw Error(`${response.status} ${response.statusText}`);
  }
};
