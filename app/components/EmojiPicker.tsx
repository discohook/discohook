import { APIMessageComponentEmoji } from "discord-api-types/v10";
import { cdn } from "~/util/discord";
import { randomString } from "~/util/text";
import { Twemoji } from "./Twemoji";
import { useLocalStorage } from "~/util/localstorage";
import { TextInput } from "./TextInput";
import emojiData, { Emoji, EmojiMartData } from "@emoji-mart/data";
import { CoolIcon } from "./CoolIcon";

// Dec x 2023
// We were originally using emoji-mart since it seemed more fit for our
// purposes, but decided to switch after being unable to fix the below,
// among other issues like set images not loading properly.
// https://github.com/missive/emoji-mart/issues/812

// Dec 18 2023
// emoji-picker-react

export interface PickerProps {}

const categoryToEmoji: Record<string, string> = {
  people: "🙂",
  nature: "🍂",
  foods: "🍞",
  activity: "🎮",
  places: "🚲",
  objects: "🛋",
  symbols: "♥",
  flags: "🏴",
};

export const CategoryIconButton: React.FC<{ id: string }> = ({ id }) => {
  const emoji = categoryToEmoji[id];
  return (
    <button className="block mx-auto">
      <Twemoji emoji={emoji} className="h-5 grayscale" />
    </button>
  );
};

