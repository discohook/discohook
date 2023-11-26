import { blob, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm";

const date = (name: string) => integer(name, { mode: 'timestamp' }).$type<Date>();
const bool = (name: string) => integer(name, { mode: 'boolean' });
const bigint = (name: string) => blob(name, { mode: 'bigint' });

export const user = sqliteTable('User', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),

  firstSubscribed: date('firstSubscribed'),
  subscribedSince: date('subscribedSince'),
  lifetime: bool('lifetime').default(false),

  discordId: bigint('discordId').unique().references(() => discordUser.id),
  guildedId: text('guildedId').unique().references(() => guildedUser.id),
});

export const discordUser = sqliteTable('DiscordUser', {
  id: bigint('id').primaryKey(),
  name: text('name').notNull(),
  globalName: text('globalName'),
  discriminator: text('discriminator'),
  avatar: text('avatar'),
});

export const guildedUser = sqliteTable('GuildedUser', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatarUrl: text('avatarUrl'),
});

export const discordGuild = sqliteTable('DiscordGuild', {
  id: bigint('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
});

export const discordGuildRelations = relations(discordGuild, ({ many }) => ({
  members: many(discordMember),
  roles: many(discordRole),
  backups: many(backup),
  webhooks: many(webhook),
}))

export const discordRole = sqliteTable('DiscordRoles', {
  id: bigint('id').notNull(),
  guildId: bigint('id').notNull().references(() => discordGuild.id),

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

export const discordMember = sqliteTable('DiscordMember', {
  userId: bigint('userId').notNull(),
  guildId: bigint('guildId').notNull(),
}, (table) => ({
  unq: unique().on(table.userId, table.guildId),
}));

export const guildedServer = sqliteTable('GuildedServer', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatarUrl: text('avatarUrl'),
});

export const shareLink = sqliteTable('ShareLink', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shareId: text('shareId').notNull(),
  createdAt: date('createdAt').notNull().$defaultFn(() => new Date()),
  expiresAt: date('expiresAt').notNull(),
  origin: text('origin'),

  userId: integer('userId').references(() => user.id),
});

export const backup = sqliteTable('Backup', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: date('createdAt').notNull().$defaultFn(() => new Date()),
  updatedAt: date('updatedAt'),
  dataVersion: text('dataVersion').notNull(),
  data: text('data', { mode: 'json' }).notNull(),

  ownerId: integer('ownerId').notNull().references(() => user.id),
});

export const backupRelations = relations(backup, ({ many }) => ({
  guilds: many(discordGuild),
  servers: many(guildedServer),
}));

export const webhook = sqliteTable('Webhook', {
  platform: text('platform').notNull().$type<'discord' | 'guilded'>(),
  id: text('id').primaryKey(),
  token: text('token'),
  name: text('name').notNull(),
  avatar: text('avatar'),
  channelId: text('channelId').notNull(),

  discordGuildId: bigint('discordGuildId').references(() => discordGuild.id),
  guildedServerId: text('guildedServerId').references(() => guildedServer.id),
});

export const webhookRelations = relations(webhook, ({ many }) => ({
  messageLogEntries: many(messageLogEntry),
}));

export const messageLogEntry = sqliteTable('MessageLogEntry', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').$type<'send' | 'edit' | 'delete'>(),
  webhookId: text('webhookId').notNull().references(() => webhook.id),
  channelId: text('channelId').notNull(),
  messageId: text('messageId').notNull(),
  threadId: text('threadId'),

  userId: integer('userId').references(() => user.id),

  notifiedEveryoneHere: bool('notifiedEveryoneHere').default(false),
  notifiedRoles: text('notifiedRoles', { mode: 'json' }).$type<string[]>(),
  notifiedUsers: text('notifiedUsers', { mode: 'json' }).$type<string[]>(),
  hasContent: bool('hasContent').default(false),
  embedCount: integer('embedCount').default(0),
});

// export const messageLogEntryRelations = relations(messageLogEntry, ({ one }) => ({
//   webhook: one(webhook),
// }));
