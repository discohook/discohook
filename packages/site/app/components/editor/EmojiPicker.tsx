import { Popover } from "@base-ui-components/react/popover";
import type { Category, Emoji, Skin } from "@emoji-mart/data";
import {
  type APIMessageComponentEmoji,
  ButtonStyle,
} from "discord-api-types/v10";
import { isSnowflake } from "discord-snowflake";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { CacheManager } from "~/util/cache/CacheManager";
import { cdn } from "~/util/discord";
import { useEmojiData } from "~/util/emojis";
import { useLocalStorage } from "~/util/localstorage";
import { randomString } from "~/util/text";
import { Button } from "../Button";
import { CoolIcon } from "../icons/CoolIcon";
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
import { type IconFC, type IconFCProps, Svg } from "../icons/Svg";
import { Twemoji } from "../icons/Twemoji";
import { popoverStyles } from "../pickers/Popover";
import { TextInput } from "../TextInput";

// Dec x 2023
// We were originally using emoji-mart since it seemed more fit for our
// purposes, but decided to switch after being unable to fix the below,
// among other issues like set images not loading properly.
// https://github.com/missive/emoji-mart/issues/812

// Dec 18 2023
// emoji-picker-react

// Feb 24 2026
// Keeping emoji-mart/data for its types, but not using the data package
// anymore because it is out of date and hasn't been updated in 2 years.

type SelectedEmoji = Omit<Emoji, "skins"> & { skin: Skin };

export interface PickerProps {
  id: string;
  onEmojiClick: (
    emoji: SelectedEmoji,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  customEmojis?: APIMessageComponentEmoji[];
  className?: string;
  cache?: CacheManager;
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
  food: EmojiIconFood,
  activities: EmojiIconActivities,
  travel: EmojiIconTravel,
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
    className="rounded p-1 h-11 w-11 hover:bg-black/10 hover:dark:bg-white/10 transition"
    onClick={(ev) => onEmojiClick(emoji, ev)}
    onMouseOver={() => setHoverEmoji(emoji)}
    onFocus={() => setHoverEmoji(emoji)}
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
        loading="lazy"
        lazyPlaceholder={
          <div className="w-full h-full rounded-lg bg-black/10 dark:bg-white/10" />
        }
      />
    )}
  </button>
);

const findCustomEmojiSubstring = (
  text: string,
): { id: string; name?: string; animated?: boolean } | undefined => {
  try {
    if (isSnowflake(text) && text.length > 17) {
      return { id: text };
    }
  } catch {}

  const wholeMatch = /<(a)?:(\w+):(\d+)>/g.exec(text);
  if (wholeMatch) {
    return {
      id: wholeMatch[3],
      name: wholeMatch[2],
      animated: Boolean(wholeMatch[1]),
    };
  }

  const urlMatch =
    /^https:\/\/(?:cdn|media)\.discordapp\.(?:com|net)\/emojis\/(\d+)(?:\.(\w+))?(\?[^\s]+)?/.exec(
      text,
    );
  if (urlMatch) {
    let params: URLSearchParams | undefined;
    if (urlMatch[3]) {
      try {
        params = new URLSearchParams(urlMatch[3]);
      } catch {}
    }
    return {
      id: urlMatch[1],
      animated: params?.get("animated") === "true" || urlMatch[2] === "gif",
      // I think I have seen people post links with a name parameter,
      // perhaps for client plugins
      name: params?.get("name") || undefined,
    };
  }
};

