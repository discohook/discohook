ALTER TABLE "GuildedServer" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "GuildedUser" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "GuildedServer" CASCADE;--> statement-breakpoint
DROP TABLE "GuildedUser" CASCADE;--> statement-breakpoint
ALTER TABLE "OAuthInfo" DROP CONSTRAINT "OAuthInfo_guildedId_unique";--> statement-breakpoint
ALTER TABLE "User" DROP CONSTRAINT "User_guildedId_unique";--> statement-breakpoint
ALTER TABLE "MessageLogEntry" DROP CONSTRAINT "MessageLogEntry_guildedServerId_GuildedServer_id_fk";
--> statement-breakpoint
ALTER TABLE "MessageLogEntry" DROP COLUMN "guildedServerId";--> statement-breakpoint
ALTER TABLE "OAuthInfo" DROP COLUMN "guildedId";--> statement-breakpoint
ALTER TABLE "Trigger" DROP COLUMN "guildedServerId";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "guildedId";--> statement-breakpoint
ALTER TABLE "Webhook" DROP COLUMN "guildedServerId";