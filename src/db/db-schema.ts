import { blob, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm";
import { APISelectMenuComponent, ButtonStyle, ComponentType } from "discord-api-types/v10";
import { Flow } from "../types/components/flows.js";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

const date = (name: string) => integer(name, { mode: 'timestamp' }).$type<Date>();
const bool = (name: string) => integer(name, { mode: 'boolean' });
const bigint = (name: string) => blob(name, { mode: 'bigint' });

export const users = sqliteTable('User', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),

  firstSubscribed: date('firstSubscribed'),
  subscribedSince: date('subscribedSince'),
  lifetime: bool('lifetime').default(false),

  discordId: bigint('discordId').unique().references(() => discordUsers.id),
  guildedId: text('guildedId').unique().references(() => guildedUsers.id),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  backups: many(backups),
  shareLinks: many(shareLinks),
  messageLogEntries: many(messageLogEntries),
  discordUser: one(discordUsers, {
    fields: [users.discordId],
    references: [discordUsers.id],
  }),
  guildedUser: one(guildedUsers, {
    fields: [users.guildedId],
    references: [guildedUsers.id],
  }),
}));

export const discordUsers = sqliteTable('DiscordUser', {
  id: bigint('id').primaryKey(),
  name: text('name').notNull(),
  globalName: text('globalName'),
  discriminator: text('discriminator'),
  avatar: text('avatar'),
});

export const discordUsersRelations = relations(discordUsers, ({ one, many }) => ({
  user: one(users, {
    fields: [discordUsers.id],
    references: [users.discordId],
  }),
  members: many(discordMembers),
}));

export const guildedUsers = sqliteTable('GuildedUser', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatarUrl: text('avatarUrl'),
});

export const guildedUsersRelations = relations(guildedUsers, ({ one }) => ({
  user: one(users, {
    fields: [guildedUsers.id],
    references: [users.guildedId],
  }),
}));

export const discordGuilds = sqliteTable('DiscordGuild', {
  id: bigint('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
});

export const discordGuildsRelations = relations(discordGuilds, ({ many }) => ({
  members: many(discordMembers),
  roles: many(discordRoles),
  backups: many(backups),
  webhooks: many(webhooks),
}));

export const discordRoles = sqliteTable('DiscordRoles', {
  id: bigint('id').notNull(),
  guildId: bigint('id').notNull().references(() => discordGuilds.id),

  name: text('name').notNull(),
  color: integer('color').default(0),
  permissions: bigint('permissions').default(BigInt(0)),
  icon: text('icon'),
  unicodeEmoji: text('unicodeEmoji'),
  position: integer('position').notNull(),
  hoist: bool('hoist').default(false),
  managed: bool('managed').default(false),
  mentionable: bool('mentionable').default(false),
}, (table) => ({
  unq: unique().on(table.id, table.guildId),
}));

export const discordRolesRelations = relations(discordRoles, ({ one }) => ({
  guild: one(discordGuilds, {
    fields: [discordRoles.guildId],
    references: [discordGuilds.id],
  }),
}));

export const discordMembers = sqliteTable('DiscordMember', {
  userId: bigint('userId').notNull(),
  guildId: bigint('guildId').notNull(),
}, (table) => ({
  unq: unique().on(table.userId, table.guildId),
}));

export const discordMembersRelations = relations(discordMembers, ({ one }) => ({
  user: one(users, {
    fields: [discordMembers.userId],
    references: [users.id],
  }),
  guild: one(discordGuilds, {
    fields: [discordMembers.guildId],
    references: [discordGuilds.id],
  }),
}));

export const guildedServers = sqliteTable('GuildedServer', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatarUrl: text('avatarUrl'),
});

export const guildedServersRelations = relations(guildedServers, ({ many }) => ({
  backups: many(backups),
  webhooks: many(webhooks),
}));

export const shareLinks = sqliteTable('ShareLink', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shareId: text('shareId').notNull(),
  createdAt: date('createdAt').notNull().$defaultFn(() => new Date()),
  expiresAt: date('expiresAt').notNull(),
  origin: text('origin'),

  userId: integer('userId').references(() => users.id),
});

