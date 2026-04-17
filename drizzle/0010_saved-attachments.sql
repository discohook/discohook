CREATE TABLE "SavedAttachment" (
	"id" bigint PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"description" text,
	"contentType" text NOT NULL,
	"discordMessageId" bigint,
	"discordGuildId" bigint NOT NULL,
	"userId" bigint
);
--> statement-breakpoint
ALTER TABLE "DiscordGuild" ADD COLUMN "attachmentChannelId" bigint;--> statement-breakpoint
ALTER TABLE "SavedAttachment" ADD CONSTRAINT "SavedAttachment_discordGuildId_DiscordGuild_id_fk" FOREIGN KEY ("discordGuildId") REFERENCES "public"."DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SavedAttachment" ADD CONSTRAINT "SavedAttachment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;