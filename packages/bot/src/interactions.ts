import {
  ComponentBuilder,
  EmbedBuilder,
  type MessageComponentBuilder,
  ModalBuilder,
} from "@discordjs/builders";
import type { REST } from "@discordjs/rest";
import {
  type APIAllowedMentions,
  type APIApplicationCommandInteractionDataBooleanOption,
  type APIApplicationCommandInteractionDataIntegerOption,
  type APIApplicationCommandInteractionDataNumberOption,
  type APIApplicationCommandInteractionDataOption,
  type APIApplicationCommandInteractionDataStringOption,
  type APIApplicationCommandInteractionDataSubcommandOption,
  type APIAttachment,
  type APIEmbed,
  type APIGuildInteraction,
  type APIGuildMember,
  type APIInteraction,
  type APIInteractionDataResolved,
  type APIInteractionResponse,
  type APIInteractionResponseCallbackData,
  type APIInteractionResponseChannelMessageWithSource,
  type APIInteractionResponseDeferredChannelMessageWithSource,
  type APIInteractionResponseDeferredMessageUpdate,
  type APIInteractionResponseUpdateMessage,
  type APIMessage,
  type APIMessageApplicationCommandInteraction,
  type APIMessageComponentInteraction,
  type APIMessageTopLevelComponent,
  type APIModalInteractionResponse,
  type APIModalInteractionResponseCallbackData,
  type APIModalSubmitInteraction,
  type APIPartialChannel,
  type APIRole,
  type APIUser,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  EntitlementType,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  type ModalSubmitComponent,
  type RESTAPIPoll,
  type RESTGetAPIInteractionFollowupResult,
  type RESTPatchAPIInteractionFollowupResult,
  type RESTPostAPIInteractionFollowupResult,
  Routes,
} from "discord-api-types/v10";
import {
  MessageFlagsBitField,
  PermissionFlags,
  PermissionsBitField,
} from "discord-bitflag";
import { getDate, type Snowflake } from "discord-snowflake";
import { t as nativeT, type TOptionsBase } from "i18next";
import type { MinimumKVComponentState } from "./components.js";
import type { APIPartialResolvedChannel } from "./types/api.js";
import type { Env } from "./types/env.js";

export interface MessageConstructorData
  extends Pick<
    APIInteractionResponseCallbackData,
    "content" | "attachments" | "flags" | "tts"
  > {
  embeds?: (EmbedBuilder | APIEmbed)[];
  components?: (MessageComponentBuilder | APIMessageTopLevelComponent)[];
  poll?: RESTAPIPoll;
  // poll?: (PollBuilder | RESTAPIPoll);
  allowedMentions?: APIAllowedMentions;
  appliedTags?: string[];
  threadName?: string;
  ephemeral?: boolean;
  componentsV2?: boolean;
}

export const isInteractionResponse = (
  response: any,
): response is APIInteractionResponse =>
  "type" in response &&
  Object.keys(InteractionResponseType).includes(response.type);

const messageConstructorDataToResponseCallbackData = (
  data: string | MessageConstructorData,
): APIInteractionResponseCallbackData => {
  if (typeof data === "string") return { content: data };

  const flags = new MessageFlagsBitField(data.flags ?? 0);
  if (data.ephemeral !== undefined) {
    flags.set(MessageFlags.Ephemeral, data.ephemeral);
  }
  if (data.componentsV2 !== undefined) {
    flags.set(MessageFlags.IsComponentsV2, data.componentsV2);
  }
  const constructed: APIInteractionResponseCallbackData = {
    content: data.content,
    allowed_mentions: data.allowedMentions,
    attachments: data.attachments,
    applied_tags: data.appliedTags,
    tts: data.tts,
    thread_name: data.threadName,
  };

  if (flags.value !== 0n) {
    constructed.flags = Number(flags.value);
  }
  if (data.embeds) {
    constructed.embeds = data.embeds.map((e) =>
      e instanceof EmbedBuilder ? e.toJSON() : e,
    );
  }
  if (data.components) {
    constructed.components = data.components.map((e) =>
      e instanceof ComponentBuilder
        ? (e.toJSON() as APIMessageTopLevelComponent)
        : e,
    );
  }
  if (data.poll) {
    constructed.poll = data.poll;
  }

  return constructed;
};

