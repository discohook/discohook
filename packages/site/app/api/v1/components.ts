import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { parseQuery } from "zodix";
import { getUserId } from "~/session.server";
import {
  StorableComponent,
  discordMessageComponents,
  getDb,
  inArray,
} from "~/store.server";
import { ZodAPIMessageActionRowComponent } from "~/types/components";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseJson } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { id: ids } = parseQuery(
    request,
    {
      id: snowflakeAsString()
        .array()
        .min(1)
        .max(25 * 10),
    },
    {
      parser: (params) => ({ id: params.getAll("id") }),
    },
  );
  const userId = await getUserId(request, context);

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const components = await db.query.discordMessageComponents.findMany({
    where: inArray(discordMessageComponents.id, ids),
    columns: {
      id: true,
      data: true,
      draft: true,
      createdById: true,
    },
  });

  return components
    .filter((c) => !c.createdById || c.createdById === userId)
    .map((c) => {
      const { createdById, id, ...extra } = c;
      return { id: String(id), ...extra };
    });
};

export const action = async ({ request, context }: ActionArgs) => {
  const component = await zxParseJson(request, ZodAPIMessageActionRowComponent);
  const userId = await getUserId(request, context);

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const inserted = (
    await db
      .insert(discordMessageComponents)
      .values({
        data: (() => {
          const { custom_id: _, ...c } = component;
          switch (c.type) {
            case ComponentType.Button: {
              if (c.style === ButtonStyle.Link) {
                return c;
              }
              return { ...c, flow: c.flow ?? { actions: [] } };
            }
            case ComponentType.StringSelect: {
              return {
                ...c,
                // Force max 1 value until we support otherwise
                // I want to make it so selects with >1 max_values share one
                // flow for all options, like with autofill selects. And also
                // a way to tell which values have been selected - `{values[n]}`?
                minValues: 1,
                maxValues: 1,
                flows: c.flows ?? {},
              };
            }
            case ComponentType.UserSelect:
            case ComponentType.RoleSelect:
            case ComponentType.MentionableSelect:
            case ComponentType.ChannelSelect: {
              return {
                ...c,
                // See above
                minValues: 1,
                maxValues: 1,
                flow: c.flow ?? { actions: [] },
              };
            }
            default:
              break;
          }
          // Shouldn't happen
          throw Error("Unsupported component type");
        })() satisfies StorableComponent,
        draft: true,
        createdById: userId,
      })
      .returning({
        id: discordMessageComponents.id,
        data: discordMessageComponents.data,
        draft: discordMessageComponents.draft,
      })
  )[0];

  // We create durable objects for all new draft components so that they can
  // self-expire if they haven't been touched.
  const doId = context.env.DRAFT_CLEANER.idFromName(String(inserted.id));
  const stub = context.env.DRAFT_CLEANER.get(doId);
  await stub.fetch(`http://do/?id=${inserted.id}`);

  return inserted;
};
