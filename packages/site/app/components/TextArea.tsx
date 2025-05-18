import { TFunction } from "i18next";
import insertTextAtCursor from "insert-text-at-cursor";
import { ReactNode, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import { CacheManager } from "~/util/cache/CacheManager";
import { PopoutRichPicker } from "./editor/RichPicker";
import { CoolIcon } from "./icons/CoolIcon";
import { FeatureConfig, getEnabledRuleKeys } from "./preview/Markdown";

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
          className={twJoin(
            "rounded-lg border bg-white border-border-normal placeholder-gray-500 focus:outline-none focus:border-blurple dark:border-border-normal-dark dark:focus:border-blue-345 dark:bg-[#333338] invalid:border-rose-400 dark:invalid:border-rose-400 disabled:text-gray-600 disabled:cursor-not-allowed transition resize-y",
            short ? "min-h-9 py-1 px-[14px]" : "min-h-11 p-2",
            props.className,
          )}
          rows={short ? 1 : 4}
        />
        {markdown && (
          <PopoutRichPicker
            t={t}
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
        )}
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
