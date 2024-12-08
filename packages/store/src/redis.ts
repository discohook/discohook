import { Env } from "./kv.js";

interface RedisOptions {
  url: string;
  username: string;
  password: string;
  database?: string;
}

type RedisValue =
  | string
  | number
  | null
  // status (ping, type, error, ...)
  | [boolean, string]
  // list
  | string[];

export class RedisKV<Key extends string = string> {
  constructor(private options: RedisOptions) {}

  private get auth() {
    const credentials = `${this.options.username}:${this.options.password}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  send(command: "GET", ...parameters: string[]): Promise<string | null>;
  send(
    command: "SET" | "MULTI" | "DISCARD",
    ...parameters: string[]
  ): Promise<[boolean, string]>;
  send(
    command: "LIST" | "EXEC",
    ...parameters: string[]
  ): Promise<string[] | null>;
  send(command: "DEL" | "INCR", ...parameters: string[]): Promise<number>;
  async send(command: string, ...parameters: string[]): Promise<RedisValue> {
    const commands = [command, ...parameters];
    if (this.options.database) {
      commands.splice(0, 0, this.options.database);
    }

    const response = await fetch(this.options.url, {
      method: "POST",
      body: commands.map(encodeURIComponent).join("/"),
      headers: {
        Authorization: this.auth,
        "Content-Type": "text/plain",
      },
    });
    if (!response.ok) {
      const text = await response.text();
      throw Error(
        `Redis request failed (${response.status} on ${command}/${
          this.options.database ?? 0
        }): ${text}`,
      );
    }

    const raw = (await response.json()) as Record<string, RedisValue>;
    return raw[command];
  }

  get(key: Key, type: "text"): Promise<string | null>;
  get<ExpectedValue = unknown>(
    key: Key,
    type: "json",
  ): Promise<ExpectedValue | null>;
  get(
    key: Key,
    options?: KVNamespaceGetOptions<"text">,
  ): Promise<string | null>;
  get<ExpectedValue = unknown>(
    key: Key,
    options?: KVNamespaceGetOptions<"json">,
  ): Promise<ExpectedValue | null>;
  async get<ExpectedValue = unknown>(
    key: Key,
    options?: "text" | "json" | KVNamespaceGetOptions<"text" | "json">,
  ): Promise<ExpectedValue | string | null> {
    if (key === "test/123.abc") {
      // There is some residual code running somehow(?) in the Get Guild Role
      // route that causes this key to be fetched every time. To reduce
      // outgoing requests and processing time we just intercept it. Needs to
      // be properly fixed in the future. The log is here to show whether this
      // is still happening.
      console.log(`[REDIS] GET ${key.slice(0, 100)} (skip)`);
      return null;
    }

    const value = await this.send("GET", key);
    if (value === null) {
      console.log(`[REDIS] GET ${key.slice(0, 100)} (nil)`);
      return null;
    }
    console.log(`[REDIS] GET ${key.slice(0, 100)} (present)`);

    // value is `string` at this point
    const parsed = JSON.parse(String(value)) as {
      value: ExpectedValue;
      metadata: any | null;
    };

    if (
      typeof parsed.value === "string" &&
      (options === "json" ||
        (typeof options !== "string" && options?.type === "json"))
    ) {
      return JSON.parse(parsed.value);
    }
    return parsed.value;
  }

  getWithMetadata<Metadata = unknown>(
    key: Key,
    options?: Partial<KVNamespaceGetOptions<undefined>>,
  ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
  getWithMetadata<Metadata = unknown>(
    key: Key,
    type: "text",
  ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
  getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
    key: Key,
    type: "json",
  ): Promise<KVNamespaceGetWithMetadataResult<ExpectedValue, Metadata>>;
  getWithMetadata<Metadata = unknown>(
    key: Key,
    options: KVNamespaceGetOptions<"text">,
  ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
  getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
    key: Key,
    options: KVNamespaceGetOptions<"json">,
  ): Promise<KVNamespaceGetWithMetadataResult<ExpectedValue, Metadata>>;
  async getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(
    key: Key,
    options?: "text" | "json" | KVNamespaceGetOptions<"text" | "json">,
  ): Promise<
    KVNamespaceGetWithMetadataResult<ExpectedValue | string, Metadata>
  > {
    const value = await this.send("GET", key);
    if (value === null) {
      console.log(`[REDIS] GET ${key.slice(0, 100)} (nil)`);
      return { value: null, metadata: null, cacheStatus: null };
    }
    const parsed = JSON.parse(String(value)) as {
      value: ExpectedValue;
      metadata: any | null;
    };
    const metadata = parsed.metadata
      ? (JSON.parse(parsed.metadata) as Metadata)
      : null;

    console.log(`[REDIS] GET ${key.slice(0, 100)} (present)`);
    if (
      typeof parsed.value === "string" &&
      (options === "json" ||
        (typeof options !== "string" && options?.type === "json"))
    ) {
      return {
        value: JSON.parse(parsed.value) as ExpectedValue,
        metadata,
        cacheStatus: null,
      };
    }
    return {
      value: parsed.value,
      metadata,
      cacheStatus: null,
    };
  }

  async put(key: string, value: string, options?: KVNamespacePutOptions) {
    const opts: string[] = [];
    if (options?.expirationTtl) {
      opts.push("EX", String(Math.floor(options.expirationTtl)));
    } else if (options?.expiration) {
      opts.push("EXAT", String(Math.floor(options.expiration)));
    }

    console.log(`[REDIS] SET ${key.slice(0, 100)}`);
    await this.send(
      "SET",
      key,
      JSON.stringify({ value, metadata: options?.metadata ?? null }),
      ...opts,
    );
  }

  async delete(key: string) {
    await this.send("DEL", key);
  }

  async list<Metadata = unknown>(
    options?: KVNamespaceListOptions,
  ): Promise<KVNamespaceListResult<Metadata, Key>> {
    // We don't use this anyway
    return { keys: [], cacheStatus: null, list_complete: true };
  }
}

export const getRedis = (env: Env): RedisKV => {
  const { protocol, host, username, password, pathname } = new URL(
    env.REDIS_URL,
  );
  return new RedisKV({
    url: `${protocol.replace("redis", "http")}//${host}`,
    username,
    password,
    database: pathname.substring(1) || undefined,
  });
};
