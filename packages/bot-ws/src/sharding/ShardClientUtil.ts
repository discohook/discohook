import { calculateShardId } from "@discordjs/util";
import { WebSocketManager, WebSocketShardEvents } from "@discordjs/ws";
import { Snowflake } from "discord-api-types/globals";
import type { ChildProcess } from "node:child_process";
import np from "node:process";

// Pretty awful
const process = <ChildProcess>(<unknown>np);

/**
 * Helper class for sharded clients spawned as a child process/worker, such as from a {@link ShardingManager}.
 * Utilises IPC to send and receive data to/from the master process and other shards.
 */
export class ShardClientUtil {
  static _singleton: ShardClientUtil | undefined;

  constructor(public manager: WebSocketManager) {
    process.on("message", this._handleMessage.bind(this));
    this.manager.on(WebSocketShardEvents.Ready, () => {
      process.send({ _ready: true });
    });
    this.manager.on(WebSocketShardEvents.Closed, () => {
      process.send({ _disconnect: true });
    });
    // this.manager.on(WebSocketShardEvents., () => {
    //   process.send({ _reconnecting: true });
    // });
    this.manager.on(WebSocketShardEvents.Resumed, () => {
      process.send({ _resume: true });
    });
  }

  /**
   * Array of shard ids of this this.manager
   * @type {number[]}
   * @readonly
   */
  get ids() {
    return this.manager.options.shardIds;
  }

  /**
   * Total number of shards
   * @type {number}
   * @readonly
   */
  get count() {
    return this.manager.options.shardCount;
  }

  /**
   * Sends a message to the master process.
   * @param {*} message Message to send
   * @returns {Promise<void>}
   * @emits Shard#message
   */
  send(message: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      process.send(message, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Requests a respawn of all shards.
   * @param {MultipleShardRespawnOptions} [options] Options for respawning shards
   * @returns {Promise<void>} Resolves upon the message being sent
   * @see {@link ShardingManager#respawnAll}
   */
  respawnAll({
    shardDelay = 5_000,
    respawnDelay = 500,
    timeout = 30_000,
  }: MultipleShardRespawnOptions = {}): Promise<void> {
    return this.send({ _sRespawnAll: { shardDelay, respawnDelay, timeout } });
  }

  /**
   * Handles an IPC message.
   * @param {*} message Message received
   * @private
   */
  async _handleMessage(message: any) {
    if (!message) return;
    if (message._fetchProp) {
      try {
        const props = message._fetchProp.split(".");
        // let value = this.client;
        // for (const prop of props) value = value[prop];
        this._respond("fetchProp", {
          _fetchProp: message._fetchProp,
          // _result: value,
        });
      } catch (err) {
        this._respond("fetchProp", {
          _fetchProp: message._fetchProp,
          // _error: makePlainError(err),
        });
      }
    } else if (message._eval) {
      try {
        this._respond("eval", {
          _eval: message._eval,
          // _result: await this.client._eval(message._eval),
        });
      } catch (err) {
        this._respond("eval", {
          _eval: message._eval,
          // _error: makePlainError(err),
        });
      }
    }
  }

  /**
   * Sends a message to the master process, emitting an error from the client upon failure.
   * @param {string} type Type of response to send
   * @param {*} message Message to send
   * @private
   */
  _respond(type: string, message: any) {
    this.send(message).catch((err) => {
      const error = new Error(
        `Error when sending ${type} response to master process: ${err.message}`,
      );
      error.stack = err.stack;
      /**
       * Emitted when the client encounters an error.
       * <warn>Errors thrown within this event do not have a catch handler, it is
       * recommended to not use async functions as `error` event handlers. See the
       * [Node.js docs](https://nodejs.org/api/events.html#capture-rejections-of-promises) for details.</warn>
       * @event Client#error
       * @param {Error} error The error encountered
       */
      this.manager.emit(Events.Error, error);
    });
  }

  /**
   * Creates/gets the singleton of this class.
   * @param {WebSocketManager} manager The manager to use
   * @returns {ShardClientUtil}
   */
  static singleton(manager: WebSocketManager): ShardClientUtil {
    if (!ShardClientUtil._singleton) {
      ShardClientUtil._singleton = new ShardClientUtil(manager);
    } else {
      // client.emit(
      //   Events.Warn,
      //   "Multiple clients created in child process/worker; only the first will handle sharding helpers.",
      // );
    }
    return ShardClientUtil._singleton;
  }

  /**
   * Get the shard id for a given guild id.
   * @param {Snowflake} guildId Snowflake guild id to get shard id for
   * @param {number} shardCount Number of shards
   * @returns {number}
   */
  static shardIdForGuildId(guildId: Snowflake, shardCount: number): number {
    const shard = calculateShardId(guildId, shardCount);
    // if (shard < 0) {
    //   throw new DiscordjsError(
    //     ErrorCodes.ShardingShardMiscalculation,
    //     shard,
    //     guildId,
    //     shardCount,
    //   );
    // }
    return shard;
  }

  /**
   * Increments max listeners by one for a given emitter, if they are not zero.
   * @param {EventEmitter|process} emitter The emitter that emits the events.
   * @private
   */
  incrementMaxListeners(emitter: EventEmitter | process) {
    const maxListeners = emitter.getMaxListeners();
    if (maxListeners !== 0) {
      emitter.setMaxListeners(maxListeners + 1);
    }
  }

  /**
   * Decrements max listeners by one for a given emitter, if they are not zero.
   * @param {EventEmitter|process} emitter The emitter that emits the events.
   * @private
   */
  decrementMaxListeners(emitter: EventEmitter | process) {
    const maxListeners = emitter.getMaxListeners();
    if (maxListeners !== 0) {
      emitter.setMaxListeners(maxListeners - 1);
    }
  }
}

module.exports = ShardClientUtil;
