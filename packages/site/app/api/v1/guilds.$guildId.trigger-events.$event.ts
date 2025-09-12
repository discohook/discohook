import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  type APIGuildMember,
  GatewayDispatchEvents,
  type GatewayGuildMemberAddDispatchData,
  type GatewayGuildMemberRemoveDispatchData,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { getDb } from "store";
import { z } from "zod/v3";
import { zx } from "zodix";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { TriggerEvent } from "~/store.server";
import type { ActionArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

const triggerEventToDispatchEvent: Record<TriggerEvent, GatewayDispatchEvents> =
  {
    [TriggerEvent.MemberAdd]: GatewayDispatchEvents.GuildMemberAdd,
    [TriggerEvent.MemberRemove]: GatewayDispatchEvents.GuildMemberRemove,
  };

export const action = async ({ request, context, params }: ActionArgs) => {
  if (request.method !== "PUT") {
    throw json({ message: "Method Not Allowed" }, 405);
  }

  const { guildId, event } = zxParseParams(params, {
    guildId: snowflakeAsString(),
    event: zx.IntAsString.superRefine((v, ctx) => {
      const parsed = z.nativeEnum(TriggerEvent).safeParse(v);
      if (!parsed.success) {
        parsed.error.issues.forEach(ctx.addIssue);
      }
    }),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  const userDiscordId = token.user.discordId?.toString();
  if (!userDiscordId) {
    throw respond(json({ message: "No Discord account linked" }, 404));
  }
  if (!owner && !permissions.has(PermissionFlags.ManageGuild)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const db = getDb(context.env.HYPERDRIVE);
  const triggers = await db.query.triggers.findMany({
    where: (triggers, { eq, and }) =>
      and(eq(triggers.discordGuildId, guildId), eq(triggers.event, event)),
    columns: { id: true },
  });
  if (triggers.length === 0) {
    throw json({ message: "No triggers with that event" }, 404);
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let payload: any = {};
  switch (event) {
    case TriggerEvent.MemberAdd: {
      const member = (await rest.get(
        Routes.guildMember(guildId.toString(), userDiscordId),
      )) as APIGuildMember;
      payload = {
        ...member,
        guild_id: guildId.toString(),
      } satisfies GatewayGuildMemberAddDispatchData;
      break;
    }
    case TriggerEvent.MemberRemove: {
      const member = (await rest.get(
        Routes.guildMember(guildId.toString(), userDiscordId),
      )) as APIGuildMember;
      payload = {
        user: member.user,
        guild_id: guildId.toString(),
      } satisfies GatewayGuildMemberRemoveDispatchData;
      break;
    }
    default:
      throw json(
        { message: "No dispatch data could be formed for the event" },
        500,
      );
  }

  const response = await context.env.BOT.fetch(
    "http://localhost/ws?wait=true",
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bot ${context.env.DISCORD_BOT_TOKEN}`,
        "X-Discohook-Event": triggerEventToDispatchEvent[event],
        "X-Discohook-Shard": "-1",
        "Content-Type": "application/json",
        "User-Agent":
          "discohook-site/1.0.0 (+https://github.com/discohook/discohook)",
      },
    },
  );
  return respond(
    new Response(
      response.status === 204 ? null : await response.arrayBuffer(),
      {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      },
    ),
  );
};