export class InteractionContext<
  T extends APIInteraction = APIInteraction,
  S extends MinimumKVComponentState | Record<string, any> = {},
> {
  public rest: REST;
  public interaction: T;
  public followup: InteractionFollowup;
  public env: Env;
  public state: S | Record<string, any> = {};

  constructor(rest: REST, interaction: T, env: Env, state?: S) {
    this.rest = rest;
    this.interaction = interaction;
    this.env = env;
    this.followup = new InteractionFollowup(
      rest,
      interaction,
      env.DISCORD_APPLICATION_ID,
    );

    if (state) {
      this.state = state;
    }
  }

  get isDeveloper(): boolean {
    return (
      this.env.DEV_OWNER_ID !== undefined &&
      this.user.id === this.env.DEV_OWNER_ID
    );
  }

  get createdAt(): Date {
    return getDate(this.interaction.id as Snowflake);
  }

  get appPermissons() {
    return new PermissionsBitField(
      this.interaction.app_permissions
        ? BigInt(this.interaction.app_permissions)
        : 0,
    );
  }

  get userPermissons() {
    return new PermissionsBitField(
      this.interaction.member
        ? BigInt(this.interaction.member.permissions)
        : PermissionFlags.ViewChannel |
            PermissionFlags.ReadMessageHistory |
            PermissionFlags.SendMessages |
            PermissionFlags.AddReactions |
            PermissionFlags.EmbedLinks,
    );
  }

  get user() {
    return this.interaction.member
      ? this.interaction.member.user
      : // biome-ignore lint/style/noNonNullAssertion: There will always be one of these
        this.interaction.user!;
  }

  get premium() {
    const entitlements = this.interaction.entitlements;
    const details: {
      active: boolean;
      grace?: boolean;
      graceEndsAt?: Date;
      subscribedAt?: Date;
      endsAt?: Date;
      purchased?: boolean;
      lifetime?: boolean;
    } = {
      active: entitlements.length !== 0,
      lifetime:
        !!this.env.LIFETIME_SKU &&
        entitlements.map((e) => e.sku_id).includes(this.env.LIFETIME_SKU),
    };

    if (details.lifetime) return details;

    // We might have several SKUs that grant premium access
    for (const entitlement of entitlements) {
      if (entitlement.ends_at) {
        details.endsAt = new Date(entitlement.ends_at);
      }
      if (entitlement.starts_at) {
        details.subscribedAt = new Date(entitlement.starts_at);
      }
      if (
        // Only give grace periods for purchased subscriptions
        // Might be jankily inconsistent with the site's logic
        entitlement.type === EntitlementType.ApplicationSubscription &&
        entitlement.ends_at
      ) {
        details.purchased = true;
        const diff =
          (new Date(entitlement.ends_at).getTime() - new Date().getTime()) /
          86_400_000;
        if (diff <= 0) {
          if (diff < 3) {
            details.active = false;
          } else {
            details.grace = true;
            // details.graceDaysRemaining = 3 - Math.floor(diff);
            details.graceEndsAt = new Date(
              new Date(entitlement.ends_at).getTime() + 3 * 86_400_000,
            );
          }
        }
      }
    }

    return details;
  }

  isPremium() {
    return this.premium.active;
  }

  get expiresAt(): Date {
    return new Date(
      // 15 minutes
      getDate(this.interaction.id as Snowflake).getTime() + 900_000,
    );
  }

  isExpired(): boolean {
    // assume 100ms margin of error
    return new Date().getTime() > this.expiresAt.getTime() - 100;
  }

  /** call `t` using the user locale or fallback to guild locale */
  t(key: string, options?: TOptionsBase) {
    const locale = this.user.locale ?? this.interaction.guild_locale ?? "en";
    return nativeT(key, { lng: locale, ...options });
  }

  /**
   * For message command interactions, the message that the command was
   * performed on. For component interactions, the message that the component
   * is attached to. Otherwise, undefined.
   */
  getMessage(): T extends APIMessageApplicationCommandInteraction
    ? APIMessage
    : undefined;
  getMessage(): T extends APIMessageComponentInteraction
    ? APIMessage
    : undefined;
  getMessage(): APIMessage | undefined {
    if (
      this.interaction.type === InteractionType.ApplicationCommand &&
      this.interaction.data.type === ApplicationCommandType.Message
    ) {
      return this.interaction.data.resolved.messages[
        this.interaction.data.target_id
      ];
    } else if (this.interaction.type === InteractionType.MessageComponent) {
      return this.interaction.message;
    }
  }

  _getSubcommand(): APIApplicationCommandInteractionDataSubcommandOption | null {
    if (
      ![
        InteractionType.ApplicationCommand,
        InteractionType.ApplicationCommandAutocomplete,
      ].includes(this.interaction.type) ||
      !this.interaction.data ||
      !("options" in this.interaction.data) ||
      !this.interaction.data.options
    ) {
      return null;
    }

    let subcommand: APIApplicationCommandInteractionDataSubcommandOption | null =
      null;
    const loop = (option: APIApplicationCommandInteractionDataOption) => {
      if (subcommand) return;
      if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
        for (const opt of option.options) {
          loop(opt);
        }
      } else if (option.type === ApplicationCommandOptionType.Subcommand) {
        subcommand = option;
      }
    };
    for (const option of this.interaction.data.options) {
      loop(option);
    }

    return subcommand;
  }

  _getOption(name: string) {
    if (
      ![
        InteractionType.ApplicationCommand,
        InteractionType.ApplicationCommandAutocomplete,
      ].includes(this.interaction.type) ||
      !this.interaction.data ||
      !("options" in this.interaction.data) ||
      !this.interaction.data.options
    ) {
      return null;
    }
    const subcommand = this._getSubcommand();
    const options = subcommand
      ? subcommand.options
      : this.interaction.data.options;
    if (!options) {
      return null;
    }

    return options.find((o) => o.name === name);
  }

  _getOptionWithDefault<O extends APIApplicationCommandInteractionDataOption>(
    name: string,
    type: ApplicationCommandOptionType,
    def: Partial<O>,
  ): O {
    const option = this._getOption(name);
    if (!option || option.type !== type) {
      return {
        name,
        type,
        ...def,
      } as O;
    }
    return option as O;
  }

  _getResolvableOption<O>(
    name: string,
    type:
      | ApplicationCommandOptionType.User
      | ApplicationCommandOptionType.Mentionable
      | ApplicationCommandOptionType.Role
      | ApplicationCommandOptionType.Channel
      | ApplicationCommandOptionType.Attachment,
    key: keyof APIInteractionDataResolved,
  ) {
    const option = this._getOption(name);
    if (
      !option ||
      option.type !== type ||
      !(
        this.interaction.type === InteractionType.ApplicationCommand ||
        this.interaction.type === InteractionType.ApplicationCommandAutocomplete
      ) ||
      this.interaction.data.type === ApplicationCommandType.PrimaryEntryPoint ||
      !this.interaction.data.resolved
    ) {
      return null;
    }

    const id = option.value;
    // @ts-expect-error
    const objects = this.interaction.data.resolved[key];
    if (!objects) return null;

    const object = objects[id];
    if (!object) return null;

    return object as O;
  }

  getStringOption(name: string) {
    return this._getOptionWithDefault<APIApplicationCommandInteractionDataStringOption>(
      name,
      ApplicationCommandOptionType.String,
      { value: "" },
    );
  }

  getIntegerOption(name: string) {
    return this._getOptionWithDefault<APIApplicationCommandInteractionDataIntegerOption>(
      name,
      ApplicationCommandOptionType.Integer,
      { value: -1 },
    );
  }

  getNumberOption(name: string) {
    return this._getOptionWithDefault<APIApplicationCommandInteractionDataNumberOption>(
      name,
      ApplicationCommandOptionType.Integer,
      { value: -1 },
    );
  }

  getBooleanOption(name: string) {
    return this._getOptionWithDefault<APIApplicationCommandInteractionDataBooleanOption>(
      name,
      ApplicationCommandOptionType.Boolean,
      { value: false },
    );
  }

  getAttachmentOption(name: string) {
    return this._getResolvableOption<APIAttachment>(
      name,
      ApplicationCommandOptionType.Attachment,
      "attachments",
    );
  }

  getChannelOption(name: string) {
    return this._getResolvableOption<APIPartialResolvedChannel>(
      name,
      ApplicationCommandOptionType.Channel,
      "channels",
    );
  }

  getAutocompleteChannelOption(name: string) {
    // Autocomplete options are not resolved
    if (
      this.interaction.type === InteractionType.ApplicationCommandAutocomplete
    ) {
      const option = this._getOption(name);
      if (!option || option.type !== ApplicationCommandOptionType.Channel) {
        return null;
      }
      return {
        id: option.value,
        name: "unknown",
        // I don't like this. We should at least pick one from channel_types
        type: ChannelType.GuildText,
      } satisfies APIPartialChannel;
    }
    return null;
  }

  getUserOption(name: string) {
    return this._getResolvableOption<APIUser>(
      name,
      ApplicationCommandOptionType.User,
      "users",
    );
  }

  // Identical to `getUserOption` but asserts that the caller wants an `APIMember`
  getMemberOption(name: string) {
    const user = this.getUserOption(name);

    if (user) {
      const member = this._getResolvableOption<
        Omit<APIGuildMember, "user" | "deaf" | "mute">
      >(name, ApplicationCommandOptionType.User, "members");

      return { ...member, user } as Omit<APIGuildMember, "deaf" | "mute"> & {
        user: APIUser;
      };
    }
    return null;
  }

  getRoleOption(name: string) {
    return this._getResolvableOption<APIRole>(
      name,
      ApplicationCommandOptionType.Role,
      "roles",
    );
  }

  getMentionableOption(
    name: string,
  ):
    | (T extends APIGuildInteraction
        ? APIRole | (APIGuildMember & { user: APIUser })
        : APIRole | (APIGuildMember & { user: APIUser }) | APIUser)
    | null;
  getMentionableOption(
    name: string,
  ): (APIRole | (APIGuildMember & { user: APIUser }) | APIUser) | null {
    const role = this._getResolvableOption<APIRole>(
      name,
      ApplicationCommandOptionType.Mentionable,
      "roles",
    );
    if (role) return role;

    const member = this._getResolvableOption<APIGuildMember>(
      name,
      ApplicationCommandOptionType.Mentionable,
      "members",
    );
    if (member) {
      // biome-ignore lint/style/noNonNullAssertion: Required when member is present
      const user = this._getResolvableOption<APIUser>(
        name,
        ApplicationCommandOptionType.Mentionable,
        "users",
      )!;
      return {
        ...member,
        user,
      } as APIGuildMember & { user: APIUser };
    }

    const user = this._getResolvableOption<APIUser>(
      name,
      ApplicationCommandOptionType.Mentionable,
      "users",
    );
    return user;
  }

  getModalComponent(
    customId: string,
  ): T extends APIModalSubmitInteraction ? ModalSubmitComponent : undefined;
  getModalComponent(customId: string): ModalSubmitComponent | undefined {
    if (this.interaction.type !== InteractionType.ModalSubmit) return undefined;

    const allComponents = [];
    for (const row of this.interaction.data.components) {
      allComponents.push(...row.components);
    }

    const component = allComponents.find((c) => c.custom_id === customId);
    return component;
  }

  defer(options?: {
    /** Whether the response will eventually be ephemeral */
    ephemeral?: boolean;
    /** Whether the bot should be displayed as "thinking" in the UI */
    thinking?: boolean;
    /** Whether the response will use Components V2 */
    componentsV2?: boolean;
  }):
    | APIInteractionResponseDeferredMessageUpdate
    | APIInteractionResponseDeferredChannelMessageWithSource {
    const flags = new MessageFlagsBitField();
    if (options?.ephemeral) {
      flags.add(MessageFlags.Ephemeral);
    }
    if (options?.componentsV2) {
      flags.add(MessageFlags.IsComponentsV2);
    }

    if (
      this.interaction.type === InteractionType.MessageComponent ||
      this.interaction.type === InteractionType.ModalSubmit
    ) {
      return {
        type: options?.thinking
          ? InteractionResponseType.DeferredChannelMessageWithSource
          : InteractionResponseType.DeferredMessageUpdate,
        data:
          options?.thinking && flags.value !== 0n
            ? { flags: Number(flags.value) }
            : undefined,
      };
    } else if (this.interaction.type === InteractionType.ApplicationCommand) {
      return {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: flags.value !== 0n ? { flags: Number(flags.value) } : undefined,
      };
    }
    throw Error(
      `Invalid stack. Does this interaction type (${this.interaction.type}) support deferring?`,
    );
  }

  reply(
    data: string | MessageConstructorData,
  ): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: messageConstructorDataToResponseCallbackData(data),
    };
  }

  updateMessage(
    data: string | Omit<MessageConstructorData, "ephemeral">,
  ): APIInteractionResponseUpdateMessage {
    return {
      type: InteractionResponseType.UpdateMessage,
      data: messageConstructorDataToResponseCallbackData(data),
    };
  }

  modal(
    builder: ModalBuilder | APIModalInteractionResponseCallbackData,
  ): APIModalInteractionResponse {
    return {
      type: InteractionResponseType.Modal,
      data: builder instanceof ModalBuilder ? builder.toJSON() : builder,
    };
  }
}

