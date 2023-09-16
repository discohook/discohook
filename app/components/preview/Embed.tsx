import { APIEmbed, APIEmbedImage } from "discord-api-types/v10";
import { PartialResource } from "~/types/Resources";
import { Markdown } from "./Markdown";

export const Embed: React.FC<{
  embed: APIEmbed;
  extraImages?: APIEmbedImage[];
  resolved?: Record<string, PartialResource>;
}> = ({ embed, resolved }) => {
  return (
    <div
      className="rounded bg-gray-100 border-l-4 border-l-gray-300 grid max-w-[520px] pt-2 pr-4 pb-4 pl-3"
      style={
        embed.color
          ? { borderColor: `#${embed.color.toString(16)}` }
          : undefined
      }
    >
      {embed.author && (
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
        <div className="text-base font-semibold text-black mt-2 inline-block">
          {embed.url ? (
            <a href={embed.url} className="text-[#006ce7] dark:text-[#00a8fc] hover:underline underline-offset-1" target="_blank" rel="noreferrer nofollow ugc">
              <Markdown text={embed.title} features={["basic", "inline-code"]} />
            </a>
          ) : (
            <Markdown text={embed.title} features={["basic", "inline-code"]} />
          )}
        </div>
      )}
      {embed.description && (
        <div className="text-sm font-medium text-black mt-2 inline-block whitespace-pre-line">
          <Markdown text={embed.description} features="all" />
        </div>
      )}
    </div>
  );
};
