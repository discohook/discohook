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
  type APIChatInputApplicationCommandGuildInteraction,
  APIComponentInContainer,
  APIContainerComponent,
  APIEmbed,
  APIMediaGalleryItem,
  type APIMessage,
  type APIMessageApplicationCommandGuildInteraction,
  APIMessageTopLevelComponent,
  APISeparatorComponent,
  APITextDisplayComponent,
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
import { buildTextInputRow, getQuickEditComponentByPath } from "./open.js";

const getCV2TopLevelOptions = (
  components: (APIMessageTopLevelComponent | APIComponentInContainer)[],
) => {
  const options: StringSelectMenuOptionBuilder[] = [];
  let hasActionRows = false;
  let i = -1;
  for (const component of components) {
    i += 1;
    switch (component.type) {
      case ComponentType.Container:
      // case ComponentType.File:
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
  return { options, hasActionRows };
};

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
    const result = getCV2TopLevelOptions(message.components ?? []);
    options.push(...result.options);
    hasActionRows = result.hasActionRows;
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
    "i", // index of which overflow select was used, not useful here
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
    case "components": {
      const component = message.components?.[Number(index)];
      if (!component) {
        return ctx.reply({
          content: missingElement,
          ephemeral: true,
        });
      }
      return await getQuickEditComponentUpdateResponse(
        ctx,
        message,
        component,
        Number(index),
      );
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

// Part 3 if editing a container
export const quickEditSelectContainerElement: SelectMenuCallback = async (
  ctx,
) => {
  const { channelId, messageId, componentIndex } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "channelId",
    "messageId",
    "componentIndex",
    "i", // index of which overflow select was used, not useful here
  );
  const message = await getchMessage(ctx.rest, ctx.env, channelId, messageId, {
    guildId: ctx.interaction.guild_id,
  });

  const container = message.components?.[Number(componentIndex)];
  if (!container || container.type !== ComponentType.Container) {
    return ctx.reply({
      content: missingElement,
      ephemeral: true,
    });
  }

  const value = ctx.interaction.data.values[0];
  const [, index] = value.split(".");
  const component = container.components[Number(index)];
  if (!component) {
    return ctx.reply({
      content: missingElement,
      ephemeral: true,
    });
  }

  return await getQuickEditComponentUpdateResponse(
    ctx,
    message,
    component,
    Number(index),
    Number(componentIndex),
  );
};

const getQuickEditContentModal = (message: APIMessageReducedWithId) => {
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

export const getQuickEditMediaGalleryItemModal = (
  message: APIMessageReducedWithId,
  item: APIMediaGalleryItem,
  path: number[],
) => {
  const modal = new ModalBuilder()
    .setCustomId(
      `a_qe-submit-gallery-item_${message.channel_id}:${message.id}:${path.join(
        ".",
      )}` satisfies AutoModalCustomId,
    )
    .setTitle("Edit Media")
    .addComponents(
      buildTextInputRow((input) =>
        input
          .setCustomId("url")
          .setStyle(TextInputStyle.Short)
          .setLabel("URL")
          .setPlaceholder("A full, direct URL to the media")
          .setValue(item.media.url)
          .setRequired(),
      ),
    );

  if (item.media.content_type?.startsWith("image/")) {
    modal
      .addComponents(
        buildTextInputRow((input) =>
          input
            .setCustomId("description")
            .setStyle(TextInputStyle.Short)
            .setLabel("Description (alt text)")
            .setValue(item.description ?? "")
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
            .setValue(String(item.spoiler))
            .setMinLength(4)
            .setMaxLength(5),
        ),
      );
  }

  return modal;
};

export const getQuickEditMediaGalleryItemContainer = (
  message: APIMessageReducedWithId,
  item: APIMediaGalleryItem,
  path: number[],
) => {
  const container = new ContainerBuilder();

  let filename: string;
  let validThumbnailUrl = true;
  try {
    const { pathname } = new URL(item.media.url);
    filename = pathname.split("/")[pathname.split("/").length - 1];
    // discord.js validation
    new ThumbnailBuilder().setURL(item.media.url).toJSON();
  } catch {
    // Can be a user-provided value not checked by discord
    filename = item.media.url;
    validThumbnailUrl = false;
  }
  if (item.media.content_type?.startsWith("image/") && validThumbnailUrl) {
    container.addSectionComponents((s) =>
      s
        .addTextDisplayComponents((td) => td.setContent(`### ${filename}`))
        .addTextDisplayComponents((td) =>
          td.setContent(dedent`
            Spoiler: ${boolEmoji(item.spoiler ?? null)}
            Description: ${boolEmoji(!!item.description)}
          `),
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder({
            description: item.description,
            media: { url: item.media.url },
          }),
        ),
    );
  } else {
    container.addTextDisplayComponents((td) =>
      td.setContent(dedent`
        ### ${filename}
        Spoiler: ${boolEmoji(item.spoiler ?? null)}
        Description: ${boolEmoji(!!item.description)}
      `),
    );
  }

  container.addActionRowComponents((row) =>
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(
          `a_qe-reopen-component-modal_${message.channel_id}:${
            message.id
          }:${path.join(".")}` satisfies AutoComponentCustomId,
        )
        .setStyle(ButtonStyle.Primary)
        .setLabel("Edit"),
    ),
  );

  return container;
};

export const getQuickEditSeparatorContainer = (
  message: APIMessageReducedWithId,
  component: APISeparatorComponent,
  path: number[],
) => {
  const container = new ContainerBuilder()
    .addTextDisplayComponents((td) =>
      td.setContent(
        `### ${
          SeparatorSpacingSize[component.spacing ?? SeparatorSpacingSize.Small]
        } ${component.divider ?? true ? "Divider" : "Separator"}`,
      ),
    )
    .addActionRowComponents((row) =>
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(
            `a_qe-separator-size_${message.channel_id}:${
              message.id
            }:${path.join(".")}` satisfies AutoComponentCustomId,
          )
          .setLabel(
            component.spacing === SeparatorSpacingSize.Small
              ? "More spacing"
              : "Less spacing",
          )
          .setEmoji({
            name: component.spacing === SeparatorSpacingSize.Small ? "⬆️" : "⬇️",
          })
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(
            `a_qe-separator-divider_${message.channel_id}:${
              message.id
            }:${path.join(".")}` satisfies AutoComponentCustomId,
          )
          .setLabel(
            component.divider === false ? "Show divider" : "Hide divider",
          )
          .setEmoji({
            name: component.divider === false ? "👓" : "🕶️",
          })
          .setStyle(ButtonStyle.Secondary),
      ),
    );
  return container;
};

export const getQuickEditContainerContainer = (
  message: APIMessageReducedWithId,
  component: APIContainerComponent,
  componentIndex: number,
) => {
  const container = new ContainerBuilder({
    accent_color: component.accent_color,
  });

  container
    .addActionRowComponents((row) =>
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(
            `a_qe-container-spoiler_${message.channel_id}:${message.id}:${componentIndex}` satisfies AutoComponentCustomId,
          )
          .setStyle(ButtonStyle.Secondary)
          .setLabel(component.spoiler ? "Unmark as spoiler" : "Mark as spoiler")
          .setEmoji({ name: component.spoiler ? "👓" : "🕶️" }),
      ),
    )
    .addSeparatorComponents((s) => s.setDivider());

  const { options, hasActionRows } = getCV2TopLevelOptions(
    component.components,
  );
  if (options.length === 0) {
    const actionRowWarning = hasActionRows
      ? "To edit interactive components, use the **Buttons & Components** message command."
      : "";
    container.addTextDisplayComponents((td) =>
      td.setContent(
        `There's nothing else in this container that Discohook Utils can edit. ${actionRowWarning}`,
      ),
    );
  } else {
    // TODO: see comment in part 1
    const options1 = options.slice(0, 25);
    const options2 = options.slice(25, 50);

    container
      .addTextDisplayComponents((td) =>
        td.setContent(
          `There ${
            options.length === 1
              ? "is 1 element"
              : `are ${options.length} elements`
          } in this container that Discohook Utils can edit. Pick one below and follow the instructions to edit it.`,
        ),
      )
      .addActionRowComponents((row) =>
        row.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(
              `a_qe-select-c-element_${message.channel_id}:${message.id}:${componentIndex}:0` satisfies AutoComponentCustomId,
            )
            .addOptions(options1)
            .setPlaceholder(
              options2.length === 0
                ? "Select what to edit"
                : "Select what to edit (1/2)",
            ),
        ),
      );
    if (options2.length !== 0) {
      container.addActionRowComponents((row) =>
        row.addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(
              `a_qe-select-c-element_${message.channel_id}:${message.id}:${componentIndex}:1` satisfies AutoComponentCustomId,
            )
            .addOptions(options2)
            .setPlaceholder("Select what to edit (2/2)"),
        ),
      );
    }
  }

  return container;
};

