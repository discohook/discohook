ALTER TABLE "Backup" ADD COLUMN "scheduled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Backup" ADD COLUMN "nextRunAt" timestamp;--> statement-breakpoint
ALTER TABLE "Backup" ADD COLUMN "lastRunData" json;--> statement-breakpoint
ALTER TABLE "Backup" ADD COLUMN "cron" text;--> statement-breakpoint
ALTER TABLE "Backup" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "MessageLogEntry" ADD COLUMN "discordGuildId" bigint;--> statement-breakpoint
ALTER TABLE "MessageLogEntry" ADD COLUMN "guildedServerId" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MessageLogEntry" ADD CONSTRAINT "MessageLogEntry_discordGuildId_DiscordGuild_id_fk" FOREIGN KEY ("discordGuildId") REFERENCES "DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MessageLogEntry" ADD CONSTRAINT "MessageLogEntry_guildedServerId_GuildedServer_id_fk" FOREIGN KEY ("guildedServerId") REFERENCES "GuildedServer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
