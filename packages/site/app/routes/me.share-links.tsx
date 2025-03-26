import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod";
import { zx } from "zodix";
import {
  getShareLink,
  getShareLinkExists,
  putShareLink,
} from "~/api/util/share-links";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { useConfirmModal } from "~/modals/ConfirmModal";
import { getUser, getUserId } from "~/session.server";
import {
  shareLinks as dShareLinks,
  eq,
  getDb,
  getRedis,
  inArray,
} from "~/store.server";
import { getId } from "~/util/id";
import { relativeTime } from "~/util/time";
import { userIsPremium } from "~/util/users";
import {
  jsonAsString,
  snowflakeAsString,
  zxParseForm,
  zxParseQuery,
} from "~/util/zod";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = await getUser(request, context, true);
  const { page } = zxParseQuery(request, {
    page: zx.IntAsString.default("1")
      .refine((i) => i > 0)
      .transform((i) => i - 1),
  });

  const db = getDb(context.env.HYPERDRIVE);
  const shareLinks = await db.query.shareLinks.findMany({
    where: (shareLinks, { eq }) => eq(shareLinks.userId, user.id),
    orderBy: (shareLinks, { desc }) => desc(shareLinks.expiresAt),
    limit: 100,
    offset: page * 100,
  });

  return { user, shareLinks, page: page + 1 };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  switch (request.method) {
    case "PUT": {
      const data = await zxParseForm(request, {
        action: z.literal("REFRESH"),
        id: snowflakeAsString(),
        ttl: zx.IntAsString.optional()
          .default("604800")
          .refine((val) => val >= 300 && val <= 2419200),
      });

      const user = await getUser(request, context);
      if (!user || !userIsPremium(user)) {
        throw json(
          { message: "Must be a Deluxe member to perform this action" },
          403,
        );
      }

      const db = getDb(context.env.HYPERDRIVE);
      const share = await db.query.shareLinks.findFirst({
        where: (shareLinks, { eq }) => eq(shareLinks.id, data.id),
        columns: {
          shareId: true,
          userId: true,
        },
      });
      if (!share || share.userId !== userId) {
        throw json({ message: "Unknown Share Link" }, 404);
      }

      const exists = await getShareLinkExists(context.env, share.shareId);
      if (!exists) {
        throw json({ message: "Share link is already expired" }, 400);
      }

      const { data: current, origin } = await getShareLink(
        context.env,
        share.shareId,
      );
      const expires = new Date(new Date().getTime() + data.ttl * 1000);
      // Don't need to re-set origin because we're re-using the same durable object
      await putShareLink(context.env, share.shareId, current, expires, origin);
      await db
        .update(dShareLinks)
        .set({ expiresAt: expires })
        .where(eq(dShareLinks.id, data.id));

      return {
        id: share.shareId,
        url: `${new URL(request.url).origin}/?share=${share.shareId}`,
        expires,
      };
    }
    case "DELETE": {
      const { ids } = await zxParseForm(request, {
        ids: jsonAsString(snowflakeAsString().array().min(1).max(100)),
      });

      const shareLinks = await db.query.shareLinks.findMany({
        where: (shareLinks, { inArray }) => inArray(shareLinks.id, ids),
        columns: { id: true, shareId: true, userId: true },
      });
      const ownIds = shareLinks.filter((b) => b.userId === userId);

      if (ownIds.length > 0) {
        await db.delete(dShareLinks).where(
          inArray(
            dShareLinks.id,
            ownIds.map((b) => b.id),
          ),
        );
        const redis = context.env.KV ?? getRedis(context.env);
        await redis.delete(...ownIds.map((link) => `share-${link.shareId}`));

        // for old durable object based links
        for (const link of ownIds) {
          const id = context.env.SHARE_LINKS.idFromName(link.shareId);
          const stub = context.env.SHARE_LINKS.get(id);
          stub
            .fetch(`http://do/?shareId=${link.shareId}`, { method: "DELETE" })
            .catch(() => {});
        }
      }

      return json({ deleted: ownIds.length });
    }
  }

  throw new Response(undefined, { status: 405 });
};

