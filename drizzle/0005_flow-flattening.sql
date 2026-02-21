ALTER TABLE "Trigger" ALTER COLUMN "platform" SET DEFAULT 'discord';--> statement-breakpoint
ALTER TABLE "Trigger" ALTER COLUMN "flowId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Trigger" ADD COLUMN "flow" json;