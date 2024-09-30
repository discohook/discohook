CREATE TABLE IF NOT EXISTS "UserToWebhook" (
	"userId" bigint NOT NULL,
	"webhookPlatform" text NOT NULL,
	"webhookId" text NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	CONSTRAINT "UserToWebhook_userId_webhookPlatform_webhookId_unique" UNIQUE("userId","webhookPlatform","webhookId")
);
--> statement-breakpoint
ALTER TABLE "DiscordMember" ADD COLUMN "favorite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserToWebhook" ADD CONSTRAINT "UserToWebhook_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserToWebhook" ADD CONSTRAINT "UserToWebhook_fk" FOREIGN KEY ("webhookPlatform","webhookId") REFERENCES "public"."Webhook"("platform","id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
