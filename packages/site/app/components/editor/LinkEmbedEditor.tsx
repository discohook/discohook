import { useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import {
  LinkEmbed,
  LinkEmbedContainer,
  LinkEmbedStrategy,
  LinkQueryData,
} from "~/types/QueryData";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { InfoBox } from "../InfoBox";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import DatePicker from "../pickers/DatePicker";
import { PickerOverlayWrapper } from "../pickers/PickerOverlayWrapper";
import {
  ColorPicker,
  decimalToHex,
  decimalToRgb,
  rgbToDecimal,
} from "./ColorPicker";
import { EmbedEditorSection } from "./EmbedEditor";

export const getEmbedText = (embed: LinkEmbed): string | undefined =>
  embed.provider?.name ||
  embed.author?.name ||
  embed.title ||
  embed.description;

export const getEmbedLength = (embed: LinkEmbed) => {
  const totalCharacters =
    (embed.title ?? "").length +
    (embed.description ?? "").length +
    (embed.author?.name ?? "").length +
    (embed.provider?.name ?? "").length;

  return totalCharacters;
};

export const getEmbedErrors = (embed: LinkEmbed) => {
  const errors: string[] = [];

  const totalCharacters = getEmbedLength(embed);
  if (totalCharacters === 0 && !embed.images?.[0]?.url && !embed.video?.url) {
    errors.push("embedEmpty");
  }

  return errors;
};

export const LinkEmbedEditor: React.FC<{
  embed: LinkEmbedContainer;
  data: LinkQueryData;
  setData: React.Dispatch<React.SetStateAction<LinkQueryData>>;
  open?: boolean;
}> = ({ embed: embedContainer, data, setData, open }) => {
  const { data: embed, redirect_url: _ } = embedContainer;
  const strategy = embed.strategy ?? LinkEmbedStrategy.Link;

  const { t } = useTranslation();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const updateEmbed = (partialEmbed: Partial<LinkEmbed>) => {
    if (
      partialEmbed.provider &&
      !partialEmbed.provider.name &&
      !partialEmbed.provider.url
    ) {
      partialEmbed.provider = undefined;
    }
    if (
      partialEmbed.author &&
      !partialEmbed.author.name &&
      !partialEmbed.author.icon_url &&
      !partialEmbed.author.url
    ) {
      partialEmbed.author = undefined;
    }

    embedContainer.data = { ...embed, ...partialEmbed };
    setData({ ...data });
  };

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
        <span className="truncate">{t("embed")}</span>
      </summary>
      {errors.length > 0 && (
        <div className="-mt-1 mb-1">
          <InfoBox severity="red" icon="Circle_Warning">
            {errors.map((k) => t(k)).join("\n")}
          </InfoBox>
        </div>
      )}
      {strategy === "link" ? (
        <EmbedEditorSection name={t("provider")} open={open}>
          <div className="flex">
            <div className="grow">
              <TextArea
                label={t("name")}
                className="w-full"
                maxLength={256}
                value={embed.provider?.name ?? ""}
                short
                onInput={(e) =>
                  updateEmbed({
                    provider: {
                      ...(embed.provider ?? {}),
                      name: e.currentTarget.value,
                    },
                  })
                }
              />
            </div>
            {embed.provider?.url === undefined && (
              <Button
                className="ltr:ml-2 rtl:mr-2 mt-auto h-9"
                onClick={() =>
                  updateEmbed({
                    provider: {
                      ...(embed.provider ?? { name: "" }),
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
            {embed.provider?.url !== undefined && (
              <div className="flex">
                <div className="grow">
                  <TextInput
                    label={t("providerUrl")}
                    className="w-full"
                    type="url"
                    value={embed.provider?.url ?? ""}
                    onInput={(e) =>
                      updateEmbed({
                        provider: {
                          ...(embed.provider ?? { name: "" }),
                          url: e.currentTarget.value,
                        },
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="ml-2 mt-auto mb-1 text-xl"
                  onClick={() =>
                    updateEmbed({
                      provider: {
                        ...(embed.provider ?? { name: "" }),
                        url: undefined,
                      },
                    })
                  }
                >
                  <CoolIcon icon="Close_MD" />
                </button>
              </div>
            )}
          </div>
        </EmbedEditorSection>
      ) : null}
      <hr className="border border-gray-500/20" />
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
          </div>
        </div>
      </EmbedEditorSection>
      <hr className="border border-gray-500/20" />
      <EmbedEditorSection name={t("body")} open={open}>
        <div className="flex">
          <div className="grow">
            <TextArea
              label={t("title")}
              className="w-full"
              maxLength={256}
              value={embed.title ?? ""}
              short
              onInput={(e) =>
                updateEmbed({
                  title: e.currentTarget.value || undefined,
                })
              }
            />
          </div>
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            className="flex cursor-pointer text-start"
            onClick={() => setColorPickerOpen((v) => !v)}
          >
            <div className="grow">
              <p className="text-sm font-medium">{t("sidebarColor")}</p>
              <p className="rounded-lg border h-9 py-0 px-[14px] bg-white border-border-normal dark:bg-[#333338] dark:border-border-normal-dark">
                <span className="align-middle">
                  {typeof embed.color === "number"
                    ? decimalToHex(embed.color)
                    : t("clickToSet")}
                </span>
              </p>
            </div>
            <div
              className="h-9 w-9 mt-auto rounded-lg ltr:ml-2 rtl:mr-2 bg-gray-500"
              style={{
                backgroundColor:
                  typeof embed.color === "number"
                    ? decimalToHex(embed.color)
                    : undefined,
              }}
            />
          </button>
          <PickerOverlayWrapper
            open={colorPickerOpen}
            setOpen={setColorPickerOpen}
            containerClassName="ltr:right-0 rtl:left-0 top-0"
          >
            <ColorPicker
              t={t}
              color={
                typeof embed.color === "number"
                  ? decimalToRgb(embed.color)
                  : undefined
              }
              onChange={(color) => {
                updateEmbed({ color: rgbToDecimal(color.rgb) });
              }}
              onReset={() => {
                updateEmbed({ color: undefined });
              }}
            />
          </PickerOverlayWrapper>
        </div>
        <TextArea
          label={t("description")}
          className="w-full h-40"
          value={embed.description ?? ""}
          maxLength={strategy === LinkEmbedStrategy.Mastodon ? 4096 : 356}
          // markdown="full"
          onInput={(e) =>
            updateEmbed({
              description: e.currentTarget.value || undefined,
            })
          }
        />
      </EmbedEditorSection>
      <hr className="border border-gray-500/20" />
      <EmbedEditorSection name={t("images")} open={open}>
        {embed.video?.url ? (
          <InfoBox severity="yellow" icon="Triangle_Warning">
            {t("linkEmbedsNoVideoAndImage")}
          </InfoBox>
        ) : (
          <InfoBox icon="Info">{t("linkEmbedsImageLimit")}</InfoBox>
        )}
        <Checkbox
          label={t("useLargeImages")}
          checked={embed.large_images ?? false}
          disabled={!embed.images?.length && !!embed.video?.url}
          onChange={(e) =>
            updateEmbed({ large_images: e.currentTarget.checked })
          }
        />
        <div>
          <div className="space-y-1">
            {(embed.images ?? [])
              .slice(0, embed.large_images ? undefined : 1)
              .map((img, i) => (
                <div className="flex">
                  <div className="grow">
                    <TextInput
                      label={i === 0 ? t("url") : ""}
                      type="url"
                      className="w-full"
                      value={img.url ?? ""}
                      disabled={!img.url && !!embed.video?.url}
                      onInput={(e) => {
                        embed.images?.splice(i, 1, {
                          url: e.currentTarget.value,
                        });
                        updateEmbed({ images: embed.images });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={twJoin(
                      "ml-1 rounded border min-h-[36px] max-h-9 pb-0 pt-0.5 px-2 bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] hover:text-red-400 transition",
                      i === 0 ? "mt-5" : "",
                    )}
                    onClick={() => {
                      embed.images?.splice(i, 1);
                      updateEmbed({ images: embed.images });
                    }}
                  >
                    <CoolIcon icon="Trash_Full" />
                  </button>
                </div>
              ))}
          </div>
          <Button
            className="mt-2"
            disabled={
              // Unsure if Discord will allow up to 10 in the future
              // Currently, 4 image tags will show up Twitter-style on
              // the Desktop client, and just 1 on mobile

              // Allow one thumbnail or four large images
              (embed.images
                ? embed.large_images
                  ? embed.images.length >= 4
                  : embed.images.length >= 1
                : false) ||
              // Do not allow any images when there is a video
              !!embed.video?.url
            }
            onClick={() =>
              updateEmbed({
                images: [...(embed.images ?? []), { url: "" }],
              })
            }
          >
            {t("addImage")}
          </Button>
        </div>
      </EmbedEditorSection>
      <hr className="border border-gray-500/20" />
      <EmbedEditorSection name={t("video")} open={open}>
        {!!embed.images?.length && (
          <InfoBox severity="yellow" icon="Triangle_Warning">
            {t("linkEmbedsNoImagesAndVideo")}
          </InfoBox>
        )}
        <div>
          <TextInput
            label={t(
              strategy === LinkEmbedStrategy.Mastodon
                ? "linkEmbedsVideoUrlDirect"
                : "linkEmbedsVideoUrl",
            )}
            type="url"
            className="w-full"
            value={embed.video?.url ?? ""}
            disabled={!!embed.images?.length}
            onInput={async (e) => {
              const url = e.currentTarget.value;
              updateEmbed({
                large_images: false,
                images: undefined,
                video: url ? { url } : undefined,
              });
              const oldSizers = document.querySelectorAll("video.sizer");
              for (const el of oldSizers) el.remove();

              // Get height and width automatically
              if (url) {
                // We would use the preview video here but it's not always rendered
                const element = document.createElement("video");
                element.className = "sizer";
                element.src = url;
                element.style.opacity = "0";
                element.style.top = "0";
                element.style.left = "0";
                element.style.position = "absolute";
                element.addEventListener("loadedmetadata", (e) => {
                  if (!e.target) return;
                  const { videoHeight, videoWidth } =
                    e.target as HTMLVideoElement;
                  updateEmbed({
                    video: {
                      url,
                      height: videoHeight,
                      width: videoWidth,
                    },
                  });
                  element.remove();
                });
                document.appendChild(element);
              }
            }}
          />
          {/* <div className="">
            <TextInput
              label={t("width")}
              className="w-full"
              value={embed.video?.width ?? ""}
              disabled
            />
            <TextInput
              label={t("height")}
              className="w-full"
              value={embed.video?.height ?? ""}
              disabled
            />
          </div> */}
        </div>
      </EmbedEditorSection>
      <hr className="border border-gray-500/20" />
      {strategy === "mastodon" ? (
        <EmbedEditorSection name={t("footer")} open={open}>
          <div className="flex">
            <div className="grow">
              <TextArea
                label={t("text")}
                className="w-full"
                maxLength={2048}
                required
                value={embed.provider?.name ?? ""}
                short
                onInput={(e) =>
                  updateEmbed({
                    provider: {
                      ...(embed.provider ?? {}),
                      name: e.currentTarget.value,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="grow">
              <TextInput
                label={t("iconUrl")}
                className="w-full"
                type="url"
                value={embed.provider?.icon_url ?? ""}
                onInput={({ currentTarget }) =>
                  updateEmbed({
                    provider: {
                      ...(embed.provider ?? { text: "" }),
                      icon_url: currentTarget.value,
                    },
                  })
                }
              />
            </div>
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
      ) : null}
    </details>
  );
};
