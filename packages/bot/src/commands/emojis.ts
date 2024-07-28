import { emojiData } from "./emoji-data.js";

export const emojiNameToUnicodeMap = Object.fromEntries(
  Object.values(emojiData)
    .flat()
    .flatMap((emoji) => {
      if ("diversityChildren" in emoji) {
        return [
          ...emoji.names.map((name) => [name, emoji.surrogates] as const),
          // biome-ignore lint/style/noNonNullAssertion: just checked
          ...emoji.diversityChildren!.flatMap((diversity) =>
            diversity.names.map(
              (name) => [name, diversity.surrogates] as const,
            ),
          ),
        ];
      }
      return emoji.names.map((name) => [name, emoji.surrogates] as const);
    }),
);

export const emojiUnicodeToNameMap = Object.fromEntries(
  Object.values(emojiData)
    .flat()
    .flatMap((emoji) => {
      if ("diversityChildren" in emoji && emoji.diversityChildren) {
        return [
          [emoji.surrogates, emoji.names] as const,
          ...emoji.diversityChildren.map(
            (diversity) => [diversity.surrogates, diversity.names] as const,
          ),
        ];
      }
      return [[emoji.surrogates, emoji.names]] as const;
    }),
);
