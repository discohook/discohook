import type { TFunction } from "i18next";
import { type ReactNode, useRef, useState } from "react";
import { twJoin, twMerge } from "tailwind-merge";
import { CoolIcon } from "./icons/CoolIcon";

export const textInputStyles = {
  label: "text-sm font-medium",
  input:
    "rounded-lg border min-h-[36px] max-h-9 py-0 px-[14px] bg-white border-border-normal placeholder-gray-500 focus:outline-none focus:border-blurple dark:border-border-normal-dark dark:focus:border-blue-345 dark:bg-[#333338] invalid:border-rose-400 dark:invalid:border-rose-400 disabled:text-gray-600 disabled:cursor-not-allowed transition",
};

export const TextInput = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    label?: ReactNode;
    description?: ReactNode;
    delayOnInput?: number;
    freeLength?: boolean;
    errors?: ReactNode[];
    t?: TFunction;
  },
) => {
  const { label, onInput, delayOnInput, t, freeLength, ...newProps } = props;
  const ref = useRef<HTMLInputElement>(null);
  const length = ref.current ? ref.current.value.length : 0;

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  if (freeLength) {
    newProps.maxLength = undefined;
  }

  return (
    <label className="block">
      {(label || newProps.required || props.maxLength) && (
        <p className={textInputStyles.label}>
          {label}
          {newProps.required && (
            <span
              className={twJoin(
                "align-baseline",
                t ? "ms-2 text-xs italic" : "text-rose-400",
              )}
            >
              {t ? t("required") : "*"}
            </span>
          )}
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
      )}
      {props.description && <p className="text-sm">{props.description}</p>}
      <input
        type="text"
        {...newProps}
        ref={ref}
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
        className={twMerge(textInputStyles.input, props.className)}
      />
      {props.errors
        ?.filter((e) => e !== undefined)
        .map((error, i) => (
          <p
            key={`${props.id ?? label}-error-${i}`}
            className="text-rose-500 dark:text-rose-300 font-medium mt-1 text-sm"
          >
            <CoolIcon icon="Circle_Warning" className="mr-1.5" />
            {error}
          </p>
        ))}
    </label>
  );
};
