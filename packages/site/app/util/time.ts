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

export const timeDiff = (
  earlier: Date,
  later: Date,
  short: boolean = false,
) => {
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

export const relativeTime = (date: Date, short: boolean = false): string => {
  const { text, future } = timeDiff(date, new Date(), short);
  return future ? `in ${text}` : `${text} ago`;
};
