import {
  ActionRowBuilder,
  ButtonBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  StringSelectMenuBuilder,
} from "@discordjs/builders";
import { isLinkButton } from "discord-api-types/utils";
import {
  APIEmoji,
  APIMessage,
  APISelectMenuOption,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import { t } from "i18next";
import { getDb } from "store";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { AutoComponentCustomId, SelectMenuCallback } from "../../components.js";
import { InteractionContext } from "../../interactions.js";
import { getComponentId, parseAutoComponentId } from "../../util/components.js";
import {
  generateEditorTokenForComponent,
  getEditorTokenComponentUrl,
} from "./add.js";
import { resolveMessageLink } from "./entry.js";

export const editComponentChatEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const message = await resolveMessageLink(
    ctx.rest,
    ctx.getStringOption("message").value,
  );
  if (typeof message === "string") {
    return ctx.reply({
      content: message,
      flags: MessageFlags.Ephemeral,
    });
  }

  return await pickWebhookMessageComponentToEdit(ctx, message);
};

export const pickWebhookMessageComponentToEdit = async (
  ctx: InteractionContext,
  message: APIMessage,
) => {
  const mapping: Record<string, string> = {};

  // const rows = (message.components ?? []).map((row) => ({
  //   ...row,
  //   components: row.components.map(
  //     (component): APIButtonComponentWithCustomId => {
  //       const custom_id = generateId();
  //       switch (component.type) {
  //         case ComponentType.Button:
  //           if (component.style === ButtonStyle.Premium) {
  //             return {
  //               type: component.type,
  //               style: ButtonStyle.Primary,
  //               custom_id,
  //               label: "Premium",
  //               emoji: { name: "🛒" },
  //               // We can't really do anything with these
  //               disabled: true,
  //             };
  //           }
  //           if (component.style === ButtonStyle.Link) {
  //             return {
  //               type: component.type,
  //               style: ButtonStyle.Secondary,
  //               custom_id,
  //               label: component.label,
  //               emoji: component.emoji,
  //             };
  //           }
  //           return {
  //             ...component,
  //             custom_id,
  //           };
  //         case ComponentType.StringSelect:
  //           return {
  //             type: ComponentType.Button,
  //             custom_id,
  //           };
  //         default:
  //           break;
  //       }
  //     },
  //   ),
  // }));

  const emojis = ctx.interaction.guild_id
    ? ((await ctx.rest.get(
        Routes.guildEmojis(ctx.interaction.guild_id),
      )) as APIEmoji[])
    : [];

  const options = (message.components ?? []).flatMap((row, ri) =>
    row.components
      .map((component, ci): APISelectMenuOption | undefined => {
        const id = getComponentId(component);
        const value = id
          ? `id:${id}`
          : component.type === ComponentType.Button && isLinkButton(component)
            ? `link:${ri}-${ci}`
            : `unknown:${ri}-${ci}`;

        switch (component.type) {
          case ComponentType.Button: {
            if (component.style === ButtonStyle.Premium) {
              return undefined;
            }
            const styleEmoji: Record<typeof component.style, string> = {
              [ButtonStyle.Danger]: "🟥",
              [ButtonStyle.Link]: "🌐",
              [ButtonStyle.Primary]: "🟦",
              [ButtonStyle.Secondary]: "⬜",
              [ButtonStyle.Success]: "🟩",
            };
            const emoji = component.emoji?.id
              ? emojis.find((e) => e.id === component.emoji?.id)
                ? component.emoji
                : { name: styleEmoji[component.style] }
              : component.emoji?.name
                ? component.emoji
                : { name: styleEmoji[component.style] };

            return {
              label: component.label ?? "Emoji-only",
              value,
              description: `${
                component.style === ButtonStyle.Link ? "Link button" : "Button"
              }, row ${ri + 1}, column ${ci + 1}`,
              emoji,
            };
          }
          case ComponentType.StringSelect:
            return {
              label: (
                component.placeholder ?? `${component.options.length} options`
              ).slice(0, 100),
              value,
              description: `Select menu, row ${ri + 1}`,
              emoji: { name: "🔽" },
            };
          case ComponentType.ChannelSelect:
          case ComponentType.MentionableSelect:
          case ComponentType.RoleSelect:
          case ComponentType.UserSelect:
            return {
              label: (
                component.placeholder ??
                `${component.default_values?.length ?? 0} defaults`
              ).slice(0, 100),
              value,
              description: `Select menu, row ${ri + 1}`,
              emoji: {
                name:
                  component.type === ComponentType.ChannelSelect
                    ? "#️⃣"
                    : component.type === ComponentType.MentionableSelect
                      ? "*️⃣"
                      : component.type === ComponentType.RoleSelect
                        ? "🏷️"
                        : "👤",
              },
            };
          default:
            break;
        }
      })
      .filter((c): c is APISelectMenuOption => !!c),
  );

  if (options.length === 0) {
    return ctx.reply({
      content: "That message has no components that can be picked from.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(
      `a_edit-component-flow-pick_${message.id}` satisfies AutoComponentCustomId,
    )
    .setPlaceholder("Select a component to edit")
    .addOptions(options);

  return ctx.reply({
    components: [
      new ActionRowBuilder<typeof select>().addComponents(select).toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export const editComponentFlowPickCallback: SelectMenuCallback = async (
  ctx,
) => {
  const { messageId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
  );

  const db = getDb(ctx.env.HYPERDRIVE.connectionString);

  const [scope, key] = ctx.interaction.data.values[0].split(":");
  switch (scope as "id" | "link" | "unknown") {
    case "id": {
      const id = BigInt(key);
      const component = await db.query.discordMessageComponents.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          id: true,
          guildId: true,
          messageId: true,
        },
      });
      if (
        !component ||
        component.guildId?.toString() !== ctx.interaction.guild_id ||
        component.messageId?.toString() !== messageId
      ) {
        return ctx.updateMessage({
          content: "Unknown component",
          components: [],
        });
      }

      return ctx.updateMessage({
        content:
          "What aspect of this component would you like to edit? Surface details are what users can see before clicking on the component.",
        components: [
          new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(
              new SelectMenuBuilder()
                .setCustomId(
                  `a_edit-component-flow-mode_${messageId}:${component.id}` satisfies AutoComponentCustomId,
                )
                .addOptions(
                  new SelectMenuOptionBuilder()
                    .setLabel("Details")
                    .setValue("internal")
                    .setDescription(
                      "Just change the surface details without leaving Discord",
                    ),
                  new SelectMenuOptionBuilder()
                    .setLabel("Everything")
                    .setValue("external")
                    .setDescription(
                      "Change what happens when this component is used",
                    ),
                ),
            )
            .toJSON(),
        ],
      });
    }
    default:
      // As far as we know, this component doesn't exist in the database or
      // it's a type that we can't handle. What do you do here?
      // Answer for a prize: https://github.com/discohook/discohook/issues
      return ctx.reply({
        content: "Cannot resolve that component from the database.",
        flags: MessageFlags.Ephemeral,
      });
  }
};

export const editComponentFlowModeCallback: SelectMenuCallback = async (
  ctx,
) => {
  const { messageId, componentId } = parseAutoComponentId(
    ctx.interaction.data.custom_id,
    "messageId",
    "componentId",
  );
  const mode = ctx.interaction.data.values[0] as "internal" | "external";

  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
  const component = await db.query.discordMessageComponents.findFirst({
    where: (table, { eq }) => eq(table.id, BigInt(componentId)),
    columns: {
      id: true,
      data: true,
      guildId: true,
      messageId: true,
    },
  });
  if (
    !component ||
    component.guildId?.toString() !== ctx.interaction.guild_id ||
    component.messageId?.toString() !== messageId
  ) {
    // This shouldn't happen unless the component was deleted in between
    // running the command and selecting the option
    return ctx.updateMessage({ content: "Unknown component", components: [] });
  }

  if (mode === "internal") {
    // Modal for changing the values
  }

  const editorToken = await generateEditorTokenForComponent(
    db,
    ctx.env,
    component.id,
    {
      interactionId: ctx.interaction.id,
      user: {
        id: ctx.user.id,
        name: ctx.user.username,
        avatar: ctx.user.avatar,
      },
    },
  );

  return ctx.updateMessage({
    content: "Click the button to open your browser and edit the component.",
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(t("customize"))
            .setURL(getEditorTokenComponentUrl(editorToken, ctx.env)),
        )
        .toJSON(),
    ],
  });
};
