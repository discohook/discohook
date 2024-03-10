CREATE TABLE IF NOT EXISTS "OAuthInfo" (
	"id" serial PRIMARY KEY NOT NULL,
	"discordId" bigint,
	"guildedId" text,
	"accessToken" text NOT NULL,
	"refreshToken" text,
	"scope" json NOT NULL,
	"expiresAt" timestamp NOT NULL,
	CONSTRAINT "OAuthInfo_discordId_unique" UNIQUE("discordId"),
	CONSTRAINT "OAuthInfo_guildedId_unique" UNIQUE("guildedId")
);
--> statement-breakpoint
ALTER TABLE "Backup" DROP CONSTRAINT "Backup_ownerId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" DROP CONSTRAINT "DiscordMessageComponent_guildId_DiscordGuild_id_fk";
--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" DROP CONSTRAINT "DiscordMessageComponent_createdById_User_id_fk";
--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" DROP CONSTRAINT "DiscordMessageComponent_updatedById_User_id_fk";
--> statement-breakpoint
ALTER TABLE "DiscordRoles" DROP CONSTRAINT "DiscordRoles_guildId_DiscordGuild_id_fk";
--> statement-breakpoint
ALTER TABLE "MessageLogEntry" DROP CONSTRAINT "MessageLogEntry_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "ShareLink" DROP CONSTRAINT "ShareLink_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Triggers" DROP CONSTRAINT "Triggers_discordGuildId_DiscordGuild_id_fk";
--> statement-breakpoint
ALTER TABLE "Triggers" DROP CONSTRAINT "Triggers_guildedServerId_GuildedServer_id_fk";
--> statement-breakpoint
ALTER TABLE "Triggers" DROP CONSTRAINT "Triggers_updatedById_User_id_fk";
--> statement-breakpoint
ALTER TABLE "User" DROP CONSTRAINT "User_discordId_DiscordUser_id_fk";
--> statement-breakpoint
ALTER TABLE "User" DROP CONSTRAINT "User_guildedId_GuildedUser_id_fk";
--> statement-breakpoint
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_discordGuildId_DiscordGuild_id_fk";
--> statement-breakpoint
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_guildedServerId_GuildedServer_id_fk";
--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" ADD COLUMN "draft" boolean DEFAULT false NOT NULL;