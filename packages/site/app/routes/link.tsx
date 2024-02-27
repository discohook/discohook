import { SerializeFrom } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { APIEmbed, APIEmbedImage, ButtonStyle } from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeParseReturnType, z } from "zod";
import { zx } from "zodix";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { TextInput } from "~/components/TextInput";
import { LinkEmbedEditor } from "~/components/editor/LinkEmbedEditor";
import { Embed } from "~/components/preview/Embed";
import { Message } from "~/components/preview/Message";
import { HistoryModal } from "~/modals/HistoryModal";
import { ImageModal, ImageModalProps } from "~/modals/ImageModal";
import { PreviewDisclaimerModal } from "~/modals/PreviewDisclaimerModal";
import { getUser } from "~/session.server";
import {
  LinkQueryData,
  ZodLinkEmbed,
  ZodLinkQueryData,
} from "~/types/QueryData";
import { LINK_INDEX_EMBED, LINK_INDEX_FAILURE_EMBED } from "~/util/constants";
import { LoaderArgs } from "~/util/loader";
import { useLocalStorage } from "~/util/localstorage";
import {
  base64Decode,
  base64UrlEncode,
  copyText,
  randomString,
} from "~/util/text";
import { getUserAvatar } from "~/util/users";
import { loader as apiLinkBackupsId } from "../api/v1/link-backups.$id";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  return {
    user,
  };
};

export const linkEmbedToAPIEmbed = (
  data: z.infer<typeof ZodLinkEmbed>,
  code?: string,
): { embed: APIEmbed; extraImages: APIEmbedImage[] } => {
  const embed: APIEmbed = {
    title: data.title,
    url: code ? `/link/${code}` : "#",
    provider: data.provider,
    author: data.author,
    description: data.description,
    color: data.color,
    video: data.video,
  };
  const extraImages: APIEmbedImage[] = [];

  if (data.images && data.images.length > 0) {
    if (data.large_images) {
      embed.image = data.images[0];
      extraImages.push(...data.images.slice(1));
    } else {
      embed.thumbnail = data.images[0];
    }
  }

  return { embed, extraImages };
};

export interface LinkHistoryItem {
  id: string;
  createdAt: Date;
  data: LinkQueryData;
}

