// Borrowed and modified from https://react-select.com/advanced#experimental

import * as chrono from "chrono-node";
import moment, { Moment } from "moment";
import { useState } from "react";
import Select, {
  GroupProps,
  OptionProps,
  components as SelectComponents,
} from "react-select";
import { twJoin } from "tailwind-merge";
import { selectClassNames } from "./StringSelect";

export interface DateOption {
  date: Moment;
  value: Date;
  label: string;
  display?: string;
}

const createOptionForDate = (d: Moment | Date) => {
  const date = moment.isMoment(d) ? d : moment(d);
  return {
    date,
    value: date.toDate(),
    label: date.calendar(null, {
      sameDay: "MMM D, YYYY",
      nextDay: "MMM D, YYYY ([Tomorrow])",
      nextWeek: "MMM D, YYYY ([Next] dddd)",
      lastDay: "MMM D, YYYY ([Yesterday])",
      lastWeek: "MMM D, YYYY ([Last] dddd)",
      sameElse: "MMMM D, YYYY",
    }),
  };
};

interface CalendarGroup {
  label: string;
  options: readonly DateOption[];
}

const defaultOptions: (DateOption | CalendarGroup)[] = [
  "today",
  // "tomorrow",
  // "yesterday",
  // biome-ignore lint/style/noNonNullAssertion: Using constant values that we're sure will work
].map((i) => createOptionForDate(chrono.parseDate(i)!));

const createCalendarOptions = (date = new Date()) => {
  const daysInMonth = Array.apply(null, Array(moment(date).daysInMonth())).map(
    (x, i) => {
      const d = moment(date).date(i + 1);
      return { ...createOptionForDate(d), display: "calendar" };
    },
  );
  return {
    label: moment(date).format("MMMM YYYY"),
    options: daysInMonth,
  };
};

defaultOptions.push(createCalendarOptions());

const suggestions = [
  "sunday",
  "saturday",
  "friday",
  "thursday",
  "wednesday",
  "tuesday",
  "monday",
  "december",
  "november",
  "october",
  "september",
  "august",
  "july",
  "june",
  "may",
  "april",
  "march",
  "february",
  "january",
  "yesterday",
  "tomorrow",
  "today",
].reduce<{ [key: string]: string }>((acc, str) => {
  for (let i = 1; i < str.length; i++) {
    acc[str.substr(0, i)] = str;
  }
  return acc;
}, {});

const suggest = (str: string) =>
  str
    .split(/\b/)
    .map((i) => suggestions[i] || i)
    .join("");

