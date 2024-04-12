import {
  APIChannel,
  APIGuild,
  APIGuildMember,
  APIRole,
  APIUser,
} from "discord-api-types/v10";
import { useReducer } from "react";
import { ApiRoute, BRoutes, apiUrl } from "~/api/routing";

export type Resolutions = {
  [key: `channel:${string}`]: ResolvableAPIChannel | undefined | null;
  [key: `member:${string}`]: ResolvableAPIGuildMember | undefined | null;
  [key: `role:${string}`]: ResolvableAPIRole | undefined | null;
};

export type ResolutionKey = keyof Resolutions;

type Resolvable =
  | ResolvableAPIChannel
  | ResolvableAPIGuildMember
  | ResolvableAPIRole;

class ResourceCacheManagerBase<T extends Resolvable> {
  constructor(
    public manager: CacheManager,
    private token: string,
  ) {}

  _get(key: ResolutionKey): T | undefined {
    return this.manager.state[key] as T;
  }

  _put(key: ResolutionKey, resource: T | null) {
    this.manager.setState({ [key]: resource } as Resolutions);
  }

  /**
   * Fill the state, overwriting previously defined values but preserving
   * values not present in the new set
   */
  fill(...entries: [key: ResolutionKey, resource: T][]) {
    this.manager.setState(Object.fromEntries(entries) as Resolutions);
  }

