CREATE TABLE IF NOT EXISTS "CustomBot" (
	"id" bigint PRIMARY KEY NOT NULL,
	"applicationId" bigint NOT NULL,
	"applicationUserId" bigint,
	"icon" text,
	"publicKey" text NOT NULL,
	"token" text,
	"name" text NOT NULL,
	"ownerId" bigint NOT NULL,
	"guildId" bigint,
	CONSTRAINT "CustomBot_applicationId_unique" UNIQUE("applicationId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CustomBot" ADD CONSTRAINT "CustomBot_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CustomBot" ADD CONSTRAINT "CustomBot_guildId_DiscordGuild_id_fk" FOREIGN KEY ("guildId") REFERENCES "DiscordGuild"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
