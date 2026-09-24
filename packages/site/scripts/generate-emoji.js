#!/usr/bin/env node
// @ts-check

import { writeFile } from "node:fs/promises";

/**
 * @typedef Emoji
 * @property {string[]} names
 * @property {string} surrogates
 * @property {boolean | undefined} hasDiversity
 */

/**
 * @typedef EmojiDiversity
 * @property {string[]} names
 * @property {string} surrogates
 * @property {("1f3fb" | "1f3fc" | "1f3fd" | "1f3fe" | "1f3ff")[]} diversity
 */

/**
 * @type {() => Promise<Emoji[]>}
 */
async function getEmojiBlob() {
  const js = await (
    await fetch(
      "https://github.com/Discord-Datamining/Discord-Datamining/raw/refs/heads/master/current.js",
    )
  ).text();
  const match = /JSON\.parse\('{"emojis":.+'\)/.exec(js);
  if (match) {
    try {
      // biome-ignore lint/security/noGlobalEval: trusted source
      const parsed = eval(`(()=>(${match[0]}))()`).emojis;
      return parsed;
    } catch (e) {
      console.error(e);
      throw Error("Emoji JSON failed to parse");
    }
  }

  throw Error("Emoji JSON could not be found");
}

const bitflag = {
  classic: 1 << 0,
  numbered: 1 << 1,
  named: 1 << 2,
  multiNumbered: 1 << 3,
  multiNamed: 1 << 4,
  diverseOnly: 1 << 5,
};

const data = [];
for (const emoji of await getEmojiBlob()) {
  const templates = [emoji.surrogates];
  /** @type {(string | [string, number])[]} */
  const names = emoji.names.map((name) => {
    const flags = emoji.hasDiversity ? bitflag.classic : 0;
    return flags === 0 ? name : [name, flags];
  });

  data.push([templates.length === 1 ? templates[0] : templates, ...names]);
}

const serialized = JSON.stringify(data);

// Served as a static asset for client-side fetching (~/util/emojis.ts)
await writeFile(
  new URL("../public/emoji.json", import.meta.url).pathname,
  serialized,
);
// Imported directly as module data (~/util/markdown/emoji.ts). I don't
// like this but Vite disallows importing modules from the public directory
// and we need a copy in the public directory so it can be a worker asset
await writeFile(
  new URL("../app/util/markdown/emoji.json", import.meta.url).pathname,
  serialized,
);
