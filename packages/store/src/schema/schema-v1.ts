// !! Don't edit this file unless something is wrong !!
// Below is the schema for the v1 database. It's defined here
// so that we can import as needed for migration.

import {
  bigint,
  boolean,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
// import { discordMessageComponents } from "./schema.js";

export const message_settings = pgTable("message_settings", {
  guildId: bigint("guild_id", { mode: "bigint" }),
  channelId: bigint("channel_id", { mode: "bigint" }),
  messageId: bigint("message_id", { mode: "bigint" }).notNull(),
  maxRoles: integer("max_roles"),
});

export const buttons = pgTable("buttons", {
  guildId: bigint("guild_id", { mode: "bigint" }),
  channelId: bigint("channel_id", { mode: "bigint" }),
  messageId: bigint("message_id", { mode: "bigint" }),
  roleId: bigint("role_id", { mode: "bigint" }),
  style: text("style"),
  customLabel: text("custom_label"),
  emoji: text("emoji"),
  url: text("url"),
  customEphemeralMessageData: text("custom_ephemeral_message_data"),
  customDmMessageData: text("custom_dm_message_data"),
  customId: text("custom_id"),
  roleIds: bigint("role_ids", { mode: "bigint" }).array(),
  type: text("type"),
  customPublicMessageData: text("custom_public_message_data"),
  id: serial("id").notNull(),
  // migratedComponentId: bigint("migrated_component_id", {
  //   mode: "bigint",
  // }),
});

// export const buttonsRelations = relations(buttons, ({ one }) => ({
//   migratedComponent: one(discordMessageComponents, {
//     fields: [buttons.migratedComponentId],
//     references: [discordMessageComponents.id],
//   }),
// }));

export const welcomer_hello = pgTable("welcomer_hello", {
  guildId: bigint("guild_id", { mode: "bigint" }).notNull(),
  channelId: bigint("channel_id", { mode: "bigint" }),
  webhookId: bigint("webhook_id", { mode: "bigint" }),
  webhookToken: text("webhook_token"),
  messageData: text("message_data"),
  lastModifiedAt: timestamp("last_modified_at", { mode: "string" }),
  lastModifiedById: bigint("last_modified_by_id", { mode: "bigint" }),
  overrideDisabled: boolean("override_disabled"),
  ignoreBots: boolean("ignore_bots"),
  deleteMessagesAfter: integer("delete_messages_after"),
  id: serial("id").notNull(),
});

/** We shouldn't have to worry about this one since the feature no longer exists */
export const autopublish = pgTable("autopublish", {
  channelId: bigint("channel_id", { mode: "bigint" }).notNull(),
  addedById: bigint("added_by_id", { mode: "bigint" }),
  ignore: text("ignore"),
});

export const welcomer_goodbye = pgTable("welcomer_goodbye", {
  guildId: bigint("guild_id", { mode: "bigint" }).notNull(),
  channelId: bigint("channel_id", { mode: "bigint" }),
  webhookId: bigint("webhook_id", { mode: "bigint" }),
  webhookToken: text("webhook_token"),
  messageData: text("message_data"),
  lastModifiedAt: timestamp("last_modified_at", { mode: "string" }),
  lastModifiedById: bigint("last_modified_by_id", { mode: "bigint" }),
  overrideDisabled: boolean("override_disabled"),
  ignoreBots: boolean("ignore_bots"),
  deleteMessagesAfter: integer("delete_messages_after"),
  id: serial("id").notNull(),
});

export const scheduled_posts = pgTable("scheduled_posts", {
  id: serial("id").notNull(),
  userId: bigint("user_id", { mode: "bigint" }),
  guildId: bigint("guild_id", { mode: "bigint" }),
  messageData: json("message_data"),
  webhookId: bigint("webhook_id", { mode: "bigint" }),
  webhookToken: text("webhook_token"),
  future: timestamp("future", { mode: "string" }),
  error: text("error"),
});
