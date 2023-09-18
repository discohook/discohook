import { APIEmbed, APIEmbedImage } from "discord-api-types/v10";
import { PartialResource } from "~/types/Resources";
import { Markdown } from "./Markdown";

export const Embed: React.FC<{
  embed: APIEmbed;
  extraImages?: APIEmbedImage[];
  resolved?: Record<string, PartialResource>;
}> = ({ embed, resolved }) => {
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
        {embed.fields && embed.fields.length > 0 && (
          <div className="text-sm leading-[1.125rem] grid col-start-1 col-end-2 gap-2 mt-2 min-w-0">
            {embed.fields.map((field, i) => {
              let inlineBound = [1, 13];
              if (field.inline) {
                const fields = embed.fields!;
                const beforeLast = fields[i - 2],
                  last = fields[i - 1],
                  next = fields[i + 1],
                  afterNext = fields[i + 2];

                if (last?.inline && beforeLast?.inline) {
                  inlineBound = [9, 13];
                } else if (last?.inline && !next?.inline) {
                  inlineBound = [7, 13];
                } else if (next?.inline && afterNext?.inline) {
                  inlineBound = [1, 5];
                } else if (last?.inline && next?.inline) {
                  inlineBound = [5, 9];
                } else if (next?.inline && !afterNext?.inline) {
                  inlineBound = [1, 7];
                }
              }

              return (
                <div
                  key={`message-preview-embed-field-${i}`}
                  className="min-w-0"
                  data-field-index={i}
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
        )}
      </div>
    </div>
  );
};
