CREATE TABLE IF NOT EXISTS "DiscordMessageComponent_to_Flow" (
	"discordMessageComponentId" bigint NOT NULL,
	"flowId" bigint NOT NULL,
	CONSTRAINT "DiscordMessageComponent_to_Flow_discordMessageComponentId_flowId_pk" PRIMARY KEY("discordMessageComponentId","flowId")
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
ALTER TABLE "Triggers" RENAME TO "Trigger";--> statement-breakpoint
ALTER TABLE "Trigger" RENAME COLUMN "flow" TO "flowId";--> statement-breakpoint
ALTER TABLE "Trigger" ALTER COLUMN "flowId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "Trigger" ALTER COLUMN "flowId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "DiscordMessageComponent" ADD COLUMN "type" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMessageComponent_to_Flow" ADD CONSTRAINT "DiscordMessageComponent_to_Flow_discordMessageComponentId_DiscordMessageComponent_id_fk" FOREIGN KEY ("discordMessageComponentId") REFERENCES "public"."DiscordMessageComponent"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DiscordMessageComponent_to_Flow" ADD CONSTRAINT "DiscordMessageComponent_to_Flow_flowId_Flow_id_fk" FOREIGN KEY ("flowId") REFERENCES "public"."Flow"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_flowId_Flow_id_fk" FOREIGN KEY ("flowId") REFERENCES "public"."Flow"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Trigger" DROP COLUMN IF EXISTS "ignoreBots";