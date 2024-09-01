import { z } from "zod";
import { ZodDonateKeyType } from "./v1/donate.$type";

export const BRoutes = {
  /**
   * - POST /backups
   * - GET /backups/:id
   * - PATCH /backups/:id
   */
  backups(id?: bigint | string) {
    return id ? (`/backups/${id}` as const) : ("/backups" as const);
  },

  /**
   * - POST /backups/import/discoscheduler
   */
  importDiscoschedulerPosts() {
    return "/backups/import/discoscheduler" as const;
  },

  /**
   * - GET /channels/:id
   *
   * Accepts token auth.
   */
  channel(id: string) {
    return `/channels/${id}` as const;
  },

  /**
   * - PATCH /components/:id
   * - DELETE /components/:id
   */
  component(id: string) {
    return `/components/${id}` as const;
  },

  /**
   * - POST /components
   * - GET /components?id=...
   */
  components() {
    return "/components" as const;
  },

  /** - POST /donate/:type */
  donate(type: z.infer<typeof ZodDonateKeyType>) {
    return `/donate/${type}` as const;
  },

  /**
   * - GET /guilds/:id/log
   *
   * Accepts token auth.
   */
  guildLog(id: string) {
    return `/guilds/${id}/log` as const;
  },

  /**
   * - GET /guilds/:id/cacheable
   *
   * Accepts token auth.
   */
  guildCacheable(id: string) {
    return `/guilds/${id}/cacheable` as const;
  },

  /**
   * - GET /guilds/:id/channels
   *
   * Accepts token auth.
   */
  guildChannels(id: string) {
    return `/guilds/${id}/channels` as const;
  },

  /**
   * - GET /guilds/:id/components
   *
   * Accepts token or cookie auth.
   */
  guildComponents(id: bigint | string) {
    return `/guilds/${String(id)}/components` as const;
  },

  /**
   * - GET /guilds/:guildId/members/:userId
   *
   * Accepts token auth.
   */
  guildMember(guildId: string, userId: string) {
    return `/guilds/${guildId}/members/${userId}` as const;
  },

  /**
   * - GET /guilds/:guildId/roles/:roleId
   *
   * Accepts token auth.
   */
  guildRole(guildId: string, roleId: string) {
    return `/guilds/${guildId}/roles/${roleId}` as const;
  },

  /**
   * - GET /guilds/:id/roles
   *
   * Accepts token auth.
   */
  guildRoles(id: string) {
    return `/guilds/${id}/roles` as const;
  },

  /**
   * - GET /guilds/:id/sessions
   *
   * Accepts token auth.
   */
  guildSessions(id: string) {
    return `/guilds/${id}/sessions` as const;
  },

  /**
   * - GET /guilds/:guildId/triggers/:triggerId
   * - PATCH /guilds/:guildId/triggers/:triggerId
   * - DELETE /guilds/:guildId/triggers/:triggerId
   *
   * Accepts token or cookie auth.
   */
  guildTrigger(id: bigint | string, triggerId: bigint | string) {
    return `/guilds/${String(id)}/triggers/${String(triggerId)}` as const;
  },

  /**
   * - GET /guilds/:id/triggers
   *
   * Accepts token or cookie auth.
   */
  guildTriggers(id: bigint | string) {
    return `/guilds/${String(id)}/triggers` as const;
  },

  /**
   * - GET /guilds/:id/webhooks
   *
   * Accepts token or cookie auth.
   */
  guildWebhooks(id: bigint | string) {
    return `/guilds/${String(id)}/webhooks` as const;
  },

  /**
   * - PATCH /guilds/:id/webhooks/:webhookId
   * - DELETE /guilds/:id/webhooks/:webhookId
   *
   * Accepts token or cookie auth.
   */
  guildWebhook(guildId: bigint | string, id: bigint | string) {
    return `/guilds/${String(guildId)}/webhooks/${String(id)}` as const;
  },

  /**
   * - GET /guilds/:guildId/webhooks/:webhookId/token
   *
   * Accepts token or cookie auth.
   */
  guildWebhookToken(guildId: bigint | string, id: bigint | string) {
    return `/guilds/${String(guildId)}/webhooks/${String(id)}/token` as const;
  },

  /**
   * - POST /link-backups
   * - GET /link-backups/:id
   * - PATCH /link-backups/:id
   */
  linkBackups(id?: bigint | string) {
    return id ? (`/link-backups/${id}` as const) : ("/link-backups" as const);
  },

  /**
   * - POST /webhooks/:webhookId/:webhookToken/messages/:messageId/log
   */
  messageLog(webhookId: string, webhookToken: string, messageId: string) {
    return `/log/webhooks/${webhookId}/${webhookToken}/messages/${messageId}` as const;
  },

  /** - GET /oembed?data=... */
  oembed() {
    return "/oembed" as const;
  },

  /**
   * - POST /share
   * - GET /share/:shareId
   * - PATCH /share/:shareId
   */
  share(shareId?: string) {
    return shareId ? (`/share/${shareId}` as const) : ("/share" as const);
  },

  /** - GET /unfurl?url=... */
  unfurl() {
    return "/unfurl" as const;
  },
};

export type ApiRoute = ReturnType<(typeof BRoutes)[keyof typeof BRoutes]>;

export const apiUrl = (route: ApiRoute, version?: 1) =>
  `/api/v${version ?? 1}${route}`;
