import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  messageLink,
} from "@discordjs/builders";
import dedent from "dedent-js";
import {
  APIButtonComponent,
  APIInteraction,
  APIMessage,
  APIModalInteractionResponseCallbackData,
  APISelectMenuComponent,
  APIStringSelectComponent,
  APIWebhook,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  Routes,
  TextInputStyle,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb, getchGuild, upsertDiscordUser, upsertGuild } from "store";
import {
  discordMessageComponents,
  generateId,
  makeSnowflake,
} from "store/src/schema";
import { StorableComponent } from "store/src/types/components.js";
import {
  ButtonCallback,
  MinimumKVComponentState,
  ModalCallback,
  SelectMenuCallback,
} from "../../components.js";
import { InteractionContext } from "../../interactions.js";
import { webhookAvatarUrl } from "../../util/cdn.js";
import {
  getComponentWidth,
  getRowWidth,
  storeComponents
} from "../../util/components.js";
import { isDiscordError } from "../../util/error.js";
import { color } from "../../util/meta.js";
import { BUTTON_URL_RE } from "../../util/regex.js";
import { base64UrlEncode } from "../../util/text.js";
import { getUserPremiumDetails } from "../../util/user.js";

const buildStorableComponent = (
  component: StorableComponent,
  customId?: string,
): APIButtonComponent | APISelectMenuComponent | undefined => {
  switch (component.type) {
    case ComponentType.Button:
      return {
        type: component.type,
        custom_id: component.style === ButtonStyle.Link ? undefined : customId,
        url: component.style === ButtonStyle.Link ? component.url : undefined,
        style: component.style,
        label: component.label,
        emoji: component.emoji,
        disabled: component.disabled,
      } as APIButtonComponent;
    case ComponentType.StringSelect:
      return {
        type: component.type,
        custom_id: customId,
        placeholder: component.placeholder,
        disabled: component.disabled,
        min_values: component.minValues,
        max_values: component.maxValues,
        options: component.options,
      } as APIStringSelectComponent;
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return {
        type: component.type,
        custom_id: customId,
        placeholder: component.placeholder,
        disabled: component.disabled,
        min_values: component.minValues,
        max_values: component.maxValues,
        default_values: component.defaultValues,
      } as APISelectMenuComponent;
    default:
      break;
  }
};

interface ComponentFlow extends MinimumKVComponentState {
  step: number;
  stepTitle: string;
  totalSteps?: number;
  steps?: {
    label: string;
  }[];
  webhookToken: string;
  message: {
    id: string;
    channelId: string;
    guildId: string;
    webhookId: string;
    webhookName: string;
    webhookAvatar: string | null;
  };
  user: {
    id: string;
    premium: ReturnType<typeof getUserPremiumDetails>;
  };
  component?: StorableComponent;
}

const getComponentFlowEmbed = (flow: ComponentFlow) => {
  const embed = new EmbedBuilder({
    title:
      flow.stepTitle +
      (flow.totalSteps
        ? ` - Step ${flow.step}/${flow.totalSteps} (${Math.floor(
            (flow.step / flow.totalSteps) * 100,
          )}%)`
        : ""),
    description: flow.steps
      ? flow.steps.map((step, i) => `${i + 1}. ${step.label}`).join("\n")
      : undefined,
    color,
  }).addFields({
    name: "Message",
    value: messageLink(
      flow.message.channelId,
      flow.message.id,
      flow.message.guildId,
    ),
  });

  if (flow.step === 0) {
    embed.setThumbnail(
      webhookAvatarUrl({
        id: flow.message.webhookId,
        avatar: flow.message.webhookAvatar,
      }),
    );
  } else {
    embed.setAuthor({
      name: flow.message.webhookName.slice(0, 256) || "Webhook",
      iconURL: webhookAvatarUrl({
        id: flow.message.webhookId,
        avatar: flow.message.webhookAvatar,
      }),
    });
  }

  return embed;
};

