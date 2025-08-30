import { Client as DjsClient } from "@discordjs/core";

export class Client extends DjsClient {
  public ready = false;
  public db = undefined;
}
