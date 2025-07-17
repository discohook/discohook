import type { ComponentType } from "discord-api-types/v10";
import { isSnowflake } from "discord-snowflake";
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { Snowflake } from "tif-snowflake";
import type {
  LinkQueryData,
  QueryData,
  ScheduledRunData,
} from "../types/backups.js";
import type {
  FlowAction,
  FlowActionType,
  StorableComponent,
} from "../types/components.js";
import type { TriggerEvent } from "../types/triggers.js";

// import { buttons } from "./schema-v1.js";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// ID generation
export const EPOCH = Date.UTC(2024, 1, 1).valueOf();

export const generateId = (timestamp?: number | Date) => {
  // I wanted to incorporate some Cloudflare metadata as the shard_id (e.g.
  // something unique to that machine) but I'm not really sure there is
  // anything I can use that doesn't involve the user's location

  return Snowflake.generate({
    timestamp,
    epoch: EPOCH,
  });
};

export const getId = ({ id }: { id: string | bigint }) => {
  return {
    ...Snowflake.parse(String(id), EPOCH),
    id: String(id),
  };
};

const date = (name: string) => timestamp(name, { mode: "date" }).$type<Date>();
const snowflake = (name: string) => bigint(name, { mode: "bigint" });
const snowflakePk = (name?: string) =>
  snowflake(name ?? "id")
    .primaryKey()
    .$defaultFn(() => BigInt(generateId()));

// We in the business call this a make-flake
/** Assert that `id` is a snowflake and return it as a BigInt */
export const makeSnowflake = (id: string) => {
  // We would use Snowflake.isValid here, but it requires
  // snowflakes to be exactly 19 characters long
  if (isSnowflake(id)) return BigInt(id);
  throw new Error(`${id} is not a snowflake.`);
};

export const users = pgTable("User", {
  id: snowflakePk(),
  name: text("name").notNull(),

  firstSubscribed: date("firstSubscribed"),
  subscribedSince: date("subscribedSince"),
  subscriptionExpiresAt: date("subscriptionExpiresAt"),
  lifetime: boolean("lifetime").default(false),

  discordId: snowflake("discordId").unique(),
  guildedId: text("guildedId").unique(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  backups: many(backups, { relationName: "User_Backup" }),
  linkBackups: many(linkBackups, { relationName: "User_LinkBackup" }),
  shareLinks: many(shareLinks, { relationName: "User_ShareLink" }),
  messageLogEntries: many(messageLogEntries, {
    relationName: "User_MessageLogEntry",
  }),
  discordUser: one(discordUsers, {
    fields: [users.discordId],
    references: [discordUsers.id],
    relationName: "User_DiscordUser",
  }),
  guildedUser: one(guildedUsers, {
    fields: [users.guildedId],
    references: [guildedUsers.id],
    relationName: "User_GuildedUser",
  }),
  updatedTriggers: many(triggers, { relationName: "User_Trigger-updated" }),
  tokens: many(tokens, { relationName: "User_Token" }),
  bots: many(customBots, { relationName: "User_CustomBot" }),
  userToWebhook: one(userToWebhook, {
    fields: [users.id],
    references: [userToWebhook.userId],
    relationName: "User_UserToWebhook",
  }),
}));

export const tokens = pgTable("Token", {
  id: snowflakePk(),
  platform: text("platform").$type<"discord" | "guilded">().notNull(),
  prefix: text("prefix").$type<"user" | "editor" | "bot">().notNull(),
  userId: snowflake("userId").references(() => users.id, {
    onDelete: "set null",
  }),
  expiresAt: date("expiresAt").notNull(),
  lastUsedAt: date("lastUsedAt"),
  // "Add visitor location headers" needs to be enabled for this
  country: text("lastUsedCountry"),
});

export const tokensRelations = relations(tokens, ({ one, many }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
    relationName: "User_Token",
  }),
  guilds: many(discordGuilds, {
    relationName: "Token_DiscordGuild",
  }),
}));