const registerComponent = async (
  ctx: InteractionContext<APIInteraction>,
  flow: ComponentFlow,
) => {
  // biome-ignore lint/style/noNonNullAssertion: It's not null
  const data = flow.component!;

  const id = BigInt(generateId());
  const customId =
    data.type === ComponentType.Button && data.style === ButtonStyle.Link
      ? undefined
      : `p_${id}`;
  const built = buildStorableComponent(data, customId);
  if (!built) {
    throw new Error(`Failed to built the component (type ${data.type}).`);
  }
  const requiredWidth = getComponentWidth(built);

  let message: APIMessage | undefined = undefined;
  try {
    message = (await ctx.rest.get(
      Routes.webhookMessage(
        flow.message.webhookId,
        flow.webhookToken,
        flow.message.id,
      ),
    )) as APIMessage;
  } catch {
    throw new Error(dedent`
      Failed to fetch the message (${flow.message.id}).
      Make sure the webhook (${flow.message.webhookId})
      exists and is in the same channel.
    `);
  }
  // const components = message.components
  //   ? message.components.map(c => new ActionRowBuilder(c))
  //   : [new ActionRowBuilder()];

  const components = message.components ?? [new ActionRowBuilder().toJSON()];
  let nextAvailableRow = components.find(
    (c) => 5 - getRowWidth(c) >= requiredWidth,
  );
  if (!nextAvailableRow && components.length < 5) {
    nextAvailableRow = new ActionRowBuilder().toJSON();
    components.push(nextAvailableRow);
  } else if (!nextAvailableRow) {
    throw new Error(
      `No available slots for this component (need at least ${requiredWidth}).`,
    );
  }
  nextAvailableRow.components.push(built);

  const db = getDb(ctx.env.DATABASE_URL);
  const returned = await db
    .insert(discordMessageComponents)
    .values({
      id,
      guildId: makeSnowflake(flow.message.guildId),
      channelId: makeSnowflake(flow.message.channelId),
      messageId: makeSnowflake(flow.message.id),
      createdById: makeSnowflake(flow.user.id),
      data,
    })
    .onConflictDoUpdate({
      target: discordMessageComponents.id,
      set: {
        data,
        draft: false,
        updatedAt: new Date(),
        updatedById: makeSnowflake(flow.user.id),
      },
    })
    .returning({
      id: discordMessageComponents.id,
    });

  let editedMsg: APIMessage;
  try {
    editedMsg = (await ctx.rest.patch(
      Routes.webhookMessage(
        flow.message.webhookId,
        flow.webhookToken,
        flow.message.id,
      ),
      { body: { components } },
    )) as APIMessage;
  } catch (e) {
    if (isDiscordError(e)) {
      // await db
      //   .delete(discordMessageComponents)
      //   .where(eq(discordMessageComponents.id, returned[0].id));
      await db
        .update(discordMessageComponents)
        .set({
          draft: true,
        })
        .where(eq(discordMessageComponents.id, returned[0].id));
    }
    throw e;
  }
  return editedMsg;
};

