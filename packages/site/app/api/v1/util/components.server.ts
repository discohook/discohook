import { REST } from "@discordjs/rest";
import { type APIWebhook, Routes, WebhookType } from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import {
  getTokenGuildChannelPermissions,
  type TokenWithUser,
} from "~/session.server";
import { getDb } from "~/store.server";
import type { Env } from "~/types/env";

// TODO: RPC function in discohook-bot to use stored tokens
export const getWebhook = async (
  webhookId: string,
  env: Env,
): Promise<APIWebhook> => {
  const db = getDb(env.HYPERDRIVE);
  const dbWebhook = await db.query.webhooks.findFirst({
    where: (webhooks, { eq, and }) =>
      and(eq(webhooks.platform, "discord"), eq(webhooks.id, webhookId)),
    columns: {
      id: true,
      name: true,
      avatar: true,
      channelId: true,
      token: true,
      applicationId: true,
      discordGuildId: true,
    },
  });
  if (dbWebhook) {
    return {
      type: WebhookType.Incoming, // hopefully we are not storing non-incoming webhooks
      id: dbWebhook.id,
      name: dbWebhook.name,
      channel_id: dbWebhook.channelId,
      avatar: dbWebhook.avatar,
      token: dbWebhook.token ?? undefined,
      guild_id: dbWebhook.discordGuildId?.toString(),
      application_id: dbWebhook.applicationId,
    } satisfies APIWebhook;
  }

  const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);
  const webhook = (await rest.get(Routes.webhook(webhookId))) as APIWebhook;
  return webhook;
};

export const canModifyComponent = async (
  env: Env,
  component: {
    channelId: bigint | null;
    createdById: bigint | null;
  },
  token: TokenWithUser,
): Promise<boolean> => {
  if (
    component.createdById !== null &&
    component.createdById === BigInt(token.user.id)
  ) {
    return true;
  }
  if (component.channelId) {
    const permissions = await getTokenGuildChannelPermissions(
      token,
      component.channelId,
      env,
    );
    if (
      !permissions.owner &&
      !permissions.permissions.has(
        PermissionFlags.ViewChannel,
        PermissionFlags.ManageMessages,
        PermissionFlags.ManageWebhooks,
      )
    ) {
      return false;
    }
  }
  return true;
};