export const discordUsers = pgTable("DiscordUser", {
  id: snowflake("id").primaryKey(),
  name: text("name").notNull(),
  globalName: text("globalName"),
  discriminator: text("discriminator"),
  avatar: text("avatar"),
});

export const discordUsersRelations = relations(
  discordUsers,
  ({ one, many }) => ({
    user: one(users, {
      fields: [discordUsers.id],
      references: [users.discordId],
      relationName: "User_DiscordUser",
    }),
    members: many(discordMembers, {
      relationName: "DiscordUser_DiscordMember",
    }),
    ownedGuilds: many(discordGuilds, {
      relationName: "DiscordUser_DiscordGuild",
    }),
  }),
);

export const guildedUsers = pgTable("GuildedUser", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatarUrl"),
});

export const guildedUsersRelations = relations(guildedUsers, ({ one }) => ({
  user: one(users, {
    fields: [guildedUsers.id],
    references: [users.guildedId],
    relationName: "User_GuildedUser",
  }),
}));

export const oauthInfo = pgTable("OAuthInfo", {
  id: snowflakePk(),
  discordId: snowflake("discordId").unique(),
  guildedId: text("guildedId").unique(),
  botId: snowflake("botId").unique(),

  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  scope: json("scope").$type<string[]>().notNull(),
  expiresAt: date("expiresAt").notNull(),
});

export const oauthInfoRelations = relations(oauthInfo, ({ one }) => ({
  discordUser: one(discordUsers, {
    fields: [oauthInfo.discordId],
    references: [discordUsers.id],
    relationName: "DiscordUser_OAuthInfo",
  }),
  guildedUser: one(guildedUsers, {
    fields: [oauthInfo.guildedId],
    references: [guildedUsers.id],
    relationName: "GuildedUser_OAuthInfo",
  }),
  customBot: one(customBots, {
    fields: [oauthInfo.botId],
    references: [customBots.id],
    relationName: "OAuthInfo_CustomBot",
  }),
}));

export const discordGuilds = pgTable("DiscordGuild", {
  id: snowflake("id").primaryKey(),
  name: text("name").default("Unknown Server").notNull(),
  icon: text("icon"),
  ownerDiscordId: snowflake("ownerDiscordId"),
  botJoinedAt: date("botJoinedAt"),
});

export const discordGuildsRelations = relations(
  discordGuilds,
  ({ many, one }) => ({
    members: many(discordMembers, {
      relationName: "DiscordGuild_DiscordMember",
    }),
    ownerDiscordUser: one(discordUsers, {
      fields: [discordGuilds.ownerDiscordId],
      references: [discordUsers.id],
      relationName: "DiscordUser_DiscordGuild",
    }),
    roles: many(discordRoles, { relationName: "DiscordGuild_DiscordRole" }),
    backups: many(discordGuildsToBackups),
    webhooks: many(webhooks, { relationName: "DiscordGuild_Webhook" }),
    triggers: many(triggers, { relationName: "DiscordGuild_Trigger" }),
    reactionRoles: many(discordReactionRoles, {
      relationName: "DiscordGuild_ReactionRole",
    }),
    messageLogEntries: many(messageLogEntries, {
      relationName: "DiscordGuild_MessageLogEntry",
    }),
    tokens: many(tokens, {
      relationName: "Token_DiscordGuild",
    }),
  }),
);

