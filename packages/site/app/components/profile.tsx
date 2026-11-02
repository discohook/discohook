import { Avatar } from "@base-ui/react/avatar";
import {
  UserFlags,
  type APIGuildMember,
  type APIUser,
} from "discord-api-types/v10";
import { UserFlagsBitField } from "discord-bitflag";
import { twJoin } from "tailwind-merge";
import type { TFunction } from "~/types/i18next";
import type { CacheManager } from "~/util/cache/CacheManager";
import { cdn, cdnImgAttributes } from "~/util/discord";
import { getUserAvatar } from "~/util/users";
import { Markdown, type FeatureConfig } from "./preview/Markdown";
import { UsernameBadge } from "./preview/Message.client";

export const bioMarkdownFeatures: FeatureConfig = {
  paragraphs: true,
  breaks: true,
  text: true,
  customEmojis: true,
  unicodeEmojis: true,
  autoLinks: true,
  italic: true,
  bold: true,
  underline: true,
  strikethrough: true,
  channelMentions: true,
  guildSectionMentions: true,
  commandMentions: true, // sort of? they are parsed but not clickable
  blockQuotes: true,
  inlineCode: true, // block code is sort of supported but not properly
  spoilers: true,
  timestamps: true,
};

export const ProfilePreview = ({
  t,
  user,
  member,
  avatarURL: overrideAvatarURL,
  bannerURL: overrideBannerURL,
  cache,
  setAvatarObjectURL,
  setBannerObjectURL,
}: {
  t: TFunction;
  user: Pick<
    APIUser,
    | "id"
    | "username"
    | "global_name"
    | "discriminator"
    | "avatar"
    | "banner"
    | "bot"
    | "public_flags"
  >;
  member?: Pick<APIGuildMember, "nick" | "avatar" | "banner"> & {
    guild_id: string;
    bio?: string | null;
  };
  avatarURL?: string;
  bannerURL?: string;
  cache?: CacheManager;
  setAvatarObjectURL?: (url: string | null) => void;
  setBannerObjectURL?: (url: string | null) => void;
}) => {
  const flags = new UserFlagsBitField(BigInt(user.public_flags ?? 0));

  const bannerURL =
    overrideBannerURL ??
    (member?.banner
      ? cdn.guildMemberBanner(member.guild_id, user.id, member.banner, {
          size: 512,
        })
      : user.banner
        ? cdn.banner(user.id, user.banner)
        : undefined);

  const avatarBorderClassName =
    "box-border border-4 border-white dark:border-gray-800";
  const avatarClassName = twJoin("rounded-full size-20", avatarBorderClassName);
  return (
    <div
      dir="ltr" // discord doesn't support RTL
      className={twJoin(
        "rounded-lg w-64 shadow-lg bg-white dark:bg-gray-800",
        "box-border gap-2 pb-2 flex flex-col overflow-hidden",
        "border border-border-normal dark:border-border-normal-dark",
      )}
    >
      <div
        id="profile-banner"
        className={twJoin(
          "bg-gray-100 dark:bg-gray-900",
          "bg-cover bg-center w-full rounded-t-lg relative",
          bannerURL ? "h-[6.5rem]" : "h-14",
        )}
        style={{
          backgroundImage: bannerURL ? `url(${bannerURL})` : "",
        }}
      >
        {setBannerObjectURL ? (
          <>
            <input
              name="banner"
              hidden
              readOnly
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={(e) => {
                const files = e.currentTarget.files;
                if (!files) return;

                const file = files[0];
                if (!file.type.startsWith("image/")) {
                  e.currentTarget.value = "";
                  return;
                }

                setBannerObjectURL(URL.createObjectURL(file));
              }}
            />
            <button
              type="button"
              className="absolute inset-0 w-full h-full box-border rounded-t-lg bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => {
                const el = document.querySelector<HTMLInputElement>(
                  "#profile-banner>input",
                );
                el?.click();
              }}
            />
          </>
        ) : null}
      </div>
      <div className="px-4">
        <div className="flex flex-row">
          {/* Negative top margin should be half of the avatar height */}
          <Avatar.Root id="profile-avatar" className="-mt-10 relative">
            {overrideAvatarURL ? (
              <Avatar.Image
                src={overrideAvatarURL}
                className={twJoin(avatarClassName, "object-cover")}
              />
            ) : member?.avatar ? (
              <Avatar.Image
                {...cdnImgAttributes(128, (size) =>
                  cdn.guildMemberAvatar(
                    member.guild_id,
                    user.id,
                    // biome-ignore lint/style/noNonNullAssertion: above
                    member.avatar!,
                    { size },
                  ),
                )}
                className={avatarClassName}
              />
            ) : user.avatar ? (
              <Avatar.Image
                {...cdnImgAttributes(128, (size) =>
                  // biome-ignore lint/style/noNonNullAssertion: above
                  cdn.avatar(user.id, user.avatar!, { size }),
                )}
                className={avatarClassName}
              />
            ) : null}
            <Avatar.Fallback>
              <img
                // force default avatar; it's probably cached
                src={getUserAvatar({
                  discordUser: {
                    id: BigInt(user.id),
                    avatar: null,
                    discriminator: user.discriminator,
                  },
                })}
                alt=""
                className={avatarClassName}
              />
            </Avatar.Fallback>
            {setAvatarObjectURL ? (
              <>
                <input
                  name="avatar"
                  hidden
                  readOnly
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(e) => {
                    const files = e.currentTarget.files;
                    if (!files) return;

                    const file = files[0];
                    if (!file.type.startsWith("image/")) {
                      e.currentTarget.value = "";
                      return;
                    }

                    setAvatarObjectURL(URL.createObjectURL(file));
                  }}
                />
                <button
                  type="button"
                  className={twJoin(
                    "absolute inset-0 w-full h-full rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity",
                    avatarBorderClassName,
                  )}
                  onClick={() => {
                    const el = document.querySelector<HTMLInputElement>(
                      "#profile-avatar>input",
                    );
                    el?.click();
                  }}
                />
              </>
            ) : null}
          </Avatar.Root>
        </div>
        <div id="profile-name">
          <div className="flex flex-row gap-1">
            <p className="text-xl font-bold leading-[1.2] break-words overflow-y-hidden max-h-[4.5rem]">
              {member?.nick || user.global_name || user.username}
            </p>
            {user.bot ? (
              <UsernameBadge
                label={t("badge.app")}
                verified={flags.has(UserFlags.VerifiedBot)}
                className="self-center"
              />
            ) : null}
          </div>
          <p className="whitespace-normal break-all text-sm font-normal leading-[1.125rem]">
            {user.username}
            {user.discriminator === "0" ? "" : `#${user.discriminator}`}
          </p>
        </div>
        <div id="profile-bio" className="mt-2">
          {member?.bio ? (
            <div className="text-sm [--font-size:0.875rem] whitespace-pre-line">
              <Markdown
                content={member.bio}
                cache={cache}
                features={bioMarkdownFeatures}
              />
            </div>
          ) : (
            <p className="italic text-muted dark:text-muted-dark text-sm leading-5">
              {t(
                member?.bio === "" || member?.bio === null
                  ? "bioDefault"
                  : "bioWriteOnly",
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