export const startComponentFlow = async (
  ctx: InteractionContext<APIInteraction>,
  message: APIMessage,
) => {
  const db = getDb(ctx.env.DATABASE_URL);
  const user = await upsertDiscordUser(db, ctx.user);

  if (!message.webhook_id) {
    return ctx.reply({
      content: "This is not a webhook message.",
      flags: MessageFlags.Ephemeral,
    });
  }
  const webhook = (await ctx.rest.get(
    Routes.webhook(message.webhook_id),
  )) as APIWebhook;
  const webhookToken = webhook.token;
  if (!webhookToken) {
    return ctx.reply({
      content: dedent`
        Webhook token (ID ${message.webhook_id}) was not available.
        It may be an incompatible type of webhook, or it may have been
        created by a different bot user.
      `,
      flags: MessageFlags.Ephemeral,
    });
  }

  const componentFlow: ComponentFlow = {
    componentTimeout: 60,
    componentRoutingId: "add-component-flow",
    step: 0,
    stepTitle: "Add Component",
    webhookToken,
    message: {
      id: message.id,
      channelId: message.channel_id,
      // biome-ignore lint/style/noNonNullAssertion:
      guildId: ctx.interaction.guild_id!,
      webhookId: message.webhook_id,
      webhookName: message.author.username,
      webhookAvatar: message.author.avatar,
    },
    user: {
      id: String(user.id),
      premium: getUserPremiumDetails(user),
    },
  };

  // Maybe switch to a quickie web form instead of a long flow like this
  // but some users prefer to stay within discord (for whatever reason!)
  return [
    ctx.reply({
      embeds: [getComponentFlowEmbed(componentFlow).toJSON()],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(
            await storeComponents(ctx.env.KV, [
              new StringSelectMenuBuilder({
                placeholder: "Select a component type",
                options: [
                  {
                    label: "Button",
                    description: "One press to execute one or several actions",
                    value: "button",
                    emoji: { name: "🟦" },
                  },
                  {
                    label: "Link Button",
                    description: "Direct a user to a specified URL",
                    value: "link-button",
                    emoji: { name: "🌐" },
                  },
                  {
                    label: "String Select",
                    description:
                      "Select from a custom list of options to execute actions",
                    value: "string-select",
                    emoji: { name: "🔽" },
                  },
                  {
                    label: "User Select",
                    description:
                      "Select from a list of users to execute actions",
                    value: "user-select",
                    emoji: { name: "👤" },
                  },
                  {
                    label: "Role Select",
                    description:
                      "Select from a list of roles to execute actions",
                    value: "role-select",
                    emoji: { name: "🏷️" },
                  },
                  {
                    label: "User/Role Select",
                    description:
                      "Select from a list of users and roles to execute actions",
                    value: "mentionable-select",
                    emoji: { name: "*️⃣" },
                  },
                  {
                    label: "Channel Select",
                    description:
                      "Select from a list of channels to execute actions",
                    value: "channel-select",
                    emoji: { name: "#️⃣" },
                  },
                ],
              }),
              {
                ...componentFlow,
                componentOnce: true,
              },
            ]),
          )
          .toJSON(),
      ],
      flags: MessageFlags.Ephemeral,
    }),
    async () => {
      const guild = await getchGuild(
        ctx.rest,
        ctx.env.KV,
        // biome-ignore lint/style/noNonNullAssertion:
        ctx.interaction.guild_id!,
      );
      await upsertGuild(db, guild);
    },
  ];
};

