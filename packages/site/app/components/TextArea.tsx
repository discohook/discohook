import insertTextAtCursor from "insert-text-at-cursor";
import { type ReactNode, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import type { TFunction } from "~/types/i18next";
import type { CacheManager } from "~/util/cache/CacheManager";
import {
  PopoutRichPicker,
  type PopoutRichPickerState,
} from "./editor/RichPicker";
import { CoolIcon } from "./icons/CoolIcon";
import { type FeatureConfig, getEnabledRuleKeys } from "./preview/Markdown";

export const TextArea = (
  props: React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > & {
    label: ReactNode;
    description?: ReactNode;
    delayOnInput?: number;
    errors?: ReactNode[];
    short?: boolean;
    freeLength?: boolean;
    markdown?: FeatureConfig;
    cache?: CacheManager;
    t?: TFunction;
  },
) => {
  const {
    label,
    onInput,
    delayOnInput,
    short,
    freeLength,
    markdown,
    cache,
    t,
    ...newProps
  } = props;
  const ref = useRef<HTMLTextAreaElement>(null);
  const length = ref.current ? ref.current.value.length : 0;

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  if (freeLength) {
    newProps.maxLength = undefined;
  }

  const mdKeys = markdown ? getEnabledRuleKeys(markdown) : [];
  const [popoutState, setPopoutState] = useState<PopoutRichPickerState>();

  return (
    <label className="block">
      <p className="text-sm font-medium">
        {label}
        {newProps.required && (
          <span
            className={twJoin(
              "align-baseline",
              t ? "ltr:ml-2 rtl:mr-2 text-xs italic" : "text-rose-400",
            )}
          >
            {t ? t("required") : "*"}
          </span>
        )}
        {props.maxLength && (
          <span
            className={twJoin(
              "ltr:ml-2 rtl:mr-2 italic text-xs align-baseline",
              length >= props.maxLength
                ? "text-red-300"
                : length / (props.maxLength || 1) >= 0.9
                  ? "text-yellow-300"
                  : "",
            )}
          >
            {length}/{props.maxLength}
          </span>
        )}
      </p>
      {props.description && <p className="text-sm">{props.description}</p>}
      {/* TODO: On Chrome this div is 6px too tall for some reason */}
      <div className="relative">
        <textarea
          {...newProps}
          ref={ref}
          // onClick={(e) => {
          //   cursorRef.current = e.currentTarget.selectionStart;
          // }}
          onInput={(e) => {
            // For some reason, currentTarget is only available while processing
            // (i.e. during this callback). We make a shallow copy of the event
            // object here in order to retain it for the provided onInput.
            // https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget
            const event = { ...e };

            if (timeoutId) {
              clearTimeout(timeoutId);
              setTimeoutId(undefined);
            }

            if (onInput && delayOnInput !== undefined) {
              setTimeoutId(
                setTimeout(() => {
                  onInput(event);
                  setTimeoutId(undefined);
                }, delayOnInput),
              );
            } else if (onInput) {
              return onInput(event);
            }
          }}
          onKeyDown={(e) => {
            // "meta key" = command key on mac/ios, but also I think the
            // windows key. Hopefully this doesn't interfere with windows
            // shortcuts.
            if (markdown && (e.metaKey || e.ctrlKey)) {
              if (["e", "m", "p"].includes(e.key)) {
                // avoid the print dialog and minimization/muting
                e.preventDefault();
              }
              // we want to be sure not to use B, I, or U since we are
              // reserving those for markdown shortcuts
              switch (e.key) {
                // ctrl+e and cmd+e are barren enough to use, plus this is
                // what discord uses for opening the emoji picker
                case "e": {
                  if (
                    mdKeys.includes("unicodeEmojis") ||
                    mdKeys.includes("customEmojis")
                  ) {
                    popoutState?.openWithTab("emoji");
                  }
                  break;
                }
                // cmd/ctrl+m = minimize/mute tab by default, but i don't think
                //              that many people will want to do those while in
                //              an input
                // cmd/ctrl+e = emoji
                // cmd/ctrl+n = new window
                // cmd/ctrl+t = new tab
                // cmd/ctrl+i = reserved for italics
                // cmd/ctrl+o = open file
                // cmd/ctrl+s = save (useless for this page, but too broad)
                case "m": {
                  if (
                    mdKeys.includes("channelMentions") &&
                    mdKeys.includes("guildSectionMentions") &&
                    mdKeys.includes("memberMentions") &&
                    mdKeys.includes("roleMentions")
                  ) {
                    popoutState?.openWithTab("mentions");
                  }
                  break;
                }
                // cmd/ctrl+t = new tab
                // cmd/ctrl+i = reserved for italics
                // cmd/ctrl+m = minimize/mute tab
                // cmd/ctrl+e = emoji
                // p (timestamp) = opens print dialog, but we prevent it above
                case "p": {
                  if (mdKeys.includes("timestamps")) {
                    popoutState?.openWithTab("time");
                  }
                  break;
                }
                default:
                  break;
              }
            }
          }}
          className={twJoin(
            "rounded-lg border bg-white border-border-normal placeholder-gray-500 focus:outline-none focus:border-blurple dark:border-border-normal-dark dark:focus:border-blue-345 dark:bg-[#333338] invalid:border-rose-400 dark:invalid:border-rose-400 disabled:text-gray-600 disabled:cursor-not-allowed transition resize-y",
            short ? "min-h-9 py-1 px-[14px]" : "min-h-11 p-2",
            props.className,
          )}
          rows={short ? 1 : 4}
        />
        {markdown && !newProps.disabled ? (
          <PopoutRichPicker
            t={t}
            setState={setPopoutState}
            cache={cache}
            insertText={(text) => {
              if (ref.current) {
                // Feels choppy. Not sure if we should keep this.
                insertTextAtCursor(ref.current, text);
              }
            }}
            mentionsTab={
              mdKeys.includes("channelMentions") &&
              mdKeys.includes("guildSectionMentions") &&
              mdKeys.includes("memberMentions") &&
              mdKeys.includes("roleMentions")
            }
            timeTab={mdKeys.includes("timestamps")}
            emojiTab={
              mdKeys.includes("customEmojis") ||
              mdKeys.includes("unicodeEmojis")
            }
          >
            <CoolIcon
              icon="Keyboard"
              className={twJoin(
                "absolute text-2xl cursor-pointer text-primary-500 dark:text-primary-300 hover:text-black dark:hover:text-white transition ltr:right-3.5 rtl:left-3.5",
                short ? "bottom-0.5" : "bottom-2",
              )}
            />
          </PopoutRichPicker>
        ) : null}
      </div>
      {props.errors
        ?.filter((e) => e !== undefined)
        .map((error, i) => (
          <p
            key={`${props.id ?? label}-error-${i}`}
            className="text-rose-500 font-medium mt-1 text-sm"
          >
            <CoolIcon icon="Circle_Warning" className="mr-1.5" />
            {error}
          </p>
        ))}
    </label>
  );
};
