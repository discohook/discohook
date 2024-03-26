import { useState } from "react";
import { randomString } from "~/util/text";
import { EmojiPicker } from "./EmojiPicker";

export const PopoutRichPicker: React.FC<
  React.PropsWithChildren<{
    insertText: (text: string) => void;
  }>
> = ({ insertText, children }) => {
  const id = randomString(10);

  type Tab = "mentions" | "time" | "emoji";
  const [tab, setTab] = useState<Tab>("mentions");

  return (
    <details className="relative group/rich">
      <summary className="flex cursor-pointer marker:hidden marker-none">
        {children}
      </summary>
      <div className="absolute z-20 pb-8 right-0 bg-gray-300 dark:bg-gray-800 border border-black/5 rounded shadow-md w-[385px]">
        <div className="font-semibold space-x-1 px-2 pt-2 text-sm">
          <button
            type="button"
            className="inline-block rounded px-1.5 py-px hover:bg-primary-300 dark:hover:bg-primary-500 transition"
          >
            Mentions
          </button>
          <button
            type="button"
            className="inline-block rounded px-1.5 py-px hover:bg-primary-300 dark:hover:bg-primary-500 transition"
          >
            Time
          </button>
          <button
            type="button"
            className="inline-block rounded px-1.5 py-px hover:bg-primary-300 dark:hover:bg-primary-500 transition"
          >
            Emojis
          </button>
        </div>
        {tab === "mentions" ? (
          <></>
          // <MentionsPicker
          //   id={id}
          //   className="border-none shadow-none w-full"
          //   onMentionClick={(mention) => {
          //     insertText(
          //       `<${
          //         mention.type === "channel"
          //           ? "#"
          //           : mention.type === "user"
          //             ? "@"
          //             : mention.type === "role"
          //               ? "@&"
          //               : ""
          //       }${mention.id}>`,
          //     );
          //   }}
          // />
          // ) : tab === "time" ? (
          //   <TimePicker
          //     id={id}
          //     className="border-none shadow-none w-full"
          //     onTimeClick={(timestamp) => {
          //       insertText(
          //         `<t:${timestamp.date.unix()}${
          //           timestamp.style ? `:${timestamp.style}` : ""
          //         }>`,
          //       );
          //     }}
          //   />
        ) : tab === "emoji" ? (
          <EmojiPicker
            id={id}
            className="border-none shadow-none w-full"
            onEmojiClick={(emoji) => {
              insertText(
                emoji.keywords.includes("discord")
                  ? `<${emoji.keywords.includes("animated") ? "a" : ""}:${
                      emoji.name
                    }:${emoji.skin.native}>`
                  : emoji.skin.native,
              );
            }}
          />
        ) : (
          <></>
        )}
      </div>
    </details>
  );
};
