import {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ThumbnailBuilder,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  APIAttachment,
  type APIChatInputApplicationCommandGuildInteraction,
  APIEmbed,
  type APIMessage,
  type APIMessageApplicationCommandGuildInteraction,
  ButtonStyle,
  ComponentType,
  EmbedType,
  SeparatorSpacingSize,
  TextInputStyle,
} from "discord-api-types/v10";
import { APIMessageReducedWithId, cacheMessage, getchMessage } from "store";
import type {
  ChatInputAppCommandCallback,
  InteractionInstantOrDeferredResponse,
  MessageAppCommandCallback,
} from "../../commands.js";
import {
  AutoComponentCustomId,
  AutoModalCustomId,
  SelectMenuCallback,
} from "../../components.js";
import { InteractionContext } from "../../interactions.js";
import {
  isComponentsV2,
  parseAutoComponentId,
  textDisplay,
} from "../../util/components.js";
import { boolEmoji } from "../../util/meta.js";
import { resolveMessageLink } from "../components/entry.js";
import { isMessageWebhookEditable } from "../restore.js";
import { buildTextInputRow } from "./open.js";

export const quickEditChatEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const message = await resolveMessageLink(
    ctx.rest,
    ctx.getStringOption("message").value,
    ctx.interaction.guild_id,
  );
  if (typeof message === "string") {
    return ctx.reply({ content: message, ephemeral: true });
  }
  return await quickEditPart1(ctx, message);
};

export const quickEditMessageEntry: MessageAppCommandCallback<
  APIMessageApplicationCommandGuildInteraction
> = async (ctx) => {
  const message = ctx.getMessage();
  return await quickEditPart1(ctx, message);
};

const quickEditPart1 = async (
  ctx: InteractionContext<
    | APIChatInputApplicationCommandGuildInteraction
    | APIMessageApplicationCommandGuildInteraction
  >,
  message: APIMessage,
): Promise<InteractionInstantOrDeferredResponse> => {
  if (!isMessageWebhookEditable(ctx.env, message)) {
    return ctx.reply({
      content:
        "Discohook Utils can only edit webhook messages owned by itself or a user.",
      ephemeral: true,
    });
  }

  const options: StringSelectMenuOptionBuilder[] = [];
  let hasActionRows = false;
  if (isComponentsV2(message)) {
    // Max 40 items, may need to split options to 2 arrays
    let i = -1;
    for (const component of message.components ?? []) {
      i += 1;
      switch (component.type) {
        case ComponentType.Container:
        case ComponentType.File:
        case ComponentType.MediaGallery:
        case ComponentType.Section:
        case ComponentType.Separator:
        case ComponentType.TextDisplay:
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(
                `[${i + 1}] ${ComponentType[component.type].replace(
                  // Add space before capital
                  /([a-z])([A-Z])/g,
                  "$1 $2",
                )}`,
              )
              .setValue(`components.${i}`),
          );
          break;
        case ComponentType.ActionRow:
          hasActionRows = true;
          break;
        default:
          break;
      }
    }
  } else {
    // Should be max 21 items
    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel(
          message.content
            ? `Content (${message.content.length} chars)`
            : "Add Content",
        )
        .setValue("content"),
    );
    // It turns out that you can't actually change any of this data. Whoops!
    // I'm keeping this code though in case we decide to have a feature where
    // the bot can remove and re-upload an attachment with the updated info.
    // if (message.attachments) {
    //   let i = -1;
    //   for (const attachment of message.attachments) {
    //     i += 1;
    //     options.push(
    //       new StringSelectMenuOptionBuilder()
    //         .setLabel(
    //           `Attachment ${i + 1}: ${attachment.filename}`.slice(0, 100),
    //         )
    //         // Prefer a unique identifier since we're not labeling by index
    //         .setValue(`attachments.${attachment.id}`),
    //     );
    //   }
    // }
    if (message.embeds) {
      let i = -1;
      for (const embed of message.embeds) {
        i += 1;
        // Ignore link embeds in options since we can't edit those (but still
        // pass correct index). Not sure what to do about Mastodon link embeds,
        // which have a type of `rich` despite being unfurls.
        if (embed.type && embed.type !== EmbedType.Rich) continue;
        options.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`Embed ${i + 1}`)
            .setValue(`embeds.${i}`),
        );
      }
    }
  }

  const actionRowWarning = hasActionRows
    ? "To edit interactive components, use the **Buttons & Components** message command."
    : "";
  if (options.length === 0) {
    return ctx.reply({
      content: `There's nothing in this message that Discohook Utils can edit. ${actionRowWarning}`,
      ephemeral: true,
    });
  }

  // TODO: this should be futureproofed.
  // We're doing this the lazy way instead of the robust way. Currently there
  // should be a maximum of 40 options (40 total components in a CV2 message)
  // but it's totally possible there could be more in the future.
  const options1 = options.slice(0, 25);
  const options2 = options.slice(25, 50);

  const components = [
    textDisplay(
      `There ${
        options.length === 1 ? "is 1 element" : `are ${options.length} elements`
      } in this message that Discohook Utils can edit. Pick one below and follow the instructions to edit it.`,
    ),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(
          `a_qe-select-element_${message.channel_id}:${message.id}:0` satisfies AutoComponentCustomId,
        )
        .addOptions(options1)
        .setPlaceholder(
          options2.length === 0
            ? "Select what to edit"
            : "Select what to edit (1/2)",
        ),
    ),
  ];
  if (options2.length !== 0) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(
            `a_qe-select-element_${message.channel_id}:${message.id}:1` satisfies AutoComponentCustomId,
          )
          .addOptions(options2)
          .setPlaceholder("Select what to edit (2/2)"),
      ),
    );
  }

  await cacheMessage(ctx.env, message, ctx.interaction.guild_id);
  return ctx.reply({ components, componentsV2: true, ephemeral: true });
};

