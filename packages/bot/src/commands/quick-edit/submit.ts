import {
  type APIEmbed,
  type APIEmbedField,
  type APIInteractionResponse,
  type APIMessage,
  type APIMessageComponentButtonInteraction,
  type APIMessageComponentSelectMenuInteraction,
  type APIModalSubmitInteraction,
  type APIWebhook,
  ComponentType,
  PermissionFlagsBits,
  type RESTPatchAPIWebhookWithTokenMessageJSONBody,
  Routes,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import {
  type APIMessageReducedWithId,
  cacheMessage,
  getchMessage,
} from "store";
import type { ButtonCallback, ModalCallback } from "../../components.js";
import {
  type InteractionContext,
  isInteractionResponse,
} from "../../interactions.js";
import { parseAutoComponentId, textDisplay } from "../../util/components.js";
import { isDiscordError } from "../../util/error.js";
import { getWebhook } from "../webhooks/webhookInfo.js";
import {
  getQuickEditContainerContainer,
  getQuickEditEmbedContainer,
  getQuickEditMediaGalleryItemContainer,
  getQuickEditSectionContainer,
  getQuickEditSeparatorContainer,
  missingElement,
} from "./entry.js";
import { getQuickEditComponentByPath } from "./open.js";

const submitWebhookMessageEdit = async (
  ctx: InteractionContext,
  webhook: APIWebhook,
  message: Pick<APIMessage, "id" | "position" | "channel_id">,
  body: RESTPatchAPIWebhookWithTokenMessageJSONBody,
  after: (updated: APIMessage) => Promise<void>,
): Promise<[APIInteractionResponse, () => Promise<void>]> => {
  return [
    ctx.defer(),
    async () => {
      let updated: APIMessage;
      try {
        updated = (await ctx.rest.patch(
          // biome-ignore lint/style/noNonNullAssertion: this should have been verified previously
          Routes.webhookMessage(webhook.id, webhook.token!, message.id),
          {
            body,
            query:
              message.position !== undefined
                ? new URLSearchParams({ thread_id: message.channel_id })
                : undefined,
          },
        )) as APIMessage;
      } catch (e) {
        if (isDiscordError(e)) {
          await ctx.followup.send({
            content: `Discord rejected the edit: **${
              e.rawError.message
            }**\`\`\`json\n${JSON.stringify(e.rawError)}\`\`\``,
            ephemeral: true,
          });
        }
        throw e;
      }

      // https://github.com/discord/discord-api-docs/issues/7570
      if (updated.position !== message.position) {
        updated.position = message.position;
      }

      // Re-cache the message so subsequent edits use the newest version of
      // the message. Cached with a shorter TTL than normal.
      await cacheMessage(ctx.env, updated, webhook.guild_id, 600);
      await after(updated);
    },
  ];
};

const verifyWebhookMessageEditPermissions = async (
  ctx: InteractionContext,
  channelId: string,
  messageId: string,
) => {
  const message = await getchMessage(ctx.rest, ctx.env, channelId, messageId, {
    guildId: ctx.interaction.guild_id,
  });
  if (!message.webhook_id) {
    throw ctx.reply({
      content: "Somehow, this isn't a webhook message.",
      ephemeral: true,
    });
  }

  const webhook = await getWebhook(
    message.webhook_id,
    ctx.env,
    message.application_id,
  );
  if (
    !webhook.guild_id ||
    webhook.guild_id !== ctx.interaction.guild_id ||
    !ctx.userPermissons.has(
      PermissionFlagsBits.ManageWebhooks,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ReadMessageHistory,
    )
  ) {
    throw ctx.reply({
      content:
        "You don't have the appropriate permissions to edit webhook messages.",
      ephemeral: true,
    });
  }
  if (!webhook.token) {
    throw ctx.reply({
      content: "The webhook's token was inaccessible.",
      ephemeral: true,
    });
  }
  return { message, webhook };
};

const modifyEmbedByPath = (embed: APIEmbed, path: string, value: string) => {
  const [part, subPart] = path.split(".");

  switch (part) {
    case "author":
      if (subPart === "name" && !value) {
        // Remove author
        embed.author = undefined;
      } else {
        embed.author = embed.author ?? { name: "" };
        embed.author[subPart as "name" | "icon_url" | "url"] = value;
      }
      break;
    case "title":
    case "url":
    case "description":
      embed[part] = value || undefined;
      break;
    case "thumbnail":
    case "image":
      if (subPart === "url") {
        embed[part] = embed[part] ?? { url: "" };
        embed[part].url = value;
      }
      break;
    case "fields": {
      embed.fields = embed.fields ?? [];
      const index = Number(subPart);
      const field = embed.fields[index];
      const [, , fieldProp] = path.split(".");
      if (field) {
        if (fieldProp === "inline") {
          field.inline = value === "true";
        } else {
          field[fieldProp as "name" | "value"] = value;
        }
      } else {
        const newField: APIEmbedField = { name: "", value: "" };
        if (fieldProp === "inline") {
          newField.inline = value === "true";
        } else {
          newField[fieldProp as "name" | "value"] = value;
        }
        embed.fields.splice(index, 0, newField);
      }
      break;
    }
    case "footer":
      if (subPart === "text" && !value) {
        // Remove footer
        embed.footer = undefined;
      } else {
        embed.footer = embed.footer ?? { text: "" };
        embed.footer[subPart as "text" | "icon_url"] = value;
      }
      break;
    case "timestamp": {
      if (!value) {
        embed.timestamp = undefined;
      } else {
        const date = new Date(value);
        if (!Number.isNaN(date)) {
          embed.timestamp = date.toISOString();
        }
      }
      break;
    }
    default:
      break;
  }

  return embed;
};

const trimEmptyEmbedParts = (embed: APIEmbed) => {
  if (embed.author && !embed.author.name) {
    embed.author = undefined;
  }
  if (embed.footer && !embed.footer.text) {
    embed.footer = undefined;
  }
  if (embed.thumbnail && !embed.thumbnail.url) {
    embed.thumbnail = undefined;
  }
  if (embed.image && !embed.image.url) {
    embed.image = undefined;
  }
  return embed;
};

// If an embed with an `attachment://` image is updated without re-including
// the attachment URI, the attachment will appear duplicated above the embeds.
// const maintainAttachmentReferences = (
//   channelId: string,
//   embed: APIEmbed,
//   attachments: APIAttachment[],
// ) => {
//   const replaceAttachmentUrl = (
//     value: string | undefined,
//     callback: (newValue: string) => void,
//   ) => {
//     if (!value) return;
//     let url: URL;
//     try {
//       url = new URL(value);
//     } catch {
//       return;
//     }

//     if (
//       url.host === "cdn.discordapp.com" &&
//       url.pathname.startsWith(`/attachments/${channelId}/`)
//     ) {
//       const attachmentId = url.pathname.split("/")[3];
//       const attachment = attachments.find((a) => a.id === attachmentId);
//       if (attachment) {
//         callback(`attachment://${attachment.filename}`);
//       }
//     }
//   };

//   replaceAttachmentUrl(embed.author?.icon_url, (url) => {
//     if (embed.author) embed.author.icon_url = url;
//   });
//   replaceAttachmentUrl(embed.footer?.icon_url, (url) => {
//     if (embed.footer) embed.footer.icon_url = url;
//   });
//   replaceAttachmentUrl(embed.image?.url, (url) => {
//     embed.image = { url };
//   });
//   replaceAttachmentUrl(embed.thumbnail?.url, (url) => {
//     embed.thumbnail = { url };
//   });

//   return embed;
// };

export const quickEditSubmitContent: ModalCallback = async (ctx) => {
  const { channelId, messageId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "channelId",
    "messageId",
  );
  let webhook: APIWebhook;
  let message: APIMessageReducedWithId;
  try {
    ({ webhook, message } = await verifyWebhookMessageEditPermissions(
      ctx,
      channelId,
      messageId,
    ));
  } catch (e) {
    if (isInteractionResponse(e)) return e;
    throw e;
  }

  const { value } = ctx.getModalComponent("content");
  message.content = value.trim();

  return submitWebhookMessageEdit(
    ctx,
    webhook,
    message,
    { content: message.content },
    async () => {
      await ctx.followup.editOriginalMessage({
        components: [textDisplay("Updated content.")],
      });
    },
  );
};

export const quickEditSubmitEmbed: ModalCallback = async (ctx) => {
  const { channelId, messageId, embedIndex } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "channelId",
    "messageId",
    "embedIndex",
    "embedPart", // Ignored; see open.ts `quickEditEmbedPartOpen`
  );
  let webhook: APIWebhook;
  let message: APIMessageReducedWithId;
  try {
    ({ webhook, message } = await verifyWebhookMessageEditPermissions(
      ctx,
      channelId,
      messageId,
    ));
  } catch (e) {
    if (isInteractionResponse(e)) return e;
    throw e;
  }
  const embed = message.embeds?.[Number(embedIndex)];
  if (!embed) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  for (const row of ctx.interaction.data.components) {
    if (row.type !== ComponentType.ActionRow) continue;
    for (const input of row.components.filter(
      (c) => c.type === ComponentType.TextInput,
    )) {
      // These should all be valid references for existing or new parts
      modifyEmbedByPath(embed, input.custom_id, input.value);
    }
  }

  trimEmptyEmbedParts(embed);
  return submitWebhookMessageEdit(
    ctx,
    webhook,
    message,
    { embeds: message.embeds },
    async (updated) => {
      await ctx.followup.editOriginalMessage({
        components: [
          getQuickEditEmbedContainer(updated, embed, Number(embedIndex)),
        ],
      });

      // This is not working quite like how I want it to, for now users will
      // just have to edit via the site to maintain attachment URIs.
      // if (
      //   updated.attachments &&
      //   ((message.attachments &&
      //     updated.attachments.length > message.attachments.length) ||
      //     !message.attachments)
      // ) {
      //   // Attachments already present in embeds are not also present in
      //   // `attachments`, so we have to let Discord show the duplicated
      //   // attachments before copying them back down into the embed.
      //   // Users will see a quick flash of double attachments while this
      //   // happens.
      //   for (const e of updated.embeds) {
      //     maintainAttachmentReferences(channelId, e, updated.attachments ?? []);
      //   }

      //   let uriUpdated: APIMessage | undefined;
      //   try {
      //     uriUpdated = (await ctx.rest.patch(
      //       // biome-ignore lint/style/noNonNullAssertion: this should have been verified previously
      //       Routes.webhookMessage(webhook.id, webhook.token!, updated.id),
      //       {
      //         body: { embeds: updated.embeds },
      //         query:
      //           updated.position !== undefined
      //             ? new URLSearchParams({ thread_id: updated.channel_id })
      //             : undefined,
      //       },
      //     )) as APIMessage;
      //   } catch {}
      //   if (uriUpdated) {
      //     // https://github.com/discord/discord-api-docs/issues/7570
      //     if (uriUpdated.position !== updated.position) {
      //       uriUpdated.position = updated.position;
      //     }

      //     // If we don't re-cache then the next time this message is edited,
      //     // the attachments won't get fixed
      //     await cacheMessage(ctx.env, uriUpdated, webhook.guild_id, 600);
      //   }
      // }
    },
  );
};

