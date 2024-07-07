import { json } from "@remix-run/cloudflare";
import { PermissionFlags } from "discord-bitflag";
import { getDb } from "store";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { eq, flowActions, flows } from "~/store.server";
import { ZodDraftFlowWithMax } from "~/types/flows";
import { ActionArgs, LoaderArgs } from "~/util/loader";
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

  const db = getDb(context.env.HYPERDRIVE.connectionString);
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

export const action = async ({ request, context, params }: ActionArgs) => {
  if (request.method !== "PATCH") {
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

  const { flow } = await zxParseJson(request, {
    flow: ZodDraftFlowWithMax(premium ? 20 : 5),
  });

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const trigger = await db.query.triggers.findFirst({
    where: (triggers, { eq }) => eq(triggers.id, triggerId),
    columns: {
      discordGuildId: true,
      flowId: true,
    },
  });
  if (!trigger || trigger.discordGuildId !== guildId) {
    throw json({ message: "Unknown Trigger" }, 404);
  }

  await db.transaction(async (tx) => {
    // if (flow) {
    await tx.delete(flowActions).where(eq(flowActions.flowId, trigger.flowId));
    await tx.insert(flowActions).values(
      flow.actions.map((action) => ({
        flowId: trigger.flowId,
        type: action.type,
        data: action,
      })),
    );
    await tx
      .update(flows)
      .set({ name: flow.name })
      .where(eq(flows.id, trigger.flowId));
    // }
  });

  return respond(json({ id: triggerId }));
};
