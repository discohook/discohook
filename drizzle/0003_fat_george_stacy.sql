CREATE TABLE IF NOT EXISTS "scheduled_posts" (
	"id" serial NOT NULL,
	"user_id" bigint,
	"guild_id" bigint,
	"message_data" json,
	"webhook_id" bigint,
	"webhook_token" text,
	"future" timestamp,
	"error" text
);
