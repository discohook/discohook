import { json } from "@remix-run/cloudflare";
import { getDb } from "store";
import { z } from "zod";
import { backups, makeSnowflake } from "~/store.server";
import { ZodDiscohookBackup } from "~/types/discohook";
import { ActionArgs, LoaderArgs } from "~/util/loader";
import { getUserAvatar } from "~/util/users";
import { findMessagesPreviewImageUrl } from "./backups";

const getCorsHeaders = (origin?: string): Record<string, string> => {
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "X-Discohook-Pixiedust, Content-Type",
  };
};

const verifyToken = async (request: Request, kv: KVNamespace) => {
  const token = request.headers.get("X-Discohook-Pixiedust");
  if (!token) throw json({ message: "No token provided." }, 401);

  const data = await kv.get<{ userId: string }>(`magic-token-${token}`, "json");
  if (!data)
    throw json(
      {
        message:
          "Invalid or expired session. Go back to the previous page and try again.",
      },
      401,
    );
  return { ...data, token };
};

export const loader = async ({ request, context }: LoaderArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(undefined, {
      headers: getCorsHeaders(context.env.LEGACY_ORIGIN),
    });
  }

  const { userId } = await verifyToken(request, context.env.KV);
  const db = getDb(context.env.HYPERDRIVE.connectionString);
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, makeSnowflake(userId)),
    columns: {
      name: true,
    },
    with: {
      // I don't understand Drizzle many relations
      // backups: {
      //   columns: {
      //     name: true,
      //   },
      // },
      discordUser: {
        columns: {
          id: true,
          discriminator: true,
          avatar: true,
        },
      },
    },
  });
  if (!user) {
    throw json(
      { message: "The user associated with this token no longer exists." },
      { status: 404, headers: getCorsHeaders(context.env.LEGACY_ORIGIN) },
    );
  }
  const userBackups = await db.query.backups.findMany({
    where: (backups, { eq }) => eq(backups.ownerId, makeSnowflake(userId)),
    columns: {
      name: true,
    },
  });
  return json(
    {
      name: user.name,
      avatarUrl: getUserAvatar(user, { size: 64 }),
      backups: userBackups,
    },
    { headers: getCorsHeaders(context.env.LEGACY_ORIGIN) },
  );
};

export const action = async ({ request, context }: ActionArgs) => {
  const { userId, token } = await verifyToken(request, context.env.KV);
  const parsed = await z
    .object({
      // settings: z
      //   .object({
      //     theme: z.enum(["light", "dark"]).optional(),
      //     display: z.enum(["cozy", "compact"]).optional(),
      //     fontSize: z.onumber(),
      //     confirmExit: z.oboolean(),
      //     expandSections: z.oboolean(),
      //   })
      //   .optional(),
      backups: ZodDiscohookBackup.array(),
    })
    .safeParseAsync(await request.json());
  if (!parsed.success) {
    throw json(
      { message: "Bad request", error: parsed.error },
      { status: 400, headers: getCorsHeaders(context.env.LEGACY_ORIGIN) },
    );
  }

  const db = getDb(context.env.HYPERDRIVE.connectionString);
  await db
    .insert(backups)
    .values(
      parsed.data.backups.map((backup) => ({
        name: backup.name.slice(0, 100),
        data: {
          version: "d2" as const,
          messages: backup.messages,
          targets: backup.targets,
        },
        dataVersion: "d2" as const,
        ownerId: makeSnowflake(userId),
        previewImageUrl: findMessagesPreviewImageUrl(backup.messages),
        importedFromOrg: true,
      })),
    )
    .onConflictDoNothing();

  try {
    await context.env.KV.delete(`magic-token-${token}`);
  } catch {}
  return new Response(undefined, {
    status: 204,
    headers: getCorsHeaders(context.env.LEGACY_ORIGIN),
  });
};
