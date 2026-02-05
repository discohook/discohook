import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import {
  ButtonStyle,
  GatewayDispatchEvents,
  type APIInteractionGuildMember,
  type GatewayGuildMemberAddDispatchData,
  type GatewayGuildMemberRemoveDispatchData,
  type GuildMemberFlags,
} from "discord-api-types/v10";
import { PermissionFlags } from "discord-bitflag";
import { inArray } from "drizzle-orm";
import {
  FlowActionType,
  makeSnowflake,
  TriggerEvent,
  triggers,
  upsertDiscordUser,
  type DraftFlow,
} from "store";
import type { Client } from "../client.js";
import type { ButtonCallback } from "../components.js";
import { emojiToString } from "../emojis.js";
import { gatewayEventNameToCallback } from "../events.js";
import { getWelcomerConfigurations } from "../events/guildMemberAdd.js";
import type { FlowResult } from "../flows/flows.js";
import type { InteractionContext } from "../interactions.js";
import { parseAutoComponentId } from "../util/components.js";
import { color } from "../util/meta.js";
import { spaceEnum } from "../util/regex.js";
import type {
  AppCommandAutocompleteCallback,
  ChatInputAppCommandCallback,
} from "./handler.js";

export const addTriggerCallback: ChatInputAppCommandCallback = async (ctx) => {
  const name = ctx.getStringOption("name").value;
  const event = ctx.getIntegerOption("event").value as TriggerEvent;

  await ctx.defer({ ephemeral: true });

  // biome-ignore lint/style/noNonNullAssertion: Guild only command
  const guild = await ctx.client.getchTriggerGuild(ctx.interaction.guild_id!);

  if ([TriggerEvent.MemberAdd, TriggerEvent.MemberRemove].includes(event)) {
    const configs = await getWelcomerConfigurations(
      ctx.client,
      event === TriggerEvent.MemberAdd ? "add" : "remove",
      guild,
    );
    if (configs.length !== 0) {
      await ctx.followup.editOriginalMessage({
        content: ctx.t("triggerDuplicate"),
      });
      return;
    }
  }

  const db = ctx.client.getDb();
  const user = await upsertDiscordUser(db, ctx.user);
  await db.insert(triggers).values({
    platform: "discord",
    event,
    discordGuildId: makeSnowflake(guild.id),
    disabled: true,
    flow: { actions: [] },
    flowId: null,
    updatedAt: new Date(),
    updatedById: user.id,
  });

  await ctx.followup.editOriginalMessage({
    content: ctx.t("triggerCreated", { replace: { name } }),
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel(ctx.t("addActions"))
          .setURL(`${Bun.env.DISCOHOOK_ORIGIN}/s/${guild.id}?t=triggers`),
      ),
    ],
  });
};

export const getFlowEmbed = (
  ctx: InteractionContext,
  flow: DraftFlow | null,
): EmbedBuilder =>
  new EmbedBuilder()
    .setTitle(flow?.name ?? ctx.t("unnamedTrigger"))
    .setColor(color)
    .setDescription(
      !flow?.actions?.length
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

  // biome-ignore lint/style/noNonNullAssertion: Guild only command
  const guild = await ctx.client.getchTriggerGuild(ctx.interaction.guild_id!);

  // I don't like this because it causes several DB calls
  // but we need to migrate them anyway to make them into
  // triggers
  const welcomerTriggers = [
    ...(await getWelcomerConfigurations(ctx.client, "add", guild)),
    ...(await getWelcomerConfigurations(ctx.client, "remove", guild)),
  ];

  const trigger = welcomerTriggers.find((t) =>
    name.startsWith("_id:")
      ? t.id === BigInt(name.replace(/^_id:/, ""))
      : t.flow?.name === name,
  );
  if (!trigger) {
    await ctx.reply({
      content: ctx.t("noTrigger"),
      ephemeral: true,
    });
    return;
  }

  return ctx.reply({
    embeds: [getFlowEmbed(ctx, trigger.flow)],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel(ctx.t("manageActions"))
          .setURL(
            `${Bun.env.DISCOHOOK_ORIGIN}/s/${ctx.interaction.guild_id}?t=triggers`,
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
    const db = ctx.client.getDb();
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
    await ctx.updateMessage({
      content: "You don't have the Manage Guild permission.",
      embeds: [],
      components: [],
    });
    return;
  }
  const parsed = parseAutoComponentId(ctx.interaction.data.custom_id, "event");
  const event = Number(parsed.event) as TriggerEvent;

  const guildId = ctx.interaction.guild_id;
  if (!guildId) throw Error("Guild-only");

  const db = ctx.client.getDb();
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
    await ctx.updateMessage({
      content: `There are no triggers in this server with the event ${TriggerEvent[event]}.`,
      embeds: [],
      components: [],
    });
    return;
  }

  await db.delete(triggers).where(inArray(triggers.id, triggerIds));

  await ctx.updateMessage({
    content: `Deleted ${triggerIds.length} trigger${
      triggerIds.length === 1 ? "" : "s"
    } successfully.`,
    embeds: [],
    components: [],
  });
};

export const triggersDeleteCancel: ButtonCallback = async (ctx) => {
  await ctx.updateMessage({
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
    await ctx.reply({
      content:
        "You must have the Manage Server permission to send test events.",
      ephemeral: true,
    });
    return;
  }

  let payload: any = {};
  const func = gatewayEventNameToCallback[eventName] as (
    client: Client,
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
      await ctx.reply({
        content: "No dispatch data could be formed for the event",
        ephemeral: true,
      });
      return;
  }
  if (!func) {
    await ctx.reply({
      content: `There was no function for the event \`${eventName}\``,
      ephemeral: true,
    });
    return;
  }

  // TODO: application emojis
  const emojis = await getEmojis(ctx.env);
  const trueEmoji = emojiToString(emojis.get("true", true));
  const falseEmoji = emojiToString(emojis.get("false", true));

  await ctx.defer({ thinking: true, ephemeral: true });

  const started = new Date().getTime();
  const results = await Promise.race([
    (async (): Promise<EventExecutionResult[]> => {
      try {
        const flowResults = <FlowResult[] | undefined>(
          await func(ctx.client, payload, true)
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
};

// https://stackoverflow.com/a/48578424
const promiseTimeout = <T = any>(ms: number, val: T) =>
  new Promise<T>((resolve) => {
    setTimeout(resolve.bind(null, val), ms);
  });
