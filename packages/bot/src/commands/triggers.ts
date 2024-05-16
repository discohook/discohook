import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import {
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import { getDb, getchTriggerGuild, upsertDiscordUser } from "store";
import { makeSnowflake, triggers } from "store/src/schema/schema.js";
import { FlowActionType } from "store/src/types/components.js";
import { TriggerEvent } from "store/src/types/triggers.js";
import {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
} from "../commands.js";
import { getWelcomerConfigurations } from "../events/guildMemberAdd.js";
import { color } from "../util/meta.js";
import { spaceEnum } from "../util/regex.js";

export const addTriggerCallback: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption("name").value;
  const event = ctx.getIntegerOption("event").value as TriggerEvent;

  return [
    ctx.defer(),
    async () => {
      const db = getDb(ctx.env.HYPERDRIVE.connectionString);
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
            content: "This server already has a trigger for that event.",
          });
          return;
        }
      }
      const user = await upsertDiscordUser(db, ctx.user);
      const trigger = (
        await db
          .insert(triggers)
          .values({
            platform: "discord",
            event,
            discordGuildId: makeSnowflake(guild.id),
            disabled: true,
            flow: {
              name,
              actions: [],
            },
            updatedAt: new Date(),
            updatedById: user.id,
          })
          .returning()
      )[0];

      await ctx.followup.editOriginalMessage({
        content: `Trigger **${name}** created successfully.`,
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                label: "Add Actions",
                url: `${ctx.env.DISCOHOOK_ORIGIN}/g/${trigger.discordGuildId}/triggers`,
              },
            ],
          },
        ],
      });
    },
  ];
};

export const viewTriggerCallback: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption("name").value;

  const db = getDb(ctx.env.HYPERDRIVE.connectionString);
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
      content: "This server has no trigger with that name.",
      flags: MessageFlags.Ephemeral,
    });
  }

  return ctx.reply({
    embeds: [
      {
        title: trigger.flow?.name ?? "Unnamed trigger",
        color,
        description:
          trigger.flow?.actions?.length === 0
            ? "No actions"
            : trigger.flow?.actions
                .map(
                  (action, i) =>
                    `${i + 1}. ${spaceEnum(FlowActionType[action.type])}${
                      action.type === FlowActionType.Wait
                        ? ` ${action.seconds}s`
                        : action.type === FlowActionType.SetVariable
                          ? ` \`${action.name}\``
                          : ""
                    }`,
                )
                .join("\n"),
      },
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Manage Actions")
            .setURL(
              `${ctx.env.DISCOHOOK_ORIGIN}/g/${ctx.interaction.guild_id}/triggers`,
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
    const db = getDb(ctx.env.HYPERDRIVE.connectionString);
    // This doesn't reflect pre-migration triggers
    const trigs = await db.query.triggers.findMany({
      where: eq(
        triggers.discordGuildId,
        // biome-ignore lint/style/noNonNullAssertion: Guild only command
        makeSnowflake(ctx.interaction.guild_id!),
      ),
      columns: {
        id: true,
        flow: true,
      },
    });
    return trigs.map((t) => ({
      name: t.flow?.name ?? "Unnamed trigger",
      value: `_id:${t.id}`,
    }));
  };
