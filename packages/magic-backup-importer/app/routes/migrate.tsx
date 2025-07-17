import { type MetaFunction, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs as RRLoaderFunctionArgs } from "@remix-run/router";
import { useEffect, useReducer, useState } from "react";
import { Button, ButtonStyle } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { DatabaseManager } from "~/database/DatabaseManager";
import type { Backup } from "~/database/schema";
import { getLocalStorage } from "~/util/storage";

const getAllBackups = async (manager: DatabaseManager) => {
  const backups: Backup[] = [];

  let cursor = await manager.database
    .transaction("backup")
    .objectStore("backup")
    .openCursor();

  while (cursor) {
    backups.push(cursor.value);
    cursor = await cursor.continue();
  }
  return backups;
};

export interface Context {
  env: {
    DISCOHOOK_ORIGIN: string;
  };
}

// Just for debug, call this manually to store a backup
// biome-ignore lint/correctness/noUnusedVariables: ^
const saveBackup = async (manager: DatabaseManager) => {
  await manager.database.clear("backup");
  await manager.database
    .transaction("backup", "readwrite")
    .objectStore("backup")
    .put({
      id: 1,
      name: "Magic",
      messages: [
        {
          data: {
            content: "Content",
            embeds: [
              {
                thumbnail: {
                  url: "https://cdn.discordapp.com/avatars/633565743103082527/fa47564fcd19857e833e97c6c0208966.webp",
                },
              },
            ],
          },
        },
      ],
      targets: [],
    });
};

export type LoaderArgs = RRLoaderFunctionArgs<Context> & { context: Context };

export const loader = async ({ request, context }: LoaderArgs) => {
  const params = new URL(request.url).searchParams;
  const token = params.get("token");
  if (!token) {
    return redirect(`${context.env.DISCOHOOK_ORIGIN}/?m=org&${params}`);
  }
  return { token, origin: context.env.DISCOHOOK_ORIGIN };
};

export const meta: MetaFunction = () => {
  return [{ title: "Discohook" }];
};

interface TokenUserInfo {
  name: string;
  avatarUrl: string;
  backups: { name: string }[];
}

export default function Index() {
  const { token, origin } = useLoaderData<typeof loader>();
  const { settings } = getLocalStorage();

  const [error, setError] = useState<string>();
  const [user, setUser] = useState<TokenUserInfo>();
  const [backups, setBackups] = useState<Backup[]>();
  const [selected, updateSelected] = useReducer(
    (d: Record<string, boolean>, partialD: Record<string, boolean>) => ({
      ...d,
      ...partialD,
    }),
    {},
  );

  useEffect(() => {
    (async () => {
      const response = await fetch(`${origin}/api/v1/magic-backups`, {
        method: "GET",
        headers: {
          "X-Discohook-Pixiedust": token,
        },
      });
      if (!response.ok) {
        console.error(response);
        const { message } = (await response.json()) as { message: string };
        setError(message);
        return;
      }
      const data = (await response.json()) as TokenUserInfo;
      setUser(data);

      const databaseManager = new DatabaseManager();
      await databaseManager.initialized;
      // await saveBackup(databaseManager);

      const localBackups = await getAllBackups(databaseManager);
      console.log(localBackups);
      setBackups(localBackups);
      const backupNames = data.backups.map((b) => b.name);
      updateSelected(
        Object.fromEntries(
          localBackups.map((b) => [b.id, !backupNames.includes(b.name)]),
        ),
      );
    })();
  }, [token, origin]);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="max-w-xl m-auto">
        {error && (
          <p className="rounded-lg px-4 py-2 bg-red-400 text-black">
            <span className="font-semibold">You've encountered an error:</span>
            <br />
            {error}
          </p>
        )}
        {user && backups ? (
          <>
            <div className="p-4 rounded-lg bg-gray-900 shadow-md">
              <div className="flex">
                <img
                  src={user.avatarUrl}
                  className="rounded-full my-auto h-8 mr-2"
                  alt={user.name}
                />
                <p className="my-auto text-lg font-medium">
                  Hi <span className="font-semibold">{user.name}</span>!
                </p>
              </div>
              <div className="mt-2">
                {backups.length === 0 ? (
                  <p>You don't seem to have any backups.</p>
                ) : (
                  <div>
                    <p>
                      Below are all backups that are stored on this browser.
                      Please deselect the backups that you would not like to
                      import. If you are unsure, just keep all checked.
                    </p>
                    <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
                      {backups.map((backup) => (
                        <Checkbox
                          key={`backup-${backup.id}`}
                          label={
                            <span
                              className={
                                user.backups
                                  .map((b) => b.name)
                                  .includes(backup.name)
                                  ? "text-red-400"
                                  : ""
                              }
                            >
                              {backup.name}
                            </span>
                          }
                          checked={selected[backup.id] ?? true}
                          onChange={(e) =>
                            updateSelected({
                              [backup.id]: e.currentTarget.checked,
                            })
                          }
                        />
                      ))}
                    </div>
                    {backups.filter((b) =>
                      user.backups.map((ub) => ub.name).includes(b.name),
                    ).length !== 0 && (
                      <p className="mt-2 text-sm text-gray-500">
                        Backup names in{" "}
                        <span className="text-red-400">red</span> indicate that
                        you already have a cloud backup with that name. You can
                        choose to import them anyway by simply ticking the box.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3">
              <div className="flex">
                <a className="mr-auto" href={`${origin}/me/backups`}>
                  <Button discordStyle={ButtonStyle.Secondary}>
                    <span className="m-auto">
                      <i className="ci-Chevron_Left" /> Back
                    </span>
                  </Button>
                </a>
              </div>
              <div className="flex">
                <Button
                  className="mx-auto"
                  disabled={
                    Object.values(selected).filter(Boolean).length === 0
                  }
                  onClick={async () => {
                    if (!backups) return;
                    const response = await fetch(
                      `${origin}/api/v1/magic-backups`,
                      {
                        method: "POST",
                        body: JSON.stringify({
                          backups: backups.filter(
                            (b) => selected[b.id] !== false,
                          ),
                        }),
                        headers: {
                          "Content-Type": "application/json",
                          "X-Discohook-Pixiedust": token,
                        },
                      },
                    );
                    if (!response.ok) {
                      console.error(response);
                      const { message } = (await response.json()) as {
                        message: string;
                      };
                      setError(message);
                      return;
                    }
                    const url = new URL(`${origin}/me/backups`);
                    if (settings) {
                      url.searchParams.set(
                        "settings",
                        JSON.stringify(settings),
                      );
                    }
                    window.location.href = url.href;
                  }}
                >
                  <span className="m-auto">Finish</span>
                </Button>
              </div>
              <div className="flex">
                <Button
                  className="ml-auto"
                  discordStyle={ButtonStyle.Secondary}
                  disabled={backups.length === 0}
                  onClick={() => {
                    // Borrowing all this from site/app/modals/JsonEditorModal
                    const blob = new Blob(
                      [JSON.stringify({ version: 7, backups })],
                      { type: "application/json" },
                    );
                    const blobUrl = URL.createObjectURL(blob);
                    try {
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = "backups.json";
                      link.click();
                    } finally {
                      URL.revokeObjectURL(blobUrl);
                    }
                  }}
                >
                  <span className="m-auto">Export All</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <img
            src={`${origin}/logos/icon.svg`}
            alt="Discohook"
            className="h-32 animate-pulse m-auto"
          />
        )}
      </div>
    </div>
  );
}
