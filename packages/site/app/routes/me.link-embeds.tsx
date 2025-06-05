import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod";
import { Button } from "~/components/Button";
import { InfoBox } from "~/components/InfoBox";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { linkClassName } from "~/components/preview/Markdown";
import { useConfirmModal } from "~/modals/ConfirmModal";
import { getUser, getUserId } from "~/session.server";
import { getDb, inArray, linkBackups as dLinkBackups } from "~/store.server";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { userIsPremium } from "~/util/users";
import {
  jsonAsString,
  snowflakeAsString,
  zxParseForm,
  zxParseQuery,
} from "~/util/zod";
import { linkEmbedUrl } from "./link";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context, true);
  const { page } = zxParseQuery(request, {
    page: z
      .number()
      .min(1)
      .default(1)
      .transform((i) => i - 1),
  });

  const db = getDb(context.env.HYPERDRIVE);
  const linkBackups = await db.query.linkBackups.findMany({
    where: (linkBackups, { eq }) => eq(linkBackups.ownerId, user.id),
    columns: {
      id: true,
      name: true,
      code: true,
      previewImageUrl: true,
    },
    orderBy: (linkBackups, { desc }) => desc(linkBackups.name),
    limit: 50,
    offset: page * 50,
  });

  return {
    user,
    linkBackups,
    linkOrigin: context.env.LINK_ORIGIN,
  };
};

export const action = async ({ request, context }: ActionArgs) => {
  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  switch (request.method) {
    case "DELETE": {
      const { ids } = await zxParseForm(request, {
        ids: jsonAsString(snowflakeAsString().array().min(1).max(50)),
      });

      const linkBackups = await db.query.linkBackups.findMany({
        where: (linkBackups, { inArray }) => inArray(linkBackups.id, ids),
        columns: { id: true, ownerId: true },
      });
      const ownIds = linkBackups.filter((b) => b.ownerId === userId);

      if (ownIds.length > 0) {
        await db.delete(dLinkBackups).where(
          inArray(
            dLinkBackups.id,
            ownIds.map((b) => b.id),
          ),
        );
      }
      return json({ deleted: ownIds.length });
    }
  }

  throw new Response(undefined, { status: 405 });
};

export default () => {
  const { t } = useTranslation();
  const { user, linkBackups, linkOrigin } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const [confirm, setConfirm] = useConfirmModal();

  return (
    <div>
      {confirm}
      <div className="mb-4 flex">
        <p className="text-xl font-semibold dark:text-gray-100 my-auto">
          {t("linkEmbeds")}
        </p>
      </div>
      {!userIsPremium(user) && (
        <InfoBox icon="Handbag" severity="pink">
          <Trans
            t={t}
            i18nKey="linkEmbedsPremiumNote"
            components={[
              <Link
                to="/link"
                className={twJoin(linkClassName, "dark:brightness-90")}
              />,
            ]}
          />
        </InfoBox>
      )}
      {linkBackups.length > 0 ? (
        <div className="space-y-1">
          {linkBackups.map((backup) => {
            return (
              <div
                key={`link-backup-${backup.id}`}
                className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900 flex"
              >
                {backup.previewImageUrl && (
                  <div
                    style={{
                      backgroundImage: `url(${backup.previewImageUrl})`,
                    }}
                    className="bg-cover bg-center w-10 my-auto rounded-lg aspect-square ltr:mr-2 rtl:ml-2 hidden sm:block"
                  />
                )}
                <div className="truncate my-auto">
                  <div className="flex max-w-full">
                    <p className="font-medium truncate">{backup.name}</p>
                    <Link
                      to={`/link?backup=${backup.id}`}
                      className="ml-2 my-auto"
                    >
                      <CoolIcon icon="Edit_Pencil_01" />
                    </Link>
                  </div>
                  <p className="text-gray-600 dark:text-gray-500 text-sm">
                    {t("id", { replace: { id: backup.code } })}
                  </p>
                </div>
                <div className="ltr:ml-auto rtl:mr-auto pl-2 my-auto flex gap-2">
                  <Link
                    to={linkEmbedUrl(backup.code, linkOrigin)}
                    target="_blank"
                  >
                    <Button discordstyle={ButtonStyle.Secondary}>
                      <CoolIcon icon="External_Link" />
                    </Button>
                  </Link>
                  <Button
                    discordstyle={ButtonStyle.Danger}
                    onClick={(e) => {
                      const callback = () =>
                        submit(
                          { ids: JSON.stringify([backup.id]) },
                          { method: "DELETE", replace: true },
                        );

                      if (e.shiftKey) {
                        callback();
                        return;
                      }

                      setConfirm({
                        title: t("deleteLinkBackup"),
                        children: (
                          <>
                            <p>{t("deleteLinkBackupConfirm")}</p>
                            <div className="rounded-lg p-4 flex bg-gray-100 dark:bg-gray-900/60 shadow my-2">
                              {backup.previewImageUrl && (
                                <div
                                  style={{
                                    backgroundImage: `url(${backup.previewImageUrl})`,
                                  }}
                                  className="bg-cover bg-center w-10 my-auto rounded-lg aspect-square mr-2 hidden sm:block"
                                />
                              )}
                              <div className="truncate my-auto">
                                <p className="font-medium truncate">
                                  {backup.name}
                                </p>
                                <p className="text-gray-600 dark:text-gray-500 text-sm">
                                  {t("id", {
                                    replace: { id: backup.code },
                                  })}
                                </p>
                              </div>
                            </div>
                            <p className="text-muted dark:text-muted-dark text-sm font-medium">
                              {t("shiftSkipTip")}
                            </p>
                            <Button
                              className="mt-4"
                              discordstyle={ButtonStyle.Danger}
                              onClick={() => {
                                callback();
                                setConfirm(undefined);
                              }}
                            >
                              {t("delete")}
                            </Button>
                          </>
                        ),
                      });
                    }}
                  >
                    <CoolIcon icon="Trash_Full" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">
          {
            <Trans
              t={t}
              i18nKey="noLinkBackups"
              components={[<Link to="/link" className={linkClassName} />]}
            />
          }
        </p>
      )}
    </div>
  );
};
