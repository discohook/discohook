import { APIEmbed, APIEmbedImage, APIWebhook } from "discord-api-types/v10";
import { SetImageModalData } from "~/modals/ImageModal";
import { QueryData } from "~/types/QueryData";
import { PartialResource } from "~/types/Resources";
import { cdn } from "~/util/discord";
import { Embed } from "./Embed";
import { FileAttachment } from "./FileAttachment";
import { Gallery } from "./Gallery";
import { Markdown } from "./Markdown";

export const Message: React.FC<{
  message: QueryData["messages"][number]["data"];
  webhook?: APIWebhook;
  compact?: boolean;
  date?: Date;
  resolved?: Record<string, PartialResource>;
  setImageModalData?: SetImageModalData;
}> = ({ message, webhook, date, resolved, setImageModalData }) => {
  const username = message.author?.name ?? webhook?.name ?? "Boogiehook",
    avatarUrl =
      message.author?.icon_url ??
      (webhook
        ? webhook.avatar
          ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
          : cdn.defaultAvatar(5)
        : "/logos/boogiehook.svg"),
    badge: string | undefined = "BOT";

  const embeds: { embed: APIEmbed; extraImages: APIEmbedImage[] }[] = [];
  for (const embed of message.embeds ?? []) {
    const galleryChildren = message
      .embeds!.filter((e) => embed.url && e.url === embed.url)
      .slice(1);
    if (galleryChildren.includes(embed)) continue;

    embeds.push({
      embed,
      extraImages: galleryChildren
        .filter((e) => !!e.image)
        .map((e) => e.image!),
    });
  }

  const fileAttachments = (message.attachments ?? []).filter(
    (a) =>
      a.content_type &&
      !["video", "image"].includes(a.content_type.split("/")[0])
  );
  const mediaAttachments = (message.attachments ?? []).filter(
    (a) =>
      a.content_type &&
      ["video", "image"].includes(a.content_type.split("/")[0])
  );

  return (
    <div className="flex">
      <div className="hidden sm:block w-fit shrink-0">
        <img
          className="rounded-full mr-3 h-10 w-10 cursor-pointer hover:shadow-lg active:translate-y-px"
          src={avatarUrl}
          alt={username}
        />
      </div>
      <div className="grow">
        <p className="leading-none h-4">
          <span className="hover:underline cursor-pointer underline-offset-1 decoration-1 font-semibold">
            {username}
          </span>
          {badge && (
            <span className="font-medium ml-1 mt-[0.75px] text-[10px] rounded px-1.5 py-px bg-blurple text-white items-center inline-flex h-4">
              {badge}
            </span>
          )}
          <span className="font-medium ml-1 cursor-default text-xs align-baseline text-[#5C5E66] dark:text-[#949BA4]">
            Today at{" "}
            {(date ?? new Date()).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </p>
        {message.content && (
          <div className="font-medium text-base leading-[1.375] whitespace-pre-wrap break-words">
            <Markdown
              text={message.content}
              features="all"
              resolved={resolved}
            />
          </div>
        )}
        {message.attachments && (
          <div className="max-w-[550px] mt-1 space-y-1">
            {fileAttachments.map((attachment) => (
              <FileAttachment
                key={`attachment-${attachment.id}`}
                attachment={attachment}
              />
            ))}
            {mediaAttachments.length > 0 && (
              <Gallery
                attachments={mediaAttachments}
                setImageModalData={setImageModalData}
              />
            )}
          </div>
        )}
        {embeds.length > 0 && (
          <div className="space-y-1 mt-1">
            {embeds.map((embedData, i) => (
              <Embed
                key={`message-preview-embed-${i}`}
                {...embedData}
                resolved={resolved}
                setImageModalData={setImageModalData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
