import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  type RESTGetAPIWebhookWithTokenResult,
  type RESTPostAPIWebhookWithTokenJSONBody,
  type RESTPostAPIWebhookWithTokenWaitResult,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import { z } from "zod";
import { getDb, githubPosts } from "~/store.server";
import type { ActionArgs } from "~/util/loader";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";

type GitHubType = (typeof githubPosts)["type"]["_"]["data"];

const GitHubResource = z.object({
  id: z.number().int(),
  title: z.string(),
  number: z.number().int(),
});

const GitHubRepository = z.object({
  id: z.number().int(),
  name: z.string(),
  owner: z.object({
    login: z.string(),
  }),
});

export const action = async ({ request, context, params }: ActionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Method not allowed" }, 405);
  }
  const ua = request.headers.get("User-Agent");
  if (!ua?.startsWith("GitHub-Hookshot/")) {
    throw json({ message: "Invalid user agent." }, 400);
  }
  const ct = request.headers.get("Content-Type");
  if (!ct?.startsWith("application/json")) {
    throw json({ message: "Invalid content type." }, 400);
  }
  const eventType = request.headers.get("X-GitHub-Event");
  if (
    !eventType ||
    ![
      // create a new post
      "issues",
      "pull_request",
      "discussion",
      // "push",
      // redirect to discord
      "issue_comment",
      "pull_request_review",
      "pull_request_review_comment",
      "discussion_comment",
      // "commit_comment",
    ].includes(eventType)
  ) {
    throw json({ message: "Unsupported event." }, 400);
  }

  const { webhookId, webhookToken } = zxParseParams(params, {
    webhookId: snowflakeAsString().transform(String),
    webhookToken: z.string(),
  });

  let githubType: GitHubType | undefined;
  let githubId: bigint | undefined;
  let title: string | undefined;
  let repository: z.infer<typeof GitHubRepository> | undefined;
  switch (eventType) {
    case "issues":
    case "issue_comment": {
      const payload = await zxParseJson(request.clone(), {
        issue: GitHubResource,
        repository: GitHubRepository,
      });
      repository = payload.repository;
      githubType = "issue";
      githubId = BigInt(payload.issue.id);
      if (eventType === "issues") {
        title = `[issues/${payload.issue.number}] ${payload.issue.title}`;
      }
      break;
    }
    case "pull_request":
    case "pull_request_review":
    case "pull_request_review_comment": {
      const payload = await zxParseJson(request.clone(), {
        pull_request: GitHubResource,
        repository: GitHubRepository,
      });
      repository = payload.repository;
      githubType = "pull";
      githubId = BigInt(payload.pull_request.id);
      if (eventType === "pull_request") {
        title = `[pulls/${payload.pull_request.number}] ${payload.pull_request.title}`;
      }
      break;
    }
    case "discussion":
    case "discussion_comment": {
      const payload = await zxParseJson(request.clone(), {
        discussion: GitHubResource,
        repository: GitHubRepository,
      });
      repository = payload.repository;
      githubType = "discussion";
      githubId = BigInt(payload.discussion.id);
      if (eventType === "discussion") {
        title = `[discussions/${payload.discussion.number}] ${payload.discussion.title}`;
      }
      break;
    }
    default:
      break;
  }
  if (githubId === undefined || !githubType || !repository) {
    throw json({ message: "Could not resolve resource details" }, 404);
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  const webhook = (await rest.get(
    Routes.webhook(webhookId, webhookToken),
  )) as RESTGetAPIWebhookWithTokenResult;

  const db = getDb(context.env.HYPERDRIVE);
  const extantPost = await db.query.githubPosts.findFirst({
    where: (githubPosts, { and, eq }) =>
      and(
        eq(githubPosts.platform, "discord"),
        eq(githubPosts.channelId, webhook.channel_id),
        eq(githubPosts.type, githubType),
        eq(githubPosts.githubId, githubId),
      ),
  });

  // `title` check ensures new posts will only be created for "top level"
  // issue/pr/discussion events. `extantPost` check eliminates duplicates.
  if (title && !extantPost) {
    request.headers.set("User-Agent", "Discohook");
    const response = await fetch(
      `https://guilded.shayy.workers.dev/raw/github?${new URLSearchParams({
        reactions: "false",
      })}`,
      request,
    );
    if (!response.ok) {
      return response;
    }

    // TODO: create custom "display" embed for the thread starter message and
    // store its ID. It gets updated throughout the lifetime of the issue.
    const data = (await response.json()) as Pick<
      RESTPostAPIWebhookWithTokenJSONBody,
      "content" | "embeds" | "username" | "avatar_url"
    >;
    // Just create the post using our GWP data, once we have the ID we can send
    // Discord a GitHub request and utilize their own formatting that users are
    // more familiar with.
    const message = (await rest.post(Routes.webhook(webhookId, webhookToken), {
      body: { ...data, thread_name: title.slice(0, 100) },
      query: new URLSearchParams({
        wait: "true",
      }),
    })) as RESTPostAPIWebhookWithTokenWaitResult;

    await db
      .insert(githubPosts)
      .values({
        platform: "discord",
        type: githubType,
        githubId,
        channelId: webhook.channel_id,
        postId: message.channel_id,
        repositoryOwner: repository.owner.login,
        repositoryName: repository.name,
      })
      // Possible race condition
      .onConflictDoNothing();

    return message;
  } else if (extantPost) {
    const response = await fetch(
      `${RouteBases.api}${Routes.webhook(
        webhookId,
        webhookToken,
      )}/github?${new URLSearchParams({
        thread_id: extantPost.postId,
        wait: "true",
      })}`,
      request,
    );
    return response;
  }

  throw json({ message: "No path" }, 400);
};
