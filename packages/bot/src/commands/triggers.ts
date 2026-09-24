import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import {
  type APIInteractionGuildMember,
  ButtonStyle,
  GatewayDispatchEvents,
  type GatewayGuildMemberAddDispatchData,
  type GatewayGuildMemberRemoveDispatchData,
  type GuildMemberFlags,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { inArray } from "drizzle-orm";
import {
  FlowActionType,
  getchTriggerGuild,
  getDb,
  makeSnowflake,
  TriggerEvent,
  triggers,
  upsertDiscordUser,
} from "store";
import type {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
} from "../commands.js";
import type { ButtonCallback } from "../components.js";
import { gatewayEventNameToCallback } from "../events.js";
import { getWelcomerConfigurations } from "../events/guildMemberAdd.js";
import type { FlowResult } from "../flows/flows.js";
import { FlowLogger } from "../flows/logger.js";
import type { InteractionContext } from "../interactions.js";
import type { Env } from "../types/env.js";
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
            content: ctx.t("triggerDuplicate"),
          });
          return;
        }
      }
      const user = await upsertDiscordUser(db, ctx.user);
      await db.insert(triggers).values({
        platform: "discord",
        event,
        discordGuildId: makeSnowflake(guild.id),
        disabled: true,
        flow: { actions: [] },
        updatedById: user.id,
      });

      await ctx.followup.editOriginalMessage({
        content: ctx.t("triggerCreated", { replace: { name } }),
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel(ctx.t("addActions"))
              .setURL(`${ctx.env.DISCOHOOK_ORIGIN}/s/${guild.id}?t=triggers`),
          ),
        ],
      });
    },
  ];
};

export const getFlowEmbed = (
  ctx: InteractionContext,
  flow: Awaited<ReturnType<typeof getWelcomerConfigurations>>[number]["flow"],
): EmbedBuilder =>
  new EmbedBuilder()
    .setTitle(flow.name ?? ctx.t("unnamedTrigger"))
    .setColor(color)
    .setDescription(
      flow.actions?.length === 0
        ? ctx.t("noActions")
        : flow.actions
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
      content: ctx.t("noTrigger"),
      ephemeral: true,
    });
  }

  return ctx.reply({
    embeds: [getFlowEmbed(ctx, trigger.flow)],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel(ctx.t("manageActions"))
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
    // This doesn't reflect pre-migration triggers (from v1 utils)
    const triggers = await db.query.triggers.findMany({
      where: (triggers, { eq }) =>
        eq(
          triggers.discordGuildId,
          // biome-ignore lint/style/noNonNullAssertion: Guild only command
          makeSnowflake(ctx.interaction.guild_id!),
        ),
      columns: { id: true, event: true, flow: true },
    });
    return triggers.map((trigger) => ({
      name:
        trigger.flow?.name ??
        (trigger.event === TriggerEvent.MemberAdd
          ? "Member Join"
          : trigger.event === TriggerEvent.MemberRemove
            ? "Member Remove"
            : ctx.t("unnamedTrigger")),
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
  const func = gatewayEventNameToCallback[eventName] as (
    env: Env,
    payload: any,
    deferred?: boolean,
  ) => Promise<FlowResult[] | undefined> | undefined;
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

  return [
    ctx.defer({ thinking: true, ephemeral: true }),
    async () => {
      const started = Date.now();
      const results = await Promise.race([
        (async (): Promise<FlowResult[]> => {
          try {
            const flowResults = <FlowResult[] | undefined>(
              await func(ctx.env, payload, true)
            );
            return flowResults ?? [];
          } catch (e) {
            return [
              {
                status: "failure",
                message: `Function failed to complete: ${e}`,
              },
            ];
          }
        })(),
        promiseTimeout<FlowResult[]>(840_000, [
          {
            status: "failure",
            message: "Timeout after 14m",
          },
        ]),
      ]);
      const ended = Date.now();
      await ctx.followup.editOriginalMessage({
        embeds: [
          getFlowDiagnosticEmbed(results, started, ended).addFields({
            name: "Management",
            value:
              "View all actions in this trigger with </triggers view:1281305550340096033>",
            inline: true,
          }),
        ],
      });
    },
  ];
};

// https://stackoverflow.com/a/48578424
export const promiseTimeout = <T = any>(ms: number, val: T) =>
  new Promise<T>((resolve) => {
    setTimeout(resolve.bind(null, val), ms);
  });

export const getFlowDiagnosticEmbed = (
  results: FlowResult[],
  started: number,
  ended: number,
  logger?: FlowLogger,
) => {
  let description = "";
  const descFooter = results
    .map((r) => {
      const firstLine = `${results.length === 1 ? "" : "- "}<:_:${
        r.status === "success"
          ? "1263857933209571329" // true emoji
          : "1263857948086505482" // false emoji
      }> ${r.message ?? "no message"}`;
      if (r.discordError) {
        return `${firstLine}\n[${r.discordError.code}] ${r.discordError.message}`;
      }
      return firstLine;
    })
    .join("\n")
    .slice(0, 4096);
  for (const message of logger?.messages ?? []) {
    const full = `${description}\n${message.toString()}`;
    const part = `${description}\n…`;

    if (`${full}\n${descFooter}`.length > 4096) {
      if (`${part}\n${descFooter}`.length > 4096) {
        break;
      } else {
        description = part;
        break;
      }
    } else {
      description = full;
    }
  }
  description += `\n${descFooter}`;

  return new EmbedBuilder()
    .setTitle("Results")
    .setColor(color)
    .setDescription(description.trim())
    .setFields({
      name: "Diagnostic",
      value: `${results.length} result${
        results.length === 1 ? "" : "s"
      } in ${Math.ceil(ended - started)}ms`,
      inline: true,
    });
};