export const missingElement =
  "There is nothing at that index. Has the message already been updated?";

// Part 2
export const quickEditSelectElement: SelectMenuCallback = async (ctx) => {
  const { channelId, messageId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "channelId",
    "messageId",
    "i",
  );
  const message = await getchMessage(ctx.rest, ctx.env, channelId, messageId, {
    guildId: ctx.interaction.guild_id,
  });

  const value = ctx.interaction.data.values[0];
  const [group, index] = value.split(".");
  switch (group) {
    case "content": {
      const modal = getQuickEditContentModal(message);
      // TODO: Reset select state
      return ctx.modal(modal);
    }
    case "embeds": {
      const embed = message.embeds?.[Number(index)];
      if (!embed) {
        return ctx.reply({
          content: missingElement,
          ephemeral: true,
        });
      }
      const container = getQuickEditEmbedContainer(
        message,
        embed,
        Number(index),
      );
      return ctx.updateMessage({
        components: [
          // new ContainerBuilder()
          //   .setAccentColor(color)
          //   .addTextDisplayComponents((td) =>
          //     td.setContent("Select a part of the embed to edit."),
          //   ),
          container,
        ],
      });
    }
    case "attachments": {
      const attachment = message.attachments?.find((a) => a.id === index);
      if (!attachment) {
        return ctx.reply({
          content: missingElement,
          ephemeral: true,
        });
      }
      return [
        ctx.modal(getQuickEditAttachmentModal(message, attachment)),
        async () => {
          await ctx.followup.editOriginalMessage({
            components: [getQuickEditAttachmentContainer(message, attachment)],
          });
        },
      ];
    }
    case "components": {
      const component = message.components?.[Number(index)];
      if (!component) {
        return ctx.reply({
          content: missingElement,
          ephemeral: true,
        });
      }
      break;
    }
    default:
      break;
  }

  return ctx.updateMessage({
    components: [
      textDisplay(`Couldn't determine what data to edit. Value: ${value}`),
    ],
  });
};

