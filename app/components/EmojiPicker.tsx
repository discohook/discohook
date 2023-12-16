import { APIMessageComponentEmoji } from "discord-api-types/v10";
import Picker, {
  Categories,
  EmojiStyle,
  PickerProps,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import { cdn } from "~/util/discord";
import { randomString } from "~/util/text";
import { Twemoji } from "./Twemoji";

// We were originally using emoji-mart since it seemed more fit for our
// purposes, but decided to switch after being unable to fix the below,
// among other issues like set images not loading properly.
// https://github.com/missive/emoji-mart/issues/812

export const EmojiPicker: React.FC<PickerProps> = (props) => {
  return (
    <Picker
      emojiStyle={EmojiStyle.TWITTER}
      suggestedEmojisMode={SuggestionMode.FREQUENT}
      theme={Theme.AUTO}
      categories={[
        {
          category: Categories.CUSTOM,
          name: "Custom",
        },
        {
          category: Categories.SUGGESTED,
          name: "Frequently used",
        },
        {
          category: Categories.SMILEYS_PEOPLE,
          name: "People",
        },
        {
          category: Categories.ANIMALS_NATURE,
          name: "Nature",
        },
        {
          category: Categories.FOOD_DRINK,
          name: "Food",
        },
        {
          category: Categories.ACTIVITIES,
          name: "Activities",
        },
        {
          category: Categories.TRAVEL_PLACES,
          name: "Travel",
        },
        {
          category: Categories.OBJECTS,
          name: "Objects",
        },
        {
          category: Categories.SYMBOLS,
          name: "Symbols",
        },
        {
          category: Categories.FLAGS,
          name: "Flags",
        },
      ]}
      // emojiSize={30}
      // emojiButtonRadius="0.25rem"
      // emojiButtonSize={40}
      // perLine={8}
      {...props}
    />
  );
};

export const PopoutEmojiPicker: React.FC<{
  emoji?: APIMessageComponentEmoji;
  setEmoji?: (emoji: APIMessageComponentEmoji | undefined) => void;
  isClearable?: boolean;
}> = ({ emoji, setEmoji }) => {
  const id = randomString(42);
  const close = () => {
    const parent = document.querySelector<HTMLDetailsElement>(`#${id}`);
    if (parent) parent.open = false;
  };
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
                />
              ) : (
                <Twemoji emoji={emoji.name!} size={22} />
              )
            ) : (
              <div className="opacity-30">
                <Twemoji emoji="👏" size={22} />
              </div>
            )}
          </div>
        </div>
      </summary>
      <div className="absolute z-20">
        <EmojiPicker
          theme={Theme.DARK}
          previewConfig={{
            // defaultCaption: "",
            // defaultEmoji: emoji && !emoji.id ? emoji.name : undefined,
            showPreview: false,
          }}
          onEmojiClick={(data) => {
            // close();
            if (setEmoji) {
              const newEmoji: APIMessageComponentEmoji = { name: data.unified };
              if (
                emoji &&
                emoji.id === newEmoji.id &&
                emoji.name === newEmoji.name
              ) {
                // Clear on double click
                setEmoji(undefined);
              } else {
                setEmoji(newEmoji);
              }
            }
          }}
        />
      </div>
    </details>
  );
};