export const continueComponentFlow: SelectMenuCallback = async (ctx) => {
  const value = ctx.interaction.data.values[0];

  const state = ctx.state as ComponentFlow;
  state.steps = [];
  state.steps.push({
    label: `Select component type (${value.replace("-", " ")})`,
  });

  state.step += 1;
  switch (value) {
    case "button": {
      const db = getDb(ctx.env.DATABASE_URL);
      const id = BigInt(generateId());
      state.component = state.component ?? {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        flow: {
          name: "Flow",
          actions: [],
        },
        label: "New Component",
      };

      const component = (
        await db
          .insert(discordMessageComponents)
          .values({
            id,
            guildId: makeSnowflake(state.message.guildId),
            channelId: makeSnowflake(state.message.channelId),
            messageId: makeSnowflake(state.message.id),
            data: state.component,
            createdById: makeSnowflake(state.user.id),
            updatedById: makeSnowflake(state.user.id),
            draft: true,
          })
          .returning({
            id: discordMessageComponents.id,
          })
      )[0];

      state.stepTitle = "Finish on the web";
      state.totalSteps = 3;
      return ctx.updateMessage({
        embeds: [getComponentFlowEmbed(state).toJSON()],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Customize")
                .setURL(
                  `${ctx.env.DISCOHOOK_ORIGIN}/flows?${new URLSearchParams({
                    id: String(component.id),
                  })}`,
                ),
            )
            .toJSON(),
        ],
      });
    }
    case "link-button": {
      state.stepTitle = "Customize the button's link, label, & emoji";
      state.totalSteps = 3;
      state.component = {
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        url: "",
      };

      const modal = new ModalBuilder()
        .setTitle("Custom button values")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("label")
              .setLabel("Label")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setMaxLength(80)
              .setPlaceholder("The text displayed on this button."),
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("emoji")
              .setLabel("Emoji")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setPlaceholder("Like :smile: or a custom emoji in the server."),
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("url")
              .setLabel("Button URL")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
              .setPlaceholder(
                "The full URL this button will lead to when it is clicked.",
              ),
          ),
        );

      await storeComponents(ctx.env.KV, [
        modal,
        {
          ...state,
          componentTimeout: 600,
          componentRoutingId: "add-component-flow_customize-modal",
          componentOnce: false,
        },
      ]);

      return [
        ctx.modal(modal.toJSON()),
        async () => {
          await ctx.followup.editOriginalMessage({
            embeds: [getComponentFlowEmbed(state).toJSON()],
            components: [
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                  await storeComponents(ctx.env.KV, [
                    new ButtonBuilder({
                      style: ButtonStyle.Primary,
                      label: "Open modal",
                    }),
                    {
                      componentRoutingId:
                        "add-component-flow_customize-modal-resend",
                      componentTimeout: 600,
                      modal: modal.toJSON(),
                    },
                  ]),
                )
                .toJSON(),
            ],
          });
        },
      ];
    }
    case "string-select":
    case "user-select":
    case "role-select":
    case "mentionable-select":
    case "channel-select": {
      state.stepTitle = "Finish on the web";
      state.totalSteps = 3;
      return ctx.updateMessage({
        embeds: [getComponentFlowEmbed(state).toJSON()],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Customize")
                .setURL(
                  `${ctx.env.DISCOHOOK_ORIGIN}/component?${new URLSearchParams({
                    data: base64UrlEncode(
                      JSON.stringify({
                        type:
                          value === "string-select"
                            ? 3
                            : value === "user-select"
                              ? 4
                              : value === "role-select"
                                ? 5
                                : value === "mentionable-select"
                                  ? 6
                                  : value === "channel-select"
                                    ? 7
                                    : undefined,
                        // ...(value === "string-select"
                        //   ? {
                        //       options: [],
                        //     }
                        //   : {}),
                      }),
                    ),
                    resolved: base64UrlEncode(
                      JSON.stringify({
                        guildId: state.message.guildId,
                        webhook: {
                          id: state.message.webhookId,
                          name: state.message.webhookName,
                          avatar: state.message.webhookAvatar,
                        },
                      }),
                    ),
                  })}`,
                ),
            )
            .toJSON(),
        ],
      });
    }
    default:
      break;
  }

  return ctx.updateMessage({
    embeds: [getComponentFlowEmbed(state).toJSON()],
    components: [],
  });
};

export const reopenCustomizeModal: ButtonCallback = async (ctx) => {
  const state = ctx.state as MinimumKVComponentState & {
    modal: APIModalInteractionResponseCallbackData;
  };
  return ctx.modal(state.modal);
};

export const submitCustomizeModal: ModalCallback = async (ctx) => {
  const state = ctx.state as ComponentFlow;

  if (state.component?.type === ComponentType.Button) {
    const label = ctx.getModalComponent("label").value;
    const emoji = ctx.getModalComponent("emoji").value;

    if (!label && !emoji) {
      return ctx.reply({
        content: "Must provide either a label or emoji.",
        flags: MessageFlags.Ephemeral,
      });
    }

    state.component.label = label;
    // state.component.emoji = emoji;
    // state.step += 1;
    // state.steps?.push({ label: `Set label (${escapeMarkdown(label)})` });
    // state.step += 1;
    // state.steps?.push({ label: `Set emoji (${escapeMarkdown(label)})` });

    if (state.component.style === ButtonStyle.Link) {
      const url = ctx.getModalComponent("url").value;
      if (!BUTTON_URL_RE.test(url)) {
        return ctx.reply({
          content:
            "Invalid URL. Must be a `http://`, `https://`, or `discord://` address.",
          flags: MessageFlags.Ephemeral,
        });
      }
      try {
        new URL(url);
      } catch {
        return ctx.reply({
          content: "Invalid URL.",
          flags: MessageFlags.Ephemeral,
        });
      }

      state.component.url = url;
      state.step += 1;
      state.steps?.push({ label: "Set label, emoji, and URL" });

      try {
        await registerComponent(ctx, state);
      } catch (e) {
        console.error(e);
        return ctx.reply({ content: String(e), flags: MessageFlags.Ephemeral });
      }

      return ctx.updateMessage({
        embeds: [getComponentFlowEmbed(state).toJSON()],
        components: [],
      });
    }
  }

  return ctx.reply("a");
};
