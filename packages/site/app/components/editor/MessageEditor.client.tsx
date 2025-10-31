import { Select } from "@base-ui-components/react/select";
import { Link } from "@remix-run/react";
import {
  type APIWebhook,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import type { TFunction } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { CodeGeneratorProps } from "~/modals/CodeGeneratorModal";
import type { EditingComponentData } from "~/modals/ComponentEditModal";
import type { JsonEditorProps } from "~/modals/JsonEditorModal";
import {
  Modal,
  ModalFooter,
  type ModalProps,
  PlainModalHeader,
} from "~/modals/Modal";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import { type QueryData, ZodQueryDataMessage } from "~/types/QueryData";
import type {
  CacheManager,
  ResolvableAPIChannel,
} from "~/util/cache/CacheManager";
import { MAX_TOTAL_COMPONENTS, MAX_V1_ROWS } from "~/util/constants";
import { isComponentsV2, onlyActionRows } from "~/util/discord";
import type { DragManager } from "~/util/drag";
import {
  fileInputChangeHandler,
  MAX_FILES_PER_MESSAGE,
  transformFileName,
} from "~/util/files";
import { getMessageDisplayName } from "~/util/message";
import { copyText, randomString } from "~/util/text";
import { Button } from "../Button";
import { ButtonSelect } from "../ButtonSelect";
import { Checkbox } from "../Checkbox";
import { CoolIcon } from "../icons/CoolIcon";
import { InfoBox } from "../InfoBox";
import { isAudioType } from "../preview/FileAttachment";
import { linkClassName } from "../preview/Markdown";
import { AuthorType, getAuthorType } from "../preview/Message.client";
import {
  selectStyles,
  SelectValueTrigger,
  withDefaultItem,
} from "../StringSelect";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { ActionRowEditor } from "./ComponentEditor";
import { AutoTopLevelComponentEditor } from "./ContainerEditor";
import { DragArea } from "./DragArea";
import {
  DetectGifUrlFooter,
  EmbedEditor,
  EmbedEditorSection,
  getEmbedLength,
} from "./EmbedEditor";
import { PasteFileButton } from "./PasteFileButton";

const FilePreview = ({
  file,
  className,
}: {
  file: DraftFile;
  className?: string;
}) => {
  const style = twJoin("rounded-xl", className);
  if (file.file.type.startsWith("image/") && file.url) {
    return <img src={file.url} className={style} alt="" />;
  } else if (file.file.type.startsWith("video/") && file.url) {
    return (
      <video
        src={file.url}
        className={twJoin("pointer-events-none", style)}
        muted
        autoPlay={false}
        controls={false}
      />
    );
  }
  return (
    <div
      className={twJoin(
        "bg-gray-200 dark:bg-gray-800 p-4 hidden sm:flex",
        style,
      )}
    >
      <CoolIcon icon="File_Document" className="text-4xl m-auto" />
    </div>
  );
};

const FileEditModal = (
  props: ModalProps & { file?: DraftFile; onSave: (file: DraftFile) => void },
) => {
  const { t } = useTranslation();
  const { file, onSave, ...restProps } = props;

  const [draft, setDraft] = useState<DraftFile>();
  const [name, setName] = useState<string>();
  useEffect(() => {
    // File#name is read-only so we wait until we save to duplicate it
    setName(file ? file.file.name : undefined);
    setDraft(file ? { ...file } : undefined);
  }, [file]);

  return (
    <Modal {...restProps}>
      <PlainModalHeader>
        {file ? transformFileName(file.file.name) : "File"}
      </PlainModalHeader>
      {draft ? (
        <div className="flex flex-wrap-reverse md:flex-nowrap">
          <div className="space-y-2 grow">
            <div>
              <TextInput
                label={t("filename")}
                className="w-full"
                onChange={(e) => setName(e.currentTarget.value)}
                value={name ?? ""}
                required
              />
            </div>
            {draft.file.type.startsWith("image/") ? (
              <div>
                <TextArea
                  label={t("fileDescription")}
                  placeholder={t("fileDescriptionPlaceholder")}
                  className="w-full"
                  onChange={(e) => {
                    setDraft({
                      ...draft,
                      description: e.currentTarget.value,
                    });
                  }}
                  value={draft.description ?? ""}
                  short
                />
              </div>
            ) : null}
            <div>
              <Checkbox
                label={t("markSpoiler")}
                onCheckedChange={(checked) => {
                  setDraft({ ...draft, spoiler: checked });
                }}
                checked={draft.spoiler}
              />
            </div>
          </div>
          <div className="mb-2 sm:mt-0 sm:mb-0 sm:ltr:ml-4 sm:rtl:mr-4 w-full sm:max-w-[33%]">
            <FilePreview file={draft} className="max-h-32 sm:max-h-60 w-full" />
          </div>
        </div>
      ) : (
        <div />
      )}
      <ModalFooter className="flex gap-2 flex-wrap">
        <button
          className={twJoin("ltr:ml-auto rtl:mr-auto", linkClassName)}
          type="button"
          onClick={() => {
            props.setOpen(false);
          }}
        >
          {t("cancel")}
        </button>
        <Button
          onClick={() => {
            props.setOpen(false);
            if (draft && name) {
              onSave({
                ...draft,
                // should reuse the same blob in memory
                file: new File([draft.file], name, {
                  type: draft.file.type,
                }),
              });
            }
          }}
        >
          {t("save")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const MessageNameModal = (
  props: ModalProps & { name?: string; onSave: (name: string) => void },
) => {
  const { t } = useTranslation();
  const { name, onSave, ...restProps } = props;

  const [draft, setDraft] = useState(name);
  useEffect(() => {
    setDraft(name);
  }, [name]);

  return (
    <Modal {...restProps}>
      <form className="contents" onSubmit={(e) => e.preventDefault()}>
        <TextInput
          value={draft ?? ""}
          label={t("messageName")}
          onChange={({ currentTarget }) => {
            setDraft(currentTarget.value);
          }}
          maxLength={100}
          className="w-full"
        />
        <ModalFooter className="flex gap-2 flex-wrap">
          <button
            className={twJoin("ms-auto", linkClassName)}
            type="button"
            onClick={() => {
              props.setOpen(false);
            }}
          >
            {t("cancel")}
          </button>
          <Button
            type="submit"
            onClick={() => {
              props.setOpen(false);
              if (draft !== undefined) {
                onSave(draft);
              }
            }}
          >
            {t("save")}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

interface MessageEditorProps {
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
  setEditingAllowedMentions: React.Dispatch<
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
  drag?: DragManager;
  webhooks?: APIWebhook[];
  cache?: CacheManager;
  cdn?: string;
}

export const MessageEditor: React.FC<MessageEditorProps> = (props) => {
  const { t } = useTranslation();
  const message = props.data.messages[props.index];
  // const id = getQdMessageId(message);

  // Hooks
  const [editingFile, setEditingFile] = useState<DraftFile>();
  const [editingName, setEditingName] = useState(false);

  const childProps: MessageEditorChildProps = {
    ...props,
    t,
    setEditingFile,
    setEditingName,
  };

  return (
    <div className="contents">
      <FileEditModal
        open={!!editingFile}
        setOpen={() => setEditingFile(undefined)}
        file={editingFile}
        onSave={(file) => {
          props.setFiles(props.files.map((f) => (f.id === file.id ? file : f)));
          props.setData({ ...props.data });
        }}
      />
      <MessageNameModal
        name={message.name}
        onSave={(newName) => {
          message.name = newName.trim() || undefined;
          props.setData({ ...props.data });
        }}
        open={editingName}
        setOpen={setEditingName}
      />
      {isComponentsV2(message.data) ? (
        <ComponentMessageEditor {...childProps} />
      ) : (
        <StandardMessageEditor {...childProps} />
      )}
    </div>
  );
};

const getUsernameErrors = (
  t: TFunction,
  username: string | undefined,
): React.ReactNode[] => {
  if (!username) return [];

  const errors: React.ReactNode[] = [];
  const lower = username.toLowerCase();
  for (const forbidden of ["discord", "clyde", "```", "system message"]) {
    if (lower.includes(forbidden)) {
      errors.push(
        t("usernameForbiddenSubstring", { replace: { substring: forbidden } }),
      );
    }
  }
  for (const forbidden of ["everyone", "here"]) {
    if (lower === forbidden) {
      errors.push(
        t("usernameForbiddenString", { replace: { substring: forbidden } }),
      );
    }
  }

  return errors;
};

type MessageEditorChildProps = MessageEditorProps & {
  t: TFunction;
  setEditingFile: React.Dispatch<React.SetStateAction<DraftFile | undefined>>;
  setEditingName: React.Dispatch<React.SetStateAction<boolean>>;
};

const StandardMessageEditor: React.FC<MessageEditorChildProps> = ({
  index: i,
  data,
  files,
  discordApplicationId,
  setData,
  setFiles,
  setSettingMessageIndex,
  setEditingMessageFlags,
  setEditingAllowedMentions,
  setEditingComponent,
  setJsonEditor,
  setCodeGenerator,
  webhooks,
  cache,
  cdn,
  // Parent
  t,
  setEditingFile,
  setEditingName,
}) => {
  const message = data.messages[i];
  const id = getQdMessageId(message);
  const embedsLength =
    message.data.embeds && message.data.embeds.length > 0
      ? message.data.embeds.map(getEmbedLength).reduce((a, b) => a + b)
      : 0;
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
    channels.filter((c) => ["forum", "media"].includes(c.type)).length ===
      webhooks.length;
  const isNoneForum =
    // There are webhooks
    !!webhooks &&
    webhooks.length !== 0 &&
    // All of their channels are resolved
    channels.length === webhooks?.length &&
    // None of them are forums
    channels.filter((c) => ["forum", "media"].includes(c.type)).length === 0;

  const imageFiles = useMemo(
    () => files.filter((f) => f.file.type.startsWith("image/")),
    [files],
  );
  const thumbnailFileId = imageFiles.find((f) => f.is_thumbnail)?.id ?? null;

  return (
    <details
      className="group/message my-2 pt-2 pb-2 bg-[#EFEFF0] dark:bg-[#292b2f] border-y border-gray-400 dark:border-[#1E1F22]"
      open
    >
      <summary className="group-open/message:mb-2 transition-[margin] marker:content-none marker-none flex font-semibold text-base cursor-default select-none mx-4">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/message:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="truncate">
          {flags.has(MessageFlags.SuppressNotifications) && (
            <CoolIcon
              icon="Bell_Off"
              title={t("messageFlag.4096")}
              className="me-1"
            />
          )}
          {flags.has(MessageFlags.SuppressEmbeds) && (
            <CoolIcon
              icon="Window_Close"
              title={t("messageFlag.4")}
              className="me-1"
            />
          )}
          {message.data.allowed_mentions ? (
            <CoolIcon
              icon="Bell_Remove"
              title={t("allowedMentionsEnabled")}
              className="me-1"
            />
          ) : null}
          {getMessageDisplayName(t, i, message)}
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
          <button type="button" onClick={() => setEditingName(true)}>
            <CoolIcon icon="Edit_Pencil_01" />
          </button>
          <button
            type="button"
            className={data.messages.length >= 10 ? "hidden" : ""}
            onClick={() => {
              const cloned = structuredClone(message);
              cloned._id = randomString(10);
              data.messages.splice(i + 1, 0, cloned);
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
      <div className="py-2 px-4 mt-1 space-y-2">
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
        <div className="-space-y-2 -mx-2">
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
                    key="0"
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
                    items={withDefaultItem(
                      t,
                      imageFiles.map((file) => ({
                        label: transformFileName(file.file.name),
                        value: file.id,
                      })),
                    )}
                    value={thumbnailFileId}
                    onValueChange={(id) => {
                      for (const file of files) {
                        file.is_thumbnail = file.id === id && !file.embed;
                      }
                      setFiles([...files]);
                    }}
                  >
                    <Select.Trigger className={selectStyles.label}>
                      {t("postThumbnail")}
                    </Select.Trigger>
                    <Select.Trigger className={selectStyles.trigger}>
                      <Select.Value className={selectStyles.value} />
                      <Select.Icon className={selectStyles.icon}>
                        <CoolIcon icon="Chevron_Down" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner
                        className={selectStyles.positioner}
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
                                className={selectStyles.item}
                              >
                                <Select.ItemText
                                  className={selectStyles.itemText}
                                >
                                  {transformFileName(file.file.name)}
                                </Select.ItemText>
                                <Select.ItemIndicator
                                  className={selectStyles.itemIndicator}
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
              value={message.data.username ?? ""}
              errors={getUsernameErrors(t, message.data.username)}
              onChange={(e) => {
                message.data.username = e.currentTarget.value || undefined;
                setData({ ...data });
              }}
            />
            <div>
              <TextInput
                label={t("avatarUrl")}
                type="url"
                className="w-full"
                disabled={!!message.reference}
                value={message.data.avatar_url ?? ""}
                onChange={(e) => {
                  message.data.avatar_url = e.currentTarget.value || undefined;
                  setData({ ...data });
                }}
              />
              <DetectGifUrlFooter
                t={t}
                cdn={cdn}
                value={message.data.avatar_url}
                onChange={(value) => {
                  message.data.avatar_url = value;
                  setData({ ...data });
                }}
              />
            </div>
          </EmbedEditorSection>
          <EmbedEditorSection
            name={t("filesCount", {
              replace: { count: files.length },
            })}
          >
            {files.map((draftFile) => {
              const { id, file, embed, is_thumbnail, url } = draftFile;
              return (
                <div
                  key={`file-${id}`}
                  className="rounded-lg border py-1.5 px-[14px] bg-background-secondary border-border-normal dark:border-border-normal-dark dark:bg-background-secondary-dark flex"
                >
                  <CoolIcon
                    icon={
                      embed
                        ? "Window"
                        : is_thumbnail
                          ? "Chat"
                          : flags.has(MessageFlags.IsVoiceMessage) &&
                              isAudioType(file.type)
                            ? "Phone"
                            : "File_Blank"
                    }
                    className="text-xl my-auto me-2"
                  />
                  <div className="my-auto truncate me-2">
                    <p className="font-medium truncate">
                      {transformFileName(file.name)}
                    </p>
                    {/* <p className="text-sm">{file.size} bytes</p> */}
                  </div>
                  <button
                    type="button"
                    className="ms-auto my-auto hover:text-blurple text-xl"
                    onClick={() => setEditingFile(draftFile)}
                  >
                    <CoolIcon icon="Edit_Pencil_01" />
                  </button>
                  <button
                    type="button"
                    className="ms-1 my-auto hover:text-red-400 text-xl"
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
              );
            })}
            <input
              id={`files-${id}`}
              type="file"
              hidden
              multiple
              onChange={fileInputChangeHandler(files, setFiles)}
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
                disabled={files.length >= MAX_FILES_PER_MESSAGE}
              >
                {t("addFile")}
              </Button>
              <PasteFileButton
                t={t}
                disabled={files.length >= MAX_FILES_PER_MESSAGE}
                onChange={async (list) => {
                  const newFiles = [...files];
                  for (const file of Array.from(list).slice(
                    0,
                    MAX_FILES_PER_MESSAGE - newFiles.length,
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
                cdn={cdn}
              />
            ))}
          </div>
        )}
        {message.data.components && message.data.components.length > 0 && (
          <>
            {!possiblyActionable &&
            // No actionable webhooks and there are not only link buttons in
            // the message, so the user will have issues sending the message
            onlyActionRows(message.data.components)
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
              {onlyActionRows(message.data.components).map((row, ri) => (
                <div key={`edit-message-${id}-row-${ri}`}>
                  <ActionRowEditor
                    message={message}
                    component={row}
                    parent={undefined}
                    index={ri}
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
                  label: t("addEmbed"),
                  icon: "Add_Plus_Square",
                  value: "embed",
                  disabled:
                    !!message.data.embeds && message.data.embeds.length >= 10,
                },
                {
                  label: t(
                    message.data.components &&
                      message.data.components.length >= 1
                      ? "addRow"
                      : "addComponents",
                  ),
                  icon: "Add_Row",
                  value: "row",
                  disabled:
                    !!message.data.components &&
                    message.data.components.length >= MAX_V1_ROWS,
                },
                // {
                //   label: t("addPoll"),
                //   value: "poll",
                //   disabled: !!message.data.poll,
                // },
              ]}
              onValueChange={(value) => {
                switch (value) {
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
            <ButtonSelect<
              | "flags"
              | "allowedMentions"
              | "jsonEditor"
              | "codeGenerator"
              | "copyQueryData"
            >
              discordstyle={ButtonStyle.Secondary}
              options={[
                {
                  label: t("flags"),
                  icon: "Flag",
                  value: "flags",
                },
                {
                  label: t("allowedMentions"),
                  icon: "Mention",
                  value: "allowedMentions",
                },
                {
                  label: t("jsonEditor"),
                  icon: "Terminal",
                  value: "jsonEditor",
                },
                {
                  label: t("codeGenerator"),
                  icon: "Code",
                  value: "codeGenerator",
                },
                {
                  label: t("copyQueryData"),
                  icon: "Copy",
                  value: "copyQueryData",
                },
              ]}
              onValueChange={(value) => {
                switch (value) {
                  case "flags": {
                    setEditingMessageFlags(i);
                    break;
                  }
                  case "allowedMentions": {
                    setEditingAllowedMentions(i);
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

// Blank message with cv2 flag: http://localhost:8788/?data=eyJ2ZXJzaW9uIjoiZDIiLCJtZXNzYWdlcyI6W3siX2lkIjoiOWZNd0QxYzVLZCIsImRhdGEiOnsiY29tcG9uZW50cyI6W10sImZsYWdzIjozMjc2OH19XX0
/** Components V2-based editor */
const ComponentMessageEditor: React.FC<MessageEditorChildProps> = ({
  index: i,
  data,
  files,
  // discordApplicationId,
  setData,
  setFiles,
  setSettingMessageIndex,
  setEditingMessageFlags,
  setEditingAllowedMentions,
  setEditingComponent,
  setJsonEditor,
  setCodeGenerator,
  webhooks,
  cache,
  cdn,
  drag,
  // Parent
  t,
  setEditingFile,
  setEditingName,
}) => {
  const message = data.messages[i];
  const mid = getQdMessageId(message);
  const components = message.data.components ?? [];

  const allComponentsCount =
    components.length > 0
      ? components
          // Add one because top-level also included in count
          //              Section, Container, ActionRow
          .map((c) => 1 + ("components" in c ? c.components.length : 0))
          .reduce((a, b) => a + b, 0)
      : 0;

  const flags = new MessageFlagsBitField(message.data.flags ?? 0);

  // const authorTypes = webhooks
  //   ? webhooks.map((w) => getAuthorType(discordApplicationId, w))
  //   : [];
  // const possiblyActionable = authorTypes.includes(AuthorType.ActionableWebhook);
  // const possiblyApplication = authorTypes.includes(
  //   AuthorType.ApplicationWebhook,
  // );
  const channels =
    webhooks && cache
      ? webhooks
          .map((w) => cache.channel.get(w.channel_id))
          .filter((c): c is ResolvableAPIChannel => !!c)
      : [];

  const isAllForum =
    !!webhooks &&
    webhooks.length !== 0 &&
    channels.filter((c) => ["forum", "media"].includes(c.type)).length ===
      webhooks.length;
  const isNoneForum =
    // There are webhooks
    !!webhooks &&
    webhooks.length !== 0 &&
    // All of their channels are resolved
    channels.length === webhooks?.length &&
    // None of them are forums
    channels.filter((c) => ["forum", "media"].includes(c.type)).length === 0;

  const imageFiles = useMemo(
    () => files.filter((f) => f.file.type.startsWith("image/")),
    [files],
  );
  const thumbnailFileId = imageFiles.find((f) => f.is_thumbnail)?.id ?? null;

  return (
    <details
      className="group/message my-2 pt-2 pb-2 bg-[#EFEFF0] dark:bg-[#292b2f] border-y border-gray-400 dark:border-[#1E1F22]"
      open
    >
      <summary className="group-open/message:mb-2 transition-[margin] marker:content-none marker-none flex font-semibold text-base cursor-default select-none mx-4">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/message:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="truncate">
          {flags.has(MessageFlags.SuppressNotifications) && (
            <CoolIcon
              icon="Bell_Off"
              title={t("messageFlag.4096")}
              className="me-1"
            />
          )}
          {/*
            Might seem silly to include this for the CV2 editor but I imagine
            eventually links will unfurl and so this will be relevant.
          */}
          {flags.has(MessageFlags.SuppressEmbeds) && (
            <CoolIcon
              icon="Window_Close"
              title={t("messageFlag.4")}
              className="me-1"
            />
          )}
          {message.data.allowed_mentions ? (
            <CoolIcon
              icon="Bell_Remove"
              title={t("allowedMentionsEnabled")}
              className="me-1"
            />
          ) : null}
          {getMessageDisplayName(t, i, message)}
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
          <button type="button" onClick={() => setEditingName(true)}>
            <CoolIcon icon="Edit_Pencil_01" />
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
      <div className="px-4 space-y-2">
        <div className="-space-y-2 -mx-2">
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
                    key="0"
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
                    items={withDefaultItem(
                      t,
                      imageFiles.map((file) => ({
                        label: transformFileName(file.file.name),
                        value: file.id,
                      })),
                    )}
                    value={thumbnailFileId}
                    onValueChange={(id) => {
                      for (const file of files) {
                        file.is_thumbnail = file.id === id && !file.embed;
                      }
                      setFiles([...files]);
                    }}
                  >
                    <Select.Trigger className={selectStyles.label}>
                      {t("postThumbnail")}
                    </Select.Trigger>
                    <SelectValueTrigger />
                    <Select.Portal>
                      <Select.Positioner
                        className={selectStyles.positioner}
                        align="start"
                        alignOffset={2}
                      >
                        <Select.ScrollUpArrow />
                        <Select.Popup>
                          <Select.Arrow />
                          {imageFiles.map((file) => (
                            <Select.Item
                              key={`thumbnail-select-${file.id}`}
                              value={file.id}
                              className={selectStyles.item}
                            >
                              <Select.ItemText
                                className={selectStyles.itemText}
                              >
                                {transformFileName(file.file.name)}
                              </Select.ItemText>
                              <Select.ItemIndicator
                                className={selectStyles.itemIndicator}
                              >
                                <CoolIcon icon="Check" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Popup>
                        <Select.ScrollDownArrow />
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <button
                  type="button"
                  className="ms-2 mt-auto mb-1 text-xl"
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
              value={message.data.username ?? ""}
              errors={getUsernameErrors(t, message.data.username)}
              onChange={(e) => {
                message.data.username = e.currentTarget.value || undefined;
                setData({ ...data });
              }}
            />
            <div>
              <TextInput
                label={t("avatarUrl")}
                type="url"
                className="w-full"
                disabled={!!message.reference}
                value={message.data.avatar_url ?? ""}
                onChange={(e) => {
                  message.data.avatar_url = e.currentTarget.value || undefined;
                  setData({ ...data });
                }}
              />
              <DetectGifUrlFooter
                t={t}
                cdn={cdn}
                value={message.data.avatar_url}
                onChange={(value) => {
                  message.data.avatar_url = value;
                  setData({ ...data });
                }}
              />
            </div>
          </EmbedEditorSection>
          <EmbedEditorSection
            name={t("filesCount", {
              replace: { count: files.length },
            })}
          >
            {files.length === 0 ? (
              <p className="text-muted dark:text-muted-dark text-sm italic">
                {t("filesComponentsOnly")}
              </p>
            ) : (
              files.map((draftFile) => {
                const { id, file, embed, is_thumbnail, url } = draftFile;
                return (
                  <div
                    key={`file-${id}`}
                    className="rounded-lg border py-1.5 px-[14px] bg-background-secondary border-border-normal dark:border-border-normal-dark dark:bg-background-secondary-dark flex"
                  >
                    <CoolIcon
                      icon={
                        embed ? "Window" : is_thumbnail ? "Chat" : "File_Blank"
                      }
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
                      className="ltr:ml-auto rtl:mr-auto my-auto hover:text-blurple text-xl"
                      onClick={() => setEditingFile(draftFile)}
                    >
                      <CoolIcon icon="Edit_Pencil_01" />
                    </button>
                    <button
                      type="button"
                      className="ltr:ml-1 rtl:mr-1 my-auto hover:text-red-400 text-xl"
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
                );
              })
            )}
          </EmbedEditorSection>
        </div>
        <div className="space-y-1">
          {components.map((component, i) => {
            const key = `${mid}-top-${i}`;
            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: we can't nest all this in a button
              <div
                key={`top-level-component-${i}`}
                className="relative"
                onDragOver={() => drag?.setFocusKey(key)}
                onDragExit={() => drag?.setFocusKey(undefined)}
              >
                <AutoTopLevelComponentEditor
                  message={message}
                  index={i}
                  data={data}
                  setData={setData}
                  cache={cache}
                  cdn={cdn}
                  component={component}
                  parent={undefined}
                  files={files}
                  setFiles={setFiles}
                  setEditingComponent={setEditingComponent}
                  drag={drag}
                  open
                />
                <DragArea
                  visible={drag?.isFocused(key) ?? false}
                  position={
                    !drag?.data || drag.data.parentType
                      ? "bottom"
                      : i < drag.data.index
                        ? "top"
                        : "bottom"
                  }
                  onDrop={() => {
                    drag?.end();
                    drag?.onDrop?.(mid, { path: [i] });
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <div>
            <ButtonSelect
              disabled={allComponentsCount >= MAX_TOTAL_COMPONENTS}
              options={[
                {
                  label: t("content"),
                  icon: "Text",
                  value: ComponentType.TextDisplay,
                },
                {
                  label: t("component.17"),
                  icon: "Add_Plus_Square",
                  value: ComponentType.Container,
                },
                {
                  label: t("component.12"),
                  icon: "Image_01",
                  value: ComponentType.MediaGallery,
                },
                {
                  // Any single file
                  label: t("file"),
                  icon: "File_Blank",
                  value: ComponentType.File,
                },
                {
                  label: t("component.14"),
                  icon: "Line_L",
                  value: ComponentType.Separator,
                },
                {
                  label: t("component.1"),
                  icon: "Rows",
                  value: ComponentType.ActionRow,
                },
              ]}
              onValueChange={(value) => {
                switch (value) {
                  case ComponentType.TextDisplay: {
                    message.data.components = [
                      ...components,
                      { type: ComponentType.TextDisplay, content: "" },
                    ];
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.Container: {
                    message.data.components = [
                      ...components,
                      { type: ComponentType.Container, components: [] },
                    ];
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.File: {
                    message.data.components = [
                      ...components,
                      { type: ComponentType.File, file: { url: "" } },
                    ];
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.MediaGallery: {
                    message.data.components = [
                      ...components,
                      { type: ComponentType.MediaGallery, items: [] },
                    ];
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.Separator: {
                    message.data.components = [
                      ...components,
                      { type: ComponentType.Separator },
                    ];
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.ActionRow: {
                    message.data.components = [
                      ...components,
                      { type: ComponentType.ActionRow, components: [] },
                    ];
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
            <ButtonSelect<
              | "flags"
              | "allowedMentions"
              | "jsonEditor"
              | "codeGenerator"
              | "copyQueryData"
            >
              discordstyle={ButtonStyle.Secondary}
              options={[
                {
                  label: t("flags"),
                  icon: "Flag",
                  value: "flags",
                },
                {
                  label: t("allowedMentions"),
                  icon: "Mention",
                  value: "allowedMentions",
                },
                {
                  label: t("jsonEditor"),
                  icon: "Terminal",
                  value: "jsonEditor",
                },
                {
                  label: t("codeGenerator"),
                  icon: "Code",
                  value: "codeGenerator",
                },
                {
                  label: t("copyQueryData"),
                  icon: "Copy",
                  value: "copyQueryData",
                },
              ]}
              onValueChange={(value) => {
                switch (value) {
                  case "flags": {
                    setEditingMessageFlags(i);
                    break;
                  }
                  case "allowedMentions": {
                    setEditingAllowedMentions(i);
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
