import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { autoRollbackTx, getDb } from "store";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import {
  type DBWithSchema,
  type TriggerEvent,
  eq,
  flowActions,
  flows,
  putGeneric,
  triggers,
} from "~/store.server";
import type { Env } from "~/types/env";
import { refineZodDraftFlowMax } from "~/types/flows";
import type { ActionArgs, LoaderArgs } from "~/util/loader";
import { userIsPremium } from "~/util/users";
import { snowflakeAsString, zxParseJson, zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId, triggerId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
    triggerId: snowflakeAsString(),
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
  const trigger = await db.query.triggers.findFirst({
    where: (triggers, { eq }) => eq(triggers.id, triggerId),
    columns: {
      id: true,
      event: true,
      discordGuildId: true,
      disabled: true,
    },
    with: {
      flow: {
        with: { actions: true },
      },
    },
  });
  if (!trigger || trigger.discordGuildId !== guildId) {
    throw json({ message: "Unknown Trigger" }, 404);
  }

  return respond(json(trigger));
};

const updateKvTriggers = async (
  db: DBWithSchema,
  env: Env,
  event: TriggerEvent,
  guildId: string | bigint,
) => {
  const triggers = await db.query.triggers.findMany({
    where: (triggers, { and, eq }) =>
      and(
        eq(triggers.discordGuildId, BigInt(guildId)),
        eq(triggers.event, event),
      ),
    columns: {
      id: true,
      disabled: true,
    },
    with: {
      flow: {
        columns: { name: true },
        with: { actions: true },
      },
    },
  });
  await putGeneric(env, `cache:triggers-${event}-${guildId}`, triggers, {
    expirationTtl: 1200,
  });
};

export const action = async ({ request, context, params }: ActionArgs) => {
  if (request.method !== "PATCH" && request.method !== "DELETE") {
    throw json({ message: "Method Not Allowed" }, 405);
  }
  const { guildId, triggerId } = zxParseParams(params, {
    guildId: snowflakeAsString(),
    triggerId: snowflakeAsString(),
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

  if (request.method === "DELETE") {
    const db = getDb(context.env.HYPERDRIVE);
    const trigger = await db.query.triggers.findFirst({
      where: (triggers, { eq }) => eq(triggers.id, triggerId),
      columns: { discordGuildId: true, event: true },
    });
    if (!trigger || trigger.discordGuildId !== guildId) {
      throw json({ message: "Unknown Trigger" }, 404);
    }

    await db.delete(triggers).where(eq(triggers.id, triggerId));
    await updateKvTriggers(
      db,
      context.env,
      trigger.event,
      trigger.discordGuildId,
    );
    return respond(json({ id: triggerId }));
  }

  const { flow } = await zxParseJson(request, {
    flow: refineZodDraftFlowMax(premium),
  });

  const db = getDb(context.env.HYPERDRIVE);
  const trigger = await db.query.triggers.findFirst({
    where: (triggers, { eq }) => eq(triggers.id, triggerId),
    columns: {
      discordGuildId: true,
      event: true,
      flowId: true,
    },
  });
  if (!trigger || trigger.discordGuildId !== guildId) {
    throw json({ message: "Unknown Trigger" }, 404);
  }

  await db.transaction(
    autoRollbackTx(async (tx) => {
      // if (flow) {
      await tx
        .delete(flowActions)
        .where(eq(flowActions.flowId, trigger.flowId));
      if (flow.actions.length !== 0) {
        await tx.insert(flowActions).values(
          flow.actions.map((action) => ({
            flowId: trigger.flowId,
            type: action.type,
            data: action,
          })),
        );
      }
      await tx
        .update(flows)
        .set({ name: flow.name })
        .where(eq(flows.id, trigger.flowId));
      // }
    }),
  );

  await updateKvTriggers(
    db,
    context.env,
    trigger.event,
    trigger.discordGuildId,
  );
  return respond(json({ id: triggerId }));
};
