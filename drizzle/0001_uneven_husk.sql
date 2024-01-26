CREATE TABLE IF NOT EXISTS "Backup" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp,
	"dataVersion" text NOT NULL,
	"data" json NOT NULL,
	"ownerId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordGuild" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordMember" (
	"userId" bigint NOT NULL,
	"guildId" bigint NOT NULL,
	CONSTRAINT "DiscordMember_userId_guildId_unique" UNIQUE("userId","guildId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordMessageComponent" (
	"id" serial PRIMARY KEY NOT NULL,
	"guildId" bigint NOT NULL,
	"channelId" bigint NOT NULL,
	"messageId" bigint NOT NULL,
	"createdById" integer,
	"updatedById" integer,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"customId" text,
	"data" json NOT NULL,
	CONSTRAINT "DiscordMessageComponent_messageId_customId_unique" UNIQUE("messageId","customId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordRoles" (
	"id" bigint NOT NULL,
	"guildId" bigint NOT NULL,
	"name" text NOT NULL,
	"color" integer DEFAULT 0,
	"permissions" text DEFAULT '0',
	"icon" text,
	"unicodeEmoji" text,
	"position" integer NOT NULL,
	"hoist" boolean DEFAULT false,
	"managed" boolean DEFAULT false,
	"mentionable" boolean DEFAULT false,
	CONSTRAINT "DiscordRoles_id_guildId_unique" UNIQUE("id","guildId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordUser" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"globalName" text,
	"discriminator" text,
	"avatar" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GuildedServer" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatarUrl" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GuildedUser" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatarUrl" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MessageLogEntry" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text,
	"webhookId" text NOT NULL,
	"channelId" text NOT NULL,
	"messageId" text NOT NULL,
	"threadId" text,
	"userId" integer,
	"notifiedEveryoneHere" boolean DEFAULT false,
	"notifiedRoles" json,
	"notifiedUsers" json,
	"hasContent" boolean DEFAULT false,
	"embedCount" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ShareLink" (
	"id" serial PRIMARY KEY NOT NULL,
	"shareId" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"origin" text,
	"userId" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Triggers" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"event" integer NOT NULL,
	"discordGuildId" bigint,
	"guildedServerId" text,
	"flow" json,
	"updatedById" integer,
	"updatedAt" timestamp,
	"disabled" boolean DEFAULT false NOT NULL,
	"ignoreBots" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"firstSubscribed" timestamp,
	"subscribedSince" timestamp,
	"lifetime" boolean DEFAULT false,
	"discordId" bigint,
	"guildedId" text,
	CONSTRAINT "User_discordId_unique" UNIQUE("discordId"),
	CONSTRAINT "User_guildedId_unique" UNIQUE("guildedId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Webhook" (
	"platform" text NOT NULL,
	"id" text NOT NULL,
	"token" text,
	"name" text NOT NULL,
	"avatar" text,
	"channelId" text NOT NULL,
	"applicationId" text,
	"userId" integer,
	"discordGuildId" bigint,
	"guildedServerId" text,
	CONSTRAINT "Webhook_platform_id_unique" UNIQUE("platform","id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Backup" ADD CONSTRAINT "Backup_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMessageComponent" ADD CONSTRAINT "DiscordMessageComponent_guildId_DiscordGuild_id_fk" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMessageComponent" ADD CONSTRAINT "DiscordMessageComponent_createdById_User_id_fk" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMessageComponent" ADD CONSTRAINT "DiscordMessageComponent_updatedById_User_id_fk" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordRoles" ADD CONSTRAINT "DiscordRoles_guildId_DiscordGuild_id_fk" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MessageLogEntry" ADD CONSTRAINT "MessageLogEntry_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Triggers" ADD CONSTRAINT "Triggers_discordGuildId_DiscordGuild_id_fk" FOREIGN KEY ("discordGuildId") REFERENCES "DiscordGuild"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Triggers" ADD CONSTRAINT "Triggers_guildedServerId_GuildedServer_id_fk" FOREIGN KEY ("guildedServerId") REFERENCES "GuildedServer"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Triggers" ADD CONSTRAINT "Triggers_updatedById_User_id_fk" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_discordId_DiscordUser_id_fk" FOREIGN KEY ("discordId") REFERENCES "DiscordUser"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "User" ADD CONSTRAINT "User_guildedId_GuildedUser_id_fk" FOREIGN KEY ("guildedId") REFERENCES "GuildedUser"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_discordGuildId_DiscordGuild_id_fk" FOREIGN KEY ("discordGuildId") REFERENCES "DiscordGuild"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_guildedServerId_GuildedServer_id_fk" FOREIGN KEY ("guildedServerId") REFERENCES "GuildedServer"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