const parsePathCustomId = (
  ctx: InteractionContext<
    | APIMessageComponentButtonInteraction
    | APIMessageComponentSelectMenuInteraction
    | APIModalSubmitInteraction
  >,
) => {
  const {
    channelId,
    messageId,
    path: path_,
  } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "channelId",
    "messageId",
    "path",
  );
  return { channelId, messageId, path: path_.split(".").map(Number) };
};

export const quickEditToggleContainerSpoiler: ButtonCallback = async (ctx) => {
  const { channelId, messageId, path } = parsePathCustomId(ctx);
  let webhook: APIWebhook;
  let message: APIMessageReducedWithId;
  try {
    ({ webhook, message } = await verifyWebhookMessageEditPermissions(
      ctx,
      channelId,
      messageId,
    ));
  } catch (e) {
    if (isInteractionResponse(e)) return e;
    throw e;
  }
  const container = message.components?.[path[0]];
  if (!container || container.type !== ComponentType.Container) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  container.spoiler = !container.spoiler;
  return submitWebhookMessageEdit(
    ctx,
    webhook,
    message,
    { components: message.components },
    async (updated) => {
      await ctx.followup.editOriginalMessage({
        components: [
          getQuickEditContainerContainer(updated, container, path[0]),
        ],
      });
    },
  );
};

