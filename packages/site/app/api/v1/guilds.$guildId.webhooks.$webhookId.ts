import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  APIWebhook,
  RESTPatchAPIWebhookJSONBody,
  RESTPatchAPIWebhookResult,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { getDb, webhooks } from "store";
import { z } from "zod";
import {
  authorizeRequest,
  getGuild,
  getTokenGuildPermissions,
} from "~/session.server";
import { upsertGuild } from "~/store.server";
import { isDiscordError } from "~/util/discord";
import { ActionArgs } from "~/util/loader";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";

export const action = async ({ request, context, params }: ActionArgs) => {
  const { guildId, webhookId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
    webhookId: snowflakeAsString(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { guild, owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlags.ManageWebhooks)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const db = getDb(context.env.HYPERDRIVE);
  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  switch (request.method) {
    case "PATCH": {
      const payload = await zxParseJson(
        request,
        z.object({
          name: z.ostring(),
          avatar: z.ostring().nullable(),
          channel_id: z.ostring(),
        }) satisfies z.ZodType<RESTPatchAPIWebhookJSONBody>,
      );
      try {
        const webhook = (await rest.get(
          Routes.webhook(String(webhookId)),
        )) as APIWebhook;
        if (webhook.guild_id !== String(guildId)) {
          throw respond(json({ message: "Unknown Webhook", code: 10015 }, 404));
        }
        await upsertGuild(
          db,
          guild ?? (await getGuild(guildId, rest, context.env)),
        );

        const modified = (await rest.patch(Routes.webhook(String(webhookId)), {
          body: payload,
        })) as RESTPatchAPIWebhookResult;

        // Any time a human calls this endpoint, the webhook should already
        // be in the database, but we upsert just in case/for future robots
        await db
          .insert(webhooks)
          .values({
            platform: "discord",
            id: modified.id,
            token: modified.token,
            name: modified.name ?? "",
            avatar: modified.avatar,
            channelId: modified.channel_id,
            applicationId: modified.application_id,
            discordGuildId: guildId,
          })
          .onConflictDoUpdate({
            target: [webhooks.platform, webhooks.id],
            set: {
              token: modified.token,
              name: modified.name ?? "",
              avatar: modified.avatar,
              channelId: modified.channel_id,
              applicationId: modified.application_id,
              discordGuildId: guildId,
            },
          });

        return respond(
          json({
            id: modified.id,
            name: modified.name,
            avatar: modified.avatar,
            channel_id: modified.channel_id,
          } as Pick<APIWebhook, "id" | "name" | "avatar" | "channel_id">),
        );
      } catch (e) {
        if (isDiscordError(e)) {
          throw respond(json(e.rawError));
        }
        throw respond(json({ message: String(e) }, 500));
      }
    }
    default:
      throw new Response("Method Not Allowed", { status: 405 });
  }
};
