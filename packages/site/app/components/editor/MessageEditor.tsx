import { APIWebhook } from "discord-api-types/v10";
import { MessageFlags, MessageFlagsBitField } from "discord-bitflag";
import { Trans, useTranslation } from "react-i18next";
import { EditingComponentData } from "~/modals/ComponentEditModal";
import { DraftFile, getQdMessageId } from "~/routes/_index";
import { QueryData } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { randomString } from "~/util/text";
import { Button } from "../Button";
import { ButtonSelect } from "../ButtonSelect";
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
  setEditingMessageFlags: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  setEditingComponent: React.Dispatch<
    React.SetStateAction<EditingComponentData | undefined>
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
  setEditingMessageFlags,
  setEditingComponent,
  webhooks,
  cache,
}) => {
  const { t } = useTranslation();
  const message = data.messages[i];
  const id = getQdMessageId(message);
  const embedsLength =
    message.data.embeds && message.data.embeds.length > 0
      ? message.data.embeds.map(getEmbedLength).reduce((a, b) => a + b)
      : 0;
  const previewText = getMessageText(message.data);
  const flags = new MessageFlagsBitField(message.data.flags ?? 0);

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
        <span className="truncate">
          {flags.has(MessageFlags.SuppressNotifications) && (
            <CoolIcon
              icon="Bell_Off"
              title={t("messageFlag.4096")}
              className="ltr:mr-1 rtl:ml-1"
            />
          )}
          {flags.has(MessageFlags.SuppressEmbeds) && (
            <CoolIcon
              icon="Window_Close"
              title={t("messageFlag.4")}
              className="ltr:mr-1 rtl:ml-1"
            />
          )}
          {t(previewText ? "messageNText" : "messageN", {
            replace: { n: i + 1, text: previewText },
          })}
        </span>
        <div className="ml-auto space-x-2 rtl:space-x-reverse my-auto shrink-0">
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
          label={t("content")}
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
          <EmbedEditorSection name={t("profile")}>
            {!!message.reference && (
              <InfoBox severity="yellow">{t("profileImmutable")}</InfoBox>
            )}
            <TextInput
              label={t("name")}
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
              label={t("avatarUrl")}
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
          <EmbedEditorSection
            name={t("filesCount", {
              replace: {
                count: files.length,
              },
            })}
          >
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
              id={`files-${i}`}
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
                const input = document.querySelector<HTMLInputElement>(
                  `input#files-${i}`,
                );
                // Shouldn't happen
                if (!input) return;
                input.click();
              }}
              disabled={files.length >= 10}
            >
              {t("addFile")}
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
            {flags.has(MessageFlags.SuppressEmbeds) && (
              <div className="-mb-2">
                <InfoBox severity="yellow" icon="Circle_Warning">
                  {t("embedsHidden")}
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
            {!possiblyActionable && (
              <>
                <p className="mt-1 text-lg font-semibold cursor-default select-none">
                  {t("components")}
                </p>
                <InfoBox icon="Info" collapsible open>
                  {t(
                    !webhooks || webhooks?.length === 0
                      ? "componentsNoWebhook"
                      : possiblyApplication
                        ? "componentsPossibleWebhook"
                        : "componentsNoUsableWebhook",
                  )}
                </InfoBox>
              </>
            )}
            <div className="space-y-1">
              {message.data.components.map((row, ri) => (
                <div key={`edit-message-${i}-row-${ri}`}>
                  <ActionRowEditor
                    message={message}
                    row={row}
                    rowIndex={ri}
                    data={data}
                    setData={setData}
                    cache={cache}
                    setEditingComponent={setEditingComponent}
                    open
                  />
                </div>
              ))}
            </div>
          </>
        )}
        <div className="flex">
          <Button
            className="ltr:mr-2 rtl:ml-2 shrink"
            onClick={() => setSettingMessageIndex(i)}
          >
            <span>
              {t(message.reference ? "changeReference" : "setReference")}
            </span>
          </Button>
          <div>
            <ButtonSelect
              // classNames={{
              //   menu: (p) => twJoin(selectClassNames.menu?.(p), "!w-32"),
              // }}
              options={[
                {
                  label: (
                    <p className="flex">
                      <CoolIcon
                        icon="Add_Plus_Square"
                        className="ltr:mr-1.5 rtl:ml-1.5 my-auto text-lg"
                      />
                      <span className="my-auto">{t("addEmbed")}</span>
                    </p>
                  ),
                  value: "embed",
                  isDisabled:
                    !!message.data.embeds && message.data.embeds.length >= 10,
                },
                {
                  label: (
                    <p className="flex">
                      <CoolIcon
                        icon="Add_Row"
                        className="ltr:mr-1.5 rtl:ml-1.5 my-auto text-lg"
                      />
                      <span className="my-auto">
                        {t(
                          message.data.components &&
                            message.data.components.length >= 1
                            ? "addRow"
                            : "addComponents",
                        )}
                      </span>
                    </p>
                  ),
                  value: "row",
                  isDisabled:
                    !!message.data.components &&
                    message.data.components.length >= 5,
                },
                // {
                //   label: t("addPoll"),
                //   value: "poll",
                //   isDisabled: !!message.data.poll,
                // },
                {
                  label: (
                    <p className="flex">
                      <CoolIcon
                        icon="Flag"
                        className="ltr:mr-1.5 rtl:ml-1.5 my-auto text-lg"
                      />
                      <span className="my-auto">{t("flags")}</span>
                    </p>
                  ),
                  value: "flags",
                },
              ]}
              onChange={(opt) => {
                const val = (
                  opt as { value: "embed" | "row" | "poll" | "flags" }
                ).value;
                switch (val) {
                  case "embed": {
                    message.data.embeds = message.data.embeds
                      ? [...message.data.embeds, {}]
                      : [{}];
                    setData({ ...data });
                    break;
                  }
                  case "row": {
                    const emptyRow = { type: 1, components: [] };
                    message.data.components = message.data.components
                      ? [...message.data.components, emptyRow]
                      : [emptyRow];
                    setData({ ...data });
                    break;
                  }
                  case "flags": {
                    setEditingMessageFlags(i);
                    break;
                  }
                  default:
                    break;
                }
              }}
            >
              {t("add")}
            </ButtonSelect>
          </div>
        </div>
      </div>
    </details>
  );
};
