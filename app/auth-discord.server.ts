import { APIUser } from "discord-api-types/v10";
import { Authenticator } from "remix-auth";
import type { DiscordProfile, PartialDiscordGuild } from "remix-auth-discord";
import { DiscordStrategy } from "remix-auth-discord";
import { sessionStorage } from "~/session.server";

export interface DiscordUser {
  type: "discord";
  id: string;
  username: string;
  globalName: string | null;
  discriminator: string;
  avatar: DiscordProfile["__json"]["avatar"];
  accessToken: string;
  refreshToken: string;
}

export const discordAuth = new Authenticator<DiscordUser>(sessionStorage);

const strategy = new DiscordStrategy(
  {
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: `${process.env.ORIGIN}/callback/discord`,
    scope: ["identify", "guilds"],
  },
  async ({
    accessToken,
    refreshToken,
    extraParams,
    profile,
  }): Promise<DiscordUser> => {
    const userGuilds: Array<PartialDiscordGuild> = await (
      await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    )?.json();
    const guilds: Array<PartialDiscordGuild> = userGuilds.filter(
      // Owner or manage webhooks
      (g) => g.owner || (BigInt(g.permissions) & BigInt(0x29)) == BigInt(0x29)
    );
    console.log(guilds)

    const j = profile.__json as APIUser;
    return {
      type: "discord",
      id: profile.id,
      username: j.username,
      globalName: j.global_name,
      discriminator: j.discriminator,
      avatar: j.avatar,
      accessToken,
      refreshToken,
    };
  }
);

discordAuth.use(strategy);
