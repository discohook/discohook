ALTER TABLE "Backup" ADD COLUMN "importedFromOrg" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "DiscordMember" ADD COLUMN "permissions" text DEFAULT '0';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Backup" ADD CONSTRAINT "Backup_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "LinkBackup" ADD CONSTRAINT "LinkBackup_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
