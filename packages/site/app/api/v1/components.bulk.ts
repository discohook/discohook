import { z } from "zod/v3";
import { authorizeRequest } from "~/session.server";
import {
  discordMessageComponents,
  getDb,
  inArray,
  launchComponentKV,
} from "~/store.server";
import type { ActionArgs } from "~/util/loader";
import { snowflakeAsString, zxParseJson } from "~/util/zod";

export const action = async ({ request, context }: ActionArgs) => {
  if (request.method !== "PATCH") {
    throw new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  const { ids, body } = await zxParseJson(request, {
    ids: snowflakeAsString().array().max(25).min(1),
    // We're eventually going to move to "placements" which don't bind
    // components to one guild in particular, alleviating lots of headache
    body: z.object({
      guildId: snowflakeAsString().optional(),
      channelId: snowflakeAsString().optional(),
      messageId: snowflakeAsString().optional(),
    }),
  });
  console.log(`[${request.method} Bulk Components] ${ids.join(", ")}`);

  const [token, respond] = await authorizeRequest(request, context);

  const db = getDb(context.env.HYPERDRIVE);
  const current = await db.query.discordMessageComponents.findMany({
    where: (table, { and, eq, inArray }) =>
      // This endpoint can only be used by the component owner for simplicity's sake
      and(inArray(table.id, ids), eq(table.createdById, BigInt(token.user.id))),
    columns: {
      id: true,
      data: true,
      draft: true,
    },
  });
  if (current.length === 0) {
    return respond(
      Response.json(
        {
          message:
            "All provided components either do not exist or are not owned by you.",
        },
        { status: 404 },
      ),
    );
  }

  const update: Pick<
    typeof discordMessageComponents.$inferInsert,
    | "channelId"
    | "messageId"
    | "guildId"
    | "draft"
    | "updatedById"
    | "updatedAt"
  > = {
    updatedAt: new Date(),
    updatedById: BigInt(token.user.id),
  };
  if (body.channelId && body.messageId && body.guildId) {
    update.messageId = body.messageId;
    update.channelId = body.channelId;
    update.guildId = body.guildId;
    update.draft = false;
  }

  if (Object.keys(update).length > 2) {
    await db
      .update(discordMessageComponents)
      .set(update)
      .where(
        inArray(
          discordMessageComponents.id,
          current.map((c) => c.id),
        ),
      );
  }

  if (update.draft === false && update.messageId) {
    for (const component of current) {
      if (component.draft) {
        await launchComponentKV(context.env, {
          componentId: component.id,
          data: component.data,
        });
      }
    }
  }

  return respond(
    Response.json({
      components: current.map((c) => ({
        id: c.id,
        ...update,
      })),
    }),
  );
};
