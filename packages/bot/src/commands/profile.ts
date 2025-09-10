import { ContainerBuilder } from "@discordjs/builders";
import {
  type APIGuildMember,
  PermissionFlagsBits,
  RESTJSONErrorCodes,
  Routes,
} from "discord-api-types/v10";
import type { ChatInputAppCommandCallback } from "../commands.js";
import { cdn, readAttachment, userAvatarUrl } from "../util/cdn.js";
import { textDisplay } from "../util/components.js";
import { isDiscordError } from "../util/error.js";
import { color } from "../util/meta.js";
import { getUserTag } from "../util/user.js";

interface ModifyCurrentMemberBody {
  nick?: string | null;
  avatar?: string | null;
  banner?: string | null;
  bio?: string | null;
}

const getMemberProfileContainer = (
  member: APIGuildMember,
  guildId: string,
  // discord doesn't return user bios in the member object, even for yourself
  newBio?: string | null,
): ContainerBuilder => {
  // but they *do* return the bio in a PATCH response
  const bio = "bio" in member ? (member.bio as string) : newBio;

  const container = new ContainerBuilder().setAccentColor(color);
  if (member.banner) {
    container.addMediaGalleryComponents((g) =>
      g.addItems((i) =>
        i.setURL(
          // biome-ignore lint/style/noNonNullAssertion: above
          cdn.guildMemberBanner(guildId, member.user.id, member.banner!, {
            size: 2048,
          }),
        ),
      ),
    );
  }
  container.addSectionComponents((s) =>
    s
      .addTextDisplayComponents([
        textDisplay(
          `### ${member.nick ?? member.user.global_name ?? member.user.username}\n${getUserTag(member.user)}`,
        ),
        textDisplay(
          bio === null
            ? "-# *Discohook's default bio will be used.*"
            : bio
              ? bio // max 190 chars; should be fine
              : "-# *Bio cannot be shown due to Discord limitations.*",
        ),
      ])
      .setThumbnailAccessory((t) =>
        t.setURL(
          member.avatar
            ? cdn.guildMemberAvatar(guildId, member.user.id, member.avatar, {
                size: 2048,
              })
            : userAvatarUrl(member.user, { size: 2048 }),
        ),
      ),
  );

  return container;
};

export const profileSetCallback: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  // Well, this is handled by the command permissions right?
  // if (!ctx.userPermissons.has(PermissionFlagsBits.ManageNicknames)) {
  //   return ctx.reply({
  //     content:
  //       "You need the **manage nicknames** permission to use this command.",
  //     ephemeral: true,
  //   });
  // }

  const nickField = ctx.getStringOption("name")?.value?.trim() || undefined;
  const bannerField = ctx.getAttachmentOption("banner");
  const avatarField = ctx.getAttachmentOption("avatar");
  // const bioField = ctx.getStringOption("bio")?.value;

  // as far as i know the other fields are not permission-restricted right now
  if (nickField && !ctx.appPermissons.has(PermissionFlagsBits.ChangeNickname)) {
    return ctx.reply({
      content:
        "I need the **Change Nickname** permission to change my own nickname.",
      ephemeral: true,
    });
  }

  if (!nickField && !bannerField && !avatarField) {
    let member: APIGuildMember;
    try {
      // empty PATCH to get own bio
      member = (await ctx.rest.patch(
        Routes.guildMember(ctx.interaction.guild_id, "@me"),
        // This won't show up in audit log since it's blank so
        // the reason shouldn't matter
        { body: {} },
      )) as APIGuildMember;
    } catch (e) {
      if (
        // perhaps rate limit or empty body was forbidden
        isDiscordError(e) &&
        e.code !== RESTJSONErrorCodes.UnknownMember &&
        e.code !== RESTJSONErrorCodes.UnknownGuild
      ) {
        console.error(
          "Failed to submit empty PATCH current member, falling back to GET",
          e.rawError,
        );
        member = (await ctx.rest.get(
          Routes.guildMember(
            ctx.interaction.guild_id,
            ctx.interaction.application_id,
          ),
        )) as APIGuildMember;
      } else {
        throw e;
      }
    }

    return ctx.reply({
      components: [getMemberProfileContainer(member, ctx.interaction.guild_id)],
      componentsV2: true,
      ephemeral: true,
    });
  }

  return [
    ctx.defer({ componentsV2: false, ephemeral: true }),
    async () => {
      const body: ModifyCurrentMemberBody = { nick: nickField };

      if (avatarField) {
        const avatar = await readAttachment(avatarField.url);
        body.avatar = avatar;
      }
      if (bannerField) {
        const banner = await readAttachment(bannerField.url);
        body.banner = banner;
      }

      const member = (await ctx.rest.patch(
        Routes.guildMember(ctx.interaction.guild_id, "@me"),
        {
          body,
          reason: `${getUserTag(ctx.user)} (${ctx.user.id}) via /profile set`,
        },
      )) as APIGuildMember;
      await ctx.followup.editOriginalMessage({
        // content: "Profile updated.",
        // I don't really like how plain this is
        components: [
          getMemberProfileContainer(member, ctx.interaction.guild_id, body.bio),
        ],
        componentsV2: true,
      });
    },
  ];
};

export const profileClearCallback: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const value = (ctx.getStringOption("value")?.value || undefined) as
    | "name"
    | "avatar"
    | "banner"
    | undefined;

  return [
    ctx.defer({ ephemeral: true }),
    async () => {
      const body: ModifyCurrentMemberBody = {};

      if (value) {
        body[value === "name" ? "nick" : value] = null;
      } else {
        body.nick = null;
        body.avatar = null;
        body.banner = null;
        body.bio = null;
      }

      await ctx.rest.patch(
        Routes.guildMember(ctx.interaction.guild_id, "@me"),
        {
          body,
          reason: `${getUserTag(ctx.user)} (${ctx.user.id}) via /profile clear`,
        },
      );
      await ctx.followup.editOriginalMessage({
        content: value
          ? `Cleared my ${value} for this server.`
          : "Reset all profile values to their defaults.",
      });
    },
  ];
};
