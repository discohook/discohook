import { Avatar } from "@base-ui-components/react/avatar";
import { APIEmbedImage, APIWebhook } from "discord-api-types/v10";
import {
  MessageFlags,
  MessageFlagsBitField,
  UserFlags,
  UserFlagsBitField,
} from "discord-bitflag";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { SetImageModalData } from "~/modals/ImageModal";
import { DraftFile } from "~/routes/_index";
import { QueryData } from "~/types/QueryData";
import type { APIAttachment, APIEmbed } from "~/types/QueryData-raw";
import { CacheManager } from "~/util/cache/CacheManager";
import { cdn, webhookAvatarUrl } from "~/util/discord";
import { Settings } from "~/util/localstorage";
import { Svg } from "../icons/Svg";
import { PostChannelIcon } from "../icons/channel";
import { MessageComponents } from "./Components";
import { Embed, getImageUri } from "./Embed";
import { FileAttachment } from "./FileAttachment";
import { Gallery } from "./Gallery";
import { Markdown } from "./Markdown";
import { MessageDivider } from "./MessageDivider.client";

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
  cache?: CacheManager;
  index?: number;
  data?: QueryData;
  files?: DraftFile[];
  webhooks?: APIWebhook[];
  messageDisplay?: Settings["messageDisplay"];
  compactAvatars?: boolean;
  date?: Date;
  setImageModalData?: SetImageModalData;
  forceSeparateAuthor?: boolean;
  isLinkEmbedEditor?: boolean;
}> = ({
  message,
  discordApplicationId,
  cache,
  index,
  data,
  files,
  webhooks,
  messageDisplay,
  compactAvatars,
  date,
  setImageModalData,
  forceSeparateAuthor,
  isLinkEmbedEditor,
}) => {
  const { t } = useTranslation();
  const webhook = webhooks
    ? webhooks.find((w) => w.application_id === discordApplicationId) ??
      webhooks[0]
    : undefined;
  const username = message.author?.name ?? webhook?.name ?? "Discohook";
  const avatarUrl =
    // This is used to discard invalid URLs. Attachment URIs are not
    // supported for avatars.
    (message.author?.icon_url ? getImageUri(message.author.icon_url) : null) ||
    (webhook
      ? webhookAvatarUrl(webhook, { size: 64 })
      : "/logos/discohook.svg");
  const badge =
    message.author?.badge === null
      ? null
      : message.author?.badge ?? t("badge.app");
  const isVerified =
    message.author?.flags &&
    new UserFlagsBitField(message.author.flags).has(UserFlags.VerifiedBot);

  const lastMessage =
    data && index !== undefined ? data.messages[index - 1] : undefined;
  const showProfile =
    !!forceSeparateAuthor ||
    (lastMessage
      ? lastMessage.data.author?.name !== message.author?.name ||
        lastMessage.data.author?.icon_url !== message.author?.icon_url
      : true) ||
    !!message.thread_name;
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
    ...(files
      ?.filter((f) => f.embed !== true)
      ?.map(
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
    <div className={twJoin("dark:text-primary-230")} dir="ltr">
      {message.thread_name && (
        <div>
          <div className="w-16 h-16 rounded-full mt-4 flex items-center justify-center bg-background-secondary dark:bg-background-secondary-dark">
            <PostChannelIcon className="w-10 h-10" />
          </div>
          <h3 className="font-medium select-text my-2 text-[32px] leading-5">
            {message.thread_name}
          </h3>
          <MessageDivider>
            {t("timestamp.date_verbose", {
              replace: { date: date ?? new Date() },
            })}
          </MessageDivider>
        </div>
      )}
      <div
        className={twJoin(
          "flex",
          showProfile && !forceSeparateAuthor && lastMessage ? "mt-4" : "",
        )}
      >
        {messageDisplay !== "compact" && (
          <div className="hidden sm:block w-fit shrink-0">
            {showProfile ? (
              <Avatar.Root className="block mr-3 cursor-pointer active:translate-y-px">
                <Avatar.Image
                  className="rounded-full h-10 w-10 hover:shadow-lg"
                  src={avatarUrl}
                  alt={username}
                />
                <Avatar.Fallback>
                  <img
                    className="rounded-full h-10 w-10 hover:shadow-lg"
                    src={cdn.defaultAvatar(0)}
                    alt={username}
                  />
                </Avatar.Fallback>
              </Avatar.Root>
            ) : (
              <div className="w-10 mr-3" />
            )}
          </div>
        )}
        <div className="grow">
          {showProfile && messageDisplay !== "compact" && (
            <p className="leading-none h-5">
              <span className="hover:underline cursor-pointer underline-offset-1 decoration-1 font-semibold dark:font-medium dark:text-[#f2f3f5] text-base">
                {username}
              </span>
              {badge && (
                <span className="font-semibold align-top ml-1 mt-[0.3em] text-[0.75rem] rounded bg-blurple text-white items-center inline-flex px-[0.275rem] h-[0.9375rem]">
                  {isVerified && (
                    <Svg
                      width={16}
                      height={16}
                      className="w-[0.9375rem] h-[0.9375rem] -ml-1 inline-block"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M18.7 7.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4l3.3 3.29 7.3-7.3a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </Svg>
                  )}
                  {badge}
                </span>
              )}
              <span className="font-medium ml-1 cursor-default text-xs align-baseline text-[#5C5E66] dark:text-[#949BA4]">
                {t("todayAt", { replace: { date: date ?? new Date() } })}
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
                  <Avatar.Root className="contents">
                    <Avatar.Image
                      className="inline-block rounded-full h-4 w-4 mr-1 -mt-1 ml-[0.1em] cursor-pointer active:translate-y-px"
                      src={avatarUrl}
                      alt={username}
                    />
                    <Avatar.Fallback>
                      <img
                        className="inline-block rounded-full h-4 w-4 mr-1 -mt-1 ml-[0.1em] cursor-pointer active:translate-y-px"
                        src={cdn.defaultAvatar(0)}
                        alt={username}
                      />
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}
                <span className="mr-1">
                  {badge && (
                    <span className="font-semibold mr-2 mt-[0.3em] text-[0.75rem] rounded bg-blurple text-white items-center inline-flex px-[0.275rem] h-[0.9375rem] indent-0">
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
                  cache={cache}
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
            {embeds.length > 0 &&
              (message.flags
                ? !new MessageFlagsBitField(BigInt(message.flags)).has(
                    MessageFlags.SuppressEmbeds,
                  )
                : true) && (
                <div className="space-y-1 mt-1">
                  {embeds.map((embedData, i) => (
                    <Embed
                      key={`message-preview-embed-${i}`}
                      {...embedData}
                      files={files}
                      setImageModalData={setImageModalData}
                      cache={cache}
                      isLinkEmbed={isLinkEmbedEditor}
                    />
                  ))}
                </div>
              )}
            {message.components && message.components.length > 0 && (
              <div className="mt-1">
                <MessageComponents
                  components={message.components}
                  authorType={authorType}
                  cache={cache}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