class InteractionFollowup {
  public rest: REST;
  public applicationId: string;
  public interaction: APIInteraction;

  constructor(rest: REST, interaction: APIInteraction, applicationId: string) {
    this.rest = rest;
    this.applicationId = applicationId;
    this.interaction = interaction;
  }

  send(data: string | MessageConstructorData) {
    return this.rest.post(
      Routes.webhook(this.applicationId, this.interaction.token),
      { body: messageConstructorDataToResponseCallbackData(data) },
    ) as Promise<RESTPostAPIInteractionFollowupResult>;
  }

  getMessage(messageId: string) {
    return this.rest.get(
      Routes.webhookMessage(
        this.applicationId,
        this.interaction.token,
        messageId,
      ),
    ) as Promise<RESTGetAPIInteractionFollowupResult>;
  }

  editMessage(
    messageId: string,
    data: Omit<MessageConstructorData, "ephemeral">,
  ) {
    return this.rest.patch(
      Routes.webhookMessage(
        this.applicationId,
        this.interaction.token,
        messageId,
      ),
      { body: messageConstructorDataToResponseCallbackData(data) },
    ) as Promise<RESTPatchAPIInteractionFollowupResult>;
  }

  deleteMessage(messageId: string) {
    return this.rest.delete(
      Routes.webhookMessage(
        this.applicationId,
        this.interaction.token,
        messageId,
      ),
    ) as Promise<null>;
  }

  getOriginalMessage() {
    return this.getMessage("@original");
  }

  editOriginalMessage(data: Omit<MessageConstructorData, "ephemeral">) {
    return this.editMessage("@original", data);
  }

  deleteOriginalMessage() {
    return this.deleteMessage("@original");
  }
}
