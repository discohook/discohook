import { ReactNode, useState } from "react";

export const TextInput = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    label: ReactNode;
    delayOnInput?: number;
  }
) => {
  const { label, onInput, delayOnInput } = props;

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  // React yells when providing props like this, so we remove it
  const newProps = { ...props };
  delete newProps.delayOnInput;

  return (
    <label className="block">
      <p className="text-sm">{label}</p>
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
              }, delayOnInput)
            );
          } else if (onInput) {
            return onInput(event);
          }
        }}
        className={`rounded-lg border bg-gray-50 border-gray-200 focus:border-blurple-500 dark:border-gray-600 dark:bg-gray-700 p-2 invalid:border-rose-400 dark:invalid:border-rose-400 transition ${
          props.className ?? ""
        }`}
      />
    </label>
  );
};
