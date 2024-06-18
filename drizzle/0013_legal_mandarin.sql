CREATE TABLE IF NOT EXISTS "GithubPost" (
	"id" bigint PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"type" text NOT NULL,
	"githubId" integer NOT NULL,
	"repositoryOwner" text NOT NULL,
	"repositoryName" text NOT NULL,
	"channelId" text NOT NULL,
	"postId" text NOT NULL,
	CONSTRAINT "GithubPost_postId_unique" UNIQUE("postId"),
	CONSTRAINT "GithubPost_channelId_githubId_unique" UNIQUE("channelId","githubId")
);
--> statement-breakpoint
ALTER TABLE "OAuthInfo" ADD COLUMN "botId" bigint;--> statement-breakpoint
ALTER TABLE "OAuthInfo" ADD CONSTRAINT "OAuthInfo_botId_unique" UNIQUE("botId");