import { REST } from "@discordjs/rest";
import { SerializeFrom, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod";
import { Button } from "~/components/Button";
import { InfoBox } from "~/components/InfoBox";
import { linkClassName } from "~/components/preview/Markdown";
import { BotCreateModal } from "~/modals/BotCreateModal";
import { getUser, getUserId } from "~/session.server";
import {
  customBots,
  desc,
  getDb,
  makeSnowflake
} from "~/store.server";
import { RESTGetAPIApplicationRpcResult } from "~/types/discord";
import { botAppAvatar, isDiscordError } from "~/util/discord";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { userIsPremium } from "~/util/users";
import { snowflakeAsString, zxParseForm, zxParseQuery } from "~/util/zod";

export interface KVCustomBot {
  applicationId: string;
  publicKey: string;
  token: string | null;
}

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  const { page } = zxParseQuery(request, {
    page: z
      .number()
      .min(1)
      .default(1)
      .transform((i) => i - 1),
  });

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const bots = user.discordId
    ? await db
        .select({
          id: customBots.id,
          name: customBots.name,
          applicationId: customBots.applicationId,
          applicationUserId: customBots.applicationUserId,
          icon: customBots.icon,
          avatar: customBots.avatar,
          discriminator: customBots.discriminator,
        })
        .from(customBots)
        .orderBy(desc(customBots.name))
        .limit(50)
        .offset(page * 50)
    : [];

  return { user, bots };
};

export type LoadedBot = Awaited<SerializeFrom<typeof loader>["bots"]>[number];

export const action = async ({ request, context }: ActionArgs) => {
  const userId = await getUserId(request, context, true);
  const db = getDb(context.env.HYPERDRIVE.connectionString);

  const { applicationId } = await zxParseForm(request, {
    applicationId: snowflakeAsString().transform(String),
  });

  if (String(applicationId) === context.env.DISCORD_CLIENT_ID) {
    throw json({ message: "Cannot create a bot with a blacklisted ID" }, 400);
  }
  const user = await getUser(request, context);
  if (!user || !userIsPremium(user)) {
    throw json(
      { message: "Must be a Deluxe member to perform this action" },
      403,
    );
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  let application: RESTGetAPIApplicationRpcResult;
  try {
    application = (await rest.get(
      `/applications/${applicationId}/rpc`,
    )) as RESTGetAPIApplicationRpcResult;
  } catch (e) {
    if (isDiscordError(e)) {
      throw json(e.rawError, e.status);
    }
    throw e;
  }
  let inserted: { id: bigint };
  try {
    // How do we verify ownership? Require token?
    inserted = (
      await db
        .insert(customBots)
        .values({
          applicationId: makeSnowflake(application.id),
          icon: application.icon,
          name: application.name,
          publicKey: application.verify_key,
          ownerId: userId,
        })
        // .onConflictDoUpdate({
        //   target: [customBots.applicationId],
        //   set: {
        //     icon: application.icon,
        //     name: application.name,
        //     // Check if the app has already been linked to our endpoint?
        //     // ownerId: sql``,
        //     // Shouldn't change but we update just in case
        //     publicKey: application.verify_key,
        //   },
        // })
        .returning({
          id: customBots.id,
        })
    )[0];
  } catch {
    throw json(
      {
        message:
          "Failed to create the bot. It may already exist. If this is the case, contact support to have it transferred to your account.",
      },
      400,
    );
  }
  await context.env.KV.put(
    `custom-bot-${inserted.id}`,
    JSON.stringify({
      applicationId: application.id,
      publicKey: application.verify_key,
      token: null,
    } satisfies KVCustomBot),
  );

  return { id: inserted.id };
};

export default () => {
  const { t } = useTranslation();
  const { user, bots } = useLoaderData<typeof loader>();

  const [createBotOpen, setCreateBotOpen] = useState(false);

  return (
    <div>
      <BotCreateModal open={createBotOpen} setOpen={setCreateBotOpen} />
      <div className="flex mb-2">
        <p className="text-xl font-semibold dark:text-gray-100 my-auto">
          {t("bots")}
        </p>
        <Button
          onClick={() => setCreateBotOpen(true)}
          className="mb-auto ltr:ml-auto rtl:mr-auto"
          disabled={!userIsPremium(user)}
        >
          {t("newBot")}
        </Button>
      </div>
      {!userIsPremium(user) && (
        <InfoBox icon="Handbag" severity="pink">
          <Trans
            t={t}
            i18nKey="botsPremiumNote"
            components={[
              <Link
                to="/donate"
                className={twJoin(linkClassName, "dark:brightness-90")}
              />,
            ]}
          />
        </InfoBox>
      )}
      <div className="flex flex-wrap gap-2">
        {bots.map((bot) => {
          return (
            <Link
              key={`bot-${bot.id}`}
              className="rounded-lg p-2 w-28 bg-primary-160 hover:bg-primary-230 dark:bg-background-secondary-dark dark:hover:bg-[#232428] transition hover:-translate-y-1 hover:shadow-lg"
              to={`/me/bots/${bot.id}`}
            >
              <img
                src={botAppAvatar(bot, { size: 128 })}
                alt={bot.name}
                className="rounded-lg h-24 w-24"
              />
              <p className="text-center font-medium truncate text-sm mt-1">
                {bot.name}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
