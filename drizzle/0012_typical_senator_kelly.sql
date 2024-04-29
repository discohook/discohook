ALTER TABLE "CustomBot" DROP CONSTRAINT "CustomBot_ownerId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_User_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CustomBot" ADD CONSTRAINT "CustomBot_ownerId_User_id_fk" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
