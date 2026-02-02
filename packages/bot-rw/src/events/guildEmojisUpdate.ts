import { GatewayDispatchEvents } from "discord-api-types/v10";
import { createHandler } from "./handler";

// Automatically manage emoji cache so we don't need to deal with stale data.
// Ideally small enough that this isn't an issue
export default createHandler(
  GatewayDispatchEvents.GuildEmojisUpdate,
  async ({ client, data }) => {
    const manager = client.emojiManagers.get(data.guild_id);
    if (manager) {
      manager.updateEmojis(
        data.emojis.map(({ id, name, animated }) => ({ id, name, animated })),
      );
    }
    // Wait until we need it so we don't just cache every server's
    // emojis for no reason
    // else {
    //   const manager = new EmojiManagerCache(data.emojis);
    //   client.emojiManagers.set(data.guild_id, manager);
    // }
  },
);
