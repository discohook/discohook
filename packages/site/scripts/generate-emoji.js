#!/usr/bin/env node
// @ts-check

import { writeFile } from "node:fs/promises";

/* eslint-disable jsdoc/require-property-description */

/**
 * @typedef Emoji
 * @property {string[]} names
 * @property {string} surrogates
 * @property {boolean} hasDiversity
 * @property {EmojiDiversity[] | undefined} diversityChildren
 * @property {boolean} hasMultiDiversity
 * @property {EmojiDiversity[] | undefined} multiDiversityChildren
 */

/**
 * @typedef EmojiDiversity
 * @property {string[]} names
 * @property {string} surrogates
 * @property {("1f3fb" | "1f3fc" | "1f3fd" | "1f3fe" | "1f3ff")[]} diversity
 */

/**
 * @type {() => Promise<Record<string, Emoji[]>>}
 */
async function getEmojiBlob() {
  /** @type {string} */
  const html = await (await fetch("https://discord.com/app")).text();

  /** @type {Record<string, Emoji[]> | undefined} */
  let blob;
  for (const script of html.matchAll(/<script src="([^"]+)"/g)) {
    const src = script[1];
    /** @type {string} */
    const js = await (
      await fetch(new URL(src, "https://discord.com/app"))
    ).text();
    const match =
      /{"use strict";.\.exports=({(?:\w+:\[(?:{[^{}]+(?:{[^{}]+},?)*[^{}]+},?)+],?)+})}/.exec(
        js,
      );
    if (match) {
      // eslint-disable-next-line no-eval
      blob = eval(`(()=>(${match[1]}))()`);
      break;
    }
  }

  if (!blob) {
    throw new Error("Emoji JSON blob could not be found");
  }

  return blob;
}

const variantDiversities = {
  "1f3fb": { numbered: "_tone1", named: "_light_skin_tone" },
  "1f3fc": { numbered: "_tone2", named: "_medium_light_skin_tone" },
  "1f3fd": { numbered: "_tone3", named: "_medium_skin_tone" },
  "1f3fe": { numbered: "_tone4", named: "_medium_dark_skin_tone" },
  "1f3ff": { numbered: "_tone5", named: "_dark_skin_tone" },
};

const bitflag = {
  classic: 1 << 0,
  numbered: 1 << 1,
  named: 1 << 2,
  multiNumbered: 1 << 3,
  multiNamed: 1 << 4,
  diverseOnly: 1 << 5,
};

const diversityReplacementCharacter = "?".codePointAt(0) ?? 0;
const zeroWidthJoinerReplacementCharacter = "!".codePointAt(0) ?? 0;

const data = [];
for (const emoji of Object.values(await getEmojiBlob()).flat()) {
  const templates = [emoji.surrogates];
  /** @type {(string | [string, number])[]} */
  const names = [];

  for (const name of emoji.names) {
    let nameTemplate;
    let flags = emoji.hasDiversity ? bitflag.classic : 0;

    /** @type {(name: string, variantName: string, tone: string) => boolean} */
    const checkVariantMatch = (name, variantName, tone) => {
      if (variantName.replace(tone, "") !== name) {
        return false;
      }
      if (!variantName.endsWith(tone)) {
        nameTemplate = variantName.replace(tone, "@");
      }
      return true;
    };

    for (const variant of emoji.diversityChildren ?? []) {
      templates[variant.diversity.length] = [...variant.surrogates]
        .map((it) => (it.codePointAt(0) ?? 0).toString(16))
        .join("-")
        .replaceAll(
          /\b1f3f[b-f]\b/gi,
          diversityReplacementCharacter.toString(16),
        )
        .replaceAll(
          /\b200d\b/gi,
          zeroWidthJoinerReplacementCharacter.toString(16),
        )
        .split("-")
        .map((it) => String.fromCodePoint(Number.parseInt(it, 16)))
        .join("");

      const numbered = variant.diversity
        .map((it) => variantDiversities[it].numbered)
        .join("");
      const named = variant.diversity
        .map((it) => variantDiversities[it].named)
        .join("");

      for (const variantName of variant.names) {
        if (checkVariantMatch(name, variantName, numbered)) {
          flags |=
            variant.diversity.length === 1
              ? bitflag.numbered
              : bitflag.multiNumbered;
        }
        if (checkVariantMatch(name, variantName, named)) {
          flags |=
            variant.diversity.length === 1 ? bitflag.named : bitflag.multiNamed;
        }
      }
    }

    nameTemplate ??= name;
    names.push(flags === 0 ? nameTemplate : [nameTemplate, flags]);
  }

  /** @type {Map<string, number>} */
  const diverseOnlyNames = new Map();
  for (const variant of emoji.diversityChildren ?? []) {
    const numbered = variant.diversity
      .map((it) => variantDiversities[it].numbered)
      .join("");
    const named = variant.diversity
      .map((it) => variantDiversities[it].named)
      .join("");

    for (const variantName of variant.names) {
      if (
        names
          .map((it) => (Array.isArray(it) ? it[0] : it))
          .some((it) => it.replace(/@|$/, numbered) === variantName)
      ) {
        continue;
      }
      if (
        names
          .map((it) => (Array.isArray(it) ? it[0] : it))
          .some((it) => it.replace(/@|$/, named) === variantName)
      ) {
        continue;
      }

      if (variantName.includes(numbered)) {
        const short = variantName.replace(numbered, "@").replace(/@$/, "");
        let flags = diverseOnlyNames.get(short) ?? bitflag.diverseOnly;
        flags |=
          variant.diversity.length === 1
            ? bitflag.numbered
            : bitflag.multiNumbered;

        diverseOnlyNames.set(short, flags);
      }
      if (variantName.includes(named)) {
        const short = variantName.replace(named, "@").replace(/@$/, "");
        let flags = diverseOnlyNames.get(short) ?? bitflag.diverseOnly;
        flags |=
          variant.diversity.length === 1 ? bitflag.named : bitflag.multiNamed;
        diverseOnlyNames.set(short, flags);
      }
    }
  }
  names.push(...diverseOnlyNames.entries());

  data.push([templates.length === 1 ? templates[0] : templates, ...names]);
}

await writeFile(
  new URL("../public/emoji.json", import.meta.url).pathname,
  JSON.stringify(data),
);
