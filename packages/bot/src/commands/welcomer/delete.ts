import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord-api-types/v10";
import { getDb, getchTriggerGuild } from "store";
import { TriggerEvent } from "store/src/types/triggers.js";
import { ChatInputAppCommandCallback } from "../../commands.js";
import { AutoComponentCustomId } from "../../components.js";
import { getWelcomerConfigurations } from "../../events/guildMemberAdd.js";
import { WelcomerTriggerEvent } from "./set.js";

export const welcomerDeleteEntry: ChatInputAppCommandCallback<true> = async (
  ctx,
) => {
  const event = ctx.getIntegerOption("event").value as WelcomerTriggerEvent;

  const guild = await getchTriggerGuild(
    ctx.rest,
    ctx.env,
    ctx.interaction.guild_id,
  );

  const db = getDb(ctx.env.HYPERDRIVE);
  const triggers = await getWelcomerConfigurations(
    db,
    event === TriggerEvent.MemberAdd ? "add" : "remove",
    ctx.rest,
    guild,
  );

  if (triggers.length === 0) {
    return ctx.reply({
      content: "This server has no triggers with that event.",
      ephemeral: true,
    });
  }

  return ctx.reply({
    content: `Are you sure you want to delete these triggers?\n${triggers
      .map((t) => `- ${t.flow.name ?? TriggerEvent[event]}`)
      .join("\n")}`,
    ephemeral: true,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Delete")
          .setStyle(ButtonStyle.Danger)
          .setCustomId(
            `a_delete-triggers-confirm_${event}` satisfies AutoComponentCustomId,
          ),
        new ButtonBuilder()
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId(
            "a_delete-triggers-cancel_" satisfies AutoComponentCustomId,
          ),
      ),
    ],
  });
};
