import emojiData, {
  Category,
  Emoji,
  EmojiMartData,
  Skin,
} from "@emoji-mart/data";
import { APIMessageComponentEmoji } from "discord-api-types/v10";
import { memo, useState } from "react";
import { twJoin } from "tailwind-merge";
import { cdn } from "~/util/discord";
import { useLocalStorage } from "~/util/localstorage";
import { randomString } from "~/util/text";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import { IconFC, IconFCProps } from "../icons/Svg";
import { Twemoji } from "../icons/Twemoji";
import {
  EmojiIconActivities,
  EmojiIconFlags,
  EmojiIconFood,
  EmojiIconNature,
  EmojiIconObjects,
  EmojiIconPeople,
  EmojiIconSymbols,
  EmojiIconTravel,
} from "../icons/emoji";

// Dec x 2023
// We were originally using emoji-mart since it seemed more fit for our
// purposes, but decided to switch after being unable to fix the below,
// among other issues like set images not loading properly.
// https://github.com/missive/emoji-mart/issues/812

// Dec 18 2023
// emoji-picker-react

type SelectedEmoji = Omit<Emoji, "skins"> & { skin: Skin };

export interface PickerProps {
  id: string;
  onEmojiClick: (
    emoji: SelectedEmoji,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  customEmojis?: APIMessageComponentEmoji[];
  className?: string;
}

const categoryToIcon: Record<string, IconFC> = {
  favorites: (props?: IconFCProps) => (
    <CoolIcon icon="Star" className={props?.className} />
  ),
  recents: (props?: IconFCProps) => (
    <CoolIcon icon="Clock" className={props?.className} />
  ),
  custom: (props?: IconFCProps) => (
    <CoolIcon
      icon="Paperclip_Attechment_Horizontal"
      className={props?.className}
    />
  ),
  people: EmojiIconPeople,
  nature: EmojiIconNature,
  foods: EmojiIconFood,
  activity: EmojiIconActivities,
  places: EmojiIconTravel,
  objects: EmojiIconObjects,
  symbols: EmojiIconSymbols,
  flags: EmojiIconFlags,
};

export const CategoryIconButton: React.FC<{
  categoryId: string;
  id: string;
}> = ({ categoryId, id }) => {
  return (
    <button
      type="button"
      className="block mx-auto"
      onClick={() => {
        const sectionHeader = document.getElementById(`${id}-${categoryId}`);
        if (sectionHeader) {
          sectionHeader.scrollIntoView();
        }
      }}
    >
      {categoryToIcon[categoryId]()}
    </button>
  );
};

const GridEmoji: React.FC<{
  emoji: SelectedEmoji;
  onEmojiClick: (
    e: SelectedEmoji,
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  setHoverEmoji: (e: SelectedEmoji) => void;
}> = ({ emoji, onEmojiClick, setHoverEmoji }) => (
  <button
    type="button"
    className={`rounded p-1 h-11 w-11 hover:bg-white/10 transition invisible data-[visible="true"]:visible`}
    onClick={(ev) => onEmojiClick(emoji, ev)}
    onMouseOver={() => setHoverEmoji(emoji)}
    onFocus={() => setHoverEmoji(emoji)}
    data-visible={true}
    // onLoad={({ currentTarget }) => {
    //   currentTarget.dataset.visible =
    //     elementPartiallyVisible(currentTarget).toString();
    // }}
    // onScroll={({ currentTarget }) => {
    //   currentTarget.dataset.visible =
    //     elementPartiallyVisible(currentTarget).toString();
    // }}
  >
    {emoji.keywords.includes("discord") ? (
      <img
        src={cdn.emoji(
          emoji.skin.native,
          emoji.keywords.includes("animated") ? "gif" : "webp",
        )}
        alt={emoji.name}
        className="h-full max-w-full"
      />
    ) : (
      <Twemoji
        emoji={emoji.skin.native}
        className="h-full w-full"
        title={emoji.id}
      />
    )}
  </button>
);

const elementPartiallyVisible = (e: Element) => {
  const rect = e.getBoundingClientRect();
  const parentBottomEdge = e.parentElement
    ? e.parentElement.getBoundingClientRect().right
    : window.innerHeight || document.documentElement.clientHeight;
  const parentRightEdge = e.parentElement
    ? e.parentElement.getBoundingClientRect().bottom
    : window.innerWidth || document.documentElement.clientWidth;
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= parentBottomEdge &&
    rect.right <= parentRightEdge
  );
};

const EmojiPicker_: React.FC<PickerProps> = ({
  id,
  onEmojiClick,
  customEmojis,
  className,
}) => {
  const [settings, setSettings] = useLocalStorage();
  const [hoverEmoji, setHoverEmoji] = useState<SelectedEmoji>();
  const [query, setQuery] = useState("");

  const data = structuredClone(emojiData as EmojiMartData);
  const validCustomEmojis = (customEmojis ?? []).filter(
    (e): e is { id: string; name: string; animated?: boolean } =>
      !!e.id && !!e.name,
  );

  for (const emoji of validCustomEmojis) {
    const id = `discord_${emoji.id}`;
    data.emojis[id] = {
      id,
      name: emoji.name,
      // We were originally using the `custom` keyword to filter custom emojis,
      // but beware: passport_control also includes this keyword.
      keywords: ["discord", emoji.animated ? "animated" : "static"],
      skins: [
        {
          native: emoji.id,
          unified: "",
        },
      ],
      version: 1,
    };
  }

  const skinTone = settings.skinTone;

  const categories: Category[] = [
    // {
    //   id: "favorites",
    //   emojis: [],
    // },
    {
      id: "custom",
      emojis: validCustomEmojis.map((e) => `discord_${e.id}`),
    },
    // {
    //   id: "recents",
    //   emojis: [],
    // },
    ...data.categories,
  ];

  return (
    <div
      className={twJoin(
        "rounded bg-gray-300 dark:bg-gray-800 w-[385px] h-80 border border-black/10 dark:border-gray-200/20 shadow-md flex flex-col",
        className,
      )}
    >
      <div className="p-2 shadow border-b border-b-black/5 flex">
        <div className="grow">
          <TextInput
            label=""
            className="w-full"
            placeholder="Find the perfect emoji"
            onInput={(e) =>
              setQuery(e.currentTarget.value.toLowerCase().trim())
            }
          />
        </div>
        <div className="shrink-0 ml-3 mr-1 my-auto">
          <button
            type="button"
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
              title="Set skin tone"
            />
          </button>
        </div>
      </div>
      <div className="flex grow h-full overflow-hidden">
        <div className="w-10 shrink-0 bg-gray-400 dark:bg-gray-900 overflow-y-auto h-full rounded-bl scrollbar-none space-y-1 p-1 py-2 flex flex-col">
          {categories
            .filter((c) => c.emojis.length > 0)
            .map((category) => (
              <CategoryIconButton
                key={`emoji-category-${id}-${category.id}-icon`}
                categoryId={category.id}
                id={id}
              />
            ))}
        </div>
        <div className="overflow-y-auto flex flex-col grow select-none">
          <div className="grow px-1.5 pb-1">
            {query
              ? Object.values(data.emojis)
                  .filter(
                    (e) =>
                      e.id.includes(query) ||
                      e.keywords.map((k) => k.includes(query)).includes(true),
                  )
                  .map((emoji) => {
                    const skin =
                      emoji.skins[skinTone === undefined ? 0 : skinTone + 1] ??
                      emoji.skins[0];
                    const selected: SelectedEmoji = { ...emoji, skin };

                    return (
                      <GridEmoji
                        key={`emoji-search-${emoji.id}`}
                        emoji={selected}
                        onEmojiClick={onEmojiClick}
                        setHoverEmoji={setHoverEmoji}
                      />
                    );
                  })
              : categories
                  .filter((c) => c.emojis.length > 0)
                  .map((category) => (
                    <div
                      key={`emoji-category-${category.id}-body`}
                      className="pt-3 first:pt-1"
                    >
                      <div
                        id={`${id}-${category.id}`}
                        className="uppercase text-xs font-semibold pt-1 mb-1 ml-1 flex"
                      >
                        {categoryToIcon[category.id]({
                          className: "my-auto ltr:mr-1.5 rtl:ml-1.5",
                        })}
                        <p className="my-auto">{category.id}</p>
                      </div>
                      <div className="flex gap-px flex-wrap">
                        {category.emojis.map((name) => {
                          const emoji = data.emojis[name];
                          const skin =
                            emoji.skins[
                              skinTone === undefined ? 0 : skinTone + 1
                            ] ?? emoji.skins[0];
                          const selected: SelectedEmoji = { ...emoji, skin };

                          return (
                            <GridEmoji
                              key={`emoji-category-${category.id}-emoji-${emoji.id}`}
                              emoji={selected}
                              onEmojiClick={onEmojiClick}
                              setHoverEmoji={setHoverEmoji}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
          </div>
          {hoverEmoji && (
            <div className="sticky bottom-0 left-0 w-full rounded-br bg-gray-400 dark:bg-gray-900 flex items-center px-4 py-2">
              {hoverEmoji.keywords.includes("discord") ? (
                <img
                  loading="lazy"
                  src={cdn.emoji(
                    hoverEmoji.skin.native,
                    hoverEmoji.keywords.includes("animated") ? "gif" : "webp",
                  )}
                  alt={hoverEmoji.name}
                  className="h-7 my-auto shrink-0 !align-bottom"
                />
              ) : (
                <Twemoji
                  emoji={hoverEmoji.skin.native}
                  className="h-7 my-auto shrink-0 !align-bottom"
                  title={hoverEmoji.id}
                  loading="lazy"
                />
              )}
              <p className="ml-2 text-base font-semibold my-auto truncate">
                :
                {hoverEmoji.keywords.includes("discord")
                  ? hoverEmoji.name
                  : hoverEmoji.id}
                :
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmojiPicker = memo(EmojiPicker_);

export const PopoutEmojiPicker: React.FC<{
  emoji?: APIMessageComponentEmoji;
  setEmoji: (emoji: APIMessageComponentEmoji | undefined) => void;
  emojis?: APIMessageComponentEmoji[];
  isClearable?: boolean;
}> = ({ emoji, setEmoji, emojis }) => {
  const id = randomString(10);
  const [open, setOpen] = useState(false);
  // const close = () => {
  //   const parent = document.querySelector<HTMLDetailsElement>(`#${id}`);
  //   if (parent) parent.open = false;
  // };
  return (
    <div
      className="relative group/emoji"
      // id={id}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer marker:hidden marker-none"
      >
        <div className="h-9 w-9 rounded flex bg-gray-300 dark:bg-[#292b2f]">
          <div className="m-auto">
            {emoji ? (
              emoji.id ? (
                <img
                  className="h-[22px] max-w-full"
                  src={cdn.emoji(emoji.id, emoji.animated ? "gif" : "webp")}
                  alt={emoji.name}
                />
              ) : (
                <Twemoji emoji={emoji.name ?? ""} className="h-[22px]" />
              )
            ) : (
              <Twemoji
                emoji="👏"
                className="h-[22px] opacity-20 align-[-0.3em]"
              />
            )}
          </div>
        </div>
      </button>
      {open && (
        <div className="absolute z-20 pb-8">
          <EmojiPicker
            id={id}
            customEmojis={emojis}
            onEmojiClick={(selectedEmoji) => {
              // close();
              const newEmoji: APIMessageComponentEmoji =
                selectedEmoji.keywords.includes("discord")
                  ? {
                      id: selectedEmoji.id.replace(/^discord_/, ""),
                      name: selectedEmoji.name,
                      animated: selectedEmoji.keywords.includes("animated"),
                    }
                  : {
                      name: selectedEmoji.skin.native,
                    };
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
            }}
          />
        </div>
      )}
    </div>
  );
};
