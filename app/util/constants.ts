export const WEBHOOK_URL_RE =
  /^https?:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d+)\/([\w-]+)(?:\?thread_id=(\d+))?$/;

export const MESSAGE_REF_RE =
  /^(?:https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/\d+\/\d+\/)?(\d+)$/;

export const PLAINTEXT_EMOJIS = new Set(["™", "™️", "©", "©️", "®", "®️"]);

export const CUSTOM_EMOJI_RE = /^<(a)?:(\w+):(\d+)>/;

export const EMOJI_NAME_RE = /^:([^\s:]+?(?:::skin-tone-\d)?):/;

export const MENTION_RE =
  /^<(@!?|@&|#)(\d+)>|^<(\/(?! )[\w -]*[\w-]):(\d+)>|^(@(?:everyone|here))/;