const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const Group = (props: GroupProps<DateOption, false>) => {
  const {
    Heading,
    getStyles,
    getClassNames,
    children,
    label,
    headingProps,
    cx,
    theme,
    selectProps,
  } = props;

  const first = props.data.options[0];
  const last = props.data.options[props.data.options.length - 1];
  const preDays = [];
  const afterDays = [];
  if (first.display === "calendar") {
    const daysBefore = first.date.day();
    for (const i of Array(daysBefore)
      .fill(undefined)
      .map((_, i) => i)) {
      preDays.push(first.date.clone().date(i - i * 2));
    }
    preDays.reverse();

    const daysAfter = 6 - last.date.day();
    for (const i of Array(daysAfter)
      .fill(undefined)
      .map((_, i) => i)) {
      afterDays.push(last.date.clone().date(i + 1));
    }
  }
  return (
    <div aria-label={label as string}>
      <Heading
        selectProps={selectProps}
        theme={theme}
        getStyles={getStyles}
        getClassNames={getClassNames}
        cx={cx}
        {...headingProps}
      >
        {label}
      </Heading>
      <div className="mt-1 pt-1 mx-4 grid grid-cols-7 border-t border-t-[#E3E5E8] dark:border-t-[#27292D] cursor-default text-[75%] font-medium text-gray-500">
        {days.map((day) => (
          <span key={day} className="inline-block text-center">
            {day}
          </span>
        ))}
      </div>
      <div className="mx-4">
        <div className="w-full grid grid-cols-7 gap-px rounded border border-[#E3E5E8] dark:border-[#1E1F22] bg-[#E3E5E8] dark:bg-[#1E1F22]">
          {preDays.map((m) => (
            // @ts-expect-error
            // We don't care about these being "real" options
            <Option
              key={`date-option-${m.unix()}`}
              label=""
              data={{
                date: m,
                label: "",
                display: "calendar",
                value: m.toDate(),
              }}
              isDisabled
            />
          ))}
          {children}
          {afterDays.map((m) => (
            // @ts-expect-error
            // See above
            <Option
              key={`date-option-${m.unix()}`}
              label=""
              data={{
                date: m,
                label: "",
                display: "calendar",
                value: m.toDate(),
              }}
              isDisabled
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Option = (props: OptionProps<DateOption, false>) => {
  const { data, innerRef, innerProps } = props;
  if (data.display === "calendar") {
    const weekOfMonth = Math.ceil(data.date.date() / 7);
    const day = data.date.day();
    return (
      <div
        {...innerProps}
        className={twJoin(
          "flex relative aspect-square first:rounded-tl last:rounded-br",
          props.isDisabled
            ? "bg-[#F2F2F2] dark:bg-[#25272A] text-gray-500"
            : "bg-white dark:bg-[#313338] hover:bg-blurple hover:text-white cursor-pointer",
          props.isSelected ? "font-semibold" : "",
          // day === 0 && weekOfMonth === 0
          //   ? "rounded-tl"
          //   : day === 6 && weekOfMonth === 0
          //     ? "rounded-tr"
          //     : day === 0 && weekOfMonth === 4
          //       ? "rounded-bl"
          //       : day === 6 && weekOfMonth === 4
          //         ? "rounded-br"
          //         : "",
        )}
        ref={innerRef}
      >
        <span className="m-auto">{data.date.format("D")}</span>
        {props.isSelected && (
          <div className="absolute left-0 bottom-0 h-0.5 w-full bg-blurple" />
        )}
      </div>
    );
  } else return <SelectComponents.Option {...props} />;
};

interface DatePickerProps {
  readonly label: string;
  readonly name?: string;
  readonly required?: boolean;
  readonly range?: string[];
  readonly value: DateOption | null;
  readonly onChange: (newValue: DateOption | null) => void;
  readonly isDisabled?: boolean;
}

export const generateDateRange = (start: Date, end: Date): string[] => {
  const oneDay = 24 * 60 * 60 * 1000;
  const days: string[] = [];
  let i = 0;
  while (true) {
    const ts = start.getTime() + oneDay * i;
    if (ts > end.getTime()) break;
    days.push(new Date(ts).toISOString().split("T")[0]);
    i += 1;
  }
  return days;
};

const DatePicker = (props: DatePickerProps) => {
  const [options, setOptions] = useState(defaultOptions);

  const handleInputChange = (value: string) => {
    if (!value) {
      setOptions(defaultOptions);
      return;
    }
    const date = chrono.parseDate(suggest(value.toLowerCase()));
    if (!date) {
      setOptions([]);
      return;
    }
    setOptions([createOptionForDate(date), createCalendarOptions(date)]);
  };

  return (
    <label className="block">
      <p className="text-sm font-medium flex">{props.label}</p>
      <Select<DateOption, false>
        {...props}
        components={{ Group, Option }}
        filterOption={null}
        isMulti={false}
        isOptionSelected={(o, v) => v.some((i) => i.date.isSame(o.date, "day"))}
        isOptionDisabled={(o) =>
          props.range
            ? !props.range.includes(o.date.toISOString().split("T")[0])
            : false
        }
        maxMenuHeight={380}
        onChange={props.onChange}
        onInputChange={handleInputChange}
        options={options}
        value={props.value}
        // @ts-expect-error
        classNames={selectClassNames}
      />
    </label>
  );
};

export default (
  props: Omit<DatePickerProps, "onChange" | "value"> & {
    onChange?: DatePickerProps["onChange"];
  },
) => {
  const [value, setValue] = useState<DateOption | null>(
    defaultOptions[0] as DateOption,
  );

  return (
    <DatePicker
      {...props}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        if (props.onChange) props.onChange(newValue);
      }}
    />
  );
};
