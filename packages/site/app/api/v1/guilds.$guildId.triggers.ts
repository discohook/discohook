import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { flows as dFlows, triggers as dTriggers, getDb } from "store";
import { z } from "zod";
import { zx } from "zodix";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { TriggerEvent, flowActions } from "~/store.server";
import { refineZodDraftFlowMax } from "~/types/flows";
import { userIsPremium } from "~/util/users";
import {
  snowflakeAsString,
  zxParseJson,
  zxParseParams,
  zxParseQuery,
} from "~/util/zod";

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });
  const { limit, page } = zxParseQuery(request, {
    limit: zx.IntAsString.refine((v) => v > 0 && v < 100).default("50"),
    page: zx.IntAsString.refine((v) => v >= 0).default("0"),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlags.ManageGuild)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }

  const db = getDb(context.env.HYPERDRIVE);
  const triggers = await db.query.triggers.findMany({
    where: (triggers, { and, eq }) =>
      and(
        eq(triggers.platform, "discord"),
        eq(triggers.discordGuildId, guildId),
      ),
    columns: {
      id: true,
      event: true,
      updatedAt: true,
    },
    with: {
      flow: {
        columns: {
          id: true,
          name: true,
        },
        with: { actions: true },
      },
      updatedBy: {
        columns: {
          name: true,
        },
        with: {
          discordUser: {
            columns: {
              id: true,
              discriminator: true,
              avatar: true,
            },
          },
        },
      },
    },
    limit,
    offset: page,
  });

  return respond(json(triggers));
};

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Method Not Allowed" }, 405);
  }
  const { guildId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { owner, permissions } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlags.ManageGuild)) {
    throw respond(json({ message: "Missing permissions" }, 403));
  }
  const premium = userIsPremium(token.user);

  const { event, flow } = await zxParseJson(request, {
    event: z.nativeEnum(TriggerEvent),
    flow: refineZodDraftFlowMax(premium).optional(),
  });

  const db = getDb(context.env.HYPERDRIVE);

  const curTriggers = await db.query.triggers.findMany({
    where: (triggers, { eq, and }) =>
      and(
        eq(triggers.platform, "discord"),
        eq(triggers.discordGuildId, guildId),
        eq(triggers.event, event),
      ),
    columns: { id: true },
  });
  if (curTriggers.length !== 0) {
    // I think this will be a restriction that we lift later
    throw respond(
      json(
        { message: "This server already has a trigger for that event." },
        400,
      ),
    );
  }

  const dbFlow = (
    await db
      .insert(dFlows)
      .values({
        // TODO: add space to default TriggerEvent name
        name: flow?.name ?? TriggerEvent[event],
      })
      .returning({ id: dFlows.id })
  )[0];
  if (flow && flow.actions.length !== 0) {
    await db.insert(flowActions).values(
      flow.actions.map((action) => ({
        flowId: dbFlow.id,
        type: action.type,
        data: action,
      })),
    );
  }

  const created = (
    await db
      .insert(dTriggers)
      .values({
        platform: "discord",
        discordGuildId: guildId,
        event,
        updatedById: token.user.id,
        flowId: dbFlow.id,
      })
      .returning({
        id: dTriggers.id,
      })
  )[0];

  return respond(json(created, 201));
};
