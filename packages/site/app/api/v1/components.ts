import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { parseQuery } from "zodix";
import { getUserId } from "~/session.server";
import {
  DraftComponent,
  DraftFlow,
  StorableComponent,
  discordMessageComponents,
  flows,
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

  const db = getDb(context.env.HYPERDRIVE);
  const components = await db.query.discordMessageComponents.findMany({
    where: inArray(discordMessageComponents.id, ids),
    columns: {
      id: true,
      data: true,
      draft: true,
      createdById: true,
    },
    with: {
      componentsToFlows: {
        with: {
          flow: {
            with: {
              actions: {
                columns: {
                  data: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return components
    .filter((c) => !c.createdById || c.createdById === userId)
    .map((c) => {
      const { createdById: _, id, componentsToFlows, data: d, ...extra } = c;
      const data = d as DraftComponent & StorableComponent;
      switch (data.type) {
        case ComponentType.Button: {
          if (
            data.style !== ButtonStyle.Link &&
            data.style !== ButtonStyle.Premium
          ) {
            const flow = componentsToFlows[0]?.flow ?? {
              name: null,
              actions: [],
            };
            if (flow) {
              data.flow = {
                name: flow.name,
                actions: flow.actions.map((a) => a.data),
              };
            }
          }
          break;
        }
        case ComponentType.StringSelect: {
          data.flows = Object.fromEntries(
            Object.entries(data.flowIds).map(([optionValue, flowId]) => {
              const ctf = componentsToFlows.find(
                (ctf) => String(ctf.flowId) === flowId,
              );
              return [
                optionValue,
                ctf
                  ? {
                      name: ctf.flow.name,
                      actions: ctf.flow.actions.map((a) => a.data),
                    }
                  : { actions: [] },
              ];
            }),
          );
          break;
        }
        case ComponentType.UserSelect:
        case ComponentType.RoleSelect:
        case ComponentType.MentionableSelect:
        case ComponentType.ChannelSelect: {
          const flow = componentsToFlows[0]?.flow ?? {
            name: null,
            actions: [],
          };
          data.flow = {
            name: flow.name,
            actions: flow.actions.map((a) => a.data),
          } satisfies DraftFlow;
          break;
        }
        default:
          break;
      }
      return {
        id: String(id),
        data: data as DraftComponent,
        ...extra,
      };
    });
};

export const action = async ({ request, context }: ActionArgs) => {
  const component = await zxParseJson(request, ZodAPIMessageActionRowComponent);
  const userId = await getUserId(request, context);

  const db = getDb(context.env.HYPERDRIVE);

  const createdFlow = (
    await db.insert(flows).values({}).returning({ id: flows.id })
  )[0];
  const inserted = (
    await db
      .insert(discordMessageComponents)
      .values({
        type: component.type,
        data: (() => {
          const { custom_id: _, ...c } = component;
          switch (c.type) {
            case ComponentType.Button: {
              if (c.style === ButtonStyle.Link) {
                return c;
              }
              return { ...c, flowId: String(createdFlow.id) };
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
                flowIds: {},
              };
            }
            case ComponentType.UserSelect:
            case ComponentType.RoleSelect:
            case ComponentType.MentionableSelect:
            case ComponentType.ChannelSelect: {
              const {
                default_values: defaultValues,
                min_values: _,
                max_values: __,
                ...rest
              } = c;
              return {
                ...rest,
                // See above
                minValues: 1,
                maxValues: 1,
                flowId: String(createdFlow.id),
                defaultValues,
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
