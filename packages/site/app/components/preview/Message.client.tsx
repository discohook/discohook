import { Avatar } from "@base-ui-components/react/avatar";
import { Tooltip } from "@base-ui-components/react/tooltip";
import type { APIEmbedImage, APIWebhook } from "discord-api-types/v10";
import {
  MessageFlags,
  MessageFlagsBitField,
  UserFlags,
  UserFlagsBitField,
} from "discord-bitflag";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import type { SetImageModalData } from "~/modals/ImageModal";
import { Target } from "~/modals/MessageSendModal";
import { getGenericTargetInfo } from "~/modals/TargetAddModal";
import type { DraftFile } from "~/routes/_index";
import type { LinkEmbedStrategy, QueryData } from "~/types/QueryData";
import {
  TargetType,
  type APIAttachment,
  type APIEmbed,
} from "~/types/QueryData-raw";
import type { CacheManager } from "~/util/cache/CacheManager";
import { cdn, isComponentsV2 } from "~/util/discord";
import type { Settings } from "~/util/localstorage";
import { PostChannelIcon } from "../icons/channel";
import { SilentMessageIcon } from "../icons/message";
import { Svg } from "../icons/Svg";
import { AutoTopLevelComponentPreview } from "./Container";
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

export const UsernameBadge = ({
  label,
  verified,
  className,
}: {
  label: string;
  verified?: boolean;
  className?: string;
}) => (
  <span
    className={twMerge(
      "font-semibold align-top ml-1 mt-[0.3em] text-[0.75rem] rounded bg-blurple text-white items-center inline-flex px-[0.275rem] h-[0.9375rem]",
      className,
    )}
  >
    {verified ? (
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
    ) : null}
    {label}
  </span>
);

