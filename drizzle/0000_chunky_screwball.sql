-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "message_settings" (
	"guild_id" bigint,
	"channel_id" bigint,
	"message_id" bigint NOT NULL,
	"max_roles" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buttons" (
	"guild_id" bigint,
	"channel_id" bigint,
	"message_id" bigint,
	"role_id" bigint,
	"style" text,
	"custom_label" text,
	"emoji" text,
	"url" text,
	"custom_ephemeral_message_data" text,
	"custom_dm_message_data" text,
	"custom_id" text,
	"role_ids" bigint[],
	"type" text,
	"custom_public_message_data" text,
	"id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "welcomer_hello" (
	"guild_id" bigint NOT NULL,
	"channel_id" bigint,
	"webhook_id" bigint,
	"webhook_token" text,
	"message_data" text,
	"last_modified_at" timestamp,
	"last_modified_by_id" bigint,
	"override_disabled" boolean,
	"ignore_bots" boolean,
	"delete_messages_after" integer,
	"id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "autopublish" (
	"channel_id" bigint NOT NULL,
	"added_by_id" bigint,
	"ignore" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "welcomer_goodbye" (
	"guild_id" bigint NOT NULL,
	"channel_id" bigint,
	"webhook_id" bigint,
	"webhook_token" text,
	"message_data" text,
	"last_modified_at" timestamp,
	"last_modified_by_id" bigint,
	"override_disabled" boolean,
	"ignore_bots" boolean,
	"delete_messages_after" integer,
	"id" serial NOT NULL
);

*/