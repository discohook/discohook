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
ALTER TABLE "DiscordMember" ALTER COLUMN "permissions" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "DiscordMember" ADD COLUMN "owner" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
