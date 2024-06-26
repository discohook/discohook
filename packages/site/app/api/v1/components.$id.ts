import { json } from "@remix-run/cloudflare";
import { ButtonStyle, ComponentType } from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import {
  authorizeRequest,
  getTokenGuildChannelPermissions,
} from "~/session.server";
import {
  StorableComponent,
  discordMessageComponents,
  eq,
  getDb,
  sql,
} from "~/store.server";
import { ZodAPIMessageActionRowComponent } from "~/types/components";
import { ActionArgs } from "~/util/loader";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";

export const action = async ({ request, context, params }: ActionArgs) => {
  const { id } = zxParseParams(params, { id: snowflakeAsString() });
  const [token, respond] = await authorizeRequest(request, context);

  switch (request.method) {
    case "PUT": {
      const component = await zxParseJson(
        request,
        ZodAPIMessageActionRowComponent,
      );

      const db = getDb(context.env.HYPERDRIVE.connectionString);
      const current = await db.query.discordMessageComponents.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          createdById: true,
          data: true,
          channelId: true,
        },
      });
      if (current?.channelId) {
        const permissions = await getTokenGuildChannelPermissions(
          token,
          current.channelId,
          context.env,
        );
        if (
          !permissions.owner &&
          !permissions.permissions.has(
            PermissionFlags.ViewChannel,
            PermissionFlags.ManageMessages,
            PermissionFlags.ManageWebhooks,
          )
        ) {
          throw respond(json({ message: "Unknown Component" }, 404));
        }
      }
      if (!current) {
        throw respond(json({ message: "Unknown Component" }, 404));
      }
      if (!current.channelId && current.createdById !== BigInt(token.user.id)) {
        throw respond(json({ message: "You do not own this component" }, 403));
      }
      if (current.data.type !== component.type) {
        throw respond(json({ message: "Incorrect Type" }, 400));
      }

      const inserted = (
        await db
          .update(discordMessageComponents)
          .set({
            data: (() => {
              const { custom_id: _, ...c } = component;
              switch (c.type) {
                case ComponentType.Button: {
                  if (c.style === ButtonStyle.Link) {
                    return { ...current.data, ...c };
                  }
                  return {
                    ...c,
                    flow: c.flow ?? { actions: [] },
                  };
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
            updatedById: token.user.id,
            updatedAt: sql`NOW()`,
          })
          .where(eq(discordMessageComponents.id, id))
          .returning({
            id: discordMessageComponents.id,
            data: discordMessageComponents.data,
            draft: discordMessageComponents.draft,
          })
      )[0];

      // We create durable objects for all new draft components so that they can
      // self-expire if they haven't been touched.
      // const doId = context.env.DRAFT_CLEANER.idFromName(String(inserted.id));
      // const stub = context.env.DRAFT_CLEANER.get(doId);
      // await stub.fetch(`http://do/?id=${inserted.id}`);

      return respond(json(inserted));
    }
    case "DELETE": {
      const db = getDb(context.env.HYPERDRIVE.connectionString);
      const current = await db.query.discordMessageComponents.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          createdById: true,
          channelId: true,
        },
      });
      if (current?.channelId) {
        const permissions = await getTokenGuildChannelPermissions(
          token,
          current.channelId,
          context.env,
        );
        if (
          !permissions.owner &&
          !permissions.permissions.has(
            PermissionFlags.ViewChannel,
            PermissionFlags.ManageMessages,
            PermissionFlags.ManageWebhooks,
          )
        ) {
          throw respond(json({ message: "Unknown Component" }, 404));
        }
      }
      if (
        !current ||
        (!current.channelId && current.createdById !== token.user.id)
      ) {
        throw respond(json({ message: "Unknown Component" }, 404));
      }

      await db
        .delete(discordMessageComponents)
        .where(eq(discordMessageComponents.id, id));

      throw respond(new Response(null, { status: 204 }));
    }
    default:
      throw respond(
        new Response(null, {
          status: 405,
          statusText: "Method Not Allowed",
        }),
      );
  }
};
