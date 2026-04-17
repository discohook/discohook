import { type RawFile, REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  type APIAttachment,
  type APIMessage,
  PermissionFlagsBits,
  type RESTPostAPIChannelMessageJSONBody,
  Routes,
} from "discord-api-types/v10";
import z from "zod/v3";
import { zx } from "zodix";
import { authorizeRequest, getTokenGuildPermissions } from "~/session.server";
import { getDb, savedAttachments } from "~/store.server";
import { isDiscordAttachmentUrl, isDiscordError } from "~/util/discord";
import type { ActionArgs, LoaderArgs } from "~/util/loader";
import {
  jsonAsString,
  snowflakeAsString,
  zxParseForm,
  zxParseParams,
  zxParseQuery,
} from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { id: guildId } = zxParseParams(params, { id: snowflakeAsString() });
  const { limit, page } = zxParseQuery(request, {
    limit: zx.IntAsString.refine((v) => v > 0 && v < 100).default("50"),
    page: zx.IntAsString.refine((v) => v >= 0).default("0"),
  });

  const [token, respond] = await authorizeRequest(request, context);
  const { permissions, owner } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlagsBits.ManageMessages)) {
    throw respond(
      Response.json(
        { message: "Must have Manage Messages to access saved attachments" },
        { status: 403 },
      ),
    );
  }

  const db = getDb(context.env.HYPERDRIVE);
  const attachments = await db.query.savedAttachments.findMany({
    where: (table, { eq }) => eq(table.discordGuildId, guildId),
    columns: {
      id: true,
      filename: true,
      // title: true,
      // description: true,
      url: true,
      contentType: true,
    },
    limit,
    offset: page * limit,
  });
  return respond(
    json(
      attachments.map((attachment) => {
        if (isDiscordAttachmentUrl(attachment.url)) {
          // Let the preview know that this is a saved attachment
          const url = new URL(attachment.url);
          url.searchParams.set("sv", "1");
          return { ...attachment, url: url.href };
        }
        return attachment;
      }),
    ),
  );
};

export const action = async ({ request, context, params }: ActionArgs) => {
  const { id: guildId } = zxParseParams(params, { id: snowflakeAsString() });

  const [token, respond] = await authorizeRequest(request, context);
  const { permissions, owner } = await getTokenGuildPermissions(
    token,
    guildId,
    context.env,
  );
  if (!owner && !permissions.has(PermissionFlagsBits.ManageMessages)) {
    throw respond(
      Response.json(
        { message: "Must have Manage Messages to modify saved attachments" },
        { status: 403 },
      ),
    );
  }

  switch (request.method) {
    case "POST": {
      const form = await request.formData();
      const body = await zxParseForm(form, {
        payload_json: jsonAsString(
          z.object({
            attachments: z
              .object({
                filename: z.string(),
                title: z.string().optional(),
                description: z.string().optional(),
              })
              .array()
              .min(1)
              .max(5),
          }),
        ),
      });
      const files: RawFile[] = [];
      let i = 0;
      for (const attachment of body.payload_json.attachments) {
        const file = form.get(`file[${i}]`);
        if (!file) {
          throw respond(
            Response.json(
              {
                message: `Missing file for attachment ${i}: ${attachment.filename}`,
              },
              { status: 400 },
            ),
          );
        }
        if (!(file instanceof File)) {
          throw respond(
            Response.json(
              { message: `Form item file[${i}] is not a file` },
              { status: 400 },
            ),
          );
        }
        files.push({
          key: String(i),
          name: file.name,
          contentType: file.type,
          data: await file.bytes(),
        });
        i += 1;
      }

      const db = getDb(context.env.HYPERDRIVE);
      const guild = await db.query.discordGuilds.findFirst({
        where: (table, { eq }) => eq(table.id, guildId),
        columns: { attachmentChannelId: true },
      });
      if (!guild || !guild.attachmentChannelId) {
        throw respond(
          Response.json(
            { message: "Server does not have a configured attachment channel" },
            { status: 404 },
          ),
        );
      }

      const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
      let messageId: string;
      let attachments: APIAttachment[];
      try {
        const message = (await rest.post(
          Routes.channelMessages(String(guild.attachmentChannelId)),
          {
            body: {
              attachments: body.payload_json.attachments.map((a, id) => ({
                id,
                ...a,
              })),
            } satisfies RESTPostAPIChannelMessageJSONBody,
            files,
          },
        )) as APIMessage;
        messageId = message.id;
        attachments = message.attachments;
      } catch (e) {
        if (isDiscordError(e)) {
          throw respond(Response.json(e.rawError, { status: e.status }));
        }
        throw respond(Response.json({ message: String(e) }, { status: 500 }));
      }

      await db
        .insert(savedAttachments)
        .values(
          attachments.map((attachment) => ({
            id: BigInt(attachment.id),
            filename: attachment.filename,
            title: attachment.title,
            description: attachment.description,
            contentType: attachment.content_type ?? "application/octet-stream",
            url: attachment.url,
            userId: token.user.id,
            discordGuildId: guildId,
            discordmessageId: BigInt(messageId),
          })),
        )
        // should never happen
        .onConflictDoNothing();
      return respond(
        json(
          attachments.map((attachment) => {
            const url = new URL(attachment.url);
            url.searchParams.set("sv", "1");
            return {
              id: attachment.id,
              filename: attachment.filename,
              url: url.href,
              contentType:
                attachment.content_type ?? "application/octet-stream",
            };
          }),
        ),
      );
    }
    default:
      throw respond(
        Response.json({ message: "Method Not Allowed" }, { status: 405 }),
      );
  }
};
