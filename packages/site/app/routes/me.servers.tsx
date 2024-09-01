import { Link, useLoaderData } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { getUser } from "~/session.server";
import { getDb } from "~/store.server";
import { cdn, cdnImgAttributes } from "~/util/discord";
import { LoaderArgs } from "~/util/loader";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const memberships = user.discordId
    ? await db.query.discordMembers.findMany({
        where: (discordMembers, { eq }) =>
          // biome-ignore lint/style/noNonNullAssertion: Checked above
          eq(discordMembers.userId, user.discordId!),
        columns: { owner: true, permissions: true },
        with: { guild: { columns: { id: true, name: true, icon: true } } },
      })
    : [];

  return { user, memberships };
};

export default () => {
  const { t } = useTranslation();
  const { user, memberships } = useLoaderData<typeof loader>();

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
              return a.guild.name > b.guild.name ? 1 : -1;
            })
            .map(({ guild }) => {
              return (
                <div
                  key={`guild-${guild.id}`}
                  className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900 flex"
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