export const quickEditSubmitGalleryItem: ModalCallback = async (ctx) => {
  const { channelId, messageId, path } = parsePathCustomId(ctx);
  let webhook: APIWebhook;
  let message: APIMessageReducedWithId;
  try {
    ({ webhook, message } = await verifyWebhookMessageEditPermissions(
      ctx,
      channelId,
      messageId,
    ));
  } catch (e) {
    if (isInteractionResponse(e)) return e;
    throw e;
  }
  const { component } = getQuickEditComponentByPath(
    message.components ?? [],
    path,
  );
  if (!component || component.type !== ComponentType.MediaGallery) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  const index = path[path.length - 1];
  const item = component.items[index];

  const url = ctx.getModalComponent("url")?.value;
  const { content_type } = item.media;
  item.media = { url };
  item.description =
    ctx.getModalComponent("description")?.value.trim() || undefined;
  item.spoiler = ctx.getModalComponent("spoiler")?.value === "true";

  return submitWebhookMessageEdit(
    ctx,
    webhook,
    message,
    { components: message.components },
    async (updated) => {
      // We do this so that the container builder can assume the content type
      // of the previous URL (if any), since it's unlikely that it would have
      // changed e.g. from an image to a video. But if it does, it's fine,
      // they just have to bring up the menu again.
      // We could fetch the URL to determine the content type ourselves but
      // that does not seem worth the effort at the moment.
      const containerItem = { ...item, media: { url, content_type } };
      await ctx.followup.editOriginalMessage({
        components: [
          getQuickEditMediaGalleryItemContainer(updated, containerItem, path),
        ],
      });
    },
  );
};

