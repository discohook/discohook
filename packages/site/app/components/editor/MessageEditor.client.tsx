import { Select } from "@base-ui-components/react/select";
import { Link } from "@remix-run/react";
import {
  type APIWebhook,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { MessageFlags, MessageFlagsBitField } from "discord-bitflag";
import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { CodeGeneratorProps } from "~/modals/CodeGeneratorModal";
import type { EditingComponentData } from "~/modals/ComponentEditModal";
import type { JsonEditorProps } from "~/modals/JsonEditorModal";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import { type QueryData, ZodQueryDataMessage } from "~/types/QueryData";
import type {
  CacheManager,
  ResolvableAPIChannel,
} from "~/util/cache/CacheManager";
import { getMessageText } from "~/util/message";
import { copyText, randomString } from "~/util/text";
import { Button } from "../Button";
import { ButtonSelect } from "../ButtonSelect";
import { InfoBox } from "../InfoBox";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import { transformFileName } from "../preview/Embed";
import { linkClassName } from "../preview/Markdown";
import { AuthorType, getAuthorType } from "../preview/Message.client";
import { ActionRowEditor } from "./ComponentEditor";
import { EmbedEditor, EmbedEditorSection, getEmbedLength } from "./EmbedEditor";
import { PasteFileButton } from "./PasteFileButton";

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
  setJsonEditor: React.Dispatch<
    React.SetStateAction<JsonEditorProps | undefined>
  >;
  setCodeGenerator: React.Dispatch<
    React.SetStateAction<CodeGeneratorProps | undefined>
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
  setJsonEditor,
  setCodeGenerator,
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
  const channels =
    webhooks && cache
      ? webhooks
          .map((w) => cache.channel.get(w.channel_id))
          .filter((c): c is ResolvableAPIChannel => !!c)
      : [];

  const isAllForum =
    !!webhooks &&
    webhooks.length !== 0 &&
    channels.filter((c) => c.type === "forum").length === webhooks.length;
  const isNoneForum =
    // There are webhooks
    !!webhooks &&
    webhooks.length !== 0 &&
    // All of their channels are resolved
    channels.length === webhooks?.length &&
    // None of them are forums
    channels.filter((c) => c.type === "forum").length === 0;

  const imageFiles = useMemo(
    () => files.filter((f) => f.file.type.startsWith("image/")),
    [files],
  );
  const thumbnailFileId = imageFiles.find((f) => f.is_thumbnail)?.id ?? null;

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
          <button
            type="button"
            onClick={() => {
              if (data.messages.length <= 1) {
                data.messages.splice(i, 1, { data: {} });
              } else {
                data.messages.splice(i, 1);
              }
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      <div className="rounded bg-gray-100 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 p-2 dark:px-3 dark:-mx-1 mt-1 space-y-2">
        <TextArea
          label={t("content")}
          className="w-full h-40"
          value={message.data.content ?? ""}
          maxLength={2000}
          freeLength
          markdown="full"
          cache={cache}
          onInput={(e) => {
            message.data.content = e.currentTarget.value || undefined;
            setData({ ...data });
          }}
        />
        <div className="-space-y-2">
          <EmbedEditorSection name={t("thread")}>
            {(!!message.reference || isNoneForum) && (
              <InfoBox severity="blue" icon="Info">
                {t(isNoneForum ? "noForumWebhooks" : "forumImmutable")}
              </InfoBox>
            )}
            <p className="text-sm italic mb-2">
              <Trans
                t={t}
                i18nKey="threadsNote"
                components={[
                  <Link
                    to="/guide/getting-started/threads"
                    className={linkClassName}
                    target="_blank"
                  />,
                ]}
              />
            </p>
            <TextInput
              label={t("forumThreadName")}
              className="w-full"
              value={message.data.thread_name ?? ""}
              maxLength={100}
              freeLength
              required={isAllForum && !message.thread_id}
              disabled={
                !!message.reference || isNoneForum || !!message.thread_id
              }
              onInput={(e) => {
                message.data.thread_name = e.currentTarget.value || undefined;
                setData({ ...data });
              }}
            />
            <TextInput
              // TODO: I want this to be a thread picker in the future, when
              // possible, but we'll always need a way to input an ID
              label={t("threadId")}
              className="w-full"
              value={message.thread_id ?? ""}
              maxLength={30}
              freeLength
              required={isAllForum && !message.data.thread_name}
              disabled={!!message.data.thread_name}
              pattern="^\d+$"
              onInput={(e) => {
                const val = e.currentTarget.value;
                if (!val || /^\d+$/.test(val)) {
                  message.thread_id = val || undefined;
                  setData({ ...data });
                }
              }}
            />
            {(message.reference
              ? !!message.thread_id
              : !!message.data.thread_name) && imageFiles.length > 0 ? (
              <div className="flex">
                <div
                  // Not a fan of this max-width
                  className="grow max-w-[calc(100%_-_1.75rem)]"
                >
                  <Select.Root
                    value={thumbnailFileId}
                    onValueChange={(id) => {
                      for (const file of files) {
                        file.is_thumbnail = file.id === id && !file.embed;
                      }
                      setFiles([...files]);
                    }}
                  >
                    <Select.Trigger className="text-sm font-medium cursor-default">
                      {t("postThumbnail")}
                    </Select.Trigger>
                    <Select.Trigger
                      className={twJoin(
                        "flex rounded border border-black/[0.08] focus:outline-none h-9 py-0 px-[14px] font-medium !mt-0",
                        "disabled:text-gray-600 disabled:cursor-not-allowed",
                        "bg-[#ebebeb] dark:bg-[#1e1f22] dark:border-transparent hover:border-[#c4c9ce] dark:hover:border-[#020202] transition-[border,_opacity] duration-200",
                      )}
                    >
                      <Select.Value
                        placeholder={t("defaultPlaceholder")}
                        className="my-auto truncate ltr:mr-2 rtl:ml-2"
                      />
                      <Select.Icon className="ltr:ml-auto rtl:mr-auto my-auto text-lg">
                        <CoolIcon icon="Chevron_Down" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner
                        className={twJoin(
                          "rounded bg-[#f1f1f1] dark:bg-[#121314] dark:text-[#ddd] font-medium",
                          "p-0.5 border border-black/[0.08]",
                        )}
                        align="start"
                        alignOffset={2}
                      >
                        <Select.ScrollUpArrow />
                        <Select.Popup>
                          <Select.Arrow />
                          {imageFiles.map((file) => {
                            return (
                              <Select.Item
                                key={`thumbnail-select-${file.id}`}
                                value={file.id}
                                className={twJoin(
                                  "px-[14px] py-0 h-9 flex rounded cursor-pointer",
                                  "hover:bg-blurple/40 dark:hover:bg-blurple dark:hover:text-primary-200 text-base text-inherit font-medium",
                                )}
                              >
                                <Select.ItemText className="my-auto ltr:mr-2 rtl:ml-2">
                                  {transformFileName(file.file.name)}
                                </Select.ItemText>
                                <Select.ItemIndicator
                                  className={twJoin(
                                    "ltr:ml-auto rtl:mr-auto my-auto text-lg",
                                    // https://github.com/mui/base-ui/issues/1556#issuecomment-2741296430
                                    thumbnailFileId === file.id
                                      ? "visible"
                                      : "invisible",
                                  )}
                                >
                                  <CoolIcon icon="Check" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            );
                          })}
                        </Select.Popup>
                        <Select.ScrollDownArrow />
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <button
                  type="button"
                  className="ltr:ml-2 rtl:mr-2 mt-auto mb-1 text-xl"
                  onClick={() => {
                    for (const file of files) {
                      file.is_thumbnail = false;
                    }
                    setFiles([...files]);
                  }}
                >
                  <CoolIcon icon="Close_MD" />
                </button>
              </div>
            ) : null}
          </EmbedEditorSection>
          <EmbedEditorSection name={t("profile")}>
            {!!message.reference && (
              <InfoBox severity="blue" icon="Info">
                {t("profileImmutable")}
              </InfoBox>
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
            {files.map(({ id, file, embed, is_thumbnail, url }) => (
              <div
                key={`file-${id}`}
                className="rounded border py-1.5 px-[14px] bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] flex"
              >
                <CoolIcon
                  icon={embed ? "Window" : is_thumbnail ? "Chat" : "File_Blank"}
                  className="text-xl my-auto ltr:mr-2 rtl:ml-2"
                />
                <div className="my-auto truncate ltr:mr-2 rtl:ml-2">
                  <p className="font-medium truncate">
                    {transformFileName(file.name)}
                  </p>
                  {/* <p className="text-sm">{file.size} bytes</p> */}
                </div>
                <button
                  type="button"
                  className="ml-auto my-auto hover:text-red-400 text-xl"
                  onClick={() => {
                    const newFiles = files.filter((f) => f.id !== id);
                    setFiles(newFiles);
                    setData({ ...data });
                    if (url) URL.revokeObjectURL(url);
                  }}
                >
                  <CoolIcon icon="Trash_Full" />
                </button>
              </div>
            ))}
            <input
              id={`files-${id}`}
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
                    url: URL.createObjectURL(file),
                  });
                }
                setFiles(newFiles);
                currentTarget.value = "";
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>(
                    `input#files-${id}`,
                  );
                  // Shouldn't happen
                  if (!input) return;
                  input.click();
                }}
                disabled={files.length >= 10}
              >
                {t("addFile")}
              </Button>
              <PasteFileButton
                t={t}
                disabled={files.length >= 10}
                onChange={async (list) => {
                  const newFiles = [...files];
                  for (const file of Array.from(list).slice(
                    0,
                    10 - newFiles.length,
                  )) {
                    newFiles.push({
                      id: randomString(10),
                      file,
                      url: URL.createObjectURL(file),
                    });
                  }
                  setFiles(newFiles);
                }}
              />
            </div>
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
                key={`edit-message-${id}-embed-${ei}`}
                message={message}
                messageIndex={i}
                embed={embed}
                embedIndex={ei}
                data={data}
                setData={setData}
                files={files}
                cache={cache}
              />
            ))}
          </div>
        )}
        {message.data.components && message.data.components.length > 0 && (
          <>
            {!possiblyActionable &&
            // No actionable webhooks and there are not only link buttons in
            // the message, so the user will have issues sending the message
            message.data.components
              .flatMap((r) => r.components)
              .map(
                (c) =>
                  c.type === ComponentType.Button &&
                  c.style === ButtonStyle.Link,
              )
              .includes(false) ? (
              <>
                <p className="mt-1 text-lg font-semibold cursor-default select-none">
                  {t("components")}
                </p>
                <InfoBox
                  icon="Info"
                  severity={
                    !webhooks || webhooks?.length === 0
                      ? "blue"
                      : possiblyApplication
                        ? "yellow"
                        : "red"
                  }
                  collapsible
                  open
                >
                  {t(
                    !webhooks || webhooks?.length === 0
                      ? "componentsNoWebhook"
                      : possiblyApplication
                        ? "componentsPossibleWebhook"
                        : "componentsNoUsableWebhook",
                  )}
                </InfoBox>
              </>
            ) : null}
            <div className="space-y-1">
              {message.data.components.map((row, ri) => (
                <div key={`edit-message-${id}-row-${ri}`}>
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
        <div className="flex space-x-2 rtl:space-x-reverse">
          <div>
            <ButtonSelect
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
              ]}
              onChange={(opt) => {
                const val = (opt as { value: "embed" | "row" | "poll" }).value;
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
                  default:
                    break;
                }
              }}
            >
              {t("add")}
            </ButtonSelect>
          </div>
          <Button
            discordstyle={ButtonStyle.Secondary}
            onClick={() => setSettingMessageIndex(i)}
          >
            {t("setLink")}
          </Button>
          <div>
            <ButtonSelect
              discordstyle={ButtonStyle.Secondary}
              options={[
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
                {
                  label: (
                    <p className="flex">
                      <CoolIcon
                        icon="Terminal"
                        className="ltr:mr-1.5 rtl:ml-1.5 my-auto text-lg"
                      />
                      <span className="my-auto">{t("jsonEditor")}</span>
                    </p>
                  ),
                  value: "jsonEditor",
                },
                {
                  label: (
                    <p className="flex">
                      <CoolIcon
                        icon="Code"
                        className="ltr:mr-1.5 rtl:ml-1.5 my-auto text-lg"
                      />
                      <span className="my-auto">{t("codeGenerator")}</span>
                    </p>
                  ),
                  value: "codeGenerator",
                },
                {
                  label: (
                    <p className="flex">
                      <CoolIcon
                        icon="Copy"
                        className="ltr:mr-1.5 rtl:ml-1.5 my-auto text-lg"
                      />
                      <span className="my-auto">{t("copyQueryData")}</span>
                    </p>
                  ),
                  value: "copyQueryData",
                },
              ]}
              onChange={(opt) => {
                const val = (
                  opt as {
                    value:
                      | "flags"
                      | "jsonEditor"
                      | "codeGenerator"
                      | "copyQueryData";
                  }
                ).value;
                switch (val) {
                  case "flags": {
                    setEditingMessageFlags(i);
                    break;
                  }
                  case "jsonEditor":
                    setJsonEditor({
                      data: message.data,
                      update: (newData) => {
                        message.data = newData;
                      },
                      schema: ZodQueryDataMessage.shape.data,
                    });
                    break;
                  case "codeGenerator":
                    setCodeGenerator({ data: message.data });
                    break;
                  case "copyQueryData":
                    copyText(JSON.stringify(message));
                    break;
                  default:
                    break;
                }
              }}
            >
              {t("options")}
            </ButtonSelect>
          </div>
        </div>
      </div>
    </details>
  );
};