export default () => {
  const { t } = useTranslation();
  const { user, shareLinks: links, page } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const now = new Date();

  const [confirm, setConfirm] = useConfirmModal();

  return (
    <div>
      {confirm}
      <p className="text-xl font-semibold dark:text-gray-100">
        {t("shareLinks")}
      </p>
      <p className="mb-4">
        <Trans
          t={t}
          i18nKey="noShareLinkData"
          components={{
            backups: (
              <Link to="/me/backups" className="underline hover:no-underline" />
            ),
          }}
        />
      </p>
      {links.length > 0 ? (
        <div className="space-y-1.5">
          {links.map((link) => {
            const created = new Date(getId(link).timestamp);
            const expires = new Date(link.expiresAt);
            return (
              <div
                key={`share-link-${link.id}`}
                className="rounded py-2 px-3 bg-gray-100 dark:bg-gray-900 flex flex-wrap sm:flex-nowrap"
              >
                <div className="truncate shrink-0 w-full sm:w-fit">
                  <p className="font-medium">
                    <span className="text-gray-600 dark:text-gray-500">
                      {
                        // TODO this should be i18n'd so that the flow of time makes sense in RTL
                        created.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year:
                            now.getFullYear() === created.getFullYear()
                              ? undefined
                              : "numeric",
                        })
                      }{" "}
                      -
                    </span>
                    <span
                      className={twJoin(
                        "ml-1",
                        expires < now
                          ? "text-rose-400"
                          : expires.getTime() - now.getTime() <= 86400000
                            ? "text-yellow-500 dark:text-yellow-400"
                            : undefined,
                      )}
                    >
                      {expires.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year:
                          now.getFullYear() === expires.getFullYear()
                            ? undefined
                            : "numeric",
                      })}
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-500 text-sm">
                    {expires < now
                      ? t("id", { replace: { id: link.shareId } })
                      : t("expiresIn", {
                          replace: [relativeTime(new Date(link.expiresAt), t)],
                        })}
                  </p>
                </div>
                <hr className="sm:hidden my-1" />
                <div className="ltr:ml-auto rtl:mr-auto ltr:pl-2 rtl:pr-2 my-auto flex gap-2">
                  {expires > now && (
                    <>
                      <Link to={`/?share=${link.shareId}`} target="_blank">
                        <Button discordstyle={ButtonStyle.Secondary}>
                          <CoolIcon icon="External_Link" />
                        </Button>
                      </Link>
                      <Button
                        discordstyle={ButtonStyle.Primary}
                        disabled={!userIsPremium(user)}
                        title={t("refreshShareLink")}
                        onClick={() => {
                          submit(
                            { action: "REFRESH", id: String(link.id) },
                            { method: "PUT", replace: true },
                          );
                        }}
                      >
                        <CoolIcon icon="Redo" />
                      </Button>
                    </>
                  )}
                  <Button
                    discordstyle={ButtonStyle.Danger}
                    onClick={(e) => {
                      const callback = () =>
                        submit(
                          { ids: JSON.stringify([link.id]) },
                          { method: "DELETE", replace: true },
                        );

                      if (e.shiftKey) {
                        callback();
                        return;
                      }

                      setConfirm({
                        title: t("deleteShareLink"),
                        children: (
                          <>
                            <p>{t("deleteShareLinkConfirm")}</p>
                            <div className="rounded-lg py-2 px-3 flex bg-gray-100 dark:bg-gray-900/60 shadow my-2">
                              <div className="truncate my-auto">
                                <p className="font-medium">
                                  {
                                    // TODO this should be i18n'd so that the flow of time makes sense in RTL
                                    created.toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      year:
                                        now.getFullYear() ===
                                        created.getFullYear()
                                          ? undefined
                                          : "numeric",
                                    })
                                  }{" "}
                                  -{" "}
                                  {expires.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year:
                                      now.getFullYear() ===
                                      expires.getFullYear()
                                        ? undefined
                                        : "numeric",
                                  })}
                                </p>
                                <p className="text-gray-600 dark:text-gray-500 text-sm">
                                  {t("expiresIn", {
                                    replace: [
                                      relativeTime(new Date(link.expiresAt), t),
                                    ],
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
        <p className="text-gray-500">{t("noLinks")}</p>
      )}
      <div className="flex mt-2">
        <Button
          discordstyle={ButtonStyle.Secondary}
          onClick={() => submit({ page: page - 1 })}
          disabled={page === 1}
        >
          <Trans
            t={t}
            i18nKey="previousPage"
            components={[<CoolIcon icon="Chevron_Left" rtl="Chevron_Right" />]}
          />
        </Button>
        <Button
          className="ltr:ml-auto rtl:mr-auto"
          discordstyle={ButtonStyle.Secondary}
          onClick={() => submit({ page: page + 1 })}
          disabled={links.length < 100}
        >
          <Trans
            t={t}
            i18nKey="nextPage"
            components={[<CoolIcon icon="Chevron_Right" rtl="Chevron_Left" />]}
          />
        </Button>
      </div>
    </div>
  );
};
