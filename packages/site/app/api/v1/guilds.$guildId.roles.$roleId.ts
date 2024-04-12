import { REST } from "@discordjs/rest";
import { json } from "@remix-run/cloudflare";
import {
  APIRole,
  RESTGetAPIGuildRolesResult,
  Routes
} from "discord-api-types/v10";
import { PermissionsBitField } from "discord-bitflag";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { refreshAuthToken } from "~/routes/s.$guildId";
import {
  discordRoles,
  eq,
  getDb,
  makeSnowflake
} from "~/store.server";
import {
  ResolvableAPIRole
} from "~/util/cache/CacheManager";
import { LoaderArgs } from "~/util/loader";
import { snowflakeAsString, zxParseParams } from "~/util/zod";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId, roleId } = zxParseParams(params, {
    guildId: z.literal("@global").or(snowflakeAsString()),
    roleId: snowflakeAsString(),
  });

  let permissions: PermissionsBitField | undefined;
  if (guildId !== "@global") {
    // You only need to be a member for this route
    ({ permissions } = await refreshAuthToken(
      String(guildId),
      request,
      context,
      true,
    ));
  }

  const rest = new REST().setToken(context.env.DISCORD_BOT_TOKEN);
  const db = getDb(context.env.DATABASE_URL);

  const dbRole = await db.query.discordRoles.findFirst({
    where: eq(discordRoles.id, roleId),
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
    const { unicodeEmoji } = dbRole;
    // @ts-expect-error
    // biome-ignore lint/performance/noDelete: Actually remove it from response so it doesn't get cached
    delete dbRole.unicodeEmoji;
    return {
      ...dbRole,
      id: String(dbRole.id),
      color: dbRole.color ?? 0,
      managed: dbRole.managed ?? false,
      mentionable: dbRole.mentionable ?? false,
      unicode_emoji: unicodeEmoji,
    } satisfies ResolvableAPIRole;
  }

  if (guildId === "@global") {
    throw json(
      { message: "The role could not be found without a guild ID" },
      404,
    );
  }

  let roles: APIRole[];
  try {
    roles = (await rest.get(
      Routes.guildRoles(String(guildId)),
    )) as RESTGetAPIGuildRolesResult;
  } catch (e) {
    console.log(e);
    throw json({ message: "Failed to fetch roles" }, 404);
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
    throw json({ message: "The role does not exist" }, 404);
  }

  return {
    id: role.id,
    name: role.name,
    color: role.color,
    icon: role.icon,
    unicode_emoji: role.unicode_emoji,
    managed: role.managed,
    mentionable: role.mentionable,
    position: role.position,
  } satisfies ResolvableAPIRole;
};
