import { Popover, type PopoverRootActions } from "@base-ui/react/popover";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";
import type { TFunction } from "~/types/i18next";
import { DatePicker } from "../editor/DatePicker";
import { CoolIcon } from "../icons/CoolIcon";
import { popoverStyles } from "./Popover";

export const DatePickerPopoverWithTrigger = ({
  t,
  labelKey,
  name,
  value,
  onValueChange,
  minDate,
  maxDate,
  // withTimePicker,
  isClearable,
  isDisabled,
  isRequired,
  className,
  allowInput = true,
}: {
  t: TFunction;
  labelKey?: string;
  name?: string;
  value: Date | null | undefined;
  onValueChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  // withTimePicker?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  className?: string;
  allowInput?: boolean;
}) => {
  // don't know if i'm going to do this, it's awkward
  const withTimePicker = false;
  const actionsRef = useRef<PopoverRootActions>(null);

  return (
    <Popover.Root actionsRef={actionsRef}>
      <Popover.Trigger
        className={twMerge(
          "flex cursor-pointer text-start",
          isDisabled ? "cursor-not-allowed" : "",
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-required={isRequired}
      >
        <div className="grow max-w-full">
          <p className="text-sm font-medium">
            {t(labelKey ?? (withTimePicker ? "datetime" : "date"))}
            {isRequired ? (
              <span className="align-baseline ms-2 text-xs italic">
                {t("required")}
              </span>
            ) : null}
          </p>
          <div
            className={twMerge(
              "rounded-lg border h-9 py-0 px-[14px] bg-white border-border-normal dark:bg-[#333338] dark:border-border-normal-dark flex items-center truncate gap-2",
              className,
            )}
          >
            {name ? (
              <input
                name={name}
                type="datetime-local"
                value={value ? value.toISOString().split("Z")[0] : ""}
                hidden
                readOnly
                disabled={isDisabled}
                required={isRequired}
              />
            ) : null}
            <p className="truncate">
              {value instanceof Date
                ? value.toLocaleString(undefined, {
                    // maybe we can bring this back with proper relative
                    // viewport math, but for now too much useful info was
                    // getting cropped out
                    // weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: withTimePicker ? "numeric" : undefined,
                    minute: withTimePicker ? "2-digit" : undefined,
                  })
                : t("clickToSet")}
            </p>
            {/* Firefoxism. Chrome has a similar time icon but it doesn't theme properly */}
            <CoolIcon
              icon="Calendar"
              className="ms-auto me-1.5 text-[#4F4F4F] hover:text-black dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            />
          </div>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className="z-[35]"
          // label is part of the trigger so it looks weird unless we trim some padding
          sideOffset={(s) => (s.side === "top" ? -12 : 8)}
        >
          <Popover.Popup className={popoverStyles.popup}>
            <DatePicker
              t={t}
              value={value}
              onChange={(value) => onValueChange(value)}
              onReset={isClearable ? () => onValueChange(undefined) : undefined}
              onClose={() => actionsRef.current?.close()}
              withTimePicker={withTimePicker}
              minDate={minDate}
              maxDate={maxDate}
              allowInput={allowInput}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