export const quickEditToggleSeparatorDivider: ButtonCallback = async (ctx) => {
  const { channelId, messageId, path } = parsePathCustomId(ctx);
  let webhook: APIWebhook;
  let message: APIMessageReducedWithId;
  try {
    ({ webhook, message } = await verifyWebhookMessageEditPermissions(
      ctx,
      channelId,
      messageId,
    ));
  } catch (e) {
    if (isInteractionResponse(e)) return e;
    throw e;
  }
  const { component } = getQuickEditComponentByPath(
    message.components ?? [],
    path,
  );
  if (!component || component.type !== ComponentType.Separator) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  // Defaults to true if undefined so we can't just negate
  component.divider = component.divider === false;

  return submitWebhookMessageEdit(
    ctx,
    webhook,
    message,
    { components: message.components },
    async (updated) => {
      await ctx.followup.editOriginalMessage({
        components: [getQuickEditSeparatorContainer(updated, component, path)],
      });
    },
  );
};

export const quickEditToggleSeparatorSize: ButtonCallback = async (ctx) => {
  const { channelId, messageId, path } = parsePathCustomId(ctx);
  let webhook: APIWebhook;
  let message: APIMessageReducedWithId;
  try {
    ({ webhook, message } = await verifyWebhookMessageEditPermissions(
      ctx,
      channelId,
      messageId,
    ));
  } catch (e) {
    if (isInteractionResponse(e)) return e;
    throw e;
  }
  const { component } = getQuickEditComponentByPath(
    message.components ?? [],
    path,
  );
  if (!component || component.type !== ComponentType.Separator) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  component.spacing =
    component.spacing === SeparatorSpacingSize.Large
      ? SeparatorSpacingSize.Small
      : SeparatorSpacingSize.Large;

  return submitWebhookMessageEdit(
    ctx,
    webhook,
    message,
    { components: message.components },
    async (updated) => {
      await ctx.followup.editOriginalMessage({
        components: [getQuickEditSeparatorContainer(updated, component, path)],
      });
    },
  );
};

