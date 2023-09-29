import { APIEmbed, APIEmbedImage, APIWebhook } from "discord-api-types/v10";
import LocalizedStrings from "react-localization";
import { SetImageModalData } from "~/modals/ImageModal";
import { QueryData } from "~/types/QueryData";
import { PartialResource } from "~/types/resources";
import { cdn } from "~/util/discord";
import { Settings } from "~/util/localstorage";
import { Embed } from "./Embed";
import { FileAttachment } from "./FileAttachment";
import { Gallery } from "./Gallery";
import { Markdown } from "./Markdown";

const strings = new LocalizedStrings({
  en: {
    todayAt: "Today at {0}",
  },
  fr: {
    todayAt: "Aujourd’hui à {0}",
  },
  es: {
    todayAt: "hoy a las {0}",
  },
  de: {
    todayAt: "heute um {0} Uhr",
  },
});

export const Message: React.FC<{
  message: QueryData["messages"][number]["data"];
  index?: number;
  data?: QueryData;
  webhook?: APIWebhook;
  messageDisplay?: Settings["messageDisplay"];
  compactAvatars?: boolean;
  date?: Date;
  resolved?: Record<string, PartialResource>;
  setImageModalData?: SetImageModalData;
}> = ({
  message,
  index,
  data,
  webhook,
  messageDisplay,
  compactAvatars,
  date,
  resolved,
  setImageModalData,
}) => {
  const username = message.author?.name ?? webhook?.name ?? "Boogiehook",
    avatarUrl =
      message.author?.icon_url ??
      (webhook
        ? webhook.avatar
          ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
          : cdn.defaultAvatar(5)
        : "/logos/boogiehook.svg"),
    badge: string | undefined = "BOT";

  const lastMessage =
    data && index !== undefined ? data.messages[index - 1] : undefined;
  const showProfile = lastMessage
    ? lastMessage.data.author?.name !== message.author?.name ||
      lastMessage.data.author?.icon_url !== message.author?.icon_url
    : true;

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
    <div className={`flex ${showProfile && lastMessage ? "mt-4" : ""}`}>
      {messageDisplay !== "compact" && (
        <div className="hidden sm:block w-fit shrink-0">
          {showProfile ? (
            <img
              className="rounded-full mr-3 h-10 w-10 cursor-pointer hover:shadow-lg active:translate-y-px"
              src={avatarUrl}
              alt={username}
            />
          ) : (
            <div className="w-10 mr-3" />
          )}
        </div>
      )}
      <div className="grow">
        {showProfile && messageDisplay !== "compact" && (
          <p className="leading-none h-4">
            <span className="hover:underline cursor-pointer underline-offset-1 decoration-1 font-semibold dark:font-medium dark:text-[#f2f3f5]">
              {username}
            </span>
            {badge && (
              <span className="font-medium ml-1 mt-[0.75px] text-[10px] rounded px-1.5 py-px bg-blurple text-white items-center inline-flex h-4">
                {badge}
              </span>
            )}
            <span className="font-medium ml-1 cursor-default text-xs align-baseline text-[#5C5E66] dark:text-[#949BA4]">
              {strings.formatString(
                strings.todayAt,
                (date ?? new Date()).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })
              )}
            </span>
          </p>
        )}
        <div
          className={
            messageDisplay === "compact" ? "relative pl-20 -indent-16" : ""
          }
        >
          {messageDisplay === "compact" && (
            <h3 className="inline text-base">
              <span className="font-medium mr-1 h-5 text-[11px] leading-[22px] break-words cursor-default align-baseline text-[#5C5E66] dark:text-[#949BA4]">
                {(date ?? new Date()).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              {compactAvatars && (
                <img
                  className="inline-block rounded-full -mt-1 ml-[0.1em] mr-1 h-4 w-4 cursor-pointer active:translate-y-px"
                  src={avatarUrl}
                  alt={username}
                />
              )}
              <span className="mr-1">
                {badge && (
                  <span className="font-medium mr-1 text-[10px] rounded mt-px px-1.5 py-px bg-blurple text-white items-center inline-flex h-4 indent-0">
                    {badge}
                  </span>
                )}
                <span className="hover:underline cursor-pointer underline-offset-1 decoration-1 font-semibold dark:font-medium dark:text-[#f2f3f5]">
                  {username}
                </span>
              </span>
            </h3>
          )}
          {message.content && (
            <div className="contents markdown-container font-medium dark:font-normal text-base leading-[1.375] whitespace-pre-wrap break-words">
              <Markdown
                text={message.content}
                features="all"
                resolved={resolved}
              />
            </div>
          )}
        </div>
        <div className={messageDisplay === "compact" ? "pl-20" : ""}>
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
    </div>
  );
};
