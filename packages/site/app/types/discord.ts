import {
  APIApplication,
  APIApplicationInstallParams,
} from "discord-api-types/v10";

export enum ApplicationIntegrationType {
  GuildInstall = 0,
  UserInstall = 1,
}

export interface ApplicationIntegrationConfiguration {
  oauth2_install_params?: APIApplicationInstallParams;
}

export type RESTGetAPIApplicationRpcResult = Pick<
  APIApplication,
  | "id"
  | "name"
  | "icon"
  | "description"
  | "summary"
  | "bot_public"
  | "bot_require_code_grant"
  | "verify_key"
  | "flags"
> & {
  // type: ApplicationType;
  /** Whether the application is part of the monetization program */
  is_monetized: boolean;
  /** Whether the application has an interactions endpoint URL set */
  hook: boolean;
  storefront_available: boolean;
  /** Default scopes and permissions for each supported installation context */
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationConfiguration
  >;
};
