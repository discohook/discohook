import {
  ModalBuilder,
  StringSelectMenuOptionBuilder,
} from "@discordjs/builders";
import {
  type APIComponentInContainer,
  type APIContainerComponent,
  type APIMessageTopLevelComponent,
  ComponentType,
  TextInputStyle,
} from "discord-api-types/v10";
import { getchMessage } from "store";
import type {
  AutoModalCustomId,
  ButtonCallback,
  SelectMenuCallback,
} from "../../components.js";
import { parseAutoComponentId, textDisplay } from "../../util/components.js";
import {
  getQuickEditEmbedContainer,
  getQuickEditMediaGalleryItemModal,
  getQuickEditSectionModal,
  missingElement,
} from "./entry.js";

// Not designed to work with interactive components - nesting support
// is only for containers.
export const getQuickEditComponentByPath = (
  components: APIMessageTopLevelComponent[],
  path: number[],
) => {
  let parent: APIContainerComponent | undefined;
  let component:
    | APIMessageTopLevelComponent
    | APIComponentInContainer
    | undefined;
  if (path.length > 1) {
    const container = components[path[0]];
    if (container?.type === ComponentType.Container) {
      parent = container;
      component = container.components[path[1]];
    }
  } else {
    component = components[path[0]];
  }
  return { parent, component };
};

export const quickEditComponentModalReopen: ButtonCallback = async (ctx) => {
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

  const message = await getchMessage(ctx.rest, ctx.env, channelId, messageId);
  const path = path_.split(".").map(Number);
  const { component } = getQuickEditComponentByPath(
    message.components ?? [],
    path,
  );
  if (!component) {
    return ctx.reply({ content: missingElement, ephemeral: true });
  }

  const index = path[path.length - 1];
  switch (component.type) {
    case ComponentType.MediaGallery: {
      // the value is the index of an item
      const item = component.items[index];
      if (!item) {
        return ctx.reply({ content: missingElement, ephemeral: true });
      }
      return ctx.modal(getQuickEditMediaGalleryItemModal(message, item, path));
    }
    case ComponentType.Section: {
      return ctx.modal(getQuickEditSectionModal(message, component, path));
    }
    default:
      break;
  }

  return ctx.updateMessage({
    components: [textDisplay(`Couldn't determine what data to edit. ${path_}`)],
  });
};