export const EmojiPicker: React.FC<PickerProps> = (
  {
    // onEmojiClick,
  }
) => {
  const [settings, setSettings] = useLocalStorage();
  // return (
  //   <div className="h-80 w-[450px]">
  //     <ReactEmojiPicker
  //       set="twitter"
  //       emojiVersion={15}
  //       emojiSize={40}
  //       emojiSpacing={0}
  //       onEmojiClick={onEmojiClick}
  //     />
  //   </div>
  // );

  const data = emojiData as EmojiMartData;
  const skinTone = settings.skinTone;

  return (
    <div className="rounded bg-gray-300 dark:bg-gray-800 w-96 h-64 border border-black/5 shadow-md flex flex-col">
      <div className="p-2 shadow border-b border-b-black/5 flex">
        <div className="grow">
          <TextInput
            label=""
            className="w-full"
            placeholder="Find the perfect emoji"
            disabled
          />
        </div>
        <div className="shrink-0 ml-3 mr-1 my-auto">
          <button
            onClick={() => {
              if (skinTone === undefined) {
                setSettings({ skinTone: 0 });
              } else if (skinTone < 4) {
                setSettings({ skinTone: (skinTone + 1) as typeof skinTone });
              } else {
                setSettings({ skinTone: undefined });
              }
            }}
          >
            <Twemoji
              emoji={
                skinTone === 0
                  ? "👏🏻"
                  : skinTone === 1
                  ? "👏🏼"
                  : skinTone === 2
                  ? "👏🏽"
                  : skinTone === 3
                  ? "👏🏾"
                  : skinTone === 4
                  ? "👏🏿"
                  : "👏"
              }
              className="h-6 align-[-0.3em] w-6"
            />
          </button>
        </div>
      </div>
      <div className="flex grow h-full overflow-hidden">
        <div className="w-10 shrink-0 bg-gray-400 dark:bg-gray-900 overflow-y-auto h-full space-y-1 p-1 flex flex-col">
          <button className="block mx-auto">
            <CoolIcon icon="Star" className="text-2xl" />
          </button>
          <button className="block mx-auto">
            <CoolIcon icon="Clock" className="text-2xl" />
          </button>
          <div className=" contents">
            {data.categories.map((category) => (
              <CategoryIconButton
                key={`emoji-category-${category.id}-icon`}
                id={category.id}
              />
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex flex-col grow">
          <div className="grow p-1">
            {data.categories.map((category) => (
              <div
                key={`emoji-category-${category.id}-body`}
                id={category.id}
                className=""
              >
                <p className="uppercase text-sm font-semibold">{category.id}</p>
                <div className="flex gap-px flex-wrap">
                  {category.emojis.map((name) => {
                    const emoji = data.emojis[name];
                    return (
                      <button
                        key={`emoji-category-${category.id}-emoji-${name}`}
                        className="rounded p-1 h-11 w-11 hover:bg-white/10 transition"
                      >
                        <Twemoji
                          emoji={emoji.skins[0].native}
                          className="h-full w-full"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="sticky bottom-0 left-0 w-full bg-gray-400 dark:bg-gray-900 p-1">
            Current emoji
          </div>
        </div>
      </div>
    </div>
  );
};

// export const EmojiPicker: React.FC<PickerProps> = (props) => {
//   return (
//     <Picker
//       emojiStyle={EmojiStyle.TWITTER}
//       suggestedEmojisMode={SuggestionMode.FREQUENT}
//       theme={Theme.AUTO}
//       categories={[
//         {
//           category: Categories.CUSTOM,
//           name: "Custom",
//         },
//         {
//           category: Categories.SUGGESTED,
//           name: "Frequently used",
//         },
//         {
//           category: Categories.SMILEYS_PEOPLE,
//           name: "People",
//         },
//         {
//           category: Categories.ANIMALS_NATURE,
//           name: "Nature",
//         },
//         {
//           category: Categories.FOOD_DRINK,
//           name: "Food",
//         },
//         {
//           category: Categories.ACTIVITIES,
//           name: "Activities",
//         },
//         {
//           category: Categories.TRAVEL_PLACES,
//           name: "Travel",
//         },
//         {
//           category: Categories.OBJECTS,
//           name: "Objects",
//         },
//         {
//           category: Categories.SYMBOLS,
//           name: "Symbols",
//         },
//         {
//           category: Categories.FLAGS,
//           name: "Flags",
//         },
//       ]}
//       // emojiSize={30}
//       // emojiButtonRadius="0.25rem"
//       // emojiButtonSize={40}
//       // perLine={8}
//       {...props}
//     />
//   );
// };

export const PopoutEmojiPicker: React.FC<{
  emoji?: APIMessageComponentEmoji;
  setEmoji?: (emoji: APIMessageComponentEmoji | undefined) => void;
  isClearable?: boolean;
}> = ({ emoji, setEmoji }) => {
  const id = randomString(42);
  // const close = () => {
  //   const parent = document.querySelector<HTMLDetailsElement>(`#${id}`);
  //   if (parent) parent.open = false;
  // };
  return (
    <details className="relative group/emoji" id={id}>
      <summary className="flex cursor-pointer marker:hidden marker-none">
        <div className="h-9 w-9 rounded flex bg-gray-300 dark:bg-[#292b2f]">
          <div className="m-auto">
            {emoji ? (
              emoji.id ? (
                <img
                  className="w-[22px]"
                  src={cdn.emoji(emoji.id, emoji.animated ? "gif" : "webp")}
                  alt={emoji.name}
                />
              ) : (
                <Twemoji emoji={emoji.name!} className="h-[22px]" />
              )
            ) : (
              <Twemoji
                emoji="👏"
                className="h-[22px] opacity-20 align-[-0.3em]"
              />
            )}
          </div>
        </div>
      </summary>
      <div className="absolute z-20 pb-8">
        <EmojiPicker
        // theme={Theme.DARK}
        // previewConfig={{
        //   // defaultCaption: "",
        //   // defaultEmoji: emoji && !emoji.id ? emoji.name : undefined,
        //   showPreview: false,
        // }}
        // onEmojiClick={(selected) => {
        //   // close();
        //   if (setEmoji) {
        //     const newEmoji: APIMessageComponentEmoji = { name: selected };
        //     if (
        //       emoji &&
        //       emoji.id === newEmoji.id &&
        //       emoji.name === newEmoji.name
        //     ) {
        //       // Clear on double click
        //       setEmoji(undefined);
        //     } else {
        //       setEmoji(newEmoji);
        //     }
        //   }
        // }}
        />
      </div>
    </details>
  );
};