export const shareLinksRelations = relations(shareLinks, ({ one }) => ({
  user: one(users, {
    fields: [shareLinks.userId],
    references: [users.id],
  }),
}));

export const backups = sqliteTable('Backup', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: date('createdAt').notNull().$defaultFn(() => new Date()),
  updatedAt: date('updatedAt'),
  dataVersion: text('dataVersion').notNull(),
  data: text('data', { mode: 'json' }).notNull(),

  ownerId: integer('ownerId').notNull().references(() => users.id),
});

export const backupsRelations = relations(backups, ({ one, many }) => ({
  owner: one(users, {
    fields: [backups.ownerId],
    references: [users.id],
  }),
  guilds: many(discordGuilds),
  servers: many(guildedServers),
}));

export const webhooks = sqliteTable('Webhook', {
  platform: text('platform').notNull().$type<'discord' | 'guilded'>(),
  id: text('id').notNull(),
  token: text('token'),
  name: text('name').notNull(),
  avatar: text('avatar'),
  channelId: text('channelId').notNull(),

  discordGuildId: bigint('discordGuildId').references(() => discordGuilds.id),
  guildedServerId: text('guildedServerId').references(() => guildedServers.id),
}, (table) => ({
  unq: unique().on(table.platform, table.id),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  discordGuild: one(discordGuilds, {
    fields: [webhooks.discordGuildId],
    references: [discordGuilds.id],
  }),
  guildedServer: one(guildedServers, {
    fields: [webhooks.guildedServerId],
    references: [guildedServers.id],
  }),
  messageLogEntries: many(messageLogEntries),
}));

export const messageLogEntries = sqliteTable('MessageLogEntry', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').$type<'send' | 'edit' | 'delete'>(),
  webhookId: text('webhookId').notNull().references(() => webhooks.id),
  channelId: text('channelId').notNull(),
  messageId: text('messageId').notNull(),
  threadId: text('threadId'),

  userId: integer('userId').references(() => users.id),

  notifiedEveryoneHere: bool('notifiedEveryoneHere').default(false),
  notifiedRoles: text('notifiedRoles', { mode: 'json' }).$type<string[]>(),
  notifiedUsers: text('notifiedUsers', { mode: 'json' }).$type<string[]>(),
  hasContent: bool('hasContent').default(false),
  embedCount: integer('embedCount').default(0),
});

export const messageLogEntriesRelations = relations(messageLogEntries, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [messageLogEntries.webhookId],
    references: [webhooks.id], 
  }),
  user: one(users, {
    fields: [messageLogEntries.userId],
    references: [users.id],
  }),
}));

export const discordMessageComponents = sqliteTable('DiscordMessageComponent', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  guildId: bigint('guildId').notNull().references(() => discordGuilds.id),
  channelId: bigint('channelId').notNull(),
  messageId: bigint('messageId').notNull(),
  type: integer('type').notNull().$type<ComponentType>(),
  flow: text('flow', { mode: 'json' }).$type<Flow>(),
  customId: text('customId'),
  buttonStyle: integer('style').$type<ButtonStyle>(),
  buttonUrl: text('url'),
});

export const discordMessageComponentsRelations = relations(discordMessageComponents, ({ one, many }) => ({
  guild: one(discordGuilds, {
    fields: [discordMessageComponents.guildId],
    references: [discordGuilds.id],
  }),
  selectOptions: many(discordSelectOptions),
}));

export const discordSelectOptions = sqliteTable('DiscordSelectOption', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  componentId: integer('componentId').notNull(),
  type: integer('type').notNull().$type<APISelectMenuComponent['type']>(),
  flow: text('flow', { mode: 'json' }).$type<Flow>(),
});

export const discordSelectOptionsRelations = relations(discordSelectOptions, ({ one }) => ({
  component: one(discordMessageComponents, {
    fields: [discordSelectOptions.componentId],
    references: [discordMessageComponents.id],
  }),
}));
