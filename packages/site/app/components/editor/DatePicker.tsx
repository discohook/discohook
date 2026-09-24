import { ButtonStyle } from "discord-api-types/v10";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import type { TFunction } from "~/types/i18next";
import { getTimezone } from "~/util/time";
import { Button } from "../Button";
import { CoolIcon } from "../icons/CoolIcon";
import { TextInput } from "../TextInput";

type ZoomLevel = "day" | "month" | "decade";

const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const stepMonth = (year: number, month: number, delta: number) => {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
};

const getDecadeStart = (year: number) => Math.floor(year / 10) * 10;

const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isDayDisabled = (d: Date, minDate?: Date, maxDate?: Date) => {
  const s = stripTime(d);
  return (
    (!!minDate && s < stripTime(minDate)) ||
    (!!maxDate && s > stripTime(maxDate))
  );
};

const isMonthDisabled = (
  year: number,
  month: number,
  minDate?: Date,
  maxDate?: Date,
) => {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  return (
    (!!minDate && monthEnd < stripTime(minDate)) ||
    (!!maxDate && monthStart > stripTime(maxDate))
  );
};

const isYearDisabled = (year: number, minDate?: Date, maxDate?: Date) => {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  return (
    (!!minDate && yearEnd < stripTime(minDate)) ||
    (!!maxDate && yearStart > stripTime(maxDate))
  );
};

const getInitialAnchor = (
  value: Date | null | undefined,
  minDate?: Date,
  maxDate?: Date,
): Date => {
  let base = value instanceof Date ? value : new Date();
  if (minDate && base < minDate) base = minDate;
  if (maxDate && base > maxDate) base = maxDate;
  return base;
};

const getCalendarCells = (year: number, month: number) => {
  const firstWeekday = new Date(year, month, 1).getDay();
  const numDays = daysInMonth(year, month);
  const totalCells = Math.ceil((firstWeekday + numDays) / 7) * 7;

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({
      date: new Date(year, month, i - firstWeekday + 1),
      inMonth: false,
    });
  }
  for (let day = 1; day <= numDays; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  const trailing = totalCells - cells.length;
  for (let day = 1; day <= trailing; day++) {
    cells.push({ date: new Date(year, month, numDays + day), inMonth: false });
  }
  return cells;
};

const getDecadeCells = (decadeStart: number) => {
  const cells: { year: number; inDecade: boolean }[] = [];
  for (let y = decadeStart - 1; y <= decadeStart + 10; y++) {
    cells.push({ year: y, inDecade: y >= decadeStart && y < decadeStart + 10 });
  }
  return cells;
};

const getWeekdayLabels = (locale: string) =>
  Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(1970, 0, 4 + i)).toLocaleDateString(locale, {
      weekday: "narrow",
      timeZone: "UTC",
    }),
  );

const cellClassName = (opts: { disabled: boolean; selected: boolean }) =>
  twJoin(
    "flex relative aspect-square first:rounded-ss last:rounded-ee disabled:cursor-default",
    opts.disabled
      ? "bg-[#F2F2F2] dark:bg-[#25272A] text-gray-500"
      : "bg-white dark:bg-[#313338] hover:bg-blurple hover:text-white cursor-pointer",
    opts.selected
      ? "font-semibold overflow-hidden before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-blurple"
      : "",
  );

