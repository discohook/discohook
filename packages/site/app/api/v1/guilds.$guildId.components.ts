import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { autoRollbackTx, ensureComponentFlows, getDb } from "~/store.server";
import type { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );

  if (
    !owner &&
    !permissions.has(
      PermissionFlags.ManageMessages,
      PermissionFlags.ManageWebhooks,
    )
  ) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const db = getDb(context.env.HYPERDRIVE);
  const components = await db.transaction(
    autoRollbackTx(async (tx) => {
      const components = await tx.query.discordMessageComponents.findMany({
        where: (table, { eq }) => eq(table.guildId, guildId),
        columns: {
          id: true,
          channelId: true,
          messageId: true,
          data: true,
          draft: true,
        },
        with: {
          componentsToFlows: {
            columns: {},
            with: { flow: { with: { actions: { columns: { data: true } } } } },
          },
        },
      });
      for (const component of components) {
        await ensureComponentFlows(component, tx);
      }
      return components;
    }),
  );

  return respond(
    json(
      // No need to return full flows in this response
      components.map(({ componentsToFlows: _, ...c }) => {
        if ("flow" in c.data) {
          const { flow: _, ...omitted } = c.data;
          return { ...c, data: omitted };
        } else if ("flows" in c.data) {
          const { flows: _, ...omitted } = c.data;
          return { ...c, data: omitted };
        }
        return c;
      }),
    ),
  );
};
