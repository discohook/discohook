import { Snowflake } from "@theinternetfolks/snowflake";
import { isSnowflake } from "discord-snowflake";
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import {
  LinkQueryData,
  QueryData,
  ScheduledRunData,
} from "../types/backups.js";
import { Flow, StorableComponent } from "../types/components.js";
import { TriggerEvent } from "../types/triggers.js";

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
}));

export const discordGuilds = pgTable("DiscordGuild", {
  id: snowflake("id").primaryKey(),
  name: text("name").default("Unknown Server").notNull(),
  icon: text("icon"),
});

export const discordGuildsRelations = relations(discordGuilds, ({ many }) => ({
  members: many(discordMembers, { relationName: "DiscordGuild_DiscordMember" }),
  roles: many(discordRoles, { relationName: "DiscordGuild_DiscordRole" }),
  backups: many(backups, { relationName: "DiscordGuild_Backup" }),
  webhooks: many(webhooks, { relationName: "DiscordGuild_Webhook" }),
  triggers: many(triggers, { relationName: "DiscordGuild_Trigger" }),
  reactionRoles: many(discordReactionRoles, {
    relationName: "DiscordGuild_ReactionRole",
  }),
  messageLogEntries: many(messageLogEntries, {
    relationName: "DiscordGuild_MessageLogEntry",
  }),
}));

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
    permissions: text("permissions").default("0"),
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
    backups: many(backups, { relationName: "GuildedServer_Backup" }),
    webhooks: many(webhooks, { relationName: "GuildedServer_Webhook" }),
    triggers: many(triggers, { relationName: "GuildedServer_Trigger" }),
    messageLogEntries: many(messageLogEntries, {
      relationName: "GuildedServer_MessageLogEntry",
    }),
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
    relationName: "User_Backup",
  }),
  guilds: many(discordGuilds, { relationName: "DiscordGuild_Backup" }),
  servers: many(guildedServers, { relationName: "GuildedServer_Backup" }),
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

export const linkBackupsRelations = relations(backups, ({ one, many }) => ({
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

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
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
  // messageLogEntries: many(messageLogEntries),
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
    // webhook: one(webhooks, {
    //   fields: [messageLogEntries.webhookId],
    //   references: [webhooks.id],
    // }),
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
  data: json("data").notNull().$type<StorableComponent>(),
  draft: boolean("draft").notNull().default(false),
});

export const discordMessageComponentsRelations = relations(
  discordMessageComponents,
  ({ one }) => ({
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
  }),
);

export const triggers = pgTable("Triggers", {
  id: snowflakePk(),
  platform: text("platform").$type<"discord" | "guilded">().notNull(),
  event: integer("event").$type<TriggerEvent>().notNull(),
  discordGuildId: snowflake("discordGuildId"),
  guildedServerId: text("guildedServerId"),
  flow: json("flow").$type<Flow>(),
  updatedById: snowflake("updatedById"),
  updatedAt: date("updatedAt"),
  disabled: boolean("disabled").notNull().default(false),
  ignoreBots: boolean("ignoreBots").default(false),
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
  updatedBy: one(users, {
    fields: [triggers.updatedById],
    references: [users.id],
    relationName: "User_Trigger-updated",
  }),
}));

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