  async _fetch<RawT = T>(route: ApiRoute): Promise<RawT | null> {
    const response = await fetch(apiUrl(route), {
      method: "GET",
      headers: {
        Authorization: `User ${this.token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      console.log(`Fetch failed: ${JSON.stringify(data)}`);
      return null;
    }
    return data as RawT;
  }
}

export type ResolvableAPIChannelType =
  | "text"
  | "voice"
  | "thread"
  | "forum"
  | "post";

export type ResolvableAPIChannel = Pick<APIChannel, "id" | "name"> & {
  type: ResolvableAPIChannelType;
};

export type ResolvableAPIGuild = Pick<APIGuild, "id" | "name" | "icon">;

export type ResolvableAPIGuildMember = Pick<APIGuildMember, "nick"> & {
  user: Pick<APIUser, "id" | "username" | "global_name">;
};

export type ResolvableAPIRole = Pick<
  APIRole,
  // Mentioning
  | "id"
  | "name"
  | "color"
  | "mentionable"
  // Assigning (& viewing)
  | "managed"
  | "position"
  | "icon"
  | "unicode_emoji"
>;

class ChannelResourceManager extends ResourceCacheManagerBase<ResolvableAPIChannel> {
  get(id: string) {
    return this._get(`channel:${id}`);
  }

  async fetch(id: string) {
    const resource = await this._fetch(BRoutes.channel(id));
    this._put(`channel:${id}`, resource);
    return resource;
  }

  async fetchMany(guildId: string) {
    const resource = await this._fetch<ResolvableAPIChannel[]>(
      BRoutes.guildChannels(guildId),
    );
    if (!resource) return [];

    this.fill(
      ...resource.map(
        (r) =>
          [`channel:${r.id}`, r] satisfies [
            ResolutionKey,
            ResolvableAPIChannel,
          ],
      ),
    );
    return resource;
  }
}

// class GuildResourceManager extends ResourceCacheManagerBase<ResolvableAPIGuild> {
//   get(id: string) {
//     return this._get(id);
//   }

//   async fetch(id: string) {
//     const resource = await this._fetch(BRoutes.guild(id));
//     this._put(id, resource);
//     return resource;
//   }
// }

class MemberResourceManager extends ResourceCacheManagerBase<ResolvableAPIGuildMember> {
  get(userId: string, guildId?: string) {
    if (guildId) {
      return this._get(`member:${guildId}-${userId}`);
    }

    // User mentions do not in themselves contain the context of a guild ID.
    // Therefore, since most users will only deal with one guild at a time,
    // we can search state for any member belonging to that user ID, while
    // still allowing a guild-specific search (above) if desired, with the
    // same state as a whole (i.e. not two maps w/ the same objects).
    const global = this._get(`member:@global-${userId}`);
    if (global) {
      return global;
    }

    // Unfortunately this method relies on iteration and so is not O(1), but
    // since state should always be relatively small I think this shouldn't be
    // an issue.
    const pair = Object.entries(this.manager.state).find((p) =>
      p[0].endsWith(`-${userId}`),
    );
    if (pair) {
      return pair[1];
    }
  }

  async fetch(guildId: string, userId: string) {
    const resource = await this._fetch(BRoutes.guildMember(guildId, userId));
    this._put(`member:${guildId}-${userId}`, resource);
    return resource;
  }
}

class RoleResourceManager extends ResourceCacheManagerBase<ResolvableAPIRole> {
  get(id: string) {
    return this._get(`role:${id}`);
  }

  async fetch(guildId: string, roleId: string) {
    const resource = await this._fetch(BRoutes.guildRole(guildId, roleId));
    this._put(`role:${roleId}`, resource);
    return resource;
  }

  async fetchMany(guildId: string) {
    const resource = await this._fetch<ResolvableAPIRole[]>(
      BRoutes.guildRoles(guildId),
    );
    if (!resource) return [];

    this.fill(
      ...resource.map(
        (r) => [`role:${r.id}`, r] satisfies [ResolutionKey, ResolvableAPIRole],
      ),
    );
    return resource;
  }
}

export type ResolutionScope = "channel" | "member" | "role";

// There's also weird behavior when mentioning webhooks that I'm
// not sure how to emulate so I'm leaving it out for now.
export class CacheManager {
  public state: Resolutions;
  public setState: React.Dispatch<Partial<Resolutions>>;

  public channel: ChannelResourceManager;
  // public guilds: GuildResourceManager;
  public member: MemberResourceManager;
  public role: RoleResourceManager;

  constructor(
    token: string,
    state: Resolutions,
    setState: React.Dispatch<Partial<Resolutions>>,
  ) {
    this.state = state;
    this.setState = setState;

    this.channel = new ChannelResourceManager(this, token);
    // this.guilds = new GuildResourceManager(token);
    this.member = new MemberResourceManager(this, token);
    this.role = new RoleResourceManager(this, token);
  }

  // resolve(request: { scope: "channels"; key: string }): ResolvableAPIChannel;
  // resolve(request: { scope: "members"; key: string }): ResolvableAPIGuildMember;
  // resolve(request: { scope: "roles"; key: string }): ResolvableAPIRole;
  resolve(request: { scope: ResolutionScope; key: string }) {
    const cached = this.state[`${request.scope}:${request.key}`];
    if (cached) {
      return cached;
    } else if (cached === null) {
      return null;
    }

    switch (request.scope) {
      case "channel": {
        this.channel.fetch(request.key);
        break;
      }
      case "member": {
        this.member.fetch(...(request.key.split("-") as [string, string]));
        break;
      }
      case "role": {
        this.role.fetch("@global", request.key);
        break;
      }
      default:
        break;
    }
  }

  resolveMany(requests: Set<string>) {
    const byScope: Record<ResolutionScope, string[]> = {
      channel: [],
      member: [],
      role: [],
    };
    for (const request of requests) {
      const [scope, key] = request.split(":");
      byScope[scope as ResolutionScope].push(key);
    }

    // TODO: At some point, bind a guild somewhere and use fetchMany to reduce requests
    for (const [scope, keys] of Object.entries(byScope)) {
      for (const key of keys) {
        this.resolve({ scope: scope as ResolutionScope, key });
      }
    }
  }
}

export const useCache = (token: string) => {
  const [state, setState] = useReducer(
    (d: Resolutions, partialD: Partial<Resolutions>) => ({ ...d, ...partialD }),
    {},
  );
  const cache = new CacheManager(token, state, setState);
  return cache;
};
