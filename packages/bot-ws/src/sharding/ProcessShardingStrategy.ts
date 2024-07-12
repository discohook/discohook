import { IShardingStrategy, WebSocketManager } from "@discordjs/ws";

// Includes code borrowed & modified from https://github.com/discordjs/discord.js/blob/%40discordjs/ws%401.1.1/packages/ws/src/strategies/sharding
// discord.js is licensed under Apache 2.0.
// ---
// This class is inspired by WorkerShardingStrategy except that it has been
// made to work similarly to ShardingManager in `process` mode, making use of
// `node:process` to spawn subprocesses for each cluster of shards.

export class ProcessShardingStrategy implements IShardingStrategy {
  public constructor(
    private readonly manager: WebSocketManager,
    private readonly options: ProcessShardingStrategyOptions,
  ) {
    this.manager = manager;
  }

  public async spawn(shardIds: number[]) {}
}