const NavButton: React.FC<{
  direction: "prev" | "next";
  onClick: () => void;
}> = ({ direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-2 text-lg text-gray-500 hover:text-gray-800 dark:hover:text-white"
  >
    {direction === "prev" ? (
      <CoolIcon icon="Chevron_Left" rtl="Chevron_Right" />
    ) : (
      <CoolIcon icon="Chevron_Right" rtl="Chevron_Left" />
    )}
  </button>
);

export const DatePicker: React.FC<{
  t: TFunction;
  value?: Date | null;
  onChange: (date: Date) => void;
  onReset?: () => void;
  withTimePicker?: boolean;
  minDate?: Date;
  maxDate?: Date;
}> = ({ t, value, onChange, onReset, withTimePicker, minDate, maxDate }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const [level, setLevel] = useState<ZoomLevel>("day");
  const [viewYear, setViewYear] = useState(() =>
    getInitialAnchor(value, minDate, maxDate).getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(() =>
    getInitialAnchor(value, minDate, maxDate).getMonth(),
  );

  const selectDay = (cellDate: Date) => {
    const base = value instanceof Date ? value : new Date();
    onChange(
      new Date(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate(),
        base.getHours(),
        base.getMinutes(),
        base.getSeconds(),
        base.getMilliseconds(),
      ),
    );
  };

  const handleTimeChange = (hhmm: string) => {
    const [hour, minute] = hhmm.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return;
    const base = value instanceof Date ? value : new Date();
    onChange(
      new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        hour,
        minute,
        0,
        0,
      ),
    );
  };

  const decadeStart = getDecadeStart(viewYear);

  return (
    <div className="w-fit rounded-lg border border-border-normal bg-gray-50 dark:border-border-normal-dark dark:bg-gray-700 dark:text-primary-230 shadow-md">
      <div className={twJoin("flex flex-col", withTimePicker && "sm:flex-row")}>
        <div className={twJoin(!withTimePicker && "!w-72")}>
          {level === "day" && (
            <>
              <div className="flex items-center justify-between px-2 pt-2">
                <NavButton
                  direction="prev"
                  onClick={() => {
                    const { year, month } = stepMonth(viewYear, viewMonth, -1);
                    setViewYear(year);
                    setViewMonth(month);
                  }}
                />
                <div className="flex gap-1 text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => setLevel("month")}
                    className="hover:text-blurple dark:hover:text-blurple-400"
                  >
                    {new Date(viewYear, viewMonth, 1).toLocaleDateString(
                      locale,
                      { month: "long" },
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevel("decade")}
                    className="hover:text-blurple dark:hover:text-blurple-400"
                  >
                    {viewYear}
                  </button>
                </div>
                <NavButton
                  direction="next"
                  onClick={() => {
                    const { year, month } = stepMonth(viewYear, viewMonth, 1);
                    setViewYear(year);
                    setViewMonth(month);
                  }}
                />
              </div>
              <div className="mt-1 pt-1 mx-4 grid grid-cols-7 border-t border-t-[#E3E5E8] dark:border-t-[#27292D] cursor-default text-[75%] font-medium text-gray-500">
                {getWeekdayLabels(locale).map((label, i) => (
                  <span
                    key={`weekday-${i}-${label}`}
                    className="inline-block text-center"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="mx-4 mb-4">
                <div className="w-full grid grid-cols-7 gap-px rounded border border-[#E3E5E8] dark:border-[#1E1F22] bg-[#E3E5E8] dark:bg-[#1E1F22]">
                  {getCalendarCells(viewYear, viewMonth).map(
                    ({ date, inMonth }, index, arr) => {
                      const disabled =
                        !inMonth || isDayDisabled(date, minDate, maxDate);
                      const selected =
                        inMonth &&
                        value instanceof Date &&
                        isSameDate(date, value);

                      // this could be moved outside of this map, we just need
                      // to determine the last sunday
                      const lastDate = new Date(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        0,
                      );
                      const endBuffer = arr.filter(
                        (d) =>
                          !d.inMonth && d.date.getTime() > lastDate.getTime(),
                      ).length;
                      const lastWeekdays = 6 - endBuffer;
                      const isLastSunday =
                        date.getDate() === lastDate.getDate() - lastWeekdays;

                      return (
                        <button
                          type="button"
                          key={date.getTime()}
                          disabled={disabled}
                          onClick={() => selectDay(date)}
                          className={twMerge(
                            cellClassName({ disabled, selected }),
                            "min-w-7",
                            // first saturday
                            index === 6 ? "rounded-se" : "",
                            isLastSunday ? "rounded-es" : "",
                          )}
                        >
                          <span className="m-auto">{date.getDate()}</span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </>
          )}

          {level === "month" && (
            <>
              <div className="flex items-center justify-between px-2 pt-2">
                <NavButton
                  direction="prev"
                  onClick={() => setViewYear(viewYear - 1)}
                />
                <button
                  type="button"
                  onClick={() => setLevel("decade")}
                  className="text-sm font-medium hover:text-blurple dark:hover:text-blurple-400"
                >
                  {viewYear}
                </button>
                <NavButton
                  direction="next"
                  onClick={() => setViewYear(viewYear + 1)}
                />
              </div>
              <div className="mx-4 my-4 px-5">
                <div className="w-full grid grid-cols-4 gap-px rounded border border-[#E3E5E8] dark:border-[#1E1F22] bg-[#E3E5E8] dark:bg-[#1E1F22]">
                  {Array.from({ length: 12 }, (_, m) => m).map((m, index) => {
                    const disabled = isMonthDisabled(
                      viewYear,
                      m,
                      minDate,
                      maxDate,
                    );
                    const selected =
                      value instanceof Date &&
                      value.getFullYear() === viewYear &&
                      value.getMonth() === m;
                    return (
                      <button
                        type="button"
                        key={m}
                        disabled={disabled}
                        onClick={() => {
                          setViewMonth(m);
                          setLevel("day");
                        }}
                        className={twMerge(
                          cellClassName({ disabled, selected }),
                          "min-w-10",
                          index === 3 ? "rounded-se" : "",
                          index === 8 ? "rounded-es" : "",
                        )}
                      >
                        <span className="m-auto">
                          {new Date(viewYear, m, 1).toLocaleDateString(locale, {
                            month: "short",
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {level === "decade" && (
            <>
              <div className="flex items-center justify-between px-2 pt-2">
                <NavButton
                  direction="prev"
                  onClick={() => setViewYear(decadeStart - 10)}
                />
                <span className="text-sm font-medium">
                  {decadeStart}&ndash;{decadeStart + 9}
                </span>
                <NavButton
                  direction="next"
                  onClick={() => setViewYear(decadeStart + 10)}
                />
              </div>
              <div className="mx-4 my-4 px-5">
                <div className="w-full grid grid-cols-4 gap-px rounded border border-[#E3E5E8] dark:border-[#1E1F22] bg-[#E3E5E8] dark:bg-[#1E1F22]">
                  {getDecadeCells(decadeStart).map(
                    ({ year, inDecade }, index) => {
                      const disabled =
                        !inDecade || isYearDisabled(year, minDate, maxDate);
                      const selected =
                        inDecade &&
                        value instanceof Date &&
                        value.getFullYear() === year;
                      return (
                        <button
                          type="button"
                          key={year}
                          disabled={disabled}
                          onClick={() => {
                            setViewYear(year);
                            setLevel("month");
                          }}
                          className={twMerge(
                            cellClassName({ disabled, selected }),
                            "min-w-10",
                            index === 3 ? "rounded-se" : "",
                            index === 8 ? "rounded-es" : "",
                          )}
                        >
                          <span className="m-auto">{year}</span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {withTimePicker && (
          <div className="p-3 sm:border-s sm:border-s-[#E3E5E8] dark:sm:border-s-[#1E1F22] sm:w-40 flex flex-col justify-center">
            <TextInput
              t={t}
              type="time"
              label={t("time", {
                replace: { timezone: getTimezone("longGeneric") },
              })}
              value={
                value instanceof Date
                  ? value.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : ""
              }
              onChange={(e) => handleTimeChange(e.currentTarget.value)}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="p-2 pt-0">
        <div className="flex gap-2 ms-auto w-fit">
          <Button
            onClick={() => {
              const date = new Date();
              onChange(date);
              // take view back to today
              setViewMonth(date.getMonth());
              setViewYear(date.getFullYear());
              setLevel("day");
            }}
          >
            {t("today")}
          </Button>
          {!!onReset && (
            <Button onClick={onReset} discordstyle={ButtonStyle.Secondary}>
              {t("reset")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
