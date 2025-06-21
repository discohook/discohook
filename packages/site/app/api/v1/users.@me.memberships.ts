import type { SerializeFrom } from "@remix-run/cloudflare";
import { PermissionsBitField } from "discord-bitflag";
import { z } from "zod";
import { zx } from "zodix";
import { getUserId } from "~/session.server";
import {
  discordGuilds,
  discordMembers,
  eq,
  getDb,
  users,
} from "~/store.server";
import type { LoaderArgs } from "~/util/loader";
import { zxParseQuery } from "~/util/zod";

export const loader = async ({ request, context }: LoaderArgs) => {
  const { permissions: filterPermissions, owner: mustOwn } = zxParseQuery(
    request,
    {
      permissions: z
        .string()
        .refine((v) => {
          try {
            new PermissionsBitField(BigInt(v));
            return true;
          } catch {
            return false;
          }
        })
        .transform((v) => new PermissionsBitField(BigInt(v)))
        .optional(),
      owner: zx.BoolAsString.optional(),
    },
  );

  const userId = await getUserId(request, context, true);

  const db = getDb(context.env.HYPERDRIVE);
  // const memberships = await db
  //   .select({
  //     id: discordGuilds.id,
  //     name: discordGuilds.name,
  //     icon: discordGuilds.icon,
  //     botJoinedAt: discordGuilds.botJoinedAt,
  //     owner: discordMembers.owner,
  //     permissions: discordMembers.permissions,
  //     favorite: discordMembers.favorite,
  //   })
  //   .from(discordMembers)
  //   .leftJoin(users, eq(users.discordId, discordMembers.userId))
  //   .where(eq(users.id, userId))
  //   .leftJoin(discordGuilds, eq(discordGuilds.id, discordMembers.guildId));
  const memberships = await db
    .select({
      id: discordGuilds.id,
      name: discordGuilds.name,
      icon: discordGuilds.icon,
      botJoinedAt: discordGuilds.botJoinedAt,
      owner: discordMembers.owner,
      permissions: discordMembers.permissions,
      favorite: discordMembers.favorite,
    })
    .from(discordMembers)
    .leftJoin(users, eq(users.discordId, discordMembers.userId))
    .where(eq(users.id, userId))
    .rightJoin(discordGuilds, eq(discordGuilds.id, discordMembers.guildId));

  return memberships
    .filter((ship) => {
      if (mustOwn && !ship.owner) return false;
      if (filterPermissions) {
        // owner has all permissions
        if (ship.owner) return true;

        const perm = new PermissionsBitField(BigInt(ship.permissions ?? "0"));
        return perm.has(filterPermissions);
      }
      return true;
    })
    .map((ship) => ({
      owner: ship.owner,
      permissions: ship.permissions,
      favorite: ship.favorite,
      guild: {
        id: ship.id,
        name: ship.name,
        icon: ship.icon,
        botJoinedAt: ship.botJoinedAt,
      },
    }));
};

export type ApiGetCurrentUserMemberships = Awaited<
  SerializeFrom<typeof loader>
>;

export type Membership = ApiGetCurrentUserMemberships[number];
