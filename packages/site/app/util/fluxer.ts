import { type BaseImageURLOptions, RequestMethod } from "@discordjs/rest";
import type { DraftFile } from "~/routes/_index";
import type {
  FluxerRESTGetAPIWebhookWithTokenResult,
  FluxerRESTPatchAPIWebhookWithTokenJSONBody,
  FluxerRESTPatchAPIWebhookWithTokenResult,
  FluxerRESTPostAPIWebhookWithTokenJSONBody,
  FluxerRESTPostAPIWebhookWithTokenWaitResult,
} from "~/types/fluxer";
import { createFakeWaveform } from "./discord";
import { sleep } from "./time";

export const FLUXER_API = "https://api.fluxer.app";
export const FLUXER_API_V = "1";
export const FLUXER_MEDIA = "https://fluxerusercontent.com";
export const FLUXER_STATIC = "https://fluxerstatic.com";

export const fluxerRequest = async <T>(
  method: RequestMethod,
  route: `/${string}`,
  options?: {
    query?: URLSearchParams;
    files?: DraftFile[];
    init?: Omit<RequestInit, "method">;
  },
): Promise<T> => {
  const search = options?.query ? `?${options.query.toString()}` : "";
  const init = options?.init ?? {};
  const headers = init.headers ? new Headers(init.headers) : new Headers();

  let body: BodyInit | null | undefined;
  if (options?.files && options?.files.length !== 0) {
    // Browser must set this header on its own along with `boundary`
    headers.delete("Content-Type");

    body = new FormData();
    const payload = options.init?.body
      ? JSON.parse(options.init?.body?.toString())
      : {};
    body.set("payload_json", JSON.stringify(payload));

    let i = 0;
    for (const { file } of options.files) {
      body.append(`files[${i}]`, file, file.name);
      i += 1;
    }
  } else {
    body = init.body;
  }

  let tries = 0;
  while (tries < 5) {
    tries += 1;
    const response = await fetch(
      `${FLUXER_API}/v${FLUXER_API_V}${route}${search}`,
      { method, ...init, headers, body },
    );
    // TODO: bucket cache to prevent 429s entirely
    const rHeaders = response.headers;
    if (response.status === 429) {
      const bucket = rHeaders.get("X-RateLimit-Bucket");
      const resetAfter = Number(
        rHeaders.get("X-RateLimit-Reset-After") || rHeaders.get("Reset-After"),
      );
      if (!Number.isNaN(resetAfter) && resetAfter > 0) {
        console.log(
          `Rate limited on bucket ${bucket} for ${resetAfter}s (waiting). ${tries}/5`,
        );
        await sleep(Math.max(1, resetAfter) * 1000 + tries);
        continue;
      }
    }
    if (response.status === 204) return null as T;
    return (await response.json()) as T;
  }
  throw Error(`Failed to receive a good response for ${method} ${route}`);
};

export const getFluxerWebhook = async (id: string, token: string) => {
  const data = await fluxerRequest<FluxerRESTGetAPIWebhookWithTokenResult>(
    RequestMethod.Get,
    `/webhooks/${id}/${token}`,
  );
  return data;
};

export const updateFluxerWebhook = async (
  id: string,
  token: string,
  payload: FluxerRESTPatchAPIWebhookWithTokenJSONBody,
) => {
  const data = await fluxerRequest<FluxerRESTPatchAPIWebhookWithTokenResult>(
    RequestMethod.Patch,
    `/webhooks/${id}/${token}`,
    {
      init: {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      },
    },
  );
  return data;
};

export const deleteFluxerWebhook = async (id: string, token: string) => {
  await fluxerRequest<null>(RequestMethod.Delete, `/webhooks/${id}/${token}`);
};

export const executeFluxerWebhook = async (
  webhookId: string,
  webhookToken: string,
  payload: FluxerRESTPostAPIWebhookWithTokenJSONBody,
  files?: DraftFile[],
) => {
  const query = new URLSearchParams({ wait: "true" });

  if (files && !payload.attachments) {
    payload.attachments = files.map((file, i) => ({
      id: i,
      description: file.description,
      filename: file.file.name,
      flags: file.spoiler ? 8 : 0,
      // Voice messages
      ...(file.duration_secs !== undefined
        ? {
            duration: Math.floor(file.duration_secs),
            waveform: createFakeWaveform(),
          }
        : {}),
    }));
  }

  const data = await fluxerRequest<FluxerRESTPostAPIWebhookWithTokenWaitResult>(
    RequestMethod.Post,
    `/webhooks/${webhookId}/${webhookToken}`,
    {
      query,
      files,
      init: {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type":
            files && files.length > 0
              ? "multipart/form-data"
              : "application/json",
        },
      },
    },
  );

  return data;
};

// Doesn't look like fluxer supports message operations via webhooks atm
// export const getFluxerWebhookMessage = async (
//   webhookId: string,
//   webhookToken: string,
//   messageId: string,
//   threadId?: string,
// ) => {
//   const query = threadId
//     ? new URLSearchParams({ thread_id: threadId })
//     : undefined;
//   const data = await fluxerRequest<FluxerRESTGetAPIWebhookWithTokenMessageResult>(
//     RequestMethod.Get,
//     `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
//     { query },
//   );
//   return data;
// };

// from CDN._withOpts, fortunately exactly compatible
const fluxerMediaWithOpts = (
  options: BaseImageURLOptions | undefined,
  defaultSize?: BaseImageURLOptions["size"],
): string => {
  const params = new URLSearchParams({
    size: String(options?.size ?? defaultSize ?? 1024),
  });
  if (options?.extension === "gif") {
    options.extension = "webp";
    params.set("animated", "true");
  }
  return `.${options?.extension ?? "webp"}?${params}`;
};

// id % default avatar count, no bitshifting like with discord
const getDefaultAvatarIndex = (id: string): number => Number(BigInt(id) % 5n);

export const fluxerDefaultAvatarUrl = (snowflake: string) =>
  `${FLUXER_STATIC}/avatars/${getDefaultAvatarIndex(snowflake)}.png`;

export const fluxerWebhookAvatarUrl = (
  webhook: { id: string; avatar: string | null },
  options?: BaseImageURLOptions,
): string => {
  if (webhook.avatar) {
    return `${FLUXER_MEDIA}/avatars/${webhook.id}/${webhook.avatar}${fluxerMediaWithOpts(options)}`;
  } else {
    return fluxerDefaultAvatarUrl(webhook.id);
  }
};
