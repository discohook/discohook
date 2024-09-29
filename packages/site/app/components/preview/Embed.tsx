import {
  APIAttachment,
  APIEmbed,
  APIEmbedField,
  APIEmbedImage,
} from "discord-api-types/v10";
import moment, { Moment } from "moment";
import { Trans } from "react-i18next";
import { SetImageModalData } from "~/modals/ImageModal";
import { DraftFile } from "~/routes/_index";
import { CacheManager } from "~/util/cache/CacheManager";
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
) => {
  if (uri.startsWith("attachment://")) {
    const filename = uri.replace(/^attachment:\/\//, "");
    return files?.find((file) => file.file.name === filename);
  }
};

const getImageUri = (uri: string, files?: DraftFile[] | undefined) => {
  const file = resolveAttachmentUri(uri.trim(), files);
  if (file) {
    return file.url ?? "";
  } else if (!uri.startsWith("https://") && !uri.startsWith("http://")) {
    return "";
  }
  return uri;
};

export const Embed: React.FC<{
  embed: APIEmbed;
  extraImages?: APIEmbedImage[];
  files?: DraftFile[];
  cache?: CacheManager;
  setImageModalData?: SetImageModalData;
  isLinkEmbed?: boolean;
}> = ({ embed, extraImages, files, cache, setImageModalData, isLinkEmbed }) => {
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

  const images: APIEmbedImage[] = [];
  if (embed.image?.url) {
    images.push(embed.image);
  }
  if (extraImages) {
    images.push(...extraImages);
  }

  return (
    <div>
      <div
        className="rounded bg-gray-100 border-l-4 border-l-gray-300 dark:bg-background-secondary-dark dark:border-l-[#1E1F22] dark:text-gray-100 inline-grid max-w-[520px] pt-2 pr-4 pb-4 pl-3"
        style={
          typeof embed.color === "number"
            ? { borderLeftColor: decimalToHex(embed.color) }
            : undefined
        }
      >
        {embed.provider?.name && (
          <div className="min-w-0 mt-2 font-normal text-xs whitespace-break-spaces break-words text-primary-230">
            {embed.provider.url ? (
              <a
                className="hover:underline decoration-primary-230"
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
        )}
        {embed.author?.name && (
          <div className="min-w-0 flex mt-2">
            {embed.author.icon_url && (
              <img
                className="h-6 w-6 mr-2 object-contain rounded-full"
                src={getImageUri(embed.author.icon_url, files)}
                alt="Author"
              />
            )}
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
                className="text-[#006ce7] dark:text-[#00a8fc] hover:underline underline-offset-1"
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
        {embed.description && (
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
                          content={field.name}
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
                          content={field.value}
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
            <img
              src={getImageUri(embed.thumbnail.url, files)}
              className="rounded max-w-[80px] max-h-20"
              alt="Thumbnail"
            />
          </button>
        )}
        {(embed.footer?.text || embed.timestamp) && (
          <div className="min-w-0 flex mt-2 font-medium text-xs text-primary-600 dark:text-primary-230">
            {embed.footer?.text && (
              <>
                {embed.footer.icon_url && (
                  <img
                    className="h-5 w-5 mr-2 object-contain rounded-full"
                    src={getImageUri(embed.footer.icon_url, files)}
                    alt="Footer"
                  />
                )}
                <p className="whitespace-pre-wrap inline-block my-auto">
                  {embed.footer.text}
                </p>
              </>
            )}
            {embed.timestamp && (
              <>
                {embed.footer?.text && <p className="mx-1">•</p>}
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
