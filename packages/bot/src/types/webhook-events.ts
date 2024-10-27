import {
  APIEntitlement,
  APIGuild,
  APIUser,
  ApplicationIntegrationType,
} from "discord-api-types/v10";

export enum WebhookEventType {
  Ping = 0,
  Event = 1,
}

export interface APIWebhookEventBase<T extends WebhookEventType, E> {
  version: number;
  application_id: string;
  type: T;
  event: E;
}

export type APIWebhookEventPing = APIWebhookEventBase<
  WebhookEventType.Ping,
  undefined
>;

export enum WebhookEvents {
  ApplicationAuthorized = "APPLICATION_AUTHORIZED",
  EntitlementCreate = "ENTITLEMENT_CREATE",
  QuestUserEnrollment = "QUEST_USER_ENROLLMENT",
}

export interface APIWebhookEventBodyBase<T> {
  type: WebhookEvents;
  timestamp: string;
  data?: T;
}

export interface APIWebhookEventBodyApplicationAuthorizedBase<
  I extends ApplicationIntegrationType = ApplicationIntegrationType,
> {
  integration_type?: I;
  user: APIUser;
  scopes: string[];
  guild: I extends ApplicationIntegrationType.GuildInstall
    ? APIGuild
    : undefined;
}

export type APIWebhookEventBodyApplicationAuthorizedGuild =
  APIWebhookEventBodyApplicationAuthorizedBase<ApplicationIntegrationType.GuildInstall>;

export type APIWebhookEventBodyApplicationAuthorizedUser =
  APIWebhookEventBodyApplicationAuthorizedBase<ApplicationIntegrationType.UserInstall>;

export type APIWebhookEventBodyApplicationAuthorized<
  I extends ApplicationIntegrationType = ApplicationIntegrationType,
> = APIWebhookEventBodyBase<APIWebhookEventBodyApplicationAuthorizedBase<I>>;

export type APIWebhookEventApplicationAuthorized = APIWebhookEventBase<
  WebhookEventType.Event,
  APIWebhookEventBodyApplicationAuthorized
>;

export type APIWebhookEventBodyEntitlementCreate =
  APIWebhookEventBodyBase<APIEntitlement>;

export type APIWebhookEventEntitlementCreate = APIWebhookEventBase<
  WebhookEventType.Event,
  APIWebhookEventBodyEntitlementCreate
>;

export type APIWebhookEvent =
  | APIWebhookEventPing
  | APIWebhookEventApplicationAuthorized
  | APIWebhookEventEntitlementCreate;

export type APIWebhookEventBody =
  | APIWebhookEventBodyApplicationAuthorized
  | APIWebhookEventBodyEntitlementCreate;
