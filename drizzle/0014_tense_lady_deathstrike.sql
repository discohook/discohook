ALTER TABLE "GithubPost" DROP CONSTRAINT "GithubPost_channelId_githubId_unique";--> statement-breakpoint
ALTER TABLE "GithubPost" ALTER COLUMN "githubId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "GithubPost" ADD CONSTRAINT "GithubPost_platform_channelId_type_githubId_unique" UNIQUE("platform","channelId","type","githubId");