const getQuickEditContentModal = (
  // ctx: InteractionContext,
  message: APIMessageReducedWithId,
) => {
  const modal = new ModalBuilder()
    .setCustomId(
      `a_qe-submit-content_${message.channel_id}:${message.id}` satisfies AutoModalCustomId,
    )
    .setTitle("Set Content")
    .addComponents(
      buildTextInputRow((input) =>
        input
          .setCustomId("content")
          .setStyle(TextInputStyle.Paragraph)
          .setLabel("Content")
          .setValue((message.content ?? "").slice(0, 2000))
          .setMaxLength(2000)
          .setRequired(false),
      ),
    );
  return modal;
};

export const getQuickEditEmbedContainer = (
  message: APIMessageReducedWithId,
  embed: APIEmbed,
  embedIndex: number,
) => {
  const customId =
    `a_qe-embed-part_${message.channel_id}:${message.id}:${embedIndex}` satisfies AutoComponentCustomId;
  const container = new ContainerBuilder({ accent_color: embed.color });
  // We don't preview the text because it could easily become too large (6000 embed chars vs 4000 cv2 chars)
  const missingParts: string[] = [];
  if (embed.author) {
    container.addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) => td.setContent("**Author**"))
        .addTextDisplayComponents((td) =>
          td.setContent(dedent`
            Name: ${boolEmoji(!!embed.author?.name)} ${
              embed.author?.name.length ?? 0
            }/256
            Icon: ${boolEmoji(!!embed.author?.icon_url)}
            URL: ${boolEmoji(!!embed.author?.url)}
          `),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`${customId}:author`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Set Author"),
        ),
    );
  } else {
    missingParts.push("author");
  }

  if (embed.title || embed.url || embed.description) {
    container.addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) => td.setContent("**Body**"))
        .addTextDisplayComponents((td) =>
          td.setContent(dedent`
            Title: ${boolEmoji(!!embed.title)} ${embed.title?.length ?? 0}/256
            Title URL: ${boolEmoji(!!embed.url)}
            Description: ${boolEmoji(!!embed.description)} ${
              embed.description?.length ?? 0
            }/4096
          `),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`${customId}:title`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Set Body"),
        ),
    );
  } else {
    if (!embed.title) missingParts.push("title");
    if (!embed.description) missingParts.push("description");
    if (!embed.url) missingParts.push("url");
  }

  if (embed.thumbnail) {
    container.addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) => td.setContent("**Thumbnail**"))
        .addTextDisplayComponents((td) =>
          td.setContent(dedent`
            URL: ${boolEmoji(!!embed.thumbnail?.url)}
            Size: ${embed.thumbnail?.width ?? "?"}x${
              embed.thumbnail?.height ?? "?"
            }
          `),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`${customId}:thumbnail`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Set Thumbnail"),
        ),
    );
  } else {
    missingParts.push("thumbnail");
  }

  container.addTextDisplayComponents((td) =>
    td.setContent(`**Fields - ${embed.fields?.length ?? 0}/25**`),
  );
  if (embed.fields && embed.fields.length !== 0) {
    container.addActionRowComponents((row) =>
      row.addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`${customId}:fields`)
          .setPlaceholder("Select a field")
          .addOptions(
            embed.fields?.map((field, i) =>
              new StringSelectMenuOptionBuilder()
                // non-content components don't count toward char limit
                .setLabel(`[${i + 1}] ${field.name}`.slice(0, 100))
                .setDescription(field.value.slice(0, 100))
                .setValue(String(i)),
            ) ?? [],
          ),
      ),
    );
  }
  if (!embed.fields || embed.fields.length < 25) {
    container.addActionRowComponents((row) =>
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`${customId}:fields.new`)
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Add Field"),
      ),
    );
  }

  if (embed.image) {
    container.addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) => td.setContent("**Image**"))
        .addTextDisplayComponents((td) =>
          td.setContent(dedent`
            URL: ${boolEmoji(!!embed.image?.url)}
            Size: ${embed.image?.width ?? "?"}x${embed.image?.height ?? "?"}
          `),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`${customId}:image`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Set Image"),
        ),
    );
  } else {
    missingParts.push("image");
  }

  if (embed.footer) {
    container.addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) => td.setContent("**Footer**"))
        .addTextDisplayComponents((td) =>
          td.setContent(dedent`
            Text: ${boolEmoji(!!embed.footer?.text)}
            Icon: ${boolEmoji(!!embed.footer?.icon_url)}
          `),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`${customId}:footer`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Set Footer"),
        ),
    );
  } else {
    missingParts.push("footer");
  }

  if (missingParts.length > 0) {
    container
      .addSeparatorComponents((s) =>
        s.setDivider().setSpacing(SeparatorSpacingSize.Large),
      )
      .addTextDisplayComponents((td) => td.setContent("**New Parts**"))
      .addActionRowComponents((row) =>
        row.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`${customId}:new`)
            // .setPlaceholder("Add missing parts")
            .addOptions(
              missingParts.map((part) =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(
                    part === "url"
                      ? "Title URL"
                      : part[0].toUpperCase() + part.slice(1),
                  )
                  .setValue(part),
              ),
            ),
        ),
      );
  }

  return container;
};

