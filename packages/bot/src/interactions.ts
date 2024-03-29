import type { REST } from "@discordjs/rest";
import {
  APIApplicationCommandInteractionDataBooleanOption,
  APIApplicationCommandInteractionDataIntegerOption,
  APIApplicationCommandInteractionDataNumberOption,
  APIApplicationCommandInteractionDataOption,
  APIApplicationCommandInteractionDataStringOption,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIAttachment,
  APIInteraction,
  APIInteractionDataResolved,
  APIInteractionResponseCallbackData,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseDeferredChannelMessageWithSource,
  APIInteractionResponseDeferredMessageUpdate,
  APIInteractionResponseUpdateMessage,
  APIMessage,
  APIMessageApplicationCommandInteraction,
  APIMessageComponentInteraction,
  APIModalInteractionResponse,
  APIModalInteractionResponseCallbackData,
  APIModalSubmitInteraction,
  APIPremiumRequiredInteractionResponse,
  APIRole,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
  ModalSubmitComponent,
  RESTGetAPIInteractionFollowupResult,
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPatchAPIInteractionFollowupResult,
  RESTPostAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupResult,
  Routes,
} from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { Snowflake, getDate } from "discord-snowflake";
import { MinimumKVComponentState } from "./components.js";
import { APIPartialResolvedChannel } from "./types/api.js";
import { Env } from "./types/env.js";

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

  getRoleOption(name: string) {
    return this._getResolvableOption<APIRole>(
      name,
      ApplicationCommandOptionType.Role,
      "roles",
    );
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
  }):
    | APIInteractionResponseDeferredMessageUpdate
    | APIInteractionResponseDeferredChannelMessageWithSource {
    if (
      this.interaction.type === InteractionType.MessageComponent ||
      this.interaction.type === InteractionType.ModalSubmit
    ) {
      return {
        type: options?.thinking
          ? InteractionResponseType.DeferredChannelMessageWithSource
          : InteractionResponseType.DeferredMessageUpdate,
        data:
          options?.thinking && options?.ephemeral
            ? { flags: MessageFlags.Ephemeral }
            : undefined,
      };
    } else if (this.interaction.type === InteractionType.ApplicationCommand) {
      return {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: options?.ephemeral
          ? { flags: MessageFlags.Ephemeral }
          : undefined,
      };
    }
    throw Error(
      `Invalid stack. Does this interaction type (${this.interaction.type}) support deferring?`,
    );
  }

  reply(
    data: string | APIInteractionResponseCallbackData,
  ): APIInteractionResponseChannelMessageWithSource {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: typeof data === "string" ? { content: data } : data,
    };
  }

  updateMessage(
    data: APIInteractionResponseCallbackData,
  ): APIInteractionResponseUpdateMessage {
    return {
      type: InteractionResponseType.UpdateMessage,
      data: typeof data === "string" ? { content: data } : data,
    };
  }

  modal(
    data: APIModalInteractionResponseCallbackData,
  ): APIModalInteractionResponse {
    return { type: InteractionResponseType.Modal, data };
  }

  premiumRequired(): APIPremiumRequiredInteractionResponse {
    return { type: InteractionResponseType.PremiumRequired };
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

  send(data: string | RESTPostAPIInteractionFollowupJSONBody) {
    return this.rest.post(
      Routes.webhook(this.applicationId, this.interaction.token),
      {
        body: typeof data === "string" ? { content: data } : data,
      },
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
    data: RESTPatchAPIInteractionFollowupJSONBody,
  ) {
    return this.rest.patch(
      Routes.webhookMessage(
        this.applicationId,
        this.interaction.token,
        messageId,
      ),
      { body: data },
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

  editOriginalMessage(data: RESTPatchAPIInteractionFollowupJSONBody) {
    return this.editMessage("@original", data);
  }

  deleteOriginalMessage() {
    return this.deleteMessage("@original");
  }
}
