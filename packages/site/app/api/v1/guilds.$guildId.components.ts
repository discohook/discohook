import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { getDb } from "~/store.server";
import { LoaderArgs } from "~/util/loader";
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
  const components = await db.query.discordMessageComponents.findMany({
    where: (table, { eq }) => eq(table.guildId, guildId),
    columns: {
      id: true,
      channelId: true,
      messageId: true,
      data: true,
      draft: true,
    },
  });

  return respond(json(components));
};
