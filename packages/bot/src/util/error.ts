import { RESTError } from "discord-api-types/v10";

interface DiscordError {
  code: number;
  raw: RESTError;
}

export const isDiscordError = (error: any): error is DiscordError => {
  return "code" in error && "raw" in error;
};