export const discordRoles = pgTable(
  "DiscordRoles",
  {
    id: snowflake("id").notNull().unique(),
    guildId: snowflake("guildId")
      .references(() => discordGuilds.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    color: integer("color").default(0),
    permissions: text("permissions").default("0"),
    icon: text("icon"),
    unicodeEmoji: text("unicodeEmoji"),
    position: integer("position").notNull(),
    hoist: boolean("hoist").default(false),
    managed: boolean("managed").default(false),
    mentionable: boolean("mentionable").default(false),
  },
  (table) => ({
    unq: unique().on(table.id, table.guildId),
  }),
);

export const discordRolesRelations = relations(discordRoles, ({ one }) => ({
  guild: one(discordGuilds, {
    fields: [discordRoles.guildId],
    references: [discordGuilds.id],
    relationName: "DiscordGuild_DiscordRole",
  }),
}));

export const discordMembers = pgTable(
  "DiscordMember",
  {
    userId: snowflake("userId")
      .references(() => discordUsers.id, { onDelete: "cascade" })
      .notNull(),
    guildId: snowflake("guildId")
      .references(() => discordGuilds.id, { onDelete: "cascade" })
      .notNull(),
    permissions: text("permissions").default("0").notNull(),
    owner: boolean("owner").default(false).notNull(),
    favorite: boolean("favorite").default(false).notNull(),
  },
  (table) => ({
    unq: unique().on(table.userId, table.guildId),
  }),
);

export const discordMembersRelations = relations(discordMembers, ({ one }) => ({
  user: one(discordUsers, {
    fields: [discordMembers.userId],
    references: [discordUsers.id],
    relationName: "DiscordUser_DiscordMember",
  }),
  guild: one(discordGuilds, {
    fields: [discordMembers.guildId],
    references: [discordGuilds.id],
    relationName: "DiscordGuild_DiscordMember",
  }),
}));

export const guildedServers = pgTable("GuildedServer", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatarUrl"),
});

export const guildedServersRelations = relations(
  guildedServers,
  ({ many }) => ({
    backups: many(backups),
    webhooks: many(webhooks, { relationName: "GuildedServer_Webhook" }),
    triggers: many(triggers, { relationName: "GuildedServer_Trigger" }),
    messageLogEntries: many(messageLogEntries),
  }),
);

export const shareLinks = pgTable("ShareLink", {
  id: snowflakePk(),
  shareId: text("shareId").notNull(),
  expiresAt: date("expiresAt").notNull(),
  origin: text("origin"),

  userId: snowflake("userId").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const shareLinksRelations = relations(shareLinks, ({ one }) => ({
  user: one(users, {
    fields: [shareLinks.userId],
    references: [users.id],
    relationName: "User_ShareLink",
  }),
}));

export const discordGuildsToBackups = pgTable(
  "DiscordGuild_to_Backup",
  {
    discordGuildId: snowflake("discordGuildId")
      .notNull()
      .references(() => discordGuilds.id, { onDelete: "cascade" }),
    backupId: snowflake("backupId")
      .notNull()
      .references(() => backups.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.discordGuildId, table.backupId],
    }),
  }),
);

export const discordGuildsToBackupsRelations = relations(
  discordGuildsToBackups,
  ({ one }) => ({
    guild: one(discordGuilds, {
      fields: [discordGuildsToBackups.discordGuildId],
      references: [discordGuilds.id],
    }),
    backup: one(backups, {
      fields: [discordGuildsToBackups.backupId],
      references: [backups.id],
    }),
  }),
);

