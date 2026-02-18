-- We updated from 0.32.1 in February 2026:
-- https://github.com/drizzle-team/drizzle-orm/releases/tag/0.33.0
UPDATE "OAuthInfo" SET scope = (scope #>> '{}')::json;--> statement-breakpoint
UPDATE "Backup" SET data = (data #>> '{}')::json;--> statement-breakpoint
UPDATE "Backup" SET "lastRunData" = ("lastRunData" #>> '{}')::json;--> statement-breakpoint
UPDATE "LinkBackup" SET data = (data #>> '{}')::json;--> statement-breakpoint
UPDATE "MessageLogEntry" SET "notifiedRoles" = ("notifiedRoles" #>> '{}')::json;--> statement-breakpoint
UPDATE "MessageLogEntry" SET "notifiedUsers" = ("notifiedUsers" #>> '{}')::json;--> statement-breakpoint
UPDATE "DiscordMessageComponent" SET data = (data #>> '{}')::json;--> statement-breakpoint
UPDATE "Action" SET data = (data #>> '{}')::json;