export const quickEditEmbedPartOpen: ButtonCallback & SelectMenuCallback =
  async (ctx) => {
    const { channelId, messageId, embedIndex, embedPart } =
      parseAutoComponentId(
        ctx.interaction.data.custom_id,
        "channelId",
        "messageId",
        "embedIndex",
        "embedPart",
      );

    const message = await getchMessage(ctx.rest, ctx.env, channelId, messageId);
    const embed = message.embeds?.[Number(embedIndex)];
    if (!embed) {
      return ctx.reply({ content: missingElement, ephemeral: true });
    }

    let [part, inner] = embedPart.split(".");
    // Normalize select data since the identifier structure is slightly different
    if (ctx.interaction.data.component_type === ComponentType.StringSelect) {
      if (part === "new") {
        part = ctx.interaction.data.values[0];
      } else if (part === "fields") {
        inner = ctx.interaction.data.values[0];
      }
    }

    const modal = new ModalBuilder().setCustomId(
      // `part` is ignored in the callback but must be provided or else
      // Discord assumes this is the same modal as was used for another part
      // and autofills content based on each component's index rather than
      // its custom ID.
      `a_qe-submit-embed_${channelId}:${messageId}:${embedIndex}:${part}` satisfies AutoModalCustomId,
    );

    switch (part) {
      case "author": {
        modal.setTitle("Set Author");
        modal.addLabelComponents(
          (l) =>
            l
              .setLabel("Name")
              .setDescription(
                "This must be provided to display the author section.",
              )
              .setTextInputComponent((b) =>
                b
                  .setCustomId("author.name")
                  .setMaxLength(128)
                  .setStyle(TextInputStyle.Paragraph)
                  .setValue(embed.author?.name ?? "")
                  .setRequired(false),
              ),
          (l) =>
            l
              .setLabel("URL")
              .setDescription(
                "Directs desktop users to this URL when they click the author name.",
              )
              .setTextInputComponent((b) =>
                b
                  .setCustomId("author.url")
                  .setStyle(TextInputStyle.Short)
                  .setValue(embed.author?.url ?? "")
                  .setRequired(false),
              ),
          (l) =>
            l
              .setLabel("Icon URL")
              .setDescription("An image shown to the left of the author name.")
              .setTextInputComponent((b) =>
                b
                  .setCustomId("author.icon_url")
                  .setStyle(TextInputStyle.Short)
                  .setValue(embed.author?.icon_url ?? "")
                  .setRequired(false),
              ),
        );
        break;
      }
      case "title":
      case "description": {
        modal.setTitle("Set Body");
        modal.addLabelComponents(
          (l) =>
            l
              .setLabel("Title")
              .setDescription(
                "Large text below the author and above the description.",
              )
              .setTextInputComponent((b) =>
                b
                  .setCustomId("title")
                  .setMaxLength(256)
                  .setStyle(TextInputStyle.Paragraph)
                  .setValue(embed.title ?? "")
                  .setRequired(false),
              ),
          (l) =>
            l
              .setLabel("Title URL")
              .setDescription("Open this URL when users click the title.")
              .setTextInputComponent((b) =>
                b
                  .setCustomId("url")
                  .setStyle(TextInputStyle.Short)
                  .setValue(embed.url ?? "")
                  .setRequired(false),
              ),
          (l) =>
            l
              .setLabel("Description")
              .setDescription(
                `Markdown-safe text below the title. ${
                  embed.description && embed.description?.length > 4000
                    ? "This value was truncated because Discord's limit for text inputs is 4000."
                    : ""
                }`,
              )
              .setTextInputComponent((b) =>
                b
                  .setCustomId("description")
                  .setMaxLength(4000) // actual limit is 4096, but TextInput is capped lower
                  .setStyle(TextInputStyle.Paragraph)
                  .setValue(embed.description?.slice(0, 4000) ?? "")
                  .setRequired(false),
              ),
        );
        break;
      }
      case "url": {
        modal.setTitle("Set URL");
        modal.addLabelComponents((l) =>
          l
            .setLabel("URL")
            .setDescription(
              "If there is no title, this can still be used alone for creating image galleries.",
            )
            .setTextInputComponent((b) =>
              b
                .setCustomId("url")
                .setStyle(TextInputStyle.Short)
                .setValue(embed.url ?? "")
                .setRequired(false),
            ),
        );
        break;
      }
      case "thumbnail": {
        modal.setTitle("Set Thumbnail");
        modal.addLabelComponents((l) =>
          l
            .setLabel("Thumbnail URL")
            .setDescription("Displayed to the right of all text in the embed.")
            .setTextInputComponent((b) =>
              b
                .setCustomId("thumbnail.url")
                .setStyle(TextInputStyle.Short)
                .setValue(embed.thumbnail?.url ?? "")
                .setRequired(false),
            ),
        );
        break;
      }
      case "fields": {
        const isNewField = inner === "new";
        const prefix = isNewField
          ? `fields.${embed.fields ? embed.fields.length : 0}`
          : `fields.${inner}`;
        const field = isNewField ? undefined : embed.fields?.[Number(inner)];

        modal.setTitle(isNewField ? "New Field" : "Set Field");
        modal.addLabelComponents(
          (l) =>
            l
              .setLabel("Name")
              .setDescription(
                "Short, semibold text that supports a markdown subset.",
              )
              .setTextInputComponent((b) =>
                b
                  .setCustomId(`${prefix}.name`)
                  .setMaxLength(256)
                  .setStyle(TextInputStyle.Paragraph)
                  .setValue(field?.name ?? "")
                  .setRequired(isNewField),
              ),
          (l) =>
            l
              .setLabel("Value")
              .setDescription("Markdown-safe text below the field name.")
              .setTextInputComponent((b) =>
                b
                  .setCustomId(`${prefix}.value`)
                  .setStyle(TextInputStyle.Paragraph)
                  .setMaxLength(1024)
                  .setValue(field?.value ?? "")
                  .setRequired(isNewField),
              ),
          (l) =>
            l
              .setLabel("Inline?")
              .setStringSelectMenuComponent((s) =>
                s
                  .setCustomId(`${prefix}.inline`)
                  .addOptions(
                    new StringSelectMenuOptionBuilder()
                      .setLabel("True")
                      .setValue("true")
                      .setDescription(
                        "The field will display inline with other fields (up to 3 per line).",
                      )
                      .setDefault(!!field?.inline),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("False")
                      .setValue("false")
                      .setDescription(
                        "The field will take the width of the entire line (default)",
                      )
                      .setDefault(!field?.inline),
                  ),
              ),
        );
        break;
      }
      case "image": {
        modal.setTitle("Set Image");
        modal.addLabelComponents((l) =>
          l
            .setLabel("Image URL")
            .setDescription(
              "Displayed as a large image below all sections except the footer.",
            )
            .setTextInputComponent((b) =>
              b
                .setCustomId("image.url")
                .setStyle(TextInputStyle.Short)
                .setValue(embed.image?.url ?? "")
                .setRequired(false),
            ),
        );
        break;
      }
      case "footer": {
        modal.setTitle("Set Footer");
        modal.addLabelComponents(
          (l) =>
            l
              .setLabel("Text")
              .setDescription(
                "This must be provided to display the footer icon, but is optional for the timestamp.",
              )
              .setTextInputComponent((b) =>
                b
                  .setCustomId("footer.text")
                  .setMaxLength(2048)
                  .setStyle(TextInputStyle.Paragraph)
                  .setValue(embed.footer?.text ?? "")
                  .setRequired(false),
              ),
          (l) =>
            l
              .setLabel("Icon URL")
              .setDescription("An image shown to the left of the footer text.")
              .setTextInputComponent((b) =>
                b
                  .setCustomId("footer.icon_url")
                  .setStyle(TextInputStyle.Short)
                  .setValue(embed.footer?.icon_url ?? "")
                  .setRequired(false),
              ),
          (l) =>
            l
              .setLabel("Timestamp")
              .setDescription(
                'A timestamp like "2025-01-01 14:00:00" or "Jan 1 2025 14:00", parsed in UTC',
              )
              .setTextInputComponent((b) =>
                b
                  .setCustomId("timestamp")
                  .setStyle(TextInputStyle.Short)
                  .setValue(embed.timestamp ?? "")
                  .setRequired(false),
              ),
        );
        break;
      }
      default:
        break;
    }

    if (modal.components.length === 0) {
      return ctx.reply({
        content: "Unable to compile any data to edit.",
        ephemeral: true,
      });
    }
    return [
      ctx.modal(modal),
      async () => {
        // Reset select state
        await ctx.followup.editOriginalMessage({
          components: [
            getQuickEditEmbedContainer(message, embed, Number(embedIndex)),
          ],
        });
      },
    ];
  };
