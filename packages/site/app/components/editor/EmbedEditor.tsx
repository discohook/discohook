import { type APIEmbedField, ButtonStyle } from "discord-api-types/v10";
import type { TFunction } from "i18next";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import type { DraftFile } from "~/routes/_index";
import type { QueryData } from "~/types/QueryData";
import type { APIEmbed } from "~/types/QueryData-raw";
import type { CacheManager } from "~/util/cache/CacheManager";
import { transformFileName } from "~/util/files";
import { randomString } from "~/util/text";
import { Button } from "../Button";
import { ButtonSelect } from "../ButtonSelect";
import { Checkbox } from "../Checkbox";
import { InfoBox } from "../InfoBox";
import { CoolIcon } from "../icons/CoolIcon";
import { ColorPickerPopoverWithTrigger } from "../pickers/ColorPickerPopover";
import DatePicker from "../pickers/DatePicker";
import { linkClassName } from "../preview/Markdown";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { decimalToHex } from "./ColorPicker";

export const isEmbedEmpty = (embed: APIEmbed): boolean =>
  !embed.author &&
  !embed.title &&
  !embed.description &&
  (!embed.fields || embed.fields.length === 0) &&
  !embed.image?.url &&
  !embed.thumbnail?.url &&
  !embed.footer;

export const getEmbedText = (embed: APIEmbed): string | undefined =>
  embed.author?.name ||
  embed.title ||
  (embed.fields ? embed.fields.find((f) => !!f.name)?.name : undefined) ||
  embed.description ||
  embed.footer?.text;

export const getEmbedLength = (embed: APIEmbed) => {
  let totalCharacters =
    (embed.title ?? "").length +
    (embed.description ?? "").length +
    (embed.author?.name ?? "").length +
    (embed.footer?.text ?? "").length;

  const fieldLengths = (embed.fields ?? []).map(
    (f) => (f.name?.length ?? 0) + (f.value?.length ?? 0),
  );
  if (fieldLengths.length > 0) {
    totalCharacters += fieldLengths.reduce((a, b) => a + b);
  }
  return totalCharacters;
};

export const getEmbedErrors = (embed: APIEmbed) => {
  const errors: string[] = [];

  const totalCharacters = getEmbedLength(embed);
  if (totalCharacters === 0 && !embed.image?.url && !embed.thumbnail?.url) {
    errors.push("embedEmpty");
  }

  return errors;
};

const GIF_SITE_RE =
  /^https:\/\/(?:www\.)?(?:(giphy)\.com\/gifs|(tenor)\.com(?:\/[\w-]+)?\/view)\/|media\d\.(tenor)\.com\/m\/([\w-]+)\//;

const isGifUrl = (gifUrl: string) => GIF_SITE_RE.test(gifUrl);

