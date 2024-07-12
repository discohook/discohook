export interface ProcessShardingStrategyOptions {
  /**
   * Dictates how many shards should be spawned per process.
   */
  shardsPerProcess: number | "all";
}
