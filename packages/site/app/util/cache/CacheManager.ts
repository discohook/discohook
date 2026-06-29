import type { SerializeFrom } from "@remix-run/cloudflare";
import {
  RouteBases,
  type APIApplication,
  type APIChannel,
  type APIGuild,
  type APIGuildForumTag,
  type APIGuildMember,
  type APIRole,
  type APIUser,
} from "discord-api-types/v10";
import { useReducer } from "react";
import { apiUrl, BRoutes, type ApiRoute } from "~/api/routing";
import type { loader as ApiGetGuildCacheable } from "~/api/v1/guilds.$guildId.cacheable";

export type Resolutions = {
  [key: `channel:${string}`]: ResolvableAPIChannel | undefined | null;
  [key: `member:${string}`]: ResolvableAPIGuildMember | undefined | null;
  [key: `role:${string}`]: ResolvableAPIRole | undefined | null;
  [key: `emoji:${string}`]: ResolvableAPIEmoji | undefined | null;
  [key: `app:${string}`]: ResolvableAPIApplication | undefined | null;
};

export type ResolutionKey = keyof Resolutions;

type Resolvable =
  | ResolvableAPIChannel
  | ResolvableAPIGuildMember
  | ResolvableAPIRole
  | ResolvableAPIEmoji
  | ResolvableAPIApplication;

class ResourceCacheManagerBase<T extends Resolvable> {
  constructor(public manager: CacheManager) {}

  _get(key: ResolutionKey): T | undefined {
    return this.manager.state[key] as T;
  }

  _getAll(prefix: string, filter?: (instance: T) => boolean) {
    return Object.entries(this.manager.state)
      .filter(
        (p): p is [ResolutionKey, T] =>
          !!p[1] &&
          p[0].startsWith(prefix) &&
          (filter ? filter(p[1] as T) : true),
      )
      .map(([, v]) => v);
  }

  _put(key: ResolutionKey, resource: T | null) {
    this.manager.setState({ [key]: resource } as Resolutions);
  }

