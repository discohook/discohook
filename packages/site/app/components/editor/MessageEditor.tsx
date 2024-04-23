import { APIWebhook } from "discord-api-types/v10";
import { Trans } from "react-i18next";
import { DraftFile } from "~/routes/_index";
import { QueryData, QueryDataComponent } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { randomString } from "~/util/text";
import { Button } from "../Button";
import { InfoBox } from "../InfoBox";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import { AuthorType, getAuthorType } from "../preview/Message";
import { ActionRowEditor } from "./ComponentEditor";
import {
  EmbedEditor,
  EmbedEditorSection,
  getEmbedLength,
  getEmbedText,
} from "./EmbedEditor";

export const getMessageText = (
  message: QueryData["messages"][number]["data"],
): string | undefined =>
  message.content ??
  (message.embeds
    ? message.embeds.map(getEmbedText).find((t) => !!t)
    : undefined);

export const getBlobDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const MessageEditor: React.FC<{
  data: QueryData;
  files: DraftFile[];
  discordApplicationId: string;
  index: number;
  setData: React.Dispatch<QueryData>;
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>;
  setSettingMessageIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  webhooks?: APIWebhook[];
  cache?: CacheManager;
}> = ({
  index: i,
  data,
  files,
  discordApplicationId,
  setData,
  setFiles,
  setSettingMessageIndex,
  webhooks,
  cache,
}) => {
  const message = data.messages[i];
  const embedsLength =
    message.data.embeds && message.data.embeds.length > 0
      ? message.data.embeds.map(getEmbedLength).reduce((a, b) => a + b)
      : 0;
  const previewText = getMessageText(message.data);
  const components = data.components?.[i];

  const authorTypes = webhooks
    ? webhooks.map((w) => getAuthorType(discordApplicationId, w))
    : [];
  const possiblyActionable = authorTypes.includes(AuthorType.ActionableWebhook);
  const possiblyApplication = authorTypes.includes(
    AuthorType.ApplicationWebhook,
  );

  return (
    <details className="group/message mt-4 pb-2" open>
      <summary className="group-open/message:mb-2 transition-[margin] marker:content-none marker-none flex font-semibold text-base cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/message:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="shrink-0">Message {i + 1}</span>
        {previewText && <span className="truncate ml-1">- {previewText}</span>}
        <div className="ml-auto space-x-2 my-auto shrink-0">
          <button
            type="button"
            className={i === 0 ? "hidden" : ""}
            onClick={() => {
              data.messages.splice(i, 1);
              data.messages.splice(i - 1, 0, message);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            type="button"
            className={i === data.messages.length - 1 ? "hidden" : ""}
            onClick={() => {
              data.messages.splice(i, 1);
              data.messages.splice(i + 1, 0, message);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            type="button"
            className={data.messages.length >= 10 ? "hidden" : ""}
            onClick={() => {
              data.messages.splice(i + 1, 0, structuredClone(message));
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          {data.messages.length > 1 && (
            <button
              type="button"
              onClick={() => {
                data.messages.splice(i, 1);
                setData({ ...data });
              }}
            >
              <CoolIcon icon="Trash_Full" />
            </button>
          )}
        </div>
      </summary>
      <div className="rounded bg-gray-100 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 p-2 dark:px-3 dark:-mx-1 mt-1 space-y-2">
        <TextArea
          label="Content"
          className="w-full h-40"
          value={message.data.content ?? ""}
          maxLength={2000}
          freelength
          markdown="full"
          cache={cache}
          onInput={(e) => {
            message.data.content = e.currentTarget.value || undefined;
            setData({ ...data });
          }}
        />
        <div className="-space-y-2">
          <EmbedEditorSection name="Profile">
            {!!message.reference && (
              <InfoBox severity="yellow">
                Profile info cannot be changed for existing messages.
              </InfoBox>
            )}
            <TextInput
              label="Name"
              maxLength={80}
              className="w-full"
              disabled={!!message.reference}
              value={message.data.author?.name ?? ""}
              onChange={(e) => {
                message.data.author = message.data.author ?? {};
                message.data.author.name = e.currentTarget.value || undefined;
                setData({ ...data });
              }}
            />
            <TextInput
              label="Avatar URL"
              type="url"
              className="w-full"
              disabled={!!message.reference}
              value={message.data.author?.icon_url ?? ""}
              onChange={(e) => {
                message.data.author = message.data.author ?? {};
                message.data.author.icon_url =
                  e.currentTarget.value || undefined;
                setData({ ...data });
              }}
            />
          </EmbedEditorSection>
          <EmbedEditorSection name={`Files (${files.length}/10)`}>
            {files.map(({ id, file, embed }) => (
              <div
                key={`file-${id}`}
                className="rounded border py-1.5 px-[14px] bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] flex"
              >
                <CoolIcon
                  icon={embed ? "Window" : "File_Blank"}
                  className="text-xl my-auto mr-2"
                />
                <div className="my-auto truncate">
                  <p className="font-medium">{file.name}</p>
                  {/* <p className="text-sm">{file.size} bytes</p> */}
                </div>
                <button
                  type="button"
                  className="ml-auto my-auto hover:text-red-400 text-xl"
                  onClick={() => {
                    const newFiles = files.filter((f) => f.id !== id);
                    setFiles(newFiles);
                    setData({ ...data });
                  }}
                >
                  <CoolIcon icon="Trash_Full" />
                </button>
              </div>
            ))}
            <input
              id="files"
              type="file"
              hidden
              multiple
              onChange={async ({ currentTarget }) => {
                const list = currentTarget.files;
                if (!list) return;

                const newFiles = [...files];
                for (const file of Array.from(list).slice(
                  0,
                  10 - newFiles.length,
                )) {
                  newFiles.push({
                    id: randomString(10),
                    file,
                    // We need this for the gallery. For regular files we'd
                    // just be bloating state for the time being.
                    url: ["video", "image"].includes(file.type.split("/")[0])
                      ? await getBlobDataUrl(file)
                      : undefined,
                  });
                }
                setFiles(newFiles);
                currentTarget.value = "";
              }}
            />
            <Button
              onClick={() => {
                const input =
                  document.querySelector<HTMLInputElement>("input#files");
                // Shouldn't happen
                if (!input) return;
                input.click();
              }}
              disabled={files.length >= 10}
            >
              Add File
            </Button>
          </EmbedEditorSection>
        </div>
        {message.data.embeds && message.data.embeds.length > 0 && (
          <div className="mt-1 space-y-1">
            {embedsLength > 6000 && (
              <div className="-mb-2">
                <InfoBox severity="red" icon="Circle_Warning">
                  <Trans i18nKey="embedsTooLarge" count={embedsLength - 6000} />
                </InfoBox>
              </div>
            )}
            {message.data.embeds.map((embed, ei) => (
              <EmbedEditor
                key={`edit-message-${i}-embed-${ei}`}
                message={message}
                messageIndex={i}
                embed={embed}
                embedIndex={ei}
                data={data}
                setData={setData}
                cache={cache}
              />
            ))}
          </div>
        )}
        {message.data.components && message.data.components.length > 0 && (
          <>
            <p className="mt-1 text-lg font-semibold cursor-default select-none">
              Components
            </p>
            {!possiblyActionable && (
              <InfoBox icon="Info" collapsible open>
                {!webhooks || webhooks?.length === 0 ? (
                  <>
                    Component availability is dependent on the type of webhook
                    that you send a message with. For link buttons, the webhook
                    must be owned by a bot, but to send other buttons and select
                    menus, the webhook must be owned by the Discohook
                    application (this website/its bot). Add a webhook for more
                    information.
                  </>
                ) : possiblyApplication ? (
                  <>
                    One or more of your webhooks are owned by an application,
                    but not Discohook, so you can only add link buttons. Add a
                    webhook owned by the Discohook bot to be able to use more
                    types of components.
                  </>
                ) : (
                  <>
                    None of your webhooks are compatibile with components. Add a
                    webhook owned by the Discohook bot.
                  </>
                )}
              </InfoBox>
            )}
            <div className="mt-1 space-y-1 rounded p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow">
              {message.data.components.map((row, ri) => (
                <div key={`edit-message-${i}-row-${ri}`}>
                  <ActionRowEditor
                    message={message}
                    row={row}
                    rowIndex={ri}
                    data={data}
                    setData={setData}
                    setComponents={(value: QueryDataComponent[]) => {
                      setData({
                        ...data,
                        components: {
                          ...(data.components ?? {}),
                          [i]: value,
                        },
                      });
                    }}
                    open
                  />
                  {message.data.components &&
                    ri < message.data.components.length - 1 && (
                      <hr className="border border-gray-500/20 my-2" />
                    )}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="flex">
          <Button
            className="mr-2 shrink"
            onClick={() => setSettingMessageIndex(i)}
          >
            <span className="hidden sm:inline">
              {message.reference ? "Change Reference" : "Set Reference"}
            </span>
            <span className="sm:hidden">Reference</span>
          </Button>
          <Button
            className="ml-auto shrink"
            onClick={() => {
              message.data.embeds = message.data.embeds
                ? [...message.data.embeds, {}]
                : [{}];
              setData({ ...data });
            }}
            disabled={!!message.data.embeds && message.data.embeds.length >= 10}
          >
            <span className="hidden sm:inline">Add Embed</span>
            <span className="sm:hidden">Embed</span>
          </Button>
          <Button
            className="ml-2 shrink"
            onClick={() => {
              const emptyRow = { type: 1, components: [] };
              message.data.components = message.data.components
                ? [...message.data.components, emptyRow]
                : [emptyRow];
              setData({ ...data });
            }}
            disabled={
              !!message.data.components && message.data.components.length >= 5
            }
          >
            <span className="hidden sm:inline">
              {message.data.components && message.data.components.length >= 1
                ? "Add Row"
                : "Add Components"}
            </span>
            <span className="sm:hidden">
              {message.data.components && message.data.components.length >= 1
                ? "Row"
                : "Components"}
            </span>
          </Button>
        </div>
      </div>
    </details>
  );
};
