CREATE TABLE IF NOT EXISTS "Backup" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"updatedAt" timestamp,
	"dataVersion" text NOT NULL,
	"data" json NOT NULL,
	"previewImageUrl" text,
	"importedFromOrg" boolean DEFAULT false NOT NULL,
	"scheduled" boolean DEFAULT false NOT NULL,
	"nextRunAt" timestamp,
	"lastRunData" json,
	"cron" text,
	"timezone" text,
	"ownerId" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CustomBot" (
	"id" bigint PRIMARY KEY NOT NULL,
	"applicationId" bigint NOT NULL,
	"applicationUserId" bigint,
	"icon" text,
	"publicKey" text NOT NULL,
	"clientSecret" text,
	"token" text,
	"discriminator" text,
	"avatar" text,
	"name" text NOT NULL,
	"ownerId" bigint NOT NULL,
	"guildId" bigint,
	CONSTRAINT "CustomBot_applicationId_unique" UNIQUE("applicationId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordGuild" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Unknown Server' NOT NULL,
	"icon" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordGuild_to_Backup" (
	"discordGuildId" bigint NOT NULL,
	"backupId" bigint NOT NULL,
	CONSTRAINT "DiscordGuild_to_Backup_discordGuildId_backupId_pk" PRIMARY KEY("discordGuildId","backupId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordMember" (
	"userId" bigint NOT NULL,
	"guildId" bigint NOT NULL,
	"permissions" text DEFAULT '0' NOT NULL,
	"owner" boolean DEFAULT false NOT NULL,
	CONSTRAINT "DiscordMember_userId_guildId_unique" UNIQUE("userId","guildId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DiscordMessageComponent" (
	"id" bigint PRIMARY KEY NOT NULL,
	"guildId" bigint,
	"channelId" bigint,
	"messageId" bigint,
	"createdById" bigint,
	"updatedById" bigint,
	"updatedAt" timestamp,
	"type" integer NOT NULL,
	"data" json NOT NULL,
	"draft" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DMC_to_Flow" (
	"dmcId" bigint NOT NULL,
	"flowId" bigint NOT NULL,
	CONSTRAINT "DMC_to_Flow_dmcId_flowId_pk" PRIMARY KEY("dmcId","flowId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reaction_roles" (
	"message_id" bigint NOT NULL,
	"channel_id" bigint NOT NULL,
	"guild_id" bigint NOT NULL,
	"role_id" bigint NOT NULL,
	"reaction" text NOT NULL,
	CONSTRAINT "reaction_roles_message_id_reaction_pk" PRIMARY KEY("message_id","reaction")
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
	CONSTRAINT "DiscordRoles_id_unique" UNIQUE("id"),
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
CREATE TABLE IF NOT EXISTS "Action" (
	"id" bigint PRIMARY KEY NOT NULL,
	"type" integer NOT NULL,
	"data" json NOT NULL,
	"flowId" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Flow" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GithubPost" (
	"id" bigint PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"type" text NOT NULL,
	"githubId" bigint NOT NULL,
	"repositoryOwner" text NOT NULL,
	"repositoryName" text NOT NULL,
	"channelId" text NOT NULL,
	"postId" text NOT NULL,
	CONSTRAINT "GithubPost_postId_unique" UNIQUE("postId"),
	CONSTRAINT "GithubPost_platform_channelId_type_githubId_unique" UNIQUE("platform","channelId","type","githubId")
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
CREATE TABLE IF NOT EXISTS "LinkBackup" (
	"id" bigint PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"updatedAt" timestamp,
	"dataVersion" text NOT NULL,
	"data" json NOT NULL,
	"previewImageUrl" text,
	"ownerId" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MessageLogEntry" (
	"id" bigint PRIMARY KEY NOT NULL,
	"type" text,
	"webhookId" text NOT NULL,
	"discordGuildId" bigint,
	"guildedServerId" text,
	"channelId" text NOT NULL,
	"messageId" text NOT NULL,
	"threadId" text,
	"userId" bigint,
	"notifiedEveryoneHere" boolean DEFAULT false,
	"notifiedRoles" json,
	"notifiedUsers" json,
	"hasContent" boolean DEFAULT false,
	"embedCount" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OAuthInfo" (
	"id" bigint PRIMARY KEY NOT NULL,
	"discordId" bigint,
	"guildedId" text,
	"botId" bigint,
	"accessToken" text NOT NULL,
	"refreshToken" text,
	"scope" json NOT NULL,
	"expiresAt" timestamp NOT NULL,
	CONSTRAINT "OAuthInfo_discordId_unique" UNIQUE("discordId"),
	CONSTRAINT "OAuthInfo_guildedId_unique" UNIQUE("guildedId"),
	CONSTRAINT "OAuthInfo_botId_unique" UNIQUE("botId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ShareLink" (
	"id" bigint PRIMARY KEY NOT NULL,
	"shareId" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"origin" text,
	"userId" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Token" (
	"id" bigint PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"prefix" text NOT NULL,
	"userId" bigint,
	"expiresAt" timestamp NOT NULL,
	"lastUsedAt" timestamp,
	"lastUsedCountry" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Trigger" (
	"id" bigint PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"event" integer NOT NULL,
	"discordGuildId" bigint,
	"guildedServerId" text,
	"flowId" bigint NOT NULL,
	"updatedById" bigint,
	"updatedAt" timestamp,
	"disabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"firstSubscribed" timestamp,
	"subscribedSince" timestamp,
	"subscriptionExpiresAt" timestamp,
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
	"userId" bigint,
	"discordGuildId" bigint,
	"guildedServerId" text,
	CONSTRAINT "Webhook_platform_id_unique" UNIQUE("platform","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "autopublish" (
	"channel_id" bigint NOT NULL,
	"added_by_id" bigint,
	"ignore" text
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
CREATE TABLE IF NOT EXISTS "message_settings" (
	"guild_id" bigint,
	"channel_id" bigint,
	"message_id" bigint NOT NULL,
	"max_roles" integer
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
DO $$ BEGIN
 ALTER TABLE "Backup" ADD CONSTRAINT "Backup_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CustomBot" ADD CONSTRAINT "CustomBot_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CustomBot" ADD CONSTRAINT "CustomBot_guildId_DiscordGuild_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."DiscordGuild"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordGuild_to_Backup" ADD CONSTRAINT "DiscordGuild_to_Backup_discordGuildId_DiscordGuild_id_fk" FOREIGN KEY ("discordGuildId") REFERENCES "public"."DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordGuild_to_Backup" ADD CONSTRAINT "DiscordGuild_to_Backup_backupId_Backup_id_fk" FOREIGN KEY ("backupId") REFERENCES "public"."Backup"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMember" ADD CONSTRAINT "DiscordMember_userId_DiscordUser_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."DiscordUser"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMember" ADD CONSTRAINT "DiscordMember_guildId_DiscordGuild_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DMC_to_Flow" ADD CONSTRAINT "DMC_to_Flow_dmcId_DiscordMessageComponent_id_fk" FOREIGN KEY ("dmcId") REFERENCES "public"."DiscordMessageComponent"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DMC_to_Flow" ADD CONSTRAINT "DMC_to_Flow_flowId_Flow_id_fk" FOREIGN KEY ("flowId") REFERENCES "public"."Flow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction_roles" ADD CONSTRAINT "reaction_roles_guild_id_DiscordGuild_id_fk" FOREIGN KEY ("guild_id") REFERENCES "public"."DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordRoles" ADD CONSTRAINT "DiscordRoles_guildId_DiscordGuild_id_fk" FOREIGN KEY ("guildId") REFERENCES "public"."DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Action" ADD CONSTRAINT "Action_flowId_Flow_id_fk" FOREIGN KEY ("flowId") REFERENCES "public"."Flow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "LinkBackup" ADD CONSTRAINT "LinkBackup_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MessageLogEntry" ADD CONSTRAINT "MessageLogEntry_discordGuildId_DiscordGuild_id_fk" FOREIGN KEY ("discordGuildId") REFERENCES "public"."DiscordGuild"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MessageLogEntry" ADD CONSTRAINT "MessageLogEntry_guildedServerId_GuildedServer_id_fk" FOREIGN KEY ("guildedServerId") REFERENCES "public"."GuildedServer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_flowId_Flow_id_fk" FOREIGN KEY ("flowId") REFERENCES "public"."Flow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
