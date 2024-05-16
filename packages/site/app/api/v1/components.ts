import { SerializeFrom } from "@remix-run/cloudflare";
import { ComponentType } from "discord-api-types/v10";
import { getUserId } from "~/session.server";
import {
  FlowActionType,
  StorableComponent,
  discordMessageComponents,
  generateId,
  getDb,
  inArray,
} from "~/store.server";
import { ZodAPIMessageActionRowComponent } from "~/types/components";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseJson, zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { id: ids } = zxParseQuery(request, {
    id: snowflakeAsString().array().min(1),
  });
  // const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const components = await db.query.discordMessageComponents.findMany({
    where: inArray(discordMessageComponents.id, ids),
    columns: {
      id: true,
      data: true,
      draft: true,
    },
  });

  return components;
};

export type DbComponents = SerializeFrom<typeof loader>;

export const action = async ({ request, context }: ActionArgs) => {
  const { data } = await zxParseJson(request, {
    data: ZodAPIMessageActionRowComponent,
  });
  const userId = await getUserId(request, context, true);
  const id = BigInt(generateId());
  data.custom_id = `p_${id}`;

  const db = getDb(context.env.DATABASE_URL);
  const inserted = await db
    .insert(discordMessageComponents)
    .values({
      id,
      data: {
        ...data,
        ...(data.type === ComponentType.Button
          ? {
              flow: { name: "Flow", actions: [{ type: FlowActionType.Dud }] },
            }
          : {
              flows: {},
            }),
      } as StorableComponent,
      draft: true,
      createdById: userId,
    })
    .returning({
      id: discordMessageComponents.id,
      data: discordMessageComponents.data,
      draft: discordMessageComponents.draft,
    });
  return inserted[0];
};

export type CreateDbComponent = SerializeFrom<typeof action>;
