import { APIEmbed, APIEmbedField, APIEmbedImage } from "discord-api-types/v10";
import { PartialResource } from "~/types/Resources";
import { Markdown } from "./Markdown";

export const Embed: React.FC<{
  embed: APIEmbed;
  extraImages?: APIEmbedImage[];
  resolved?: Record<string, PartialResource>;
}> = ({ embed, resolved }) => {
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

  return (
    <div>
      <div
        className="rounded bg-gray-100 border-l-4 border-l-gray-300 inline-grid max-w-[520px] pt-2 pr-4 pb-4 pl-3"
        style={
          embed.color
            ? { borderColor: `#${embed.color.toString(16)}` }
            : undefined
        }
      >
        {embed.author && embed.author.name && (
          <div className="min-w-0 flex mt-2">
            {embed.author.icon_url && (
              <img
                className="h-6 w-6 mr-2 object-contain rounded-full"
                src={embed.author.icon_url}
                alt="Author"
              />
            )}
            <p className="font-medium text-sm text-black whitespace-pre-wrap inline-block my-auto">
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
          <div className="text-base leading-[1.375] font-semibold text-black mt-2 inline-block">
            {embed.url ? (
              <a
                href={embed.url}
                className="text-[#006ce7] dark:text-[#00a8fc] hover:underline underline-offset-1"
                target="_blank"
                rel="noreferrer nofollow ugc"
              >
                <Markdown
                  text={embed.title}
                  features={["basic", "inline-code", "emojis"]}
                  resolved={resolved}
                />
              </a>
            ) : (
              <Markdown
                text={embed.title}
                features={["basic", "inline-code", "emojis"]}
                resolved={resolved}
              />
            )}
          </div>
        )}
        {embed.description && (
          <div className="text-sm font-medium text-black mt-2 inline-block whitespace-pre-line">
            <Markdown
              text={embed.description}
              features="all"
              resolved={resolved}
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
                          text={field.name}
                          features={["basic", "emojis"]}
                          resolved={resolved}
                        />
                      </div>
                      <div>
                        <Markdown
                          text={field.value}
                          features="all"
                          resolved={resolved}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
