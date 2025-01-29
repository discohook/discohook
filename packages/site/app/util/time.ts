import {
  CronFields,
  DayOfTheMonthRange,
  DayOfTheWeekRange,
  HourRange,
  MonthRange,
  SixtyRange,
} from "cron-parser";
import { TFunction } from "i18next";
import { getRelativeDateFormat } from "./markdown/dates";

type IntervalUnit =
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

type ShortIntervalUnit = "ms" | "s" | "m" | "h" | "d" | "w" | "mo" | "y";

// divide by `divValue` to get `unit`
const unitValues: {
  unit: IntervalUnit;
  shortUnit: ShortIntervalUnit;
  divValue: number;
}[] = [
  { unit: "second", shortUnit: "s", divValue: 1000 },
  { unit: "minute", shortUnit: "m", divValue: 60 },
  { unit: "hour", shortUnit: "h", divValue: 60 },
  { unit: "day", shortUnit: "d", divValue: 24 },
  { unit: "week", shortUnit: "w", divValue: 7 },
  { unit: "month", shortUnit: "mo", divValue: 4 },
  { unit: "year", shortUnit: "y", divValue: 12 },
];

export const timeDiff = (earlier: Date, later: Date, short = false) => {
  let diff = Math.abs(later.getTime() - earlier.getTime()); // ms
  let interval: IntervalUnit | ShortIntervalUnit = short ? "ms" : "millisecond";
  const processDiffInterval = (index: number) => {
    const { unit, shortUnit, divValue } = unitValues[index];
    if (diff >= divValue) {
      diff = diff / divValue;
      interval = short ? shortUnit : unit;
      if (unitValues[index + 1]) {
        processDiffInterval(index + 1);
      }
    }
  };
  processDiffInterval(0);

  diff = Math.round(diff);
  const plural = diff === 1 || short ? "" : "s";
  const diffText = `${diff.toLocaleString()}${
    short ? "" : " "
  }${interval}${plural}`;

  return { text: diffText, future: later.getTime() < earlier.getTime() };
};

export const relativeTime = (
  date: Date,
  t: TFunction<"translation", undefined>,
): string => {
  const [relativeFormat, n] = getRelativeDateFormat(date);
  return t(`timestamp.relative.${relativeFormat}`, { count: n });
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Thanks https://stackoverflow.com/a/56490104
export const getTimezone = (
  length?: Intl.DateTimeFormatOptions["timeZoneName"],
) => {
  const now = new Date();
  const short = now.toLocaleDateString(undefined);
  const full = now.toLocaleDateString(undefined, {
    timeZoneName: length ?? "short",
  });

  // Trying to remove date from the string in a locale-agnostic way
  const shortIndex = full.indexOf(short);
  if (shortIndex >= 0) {
    const trimmed =
      full.substring(0, shortIndex) + full.substring(shortIndex + short.length);

    // by this time `trimmed` should be the timezone's name with some punctuation -
    // trim it from both sides
    return trimmed.replace(/^[\s,.\-:;]+|[\s,.\-:;]+$/g, "");
  } else {
    // in some magic case when short representation of date is not present in the long one, just return the long one as a fallback, since it should contain the timezone's name
    return full;
  }
};

const add = (num: number) => num + 1;
export const cronDaysOfWeek = [...Array(7).keys()] as DayOfTheWeekRange[];
export const cronDaysOfMonth = [...Array(31).keys()].map(
  add,
) as DayOfTheMonthRange[];
export const cronMonths = [...Array(12).keys()].map(add) as MonthRange[];
export const cronHours = [...Array(24).keys()] as HourRange[];
export const cronMinutes = [...Array(60).keys()] as SixtyRange[];

// Phrasing inspired by crontab.guru but a bit more human-friendly
export const cronToEnglish = ({
  minute,
  hour,
  dayOfMonth,
  month,
  dayOfWeek,
}: CronFields) => {
  let phrase = "";
  const clock = (h: number, m: number) =>
    new Date(new Date().setHours(h, m)).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

  // Our crons will only ever have exactly one minute, and cannot have every
  // hour, but we try to handle multiple/every anyway
  if (minute.length === cronMinutes.length) {
    phrase += "at every minute ";
    if (hour.length === cronHours.length) {
      phrase += "of every hour ";
    } else {
      phrase += `of hour ${new Intl.ListFormat().format(hour.map(String))} `;
    }
  } else if (hour.length > 0) {
    // A time is required for the completed expression, but while drafting it
    // looks better to only prepend "at" when the expression has a time set
    const times = hour
      .map((h) => minute.map((m) => clock(h, m)))
      .reduce((prev, cur) => {
        prev.push(...cur);
        return prev;
      }, []);
    phrase += `at ${new Intl.ListFormat().format(times)} `;
  }

  if (dayOfMonth.length !== cronDaysOfMonth.length) {
    phrase += `on day-of-month ${new Intl.ListFormat().format(
      dayOfMonth.map(String),
    )} `;
    if (dayOfWeek.length < cronDaysOfWeek.length) {
      // This is kind of confusing. If you set day of month and day of week,
      // the evaluated schedule is ex. "the 1st of january, and also all
      // mondays in january." Not sure how to concisely por
      phrase += "and ";
    }
  }
  if (dayOfWeek.length < cronDaysOfWeek.length) {
    phrase += `on ${new Intl.ListFormat().format(
      dayOfWeek.map((d) =>
        // Hardcoded locale because the rest of the string is in English
        new Date(2000, 9, d + 1).toLocaleDateString("en-US", {
          weekday: "long",
        }),
      ),
    )} `;
  } else if (dayOfMonth.length === cronDaysOfMonth.length) {
    phrase += "every day ";
  }
  // I want to somehow convey that the schedule repeats every year, not only
  // the soonest month(s). Not really sure how to do that, it might be better
  // left as an answer to support questions
  if (month.length !== cronMonths.length) {
    phrase += `in ${new Intl.ListFormat().format(
      month.map((m) =>
        new Date(2000, m - 1, 1).toLocaleDateString("en-US", { month: "long" }),
      ),
    )} `;
  }

  const trimmed = phrase.trim();
  if (trimmed.length === 0) return trimmed;
  return trimmed[0].toUpperCase() + trimmed.substring(1);
};