export default function Index() {
  const { t } = useTranslation();
  const { user } = useLoaderData<typeof loader>();

  const [settings] = useLocalStorage();
  const [loc, setLoc] = useState<Location>();
  useEffect(() => setLoc(location), []);

  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");

  interface BackupInfo {
    id: number;
    code: string;
    name: string;
    data?: LinkQueryData;
  }

  const backupIdParsed = zx.NumAsString.safeParse(searchParams.get("backup"));
  const [backupInfo, setBackupInfo] = useState<BackupInfo>();
  const [backupNameDraft, setBackupNameDraft] = useState<string>();

  const [data, setData] = useState<LinkQueryData>({
    version: 1,
    embed: { data: {} },
  });

  const getBackupInfo = async (
    backupId: number,
  ): Promise<BackupInfo | null> => {
    const r = await fetch(apiUrl(BRoutes.linkBackups(backupId)), {
      method: "GET",
    });
    if (!r.ok) {
      console.error(r);
      return null;
    }
    const { id, code, name, data } = (await r.json()) as SerializeFrom<
      typeof apiLinkBackupsId
    >;
    return {
      id,
      code,
      name,
      data,
    };
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once, on page load
  useEffect(() => {
    if (backupIdParsed.success) {
      getBackupInfo(backupIdParsed.data).then((info) => {
        if (!info) return;
        if (info.data) {
          setData(info.data);
        }

        setBackupInfo({ ...info, data: undefined });
      });
    } else {
      let parsed:
        | SafeParseReturnType<LinkQueryData, LinkQueryData>
        | { success: false };
      try {
        parsed = ZodLinkQueryData.safeParse(
          JSON.parse(
            searchParams.get("data")
              ? base64Decode(searchParams.get("data") ?? "{}") ?? "{}"
              : JSON.stringify({ embed: LINK_INDEX_EMBED }),
          ),
        );
      } catch {
        parsed = {
          success: false,
        };
      }

      if (parsed.success) {
        if (parsed.data?.backup_id !== undefined) {
          getBackupInfo(parsed.data?.backup_id).then((info) => {
            if (!info) return;
            setBackupInfo({ ...info, data: undefined });
          });
        }
        setData({ version: 1, ...(parsed.data as LinkQueryData) });
      } else {
        setData({ version: 1, embed: LINK_INDEX_FAILURE_EMBED });
      }
    }
  }, []);

  const [localHistory, setLocalHistory] = useState<LinkHistoryItem[]>([]);
  const [updateCount, setUpdateCount] = useState(-1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to run this when `data` changes
  useEffect(() => setUpdateCount(updateCount + 1), [data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (updateCount % 20 === 0) {
      const lastHistoryItem = localHistory.slice(-1)[0];
      if (
        !lastHistoryItem ||
        JSON.stringify(lastHistoryItem.data) !== JSON.stringify(data)
      ) {
        if (Object.keys(data.embed.data).length > 0) {
          setLocalHistory(
            [
              ...localHistory,
              {
                id: randomString(10),
                createdAt: new Date(),
                data: structuredClone(data),
              },
            ].slice(-20),
          );
        }
        setUpdateCount(updateCount + 1);
        if (backupInfo !== undefined) {
          console.log("Saving backup", backupInfo.id);
          fetch(apiUrl(BRoutes.linkBackups(backupInfo.id)), {
            method: "PATCH",
            body: new URLSearchParams({
              data: JSON.stringify(data),
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }).then((r) => {
            if (!r.ok) return;
            r.json().then((d) => setBackupInfo(d as BackupInfo));
          });
        }
      }
    }

    const pathUrl = location.origin + location.pathname;
    const encoded = base64UrlEncode(JSON.stringify(data));
    if (!backupInfo) {
      // URLs on Cloudflare are limited to 16KB
      const fullUrl = new URL(`${pathUrl}?data=${encoded}`);
      history.pushState({ path: fullUrl.toString() }, "", fullUrl.toString());
    } else {
      // Make sure it stays there, we also want to wipe any other params
      const fullUrl = `${pathUrl}?backup=${backupInfo.id}`;
      history.pushState({ path: fullUrl.toString() }, "", fullUrl.toString());
    }
  }, [backupInfo, data, updateCount]);

  const [showDisclaimer, setShowDisclaimer] = useState(dm === "preview");
  const [imageModalData, setImageModalData] = useState<ImageModalProps>();
  // const [exampleOpen, setExampleOpen] = useState(dm === "embed-example");
  // const [sharing, setSharing] = useState(dm === "share-create");
  const [showHistory, setShowHistory] = useState(dm === "history");

  const [tab, setTab] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-screen overflow-hidden">
      <PreviewDisclaimerModal
        open={showDisclaimer}
        setOpen={setShowDisclaimer}
      />
      {/* <ExampleModal open={exampleOpen} setOpen={setExampleOpen} /> */}
      <HistoryModal
        open={showHistory}
        setOpen={setShowHistory}
        localHistory={localHistory}
        setLocalHistory={setLocalHistory}
        setData={setData}
      />
      <ImageModal
        clear={() => setImageModalData(undefined)}
        {...imageModalData}
      />
      <Header user={user} />
      <div className="md:flex h-[calc(100%_-_3rem)]">
        <div
          className={`p-4 md:w-1/2 h-full overflow-y-scroll ${
            tab === "editor" ? "" : "hidden md:block"
          }`}
        >
          {backupInfo && (
            <InfoBox icon="Save" collapsible open>
              {t("editingLinkBackupNote")}
            </InfoBox>
          )}
          <div className="flex mb-2">
            <Button
              onClick={() => setShowHistory(true)}
              discordstyle={ButtonStyle.Secondary}
              disabled={localHistory.length === 0}
            >
              {t("history")}
            </Button>
            <Button
              className="ml-2"
              discordstyle={ButtonStyle.Secondary}
              disabled={!backupInfo?.code}
              onClick={() => {
                if (!backupInfo) return;
                // In the future this will be something like `my.example.com/$code`
                copyText(`${window.origin}/link/${backupInfo.code}`);
              }}
            >
              {t("copyLink")}
            </Button>
            <Button
              className="ml-auto md:hidden"
              onClick={() => setTab("preview")}
              discordstyle={ButtonStyle.Secondary}
            >
              {t("preview")} <CoolIcon icon="Chevron_Right" />
            </Button>
          </div>
          <div className="flex w-full mb-2">
            <div className="grow">
              <TextInput
                label={t("name")}
                name="backup-name"
                className="w-full"
                maxLength={100}
                disabled={!!backupInfo?.name}
                value={backupNameDraft ?? backupInfo?.name ?? ""}
                onChange={(e) => setBackupNameDraft(e.currentTarget.value)}
              />
            </div>
            <Button
              className="ml-2 mt-5"
              onClick={async () => {
                const r = await fetch(
                  apiUrl(BRoutes.linkBackups(backupInfo?.id)),
                  {
                    method: backupInfo ? "PATCH" : "POST",
                    body: new URLSearchParams({
                      name: backupNameDraft ?? "",
                      data: JSON.stringify(data),
                    }),
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                  },
                );
                // These payloads don't contain `data` so we don't need
                // to worry about removing it
                const d = (await r.json()) as BackupInfo;
                setBackupInfo(d);
              }}
            >
              {t("save")}
            </Button>
          </div>
          <LinkEmbedEditor embed={data.embed} data={data} setData={setData} />
        </div>
        <div
          className={`md:border-l-2 border-l-gray-400 dark:border-l-[#1E1F22] p-4 md:w-1/2 h-full overflow-y-scroll relative ${
            tab === "preview" ? "" : "hidden md:block"
          }`}
        >
          <div className="md:hidden">
            <Button
              onClick={() => setTab("editor")}
              discordstyle={ButtonStyle.Secondary}
            >
              <CoolIcon icon="Chevron_Left" /> {t("editor")}
            </Button>
            <hr className="border border-gray-400 dark:border-gray-600 my-4" />
          </div>
          {user ? (
            <Message
              message={{
                author: {
                  name:
                    user.discordUser?.globalName ??
                    user.discordUser?.name ??
                    user.name,
                  icon_url: getUserAvatar(user),
                  badge: null,
                },
                content:
                  loc && backupInfo
                    ? `${loc.origin}/link/${backupInfo.code}`
                    : undefined,
                embeds: [
                  linkEmbedToAPIEmbed(data.embed.data, backupInfo?.code).embed,
                  ...linkEmbedToAPIEmbed(
                    data.embed.data,
                    backupInfo?.code,
                  ).extraImages.map((image) => ({
                    url: backupInfo ? `/link/${backupInfo.code}` : "#",
                    image,
                  })),
                ],
              }}
              messageDisplay={settings.messageDisplay}
              compactAvatars={settings.compactAvatars}
              setImageModalData={setImageModalData}
            />
          ) : (
            <Embed
              {...linkEmbedToAPIEmbed(data.embed.data, backupInfo?.code)}
              setImageModalData={setImageModalData}
            />
          )}
          <div className="fixed bottom-4 right-4 grid gap-2 grid-cols-1">
            {/* <Button
              discordstyle={ButtonStyle.Secondary}
              onClick={() => setExampleOpen(true)}
            >
              {t("embedExample")}
            </Button> */}
            <Button
              discordstyle={ButtonStyle.Secondary}
              onClick={() => setShowDisclaimer(true)}
            >
              <CoolIcon icon="Info" className="mr-1.5" />
              {t("previewInfo")}
            </Button>
            <Link to="/donate" target="_blank" className="contents">
              <Button
                // Green link buttons are sinful, but eye-catching
                discordstyle={ButtonStyle.Success}
              >
                {t("donate")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
