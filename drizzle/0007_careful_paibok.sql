ALTER TABLE "DiscordMessageComponent" DROP CONSTRAINT "DiscordMessageComponent_messageId_customId_unique";--> statement-breakpoint
ALTER TABLE "Backup" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "Backup" ALTER COLUMN "ownerId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" ALTER COLUMN "guildId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" ALTER COLUMN "channelId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" ALTER COLUMN "messageId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" ALTER COLUMN "createdById" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" ALTER COLUMN "updatedById" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "LinkBackup" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "LinkBackup" ALTER COLUMN "ownerId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "MessageLogEntry" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "MessageLogEntry" ALTER COLUMN "userId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "OAuthInfo" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "ShareLink" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "ShareLink" ALTER COLUMN "userId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "Triggers" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "Triggers" ALTER COLUMN "updatedById" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "Webhook" ALTER COLUMN "userId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "Backup" DROP COLUMN IF EXISTS "createdAt";--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" DROP COLUMN IF EXISTS "createdAt";--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" DROP COLUMN IF EXISTS "customId";--> statement-breakpoint
ALTER TABLE "LinkBackup" DROP COLUMN IF EXISTS "createdAt";--> statement-breakpoint
ALTER TABLE "ShareLink" DROP COLUMN IF EXISTS "createdAt";