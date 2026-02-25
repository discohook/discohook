import type { EmojiMartData } from "@emoji-mart/data";
import { useEffect, useState } from "react";

// First time managing my own emoji database. This is the solution I devised
// for categorizing emojis without loading everything onto the client via a
// huge import. Fortunately the emojis come pre-sorted from the generator.
const categories = {
  people: { from: "😀", to: "🌂" },
  nature: { from: "🐶", to: "🌫️" },
  food: { from: "🍏", to: "🧂" },
  activities: { from: "⚽", to: "🧩" },
  travel: { from: "🚗", to: "🌁" },
  objects: { from: "⌚", to: "🔓" },
  symbols: { from: "🩷", to: "🇦" },
  flags: { from: "🏳️", to: "🇺🇲" },
};

const startEmojiToCategory = Object.fromEntries(
  Object.entries(categories).map(([category, vals]) => [vals.from, category]),
);
const endEmojiToCategory = Object.fromEntries(
  Object.entries(categories).map(([category, vals]) => [vals.to, category]),
);

// For some reason these are not included in the built data, but the aliases
// are used for the skin tone names, so we need this mapping to assign skin
// tones to them
const surplusAliases: Record<string, string[]> = {
  two_women_holding_hands: ["women_holding_hands"],
  two_men_holding_hands: ["men_holding_hands"],
  couple_ww: ["couple_with_heart_woman_woman"],
  couple_mm: ["couple_with_heart_man_man"],
  kiss_ww: ["kiss_woman_woman"], // _man_man is not missing
  // woman_and_man_holding_hands seems to have no default variant
};

// Discord used the name "kiss" for the kiss mark emoji, but then named the
// couplekiss tone variants "kiss_toneN"
const renameTo: Record<string, string> = {
  kiss_tone1: "couplekiss_tone1",
  kiss_tone2: "couplekiss_tone2",
  kiss_tone3: "couplekiss_tone3",
  kiss_tone4: "couplekiss_tone4",
  kiss_tone5: "couplekiss_tone5",
};

const defaultEmojiData: EmojiMartData = {
  aliases: {},
  categories: [],
  emojis: {},
  sheet: { cols: 0, rows: 0 },
};

type RawEmojiJsonData = [string, ...(string | [string, number])[]][];

const TONE_RE = /_tone\d/;

const buildEmojiData = async (
  raw: RawEmojiJsonData,
): Promise<EmojiMartData> => {
  const data = structuredClone(defaultEmojiData);

  let category: string | undefined;
  for (const entry of raw) {
    try {
      const [unicode, ...rest] = entry;
      const names = rest.flatMap((a) =>
        typeof a === "string"
          ? a
          : a.filter((k): k is string => typeof k === "string"),
      );
      const firstName = renameTo[names[0]] ?? names[0];

      if (startEmojiToCategory[unicode]) {
        category = startEmojiToCategory[unicode];
      }
      // This is not a "top level" emoji
      if (TONE_RE.test(firstName)) {
        // Some toned emojis have multiple tones, but our tone picker only
        // considers 5 linear shades (not multi-shade emojis, such as handshake).
        // When we have a more advanced shade picker (per emoji), we'll also add
        // these to skins.
        // const stripped = firstName.replace(/(_tone\d)+/, "");
        const stripped = firstName.replace(TONE_RE, "");
        if (TONE_RE.test(stripped)) continue;

        let originalEmoji = data.emojis[stripped];
        if (!originalEmoji) {
          // Might be an alias, like person_in_bed
          const originalName = data.aliases[stripped];
          if (originalName) originalEmoji = data.emojis[originalName];
        }

        if (originalEmoji) {
          originalEmoji.skins.push({ native: unicode, unified: "" });
        } else {
          console.log(
            `${unicode} (${firstName}) was identified as a skin, but its parent could not be found`,
          );
        }
        continue;
      }

      data.emojis[firstName] = {
        id: firstName,
        name: firstName,
        keywords: names.slice(1),
        skins: [{ native: unicode, unified: "" }],
        version: 1,
      };
      for (const subName of names.slice(1)) {
        data.aliases[subName] = firstName;
      }
      for (const alias of surplusAliases[firstName] ?? []) {
        data.aliases[alias] = firstName;
      }

      if (category) {
        const cat = data.categories.find((c) => c.id === category);
        if (cat) {
          cat.emojis.push(firstName);
        } else {
          data.categories.push({ id: category, emojis: [firstName] });
        }
      }

      if (endEmojiToCategory[unicode]) category = undefined;
    } catch (e) {
      console.error("Failed to parse emoji entry", entry, e);
    }
  }
  return data;
};

export const useEmojiData = (
  defaultEmojis: EmojiMartData["emojis"] = {},
): EmojiMartData => {
  const [data, setData] = useState<EmojiMartData>({
    ...defaultEmojiData,
    emojis: defaultEmojis,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: loop
  useEffect(() => {
    const cachedEmojis = localStorage.getItem("discohook_unicode_emojis");
    if (cachedEmojis) {
      try {
        const parsed = JSON.parse(cachedEmojis) as {
          data: RawEmojiJsonData;
          set_at: number;
        };
        if (Date.now() - parsed.set_at < 86_400_000 * 14) {
          buildEmojiData(parsed.data).then((newData) => {
            newData.emojis = { ...newData.emojis, ...defaultEmojis };
            setData(newData);
          });
          return;
        }
      } catch {
        // Probably tampered data
      }
    }

    fetch("/emoji.json").then((res) => {
      if (!res.ok) {
        console.error("Failed to fetch emoji data");
        return;
      }
      res.json().then((raw) => {
        localStorage.setItem(
          "discohook_unicode_emojis",
          JSON.stringify({ data: raw, set_at: Date.now() }),
        );
        buildEmojiData(raw as RawEmojiJsonData).then((newData) => {
          newData.emojis = { ...newData.emojis, ...defaultEmojis };
          setData(newData);
        });
      });
    });
  }, []);

  return data;
};
