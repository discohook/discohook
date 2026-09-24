import type { DiscordErrorData, REST } from "@discordjs/rest";
import {
  type APIEmbed,
  type APIMessage,
  type APIWebhook,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { BitField, MessageFlagsBitField } from "discord-bitflag";
import type { DraftFile } from "~/routes/_index";
import type { FluxerAPIWebhook } from "~/types/fluxer";
import type { QueryData } from "~/types/QueryData";
import { TargetType } from "~/types/QueryData-raw";
import { MESSAGE_REF_RE } from "~/util/constants";
import {
  DraftRawFile,
  executeWebhook,
  hasCustomId,
  isActionRow,
  isComponentsV2,
  isSnowflakeSafe,
  onlyActionRows,
  updateWebhookMessage,
} from "~/util/discord";
import { executeFluxerWebhook } from "~/util/fluxer";

export type SubmitMessageResult =
  | {
      status: "success";
      data: APIMessage;
    }
  | {
      status: "error";
      data: DiscordErrorData;
    };

export type MinimalTarget =
  | {
      type: TargetType.Webhook;
      webhook: Pick<APIWebhook, "id" | "token" | "application_id">;
    }
  | {
      type: TargetType.FluxerWebhook;
      webhook: Pick<FluxerAPIWebhook, "id" | "token">;
    };

export const submitMessage = async (
  target: MinimalTarget,
  message: QueryData["messages"][number],
  files?: DraftFile[],
  rest?: REST,
  orThreadId?: string,
): Promise<SubmitMessageResult> => {
  const token = target.webhook.token;
  if (!token) {
    return {
      status: "error",
      data: {
        code: -1,
        message: "No webhook token was provided.",
      },
    };
  }

  const newFiles: DraftRawFile[] = [...(files ?? [])].map((f) => ({
    ...f,
    key: `files[${f.id}]`,
  }));
  await Promise.all(
    (message.data.attachments ?? []).map((attachment) =>
      (async () => {
        // We're already providing data, don't bother checking anything else
        const file = files?.find((f) => f.id === attachment.id);
        if (file) return;

        if (attachment.url && !attachment.url.startsWith("blob:")) {
          // References to this attachment will be replaced with the plain
          // URL, so we do not need to download it
          if (attachment.placement_count) return;

          if (
            attachment.id.length >= 18 &&
            isSnowflakeSafe(attachment.id) &&
            message.reference
          ) {
            // This is probably already an attachment on the message and so we
            // don't need to provide data with it
            return;
          }

          let res: Response;
          try {
            res = await fetch(attachment.url);
          } catch (e) {
            return {
              status: "error",
              data: {
                code: -1,
                message: `Failed to fetch the remote attachment at ${attachment.url}`,
                errors: { message: String(e instanceof Error ? e.message : e) },
              },
            };
          }
          const contentType = res.headers.get("Content-Type")?.split(";")[0];
          if (!res.ok) {
            // The preview will still display non-OK media because browsers are
            // fine with it. Perform a superficial check to make sure the returned
            // content is at least not a completely different type of data, like text.
            // Usually, this will not even happen, because the response won't have
            // included appropriate CORS headers for this script-initiated request.
            // To solve that, I wanted to draw the <img/> on a canvas and save the
            // canvas to a data URL, but I felt that was entirely too complicated
            // for the edge case of reading images served with a bad response.
            const prefix = attachment.content_type?.split("/")?.[0];
            if (!prefix || !contentType?.startsWith(prefix)) {
              return {
                status: "error",
                data: {
                  code: -1,
                  message: `Recevied HTTP ${res.status} for attachment ${attachment.filename} via ${attachment.url}`,
                },
              };
            }
          }

          const blob = await res.blob();
          newFiles.push({
            id: attachment.id,
            file: new File([blob], attachment.filename, {
              type: contentType ?? attachment.content_type,
            }),
            key: `files[${attachment.id}]`,
          });
        }
      })(),
    ),
  );

  switch (target.type) {
    case TargetType.Webhook: {
      const { webhook } = target;
      // `with_components` is `true` when:
      // - the webhook is not owned by an application, and
      // - there are components, and
      // - the message is using components v2 (required), or there are
      //   only non-actionable components (link buttons)
      // and `undefined` otherwise (let default behavior take over)
      const withComponents = webhook.application_id
        ? undefined
        : ((): true | undefined => {
            if (!message.data.components) return;
            // The param is required for Components V2 messages
            if (isComponentsV2(message.data)) {
              return true;
            }
            for (const row of onlyActionRows(message.data.components)) {
              for (const child of row.components) {
                // Any child encountered that is not a link
                // button (a V1 non-actionable component)
                if (
                  !(
                    child.type === ComponentType.Button &&
                    child.style === ButtonStyle.Link
                  )
                ) {
                  return;
                }
              }
            }
            return true;
          })();

      let data: APIMessage | DiscordErrorData;
      const components = message.data.components
        ? structuredClone(message.data.components).map((component) => {
            // Remove tracking IDs to avoid error from Discord.
            // We should really just use a custom prop instead.
            if (isActionRow(component)) {
              for (const child of component.components) {
                if (!hasCustomId(child)) {
                  child.custom_id = undefined;
                }
              }
              // TODO: unnecessary duplication, reduce
            } else if (component.type === ComponentType.Container) {
              for (const child of component.components) {
                if (isActionRow(child)) {
                  for (const subChild of child.components) {
                    if (!hasCustomId(subChild)) {
                      subChild.custom_id = undefined;
                    }
                  }
                } else if (
                  child.type === ComponentType.Section &&
                  child.accessory.type === ComponentType.Button &&
                  !hasCustomId(child.accessory)
                ) {
                  // @ts-expect-error
                  child.accessory.custom_id = undefined;
                }
              }
            } else if (
              component.type === ComponentType.Section &&
              component.accessory.type === ComponentType.Button &&
              !hasCustomId(component.accessory)
            ) {
              // @ts-expect-error
              component.accessory.custom_id = undefined;
            }
            return component;
          })
        : [];

      if (message.reference) {
        const match = message.reference.match(MESSAGE_REF_RE);
        if (!match) {
          throw Error(`Invalid message reference: ${message.reference}`);
        }
        data = await updateWebhookMessage(
          webhook.id,
          token,
          match[3],
          {
            content: message.data.content?.trim() ?? "",
            embeds:
              message.data.embeds?.map((e) => {
                e.color = e.color ?? undefined;
                return e as APIEmbed;
              }) ?? [],
            components,
            flags: message.data.flags,
            allowed_mentions: message.data.allowed_mentions,
          },
          {
            files: newFiles,
            attachments: message.data.attachments,
            threadId: message.thread_id ?? orThreadId,
            rest,
            withComponents,
          },
        );
      } else {
        const threadName = message.data.thread_name?.trim();
        data = await executeWebhook(
          webhook.id,
          token,
          {
            username: message.data.username ?? message.data.author?.name,
            avatar_url:
              message.data.avatar_url ?? message.data.author?.icon_url,
            content: message.data.content?.trim() ?? "",
            embeds:
              message.data.embeds?.map((e) => {
                e.color = e.color ?? undefined;
                return e as APIEmbed;
              }) ?? [],
            components,
            flags: message.data.flags,
            thread_name: threadName || undefined,
            allowed_mentions: message.data.allowed_mentions,
          },
          {
            files: newFiles,
            attachments: message.data.attachments,
            threadId: threadName
              ? undefined
              : (message.thread_id ?? orThreadId),
            rest,
            withComponents,
          },
        );
      }
      return {
        status: "code" in data ? "error" : "success",
        data: "code" in data ? (data as unknown as DiscordErrorData) : data,
      } as SubmitMessageResult;
    }
    case TargetType.FluxerWebhook: {
      const { webhook } = target;
      const flags = new BitField();
      const originalFlags = new MessageFlagsBitField(message.data.flags ?? 0);
      if (originalFlags.has(MessageFlags.SuppressEmbeds)) {
        flags.add(MessageFlags.SuppressEmbeds);
      }
      if (originalFlags.has(MessageFlags.SuppressNotifications)) {
        flags.add(MessageFlags.SuppressNotifications);
      }
      if (originalFlags.has(MessageFlags.IsVoiceMessage)) {
        flags.add(MessageFlags.IsVoiceMessage);
      }

      const data = await executeFluxerWebhook(
        webhook.id,
        token,
        {
          username: message.data.username ?? message.data.author?.name,
          avatar_url: message.data.avatar_url ?? message.data.author?.icon_url,
          content: message.data.content?.trim() ?? "",
          embeds:
            message.data.embeds?.map((e) => {
              e.color = e.color ?? undefined;
              return e as APIEmbed;
            }) ?? [],
          flags: Number(flags.value),
        },
        { files: newFiles, attachments: message.data.attachments },
      );

      return {
        status: "code" in data ? "error" : "success",
        // not actually DiscordErrorData but roughly compatible
        data: "code" in data ? (data as unknown as DiscordErrorData) : data,
      } as SubmitMessageResult;
    }
    default:
      break;
  }
  return {
    status: "error",
    data: {
      code: 0,
      message: "Incompatble target type used with submitMessage",
    },
  };
};
