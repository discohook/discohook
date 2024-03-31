import { RESTError } from "discord-api-types/v10";

interface DiscordError {
  code: number;
  rawError: RESTError;
}

export const isDiscordError = (error: any): error is DiscordError => {
  return "code" in error && "rawError" in error;
};
