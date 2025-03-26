// From https://github.com/discohook/site/blob/main/common/input/file/PasteFileButton.tsx

import { ButtonStyle } from "discord-api-types/v10";
import type { TFunction } from "i18next";
import mime from "mime";
import { useRef, useState } from "react";
import { Button } from "../Button";

export type PasteFileButtonProps = {
  t: TFunction;
  className?: string;
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

export function PasteFileButton(props: PasteFileButtonProps) {
  const { t, className, onChange: handleChange, disabled = false } = props;

  const [active, setActive] = useState(false);

  const pasteInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={pasteInputRef}
        tabIndex={-1}
        placeholder={t("pasteFile")}
        disabled={disabled}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
        }}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onPaste={(event) => {
          handleChange(Array.from(event.clipboardData.files));
          pasteInputRef.current?.blur();
        }}
      />
      <Button
        className={className}
        disabled={disabled}
        discordstyle={ButtonStyle.Secondary}
        onClick={async () => {
          if (navigator.clipboard) {
            const items = await navigator.clipboard.read();
            const files: File[] = [];
            for (const item of items) {
              let type: string | undefined;
              // Guess the preferred type based on what a user would probably
              // expect to be on their clipboard. This attempts to prevent
              // static gifs from being pasted before animated ones.
              for (const preferred of [
                "image/gif",
                "image/png",
                "image/jpeg",
              ]) {
                if (item.types.includes(preferred)) {
                  type = preferred;
                  break;
                }
              }
              // If that doesn't work, prefer any image or video
              if (!type) {
                for (const itemType of item.types) {
                  if (
                    itemType.startsWith("image/") ||
                    itemType.startsWith("video/")
                  ) {
                    type = itemType;
                    break;
                  }
                }
              }

              // If `type` is still undefined then the item is not an image.
              // At this point we don't really care since there is probably
              // only one type in the array anyway.
              const blob = await item.getType(type ?? item.types[0]);
              const ext = mime.getExtension(blob.type);
              const file = new File(
                [blob],
                ext ? `unknown.${ext}` : "unknown",
                // For some reason this is not inferred from `blob.type`
                { type: blob.type },
              );
              files.push(file);
            }
            handleChange(files);
            return;
          }
          // If we can't use the clipboard API, fall back to this method.
          // A convenience of this method is that `onPaste` immediately provides a `File`.
          pasteInputRef.current?.focus();
          if (
            // On iOS, we can open a text formatting dialog which
            // allows the user to paste their clipboard.
            ["iPhone", "iPad", "iPod"].find((p) =>
              navigator.platform.startsWith(p),
            )
          ) {
            document.execCommand("paste");
          }
        }}
      >
        {active
          ? // iOS devices support keyboards too
            ["Mac", "iPhone", "iPad", "iPod"].find((p) =>
              navigator.platform.startsWith(p),
            )
            ? t("pasteCmd")
            : t("pasteCtrl")
          : t("pasteFile")}
      </Button>
    </>
  );
}
