import { ContainerBuilder } from "@discordjs/builders";
import {
  type APIGuildMember,
  PermissionFlagsBits,
  Routes,
} from "discord-api-types/v10";
import type { ChatInputAppCommandCallback } from "../commands.js";
import { cdn, readAttachment, userAvatarUrl } from "../util/cdn.js";
import { textDisplay } from "../util/components.js";
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
  bio?: string | null,
): ContainerBuilder => {
  const container = new ContainerBuilder()
    .setAccentColor(color)
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents([
          textDisplay(
            `### ${member.nick ?? member.user.global_name ?? member.user.username}`,
          ),
          // textDisplay(
          //   bio === null
          //     ? "No custom bio."
          //     : bio
          //       ? bio
          //       : "Custom bio, if present, cannot be shown here due to Discord limitations.",
          // ),
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
    const member = (await ctx.rest.get(
      Routes.guildMember(
        ctx.interaction.guild_id,
        ctx.interaction.application_id,
      ),
    )) as APIGuildMember;
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

      await ctx.rest.patch(
        Routes.guildMember(ctx.interaction.guild_id, "@me"),
        {
          body,
          reason: `${getUserTag(ctx.user)} (${ctx.user.id}) via /profile set`,
        },
      );
      await ctx.followup.editOriginalMessage({
        content: "Profile updated.",
        // I don't really like how plain this is
        // components: [
        //   getMemberProfileContainer(member, ctx.interaction.guild_id, body.bio),
        // ],
        // componentsV2: true,
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
