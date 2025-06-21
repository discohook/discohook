import type { DiscordErrorData } from "@discordjs/rest";
import { redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import {
  ButtonStyle,
  type RESTGetAPIInviteResult,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { linkClassName } from "~/components/preview/Markdown";
import { getUser } from "~/session.server";
import { cdn, cdnImgAttributes } from "~/util/discord";
import type { LoaderArgs } from "~/util/loader";
import { zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { redirect: instantRedirect } = zxParseQuery(request, {
    redirect: zx.BoolAsString.optional(),
  });
  if (
    instantRedirect ||
    request.headers.get("User-Agent")?.includes("Discord")
  ) {
    throw redirect(
      `https://discord.gg/${context.env.DISCORD_SUPPORT_INVITE_CODE}`,
    );
  }

  const user = await getUser(request, context);
  return {
    user,
    code: context.env.DISCORD_SUPPORT_INVITE_CODE,
  };
};

// export const meta: MetaFunction = ({ data }) => {
//   if (data) {
//     const { code } = data as SerializeFrom<typeof loader>;
//   }
//   return [];
// };

export default function DiscordPage() {
  const { user, code } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  const [error, setError] = useError(t);
  const [invite, setInvite] = useState<RESTGetAPIInviteResult>();
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (invite) return;
    fetch(
      `${RouteBases.api + Routes.invite(code)}?${new URLSearchParams({
        with_counts: "true",
      })}`,
      { method: "GET" },
    ).then((response) => {
      response.json().then((raw) => {
        if (!response.ok) {
          setError({ message: (raw as DiscordErrorData).message });
        } else {
          const data = raw as RESTGetAPIInviteResult;
          setInvite(data);
        }
      });
    });
  }, [invite, code, setError]);

  return (
    <div>
      <Header user={user} />
      <Prose>
        {error}
        {invite ? (
          <div className="rounded dark:bg-gray-900 p-4 flex w-fit mx-auto shadow-md">
            <img
              {...cdnImgAttributes(64, (size) =>
                invite.guild?.icon
                  ? cdn.icon(invite.guild.id, invite.guild.icon, { size })
                  : cdn.defaultAvatar(5),
              )}
              alt={invite.guild?.name}
              className="rounded-xl w-12 h-12 mr-4 shrink-0"
            />
            <div className="my-auto">
              <p className="font-semibold">{invite.guild?.name}</p>
              <p className="text-sm text-gray-500">
                <div className="rounded-full bg-green-600 w-2 h-2 inline-block mr-1.5" />
                <span className="mr-2">
                  {invite.approximate_presence_count?.toLocaleString() ?? 0}{" "}
                  Online
                </span>
                <div className="rounded-full bg-gray-600 w-2 h-2 inline-block mr-1.5" />
                <span>
                  {invite.approximate_member_count?.toLocaleString() ?? 0}{" "}
                  Members
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded dark:bg-gray-900 p-4 flex w-fit mx-auto shadow-md">
            <div className="rounded-xl bg-gray-300/80 dark:bg-gray-300/10 animate-pulse w-12 h-12 mr-4 shrink-0" />
            <div className="my-auto">
              <div className="bg-gray-300/80 dark:bg-gray-300/10 animate-pulse rounded-full h-4 w-32" />
              <p className="text-sm text-gray-500">
                <div className="rounded-full bg-green-600 w-2 h-2 inline-block mr-1.5" />
                <span className="mr-2">- Online</span>
                <div className="rounded-full bg-gray-600 w-2 h-2 inline-block mr-1.5" />
                <span>- Members</span>
              </p>
            </div>
          </div>
        )}
        <div className="mt-4">
          <Checkbox
            label={
              <p className="text-base">
                <Trans
                  t={t}
                  i18nKey="supportServerLanguageNote"
                  components={{
                    bold: <span className="font-bold" />,
                    anchor: (
                      // biome-ignore lint/a11y/useAnchorContent: Filled by i18next
                      <a
                        className={linkClassName}
                        href="https://www.deepl.com/translator"
                        target="_blank"
                        rel="noreferrer"
                      />
                    ),
                  }}
                />
              </p>
            }
            checked={agree}
            onCheckedChange={(checked) => setAgree(checked)}
          />
          <a href={`https://discord.gg/${code}`} aria-disabled={!agree}>
            <Button
              className="mt-2"
              disabled={!agree}
              discordstyle={ButtonStyle.Success}
            >
              {t("join")}
            </Button>
          </a>
        </div>
      </Prose>
    </div>
  );
}
