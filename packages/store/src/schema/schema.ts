import { isSnowflake } from "discord-snowflake";
import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  unique
} from "drizzle-orm/pg-core";
import { QueryData } from "../types/backups.js";
import { Flow, StorableComponent } from "../types/components.js";
import { TriggerEvent } from "../types/triggers.js";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const date = (name: string) => timestamp(name, { mode: "date" }).$type<Date>();
const snowflake = (name: string) => bigint(name, { mode: "bigint" });

// We in the business call this a make-flake
/** Assert that `id` is a snowflake and return the appropriately typed value */
export const makeSnowflake = (id: string) => {
  if (isSnowflake(id)) return BigInt(id);
  throw new Error(`${id} is not a snowflake.`);
};

export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),

  firstSubscribed: date("firstSubscribed"),
  subscribedSince: date("subscribedSince"),
  lifetime: boolean("lifetime").default(false),

  discordId: snowflake("discordId").unique(),
  guildedId: text("guildedId").unique(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  backups: many(backups, { relationName: "User_Backup" }),
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

export const discordGuilds = pgTable("DiscordGuild", {
  id: snowflake("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
});

export const discordGuildsRelations = relations(discordGuilds, ({ many }) => ({
  members: many(discordMembers, { relationName: "DiscordGuild_DiscordMember" }),
  roles: many(discordRoles, { relationName: "DiscordGuild_DiscordRole" }),
  backups: many(backups, { relationName: "DiscordGuild_Backup" }),
  webhooks: many(webhooks, { relationName: "DiscordGuild_Webhook" }),
  triggers: many(triggers, { relationName: "DiscordGuild_Trigger" }),
}));

export const discordRoles = pgTable(
  "DiscordRoles",
  {
    id: snowflake("id").notNull(),
    guildId: snowflake("guildId").notNull(),

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
    userId: snowflake("userId").notNull(),
    guildId: snowflake("guildId").notNull(),
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
  }),
);

export const shareLinks = pgTable("ShareLink", {
  id: serial("id").primaryKey(),
  shareId: text("shareId").notNull(),
  createdAt: date("createdAt")
    .notNull()
    .$defaultFn(() => new Date()),
  expiresAt: date("expiresAt").notNull(),
  origin: text("origin"),

  userId: integer("userId"),
});

export const shareLinksRelations = relations(shareLinks, ({ one }) => ({
  user: one(users, {
    fields: [shareLinks.userId],
    references: [users.id],
    relationName: "User_ShareLink",
  }),
}));

export const backups = pgTable("Backup", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: date("createdAt")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: date("updatedAt"),
  dataVersion: text("dataVersion").notNull(),
  data: json("data").notNull().$type<QueryData>(),

  ownerId: integer("ownerId").notNull(),
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

    userId: integer("userId"),
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
  id: serial("id").primaryKey(),
  type: text("type").$type<"send" | "edit" | "delete">(),
  webhookId: text("webhookId").notNull(),
  channelId: text("channelId").notNull(),
  messageId: text("messageId").notNull(),
  threadId: text("threadId"),

  userId: integer("userId"),

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
    user: one(users, {
      fields: [messageLogEntries.userId],
      references: [users.id],
      relationName: "User_MessageLogEntry",
    }),
  }),
);

export const discordMessageComponents = pgTable(
  "DiscordMessageComponent",
  {
    id: serial("id").primaryKey(),
    guildId: snowflake("guildId").notNull(),
    channelId: snowflake("channelId").notNull(),
    messageId: snowflake("messageId").notNull(),
    createdById: integer("createdById"),
    updatedById: integer("updatedById"),
    createdAt: date("createdAt").$defaultFn(() => new Date()),
    updatedAt: date("updatedAt"),
    customId: text("customId"),
    data: json("data").notNull().$type<StorableComponent>(),
  },
  (table) => ({
    unq: unique().on(table.messageId, table.customId),
  }),
);

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
  id: serial("id").primaryKey(),
  platform: text("platform").$type<"discord" | "guilded">().notNull(),
  event: integer("event").$type<TriggerEvent>().notNull(),
  discordGuildId: snowflake("discordGuildId"),
  guildedServerId: text("guildedServerId"),
  flow: json("flow").$type<Flow>(),
  updatedById: integer("updatedById"),
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