export const backups = pgTable("Backup", {
  id: snowflakePk(),
  name: text("name").notNull(),
  updatedAt: date("updatedAt"),
  dataVersion: text("dataVersion").notNull(),
  data: json("data").notNull().$type<QueryData>(),
  previewImageUrl: text("previewImageUrl"),
  importedFromOrg: boolean("importedFromOrg").notNull().default(false),

  // Scheduling
  scheduled: boolean("scheduled").notNull().default(false),
  nextRunAt: date("nextRunAt"),
  lastRunData: json("lastRunData").$type<ScheduledRunData>(),
  cron: text("cron"),
  /** IANA database name */
  timezone: text("timezone"),

  ownerId: snowflake("ownerId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});

export const backupsRelations = relations(backups, ({ one, many }) => ({
  owner: one(users, {
    fields: [backups.ownerId],
    references: [users.id],
  }),
  guilds: many(discordGuildsToBackups),
  servers: many(guildedServers),
}));

export const linkBackups = pgTable("LinkBackup", {
  id: snowflakePk(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  updatedAt: date("updatedAt"),
  dataVersion: text("dataVersion").notNull(),
  data: json("data").notNull().$type<LinkQueryData>(),
  previewImageUrl: text("previewImageUrl"),

  ownerId: snowflake("ownerId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});

export const linkBackupsRelations = relations(backups, ({ one }) => ({
  owner: one(users, {
    fields: [backups.ownerId],
    references: [users.id],
    relationName: "User_LinkBackup",
  }),
}));

export const webhooks = pgTable(
  "Webhook",
  {
    platform: text("platform").notNull().$type<"discord" | "guilded">(),
    id: text("id").notNull(),
    token: text("token"),
    name: text("name").notNull(),
    avatar: text("avatar"),
    channelId: text("channelId").notNull(),
    applicationId: text("applicationId"),

    userId: snowflake("userId"),
    discordGuildId: snowflake("discordGuildId"),
    guildedServerId: text("guildedServerId"),
  },
  (table) => ({
    unq: unique().on(table.platform, table.id),
  }),
);

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id],
    relationName: "User_Webhook",
  }),
  discordGuild: one(discordGuilds, {
    fields: [webhooks.discordGuildId],
    references: [discordGuilds.id],
    relationName: "DiscordGuild_Webhook",
  }),
  guildedServer: one(guildedServers, {
    fields: [webhooks.guildedServerId],
    references: [guildedServers.id],
    relationName: "GuildedServer_Webhook",
  }),
  userToWebhook: one(userToWebhook, {
    fields: [webhooks.platform, webhooks.id],
    references: [userToWebhook.webhookPlatform, userToWebhook.webhookId],
    relationName: "Webhook_UserToWebhook",
  }),
  // messageLogEntries: many(messageLogEntries),
}));

export const userToWebhook = pgTable(
  "UserToWebhook",
  {
    userId: snowflake("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    webhookPlatform: text("webhookPlatform")
      .notNull()
      .$type<"discord" | "guilded">(),
    webhookId: text("webhookId").notNull(),
    favorite: boolean("favorite").default(false).notNull(),
  },
  (table) => ({
    unq: unique().on(table.userId, table.webhookPlatform, table.webhookId),
    webhookReference: foreignKey({
      columns: [table.webhookPlatform, table.webhookId],
      foreignColumns: [webhooks.platform, webhooks.id],
      name: "UserToWebhook_fk",
    }),
  }),
);

export const userToWebhookRelations = relations(userToWebhook, ({ one }) => ({
  user: one(users, {
    fields: [userToWebhook.userId],
    references: [users.id],
    relationName: "User_UserToWebhook",
  }),
  webhook: one(webhooks, {
    fields: [userToWebhook.webhookPlatform, userToWebhook.webhookId],
    references: [webhooks.platform, webhooks.id],
    relationName: "Webhook_UserToWebhook",
  }),
}));

export const messageLogEntries = pgTable("MessageLogEntry", {
  id: snowflakePk(),
  type: text("type").$type<"send" | "edit" | "delete">(),
  webhookId: text("webhookId").notNull(),
  discordGuildId: snowflake("discordGuildId").references(
    () => discordGuilds.id,
    { onDelete: "cascade" },
  ),
  guildedServerId: text("guildedServerId").references(() => guildedServers.id, {
    onDelete: "cascade",
  }),
  channelId: text("channelId").notNull(),
  messageId: text("messageId").notNull(),
  threadId: text("threadId"),

  userId: snowflake("userId"),

  notifiedEveryoneHere: boolean("notifiedEveryoneHere").default(false),
  notifiedRoles: json("notifiedRoles").$type<string[]>(),
  notifiedUsers: json("notifiedUsers").$type<string[]>(),
  hasContent: boolean("hasContent").default(false),
  embedCount: integer("embedCount").default(0),
});

export const messageLogEntriesRelations = relations(
  messageLogEntries,
  ({ one }) => ({
    discordGuild: one(discordGuilds, {
      fields: [messageLogEntries.discordGuildId],
      references: [discordGuilds.id],
      relationName: "DiscordGuild_MessageLogEntry",
    }),
    guildedServer: one(guildedServers, {
      fields: [messageLogEntries.guildedServerId],
      references: [guildedServers.id],
      relationName: "GuildedServer_MessageLogEntry",
    }),
    user: one(users, {
      fields: [messageLogEntries.userId],
      references: [users.id],
      relationName: "User_MessageLogEntry",
    }),
  }),
);

export const discordMessageComponents = pgTable("DiscordMessageComponent", {
  id: snowflakePk(),
  guildId: snowflake("guildId"),
  channelId: snowflake("channelId"),
  messageId: snowflake("messageId"),
  createdById: snowflake("createdById"),
  updatedById: snowflake("updatedById"),
  updatedAt: date("updatedAt"),
  type: integer("type").notNull().$type<ComponentType>(),
  data: json("data").notNull().$type<StorableComponent>(),
  draft: boolean("draft").notNull().default(false),
});

export const discordMessageComponentsRelations = relations(
  discordMessageComponents,
  ({ one, many }) => ({
    guild: one(discordGuilds, {
      fields: [discordMessageComponents.guildId],
      references: [discordGuilds.id],
      relationName: "DiscordGuild_DiscordMessageComponent",
    }),
    createdBy: one(users, {
      fields: [discordMessageComponents.createdById],
      references: [users.id],
      relationName: "User_DiscordMessageComponent-created",
    }),
    updatedBy: one(users, {
      fields: [discordMessageComponents.updatedById],
      references: [users.id],
      relationName: "User_DiscordMessageComponent-updated",
    }),
    componentsToFlows: many(discordMessageComponentsToFlows),
    // placements: many(discordMessageComponentPlacements),
  }),
);

// export const discordMessageComponentPlacements = pgTable("DMC_Placement", {
//   id: snowflakePk(),
//   componentId: snowflake("componentId")
//     .notNull()
//     .references(() => discordMessageComponents.id, { onDelete: "cascade" }),
//   guildId: snowflake("guildId")
//     .notNull()
//     .references(() => discordGuilds.id, { onDelete: "cascade" }),
//   channelId: snowflake("channelId"),
//   messageId: snowflake("messageId"),
// });

// export const discordMessageComponentPlacementsRelations = relations(
//   discordMessageComponentPlacements,
//   ({ one }) => ({
//     discordMessageComponent: one(discordMessageComponents, {
//       fields: [discordMessageComponentPlacements.componentId],
//       references: [discordMessageComponents.id],
//     }),
//     guild: one(discordGuilds, {
//       fields: [discordMessageComponentPlacements.guildId],
//       references: [discordGuilds.id],
//     }),
//   }),
// );

export const discordMessageComponentsToFlows = pgTable(
  "DMC_to_Flow",
  {
    discordMessageComponentId: snowflake("dmcId")
      .notNull()
      .references(() => discordMessageComponents.id, { onDelete: "cascade" }),
    flowId: snowflake("flowId")
      .notNull()
      .references(() => flows.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.discordMessageComponentId, table.flowId],
    }),
  }),
);

