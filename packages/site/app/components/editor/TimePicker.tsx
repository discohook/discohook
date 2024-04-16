import moment, { Moment } from "moment";
import { useState } from "react";
import { Trans } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { CacheManager } from "~/util/cache/CacheManager";
import { getRelativeDateFormat } from "~/util/markdown/dates";
import DatePicker from "../DatePicker";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import { timestampFormats } from "../preview/Markdown";

// I'm sure this is exported by discord-api-types somewhere but I couldn't find it
export type TimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export const TimePicker: React.FC<{
  id: string;
  onTimeClick: (
    timestamp: {
      date: Moment;
      style: TimestampStyle | undefined;
    },
    // event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  className?: string;
  cache?: CacheManager;
}> = ({ id, cache, className, onTimeClick }) => {
  const [date, setDate] = useState(moment());
  return (
    <div
      className={twJoin(
        "rounded bg-gray-300 dark:bg-gray-800 w-[385px] border border-black/5 shadow-md",
        className,
      )}
    >
      <div className="select-none p-3 pt-2">
        <DatePicker
          label="Date"
          onChange={(v) => {
            if (v) setDate(v.date);
          }}
        />
        <div className="mt-2">
          <TextInput
            label="Time"
            type="time"
            className="w-full bg-gray-200"
            step={1}
            // value={date ? date.toDate().toISOString().split("T")[1] : ""}
            onChange={({ currentTarget }) => {
              const [hour, minute, second] = currentTarget.value.split(":");
              date.hours(Number(hour));
              date.minutes(Number(minute));
              date.seconds(Number(second));
              setDate(date.clone());
            }}
          />
        </div>
        <div className="mt-2">
          <div className="text-sm font-medium mb-1 flex">
            <p className="my-auto">Style</p>
          </div>
          <div className="flex flex-col gap-0.5">
            {Object.entries(timestampFormats).map(([style, key]) => {
              const [relativeFormat, n] = getRelativeDateFormat(date.toDate());
              const format =
                style === "R" ? (`relative.${relativeFormat}` as const) : key;

              return (
                <button
                  type="button"
                  disabled={!date}
                  onClick={() => {
                    onTimeClick({ date, style: style as TimestampStyle });
                  }}
                  className="rounded p-1 px-2 text-left bg-gray-200 dark:bg-[#292b2f] hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  <CoolIcon icon="Clock" />{" "}
                  <Trans
                    i18nKey={`timestamp.${format}`}
                    values={{ date: date.toDate(), count: n }}
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