export const getQuickEditAttachmentModal = (
  message: APIMessageReducedWithId,
  attachment: APIAttachment,
) => {
  const modal = new ModalBuilder()
    .setCustomId(
      `a_qe-submit-attachment_${message.channel_id}:${message.id}:${attachment.id}` satisfies AutoModalCustomId,
    )
    .setTitle("Edit Attachment")
    .addComponents(
      buildTextInputRow(
        (input) =>
          input
            .setCustomId("filename")
            .setStyle(TextInputStyle.Short)
            .setLabel("Filename (with extension)")
            .setPlaceholder("Like image.png or my_game.zip")
            .setValue(attachment.filename)
            .setRequired(),
        // What is this limit?
        // .setMaxLength(100)
      ),
    );

  if (attachment.content_type?.startsWith("image/")) {
    modal
      .addComponents(
        buildTextInputRow((input) =>
          input
            .setCustomId("description")
            .setStyle(TextInputStyle.Short)
            .setLabel("Description (alt text)")
            .setValue(attachment.description ?? "")
            .setMaxLength(1024)
            .setRequired(false),
        ),
      )
      .addComponents(
        buildTextInputRow((input) =>
          input
            .setCustomId("spoiler")
            .setLabel("Spoiler?")
            .setPlaceholder(
              'Type "true" or "false" for whether the image should be blurred.',
            )
            .setStyle(TextInputStyle.Short)
            .setValue(String(attachment.filename.startsWith("SPOILER_")))
            .setMinLength(4)
            .setMaxLength(5),
        ),
      );
  }

  return modal;
};

export const getQuickEditAttachmentContainer = (
  message: APIMessageReducedWithId,
  attachment: APIAttachment,
) => {
  const container = new ContainerBuilder();
  // .setAccentColor(color);

  if (attachment.content_type?.startsWith("image/")) {
    container.addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) =>
          td.setContent(`### ${attachment.filename.replace(/^SPOILER_/, "")}`),
        )
        .addTextDisplayComponents((td) =>
          td.setContent(dedent`
            Spoiler: ${boolEmoji(attachment.filename.startsWith("SPOILER_"))}
            Description: ${boolEmoji(!!attachment.description)}
          `),
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder({
            description: attachment.description,
            media: { url: attachment.url },
          }),
        ),
    );
  } else {
    container.addTextDisplayComponents((td) =>
      td.setContent(dedent`
        ### ${attachment.filename}
      `),
    );
  }

  container.addActionRowComponents((row) =>
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(
          `a_qe-attachment_${message.channel_id}:${message.id}:${attachment.id}` satisfies AutoComponentCustomId,
        )
        .setStyle(ButtonStyle.Primary)
        .setLabel("Edit"),
    ),
  );

  return container;
};
