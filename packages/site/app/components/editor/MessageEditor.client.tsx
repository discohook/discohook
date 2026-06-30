import { Progress } from "@base-ui/react";
import { Collapsible } from "@base-ui/react/collapsible";
import { Select } from "@base-ui/react/select";
import { Link } from "@remix-run/react";
import {
  type APITextDisplayComponent,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { apiUrl, BRoutes } from "~/api/routing";
import type { ComponentFoundBackupHook } from "~/api/v1/components.$id.backups";
import type {
  ApiGetFilehostUpload,
  ApiPostFilehostUpload,
} from "~/api/v1/filehosts.$id.upload";
import type { CodeGeneratorProps } from "~/modals/CodeGeneratorModal";
import type { EditingComponentData } from "~/modals/ComponentEditModal";
import type { JsonEditorProps } from "~/modals/JsonEditorModal";
import type { Target } from "~/modals/MessageSendModal";
import {
  Modal,
  ModalFooter,
  type ModalProps,
  PlainModalHeader,
} from "~/modals/Modal";
import type { SetDraftFile } from "~/modals/UploadFileModal";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import type { TFunction } from "~/types/i18next";
import { type QueryData, ZodQueryDataMessage } from "~/types/QueryData";
import { type APIAttachment, TargetType } from "~/types/QueryData-raw";
import type {
  CacheManager,
  ResolvableAPIChannel,
} from "~/util/cache/CacheManager";
import {
  MAX_TOTAL_COMPONENTS,
  MAX_TOTAL_COMPONENTS_CHARACTERS,
  MAX_V1_ROWS,
} from "~/util/constants";
import {
  cascadeFileNameChangeComponents,
  cascadeFileNameChangeEmbeds,
  extractComponentsByType,
  isComponentsV2,
  onlyActionRows,
} from "~/util/discord";
import type { DragManager } from "~/util/drag";
import type { FilehostUploadResponse } from "~/util/filehosts";
import { uploadFile as imgbbUpload } from "~/util/filehosts/imgbb";
import { uploadFile as postimagesUpload } from "~/util/filehosts/postimages";
import { uploadFile as sxcuUpload } from "~/util/filehosts/sxcu";
import {
  attachmentFromFile,
  fileInputChangeHandler,
  MAX_FILES_PER_MESSAGE,
  transformFileName,
} from "~/util/files";
import { useSafeFetcher } from "~/util/loader";
import { experimentEnabled, useLocalStorage } from "~/util/localstorage";
import { getMessageDisplayName } from "~/util/message";
import { copyText, fileSize, randomString } from "~/util/text";
import { Button } from "../Button";
import { ButtonSelect } from "../ButtonSelect";
import { Checkbox } from "../Checkbox";
import { collapsibleStyles } from "../collapsible";
import { useError } from "../Error";
import { CoolIcon } from "../icons/CoolIcon";
import { InfoBox } from "../InfoBox";
import { isAudioType } from "../preview/FileAttachment";
import { linkClassName } from "../preview/Markdown";
import { AuthorType, getAuthorType } from "../preview/Message.client";
import { selectStyles, withDefaultItem } from "../StringSelect";
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
  file: DraftFile | APIAttachment;
  className?: string;
}) => {
  const style = twJoin("rounded-xl", className);
  const type = "file" in file ? file.file.type : file.content_type;
  if (type?.startsWith("image/") && file.url) {
    return <img src={file.url} className={style} alt="" />;
  } else if (type?.startsWith("video/") && file.url) {
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

const AttachmentEditModal = (
  props: ModalProps & {
    attachment?: APIAttachment;
    onSave: (attachment: APIAttachment, oldAttachment?: APIAttachment) => void;
    files: DraftFile[];
    setFiles: SetDraftFile;
    message: QueryData["messages"][number];
    refreshData: () => void;
  },
) => {
  const { t } = useTranslation();
  const [error, onError] = useError(t);

  const {
    attachment,
    onSave,
    files,
    setFiles,
    message,
    refreshData,
    ...restProps
  } = props;
  const file = attachment
    ? files.find((f) => f.id === attachment.id)
    : undefined;

  const [draft, setDraft] = useState<APIAttachment>();
  useEffect(() => {
    // Buffer so the user can cancel (and also so we don't fire a state change
    // for each char typed)
    setDraft(attachment ? { ...attachment } : undefined);
  }, [attachment]);

  const [settings, updateSettings] = useLocalStorage();
  const SAVE_ATTACHMENTS = experimentEnabled("SAVE_ATTACHMENTS", settings);
  const filehosts = settings.filehosts ?? {};

  type ServiceId = "imgbb" | "catbox" | "sxcu" | "postimages";
  const hostOptions = useMemo(() => {
    const arr: {
      label: React.ReactNode;
      value: ServiceId;
    }[] = [
      {
        label: "ImgBB",
        value: "imgbb",
      },
      { label: filehosts.sxcu?.domain ?? "sxcu.net", value: "sxcu" },
      { label: "Postimages", value: "postimages" },
    ];
    if (filehosts.catbox?.cookie) {
      arr.push({ label: "Catbox", value: "catbox" });
    }
    return arr.sort(
      (a, b) =>
        (filehosts[a.value]?.position ?? -1) -
        (filehosts[b.value]?.position ?? -1),
    );
  }, [filehosts]);
  const uploader = useSafeFetcher<ApiGetFilehostUpload | ApiPostFilehostUpload>(
    { onError },
  );
  const [progress, setProgress] = useState(-1);
  const loading = uploader.state !== "idle" || (progress > -1 && progress < 1);

  const doUpload = async (serviceId: ServiceId, attachment: APIAttachment) => {
    let target: Blob | string;
    if (attachment.url.startsWith("http")) {
      target = attachment.url;
    } else {
      if (!file) {
        onError({ message: "The attachment has no file data" });
        return;
      }
      target = file.file;
    }

    const afterUpload = (uploaded: FilehostUploadResponse) => {
      setTimeout(() => setProgress(-1), 3000);
      console.log(uploaded.delete_url);

      if (file) {
        setFiles(files.filter((f) => f !== file));
      }
      if (attachment.placement_count) {
        message.data.attachments = message.data.attachments?.filter(
          (a) => a.id !== attachment.id,
        );
        const renameConfig = [
          {
            oldName: attachment.filename,
            newName: "",
            newUri: uploaded.url,
          },
        ];
        if (message.data.embeds) {
          message.data.embeds = cascadeFileNameChangeEmbeds(
            renameConfig,
            message.data.embeds,
          );
        }
        if (message.data.components) {
          message.data.components = cascadeFileNameChangeComponents(
            renameConfig,
            message.data.components,
          );
        }
        refreshData();
      } else {
        onSave(
          {
            ...attachment,
            url: uploaded.url,
            proxy_url: uploaded.url,
            content_type: attachment.content_type ?? uploaded.mime,
          },
          attachment,
        );
      }
      restProps.setOpen(false);
    };

    switch (serviceId) {
      case "imgbb": {
        setProgress(0);
        // Upload to server as proxy for API
        if (filehosts.imgbb?.cookie) {
          const form = new FormData();
          form.set("name", attachment.filename);
          if (typeof target === "string") {
            form.set("type", "url");
            form.set("url", target);
          } else {
            form.set("type", "file");
            form.set("file", target);
          }

          const uploaded = (await uploader.submitAsync(form, {
            method: "POST",
            action: apiUrl(BRoutes.filehostsUpload(serviceId)),
          })) as ApiPostFilehostUpload;
          afterUpload(uploaded);
          break;
        }
        // Configure local storage with access token so we can use
        // the cross-origin endpoint
        if (!filehosts.imgbb?.access_token) {
          const data = (await uploader.loadAsync(
            apiUrl(BRoutes.filehostsUpload(serviceId)),
          )) as ApiGetFilehostUpload;
          filehosts.imgbb = {
            cookie: false,
            ...filehosts.imgbb,
            access_token: data.token,
          };
          updateSettings({ ...settings });
        }
        let uploaded: FilehostUploadResponse;
        try {
          uploaded = await imgbbUpload(target, {
            auth_token: filehosts.imgbb.access_token,
            filename: attachment.filename,
            description: attachment.description,
            onUploadProgress: setProgress,
            // Upload progress only makes sense when we're uploading from the filesystem.
            // When we're passing a URL, peg progress to 99% so that the buttons stay visually
            // loading while the service actually downloads and processes the image.
            onUploadEnd() {
              if (typeof target === "string") setProgress(0.99);
            },
          });
        } catch (e) {
          onError({
            message: e instanceof Error ? e.message : String(e),
          });
          setProgress(-1);
          return;
        }
        afterUpload(uploaded);
        break;
      }
      case "sxcu": {
        let uploaded: FilehostUploadResponse;
        setProgress(0);
        try {
          if (typeof target === "string") {
            // Originally I tried to fetch the URL on the client to
            // reupload it, but sxcu does not return proper CORS headers
            // for assets to allow this.
            onError({
              message: "Service does not support reuploading (URL uploads)",
            });
            return;
          }
          const blob = target;
          uploaded = await sxcuUpload(blob, {
            domain: filehosts.sxcu?.domain,
            token: filehosts.sxcu?.token,
            onUploadProgress: setProgress,
          });
        } catch (e) {
          onError({
            message: e instanceof Error ? e.message : String(e),
          });
          setProgress(-1);
          return;
        }
        afterUpload(uploaded);
        break;
      }
      case "postimages": {
        setProgress(0);
        let uploaded: FilehostUploadResponse;
        try {
          uploaded = await postimagesUpload(target, {
            filename: attachment.filename,
            onUploadProgress: setProgress,
            onUploadEnd() {
              if (typeof target === "string") setProgress(0.99);
            },
          });
        } catch (e) {
          onError({
            message: e instanceof Error ? e.message : String(e),
          });
          setProgress(-1);
          return;
        }
        afterUpload(uploaded);
        break;
      }
      default:
        break;
    }
  };

  return (
    <Modal {...restProps}>
      <PlainModalHeader>
        {attachment ? transformFileName(attachment.filename) : "File"}
      </PlainModalHeader>
      {error}
      {draft ? (
        <div className="flex flex-wrap-reverse md:flex-nowrap">
          <div className="space-y-2 grow">
            <div>
              <TextInput
                label={t("filename")}
                className="w-full"
                onChange={(e) => {
                  setDraft({ ...draft, filename: e.currentTarget.value });
                }}
                value={draft.filename ?? ""}
                required
              />
            </div>
            {attachment?.content_type?.startsWith("image/") ? (
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
                checked={!!draft.spoiler}
              />
            </div>
          </div>
          <div className="mb-2 sm:mt-0 sm:mb-0 sm:ms-4 w-full sm:max-w-[33%] relative">
            <FilePreview
              file={draft}
              className="max-h-32 sm:max-h-60 w-max mx-auto object-contain"
            />
            {/* couldn't get this looking how i wanted */}
            {/* {draft.url && !draft.url.startsWith("blob:") ? (
              <button
                type="button"
                className={twJoin(
                  "absolute top-0 end-0",
                  "size-8",
                  "dark:bg-gray-800 border border-border-normal dark:border-border-normal-dark rounded-lg",
                )}
                onClick={(e) => {
                  copyText(draft.url);
                  const icon = e.currentTarget.querySelector("i");
                  if (icon) {
                    icon.classList.add("ci-Check");
                    icon.classList.remove("ci-Copy");
                    setTimeout(() => {
                      icon.classList.add("ci-Copy");
                      icon.classList.remove("ci-Check");
                    }, 1500);
                  }
                }}
              >
                <CoolIcon icon="Copy" className="text-lg" />
              </button>
            ) : null} */}
          </div>
        </div>
      ) : (
        <div />
      )}
      <ModalFooter className="flex flex-wrap gap-x-6 gap-y-2 items-end">
        {SAVE_ATTACHMENTS ? (
          <div className="flex gap-4 items-center grow">
            {attachment && settings.filehosts ? (
              <div>
                <p>Upload to a filehost</p>
                <div className="flex flex-row gap-1.5">
                  {Object.entries(settings.filehosts).map(([serviceId]) => (
                    <button
                      type="button"
                      key={`upload-${serviceId}`}
                      // onClick={() => setUploaderOpen(serviceId)}
                    >
                      <img
                        src={`/logos/${serviceId}.png`}
                        alt=""
                        className={twJoin(
                          "size-8 object-contain rounded-md",
                          "border border-border-normal/50 dark:border-border-normal-dark/50",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {progress === -1 ? null : (
              <Progress.Root
                className="grow grid max-w-full min-w-12 grid-cols-2 gap-y-2"
                value={progress * 100}
              >
                <Progress.Track
                  className={twJoin(
                    "col-span-2 h-2 overflow-hidden rounded-full",
                    "bg-gray-200 dark:bg-gray-900",
                    "border border-border-normal dark:border-transparent",
                  )}
                >
                  <Progress.Indicator className="bg-blurple dark:bg-blurple-400 transition-[width] duration-300" />
                </Progress.Track>
              </Progress.Root>
            )}
          </div>
        ) : null}
        <div className="flex gap-4 ms-auto">
          <button
            className={linkClassName}
            disabled={loading}
            type="button"
            onClick={() => props.setOpen(false)}
          >
            {t("cancel")}
          </button>
          <Button
            disabled={loading}
            onClick={() => {
              props.setOpen(false);
              if (draft) {
                onSave(draft, attachment);
                if (file) {
                  const newFile = {
                    ...file,
                    // should reuse the same blob in memory
                    file: new File([file.file], draft.filename, {
                      type: file.file.type,
                    }),
                  };
                  setFiles(
                    files.map((f) => (f.id === newFile.id ? newFile : f)),
                  );
                }
              }
            }}
          >
            {t("save")}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

const AttachmentUploadedModal = (
  props: ModalProps & { uploaded: FilehostUploadResponse | null },
) => {
  const { t } = useTranslation();
  const { uploaded, ...restProps } = props;

  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);

  return (
    <Modal {...restProps}>
      <PlainModalHeader>File Uploaded</PlainModalHeader>
      {uploaded ? (
        <p>
          Your message has been updated to use the direct URL to the file rather
          than a reference to the attachment.
        </p>
      ) : null}
      <div className="flex mt-2">
        <Button className="mx-auto" onClick={() => restProps.setOpen(false)}>
          {t("ok")}
        </Button>
      </div>
    </Modal>
  );
};

const MessageNameModal = (
  props: ModalProps & { name?: string; onSave: (name: string) => void },
) => {
  const { t } = useTranslation();
  const { name, onSave, ...restProps } = props;

  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);

  return (
    <Modal {...restProps}>
      <form className="contents" onSubmit={(e) => e.preventDefault()}>
        <TextInput
          value={draft ?? ""}
          label={t("messageName")}
          onChange={({ currentTarget }) => {
            setDraft(currentTarget.value);
          }}
          maxLength={50}
          className="w-full"
        />
        <ModalFooter className="flex gap-2 flex-wrap mt-0">
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
  componentFoundBackupsHook: ComponentFoundBackupHook;
  drag?: DragManager;
  targets?: Target[];
  cache?: CacheManager;
  cdn?: string;
}

export const MessageEditor: React.FC<MessageEditorProps> = (props) => {
  const { t } = useTranslation();
  const message = props.data.messages[props.index];

  // Hooks
  const [editingAttachment, setEditingAttachment] = useState<APIAttachment>();
  const [editingName, setEditingName] = useState(false);

  const childProps: MessageEditorChildProps = {
    ...props,
    t,
    setEditingAttachment,
    setEditingName,
  };

  return (
    <div className="contents">
      <AttachmentEditModal
        open={!!editingAttachment}
        setOpen={() => setEditingAttachment(undefined)}
        attachment={editingAttachment}
        files={props.files}
        setFiles={props.setFiles}
        onSave={(attachment, oldAttachment) => {
          message.data.attachments = message.data.attachments?.map((a) =>
            a.id === attachment.id ? attachment : a,
          );
          // If the attachment was renamed, propagate to references
          if (oldAttachment && oldAttachment.filename !== attachment.filename) {
            const renameConfig = [
              { oldName: oldAttachment.filename, newName: attachment.filename },
            ];
            if (message.data.embeds) {
              message.data.embeds = cascadeFileNameChangeEmbeds(
                renameConfig,
                message.data.embeds,
              );
            }
            if (message.data.components) {
              message.data.components = cascadeFileNameChangeComponents(
                renameConfig,
                message.data.components,
              );
            }
          }

          props.setData({ ...props.data });
        }}
        message={message}
        refreshData={() => props.setData({ ...props.data })}
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
  setEditingAttachment: React.Dispatch<
    React.SetStateAction<APIAttachment | undefined>
  >;
  setEditingName: React.Dispatch<React.SetStateAction<boolean>>;
};

const MessageEditorCollapsibleTrigger = ({
  t,
  index: i,
  message,
  data,
  setData,
  setEditingName,
  hasError,
}: {
  t: TFunction;
  message: MessageEditorChildProps["data"]["messages"][number];
  hasError?: boolean;
} & Pick<
  MessageEditorChildProps,
  "data" | "setData" | "setEditingName" | "index"
>) => {
  const flags = new MessageFlagsBitField(message.data.flags ?? 0);
  return (
    <div className="font-semibold text-base cursor-default select-none mx-4 flex items-center">
      <Collapsible.Trigger
        className={twMerge(
          collapsibleStyles.trigger,
          "gap-inherit cursor-default truncate",
        )}
      >
        <CoolIcon
          icon="Chevron_Right"
          className="group-data-[panel-open]/trigger:rotate-90 me-2 my-auto transition-transform"
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
          {hasError ? (
            <CoolIcon
              icon="Circle_Warning"
              className="me-1 text-rose-600 dark:text-rose-400"
            />
          ) : null}
          {getMessageDisplayName(t, i, message)}
        </span>
      </Collapsible.Trigger>
      <div className="ms-auto space-x-2 rtl:space-x-reverse my-auto shrink-0">
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
    </div>
  );
};

const getDuplicateCount = (attachments: APIAttachment[]) => {
  const filenames = new Set<string>();
  let duplicateCount = 0;
  for (const attachment of attachments) {
    if (filenames.has(attachment.filename)) {
      duplicateCount += 1;
    }
    filenames.add(attachment.filename);
  }
  return duplicateCount;
};

const MessageAttachmentsSection = ({
  t,
  files,
  setFiles,
  mid,
  message,
  data,
  setData,
  setEditingAttachment,
  allowNewFiles,
  noFilesMessage,
}: Pick<
  MessageEditorChildProps,
  "t" | "files" | "setFiles" | "data" | "setData" | "setEditingAttachment"
> & {
  mid: string;
  message: QueryData["messages"][number];
  allowNewFiles?: boolean;
  noFilesMessage?: string;
}) => {
  const flags = new MessageFlagsBitField(BigInt(message.data.flags ?? "0"));
  const attachments = message.data.attachments ?? [];
  const withMissingFiles = attachments.filter(
    (a) =>
      // needs a file
      (!a.url || a.url.startsWith("blob:")) &&
      // has no file
      !files.find((f) => f.id === a.id),
  );
  const hasDuplicates = getDuplicateCount(attachments) !== 0;

  return (
    <EmbedEditorSection
      name={t("filesCount", { replace: { count: attachments.length } })}
      hasError={withMissingFiles.length !== 0}
      hasWarning={hasDuplicates}
    >
      {/* <p>{files.map((f) => f.file.name).join(", ")}</p> */}
      {/* Avoid confusion by not showing this warning while there is a more severe error */}
      {hasDuplicates && withMissingFiles.length === 0 ? (
        <p className="text-sm text-yellow-600 dark:text-yellow-200">
          <CoolIcon icon="Triangle_Warning" />{" "}
          <Trans
            t={t}
            i18nKey="filenameDuplicateWarning"
            components={{
              anchor: (
                <Link
                  to="/guide/troubleshooting/attachments"
                  className="underline hover:no-underline"
                  target="_blank"
                />
              ),
            }}
          />
        </p>
      ) : null}
      {attachments.length === 0 ? (
        noFilesMessage ? (
          <p className="text-muted dark:text-muted-dark text-sm italic">
            {noFilesMessage}
          </p>
        ) : null
      ) : (
        <div
          className={twJoin(
            "flex gap-2 overflow-x-auto first:mt-2",
            attachments.length === 0 ? "hidden" : undefined,
          )}
        >
          {attachments.map((attachment, i) => {
            const isPreviewable =
              !!attachment.url &&
              !!attachment.content_type &&
              (attachment.content_type?.startsWith("image/") ||
                attachment.content_type?.startsWith("video/"));
            const file = files.find((f) => f.id === attachment.id);
            const needsFile =
              !attachment.url || attachment.url.startsWith("blob:");
            const missingFile = !file && needsFile;

            const moveStart = () => {
              attachments.splice(i, 1);
              attachments.splice(i - 1, 0, attachment);
              setData({ ...data });
            };
            const moveEnd = () => {
              attachments.splice(i + 2, 0, attachment);
              attachments.splice(i, 1);
              setData({ ...data });
            };

            return (
              <div
                key={`attachment-${attachment.id}`}
                className={twJoin(
                  "relative rounded-lg bg-background-secondary dark:bg-background-secondary-dark",
                  "border border-border-normal dark:border-border-normal-dark",
                  "py-1.5 px-2 w-32 box-border shrink-0",
                )}
              >
                <div
                  className={twJoin(
                    "w-full aspect-[1.15/1] rounded-lg flex relative",
                    isPreviewable || !file
                      ? "bg-gray-200 dark:bg-[#97979F]/[0.08]"
                      : undefined,
                  )}
                  title={fileSize(attachment.size)}
                >
                  {missingFile ? (
                    <div className="m-auto text-center text-rose-600 dark:text-rose-400">
                      <CoolIcon icon="Circle_Warning" className="text-5xl" />
                      <p className="text-sm font-medium">
                        {t("attachmentFileMissing")}
                      </p>
                    </div>
                  ) : isPreviewable ? (
                    attachment.content_type?.startsWith("image/") ? (
                      <img
                        src={attachment.url}
                        alt=""
                        className="object-contain h-fit w-max max-w-full max-h-full rounded-lg m-auto"
                      />
                    ) : attachment.content_type?.startsWith("video/") ? (
                      <video
                        src={attachment.url}
                        className="object-contain h-fit w-max max-w-full max-h-full rounded-lg m-auto select-none"
                        autoPlay={false}
                        muted
                        controls={false}
                      />
                    ) : null
                  ) : (
                    <div className="m-auto text-center">
                      <CoolIcon
                        icon="File_Document"
                        className="text-muted dark:text-muted-dark text-5xl"
                      />
                    </div>
                  )}
                  {attachment.spoiler ? (
                    <div className="absolute inset-0 w-full flex backdrop-blur-2xl rounded-lg">
                      <div className="rounded-full px-3 py-0.5 bg-black/60 m-auto">
                        <p className="whitespace-nowrap uppercase font-semibold text-sm">
                          {t("spoiler")}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {!missingFile ? (
                    <>
                      <button
                        type="button"
                        className={twJoin(
                          "hover:text-blurple-400 group/dir flex",
                          "absolute -start-0 -bottom-0 p-1 text-base",
                          "bg-gray-200 dark:bg-gray-800",
                          "box-border border border-border-normal dark:border-border-normal-dark",
                          "rounded-se-lg rounded-es-lg",
                          i === 0 ? "hidden" : undefined,
                        )}
                        onClick={moveStart}
                      >
                        <CoolIcon
                          icon="Chevron_Left"
                          rtl="Chevron_Right"
                          className="block group-active/dir:translate-y-px"
                        />
                      </button>
                      <button
                        type="button"
                        className={twJoin(
                          "hover:text-blurple-400 group/dir flex",
                          "absolute -end-0 -bottom-0 p-1 text-base",
                          "bg-gray-200 dark:bg-gray-800",
                          "box-border border border-border-normal dark:border-border-normal-dark",
                          "rounded-ss-lg rounded-ee-lg",
                          i === attachments.length - 1 ? "hidden" : undefined,
                        )}
                        onClick={moveEnd}
                      >
                        <CoolIcon
                          icon="Chevron_Right"
                          rtl="Chevron_Left"
                          className="block group-active/dir:translate-y-px"
                        />
                      </button>
                    </>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 truncate mt-1">
                  {attachment.placement_count ? (
                    <div
                      className={twJoin(
                        "border border-muted dark:border-muted-dark rounded",
                        "aspect-square py-px px-[5px] select-none",
                      )}
                      title={t("referencedNTimes", {
                        count: attachment.placement_count,
                      })}
                    >
                      <p className="text-xs leading-none font-medium text-muted dark:text-muted-dark">
                        {attachment.placement_count}
                      </p>
                    </div>
                  ) : attachment.is_thumbnail ? (
                    <CoolIcon
                      icon="Chat"
                      className="text-muted dark:text-muted-dark"
                      title={t("attachmentIsThumbnail")}
                    />
                  ) : flags.has(MessageFlags.IsVoiceMessage) &&
                    isAudioType(attachment.content_type) ? (
                    <CoolIcon
                      icon="Phone"
                      className="text-muted dark:text-muted-dark"
                    />
                  ) : null}
                  <button
                    type="button"
                    className="truncate font-normal text-sm"
                    title={`${attachment.filename} (${t("clickToCopy")})`}
                    onClick={() => copyText(attachment.filename)}
                  >
                    {attachment.filename}
                  </button>
                </div>
                <div
                  className={twJoin(
                    "absolute -top-px -end-px flex gap-[0.375rem] px-1.5 py-0 text-lg",
                    "bg-gray-200 dark:bg-gray-800",
                    "box-border border border-border-normal dark:border-border-normal-dark",
                    "rounded-lg rounded-ss-none rounded-ee-none",
                  )}
                >
                  <button
                    type="button"
                    className={twJoin(
                      "h-[26px] hover:text-blurple-400 active:translate-y-px",
                      !missingFile || i === 0 ? "hidden" : undefined,
                    )}
                    onClick={moveStart}
                  >
                    <CoolIcon icon="Chevron_Left" rtl="Chevron_Right" />
                  </button>
                  <button
                    type="button"
                    className={twJoin(
                      "h-[26px] hover:text-blurple-400 active:translate-y-px",
                      !missingFile || i === attachments.length - 1
                        ? "hidden"
                        : undefined,
                    )}
                    onClick={moveEnd}
                  >
                    <CoolIcon icon="Chevron_Right" rtl="Chevron_Left" />
                  </button>
                  <button
                    type="button"
                    // mirror icon to match discord's
                    className={twJoin(
                      "h-[26px] hover:text-blurple-400 [-webkit-transform:scaleX(-1)] -scale-x-[1] active:translate-y-px",
                      missingFile ? "hidden" : undefined,
                    )}
                    onClick={() => {
                      attachment.spoiler = !attachment.spoiler;
                      setData({ ...data });
                    }}
                  >
                    <CoolIcon icon={attachment.spoiler ? "Hide" : "Show"} />
                  </button>
                  <button
                    type="button"
                    className={twJoin(
                      "h-[26px] hover:text-blurple-400 active:translate-y-px",
                      missingFile ? "hidden" : undefined,
                    )}
                    onClick={() => setEditingAttachment(attachment)}
                  >
                    <CoolIcon icon="Edit_Pencil_01" />
                  </button>
                  <button
                    type="button"
                    className="h-[26px] hover:text-red-400 active:translate-y-px"
                    onClick={() => {
                      message.data.attachments =
                        message.data.attachments?.filter(
                          (a) => a.id !== attachment.id,
                        );
                      setData({ ...data });
                    }}
                  >
                    <CoolIcon icon="Trash_Full" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {allowNewFiles === false ? null : (
        <div className="first:mt-2">
          <input
            id={`files-${mid}`}
            type="file"
            hidden
            multiple
            onChange={fileInputChangeHandler(
              files,
              setFiles,
              attachments,
              (newAttachments) => {
                message.data.attachments = newAttachments;
                setData({ ...data });
              },
            )}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>(
                  `input#files-${mid}`,
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
                  const newFile: DraftFile = {
                    id: randomString(10),
                    file,
                    url: URL.createObjectURL(file),
                  };
                  newFiles.push(newFile);
                  attachments.push(attachmentFromFile(newFile));
                }
                setFiles(newFiles);
                message.data.attachments = attachments;
                setData({ ...data });
              }}
            />
          </div>
        </div>
      )}
    </EmbedEditorSection>
  );
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
  componentFoundBackupsHook,
  targets,
  cache,
  cdn,
  // Parent
  t,
  setEditingAttachment,
  setEditingName,
}) => {
  const message = data.messages[i];
  const attachments = message.data.attachments ?? [];

  const id = getQdMessageId(message);
  const embedsLength =
    message.data.embeds && message.data.embeds.length > 0
      ? message.data.embeds.map(getEmbedLength).reduce((a, b) => a + b)
      : 0;
  const flags = new MessageFlagsBitField(message.data.flags ?? 0);

  const webhookTargets = targets
    ? targets.filter((t) => t.type === TargetType.Webhook)
    : [];
  const authorTypes = webhookTargets
    .filter((t) => t.type === TargetType.Webhook)
    .map((w) => getAuthorType(discordApplicationId, w.webhook));
  const possiblyActionable = authorTypes.includes(AuthorType.ActionableWebhook);
  const possiblyApplication = authorTypes.includes(
    AuthorType.ApplicationWebhook,
  );
  const channels = cache
    ? webhookTargets
        .map((w) => cache.channel.get(w.webhook.channel_id))
        .filter((c): c is ResolvableAPIChannel => !!c)
    : [];

  const isAllForum =
    webhookTargets.length !== 0 &&
    channels.filter((c) => ["forum", "media"].includes(c.type)).length ===
      webhookTargets.length;
  const isNoneForum =
    // There are webhooks
    webhookTargets.length !== 0 &&
    // All of their channels are resolved
    channels.length === webhookTargets?.length &&
    // None of them are forums
    channels.filter((c) => ["forum", "media"].includes(c.type)).length === 0;

  const imageFiles = useMemo(
    () => attachments.filter((a) => a.content_type?.startsWith("image/")),
    [attachments],
  );
  const thumbnailAttachmentId =
    imageFiles.find((a) => a.is_thumbnail)?.id ?? null;

  return (
    <Collapsible.Root
      className="group/message my-2 pt-2 pb-2 bg-[#EFEFF0] dark:bg-[#292b2f] border-y border-gray-400 dark:border-[#1E1F22]"
      defaultOpen
    >
      <MessageEditorCollapsibleTrigger
        t={t}
        index={i}
        message={message}
        data={data}
        setData={setData}
        setEditingName={setEditingName}
        hasError={embedsLength > 6000}
      />
      <Collapsible.Panel
        className={twMerge(collapsibleStyles.editorPanel, "px-4 space-y-2")}
      >
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
                (!!message.reference || isNoneForum || !!message.thread_id) &&
                !message.data.thread_name?.trim()
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
                      imageFiles.map((attachment) => ({
                        label: transformFileName(attachment.filename),
                        value: attachment.id,
                      })),
                    )}
                    value={thumbnailAttachmentId}
                    onValueChange={(id) => {
                      for (const attachment of attachments) {
                        if (attachment.placement_count) continue;
                        attachment.is_thumbnail = attachment.id === id;
                      }
                      setData({ ...data });
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
                          {imageFiles.map((attachment) => (
                            <Select.Item
                              key={`thumbnail-select-${attachment.id}`}
                              value={attachment.id}
                              className={selectStyles.item}
                            >
                              <Select.ItemText
                                className={selectStyles.itemText}
                              >
                                {transformFileName(attachment.filename)}
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
                    for (const attachment of attachments) {
                      attachment.is_thumbnail = false;
                    }
                    setData({ ...data });
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
          <MessageAttachmentsSection
            t={t}
            mid={id}
            message={message}
            data={data}
            setData={setData}
            setEditingAttachment={setEditingAttachment}
            files={files}
            setFiles={setFiles}
          />
        </div>
        {message.data.embeds && message.data.embeds.length > 0 && (
          <div className="mt-1 space-y-1">
            {embedsLength > 6000 && (
              <InfoBox severity="red" icon="Circle_Warning" className="mb-2">
                <Trans i18nKey="embedsTooLarge" count={embedsLength - 6000} />
              </InfoBox>
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
                setFiles={setFiles}
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
                    webhookTargets.length === 0
                      ? "blue"
                      : possiblyApplication
                        ? "yellow"
                        : "red"
                  }
                  collapsible
                  open
                >
                  {t(
                    webhookTargets.length === 0
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
                    componentFoundBackupsHook={componentFoundBackupsHook}
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
              | "switchStyle"
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
                // {
                //   label: t("switchMessageStyle"),
                //   icon: "Swatches_Palette",
                //   value: "switchStyle",
                // },
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
                  case "switchStyle":
                    if (isComponentsV2(message.data)) {
                    } else {
                    }
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
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};

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
  componentFoundBackupsHook,
  targets,
  cache,
  cdn,
  drag,
  // Parent
  t,
  setEditingAttachment,
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
  // This probably executes more often than necessary, but I wasn't sure
  // about memo dependencies (`components` was not what I wanted)
  const totalCharacters = (
    extractComponentsByType(components, [
      ComponentType.TextDisplay,
    ]) as APITextDisplayComponent[]
  ).reduce((prev, cur) => prev + cur.content.length, 0);
  const tooManyCharacters = totalCharacters > MAX_TOTAL_COMPONENTS_CHARACTERS;

  const webhookTargets = targets
    ? targets.filter((t) => t.type === TargetType.Webhook)
    : [];
  // const authorTypes = webhooks
  //   ? webhooks.map((w) => getAuthorType(discordApplicationId, w))
  //   : [];
  // const possiblyActionable = authorTypes.includes(AuthorType.ActionableWebhook);
  // const possiblyApplication = authorTypes.includes(
  //   AuthorType.ApplicationWebhook,
  // );
  const channels = cache
    ? webhookTargets
        .map((w) => cache.channel.get(w.webhook.channel_id))
        .filter((c): c is ResolvableAPIChannel => !!c)
    : [];

  const isAllForum =
    webhookTargets.length !== 0 &&
    channels.filter((c) => ["forum", "media"].includes(c.type)).length ===
      webhookTargets.length;
  const isNoneForum =
    // There are webhooks
    webhookTargets.length !== 0 &&
    // All of their channels are resolved
    channels.length === webhookTargets?.length &&
    // None of them are forums
    channels.filter((c) => ["forum", "media"].includes(c.type)).length === 0;

  return (
    <Collapsible.Root
      className="group/message my-2 pt-2 pb-2 bg-[#EFEFF0] dark:bg-[#292b2f] border-y border-gray-400 dark:border-[#1E1F22]"
      defaultOpen
    >
      <MessageEditorCollapsibleTrigger
        t={t}
        index={i}
        message={message}
        data={data}
        setData={setData}
        setEditingName={setEditingName}
        hasError={tooManyCharacters}
      />
      <Collapsible.Panel
        className={twMerge(collapsibleStyles.editorPanel, "px-4 space-y-2")}
      >
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
                (!!message.reference || isNoneForum || !!message.thread_id) &&
                !message.data.thread_name
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
          <MessageAttachmentsSection
            t={t}
            mid={mid}
            message={message}
            data={data}
            setData={setData}
            files={files}
            setFiles={setFiles}
            setEditingAttachment={setEditingAttachment}
            allowNewFiles={false}
            noFilesMessage={t("filesComponentsOnly")}
          />
        </div>
        {tooManyCharacters ? (
          <InfoBox severity="red" icon="Circle_Warning">
            <Trans
              i18nKey="componentTextTooLarge"
              count={totalCharacters - MAX_TOTAL_COMPONENTS_CHARACTERS}
              values={{ maximum: MAX_TOTAL_COMPONENTS_CHARACTERS }}
            />
          </InfoBox>
        ) : (
          <p className="italic text-sm !mt-0 !-mb-1 text-muted dark:text-muted-dark">
            <Trans
              t={t}
              i18nKey="charactersCount"
              components={{
                counter: (
                  <span
                    className={
                      totalCharacters >= MAX_TOTAL_COMPONENTS_CHARACTERS
                        ? "text-red-300"
                        : totalCharacters / MAX_TOTAL_COMPONENTS_CHARACTERS >=
                            0.9
                          ? "text-yellow-300"
                          : ""
                    }
                  />
                ),
              }}
              values={{
                current: totalCharacters,
                maximum: MAX_TOTAL_COMPONENTS_CHARACTERS,
              }}
            />
          </p>
        )}
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
                  componentFoundBackupsHook={componentFoundBackupsHook}
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
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
