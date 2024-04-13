import { useCallback, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import { CacheManager } from "~/util/cache/CacheManager";
import { randomString } from "~/util/text";
import { EmojiPicker } from "./EmojiPicker";
import { MentionsPicker } from "./MentionsPicker";
import { TimePicker } from "./TimePicker";

export const PopoutRichPicker: React.FC<
  React.PropsWithChildren<{
    insertText: (text: string) => void;
    cache?: CacheManager;
  }>
> = ({ insertText, cache, children }) => {
  const id = randomString(10);
  const ref = useRef<HTMLDetailsElement>(null);

  const collapse = useCallback(() => {
    if (ref.current) {
      ref.current.open = false;
    }
  }, []);

  // Do we want a gif picker too?
  type Tab = "mentions" | "time" | "emoji";
  const [tab, setTab] = useState<Tab>("mentions");

  return (
    <details ref={ref} className="relative group/rich">
      <summary className="flex cursor-pointer marker:hidden marker-none">
        {children}
      </summary>
      <div className="absolute z-20 right-0 bg-gray-300 dark:bg-gray-800 border border-black/5 rounded shadow-md w-[385px]">
        <div className="font-semibold space-x-1 px-2 pt-2 text-sm">
          <button
            type="button"
            className={twJoin(
              "inline-block rounded px-1.5 py-px hover:bg-primary-300 dark:hover:bg-primary-500 transition",
              tab === "mentions" ? "bg-primary-300 dark:bg-primary-500" : "",
            )}
            onClick={() => setTab("mentions")}
          >
            Mentions
          </button>
          <button
            type="button"
            className={twJoin(
              "inline-block rounded px-1.5 py-px hover:bg-primary-300 dark:hover:bg-primary-500 transition",
              tab === "time" ? "bg-primary-300 dark:bg-primary-500" : "",
            )}
            onClick={() => setTab("time")}
          >
            Time
          </button>
          <button
            type="button"
            className={twJoin(
              "inline-block rounded px-1.5 py-px hover:bg-primary-300 dark:hover:bg-primary-500 transition",
              tab === "emoji" ? "bg-primary-300 dark:bg-primary-500" : "",
            )}
            onClick={() => setTab("emoji")}
          >
            Emojis
          </button>
        </div>
        {tab === "mentions" ? (
          <MentionsPicker
            id={id}
            className="border-none shadow-none w-full"
            cache={cache}
            onMentionClick={(mention, event) => {
              insertText(
                mention.scope === "literal"
                  ? mention.id
                  : `<${
                      mention.scope === "special"
                        ? "id:"
                        : mention.scope === "channel"
                          ? "#"
                          : mention.scope === "member"
                            ? "@"
                            : mention.scope === "role"
                              ? "@&"
                              : ""
                    }${mention.id}>${event.shiftKey ? "" : " "}`,
              );
              if (!event.shiftKey) {
                collapse();
              }
            }}
          />
        ) : tab === "time" ? (
          <TimePicker
            id={id}
            className="border-none shadow-none w-full"
            // I'm not sure this one needs to be shift-clickable
            // but we might patch that in later for consistency
            onTimeClick={(timestamp) => {
              insertText(
                `<t:${timestamp.date.unix()}${
                  timestamp.style ? `:${timestamp.style}` : ""
                }>`,
              );
              collapse();
            }}
          />
        ) : tab === "emoji" ? (
          <EmojiPicker
            id={id}
            className="border-none shadow-none w-full"
            onEmojiClick={(emoji, event) => {
              insertText(
                (emoji.keywords.includes("discord")
                  ? `<${emoji.keywords.includes("animated") ? "a" : ""}:${
                      emoji.name
                    }:${emoji.skin.native}>`
                  : emoji.skin.native) + (event.shiftKey ? "" : " "),
              );
              if (!event.shiftKey) {
                collapse();
              }
            }}
          />
        ) : (
          <></>
        )}
      </div>
    </details>
  );
};
