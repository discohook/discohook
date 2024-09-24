import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import {
  APIEmbed,
  ButtonStyle,
  ComponentType,
  MessageFlags
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { inArray } from "drizzle-orm";
import { t } from "i18next";
import { getDb, getchTriggerGuild, upsertDiscordUser } from "store";
import { flows, makeSnowflake, triggers } from "store/src/schema";
import { FlowActionType } from "store/src/types/components.js";
import { TriggerEvent } from "store/src/types/triggers.js";
import {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
} from "../commands.js";
import { ButtonCallback } from "../components.js";
import { getWelcomerConfigurations } from "../events/guildMemberAdd.js";
import { parseAutoComponentId } from "../util/components.js";
import { color } from "../util/meta.js";
import { spaceEnum } from "../util/regex.js";

export const addTriggerCallback: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption("name").value;
  const event = ctx.getIntegerOption("event").value as TriggerEvent;

  return [
    ctx.defer(),
    async () => {
      const db = getDb(ctx.env.HYPERDRIVE);
      const guild = await getchTriggerGuild(
        ctx.rest,
        ctx.env.KV,
        // biome-ignore lint/style/noNonNullAssertion: Guild only command
        ctx.interaction.guild_id!,
      );
      if ([TriggerEvent.MemberAdd, TriggerEvent.MemberRemove].includes(event)) {
        const configs = await getWelcomerConfigurations(
          db,
          event === TriggerEvent.MemberAdd ? "add" : "remove",
          ctx.rest,
          guild,
        );
        if (configs.length !== 0) {
          await ctx.followup.editOriginalMessage({
            content: t("triggerDuplicate"),
          });
          return;
        }
      }
      const user = await upsertDiscordUser(db, ctx.user);
      const { id: flowId } = (
        await db.insert(flows).values({}).returning({ id: flows.id })
      )[0];
      const trigger = (
        await db
          .insert(triggers)
          .values({
            platform: "discord",
            event,
            discordGuildId: makeSnowflake(guild.id),
            disabled: true,
            flowId,
            updatedAt: new Date(),
            updatedById: user.id,
          })
          .returning()
      )[0];

      await ctx.followup.editOriginalMessage({
        content: t("triggerCreated", { replace: { name } }),
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                label: t("addActions"),
                url: `${ctx.env.DISCOHOOK_ORIGIN}/s/${trigger.discordGuildId}?t=triggers`,
              },
            ],
          },
        ],
      });
    },
  ];
};

export const getFlowEmbed = (
  flow: Awaited<ReturnType<typeof getWelcomerConfigurations>>[number]["flow"],
): APIEmbed => ({
  title: flow.name ?? t("unnamedTrigger"),
  color,
  description:
    flow.actions?.length === 0
      ? t("noActions")
      : flow.actions
          .map(
            ({ data: action }, i) =>
              `${i + 1}. ${spaceEnum(FlowActionType[action.type])}${
                action.type === FlowActionType.Wait
                  ? ` ${action.seconds}s`
                  : action.type === FlowActionType.SetVariable
                    ? ` \`${action.name}\``
                    : ""
              }`,
          )
          .join("\n"),
});

export const viewTriggerCallback: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption("name").value;

  const db = getDb(ctx.env.HYPERDRIVE);
  const guild = await getchTriggerGuild(
    ctx.rest,
    ctx.env.KV,
    // biome-ignore lint/style/noNonNullAssertion: Guild only command
    ctx.interaction.guild_id!,
  );

  // I don't like this because it causes several DB calls
  // but we need to migrate them anyway to make them into
  // triggers
  const welcomerTriggers = [
    ...(await getWelcomerConfigurations(db, "add", ctx.rest, guild)),
    ...(await getWelcomerConfigurations(db, "remove", ctx.rest, guild)),
  ];

  const trigger = welcomerTriggers.find((t) =>
    name.startsWith("_id:")
      ? t.id === BigInt(name.split(":")[1])
      : t.flow?.name === name,
  );
  if (!trigger) {
    return ctx.reply({
      content: t("noTrigger"),
      flags: MessageFlags.Ephemeral,
    });
  }

  return ctx.reply({
    embeds: [getFlowEmbed(trigger.flow)],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel(t("manageActions"))
            .setURL(
              `${ctx.env.DISCOHOOK_ORIGIN}/s/${ctx.interaction.guild_id}?t=triggers`,
            ),
        )
        // .addComponents(
        //   await storeComponents(ctx.env.KV, [
        //     new ButtonBuilder()
        //       .setStyle(ButtonStyle.Danger)
        //       .setLabel("Delete Trigger"),
        //     {
        //       componentRoutingId: "add-component-flow",
        //       componentTimeout: 600,
        //     },
        //   ]),
        // )
        .toJSON(),
    ],
    flags: MessageFlags.Ephemeral,
  });
};

export const triggerAutocompleteCallback: AppCommandAutocompleteCallback =
  async (ctx) => {
    const db = getDb(ctx.env.HYPERDRIVE);
    // This doesn't reflect pre-migration triggers
    const triggers = await db.query.triggers.findMany({
      where: (triggers, { eq }) =>
        eq(
          triggers.discordGuildId,
          // biome-ignore lint/style/noNonNullAssertion: Guild only command
          makeSnowflake(ctx.interaction.guild_id!),
        ),
      columns: {
        id: true,
      },
      with: {
        flow: {
          columns: {
            name: true,
          },
        },
      },
    });
    return triggers.map((trigger) => ({
      name: trigger.flow?.name ?? t("unnamedTrigger"),
      value: `_id:${trigger.id}`,
    }));
  };

export const triggersDeleteConfirm: ButtonCallback = async (ctx) => {
  if (!ctx.userPermissons.has(PermissionFlags.ManageGuild)) {
    return ctx.updateMessage({
      content: "You don't have the Manage Guild permission.",
      embeds: [],
      components: [],
    });
  }
  const parsed = parseAutoComponentId(ctx.interaction.data.custom_id, "event");
  const event = Number(parsed.event) as TriggerEvent;

  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only");

  const db = getDb(ctx.env.HYPERDRIVE);
  const results = await db.query.triggers.findMany({
    where: (triggers, { and, eq }) =>
      and(
        eq(triggers.platform, "discord"),
        eq(triggers.discordGuildId, makeSnowflake(guildId)),
        eq(triggers.event, event),
      ),
    columns: { id: true },
  });
  const triggerIds = results.map((t) => t.id);
  if (triggerIds.length === 0) {
    return ctx.updateMessage({
      content: `There are no triggers in this server with the event ${TriggerEvent[event]}.`,
      embeds: [],
      components: [],
    });
  }

  await db.delete(triggers).where(inArray(triggers.id, triggerIds));

  return ctx.updateMessage({
    content: `Deleted ${triggerIds.length} trigger${
      triggerIds.length === 1 ? "" : "s"
    } successfully.`,
    embeds: [],
    components: [],
  });
};

export const triggersDeleteCancel: ButtonCallback = async (ctx) => {
  return ctx.updateMessage({
    content: "The triggers are safe and sound.",
    embeds: [],
    components: [],
  });
};
