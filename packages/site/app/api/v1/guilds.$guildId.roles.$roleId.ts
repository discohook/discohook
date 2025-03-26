import { REST } from "@discordjs/rest";
import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import {
  type APIRole,
  type RESTGetAPIGuildRolesResult,
  Routes,
} from "discord-api-types/v10";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { authorizeRequest } from "~/session.server";
import { discordRoles, getDb, makeSnowflake } from "~/store.server";
import type { ResolvableAPIRole } from "~/util/cache/CacheManager";
import { isDiscordError } from "~/util/discord";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { guildId, roleId } = zxParseParams(params, {
    guildId: z.literal("@global").or(snowflakeAsString()),
    roleId: snowflakeAsString(),
  });

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  const [, respond] = await authorizeRequest(request, context);

  const key = `cache-role-${roleId}`;
  const cached = await context.env.KV.get<ResolvableAPIRole>(key, "json");
  if (cached) return cached;

  const db = getDb(context.env.HYPERDRIVE);
  const dbRole = await db.query.discordRoles.findFirst({
    where: (discordRoles, { eq }) => eq(discordRoles.id, roleId),
    columns: {
      id: true,
      name: true,
      color: true,
      mentionable: true,
      managed: true,
      position: true,
      icon: true,
      unicodeEmoji: true,
    },
  });
  if (dbRole) {
    // TODO sniff out stale store
    const { unicodeEmoji, ...roleRest } = dbRole;
    const returnRole = {
      ...roleRest,
      id: String(roleRest.id),
      color: roleRest.color ?? 0,
      managed: roleRest.managed ?? false,
      mentionable: roleRest.mentionable ?? false,
      unicode_emoji: unicodeEmoji,
    } satisfies ResolvableAPIRole;

    await context.env.KV.put(key, JSON.stringify(returnRole), {
      // 2 hours
      expirationTtl: 7200,
    });
    return respond(json(returnRole));
  }

  if (guildId === "@global") {
    throw respond(
      json({ message: "The role could not be found without a guild ID" }, 404),
    );
  }

  let roles: APIRole[];
  try {
    roles = (await rest.get(
      Routes.guildRoles(String(guildId)),
    )) as RESTGetAPIGuildRolesResult;
  } catch (e) {
    throw respond(
      json(
        isDiscordError(e) ? e.rawError : { message: "Failed to fetch roles" },
        404,
      ),
    );
  }

  if (roles.length !== 0) {
    await db
      .insert(discordRoles)
      .values(
        roles.map((role) => ({
          guildId,
          id: makeSnowflake(role.id),
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          icon: role.icon,
          unicodeEmoji: role.unicode_emoji,
          managed: role.managed,
          mentionable: role.mentionable,
          permissions: role.permissions,
          position: role.position,
        })),
      )
      .onConflictDoUpdate({
        target: [discordRoles.id],
        set: {
          name: sql`excluded.name`,
          color: sql`excluded.color`,
          hoist: sql`excluded.hoist`,
          icon: sql`excluded.icon`,
          unicodeEmoji: sql`excluded."unicodeEmoji"`,
          managed: sql`excluded.managed`,
          mentionable: sql`excluded.mentionable`,
          permissions: sql`excluded.permissions`,
          position: sql`excluded.position`,
        },
      });
  }

  const role = roles.find((r) => r.id === String(roleId));
  if (!role) {
    throw respond(json({ message: "Unknown Role" }, 404));
  }

  const returnRole = {
    id: role.id,
    name: role.name,
    color: role.color,
    icon: role.icon,
    unicode_emoji: role.unicode_emoji,
    managed: role.managed,
    mentionable: role.mentionable,
    position: role.position,
  } satisfies ResolvableAPIRole;

  await context.env.KV.put(key, JSON.stringify(returnRole), {
    // 2 hours
    expirationTtl: 7200,
  });
  return respond(json(returnRole));
};
