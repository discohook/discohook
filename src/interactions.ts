import { DiscordApiClient } from "discord-api-methods";
import { getDate, Snowflake } from "discord-snowflake";
import { APIApplicationCommandInteractionDataBasicOption, APIApplicationCommandInteractionDataBooleanOption, APIApplicationCommandInteractionDataIntegerOption, APIApplicationCommandInteractionDataNumberOption, APIApplicationCommandInteractionDataOption, APIApplicationCommandInteractionDataStringOption, APIApplicationCommandInteractionDataSubcommandOption, APIAttachment, APIInteraction, APIInteractionResponse, APIInteractionResponseCallbackData, APIInteractionResponseChannelMessageWithSource, APIInteractionResponseDeferredChannelMessageWithSource, APIInteractionResponseDeferredMessageUpdate, APIInteractionResponseUpdateMessage, APIMessage, APIMessageApplicationCommandInteraction, APIMessageComponentInteraction, APIModalInteractionResponse, APIModalInteractionResponseCallbackData, APIPremiumRequiredInteractionResponse, ApplicationCommandOptionType, ApplicationCommandType, InteractionResponseType, InteractionType, RESTGetAPIInteractionFollowupResult, RESTGetAPIInteractionOriginalResponseResult, RESTPatchAPIInteractionFollowupJSONBody, RESTPatchAPIInteractionFollowupResult, RESTPatchAPIInteractionOriginalResponseResult, RESTPostAPIInteractionFollowupJSONBody, RESTPostAPIInteractionFollowupResult, Routes } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";

export class InteractionContext<T extends APIInteraction> {
    public client: DiscordApiClient;
    public interaction: T;
    public followup: InteractionFollowup;

    constructor(client: DiscordApiClient, interaction: T, applicationId: string) {
      this.client = client;
      this.interaction = interaction;
      this.followup = new InteractionFollowup(client, interaction, applicationId);
    }

    get createdAt(): Date {
      return getDate(this.interaction.id as Snowflake);
    }

    get appPermissons() {
      return new PermissionsBitField(this.interaction.app_permissions
        ? BigInt(this.interaction.app_permissions)
        : 0
      );
    }

    get userPermissons() {
      return new PermissionsBitField(this.interaction.member
        ? BigInt(this.interaction.member.permissions)
        : PermissionFlags.ViewChannel
          | PermissionFlags.ReadMessageHistory
          | PermissionFlags.SendMessages
          | PermissionFlags.AddReactions
          | PermissionFlags.EmbedLinks
      );
    }

    get user() {
      return this.interaction.member ? this.interaction.member.user : this.interaction.user!
    }

    getMessage(): T extends APIMessageApplicationCommandInteraction ? APIMessage : undefined;
    getMessage(): T extends APIMessageComponentInteraction ? APIMessage : undefined;
    getMessage(): APIMessage | undefined {
      if (
        this.interaction.type === InteractionType.ApplicationCommand &&
        this.interaction.data.type === ApplicationCommandType.Message
      ) {
        return this.interaction.data.resolved.messages[this.interaction.data.target_id];
      } else if (
        this.interaction.type === InteractionType.MessageComponent
      ) {
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

      let subcommand: APIApplicationCommandInteractionDataSubcommandOption | null = null;
      const loop = (option: APIApplicationCommandInteractionDataOption) => {
        if (subcommand) return;
        if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
          for (const opt of option.options) {
            loop(opt)
          }
        } else if (option.type === ApplicationCommandOptionType.Subcommand) {
          subcommand = option;
        }
      }
      for (const option of this.interaction.data.options) {
        loop(option)
      }

      return subcommand
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
      const options = subcommand ? subcommand.options : this.interaction.data.options;
      if (!options) {
        return null;
      }

      return options.find((o) => o.name === name);
    }
  
