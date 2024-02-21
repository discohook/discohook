import {
  APIAttachment,
  APIEmbed,
  APIEmbedField,
  APIEmbedImage,
} from "discord-api-types/v10";
import { SetImageModalData } from "~/modals/ImageModal";
import { PartialResource } from "~/types/resources";
import { Gallery } from "./Gallery";
import { Markdown } from "./Markdown";

export const Embed: React.FC<{
  embed: APIEmbed;
  extraImages?: APIEmbedImage[];
  resolved?: Record<string, PartialResource>;
  setImageModalData?: SetImageModalData;
}> = ({ embed, extraImages, resolved, setImageModalData }) => {
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
        className="rounded bg-gray-100 border-l-4 border-l-gray-300 dark:bg-[#2B2D31] dark:border-l-[#1E1F22] dark:text-gray-100 inline-grid max-w-[520px] pt-2 pr-4 pb-4 pl-3"
        style={
          embed.color
            ? { borderColor: `#${embed.color.toString(16)}` }
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
                src={embed.author.icon_url}
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
                <Markdown
                  content={embed.title}
                  features="title"
                  // resolved={resolved}
                />
              </a>
            ) : (
              <Markdown
                content={embed.title}
                features="title"
                // resolved={resolved}
              />
            )}
          </div>
        )}
        {embed.description && (
          <div className="text-sm font-medium dark:font-normal mt-2 inline-block whitespace-pre-line">
            <Markdown
              content={embed.description}
              features="full"
              // resolved={resolved}
            />
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
                          features="full"
                          // resolved={resolved}
                        />
                      </div>
                      <div>
                        <Markdown
                          content={field.value}
                          features="full"
                          // resolved={resolved}
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
                    url: image.url,
                  }) as APIAttachment,
              )}
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
                    {
                      // biome-ignore lint/style/noNonNullAssertion: Checked above
                      url: embed.thumbnail!.url,
                    },
                  ],
                  startIndex: 0,
                });
              }
            }}
          >
            <img
              src={embed.thumbnail.url}
              className="rounded max-w-[80px] max-h-20"
              alt="Thumbnail"
            />
          </button>
        )}
        {embed.footer?.text && (
          <div className="min-w-0 flex mt-2">
            {embed.footer.icon_url && (
              <img
                className="h-5 w-5 mr-2 object-contain rounded-full"
                src={embed.footer.icon_url}
                alt="Footer"
              />
            )}
            <p className="font-medium text-xs text-[#313338] dark:text-primary-230 whitespace-pre-wrap inline-block my-auto">
              {embed.footer.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
