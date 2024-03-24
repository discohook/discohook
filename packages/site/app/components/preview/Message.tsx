import {
  APIAttachment,
  APIEmbed,
  APIEmbedImage,
  APIWebhook,
} from "discord-api-types/v10";
import { Trans } from "react-i18next";
import { SetImageModalData } from "~/modals/ImageModal";
import { DraftFile } from "~/routes/_index";
import { QueryData } from "~/types/QueryData";
import { PartialResource } from "~/types/resources";
import { cdn } from "~/util/discord";
import { Settings } from "~/util/localstorage";
import { MessageComponents } from "./Components";
import { Embed } from "./Embed";
import { FileAttachment } from "./FileAttachment";
import { Gallery } from "./Gallery";
import { Markdown } from "./Markdown";

export enum AuthorType {
  /** A user. */
  User = 0,
  /** A webhook. */
  Webhook = 1,
  /** A regular bot. */
  Bot = 2,
  /** A regular bot that we control. We aren't sure if we will use this. */
  ActionableBot = 3,
  /** A webhook owned by an application, but not necessarily our own
   * application. */
  ApplicationWebhook = 4,
  /** A webhook owned by our application. It is "actionable" in that we can
   * add components with custom IDs and respond to their interactions. */
  ActionableWebhook = 5,
}

export const getAuthorType = (
  discordApplicationId?: string,
  webhook?: APIWebhook,
): AuthorType => {
  if (webhook) {
    if (
      discordApplicationId &&
      webhook.application_id === discordApplicationId
    ) {
      return AuthorType.ActionableWebhook;
    } else if (webhook.application_id) {
      return AuthorType.ApplicationWebhook;
    }
  }
  // Assume we are going to send the message with a webhook
  return AuthorType.Webhook;
};

export const Message: React.FC<{
  message: QueryData["messages"][number]["data"];
  discordApplicationId?: string;
  index?: number;
  data?: QueryData;
  files?: DraftFile[];
  webhooks?: APIWebhook[];
  messageDisplay?: Settings["messageDisplay"];
  compactAvatars?: boolean;
  date?: Date;
  resolved?: Record<string, PartialResource>;
  setImageModalData?: SetImageModalData;
}> = ({
  message,
  discordApplicationId,
  index,
  data,
  files,
  webhooks,
  messageDisplay,
  compactAvatars,
  date,
  resolved,
  setImageModalData,
}) => {
  const webhook = webhooks
    ? webhooks.find((w) => w.application_id === discordApplicationId) ??
      webhooks[0]
    : undefined;
  const username = message.author?.name ?? webhook?.name ?? "Discohook";
  const avatarUrl =
    message.author?.icon_url ??
    (webhook
      ? webhook.avatar
        ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
        : cdn.defaultAvatar(5)
      : "/logos/discohook.svg");
  const badge =
    message.author?.badge === null ? null : message.author?.badge ?? "BOT";

  const lastMessage =
    data && index !== undefined ? data.messages[index - 1] : undefined;
  const showProfile = lastMessage
    ? lastMessage.data.author?.name !== message.author?.name ||
      lastMessage.data.author?.icon_url !== message.author?.icon_url
    : true;
  // To save time, display components if the user has no webhooks
  const authorType = webhook
    ? getAuthorType(discordApplicationId, webhook)
    : AuthorType.ActionableWebhook;

  const embeds: { embed: APIEmbed; extraImages: APIEmbedImage[] }[] = [];
  for (const embed of message.embeds ?? []) {
    const galleryChildren = (message.embeds ?? [])
      .filter((e) => embed.url && e.url === embed.url)
      .slice(1);
    if (galleryChildren.includes(embed)) continue;

    embeds.push({
      embed,
      extraImages: galleryChildren
        .filter((e) => !!e.image && !!e.image.url)
        // biome-ignore lint/style/noNonNullAssertion: Above
        .map((e) => e.image!),
    });
  }

  const allAttachments = [
    ...(message.attachments ?? []),
    ...(files?.map(
      ({ id, file, url }) =>
        ({
          id,
          filename: file.name,
          size: file.size,
          content_type: file.type,
          url: url ?? "#",
          proxy_url: "#",
        }) satisfies APIAttachment,
    ) ?? []),
  ];
  const fileAttachments = allAttachments.filter(
    (a) =>
      !a.content_type ||
      !["video", "image"].includes(a.content_type.split("/")[0]),
  );
  const mediaAttachments = allAttachments.filter(
    (a) =>
      a.content_type &&
      ["video", "image"].includes(a.content_type.split("/")[0]),
  );

  return (
    <div
      className={`flex dark:text-primary-230 ${
        showProfile && lastMessage ? "mt-4" : ""
      }`}
    >
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
              <Trans
                i18nKey="todayAt"
                values={{
                  time: (date ?? new Date()).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                }}
              />
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
            <div
              className="contents font-medium text-primary-600 dark:text-primary-230 dark:font-normal leading-[1.375] whitespace-pre-line"
              style={{
                // @ts-expect-error
                "--font-size": "1rem",
              }}
            >
              <Markdown
                content={message.content}
                features="full"
                // resolved={resolved}
              />
            </div>
          )}
        </div>
        <div className={messageDisplay === "compact" ? "pl-20" : ""}>
          {allAttachments.length > 0 && (
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
          {message.components && message.components.length > 0 && (
            <div className="mt-1">
              <MessageComponents
                components={message.components}
                authorType={authorType}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