const EmojiPicker_: React.FC<PickerProps> = ({
  id,
  onEmojiClick,
  customEmojis,
  className,
  cache,
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useLocalStorage();
  const [hoverEmoji, setHoverEmoji] = useState<SelectedEmoji>();
  const [query, setQuery] = useState("");
  const skinTone = settings.skinTone;

  const [inputtingCustom, setInputtingCustom] = useState(false);
  const [inputtingCustomDetails, setInputtingCustomDetails] =
    useState<ReturnType<typeof findCustomEmojiSubstring>>();

  const validCustomEmojis = (customEmojis ?? []).filter(
    (e): e is { id: string; name: string; animated?: boolean } =>
      !!e.id && !!e.name,
  );
  const customEmojisData: Record<string, Emoji> = {};
  for (const emoji of validCustomEmojis) {
    const id = `discord_${emoji.id}`;
    customEmojisData[id] = {
      id,
      name: emoji.name,
      // We were originally using the `custom` keyword to filter custom emojis,
      // but beware: passport_control also includes this keyword.
      keywords: ["discord", emoji.animated ? "animated" : "static"],
      skins: [{ native: emoji.id, unified: "" }],
      version: 1,
    };
  }
  const data = useEmojiData(customEmojisData);

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
        "rounded-lg bg-gray-300 dark:bg-gray-800 w-[385px] h-80 border border-black/10 dark:border-gray-200/20 shadow-md flex flex-col",
        className,
      )}
    >
      {inputtingCustom ? (
        <div className="h-80 overflow-y-auto">
          <div className="p-4">
            <div className="grow">
              <TextInput
                label={t("emojiPickerCustom.id")}
                className="w-full"
                onChange={async ({ currentTarget }) => {
                  const found = findCustomEmojiSubstring(currentTarget.value);
                  setInputtingCustomDetails(found);

                  if (found && found.animated === undefined) {
                    const staticRes = await fetch(cdn.emoji(found.id, "webp"));
                    // actually just uses webp and adds `animated=true`
                    const animatedRes = await fetch(cdn.emoji(found.id, "gif"));
                    if (!staticRes.ok || !animatedRes.ok) return;

                    // The animated version is pretty necessarily bigger than
                    // the static version, so we can use the content length to
                    // determine whether the emoji is animated from only its
                    // ID (and two network requests, but I believe they get
                    // cached and would be made anyway)
                    const staticCL = Number(
                      staticRes.headers.get("Content-Length"),
                    );
                    const animatedCL = Number(
                      animatedRes.headers.get("Content-Length"),
                    );
                    if (
                      !Number.isNaN(staticCL) &&
                      !Number.isNaN(animatedCL) &&
                      animatedCL > staticCL
                    ) {
                      setInputtingCustomDetails({
                        ...found,
                        animated: true,
                      });
                    }
                  }
                }}
              />
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium cursor-default">
                {t("preview")}
              </p>
              {inputtingCustomDetails ? (
                <img
                  src={cdn.emoji(
                    inputtingCustomDetails.id,
                    inputtingCustomDetails.animated ? "gif" : undefined,
                  )}
                  className="size-14"
                  alt={inputtingCustomDetails.name}
                />
              ) : (
                <div className="size-14 bg-black/10 rounded-lg" />
              )}
            </div>
            <div className="mt-2">
              <p className="font-medium cursor-default">
                {t("emojiPickerCustom.find")}
              </p>
              <ol className="list-decimal list-inside text-sm">
                <li>{t("emojiPickerCustom.stepSend")}</li>
                <li>{t("emojiPickerCustom.stepCopy")}</li>
                <li>{t("emojiPickerCustom.stepPaste")}</li>
              </ol>
            </div>
          </div>
          <div className="sticky bottom-0 left-0 w-full rounded-b-lg bg-gray-400 dark:bg-gray-900 flex items-end px-4 py-2">
            <Button
              discordstyle={ButtonStyle.Secondary}
              className="ml-auto"
              onClick={() => {
                setInputtingCustom(false);
                setInputtingCustomDetails(undefined);
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              className="ml-2"
              disabled={!inputtingCustomDetails}
              onClick={(ev) => {
                if (cache && inputtingCustomDetails) {
                  cache.fill([
                    `emoji:${inputtingCustomDetails.id}`,
                    {
                      id: inputtingCustomDetails.id,
                      name: inputtingCustomDetails.name ?? "unknown",
                      animated: inputtingCustomDetails.animated,
                    },
                  ]);
                  onEmojiClick(
                    {
                      id: inputtingCustomDetails.id,
                      name: inputtingCustomDetails.name ?? "unknown",
                      keywords: [
                        "discord",
                        inputtingCustomDetails.animated ? "animated" : "static",
                      ],
                      skin: {
                        native: inputtingCustomDetails.id,
                        unified: "",
                      },
                      version: 1,
                    },
                    ev,
                  );
                  setInputtingCustom(false);
                  setInputtingCustomDetails(undefined);
                }
              }}
            >
              {t("save")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-2 shadow border-b border-b-black/5 flex items-center gap-3 me-1">
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
            <button
              type="button"
              className="shrink-0"
              onClick={(e) => {
                // Go back without cycling through all options
                if (e.shiftKey) {
                  if (skinTone === undefined) {
                    setSettings({ skinTone: 4 });
                  } else if (skinTone > 0) {
                    setSettings({
                      skinTone: (skinTone - 1) as typeof skinTone,
                    });
                  } else {
                    setSettings({ skinTone: undefined });
                  }
                  return;
                }

                if (skinTone === undefined) {
                  setSettings({ skinTone: 0 });
                } else if (skinTone < 4) {
                  setSettings({
                    skinTone: (skinTone + 1) as typeof skinTone,
                  });
                } else {
                  setSettings({ skinTone: undefined });
                }
              }}
            >
              <Twemoji
                emoji={
                  (skinTone !== undefined
                    ? ["👏🏻", "👏🏼", "👏🏽", "👏🏾", "👏🏿"][skinTone]
                    : undefined) ?? "👏"
                }
                className="h-6 align-[-0.3em] w-6"
                title="Set skin tone"
              />
            </button>
          </div>
          <div className="flex grow h-full overflow-hidden">
            <div className="w-10 shrink-0 bg-gray-400 dark:bg-gray-900 overflow-y-auto h-full ltr:rounded-bl-lg rtl:rounded-br-lg scrollbar-none space-y-1 p-1 py-2 flex flex-col">
              {categories
                .filter(
                  (c) => (c.id === "custom" && cache) || c.emojis.length > 0,
                )
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
                          e.id.includes(query.replace(/ /g, "_")) ||
                          e.keywords
                            .map((k) => k.includes(query))
                            .includes(true),
                      )
                      .map(({ skins, ...emoji }) => {
                        const skin =
                          skins[skinTone === undefined ? 0 : skinTone + 1] ??
                          skins[0];
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
                      .filter(
                        (c) =>
                          (c.id === "custom" && cache) || c.emojis.length > 0,
                      )
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
                            {cache && category.id === "custom" && (
                              <button
                                type="button"
                                className="rounded p-1 h-11 w-11 hover:bg-white/10 hover:text-gray-200 transition flex"
                                title="Add custom emoji by ID"
                                onClick={() => setInputtingCustom(true)}
                                // onMouseOver={() => setHoverEmoji(emoji)}
                                // onFocus={() => setHoverEmoji(emoji)}
                              >
                                <Svg width={36} height={36} className="m-auto">
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    fill="transparent"
                                  />
                                  <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm0-17a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H7a1 1 0 1 1 0-2h4V7a1 1 0 0 1 1-1z"
                                    clipRule="evenodd"
                                  />
                                </Svg>
                              </button>
                            )}
                            {category.emojis.map((name) => {
                              const emoji = data.emojis[name];
                              /**
                               * This will always happen when adding custom emojis because our useEmojiData
                               * hook doesn't depend on customEmojisData. However, it doesn't matter because
                               * when a custom emoji is created, the menu closes automatically, then the data
                               * is refreshed on the next render (when the menu is opened again).
                               */
                              if (!emoji) {
                                console.log(
                                  `${name} from ${category.id} not found`,
                                );
                                return <></>;
                              }

                              const skin =
                                emoji.skins[
                                  skinTone === undefined ? 0 : skinTone + 1
                                ] ?? emoji.skins[0];
                              const selected: SelectedEmoji = {
                                ...emoji,
                                skin,
                              };

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
                <div className="sticky bottom-0 left-0 w-full ltr:rounded-br-lg rtl:rounded-bl-lg bg-gray-400 dark:bg-gray-900 flex items-center gap-2 px-4 py-2">
                  {hoverEmoji.keywords.includes("discord") ? (
                    <img
                      loading="lazy"
                      src={cdn.emoji(
                        hoverEmoji.skin.native,
                        hoverEmoji.keywords.includes("animated")
                          ? "gif"
                          : "webp",
                      )}
                      alt={hoverEmoji.name}
                      className="h-7 shrink-0 !align-bottom"
                    />
                  ) : (
                    <Twemoji
                      emoji={hoverEmoji.skin.native}
                      className="h-7 shrink-0 !align-bottom"
                      title={hoverEmoji.id}
                      loading="lazy"
                    />
                  )}
                  <p className="text-base font-semibold truncate">
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
        </>
      )}
    </div>
  );
};

export const EmojiPicker = memo(EmojiPicker_);

export const PopoutEmojiPicker: React.FC<{
  emoji?: APIMessageComponentEmoji;
  setEmoji: (emoji: APIMessageComponentEmoji | undefined) => void;
  emojis?: APIMessageComponentEmoji[];
  isClearable?: boolean;
  cache?: CacheManager;
}> = ({ emoji, setEmoji, emojis, cache }) => {
  const id = randomString(10);
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="flex cursor-pointer marker:hidden marker-none">
        <div className="h-9 w-9 rounded-lg flex bg-gray-300 dark:bg-[#292b2f]">
          <div className="m-auto">
            {emoji ? (
              emoji.id ? (
                <img
                  className="h-[22px] max-w-full"
                  src={cdn.emoji(emoji.id, emoji.animated ? "gif" : "webp")}
                  alt={emoji.name}
                />
              ) : (
                <Twemoji
                  emoji={emoji.name ?? ""}
                  className="h-[22px] align-[-0.3em]"
                />
              )
            ) : (
              <Twemoji
                emoji="👏"
                className="h-[22px] opacity-20 align-[-0.3em]"
              />
            )}
          </div>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} className="z-[35]">
          <Popover.Popup className={popoverStyles.popup}>
            <EmojiPicker
              id={id}
              cache={cache}
              customEmojis={emojis}
              onEmojiClick={(selectedEmoji) => {
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
                setOpen(false);
              }}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