export const discordMessageComponentsToFlowsRelations = relations(
  discordMessageComponentsToFlows,
  ({ one }) => ({
    discordMessageComponent: one(discordMessageComponents, {
      fields: [discordMessageComponentsToFlows.discordMessageComponentId],
      references: [discordMessageComponents.id],
    }),
    flow: one(flows, {
      fields: [discordMessageComponentsToFlows.flowId],
      references: [flows.id],
    }),
  }),
);

export const flows = pgTable("Flow", {
  id: snowflakePk(),
  name: text("name"),
});

export const flowsRelations = relations(flows, ({ many }) => ({
  componentsToFlows: many(discordMessageComponentsToFlows),
  trigger: many(triggers, {
    relationName: "Flow_Trigger",
  }),
  actions: many(flowActions, { relationName: "Flow_Action" }),
}));

export const flowActions = pgTable("Action", {
  id: snowflakePk(),
  type: integer("type").notNull().$type<FlowActionType>(),
  data: json("data").notNull().$type<FlowAction>(),
  flowId: snowflake("flowId")
    .notNull()
    .references(() => flows.id, { onDelete: "cascade" }),
  // lastExecutionContext: json(),
});

export const flowActionsRelations = relations(flowActions, ({ one }) => ({
  flow: one(flows, {
    fields: [flowActions.flowId],
    references: [flows.id],
    relationName: "Flow_Action",
  }),
}));

