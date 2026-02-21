const guildId = process.argv[2];
if (!guildId) {
  throw Error("guild ID is a positional argument that is missing.");
}

const config = (await Bun.file("./config.json").json()) as {
  shards: number;
  clusters: number;
};

const shardId = Number((BigInt(guildId) >> 22n) % BigInt(config.shards));

const SHARDS_PER_CLUSTER = Math.floor(config.shards / config.clusters);

let clusterId = -1;
for (let cluster = 0; cluster < config.clusters; cluster += 1) {
  const shardIds = Array(config.shards)
    .fill(
      0,
      cluster * SHARDS_PER_CLUSTER,
      // BUG: the very last shard is not accounted for. this doesn't matter
      // that much because this is just for display but it's good to keep in
      // mind in case we copy this code somewhere that it does matter.
      Math.min((cluster + 1) * SHARDS_PER_CLUSTER, config.shards),
    )
    .filter((val) => val === 0)
    .map((_, i) => i + cluster * SHARDS_PER_CLUSTER);

  // console.log({
  //   cluster,
  //   shardsFrom: shardIds[0],
  //   shardsTo: shardIds.slice(-1)[0],
  // });
  if (shardIds.includes(shardId)) {
    clusterId = cluster;
  }
}

// start: cluster * SHARDS_PER_CLUSTER,
// end: Math.min((cluster + 1) * SHARDS_PER_CLUSTER, SHARD_COUNT) - 1,

console.log(`\
Guild ID: ${guildId}
Shard ID: ${shardId} (${shardId + 1}/${config.shards})
Cluster ID: ${clusterId}
Shards per cluster: ${SHARDS_PER_CLUSTER}`);