const SilentMessageBadge = () => (
  <Tooltip.Provider delay={0}>
    <Tooltip.Root>
      <Tooltip.Trigger
        aria-label="This is a @silent message."
        className="m-0 inline-flex h-4 w-4 shrink-0 items-center justify-center border-0 bg-transparent p-0 align-middle leading-none text-inherit appearance-none"
      >
        <SilentMessageIcon />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner
          sideOffset={10}
          side="top"
          align="center"
          className="z-40"
        >
          <Tooltip.Popup
            className={twJoin(
              "relative overflow-visible flex origin-[var(--transform-origin)] rounded-lg px-2 py-1 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[instant]:duration-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0",
              "bg-gray-50 dark:bg-gray-800 outline outline-1 outline-gray-200 dark:outline-gray-600",
              "shadow-lg dark:shadow-none dark:-outline-offset-1",
            )}
          >
            <Tooltip.Arrow
              className="pointer-events-none z-10 block"
              style={{
                top: "auto",
                bottom: "-6px",
              }}
            >
              <svg
                width="18"
                height="8"
                viewBox="0 0 18 8"
                aria-hidden="true"
                className="block"
              >
                <path
                  d="M1 1H17L10.8 6.4C9.77 7.29 8.23 7.29 7.2 6.4L1 1Z"
                  className="fill-gray-50 dark:fill-gray-800"
                />
                <path
                  d="M1 1L7.2 6.4C8.23 7.29 9.77 7.29 10.8 6.4L17 1"
                  className="stroke-gray-200 dark:stroke-gray-600"
                  fill="none"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
            </Tooltip.Arrow>
            <p className="text-sm font-medium">
              This is a @silent message.
            </p>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

export const Message: React.FC<{
  message: QueryData["messages"][number]["data"];
  discordApplicationId?: string;
  cache?: CacheManager;
  index?: number;
  data?: QueryData;
  files?: DraftFile[];
  targets?: Target[];
  messageDisplay?: Settings["messageDisplay"];
  compactAvatars?: boolean;
  date?: Date;
  setImageModalData?: SetImageModalData;
  forceSeparateAuthor?: boolean;
  ignoreScreenSize?: boolean;
  isLinkEmbedEditor?: boolean;
  linkEmbedStrategies?: LinkEmbedStrategy[];
  cdn?: string;
}> = ({
  message,
  discordApplicationId,
  cache,
  index,
  data,
  files,
  targets,
  messageDisplay,
  compactAvatars,
  date,
  setImageModalData,
  forceSeparateAuthor,
  ignoreScreenSize,
  isLinkEmbedEditor,
  linkEmbedStrategies,
  cdn: cdnOrigin,
}) => {
  const { t } = useTranslation();

  const profile = useMemo(() => {
    const preferredTarget = targets?.find(
      (target) =>
        target.type === TargetType.Webhook &&
        discordApplicationId !== undefined &&
        target.webhook.application_id === discordApplicationId,
    );
    return preferredTarget
      ? getGenericTargetInfo(preferredTarget)
      : targets?.length
        ? getGenericTargetInfo(targets[0])
        : null;
  }, [targets, discordApplicationId]);

  const username = message.username ?? profile?.name ?? "Discohook";
  // Trim out obviously bad data before attempting to load the image
  const avatarUrl =
    (message.avatar_url
      ? cdnOrigin &&
        message.avatar_url.startsWith(`${cdnOrigin}/tenor/`) &&
        message.avatar_url.endsWith(".gif")
        ? // You can attempt to send a GIF, but it will be static. We preview
          // the thumbnail (for tenor) so people don't think there's something
          // wrong.
          message.avatar_url.replace(/\.gif$/, ".png")
        : // Discards attachment URIs, which are not supported for avatars
          getImageUri(message.avatar_url)
      : null) ||
    profile?.avatar?.src ||
    "/logos/discohook.svg";
  const badge =
    message.author?.badge === null
      ? null
      : (message.author?.badge ?? t("badge.app"));
  const isVerified =
    message.author?.flags &&
    new UserFlagsBitField(message.author.flags).has(UserFlags.VerifiedBot);
  const flags = new MessageFlagsBitField(BigInt(message.flags ?? 0));
  const isSilent = flags.has(MessageFlags.SuppressNotifications);

  const lastMessage =
    data && index !== undefined ? data.messages[index - 1] : undefined;
  const showProfile =
    !!forceSeparateAuthor ||
    (lastMessage
      ? lastMessage.data.username !== message.username ||
        lastMessage.data.avatar_url !== message.avatar_url
      : true) ||
    !!message.thread_name;
  // To save time, display components if the user has no webhooks
  // const authorType = webhook
  //   ? getAuthorType(discordApplicationId, webhook)
  //   : AuthorType.ActionableWebhook;

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

  // Attachments are only to be shown in CV2 messages when explicitly placed
  // in galleries or with the file component
  const allAttachments = isComponentsV2(message)
    ? []
    : [
        ...(message.attachments ?? []),
        ...(files
          ?.filter((f) => f.embed !== true && f.is_thumbnail !== true)
          ?.map(
            ({ id, file, url, duration_secs }) =>
              ({
                id,
                filename: file.name,
                size: file.size,
                content_type: file.type,
                url: url ?? "#",
                proxy_url: "#",
                duration_secs,
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
  const threadThumbnailFile = files?.find((f) => f.is_thumbnail);

  return (
    <div className={twJoin("dark:text-primary-230")} dir="ltr">
      {
        // Show forum header when there is a thread name OR there is a
        // thread ID and post thumbnail file (thus editing the starter
        // message)
        message.thread_name ||
        (!!data &&
          index !== undefined &&
          !!data.messages[index]?.thread_id &&
          !!threadThumbnailFile) ? (
          <div>
            <div className="flex">
              <div className="shrink-0">
                <div className="w-16 h-16 rounded-full mt-4 flex items-center justify-center bg-background-secondary dark:bg-background-secondary-dark">
                  <PostChannelIcon className="w-10 h-10" />
                </div>
                <h3 className="font-medium select-text my-2 text-[32px] leading-5">
                  {message.thread_name || t("thread")}
                </h3>
              </div>
              {threadThumbnailFile?.url &&
              threadThumbnailFile.file.type.startsWith("image/") ? (
                <div
                  className="ml-auto mt-auto rounded-md h-20 aspect-video bg-cover bg-center shadow"
                  style={{ backgroundImage: `url(${threadThumbnailFile.url})` }}
                />
              ) : null}
            </div>
            <MessageDivider>
              {t("timestamp.date_verbose", {
                replace: { date: date ?? new Date() },
              })}
            </MessageDivider>
          </div>
        ) : null
      }
      <div
        className={twJoin(
          "flex",
          showProfile && !forceSeparateAuthor && lastMessage ? "mt-4" : "",
        )}
      >
        {messageDisplay !== "compact" && (
          <div
            className={twJoin(
              "w-fit shrink-0",
              !ignoreScreenSize ? "hidden sm:block" : undefined,
            )}
          >
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
              {badge ? (
                <UsernameBadge label={badge} verified={isVerified} />
              ) : null}
              <span className="ml-1 inline-flex items-center gap-1 align-baseline font-medium text-xs text-[#5C5E66] dark:text-[#949BA4]">
                <span className="cursor-default">
                  {t("todayAt", { replace: { date: date ?? new Date() } })}
                </span>
              </span>
              {isSilent && <span className="ml-1"><SilentMessageBadge /></span>}
            </p>
          )}
          <div
            className={
              messageDisplay === "compact" ? "relative pl-20 -indent-16" : ""
            }
          >
            {messageDisplay === "compact" && (
              <h3 className="flex gap-0.5 items-center">
                <div className="inline text-base ">
                <span className="mr-1 h-5 break-words align-baseline font-medium text-[11px] leading-[22px] text-[#5C5E66] dark:text-[#949BA4]">
                  <span className="cursor-default">
                    {(date ?? new Date()).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
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
                  </div>
                {isSilent && <SilentMessageBadge />}
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
                    isVoiceMessage={flags.has(MessageFlags.IsVoiceMessage)}
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
            {embeds.length > 0 && !flags.has(MessageFlags.SuppressEmbeds) && (
              <div className="space-y-1 mt-1">
                {embeds.map((embedData, i) => (
                  <Embed
                    key={`message-preview-embed-${i}`}
                    {...embedData}
                    files={files}
                    setImageModalData={setImageModalData}
                    cache={cache}
                    isLinkEmbed={isLinkEmbedEditor}
                    linkEmbedStrategy={linkEmbedStrategies?.[i]}
                    cdn={cdnOrigin}
                  />
                ))}
              </div>
            )}
            {message.components && message.components.length > 0 && (
              <div
                // id={`message-accessories-${mid}`}
                className={twJoin(
                  "grid grid-flow-row h-fit min-h-0 min-w-0 py-0.5 relative indent-0",
                  "gap-y-1 [grid-template-columns:repeat(auto-fill,_minmax(100%,_1fr))]",
                  // Should do something more elegant than this
                  !isComponentsV2(message) ? "mt-1" : undefined,
                )}
              >
                <div className="w-full">
                  <div className="flex flex-col items-stretch max-w-[min(600px,_100%)] gap-y-1.5 w-fit overflow-hidden">
                    {message.components.map((component, i) => (
                      <AutoTopLevelComponentPreview
                        key={`top-level-component-${i}`}
                        component={component}
                        cache={cache}
                        files={files}
                        setImageModalData={setImageModalData}
                        cdn={cdnOrigin}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
