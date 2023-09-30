import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import LocalizedStrings from "react-localization";
import { z } from "zod";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { Prose } from "~/components/Prose";
import { prisma } from "~/prisma.server";
import { redis } from "~/redis.server";
import { getUser } from "~/session.server";
import { getUserAvatar, getUserTag } from "~/util/users";

const strings = new LocalizedStrings({
  en: {
    yourLinks: "Your Links",
    noLinks: "You haven't created any share links.",
    id: "ID:",
    contentUnavailable:
      "Share link data is not kept after expiration. If you need to permanently store a message, use the backups feature instead.",
    logOut: "Log Out",
    subscribedSince: "Subscribed Since",
    notSubscribed: "Not subscribed",
    firstSubscribed: "First Subscribed",
    never: "Never",
  },
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request, true);

  const links = await prisma.shareLink.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { user, links };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUser(request, true);
  const { action, linkId } = await zx.parseForm(request, {
    action: z.enum(["DELETE_SHARE_LINK"]),
    linkId: zx.NumAsString,
  });

  switch (action) {
    case "DELETE_SHARE_LINK": {
      const link = await prisma.shareLink.findUnique({
        where: { id: linkId },
      });
      if (!link) {
        throw json({ message: "No link with that ID." }, 404);
      } else if (link.userId !== user.id) {
        throw json({ message: "You do not own this share link." }, 403);
      }
      const key = `boogiehook-shorten-${link.shareId}`;
      await redis.del(key);
      await prisma.shareLink.delete({
        where: { id: linkId },
      });
      return new Response(null, { status: 204 });
    }
    default:
      break;
  }

  return null;
};

export const meta: MetaFunction = () => [{ title: "Your Data - Boogiehook" }];

export default function Me() {
  const { user, links } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const now = new Date();

  return (
    <div>
      <Header user={user} />
      <Prose>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <div className="w-full rounded-lg bg-gray-200 dark:bg-gray-700 shadow-md p-2 h-fit">
            <div className="flex">
              <img
                className="rounded-full mr-4 h-16 w-16"
                src={getUserAvatar(user)}
              />
              <div className="grow my-auto">
                <p className="text-2xl font-semibold dark:text-gray-100">
                  {user.name}
                </p>
                <p className="leading-none">{getUserTag(user)}</p>
              </div>
            </div>
            <div className="grid gap-2 grid-cols-2 mt-4">
              <div>
                <p className="uppercase font-bold text-xs leading-4 dark:text-gray-100">
                  {strings.subscribedSince}
                </p>
                <p className="text-sm font-normal">
                  {user.subscribedSince
                    ? new Date(user.subscribedSince).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : strings.notSubscribed}
                </p>
              </div>
              <div>
                <p className="uppercase font-bold text-xs leading-4 dark:text-gray-100">
                  {strings.firstSubscribed}
                </p>
                <p className="text-sm font-normal">
                  {user.firstSubscribed
                    ? new Date(user.firstSubscribed).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : strings.never}
                </p>
              </div>
            </div>
            <div className="w-full flex mt-4">
              <Link to="/auth/logout" className="ml-auto">
                <Button discordstyle={ButtonStyle.Secondary}>
                  {strings.logOut}
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full h-fit">
            <p className="text-xl font-semibold dark:text-gray-100">
              {strings.yourLinks}
            </p>
            <p>{strings.contentUnavailable}</p>
            {links.length > 0 ? (
              <div className="space-y-1 mt-1">
                {links.map((link) => {
                  const created = new Date(link.createdAt),
                    expires = new Date(link.expiresAt);
                  return (
                    <div
                      key={`link-${link.id}`}
                      className="w-full rounded p-2 bg-gray-100 dark:bg-gray-700 flex"
                    >
                      <div className="truncate shrink-0">
                        <p className="font-medium">
                          {created.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year:
                              now.getFullYear() === created.getFullYear()
                                ? undefined
                                : "numeric",
                          })}
                          <span
                            className={`ml-1 ${
                              expires < now
                                ? "text-rose-400"
                                : "text-gray-600 dark:text-gray-500"
                            }`}
                          >
                            -{" "}
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
                          {strings.id} {link.shareId}
                        </p>
                      </div>
                      <div className="ml-auto pl-2 my-auto flex flex-col">
                        {expires > now && (
                          <Link to={`/go/${link.shareId}`} target="_blank">
                            <CoolIcon icon="External_Link" />
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            submit(
                              {
                                action: "DELETE_SHARE_LINK",
                                linkId: link.id,
                              },
                              {
                                method: "POST",
                                replace: true,
                              }
                            );
                          }}
                        >
                          <CoolIcon
                            icon="Trash_Full"
                            className="text-rose-600"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">{strings.noLinks}</p>
            )}
          </div>
        </div>
      </Prose>
    </div>
  );
}
