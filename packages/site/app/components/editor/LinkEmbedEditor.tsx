import { useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import {
  LinkEmbed,
  LinkEmbedContainer,
  LinkQueryData,
} from "~/types/QueryData";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { InfoBox } from "../InfoBox";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
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
  const { data: embed, redirect_url } = embedContainer;
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
      className="group/embed rounded p-2 bg-gray-100 dark:bg-gray-800 border border-l-4 border-gray-300 dark:border-gray-700 border-l-gray-500 dark:border-l-[#1E1F22] shadow"
      open={open}
      style={
        embed.color ? { borderLeftColor: decimalToHex(embed.color) } : undefined
      }
    >
      <summary className="group-open/embed:mb-2 py-1 px-1 transition-[margin] marker:content-none marker-none flex text-lg font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/embed:rotate-90 mr-2 my-auto transition-transform"
        />
        {errors.length > 0 && (
          <CoolIcon
            icon="Circle_Warning"
            className="my-auto text-rose-600 dark:text-rose-400 mr-1.5"
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
              className="ml-2 mt-auto"
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
              className="ml-2 mt-auto"
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
                className="ml-2 mt-auto mb-1 text-xl"
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
        <button
          type="button"
          className="flex w-full cursor-pointer text-start"
          onClick={() => setColorPickerOpen((v) => !v)}
        >
          <div className="grow">
            <p className="text-sm font-medium">{t("sidebarColor")}</p>
            <p className="rounded border h-9 py-0 px-[14px] bg-gray-300 dark:border-transparent dark:bg-[#292b2f]">
              <span className="align-middle">
                {typeof embed.color === "number"
                  ? decimalToHex(embed.color)
                  : t("clickToSet")}
              </span>
            </p>
          </div>
          <div
            className="h-9 w-9 mt-auto rounded ml-2 bg-gray-500"
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
        {!!embed.video?.url && (
          <InfoBox severity="yellow" icon="Info">
            {t("linkEmbedsNoVideoAndDescription")}
          </InfoBox>
        )}
        <TextArea
          label={t("description")}
          className="w-full h-40"
          value={embed.description ?? ""}
          maxLength={356}
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
            label={t("linkEmbedsVideoUrl")}
            type="url"
            className="w-full"
            value={embed.video?.url ?? ""}
            disabled={!!embed.images?.length}
            onInput={(e) => {
              updateEmbed({
                large_images: false,
                images: undefined,
                video: e.currentTarget.value
                  ? { url: e.currentTarget.value }
                  : undefined,
              });
            }}
          />
        </div>
      </EmbedEditorSection>
    </details>
  );
};