const getQuickEditTextDisplayModal = (
  message: APIMessageReducedWithId,
  component: APITextDisplayComponent,
  path: number[],
) => {
  const modal = new ModalBuilder()
    .setCustomId(
      `a_qe-submit-text-display_${message.channel_id}:${message.id}:${path.join(
        ".",
      )}` satisfies AutoModalCustomId,
    )
    .setTitle("Set Text Display Content")
    .addComponents(
      buildTextInputRow((input) =>
        input
          .setCustomId("content")
          .setStyle(TextInputStyle.Paragraph)
          .setLabel("Content")
          .setValue((component.content ?? "").slice(0, 2000))
          .setMaxLength(2000)
          .setRequired(),
      ),
    );
  return modal;
};

const getQuickEditComponentUpdateResponse = async (
  ctx: InteractionContext,
  message: APIMessageReducedWithId,
  component: APIMessageTopLevelComponent | APIComponentInContainer,
  componentIndex: number,
  parentIndex?: number,
) => {
  const path =
    parentIndex !== undefined
      ? `${parentIndex}.${componentIndex}`
      : String(componentIndex);
  switch (component.type) {
    case ComponentType.Container:
      return ctx.updateMessage({
        components: [
          getQuickEditContainerContainer(message, component, componentIndex),
        ],
      });
    case ComponentType.MediaGallery: {
      // max 10 items per gallery
      const select = new StringSelectMenuBuilder()
        .setCustomId(
          `a_qe-select-component_${message.channel_id}:${message.id}:${path}` satisfies AutoComponentCustomId,
        )
        .setPlaceholder("Select a gallery item to edit")
        .addOptions(
          component.items.map((item, i) => {
            const { pathname } = new URL(item.media.url);
            const filename =
              pathname.split("/")[pathname.split("/").length - 1];
            return new StringSelectMenuOptionBuilder({
              description: item.description ?? undefined,
            })
              .setLabel(`[${i + 1}] ${filename}`.slice(0, 100))
              .setValue(String(i))
              .setEmoji({
                name: item.media.content_type?.startsWith("image/")
                  ? "🖼️"
                  : item.media.content_type?.startsWith("video/")
                    ? "🎞️"
                    : "📄",
              });
          }),
        );
      return ctx.updateMessage({
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select),
        ],
      });
    }
    case ComponentType.Separator:
      return ctx.updateMessage({
        components: [
          getQuickEditSeparatorContainer(
            message,
            component,
            path.split(".").map(Number),
          ),
        ],
      });
    case ComponentType.TextDisplay:
      return ctx.modal(
        getQuickEditTextDisplayModal(
          message,
          component,
          path.split(".").map(Number),
        ),
      );
    default:
      return ctx.reply({
        content: `Couldn't determine what data to edit. Component: type ${component.type}, index ${componentIndex}`,
        ephemeral: true,
      });
  }
};

export const quickEditSelectComponent: SelectMenuCallback = async (ctx) => {
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
  const message = await getchMessage(ctx.rest, ctx.env, channelId, messageId, {
    guildId: ctx.interaction.guild_id,
  });

  const path = path_.split(".").map(Number);
  const { component } = getQuickEditComponentByPath(
    message.components ?? [],
    path,
  );
  if (!component) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  const value = ctx.interaction.data.values[0];
  switch (component.type) {
    case ComponentType.MediaGallery: {
      // the value is the index of an item
      const item = component.items[Number(value)];
      if (!item) {
        return ctx.reply({ content: missingElement, ephemeral: true });
      }
      return [
        ctx.modal(
          getQuickEditMediaGalleryItemModal(message, item, [
            ...path,
            Number(value),
          ]),
        ),
        async () => {
          await ctx.followup.editOriginalMessage({
            components: [
              getQuickEditMediaGalleryItemContainer(message, item, [
                ...path,
                Number(value),
              ]),
            ],
          });
        },
      ];
    }
    default:
      break;
  }

  return ctx.updateMessage({
    components: [
      textDisplay(`Couldn't determine what data to edit. ${path_} > ${value}`),
    ],
  });
};
