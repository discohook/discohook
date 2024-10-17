import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import {
  APIInteractionGuildMember,
  ButtonStyle,
  GatewayDispatchEvents,
  GatewayGuildMemberAddDispatchData,
  GatewayGuildMemberRemoveDispatchData,
  GuildMemberFlags,
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
import { emojiToString, getEmojis } from "../emojis.js";
import { eventNameToCallback } from "../events.js";
import { getWelcomerConfigurations } from "../events/guildMemberAdd.js";
import { FlowResult } from "../flows/flows.js";
import { parseAutoComponentId } from "../util/components.js";
import { color } from "../util/meta.js";
import { spaceEnum } from "../util/regex.js";

export const addTriggerCallback: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption("name").value;
  const event = ctx.getIntegerOption("event").value as TriggerEvent;

  return [
    ctx.defer({ ephemeral: true }),
    async () => {
      const db = getDb(ctx.env.HYPERDRIVE);
      const guild = await getchTriggerGuild(
        ctx.rest,
        ctx.env,
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
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel(t("addActions"))
              .setURL(
                `${ctx.env.DISCOHOOK_ORIGIN}/s/${trigger.discordGuildId}?t=triggers`,
              ),
          ),
        ],
      });
    },
  ];
};

export const getFlowEmbed = (
  flow: Awaited<ReturnType<typeof getWelcomerConfigurations>>[number]["flow"],
): EmbedBuilder =>
  new EmbedBuilder()
    .setTitle(flow.name ?? t("unnamedTrigger"))
    .setColor(color)
    .setDescription(
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
    );

export const viewTriggerCallback: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption("name").value;

  const db = getDb(ctx.env.HYPERDRIVE);
  const guild = await getchTriggerGuild(
    ctx.rest,
    ctx.env,
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
      ephemeral: true,
    });
  }

  return ctx.reply({
    embeds: [getFlowEmbed(trigger.flow)],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel(t("manageActions"))
          .setURL(
            `${ctx.env.DISCOHOOK_ORIGIN}/s/${ctx.interaction.guild_id}?t=triggers`,
          ),
      ),
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
      // ),
    ],
    ephemeral: true,
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

// Replicating `/api/v1/guilds/:id/trigger-events/:event` here
// We need a lower level function so this duplication isn't necessary (or
// rather we would have an async function in the bot and call it from the
// site)
const triggerEventToDispatchEvent: Record<TriggerEvent, GatewayDispatchEvents> =
  {
    [TriggerEvent.MemberAdd]: GatewayDispatchEvents.GuildMemberAdd,
    [TriggerEvent.MemberRemove]: GatewayDispatchEvents.GuildMemberRemove,
  };

interface EventExecutionResult {
  event: GatewayDispatchEvents;
  name?: string;
  status: "success" | "failure" | "timeout";
  message?: string;
}

export const triggerTestButtonCallback: ButtonCallback = async (ctx) => {
  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only");

  const parsed = parseAutoComponentId(ctx.interaction.data.custom_id, "event");
  const event = Number(parsed.event) as TriggerEvent;
  const eventName = triggerEventToDispatchEvent[event];

  if (!ctx.userPermissons.has(PermissionFlags.ManageGuild)) {
    return ctx.reply({
      content:
        "You must have the Manage Server permission to send test events.",
      ephemeral: true,
    });
  }

  let payload: any = {};
  const func = eventNameToCallback[eventName];
  switch (event) {
    case TriggerEvent.MemberAdd: {
      payload = {
        ...(ctx.interaction.member ??
          ({
            user: ctx.user,
            deaf: false,
            mute: false,
            joined_at: new Date().toISOString(),
            permissions: "0",
            roles: [],
            flags: 0 as GuildMemberFlags,
          } satisfies APIInteractionGuildMember)),
        guild_id: guildId,
      } satisfies GatewayGuildMemberAddDispatchData;
      break;
    }
    case TriggerEvent.MemberRemove: {
      payload = {
        user: ctx.user,
        guild_id: guildId,
      } satisfies GatewayGuildMemberRemoveDispatchData;
      break;
    }
    default:
      return ctx.reply({
        content: "No dispatch data could be formed for the event",
        ephemeral: true,
      });
  }
  if (!func) {
    return ctx.reply({
      content: `There was no function for the event \`${eventName}\``,
      ephemeral: true,
    });
  }

  const emojis = await getEmojis(ctx.env);
  const trueEmoji = emojiToString(emojis.get("true", true));
  const falseEmoji = emojiToString(emojis.get("false", true));

  return [
    ctx.defer({ thinking: true, ephemeral: true }),
    async () => {
      const started = new Date().getTime();
      const results = await Promise.race([
        (async (): Promise<EventExecutionResult[]> => {
          try {
            const flowResults = <FlowResult[] | undefined>(
              await func(ctx.env, payload)
            );
            if (flowResults) {
              return flowResults.map((result) => ({
                event: eventName,
                status: result.status,
                message:
                  result.message +
                  (result.discordError
                    ? `\nDiscord error: ${result.discordError.message}${
                        result.discordError.errors
                          ? ` | ${result.discordError.errors}`
                          : ""
                      }`
                    : ""),
              }));
            }
            return [];
          } catch (e) {
            return [
              {
                event: eventName,
                status: "failure",
                message: `Function failed to complete: ${e}`,
              },
            ];
          }
        })(),
        promiseTimeout<EventExecutionResult[]>(840_000, [
          {
            event: eventName,
            status: "timeout",
            message: "Timeout after 14m",
          },
        ]),
      ]);
      const ended = new Date().getTime();
      await ctx.followup.editOriginalMessage({
        embeds: [
          new EmbedBuilder()
            .setTitle("Results")
            .setColor(color)
            .setDescription(
              results
                .map(
                  (r) =>
                    `${results.length === 1 ? "" : "- "}${
                      r.status === "success" ? trueEmoji : falseEmoji
                    } ${r.message ?? "no message"}`,
                )
                .join("\n")
                .slice(0, 4096),
            )
            .setFields(
              {
                name: "Diagnostic",
                value: `${results.length} result${
                  results.length === 1 ? "" : "s"
                } in ${Math.ceil(ended - started)}ms`,
                inline: true,
              },
              {
                name: "Management",
                value:
                  "View all actions in this trigger with </triggers view:1281305550340096033>",
                inline: true,
              },
            ),
        ],
      });
    },
  ];
};

// https://stackoverflow.com/a/48578424
const promiseTimeout = <T = any>(ms: number, val: T) =>
  new Promise<T>((resolve) => {
    setTimeout(resolve.bind(null, val), ms);
  });
