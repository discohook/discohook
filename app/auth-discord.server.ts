import { APIUser } from "discord-api-types/v10";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { sessionStorage, writeOauthUser } from "~/session.server";
import { prisma } from "./prisma.server";
import { getCurrentUserGuilds } from "./util/discord";

export type UserAuth = {
  id: number;
  authType: "discord";
  accessToken: string;
  refreshToken: string;
};

export const discordAuth = new Authenticator<UserAuth>(sessionStorage);

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
  }): Promise<UserAuth> => {
    const j = profile.__json as APIUser;
    await prisma.discordUser.upsert({
      where: { id: BigInt(j.id) },
      create: {
        id: BigInt(j.id),
        name: j.username,
        globalName: j.global_name,
        discriminator: j.discriminator,
        avatar: j.avatar,
      },
      update: {
        name: j.username,
        globalName: j.global_name,
        discriminator: j.discriminator,
        avatar: j.avatar,
      },
    });
    const user = await writeOauthUser({ discord: profile });

    const userGuilds = await getCurrentUserGuilds(accessToken);
    console.log(userGuilds)
    //const guilds = userGuilds.filter(
    //  // Owner or manage webhooks
    //  (g) => g.owner || (BigInt(g.permissions) & BigInt(0x29)) == BigInt(0x29)
    //);

    return {
      id: user.id,
      authType: "discord",
      accessToken,
      refreshToken,
    };
  }
);

discordAuth.use(strategy);
