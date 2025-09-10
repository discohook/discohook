import type { APIEmbedField, APIEmbedImage } from "discord-api-types/v10";
import moment, { type Moment } from "moment";
import { Trans } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { SetImageModalData } from "~/modals/ImageModal";
import type { DraftFile } from "~/routes/_index";
import { LinkEmbedStrategy } from "~/types/QueryData";
import type { APIAttachment, APIEmbed } from "~/types/QueryData-raw";
import type { CacheManager } from "~/util/cache/CacheManager";
import { ATTACHMENT_URI_EXTENSIONS, transformFileName } from "~/util/files";
import { decimalToHex } from "../editor/ColorPicker";
import { Gallery } from "./Gallery";
import { Markdown } from "./Markdown";

const getI18nTimestampFooterKey = (date: Moment) => {
  const now = moment();
  const yesterday = now.clone().subtract(24, "hours");
  const tomorrow = now.clone().add(24, "hours");
  const cal = (d: Moment) => d.format("YYYY-MM-DD");
  if (cal(date) === cal(yesterday)) return "yesterday";
  else if (cal(date) === cal(now)) return "today";
  else if (cal(date) === cal(tomorrow)) return "tomorrow";
  return "other";
};

export const resolveAttachmentUri = (
  uri: string,
  files?: DraftFile[] | undefined,
  allow?: boolean | readonly string[],
) => {
  if (uri.startsWith("attachment://")) {
    const filename = uri.replace(/^attachment:\/\//, "");
    return files?.find(
      (file) =>
        transformFileName(file.file.name) === filename &&
        (allow === true
          ? true
          : (!allow ? ATTACHMENT_URI_EXTENSIONS : allow).find((ext) =>
              file.file.name.toLowerCase().endsWith(ext),
            ) !== undefined),
    );
  }
};

export const getImageUri = (
  uri: string,
  files?: DraftFile[] | undefined,
): string => {
  const file = resolveAttachmentUri(
    uri.trim(),
    files,
    ATTACHMENT_URI_EXTENSIONS,
  );
  if (file) {
    return file.url ?? "";
  } else if (!uri.startsWith("https://") && !uri.startsWith("http://")) {
    return "";
  }
  return uri;
};

// maybe also an ios & android
type PreviewPlatform = "desktop" | "mobile";

export const Embed: React.FC<{
  embed: APIEmbed;
  extraImages?: APIEmbedImage[];
  files?: DraftFile[];
  cache?: CacheManager;
  setImageModalData?: SetImageModalData;
  isLinkEmbed?: boolean;
  linkEmbedStrategy?: LinkEmbedStrategy;
  cdn?: string;
}> = ({
  embed,
  extraImages,
  files,
  cache,
  setImageModalData,
  isLinkEmbed,
  linkEmbedStrategy: linkEmbedStrategy_,
  cdn,
}) => {
  const linkEmbedStrategy = linkEmbedStrategy_ ?? LinkEmbedStrategy.Link;
  const footer: (typeof embed)["footer"] =
    linkEmbedStrategy === LinkEmbedStrategy.Mastodon
      ? embed.provider
        ? {
            text: embed.provider.name ?? "",
            // @ts-expect-error
            icon_url: embed.provider.icon_url,
          }
        : undefined
      : embed.footer;

  const fieldLines: APIEmbedField[][] = [];
  for (const field of embed.fields ?? []) {
    const currentLine = fieldLines[fieldLines.length - 1];
    if (!currentLine) {
      fieldLines.push([field]);
    } else {
      const lastField = currentLine[currentLine.length - 1];
      if (!lastField) {
        // This shouldn't happen
        continue;
      }
      if (field.inline && lastField.inline && currentLine.length < 3) {
        currentLine.push(field);
      } else {
        fieldLines.push([field]);
      }
    }
  }

  // todo: let users select this
  const platform: PreviewPlatform = "desktop";

  const images: APIEmbedImage[] = [];
  if (embed.image?.url) {
    images.push(embed.image);
  }
  if (extraImages) {
    images.push(...extraImages);
  }

  const cdnGifVideoUrl = (url: string) =>
    cdn && url.startsWith(`${cdn}/tenor/`) && url.endsWith(".gif")
      ? url.replace(/\.gif$/, ".mp4")
      : undefined;

  return (
    <div>
      <div
        className={twJoin(
          "rounded dark:text-gray-100 inline-grid pr-4 pb-4 pl-3",
          platform === "desktop"
            ? "bg-white dark:bg-background-secondary-dark border border-l-4 border-[#E2E2E4] border-l-[#D9D9DC] dark:border-[#434349] dark:border-l-[#4A4A50] pt-[2px]"
            : "bg-gray-100 dark:bg-[#2B2D31] border-l-4 border-l-gray-300 dark:border-l-[#1E1F22] pt-2",
        )}
        style={{
          ...(typeof embed.color === "number"
            ? { borderLeftColor: decimalToHex(embed.color) }
            : undefined),
          maxWidth: 520,
        }}
      >
        {(!linkEmbedStrategy || linkEmbedStrategy === LinkEmbedStrategy.Link) &&
        embed.provider?.name ? (
          <div className="min-w-0 mt-2 font-normal text-xs whitespace-break-spaces break-words text-background-secondary-dark dark:text-primary-230">
            {embed.provider.url ? (
              <a
                className="hover:underline decoration-background-text-background-secondary-dark dark:decoration-primary-230"
                href={embed.provider.url}
                target="_blank"
                rel="noreferrer nofollow ugc"
              >
                {embed.provider.name}
              </a>
            ) : (
              <span>{embed.provider.name}</span>
            )}
          </div>
        ) : null}
        {embed.author?.name && (
          <div className="min-w-0 flex mt-2">
            {embed.author.icon_url &&
              !isLinkEmbed &&
              (cdnGifVideoUrl(embed.author.icon_url) ? (
                <video
                  src={cdnGifVideoUrl(embed.author.icon_url)}
                  className="h-6 w-6 mr-2 object-contain rounded-full"
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <img
                  className="h-6 w-6 mr-2 object-contain rounded-full"
                  src={getImageUri(embed.author.icon_url, files)}
                  alt="Author"
                />
              ))}
            <p className="font-medium text-sm whitespace-pre-wrap inline-block my-auto">
              {embed.author.url ? (
                <a
                  className="hover:underline"
                  href={embed.author.url}
                  target="_blank"
                  rel="noreferrer nofollow ugc"
                >
                  {embed.author.name}
                </a>
              ) : (
                <span>{embed.author.name}</span>
              )}
            </p>
          </div>
        )}
        {embed.title && (
          <div className="text-base leading-[1.375] font-semibold mt-2 inline-block">
            {embed.url ? (
              <a
                href={embed.url}
                className="text-blue-430 dark:text-blue-345 hover:underline underline-offset-1"
                target="_blank"
                rel="noreferrer nofollow ugc"
              >
                {isLinkEmbed ? (
                  <p>{embed.title}</p>
                ) : (
                  <Markdown
                    content={embed.title}
                    features="title"
                    cache={cache}
                  />
                )}
              </a>
            ) : isLinkEmbed ? (
              <p>{embed.title}</p>
            ) : (
              <Markdown content={embed.title} features="title" cache={cache} />
            )}
          </div>
        )}
        {embed.description &&
          !(
            isLinkEmbed &&
            linkEmbedStrategy === LinkEmbedStrategy.Link &&
            embed.video
          ) && (
            <div
              className="text-sm font-normal mt-2 inline-block whitespace-pre-line"
              style={{
                // @ts-expect-error
                "--font-size": "1rem",
              }}
            >
              {isLinkEmbed ? (
                <p>{embed.description}</p>
              ) : (
                <Markdown
                  content={embed.description}
                  features="full"
                  cache={cache}
                />
              )}
            </div>
          )}
        {fieldLines.length > 0 && (
          <div className="text-sm leading-[1.125rem] grid col-start-1 col-end-2 gap-2 mt-2 min-w-0">
            {fieldLines.map((line, i) => (
              <div
                key={`message-preview-embed-fields-row-${i}`}
                className="contents"
                data-field-row-index={i}
              >
                {line.map((field, colIndex) => {
                  let inlineBound = [1, 13];
                  if (field.inline) {
                    if (line.length === 3) {
                      if (colIndex === 2) {
                        inlineBound = [9, 13];
                      } else if (colIndex === 1) {
                        inlineBound = [5, 9];
                      } else {
                        inlineBound = [1, 5];
                      }
                    } else if (line.length === 2) {
                      if (colIndex === 1) {
                        inlineBound = [7, 13];
                      } else {
                        inlineBound = [1, 7];
                      }
                    }
                  }

                  return (
                    <div
                      key={`message-preview-embed-fields-row-${i}-field-${colIndex}`}
                      data-field-subrow-index={i}
                      style={{
                        gridColumn: `${inlineBound[0]} / ${inlineBound[1]}`,
                      }}
                    >
                      <div className="font-semibold mb-px">
                        <Markdown
                          content={field.name ?? ""}
                          features="title"
                          cache={cache}
                        />
                      </div>
                      <div
                        className="font-normal whitespace-pre-line"
                        style={{
                          // @ts-expect-error
                          "--font-size": "1rem",
                        }}
                      >
                        <Markdown
                          content={field.value ?? ""}
                          features={{
                            extend: "full",
                            headings: false,
                          }}
                          cache={cache}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        {images.length > 0 && (
          <div className="mt-2">
            <Gallery
              attachments={images.map(
                (image) =>
                  ({
                    // It doesn't actually matter, we only need to know it's an image
                    content_type: image.url.endsWith(".gif")
                      ? "image/gif"
                      : "image/png",
                    url: getImageUri(image.url, files),
                  }) as APIAttachment,
              )}
              setImageModalData={setImageModalData}
              cdn={cdn}
            />
          </div>
        )}
        {embed.video?.url && (
          <div className="mt-2">
            <Gallery
              attachments={[
                {
                  content_type: "video/mp4",
                  url: embed.video.url,
                } as APIAttachment,
              ]}
              setImageModalData={setImageModalData}
            />
          </div>
        )}
        {embed.thumbnail?.url && (
          <button
            type="button"
            className="flex mt-2 ml-4 justify-self-end h-fit"
            style={{ gridArea: "1 / 2 / 8 / 3" }}
            onClick={() => {
              if (setImageModalData) {
                setImageModalData({
                  images: [
                    { url: getImageUri(embed.thumbnail?.url ?? "", files) },
                  ],
                  startIndex: 0,
                });
              }
            }}
          >
            {cdnGifVideoUrl(embed.thumbnail.url) ? (
              <video
                src={cdnGifVideoUrl(embed.thumbnail.url)}
                className="rounded max-w-[80px] max-h-20"
                autoPlay
                muted
                loop
              />
            ) : (
              <img
                src={getImageUri(embed.thumbnail.url, files)}
                className="rounded max-w-[80px] max-h-20"
                alt="Thumbnail"
              />
            )}
          </button>
        )}
        {(footer?.text ||
          (embed.timestamp &&
            linkEmbedStrategy === LinkEmbedStrategy.Mastodon)) && (
          <div className="min-w-0 flex mt-2 font-medium text-xs text-primary-600 dark:text-primary-230">
            {footer?.text && (
              <>
                {footer.icon_url &&
                  (cdnGifVideoUrl(footer.icon_url) ? (
                    <video
                      src={cdnGifVideoUrl(footer.icon_url)}
                      className="h-5 w-5 mr-2 object-contain rounded-full"
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img
                      className="h-5 w-5 mr-2 object-contain rounded-full"
                      src={getImageUri(footer.icon_url, files)}
                      alt="Footer"
                    />
                  ))}
                <p className="whitespace-pre-wrap inline-block my-auto">
                  {footer.text}
                </p>
              </>
            )}
            {embed.timestamp && (
              <>
                {footer?.text && <p className="mx-1">•</p>}
                <p className="whitespace-pre-wrap inline-block my-auto">
                  <Trans
                    i18nKey={`timestamp.footer.${getI18nTimestampFooterKey(
                      moment(embed.timestamp),
                    )}`}
                    values={{ date: new Date(embed.timestamp) }}
                  />
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
