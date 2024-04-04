import { ReactNode, useState } from "react";
import { twJoin } from "tailwind-merge";
import { CoolIcon } from "./CoolIcon";

export const TextInput = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    label: ReactNode;
    description?: ReactNode;
    delayOnInput?: number;
    errors?: ReactNode[];
  },
) => {
  const { label, onInput, delayOnInput } = props;

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  // React yells when providing props like this, so we remove it
  const newProps = { ...props };
  // biome-ignore lint/performance/noDelete: We don't want the prop to exist at all
  delete newProps.delayOnInput;

  return (
    <label className="block">
      <p className="text-sm font-medium flex">
        {label}
        {props.maxLength && (
          <span className="ml-auto">max. {props.maxLength}</span>
        )}
      </p>
      {props.description && <p className="text-sm">{props.description}</p>}
      <input
        type="text"
        {...newProps}
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
          "rounded border min-h-[36px] max-h-9 py-0 px-[14px] bg-gray-300 border-gray-200 placeholder-gray-500 focus:border-blurple-500 dark:border-transparent dark:bg-[#292b2f] dark:placeholder-gray-400 invalid:border-rose-400 dark:invalid:border-rose-400 disabled:text-gray-500 disabled:cursor-not-allowed transition",
          props.className ?? "",
        )}
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