const transformGifUrl = (gifUrl: string, cdn: string) => {
  try {
    const url = new URL(gifUrl);
    const match = GIF_SITE_RE.exec(url.href);
    if (!match) return null;

    switch (true) {
      // tenor.com/view/{key}
      case match[2] === "tenor":
        return new URL(
          `${url.pathname.replace(/^.*\/view\//i, "/tenor/")}.gif`,
          cdn,
        ).href;
      // media1.tenor.com/m/{key}/
      // ^ almost-direct link that works in browsers but not Discord
      case match[3] === "tenor":
        return `https://c.tenor.com/${match[4]}/tenor.gif`;
      // giphy.com/gifs/{key}
      case match[1] === "giphy":
        return new URL(
          `${url.pathname.replace(/^\/gifs\//, "/giphy/")}.gif`,
          cdn,
        ).href;
      default:
        break;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const DetectGifUrlFooter = ({
  t,
  value,
  onChange,
  cdn,
}: {
  t: TFunction;
  value: string | undefined;
  onChange: (value: string) => void;
  cdn?: string;
}) => {
  const match = isGifUrl(value ?? "");
  return (
    <div
      data-show={!!cdn && match}
      className={twJoin(
        "mt-1 transition-all",
        "max-h-0 data-[show=true]:max-h-20",
        "opacity-0 data-[show=true]:opacity-100",
        "pointer-events-none data-[show=true]:pointer-events-auto",
      )}
    >
      <p className={twJoin("text-sm text-muted dark:text-muted-dark")}>
        <Trans
          t={t}
          i18nKey="gifConvertSuggestion"
          components={{
            icon: (
              <CoolIcon
                icon="Bulb"
                className="text-yellow-500 dark:text-yellow-300"
              />
            ),
            button: (
              <button
                type="button"
                className={twJoin(linkClassName, "contents text-start")}
                onClick={() => {
                  if (!cdn || !value || !match) return;
                  const converted = transformGifUrl(value, cdn);
                  if (converted) onChange(converted);
                }}
              />
            ),
          }}
        />
      </p>
    </div>
  );
};

export const EmbedEditor: React.FC<{
  message: QueryData["messages"][number];
  messageIndex: number;
  embed: APIEmbed;
  embedIndex: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  files?: DraftFile[];
  open?: boolean;
  cache?: CacheManager;
  cdn?: string;
}> = ({
  message,
  messageIndex: mi,
  embed,
  embedIndex: i,
  data,
  setData,
  files,
  open,
  cache,
  cdn,
}) => {
  const { t } = useTranslation();

  const messageEmbeds = message.data.embeds ?? [];

  const updateEmbed = (partialEmbed: Partial<APIEmbed>) => {
    if (
      partialEmbed.author &&
      !partialEmbed.author.name &&
      !partialEmbed.author.icon_url &&
      !partialEmbed.author.url
    ) {
      partialEmbed.author = undefined;
    }
    if (
      partialEmbed.footer &&
      !partialEmbed.footer.text &&
      !partialEmbed.footer.icon_url
    ) {
      partialEmbed.footer = undefined;
    }

    const newEmbed = { ...embed, ...partialEmbed };
    messageEmbeds.splice(i, 1, newEmbed);

    setData({ ...data });
  };

  // The first embed in the gallery is the parent that the children will be merged into
  const galleryEmbeds = messageEmbeds.filter(
    (e) => embed.url && e.url === embed.url,
  );
  const galleryChildren = galleryEmbeds.slice(1);
  const isChild = galleryChildren.includes(embed);

  const localIndex = isChild ? galleryChildren.indexOf(embed) : i;
  const localIndexMax = isChild
    ? galleryChildren.length - 1
    : messageEmbeds.length - 1;

  const localMaxMembers = isChild ? 3 : 10;

  const previewText = getEmbedText(embed);
  const errors = getEmbedErrors(embed);
  return (
    <details
      className="group/embed rounded-lg p-2 bg-gray-100 dark:bg-gray-800 border border-l-4 border-gray-300 dark:border-gray-700 border-l-[#D9D9DC] dark:border-l-[#4A4A50] shadow"
      open={open}
      style={
        embed.color ? { borderLeftColor: decimalToHex(embed.color) } : undefined
      }
    >
      <summary className="group-open/embed:mb-2 py-1 px-1 transition-[margin] marker:content-none marker-none flex text-lg font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          rtl="Chevron_Left"
          className="ltr:group-open/embed:rotate-90 rtl:group-open/embed:-rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
        />
        {errors.length > 0 && (
          <CoolIcon
            icon="Circle_Warning"
            className="my-auto text-rose-600 dark:text-rose-400 ltr:mr-1.5 rtl:ml-1.5"
          />
        )}
        {isChild ? (
          <>
            <span className="shrink-0">
              {t("galleryImageN", { replace: { n: localIndex + 2 } })}
            </span>
            {embed.image?.url && (
              <span className="truncate ltr:ml-1 rtl:mr-1">
                - {embed.image.url}
              </span>
            )}
          </>
        ) : (
          <span className="truncate">
            {t(previewText ? "embedNText" : "embedN", {
              replace: { n: i + 1, text: previewText },
            })}
          </span>
        )}
        <div className="ltr:ml-auto rtl:mr-auto text-xl space-x-2.5 rtl:space-x-reverse my-auto shrink-0">
          {!isChild && (
            // Was having issues with this, may re-introduce later
            // For now users just have to manually move gallery items
            <>
              <button
                type="button"
                className={localIndex === 0 ? "hidden" : ""}
                onClick={() => {
                  messageEmbeds.splice(i, 1);
                  messageEmbeds.splice(i - 1, 0, embed);
                  setData({ ...data });
                }}
              >
                <CoolIcon icon="Chevron_Up" />
              </button>
              <button
                type="button"
                className={localIndex === localIndexMax ? "hidden" : ""}
                onClick={() => {
                  messageEmbeds.splice(i, 1);
                  messageEmbeds.splice(i + 1, 0, embed);
                  setData({ ...data });
                }}
              >
                <CoolIcon icon="Chevron_Down" />
              </button>
              <button
                type="button"
                className={localIndexMax + 1 >= localMaxMembers ? "hidden" : ""}
                onClick={() => {
                  messageEmbeds.splice(i + 1, 0, structuredClone(embed));
                  setData({ ...data });
                }}
              >
                <CoolIcon icon="Copy" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              messageEmbeds.splice(i, 1);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      {errors.length > 0 && (
        <div className="-mt-1 mb-1">
          <InfoBox severity="red" icon="Circle_Warning">
            {errors.map((k) => t(k)).join("\n")}
          </InfoBox>
        </div>
      )}
      {!isChild && (
        <>
          <EmbedEditorSection name={t("author")} open={open}>
            <div className="flex">
              <div className="grow">
                <TextArea
                  label={t("name")}
                  className="w-full"
                  maxLength={256}
                  value={embed.author?.name ?? ""}
                  short
                  t={t}
                  onInput={(e) =>
                    updateEmbed({
                      author: {
                        ...(embed.author ?? {}),
                        name: e.currentTarget.value,
                      },
                    })
                  }
                />
              </div>
              {embed.author?.url === undefined && (
                <Button
                  className="ltr:ml-2 rtl:mr-2 mt-auto h-9"
                  onClick={() =>
                    updateEmbed({
                      author: {
                        ...(embed.author ?? { name: "" }),
                        url: location.origin,
                      },
                    })
                  }
                >
                  {t("addUrl")}
                </Button>
              )}
            </div>
            <div className="grid gap-2 mt-2">
              {embed.author?.url !== undefined && (
                <div className="flex">
                  <div className="grow">
                    <TextInput
                      label={t("authorUrl")}
                      className="w-full"
                      type="url"
                      required
                      t={t}
                      value={embed.author?.url ?? ""}
                      onInput={(e) =>
                        updateEmbed({
                          author: {
                            ...(embed.author ?? { name: "" }),
                            url: e.currentTarget.value,
                          },
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="ltr:ml-2 rtl:mr-2 mt-auto mb-1 text-xl"
                    onClick={() =>
                      updateEmbed({
                        author: {
                          ...(embed.author ?? { name: "" }),
                          url: undefined,
                        },
                      })
                    }
                  >
                    <CoolIcon icon="Close_MD" />
                  </button>
                </div>
              )}
              <div>
                <div className="flex gap-2">
                  <div className="grow">
                    <TextInput
                      label={t("iconUrl")}
                      className="w-full"
                      type="url"
                      value={embed.author?.icon_url ?? ""}
                      onInput={({ currentTarget }) =>
                        updateEmbed({
                          author: {
                            ...(embed.author ?? { name: "" }),
                            icon_url: currentTarget.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="mt-auto">
                    <EmbedFileSelect
                      t={t}
                      files={files}
                      onChange={({ url }) => {
                        updateEmbed({
                          author: {
                            ...(embed.author ?? { name: "" }),
                            icon_url: url,
                          },
                        });
                      }}
                    />
                  </div>
                </div>
                <DetectGifUrlFooter
                  t={t}
                  value={embed.author?.icon_url}
                  onChange={(value) => {
                    updateEmbed({
                      author: {
                        ...(embed.author ?? { name: "" }),
                        icon_url: value,
                      },
                    });
                  }}
                  cdn={cdn}
                />
              </div>
            </div>
          </EmbedEditorSection>
          <hr className="border border-gray-500/20" />
        </>
      )}
      <EmbedEditorSection name={t("body")} open={open}>
        {!isChild ? (
          <div className="flex">
            <div className="grow">
              <TextArea
                label={t("title")}
                className="w-full"
                maxLength={256}
                value={embed.title ?? ""}
                markdown="title"
                cache={cache}
                short
                onInput={(e) =>
                  updateEmbed({
                    title: e.currentTarget.value || undefined,
                  })
                }
              />
            </div>
            {embed.url === undefined && (
              <Button
                className="ltr:ml-2 rtl:mr-2 mt-auto h-9"
                onClick={() =>
                  updateEmbed({
                    url: `${location.origin}#default-${randomString(8)}`,
                  })
                }
              >
                {t("addUrl")}
              </Button>
            )}
          </div>
        ) : null}
        <div className="grid gap-2">
          {(isChild || embed.url !== undefined) && (
            <div className="flex">
              <div className="grow">
                <TextInput
                  label={t("titleUrl")}
                  description={isChild ? t("titleUrlManaged") : ""}
                  className="w-full"
                  type="url"
                  value={embed.url ?? ""}
                  onInput={(e) => {
                    if (galleryEmbeds.length > 1) {
                      const defaultUrl = `${
                        location.origin
                      }#default-${randomString(8)}`;
                      for (const emb of galleryEmbeds) {
                        emb.url = e.currentTarget.value || defaultUrl;
                      }
                      setData({ ...data });
                    } else {
                      updateEmbed({ url: e.currentTarget.value });
                    }
                  }}
                />
              </div>
              <button
                type="button"
                disabled={isChild}
                className="ltr:ml-2 rtl:mr-2 mt-auto mb-1 text-xl"
                onClick={() => {
                  embed.url = undefined;
                  message.data.embeds = messageEmbeds.filter(
                    (e) => !galleryChildren.includes(e),
                  );
                  setData({ ...data });
                }}
              >
                <CoolIcon icon="Close_MD" />
              </button>
            </div>
          )}
          {!isChild ? (
            <ColorPickerPopoverWithTrigger
              t={t}
              value={embed.color}
              onValueChange={(color) => updateEmbed({ color })}
            />
          ) : null}
        </div>
        {!isChild && (
          <TextArea
            label={t("description")}
            className="w-full h-40"
            value={embed.description ?? ""}
            maxLength={4096}
            markdown="full"
            cache={cache}
            onInput={(e) =>
              updateEmbed({
                description: e.currentTarget.value || undefined,
              })
            }
          />
        )}
      </EmbedEditorSection>
      <hr className="border border-gray-500/20" />
      {!isChild && (
        <>
          <EmbedEditorSection name={t("fields")} open={open}>
            {embed.fields && (
              <div className="ltr:ml-2 ltr:md:ml-4 rtl:mr-2 rtl:md:mr-4 ltr:transition-[margin-left] rtl:transition-[margin-right]">
                {embed.fields.map((field, fi) => (
                  <EmbedFieldEditorSection
                    key={`edit-message-${mi}-embed-${i}-field-${fi}`}
                    embed={embed}
                    updateEmbed={updateEmbed}
                    field={field}
                    index={fi}
                    t={t}
                    open={open}
                  >
                    <div className="flex items-center gap-2">
                      <div className="grow">
                        <TextArea
                          label={t("name")}
                          value={field.name ?? ""}
                          maxLength={256}
                          className="w-full"
                          markdown="title"
                          cache={cache}
                          short
                          required
                          t={t}
                          onInput={(e) => {
                            field.name = e.currentTarget.value;
                            updateEmbed({});
                          }}
                        />
                      </div>
                      <div className="mt-4.5">
                        <Checkbox
                          label={t("inline")}
                          checked={field.inline ?? false}
                          onCheckedChange={(checked) => {
                            field.inline = checked;
                            updateEmbed({});
                          }}
                        />
                      </div>
                    </div>
                    <TextArea
                      label={t("value")}
                      value={field.value}
                      maxLength={1024}
                      className="w-full"
                      markdown="full"
                      cache={cache}
                      required
                      t={t}
                      onInput={(e) => {
                        field.value = e.currentTarget.value;
                        updateEmbed({});
                      }}
                    />
                  </EmbedFieldEditorSection>
                ))}
              </div>
            )}
            <Button
              disabled={!!embed.fields && embed.fields.length >= 25}
              onClick={() =>
                updateEmbed({
                  fields: [...(embed.fields ?? []), { name: "", value: "" }],
                })
              }
            >
              {t("addField")}
            </Button>
          </EmbedEditorSection>
          <hr className="border border-gray-500/20" />
        </>
      )}
      <EmbedEditorSection name={t("images")} open={isChild || open}>
        <div>
          <div className={galleryChildren.includes(embed) ? "flex" : ""}>
            <div className="grow">
              <TextInput
                label={t("largeImageUrl")}
                type="url"
                className="w-full"
                value={embed.image?.url ?? ""}
                onInput={({ currentTarget }) =>
                  updateEmbed({ image: { url: currentTarget.value } })
                }
              />
            </div>
            {!galleryChildren.includes(embed) ? (
              <DetectGifUrlFooter
                t={t}
                value={embed.image?.url}
                onChange={(value) => updateEmbed({ image: { url: value } })}
                cdn={cdn}
              />
            ) : null}
            <div
              className={twJoin(
                "flex gap-2",
                !galleryChildren.includes(embed)
                  ? "mt-1 w-full"
                  : "ml-2 mt-auto",
              )}
            >
              <EmbedFileSelect
                t={t}
                files={files}
                onChange={({ url }) => updateEmbed({ image: { url } })}
              />
              {!galleryChildren.includes(embed) && (
                <Button
                  className="h-9"
                  disabled={
                    !embed.image?.url ||
                    messageEmbeds.length >= 10 ||
                    galleryEmbeds.length >= 4
                  }
                  onClick={() => {
                    const url =
                      embed.url ||
                      `${location.origin}#gallery-${randomString(8)}`;
                    embed.url = url;
                    message.data.embeds = message.data.embeds ?? [];
                    message.data.embeds.splice(i + 1, 0, { url });
                    setData({ ...data });
                  }}
                >
                  {t("addAnother")}
                </Button>
              )}
            </div>
          </div>
          {galleryChildren.includes(embed) ? (
            <DetectGifUrlFooter
              t={t}
              value={embed.image?.url}
              onChange={(value) => updateEmbed({ image: { url: value } })}
              cdn={cdn}
            />
          ) : null}
        </div>
        {!isChild && (
          <div>
            <div className="flex">
              <div className="grow">
                <TextInput
                  label={t("thumbnailUrl")}
                  type="url"
                  className="w-full"
                  value={embed.thumbnail?.url ?? ""}
                  onInput={({ currentTarget }) =>
                    updateEmbed({ thumbnail: { url: currentTarget.value } })
                  }
                />
              </div>
              <div className="ml-2 mt-auto">
                <EmbedFileSelect
                  t={t}
                  files={files}
                  onChange={({ url }) => updateEmbed({ thumbnail: { url } })}
                />
              </div>
            </div>
            <DetectGifUrlFooter
              t={t}
              value={embed.thumbnail?.url}
              onChange={(value) => updateEmbed({ thumbnail: { url: value } })}
              cdn={cdn}
            />
          </div>
        )}
      </EmbedEditorSection>
      {!isChild && (
        <>
          <hr className="border border-gray-500/20" />
          <EmbedEditorSection name={t("footer")} open={open}>
            <div className="flex">
              <div className="grow">
                <TextArea
                  label={t("text")}
                  className="w-full"
                  maxLength={2048}
                  value={embed.footer?.text ?? ""}
                  short
                  onInput={(e) =>
                    updateEmbed({
                      footer: {
                        ...(embed.footer ?? {}),
                        text: e.currentTarget.value,
                      },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <div className="flex gap-2 mt-2">
                <div className="grow">
                  <TextInput
                    label={t("iconUrl")}
                    className="w-full"
                    type="url"
                    value={embed.footer?.icon_url ?? ""}
                    onInput={({ currentTarget }) =>
                      updateEmbed({
                        footer: {
                          ...(embed.footer ?? { text: "" }),
                          icon_url: currentTarget.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="mt-auto">
                  <EmbedFileSelect
                    t={t}
                    files={files}
                    onChange={({ url }) => {
                      updateEmbed({
                        footer: {
                          ...(embed.footer ?? { text: "" }),
                          icon_url: url,
                        },
                      });
                    }}
                  />
                </div>
              </div>
              <DetectGifUrlFooter
                t={t}
                value={embed.footer?.icon_url}
                onChange={(value) => {
                  updateEmbed({
                    footer: {
                      ...(embed.footer ?? { text: "" }),
                      icon_url: value,
                    },
                  });
                }}
                cdn={cdn}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <DatePicker
                label={t("date")}
                value={embed.timestamp ? new Date(embed.timestamp) : null}
                onChange={(opt) =>
                  updateEmbed({
                    timestamp: opt ? opt.date.toISOString() : undefined,
                  })
                }
                isClearable
              />
              <TextInput
                label={t("timeText")}
                type="time"
                className="w-full"
                disabled={!embed.timestamp}
                step={60}
                value={
                  !embed.timestamp
                    ? ""
                    : new Date(embed.timestamp).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: false,
                      })
                }
                onChange={(e) => {
                  if (embed.timestamp) {
                    const [hours, minutes] = e.currentTarget.value
                      .split(":")
                      .map(Number);
                    const timestamp = new Date(embed.timestamp);
                    timestamp.setHours(hours, minutes, 0, 0);
                    updateEmbed({
                      timestamp: timestamp.toISOString(),
                    });
                  }
                }}
              />
            </div>
          </EmbedEditorSection>
        </>
      )}
    </details>
  );
};

export const EmbedEditorSection: React.FC<
  React.PropsWithChildren<{
    name: string;
    open?: boolean;
    className?: string;
    actionsBar?: Partial<{
      up: { hidden?: boolean; onClick: () => void };
      down: { hidden?: boolean; onClick: () => void };
      copy: { hidden?: boolean; onClick: () => void };
      delete: { hidden?: boolean; onClick: () => void };
    }>;
  }>
> = ({ name, open, children, className, actionsBar }) => {
  return (
    <details
      className={twMerge("group/editor-section p-2", className)}
      open={open}
    >
      <summary className="group-open/editor-section:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <div className="my-auto flex">
          <CoolIcon
            icon="Chevron_Right"
            rtl="Chevron_Left"
            className="ltr:group-open/editor-section:rotate-90 rtl:group-open/editor-section:-rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
          />
          {name}
        </div>
        {actionsBar && Object.keys(actionsBar).length === 0 ? null : (
          <div className="ltr:ml-auto rtl:mr-auto text-base space-x-2 rtl:space-x-reverse my-auto shrink-0 p-2 pl-0">
            {actionsBar?.up ? (
              <button
                type="button"
                className={actionsBar.up.hidden ? "hidden" : undefined}
                onClick={actionsBar.up.onClick}
              >
                <CoolIcon icon="Chevron_Up" />
              </button>
            ) : null}
            {actionsBar?.down ? (
              <button
                type="button"
                className={actionsBar.down.hidden ? "hidden" : undefined}
                onClick={actionsBar.down.onClick}
              >
                <CoolIcon icon="Chevron_Down" />
              </button>
            ) : null}
            {actionsBar?.copy ? (
              <button
                type="button"
                className={actionsBar.copy.hidden ? "hidden" : undefined}
                onClick={actionsBar.copy.onClick}
              >
                <CoolIcon icon="Copy" />
              </button>
            ) : null}
            {actionsBar?.delete ? (
              <button
                type="button"
                className={actionsBar.delete.hidden ? "hidden" : undefined}
                onClick={actionsBar.delete.onClick}
              >
                <CoolIcon icon="Trash_Full" />
              </button>
            ) : null}
          </div>
        )}
      </summary>
      <div className="space-y-2">{children}</div>
    </details>
  );
};

export const EmbedFieldEditorSection: React.FC<
  React.PropsWithChildren<{
    embed: APIEmbed;
    updateEmbed: (partialEmbed: Partial<APIEmbed>) => void;
    field: APIEmbedField;
    index: number;
    t: TFunction;
    open?: boolean;
  }>
> = ({ embed, updateEmbed, field, index, t, open, children }) => {
  const previewText = (field.name?.trim() || field.value?.trim()) ?? "";
  const embedFields = embed.fields ?? [];
  return (
    <details className="group/field pb-2 -my-1" open={open}>
      <summary className="group-open/field:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          rtl="Chevron_Left"
          className="ltr:group-open/field:rotate-90 rtl:group-open/field:-rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
        />
        <span className="truncate">
          {t(previewText ? "fieldNText" : "fieldN", {
            replace: { n: index + 1, text: previewText },
          })}
        </span>
        <div className="ml-auto text-lg space-x-2.5 rtl:space-x-reverse my-auto shrink-0">
          <button
            type="button"
            className={index === 0 ? "hidden" : ""}
            onClick={() => {
              embedFields.splice(index, 1);
              embedFields.splice(index - 1, 0, field);
              updateEmbed({});
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            type="button"
            className={index === embedFields.length - 1 ? "hidden" : ""}
            onClick={() => {
              embedFields.splice(index, 1);
              embedFields.splice(index + 1, 0, field);
              updateEmbed({});
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            type="button"
            className={embedFields.length >= 25 ? "hidden" : ""}
            onClick={() => {
              embedFields.splice(index + 1, 0, structuredClone(field));
              updateEmbed({});
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            onClick={() => {
              embedFields.splice(index, 1);
              updateEmbed({});
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      <div className="space-y-2">{children}</div>
    </details>
  );
};

const EmbedFileSelect = (props: {
  t: TFunction;
  files: DraftFile[] | undefined;
  onChange: (props: { filename: string; url: string }) => void;
}) => {
  const { t, onChange } = props;
  const files = props.files
    ? props.files.filter(({ file }) => file.type.startsWith("image/"))
    : [];

  return (
    <ButtonSelect
      discordstyle={ButtonStyle.Secondary}
      disabled={files.length === 0}
      options={files.map(({ file }) => ({
        label: file.name,
        value: file.name,
      }))}
      className="h-9"
      onValueChange={(value) => {
        onChange({
          filename: value,
          url: `attachment://${transformFileName(value)}`,
        });
      }}
    >
      {t("file")}
    </ButtonSelect>
  );
};
