import { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";

export interface NumberInputProps {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = (props) => {
  const { onChange, value: initValue, ...inputProps } = props;
  const [stateValue, setValue] = useState(initValue);

  // If a controlled value was not provided, we use our own state
  const value = initValue ?? stateValue;

  useEffect(() => {
    if (initValue !== undefined && onChange === undefined) {
      console.warn(
        "A controlled value was provided but not an onChange handler, unexpected behavior may occur.",
      );
    }
  }, [initValue, onChange]);

  const subtract = (amount: number) => {
    let val = value === undefined ? 0 : value - amount;
    if (props.min) {
      val = Math.max(val, props.min);
    }
    if (onChange) onChange(val);
    setValue(val);
  };
  const add = (amount: number) => {
    let val = value === undefined ? 0 : value + amount;
    if (props.max) {
      val = Math.min(val, props.max);
    }
    if (onChange) onChange(val);
    setValue(val);
  };

  // let subTimer: NodeJS.Timeout | undefined;
  // let addTimer: NodeJS.Timeout | undefined;

  return (
    <div className="contents">
      <input {...inputProps} className="peer" value={value} hidden />
      <div
        className={twJoin(
          "rounded grid grid-cols-5 h-9 bg-gray-300 peer-focus:border-blurple-500 dark:bg-[#292b2f] peer-invalid:border-rose-400 dark:peer-invalid:border-rose-400 peer-disabled:text-gray-500 peer-disabled:cursor-not-allowed transition",
        )}
      >
        <button
          type="button"
          className="border border-gray-200 dark:border-gray-300/20 dark:bg-gray-900 dark:hover:bg-primary-600 transition rounded-l"
          onClick={() => subtract(10)}
        >
          - 10
        </button>
        <button
          type="button"
          className="border border-gray-200 dark:border-gray-300/20 dark:bg-gray-900 dark:hover:bg-primary-600 transition rounded-l"
          onClick={() => subtract(1)}
        >
          -
        </button>
        <div className="border-y border-gray-200 dark:border-gray-300/20 flex">
          <p className="m-auto">{value ?? ""}</p>
        </div>
        {/* <input
          type="text"
          max={props.max}
          min={props.min}
          className="bg-transparent border-y border-gray-200 dark:border-gray-300/20 flex text-center"
          value={value}
          onChange={({ currentTarget }) => {
            let val = currentTarget.valueAsNumber;
            if (Number.isNaN(val)) return;

            // if (props.min) {
            //   val = Math.max(val, props.min);
            // }
            // if (props.max) {
            //   val = Math.min(val, props.max);
            // }
            if (onChange) onChange(val);
            setValue(val);
          }}
        /> */}
        <button
          type="button"
          className="border border-gray-200 dark:border-gray-300/20 dark:bg-gray-900 dark:hover:bg-primary-600 transition rounded-r"
          onClick={() => add(1)}
        >
          +
        </button>
        <button
          type="button"
          className="border border-gray-200 dark:border-gray-300/20 dark:bg-gray-900 dark:hover:bg-primary-600 transition rounded-r"
          onClick={() => add(10)}
        >
          + 10
        </button>
      </div>
    </div>
  );
};
