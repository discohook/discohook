import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Twemoji } from "~/components/icons/Twemoji";
import { getUser } from "~/session.server";
import { and, discordMembers, eq, getDb } from "~/store.server";
import { cdn, cdnImgAttributes } from "~/util/discord";
import type { ActionArgs, LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseForm } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  const memberships = user.discordId
    ? await db.query.discordMembers.findMany({
        where: (discordMembers, { eq }) =>
          // biome-ignore lint/style/noNonNullAssertion: Checked above
          eq(discordMembers.userId, user.discordId!),
        columns: { owner: true, permissions: true, favorite: true },
        with: { guild: { columns: { id: true, name: true, icon: true } } },
      })
    : [];

  return { memberships };
};

export const action = async ({ request, context }: ActionArgs) => {
  const user = await getUser(request, context, true);
  if (!user.discordId) {
    throw json(
      { message: "No Discord account is associated with your user." },
      400,
    );
  }

  if (request.method === "PATCH") {
    const { guildId, favorite } = await zxParseForm(request, {
      guildId: snowflakeAsString(),
      favorite: zx.BoolAsString.optional(),
    });

    if (favorite !== undefined) {
      const db = getDb(context.env.HYPERDRIVE);
      const updated = await db
        .update(discordMembers)
        .set({ favorite })
        .where(
          and(
            eq(discordMembers.guildId, guildId),
            eq(discordMembers.userId, user.discordId),
          ),
        )
        .returning({
          favorite: discordMembers.favorite,
        });

      if (updated.length === 0) {
        throw json(
          {
            message:
              "You are not a member of this server. You may need to log in again.",
          },
          404,
        );
      }
      return updated[0];
    }
  }

  return new Response(null);
};

export default () => {
  const { t } = useTranslation();
  const { memberships } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <div>
      <div className="mb-4 flex">
        <p className="text-xl font-semibold dark:text-gray-100 my-auto">
          {t("server_other")}
        </p>
        <Link to="/bot" className="ltr:ml-auto rtl:mr-auto my-auto">
          <Button discordstyle={ButtonStyle.Link}>{t("inviteBot")}</Button>
        </Link>
      </div>
      <p className="-mt-2 mb-2">
        <Trans
          t={t}
          i18nKey="serversFavoriteTip"
          components={{
            icon: <CoolIcon icon="Star" />,
            highlight: <span className="text-[#FA9A1D]" />,
          }}
        />
      </p>
      {memberships.length > 0 ? (
        <div className="space-y-1">
          {memberships
            .filter((m) => {
              const perm = new PermissionsBitField(
                BigInt(m.permissions ?? "0"),
              );
              return (
                m.owner ||
                perm.has(PermissionFlags.ManageMessages) ||
                perm.has(PermissionFlags.ManageWebhooks)
              );
            })
            .sort((a, b) => {
              // const perm = new PermissionsBitField(
              //   BigInt(m.permissions ?? "0"),
              // );
              // if (perm.has(PermissionFlags.Administrator)) {
              //   return -20;
              // }
              // return 0;
              if (a.favorite && !b.favorite) return -1;
              if (b.favorite && !a.favorite) return 1;
              return a.guild.name > b.guild.name ? 1 : -1;
            })
            .map(({ guild, favorite }, _, a) => {
              const hasAnyFavorites = a.findIndex((g) => g.favorite) !== -1;
              return (
                <div
                  key={`guild-${guild.id}`}
                  className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900 flex group"
                >
                  <img
                    {...cdnImgAttributes(64, (size) =>
                      guild.icon
                        ? cdn.icon(String(guild.id), guild.icon, {
                            size,
                          })
                        : cdn.defaultAvatar(5),
                    )}
                    className="w-10 my-auto rounded-lg aspect-square ltr:mr-2 rtl:ml-2 hidden sm:block"
                    alt={guild.name}
                  />
                  <div className="truncate my-auto">
                    <div className="flex max-w-full">
                      <p className="font-medium truncate">{guild.name}</p>
                    </div>
                  </div>
                  <div className="ltr:ml-auto rtl:mr-auto pl-2 my-auto flex gap-2">
                    <button
                      type="button"
                      title={t(favorite ? "unfavorite" : "favorite")}
                      className={twJoin(
                        "text-xl px-2 transition-opacity",
                        hasAnyFavorites && !favorite
                          ? "opacity-0 group-hover:opacity-100"
                          : undefined,
                      )}
                      onClick={() => {
                        submit(
                          { guildId: String(guild.id), favorite: !favorite },
                          { method: "PATCH", replace: true },
                        );
                      }}
                    >
                      {favorite ? (
                        <Twemoji emoji="⭐️" className="h-5 w-5" />
                      ) : (
                        <CoolIcon icon="Star" />
                      )}
                    </button>
                    <Link to={`/s/${guild.id}`}>
                      <Button discordstyle={ButtonStyle.Secondary}>
                        <CoolIcon icon="Chevron_Right" rtl="Chevron_Left" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <p className="text-gray-500">{t("noServers")}</p>
      )}
    </div>
  );
};
