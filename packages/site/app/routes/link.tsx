import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { APIEmbed, APIEmbedImage, ButtonStyle } from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeParseReturnType, z } from "zod";
import { zx } from "zodix";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { Header } from "~/components/Header";
import { InfoBox } from "~/components/InfoBox";
import { LinkEmbedEditor } from "~/components/editor/LinkEmbedEditor";
import { Embed } from "~/components/preview/Embed";
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
import { base64Decode, base64UrlEncode, randomString } from "~/util/text";

export const loader = async ({ request, context }: LoaderArgs) => {
  const user = await getUser(request, context);
  return {
    user,
  };
};

export const linkEmbedToAPIEmbed = (
  data: z.infer<typeof ZodLinkEmbed>,
): { embed: APIEmbed; extraImages: APIEmbedImage[] } => {
  const embed: APIEmbed = {
    title: data.title,
    provider: data.provider,
    description: data.description,
    color: data.color,
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

  const [searchParams] = useSearchParams();
  const dm = searchParams.get("m");
  const backupIdParsed = zx.NumAsString.safeParse(searchParams.get("backup"));

  const [backupId, setBackupId] = useState<number>();
  const [data, setData] = useState<LinkQueryData>({
    version: 1,
    embed: { data: {} },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once, on page load
  useEffect(() => {
    if (backupIdParsed.success) {
      fetch(`/api/link-backups/${backupIdParsed.data}?data=true`, {
        method: "GET",
      }).then((r) => {
        if (r.status === 200) {
          setBackupId(backupIdParsed.data);
          r.json().then((d: any) => {
            const qd: LinkQueryData = d.data;
            if (!qd.embed) {
              // This shouldn't happen but it could if something was saved wrong
              qd.embed = { data: {} };
            }
            setData({ ...qd, backup_id: backupIdParsed.data });
          });
        }
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
          setBackupId(parsed.data.backup_id);
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
        if (backupId !== undefined) {
          console.log("Saving backup", backupId);
          fetch(`/api/link-backups/${backupId}`, {
            method: "PATCH",
            body: new URLSearchParams({
              data: JSON.stringify(data),
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });
        }
      }
    }

    const pathUrl = location.origin + location.pathname;
    const encoded = base64UrlEncode(JSON.stringify(data));
    if (backupId === undefined) {
      // URLs on Cloudflare are limited to 16KB
      const fullUrl = new URL(`${pathUrl}?data=${encoded}`);
      history.pushState({ path: fullUrl.toString() }, "", fullUrl.toString());
    } else {
      // Make sure it stays there, we also want to wipe any other params
      const fullUrl = `${pathUrl}?backup=${backupId}`;
      history.pushState({ path: fullUrl.toString() }, "", fullUrl.toString());
    }
  }, [backupId, data, updateCount]);

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
      {/*
      <ExampleModal open={exampleOpen} setOpen={setExampleOpen} />
      <MessageSaveModal
        open={sharing}
        setOpen={setSharing}
        targets={targets}
        data={data}
        setData={setData}
        user={user}
      />
    */}
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
          {backupId !== undefined && (
            <InfoBox icon="Save" collapsible open>
              {t("editingBackupNote")}
            </InfoBox>
          )}
          <div className="flex mb-2">
            <Button
              className="ml-auto md:hidden"
              onClick={() => setTab("preview")}
              discordstyle={ButtonStyle.Secondary}
            >
              {t("preview")} <CoolIcon icon="Chevron_Right" />
            </Button>
          </div>
          <div className="flex mb-2">
            {/* <Button
              className="ml-2"
              onClick={() => setSharing(true)}
              discordstyle={ButtonStyle.Secondary}
              disabled={data.messages.length === 0}
            >
              {t("saveMessage")}
            </Button> */}
            <Button
              className="ml-0"
              onClick={() => setShowHistory(true)}
              discordstyle={ButtonStyle.Secondary}
              disabled={localHistory.length === 0}
            >
              {t("history")}
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
          <Embed
            {...linkEmbedToAPIEmbed(data.embed.data)}
            setImageModalData={setImageModalData}
          />
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
