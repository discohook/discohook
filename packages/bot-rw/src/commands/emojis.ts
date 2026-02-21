type EmojiDataEntry = [
  string | [string, string] | [string, string, string],
  ...([string, number] | string)[],
];

type EmojiData = EmojiDataEntry[];

const diversities = [
  {
    value: "\u{1f3fb}",
    classic: "skin-tone-1",
    numbered: "_tone1",
    named: "_light_skin_tone",
  },
  {
    value: "\u{1f3fc}",
    classic: "skin-tone-2",
    numbered: "_tone2",
    named: "_medium_light_skin_tone",
  },
  {
    value: "\u{1f3fd}",
    classic: "skin-tone-3",
    numbered: "_tone3",
    named: "_medium_skin_tone",
  },
  {
    value: "\u{1f3fe}",
    classic: "skin-tone-4",
    numbered: "_tone4",
    named: "_medium_dark_skin_tone",
  },
  {
    value: "\u{1f3ff}",
    classic: "skin-tone-5",
    numbered: "_tone5",
    named: "_dark_skin_tone",
  },
];

const bitflag = {
  classic: 1 << 0,
  numbered: 1 << 1,
  named: 1 << 2,
  multiNumbered: 1 << 3,
  multiNamed: 1 << 4,
  diverseOnly: 1 << 5,
};

export const fetchEmojiData = async () => {
  const response = await fetch(`${Bun.env.DISCOHOOK_ORIGIN}/emoji.json`, {
    method: "GET",
  });
  return (await response.json()) as EmojiData;
};

export const resolveEmojiData = (rawEmojiData: EmojiData) => {
  const nameToEmojiMap = new Map<string, string>();
  const emojiToNameMap = new Map<string, string>();

  function insertEmoji(emoji: string, name: string) {
    nameToEmojiMap.set(name, emoji);
    if (!emojiToNameMap.has(emoji)) {
      emojiToNameMap.set(emoji, name);
    }
    if (!emoji.includes("\u200d")) {
      const cleaned = emoji.replace("\ufe0f", "");
      if (!emojiToNameMap.has(cleaned)) {
        emojiToNameMap.set(cleaned, name);
      }
    }
  }

  for (const [emojiDescriptor, ...names] of rawEmojiData) {
    const [emoji, diverseTemplate, multiDiverseTemplate] = [emojiDescriptor]
      .flat()
      .map((it) => it.replaceAll("!", "\u200d"));
    if (!emoji) continue; // type guard

    for (const nameDescriptor of names) {
      const [nameTemplate, flags] =
        typeof nameDescriptor === "string"
          ? [nameDescriptor, 0]
          : nameDescriptor;

      const name = nameTemplate.replace("@", "");
      insertEmoji(emoji, name);

      if (diverseTemplate) {
        for (const diversity of diversities) {
          const emoji = diverseTemplate.replaceAll("?", diversity.value);

          if (flags & bitflag.classic) {
            nameToEmojiMap.set(`${name}::${diversity.classic}`, emoji);
          }
          if (flags & bitflag.numbered) {
            insertEmoji(emoji, nameTemplate.replace(/@|$/, diversity.numbered));
          }
          if (flags & bitflag.named) {
            insertEmoji(emoji, nameTemplate.replace(/@|$/, diversity.named));
          }
        }
      }

      if (multiDiverseTemplate) {
        for (const first of diversities) {
          for (const second of diversities) {
            if (first.value === second.value) {
              continue;
            }

            const emoji = multiDiverseTemplate
              .replace("?", first.value)
              .replace("?", second.value);

            if (flags & bitflag.numbered) {
              insertEmoji(
                emoji,
                nameTemplate.replace(/@|$/, first.numbered + second.numbered),
              );
            }
            if (flags & bitflag.named) {
              insertEmoji(
                emoji,
                nameTemplate.replace(/@|$/, first.named + second.named),
              );
            }
          }
        }
      }
    }
  }

  for (const diversity of diversities) {
    insertEmoji(diversity.value, diversity.classic);
  }

  return {
    nameToEmoji: nameToEmojiMap,
    emojiToName: emojiToNameMap,
  };
};

export type ResolvedEmojiData = ReturnType<typeof resolveEmojiData>;
