import z from "zod/v3";

const DiscordWebhookProxyEndpoints = z.object({
  /**
   * https://discord.dev/resources/webhook#get-webhook-with-token
   *
   * This endpoint is not disallowable, and currently specifies no options
   */
  get_webhook_with_token: z.record(z.string(), z.never()).optional(),
  /** https://discord.dev/resources/webhook#modify-webhook-with-token */
  modify_webhook_with_token: z
    .object({
      allowed: z.boolean().optional(),
      /**
       * If true, clients may pass `channel_id` to change the webhook channel
       * through the token-authenticated endpoint. The server will need to use
       * its bot token to call Modify Webhook, as `channel_id` is not normally
       * allowed to the webhook-token-authenticated endpoint.
       *
       * Remember also that appropriately permission-laden users may change
       * the channel of an application-owned webhook without the
       * application's approval.
       */
      channel_id_allowed: z.boolean().optional(),
    })
    .optional(),
  /**
   * https://discord.dev/resources/webhook#delete-webhook-with-token
   *
   * Implementations may choose to treat this as a way to invalidate the
   * proprietary token (if applicable), rather than actually deleting the
   * underlying webhook. It makes no difference to clients, unless the
   * webhook is user-owned and may be fetched outside the path of its
   * proprietary token (in which case there is no purpose to using such a
   * token).
   */
  delete_webhook_with_token: z
    .object({
      allowed: z.boolean().optional(),
    })
    .optional(),
  /**
   * https://discord.dev/resources/webhook#execute-webhook
   *
   * This endpoint is not disallowable, and currently specifies no options.
   *
   * Currently, servers must pass through body content and URL parameters as
   * given.
   */
  execute_webhook: z.record(z.string(), z.never()).optional(),
  /** https://discord.dev/resources/webhook#execute-slack-compatible-webhook */
  execute_slack_compatible_webhook: z
    .object({
      allowed: z.boolean().optional(),
    })
    .optional(),
  /** https://discord.dev/resources/webhook#execute-github-compatible-webhook */
  execute_github_compatible_webhook: z
    .object({
      allowed: z.boolean().optional(),
    })
    .optional(),
  /** https://discord.dev/resources/webhook#get-webhook-message */
  get_webhook_message: z
    .object({
      allowed: z.boolean().optional(),
    })
    .optional(),
  /** https://discord.dev/resources/webhook#edit-webhook-message */
  edit_webhook_message: z
    .object({
      allowed: z.boolean().optional(),
    })
    .optional(),
  /** https://discord.dev/resources/webhook#delete-webhook-message */
  delete_webhook_message: z
    .object({
      allowed: z.boolean().optional(),
    })
    .optional(),
});

// not totally finalized yet
export const DiscordWebhookProxySchema = z.object({
  /** Version of the data */
  version: z.literal(1),
  /**
   * If true, webhook tokens provided by the server may not be used with
   * Discord's native webhook endpoints, and the server also does not accept
   * Discord-generated webhook tokens.
   */
  tokens_proprietary: z.boolean().optional(),
  endpoints: DiscordWebhookProxyEndpoints,
  /**
   * Whether the current (requesting) origin is allowed by all endpoints
   * according to the server's CORS policy. Currently, the schema does not
   * support per-endpoint CORS modifications.
   */
  cors_origin_allowed: z.boolean(),
  /**
   * Maximum total body size allowed by the server. This is used by clients
   * to prevent HTTP 413 errors by sending files that are too large, even if
   * they are within the attachment size limit for the channel. Generally,
   * servers should allow request sizes up to the maximum possible for a
   * single message request directly to Discord.
   *
   * If this property is not specified, clients should assume the server is
   * able to handle the maximum body size.
   */
  max_body_size: z.number().optional(),
});

export type DiscordWebhookProxySchema = z.infer<
  typeof DiscordWebhookProxySchema
>;

export const allowedOrigins: string[] = [];

export const getAlternateHostConfiguration = async (
  origin: string,
): Promise<DiscordWebhookProxySchema | null> => {
  if (!allowedOrigins.includes(origin)) return null;
  const res = await fetch(
    new URL("/.well-known/discord-webhook-proxy", origin),
    { method: "GET" },
  );
  if (res.ok) {
    const body = await DiscordWebhookProxySchema.parseAsync(await res.json());
    if (!body.cors_origin_allowed) {
      throw Error(
        "The current origin is not allowed by the alternate host according to its advertised configuration.",
      );
    }
    return body;
  }
  return null;
};
