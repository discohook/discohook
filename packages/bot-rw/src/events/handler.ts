import type { Client, MappedEvents } from "@discordjs/core";
import type {
  AsyncEventEmitter,
  AsyncEventEmitterListenerForEvent,
} from "@vladfrangu/async_event_emitter";
import type { GatewayDispatchEvents } from "discord-api-types/v10";

export const createHandler = <E extends GatewayDispatchEvents>(
  event: E,
  callback: AsyncEventEmitterListenerForEvent<
    AsyncEventEmitter<MappedEvents>,
    E
  >,
) => {
  // TODO: see if necessary
  // const wrapped = async (payload: any) => {
  //   try {
  //     return await callback(payload);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  return (client: Client) => {
    // @ts-expect-error
    client.addListener(event, (payload) => {
      payload.client = client;
      return callback(payload);
    });
  };
};
