import { ReactNode, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import { CoolIcon } from "./CoolIcon";
import { MarkdownFeatures } from "./preview/Markdown";

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
    freelength?: boolean;
    markdown?: MarkdownFeatures;
  },
) => {
  const { label, onInput, delayOnInput, short } = props;
  const ref = useRef<HTMLTextAreaElement>(null);
  const length = ref.current ? ref.current.value.length : 0;

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  // React yells when providing props like this, so we remove it
  const newProps = { ...props };
  // biome-ignore lint/performance/noDelete:
  delete newProps.delayOnInput;
  if (props.freelength) {
    newProps.maxLength = undefined;
  }

  return (
    <label className="block">
      <p className="text-sm font-medium">
        {label}
        {props.maxLength && (
          <span
            className={twJoin(
              "ml-2 italic text-xs align-baseline",
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
            "rounded border bg-gray-300 border-gray-200 focus:border-blurple-500 dark:border-transparent dark:bg-[#292b2f] invalid:border-rose-400 dark:invalid:border-rose-400 transition",
            short ? "min-h-[36px] max-h-9 py-1 px-[14px]" : "p-2",
            props.className ?? "",
          )}
        />
        {/*props.markdown && (
          <PopoutRichPicker
            insertText={(text) => {
              if (ref.current) {
                // Feels choppy. Not sure if we should keep this.
                insertTextAtCursor(ref.current, text);
              }
            }}
          >
            <CoolIcon
              icon="Keyboard"
              className={twJoin(
                "absolute text-2xl cursor-pointer text-primary-500 dark:text-primary-300 hover:text-black dark:hover:text-white transition right-3.5",
                short ? "bottom-0.5" : "bottom-2",
              )}
            />
          </PopoutRichPicker>
        )*/}
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