export const quickEditSubmitTextDisplay: ModalCallback = async (ctx) => {
  const { channelId, messageId, path } = parsePathCustomId(ctx);
  let webhook: APIWebhook;
  let message: APIMessageReducedWithId;
  try {
    ({ webhook, message } = await verifyWebhookMessageEditPermissions(
      ctx,
      channelId,
      messageId,
    ));
  } catch (e) {
    if (isInteractionResponse(e)) return e;
    throw e;
  }
  const { component } = getQuickEditComponentByPath(
    message.components ?? [],
    path,
  );
  if (!component || component.type !== ComponentType.TextDisplay) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  const content = ctx.getModalComponent("content").value;
  component.content = content;

  return submitWebhookMessageEdit(
    ctx,
    webhook,
    message,
    { components: message.components },
    async () => {
      await ctx.followup.editOriginalMessage({
        components: [textDisplay("Updated text display content.")],
      });
    },
  );
};

export const quickEditSubmitSection: ModalCallback = async (ctx) => {
  const { channelId, messageId, path } = parsePathCustomId(ctx);
  let webhook: APIWebhook;
  let message: APIMessageReducedWithId;
  try {
    ({ webhook, message } = await verifyWebhookMessageEditPermissions(
      ctx,
      channelId,
      messageId,
    ));
  } catch (e) {
    if (isInteractionResponse(e)) return e;
    throw e;
  }
  const { component } = getQuickEditComponentByPath(
    message.components ?? [],
    path,
  );
  if (!component || component.type !== ComponentType.Section) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  for (const row of ctx.interaction.data.components) {
    const [input] = row.components;
    switch (input.custom_id) {
      // ew
      case "components.0.content":
      case "components.1.content":
      case "components.2.content": {
        const index = Number(input.custom_id.split(".")[1]);
        const text = component.components[index];
        if (!text) {
          return ctx.reply({ content: missingElement, ephemeral: true });
        }
        text.content = input.value.trim();
        break;
      }
      case "accessory.media.url":
      case "accessory.description":
      case "accessory.spoiler": {
        const thumbnail = component.accessory;
        if (thumbnail.type !== ComponentType.Thumbnail) {
          return ctx.reply({ content: missingElement, ephemeral: true });
        }
        switch (input.custom_id) {
          case "accessory.media.url":
            thumbnail.media.url = input.value;
            break;
          case "accessory.description":
            thumbnail.description = input.value.trim() || undefined;
            break;
          case "accessory.spoiler":
            thumbnail.spoiler = input.value === "true";
            break;
          default:
            break;
        }
        break;
      }
      default:
        break;
    }
  }

  component.components = component.components.filter((td) =>
    Boolean(td.content),
  );
  if (component.components.length === 0) {
    return ctx.reply({
      content: "Section content cannot be empty.",
      ephemeral: true,
    });
  }

  return submitWebhookMessageEdit(
    ctx,
    webhook,
    message,
    { components: message.components },
    async (updated) => {
      await ctx.followup.editOriginalMessage({
        components: [getQuickEditSectionContainer(updated, component, path)],
      });
    },
  );
};