export const triggers = pgTable("Trigger", {
  id: snowflakePk(),
  platform: text("platform").$type<"discord" | "guilded">().notNull(),
  event: integer("event").$type<TriggerEvent>().notNull(),
  discordGuildId: snowflake("discordGuildId"),
  guildedServerId: text("guildedServerId"),
  flowId: snowflake("flowId")
    .notNull()
    .references(() => flows.id, { onDelete: "cascade" }),
  updatedById: snowflake("updatedById"),
  updatedAt: date("updatedAt"),
  disabled: boolean("disabled").notNull().default(false),
});

export const triggersRelations = relations(triggers, ({ one }) => ({
  discordGuild: one(discordGuilds, {
    fields: [triggers.discordGuildId],
    references: [discordGuilds.id],
    relationName: "DiscordGuild_Trigger",
  }),
  guildedServer: one(guildedServers, {
    fields: [triggers.guildedServerId],
    references: [guildedServers.id],
    relationName: "GuildedServer_Trigger",
  }),
  flow: one(flows, {
    fields: [triggers.flowId],
    references: [flows.id],
    relationName: "Flow_Trigger",
  }),
  updatedBy: one(users, {
    fields: [triggers.updatedById],
    references: [users.id],
    relationName: "User_Trigger-updated",
  }),
}));

export const customBots = pgTable("CustomBot", {
  id: snowflakePk(),
  applicationId: snowflake("applicationId").notNull().unique(),
  applicationUserId: snowflake("applicationUserId"),
  icon: text("icon"),
  publicKey: text("publicKey").notNull(),
  clientSecret: text("clientSecret"),
  token: text("token"),
  discriminator: text("discriminator"),
  avatar: text("avatar"),
  name: text("name").notNull(),
  ownerId: snowflake("ownerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  guildId: snowflake("guildId").references(() => discordGuilds.id),
});

export const customBotsRelations = relations(customBots, ({ one }) => ({
  // discordGuilds: many(discordGuilds, {
  //   relationName: "DiscordGuild_CustomBot",
  // }),
  owner: one(users, {
    fields: [customBots.ownerId],
    references: [users.id],
    relationName: "User_CustomBot",
  }),
  oauthInfo: one(oauthInfo, {
    fields: [customBots.id],
    references: [oauthInfo.botId],
    relationName: "GuildedUser_OAuthInfo",
  }),
}));

export const githubPosts = pgTable(
  "GithubPost",
  {
    id: snowflakePk(),
    platform: text("platform").$type<"discord" | "guilded">().notNull(),
    type: text("type").$type<"issue" | "pull" | "discussion">().notNull(),
    githubId: bigint("githubId", { mode: "bigint" }).notNull(),
    repositoryOwner: text("repositoryOwner").notNull(),
    repositoryName: text("repositoryName").notNull(),
    channelId: text("channelId").notNull(),
    postId: text("postId").notNull().unique(),
  },
  (table) => ({
    unq: unique().on(
      table.platform,
      table.channelId,
      table.type,
      table.githubId,
    ),
  }),
);

// Discobot-imported data
export const discordReactionRoles = pgTable(
  "reaction_roles",
  {
    messageId: snowflake("message_id").notNull(),
    channelId: snowflake("channel_id").notNull(),
    guildId: snowflake("guild_id")
      .references(() => discordGuilds.id, { onDelete: "cascade" })
      .notNull(),
    roleId: snowflake("role_id").notNull(),
    reaction: text("reaction").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.messageId, table.reaction] }),
  }),
);

export const reactionRoleRelations = relations(
  discordReactionRoles,
  ({ one }) => ({
    guild: one(discordGuilds, {
      relationName: "DiscordGuild_ReactionRole",
      fields: [discordReactionRoles.guildId],
      references: [discordGuilds.id],
    }),
  }),
);
