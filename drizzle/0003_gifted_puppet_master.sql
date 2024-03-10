CREATE TABLE IF NOT EXISTS "reaction_roles" (
	"message_id" bigint NOT NULL,
	"channel_id" bigint NOT NULL,
	"guild_id" bigint NOT NULL,
	"role_id" bigint NOT NULL,
	"reaction" text NOT NULL,
	CONSTRAINT "reaction_roles_message_id_reaction_pk" PRIMARY KEY("message_id","reaction")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LinkBackup" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp,
	"dataVersion" text NOT NULL,
	"data" json NOT NULL,
	"ownerId" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "DiscordGuild" ALTER COLUMN "name" SET DEFAULT 'Unknown Server';--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "subscriptionExpiresAt" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMember" ADD CONSTRAINT "DiscordMember_userId_DiscordUser_id_fk" FOREIGN KEY ("userId") REFERENCES "DiscordUser"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMember" ADD CONSTRAINT "DiscordMember_guildId_DiscordGuild_id_fk" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordRoles" ADD CONSTRAINT "DiscordRoles_guildId_DiscordGuild_id_fk" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction_roles" ADD CONSTRAINT "reaction_roles_guild_id_DiscordGuild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "DiscordRoles" ADD CONSTRAINT "DiscordRoles_id_unique" UNIQUE("id");