    getStringOption(
      name: string
    ): APIApplicationCommandInteractionDataStringOption {
      const option = this._getOption(name);
      if (!option || option.type !== ApplicationCommandOptionType.String) {
        return {
          name,
          type: ApplicationCommandOptionType.String,
          value: "",
        };
      }
      return option;
    }
  
    getIntegerOption(
      name: string
    ): APIApplicationCommandInteractionDataIntegerOption {
      const option = this._getOption(name);
      if (!option || option.type !== ApplicationCommandOptionType.Integer) {
        return {
          name,
          type: ApplicationCommandOptionType.Integer,
          value: -1,
        };
      }
      return option;
    }
  
    getNumberOption(
      name: string
    ): APIApplicationCommandInteractionDataNumberOption {
      const option = this._getOption(name);
      if (!option || option.type !== ApplicationCommandOptionType.Number) {
        return {
          name,
          type: ApplicationCommandOptionType.Number,
          value: -1,
        };
      }
      return option;
    }
  
    getBooleanOption(
      name: string
    ): APIApplicationCommandInteractionDataBooleanOption {
      const option = this._getOption(name);
      if (!option || option.type !== ApplicationCommandOptionType.Boolean) {
        return {
          name,
          type: ApplicationCommandOptionType.Boolean,
          value: false,
        };
      }
      return option;
    }

    defer(
      type?: 
        | InteractionResponseType.DeferredChannelMessageWithSource
        | InteractionResponseType.DeferredMessageUpdate
    ):
      | APIInteractionResponseDeferredChannelMessageWithSource
      | APIInteractionResponseDeferredMessageUpdate
    {
      return {
        type: type ?? InteractionResponseType.DeferredChannelMessageWithSource,
      }
    }

    reply(data: string | APIInteractionResponseCallbackData): APIInteractionResponseChannelMessageWithSource {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: typeof data === 'string' ? { content: data } : data,
      }
    }

    updateMessage(data: APIInteractionResponseCallbackData): APIInteractionResponseUpdateMessage {
      return {
        type: InteractionResponseType.UpdateMessage,
        data: typeof data === 'string' ? { content: data } : data,
      }
    }

    modal(data: APIModalInteractionResponseCallbackData): APIModalInteractionResponse {
      return { type: InteractionResponseType.Modal, data }
    }

    premiumRequired(): APIPremiumRequiredInteractionResponse {
      return { type: InteractionResponseType.PremiumRequired }
    }
  }

class InteractionFollowup {
  public client: DiscordApiClient;
  public applicationId: string;
  public interaction: APIInteraction;

  constructor(client: DiscordApiClient, interaction: APIInteraction, applicationId: string) {
    this.client = client;
    this.applicationId = applicationId;
    this.interaction = interaction;
  }

  send(data: string | RESTPostAPIInteractionFollowupJSONBody) {
    return this.client.post(
      Routes.webhook(this.applicationId, this.interaction.token),
      {
        body: typeof data === "string"
          ? { content: data }
          : data,
      },
    ) as Promise<RESTPostAPIInteractionFollowupResult>
  }

  getMessage(messageId: string) {
    return this.client.get(
      Routes.webhookMessage(this.applicationId, this.interaction.token, messageId),
    ) as Promise<RESTGetAPIInteractionFollowupResult>
  }

  editMessage(messageId: string, data: RESTPatchAPIInteractionFollowupJSONBody) {
    return this.client.patch(
      Routes.webhookMessage(this.applicationId, this.interaction.token, messageId),
      { body: data },
    ) as Promise<RESTPatchAPIInteractionFollowupResult>
  }

  deleteMessage(messageId: string) {
    return this.client.delete(
      Routes.webhookMessage(this.applicationId, this.interaction.token, messageId),
    ) as Promise<null>
  }

  getOriginalMessage() {
    return this.getMessage("@original")
  }

  editOriginalMessage(data: RESTPatchAPIInteractionFollowupJSONBody) {
    return this.editMessage("@original", data)
  }

  deleteOriginalMessage() {
    return this.deleteMessage("@original")
  }
}
