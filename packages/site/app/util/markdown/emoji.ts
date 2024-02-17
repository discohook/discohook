import rawEmojiData from "../../../public/emoji.json";

type EmojiDataEntry = [
  string | [string, string] | [string, string, string],
  ...([string, number] | string)[],
];

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

for (const [emojiDescriptor, ...names] of rawEmojiData as EmojiDataEntry[]) {
  const [emoji, diverseTemplate, multiDiverseTemplate] = [emojiDescriptor]
    .flat()
    .map((it) => it.replaceAll("!", "\u200d"));

  for (const nameDescriptor of names) {
    const [nameTemplate, flags] =
      typeof nameDescriptor === "string" ? [nameDescriptor, 0] : nameDescriptor;

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

export function translateNamedEmoji(content: string) {
  const match = /^:([^\s:]+?(?:::skin-tone-\d)?):/.exec(content);
  if (!match) return { content, offset: 0, name: undefined };

  const emoji = nameToEmojiMap.get(match[1]);
  if (!emoji) return { content, offset: 0, name: undefined };

  return {
    content: emoji + content.slice(match[0].length),
    offset: match[0].length - emoji.length,
    name: match[1],
  };
}

const joiner = /^(\u200d|\udb40[\udc20-\udc7e])$/;
const modifier = /^(\ufe0f|\u20e3)$/;
const suffix = /^(\ud83c[\udffb-\udfff]|\ud83c[\udde6-\uddff])$/;

export function findEmoji(content: string): string | undefined {
  let buffer = "";
  let part = "";

  for (const character of content) {
    if (joiner.test(character)) {
      buffer += character;
      part = "";
      continue;
    }

    if (
      !part ||
      modifier.test(character) ||
      (suffix.test(character) &&
        (emojiToNameMap.has(part + character) ||
          emojiToNameMap.has(buffer + character)))
    ) {
      buffer += character;
      part += character;
      continue;
    }

    break;
  }

  if (emojiToNameMap.has(buffer)) {
    return buffer;
  }
}

export function trimToNearestNonSymbolEmoji(value: string) {
  return value.replace(/(?:\u2139\ufe0f|\d\ufe0f?\u20e3).*/, "");
}

export function getEmojiName(emoji: string) {
  return emojiToNameMap.get(emoji);
}

export function getEmojiWithName(emoji: string) {
  return nameToEmojiMap.get(emoji);
}

const emojiBaseUrl =
  "https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.1.2/assets/svg";
export function getEmojiImageUrl(emoji: string) {
  let codePoints = [];

  for (const character of emoji) {
    codePoints.push(character.codePointAt(0)?.toString(16));
  }

  if (!codePoints.includes("200d")) {
    codePoints = codePoints.filter((it) => it !== "fe0f");
  }

  return `${emojiBaseUrl}/${codePoints.join("-")}.svg`;
}
