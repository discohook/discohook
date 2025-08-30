import type { Client } from "./src/client";

declare module "@discordjs/core" {
  interface ToEventProps {
    client: Client;
  }
}
