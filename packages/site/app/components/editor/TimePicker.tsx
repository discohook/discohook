import { useState } from "react";
import { Trans } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { TFunction } from "~/types/i18next";
import type { CacheManager } from "~/util/cache/CacheManager";
import { getRelativeDateFormat } from "~/util/markdown/dates";
import { CoolIcon } from "../icons/CoolIcon";
import { DatePickerPopoverWithTrigger } from "../pickers/DatePicker";
import { timestampFormats } from "../preview/Markdown";
import { TextInput } from "../TextInput";

// I'm sure this is exported by discord-api-types somewhere but I couldn't find it
export type TimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export const TimePicker: React.FC<{
  t: TFunction;
  id: string;
  onTimeClick: (
    timestamp: { date: Date; style: TimestampStyle | undefined },
    // event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  className?: string;
  cache?: CacheManager;
}> = ({ t, className, onTimeClick }) => {
  const [date, setDate] = useState(new Date());
  return (
    <div
      className={twJoin(
        "rounded-lg bg-gray-300 dark:bg-gray-800 w-[385px] border border-black/5 dark:border-gray-200/20 shadow-md",
        className,
      )}
    >
      <div className="select-none p-3 pt-2">
        <div className="grid grid-cols-1 gap-2">
          <DatePickerPopoverWithTrigger
            t={t}
            value={date}
            onValueChange={(v) => {
              if (v) setDate(v);
            }}
          />
          <TextInput
            label={t("timeText")}
            type="time"
            className="w-full bg-gray-200"
            step={1}
            value={date.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: false,
            })}
            onChange={({ currentTarget }) => {
              const [hour, minute, second] = currentTarget.value.split(":");
              const newDate = new Date(date);
              newDate.setHours(Number(hour), Number(minute), Number(second), 0);
              setDate(newDate);
            }}
          />
        </div>
        <div className="mt-2">
          <div className="text-sm font-medium mb-1 flex">
            <p className="my-auto">{t("style")}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            {Object.entries(timestampFormats).map(([style, key]) => {
              const [relativeFormat, n] = getRelativeDateFormat(date);
              const format =
                style === "R" ? (`relative.${relativeFormat}` as const) : key;

              return (
                <button
                  type="button"
                  key={`time-style-option-${style}`}
                  disabled={!date}
                  onClick={() => {
                    onTimeClick({ date, style: style as TimestampStyle });
                  }}
                  className="rounded-lg p-1 px-2 text-left bg-gray-200 dark:bg-[#292b2f] hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  <CoolIcon icon="Clock" />{" "}
                  <Trans
                    t={t}
                    i18nKey={`timestamp.${format}`}
                    values={{ date, count: n }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