  async _fetch<RawT = T>(route: ApiRoute): Promise<RawT | null> {
    const response = await fetch(apiUrl(route), {
      method: "GET",
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
  | "media"
  | "post";

export const tagToResolvableTag = (
  tag: APIGuildForumTag,
): ResolvableAPIGuildForumTag => ({
  id: tag.id,
  name: tag.name,
  moderated: tag.moderated ? true : undefined,
  emoji_id: tag.emoji_id ? tag.emoji_id : undefined,
  emoji_name: tag.emoji_name ? tag.emoji_name : undefined,
});

export type ResolvableAPIGuildForumTag = Pick<
  APIGuildForumTag,
  "id" | "name"
> & {
  moderated?: boolean;
  emoji_id?: string;
  emoji_name?: string;
};

export type ResolvableAPIChannel = Pick<APIChannel, "id" | "name"> & {
  type: ResolvableAPIChannelType;
  tags?: ResolvableAPIGuildForumTag[];
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

export type ResolvableAPIEmoji = {
  id: string | undefined;
  name: string;
  animated?: boolean;
  available?: false;
};

export type ResolvableAPIApplication = Pick<
  APIApplication,
  "id" | "name" | "icon" | "cover_image"
>;

class ChannelResourceManager extends ResourceCacheManagerBase<ResolvableAPIChannel> {
  get(id: string) {
    return this._get(`channel:${id}`);
  }

  getAll(filter?: (instance: ResolvableAPIChannel) => boolean) {
    return this._getAll("channel:", filter);
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

    this.manager.fill(
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
    const pair = Object.entries(this.manager.state).find(
      (p): p is [ResolutionKey, ResolvableAPIGuildMember] =>
        p[0].startsWith("member:") && p[0].endsWith(`-${userId}`),
    );
    if (pair) {
      return pair[1];
    }
  }

  getAll(filter?: (instance: ResolvableAPIGuildMember) => boolean) {
    return this._getAll("member:", filter);
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

  getAll(filter?: (instance: ResolvableAPIRole) => boolean) {
    return this._getAll("role:", filter);
  }

  async fetch(guildId: string, roleId: string) {
    const resource = await this._fetch(BRoutes.guildRole(guildId, roleId));
    this._put(`role:${roleId}`, resource);
    return resource;
  }

  // async fetchMany(guildId: string) {
  //   const resource = await this._fetch<ResolvableAPIRole[]>(
  //     BRoutes.guildRoles(guildId),
  //   );
  //   if (!resource) return [];

  //   this.manager.fill(
  //     ...resource.map(
  //       (r) => [`role:${r.id}`, r] satisfies [ResolutionKey, ResolvableAPIRole],
  //     ),
  //   );
  //   return resource;
  // }
}

class EmojiResourceManager extends ResourceCacheManagerBase<ResolvableAPIEmoji> {
  get(id: string) {
    return this._get(`emoji:${id}`);
  }

  getAll(filter?: (instance: ResolvableAPIEmoji) => boolean) {
    return this._getAll("emoji:", filter);
  }

  // async fetch(id: string) {
  //   const resource = await this._fetch(BRoutes.emoji(id));
  //   this._put(`emoji:${id}`, resource);
  //   return resource;
  // }

  // async fetchMany(guildId: string) {
  //   const resource = await this._fetch<ResolvableAPIEmoji[]>(
  //     BRoutes.guildEmojis(guildId),
  //   );
  //   if (!resource) return [];

  //   this.manager.fill(
  //     ...resource.map(
  //       (r) =>
  //         [`emoji:${r.id}`, r] satisfies [ResolutionKey, ResolvableAPIEmoji],
  //     ),
  //   );
  //   return resource;
  // }
}

class ApplicationResourceManager extends ResourceCacheManagerBase<ResolvableAPIApplication> {
  get(id: string) {
    return this._get(`app:${id}`);
  }

  getAll(filter?: (instance: ResolvableAPIApplication) => boolean) {
    return this._getAll("app:", filter);
  }

  async fetch(id: string) {
    // Technically not documented but used by many applications. If it stops
    // working, it should be benign - these objects will just stop resolving
    const response = await fetch(`${RouteBases.api}/applications/${id}/rpc`, {
      method: "GET",
    });
    const data = (await response.json()) as APIApplication;
    if (!response.ok) {
      console.log(`Fetch failed: ${JSON.stringify(data)}`);
      this._put(`app:${id}`, null);
      return null;
    }
    const resource: ResolvableAPIApplication = {
      id: data.id,
      name: data.name,
      icon: data.icon,
      // /app-icons/:id/:cover_image.webp?keep_aspect_ratio=true
      cover_image: data.cover_image,
      // 5 = game?
      // type: data.type,
    };
    this._put(`app:${id}`, resource);
    return resource;
  }

  async fetchMany(guildId: string) {
    const resource = await this._fetch<ResolvableAPIApplication[]>(
      BRoutes.guildChannels(guildId),
    );
    if (!resource) return [];

    this.manager.fill(
      ...resource.map(
        (r) =>
          [`channel:${r.id}`, r] satisfies [
            ResolutionKey,
            ResolvableAPIApplication,
          ],
      ),
    );
    return resource;
  }
}

export type ResolutionScope = "channel" | "member" | "role" | "emoji" | "app";

// There's also weird behavior when mentioning webhooks that I'm
// not sure how to emulate so I'm leaving it out for now.
export class CacheManager {
  public state: Resolutions;
  public setState: React.Dispatch<Partial<Resolutions>>;
  public queue: ResolutionKey[];

  public channel: ChannelResourceManager;
  // public guilds: GuildResourceManager;
  public member: MemberResourceManager;
  public role: RoleResourceManager;
  public emoji: EmojiResourceManager;
  public application: ApplicationResourceManager;

  constructor(
    state: Resolutions,
    setState: React.Dispatch<Partial<Resolutions>>,
  ) {
    this.state = state;
    this.setState = setState;
    this.queue = [];

    this.channel = new ChannelResourceManager(this);
    // this.guilds = new GuildResourceManage();
    this.member = new MemberResourceManager(this);
    this.role = new RoleResourceManager(this);
    this.emoji = new EmojiResourceManager(this);
    this.application = new ApplicationResourceManager(this);
  }

  /**
   * Fill the state, overwriting previously defined values but preserving
   * values not present in the new set
   */
  fill(...entries: [key: ResolutionKey, resource: Resolvable][]) {
    this.setState(Object.fromEntries(entries) as Resolutions);
  }

  resolve(request: {
    scope: "channel";
    key: string;
  }): ResolvableAPIChannel | null | undefined;
  resolve(request: {
    scope: "member";
    key: string;
  }): ResolvableAPIGuildMember | null | undefined;
  resolve(request: {
    scope: "role";
    key: string;
  }): ResolvableAPIRole | null | undefined;
  resolve(request: {
    scope: "emoji";
    key: string;
  }): ResolvableAPIEmoji | null | undefined;
  resolve(request: {
    scope: "app";
    key: string;
  }): ResolvableAPIApplication | null | undefined;
  resolve(request: {
    scope: ResolutionScope;
    key: string;
  }):
    | ResolvableAPIChannel
    | ResolvableAPIGuildMember
    | ResolvableAPIRole
    | ResolvableAPIEmoji
    | ResolvableAPIApplication
    | null
    | undefined {
    const key = `${request.scope}:${request.key}` as const;
    const cached = this.state[key];
    if (cached) {
      return cached;
    }
    if (cached === null) {
      return null;
    }
    if (this.queue.includes(key)) {
      // Already resolving asynchronously
      return undefined;
    }

    this.queue.push(key);
    const unqueue = () => {
      this.queue = this.queue.filter((k) => k !== key);
    };

    switch (request.scope) {
      case "channel": {
        this.channel.fetch(request.key).then(unqueue);
        break;
      }
      case "member": {
        this.member
          .fetch(...(request.key.split("-") as [string, string]))
          .then(unqueue);
        break;
      }
      case "role": {
        this.role.fetch("@global", request.key).then(unqueue);
        break;
      }
      case "emoji": {
        // We don't really need to fetch emojis unless we want its details, so
        // for now we just append it to state for the emoji pickers.
        this.emoji._put(`emoji:${request.key}`, {
          id: request.key,
          name: "emoji",
        });
        unqueue();
        break;
      }
      case "app": {
        this.application.fetch(request.key).then(unqueue);
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
      emoji: [],
      app: [],
    };
    for (const request of requests) {
      const [scope, key] = request.split(":");
      byScope[scope as ResolutionScope].push(key);
    }

    // TODO: At some point, bind a guild somewhere and use fetchMany to reduce requests
    // TOOD: bot-ws should implement Request Guild Members to bulk-resolve members,
    // because for some reason that is the only way to get a list of members by ID
    for (const [scope, keys] of Object.entries(byScope)) {
      for (const key of keys) {
        // @ts-expect-error
        this.resolve({ scope, key });
      }
    }
  }

  async fetchGuildCacheable(guildId: string) {
    // TODO: move `_fetch` to main manager instance
    const mgr = new ResourceCacheManagerBase(this);

    const resources = await mgr._fetch<
      SerializeFrom<typeof ApiGetGuildCacheable>
    >(BRoutes.guildCacheable(guildId));
    if (!resources) return this;

    this.fill(
      ...resources.roles.map(
        (r) => [`role:${r.id}`, r] satisfies [ResolutionKey, ResolvableAPIRole],
      ),
      ...resources.channels.map(
        (r) =>
          [`channel:${r.id}`, r] satisfies [
            ResolutionKey,
            ResolvableAPIChannel,
          ],
      ),
      ...resources.emojis.map(
        (r) => [`emoji:${r.id}`, r] as [ResolutionKey, ResolvableAPIEmoji],
      ),
    );
    return this;
  }
}

const defaultCache: Resolutions = {
  "member:@global-792842038332358656": {
    user: {
      id: "792842038332358656",
      username: "Discohook Utils",
      global_name: null,
    },
  },
  "app:363445589247131668": {
    id: "363445589247131668",
    name: "ROBLOX",
    icon: "f2b60e350a2097289b3b0b877495e55f",
    cover_image: "82f092687242e81976b955927df9cd24",
  },
  "app:1402418491272986635": {
    id: "1402418491272986635",
    name: "Minecraft",
    icon: "166fbad351ecdd02d11a3b464748f66b",
    cover_image: "2975c144dc7e00ecf57018a4af98b1eb",
  },
  "app:1402418714716143646": {
    id: "1402418714716143646",
    name: "Grand Theft Auto V",
    icon: "b77111108195cd5e4dd2011dd39bf67d",
    cover_image: "f5747887acb51da9b2c252e7ec6292ca",
  },
};

export const useCache = <T extends boolean>(
  invalid?: T,
): T extends true ? undefined : CacheManager => {
  const [state, setState] = useReducer(
    (d: Resolutions, partialD: Partial<Resolutions>) => ({ ...d, ...partialD }),
    defaultCache,
  );
  const cache = new CacheManager(state, setState);
  return (invalid ? undefined : cache) as T extends true
    ? undefined
    : CacheManager;
};
