import { DiscordApiClient } from "discord-api-methods";
import { APIApplicationCommandInteractionDataBooleanOption, APIApplicationCommandInteractionDataIntegerOption, APIApplicationCommandInteractionDataNumberOption, APIApplicationCommandInteractionDataStringOption, APIAttachment, APIInteraction, APIInteractionResponse, APIInteractionResponseCallbackData, APIInteractionResponseChannelMessageWithSource, APIInteractionResponseDeferredChannelMessageWithSource, APIInteractionResponseDeferredMessageUpdate, APIInteractionResponseUpdateMessage, APIModalInteractionResponse, APIModalInteractionResponseCallbackData, APIPremiumRequiredInteractionResponse, ApplicationCommandOptionType, InteractionResponseType, InteractionType, RESTGetAPIInteractionFollowupResult, RESTGetAPIInteractionOriginalResponseResult, RESTPatchAPIInteractionFollowupJSONBody, RESTPatchAPIInteractionFollowupResult, RESTPatchAPIInteractionOriginalResponseResult, RESTPostAPIInteractionFollowupJSONBody, RESTPostAPIInteractionFollowupResult } from "discord-api-types/v10";

export class InteractionContext {
    public client: DiscordApiClient;
    public interaction: APIInteraction;
    public followup: InteractionFollowup;

    constructor(client: DiscordApiClient, interaction: APIInteraction, applicationId: string) {
      this.client = client;
      this.interaction = interaction;
      this.followup = new InteractionFollowup(client, interaction, applicationId);
    }
  
    _getOption(name: string) {
      if (
        ![
          InteractionType.ApplicationCommand,
          InteractionType.ApplicationCommandAutocomplete,
        ].includes(this.interaction.type) ||
        !this.interaction.data ||
        !("options" in this.interaction.data)
      ) {
        return null;
      }
      return this.interaction.data.options?.find((o) => o.name === name);
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
        type: type ?? InteractionResponseType.DeferredChannelMessageWithSource
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
      `/webhooks/${this.applicationId}/${this.interaction.token}`,
      {
        body: typeof data === "string"
          ? { content: data }
          : data,
      },
    ) as Promise<RESTPostAPIInteractionFollowupResult>
  }

  getMessage(messageId: string) {
    return this.client.get(
      `/webhooks/${this.applicationId}/${this.interaction.token}/messages/${messageId}`,
    ) as Promise<RESTGetAPIInteractionFollowupResult>
  }

  editMessage(messageId: string, data: RESTPatchAPIInteractionFollowupJSONBody) {
    return this.client.patch(
      `/webhooks/${this.applicationId}/${this.interaction.token}/messages/${messageId}`,
      { body: data },
    ) as Promise<RESTPatchAPIInteractionFollowupResult>
  }

  deleteMessage(messageId: string) {
    return this.client.delete(
      `/webhooks/${this.applicationId}/${this.interaction.token}/messages/${messageId}`,
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
