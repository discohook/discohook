import { Form } from "@remix-run/react";
import {
  CronFields,
  DayOfTheMonthRange,
  DayOfTheWeekRange,
  HourRange,
  MonthRange,
  SixtyRange,
  fieldsToExpression,
  parseExpression,
} from "cron-parser";
import moment, { Moment } from "moment";
import { useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import DatePicker, { generateDateRange } from "~/components/DatePicker";
import { useError } from "~/components/Error";
import { StringSelect } from "~/components/StringSelect";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { LoadedBackup } from "~/routes/me";
import { useSafeFetcher } from "~/util/loader";
import {
  cronDaysOfMonth,
  cronDaysOfWeek,
  cronHours,
  cronMinutes,
  cronMonths,
  cronToEnglish,
  getTimezone,
} from "~/util/time";
import { action as ApiBackupsIdAction } from "../api/v1/backups.$id";
import { Modal, ModalProps } from "./Modal";

const Inner = ({ backup }: { backup: LoadedBackup }) => {
  const { t } = useTranslation();
  const [error, setError] = useError(t);
  const fetcher = useSafeFetcher<typeof ApiBackupsIdAction>({
    onError: (e) => setError({ message: e.message }),
  });

  const now = new Date();
  const [scheduled, setScheduled] = useState(backup.scheduled);
  const [repeating, setRepeating] = useState(!!backup.cron);
  const [scheduleDate, setScheduleDate] = useState<Moment | undefined>(
    backup.nextRunAt ? moment(backup.nextRunAt) : undefined,
  );

  const options = {
    daysOfWeek: cronDaysOfWeek.map((day) => ({
      // October 1st 2000 is a Sunday
      // This is a bit of a hack but it's easy and doesn't require Moment
      label: new Date(`2000-10-${day + 1}`).toLocaleDateString(undefined, {
        weekday: "long",
      }),
      value: day,
    })),
    daysOfMonth: cronDaysOfMonth.map((day) => ({
      label: String(day),
      value: day,
    })),
    months: cronMonths.map((month) => ({
      label: new Date(`2000-${month}-1`).toLocaleDateString(undefined, {
        month: "long",
      }),
      value: month,
    })),
    hours: cronHours.map((hour) => ({
      label: new Date(new Date().setHours(hour, 0, 0)).toLocaleTimeString(
        undefined,
        { hour: "numeric" },
      ),
      value: hour,
    })),
    minutes: cronMinutes.map((minute) => ({
      label: String(minute).padStart(2, "0"),
      value: minute,
    })),
  };

  const [cron, updateCron] = useReducer(
    (d: CronFields, partialD: Partial<CronFields>) =>
      ({ ...d, ...partialD }) as CronFields,
    backup.cron
      ? parseExpression(backup.cron, { tz: backup.timezone ?? undefined })
          .fields
      : ({
          dayOfWeek: cronDaysOfWeek,
          dayOfMonth: cronDaysOfMonth,
          month: cronMonths,
          hour: [0],
          minute: [0],
          second: [0],
        } satisfies CronFields),
  );

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();

        const data = Object.fromEntries(
          new FormData(e.currentTarget).entries(),
        ) as Record<string, string | null | undefined>;
        if (scheduled && repeating) {
          data.cron = fieldsToExpression(cron).stringify();
          data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } else if (scheduled) {
          const day = data.day?.toString();
          const time = data.time?.toString();
          if (day && time) {
            const [hours, minutes] = time.split(":").map(Number);
            const date = new Date(new Date(day).setHours(hours, minutes, 0, 0));
            data.cron = null;
            data.scheduleAt = date.toISOString();
          }
          data.day = undefined;
          data.time = undefined;
        } else {
          data.scheduleAt = null;
          data.cron = null;
        }
        fetcher.submit(data, {
          action: apiUrl(BRoutes.backups(backup.id)),
          method: "PATCH",
        });
      }}
    >
      {error}
      <div className="space-y-2">
        <p>
          <Trans
            t={t}
            i18nKey="editBackupMessages"
            components={[
              <CoolIcon icon="External_Link" className="align-sub" />,
            ]}
          />
        </p>
        <TextInput
          name="name"
          label={t("name")}
          defaultValue={backup.name}
          className="w-full"
          maxLength={100}
          required
        />
        <p className="font-medium text-sm mt-4">{t("scheduling")}</p>
        <Checkbox
          label={t("scheduleBackup")}
          checked={scheduled}
          onChange={(e) => setScheduled(e.currentTarget.checked)}
        />
        <Checkbox
          label={t("repeating")}
          checked={repeating}
          onChange={(e) => setRepeating(e.currentTarget.checked)}
          disabled={!scheduled}
        />
        <div
          className={twJoin(
            "flex flex-col gap-2 transition-opacity",
            scheduled ? "" : "opacity-50",
            repeating ? "" : "sm:grid grid-cols-2",
          )}
        >
          {repeating ? (
            <>
              <p className="font-medium text-sm">
                {t("repeatingSchedule", {
                  replace: { description: cronToEnglish(cron) },
                })}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <StringSelect
                  label={t("month")}
                  isMulti
                  required={scheduled}
                  isDisabled={!scheduled}
                  options={options.months}
                  value={
                    cron.month.length === cronMonths.length
                      ? [
                          {
                            label: t("everyMonth"),
                            value: "*",
                          },
                        ]
                      : options.months.filter((o) =>
                          cron.month.includes(o.value),
                        )
                  }
                  onChange={(v) => {
                    const opts = (
                      v as {
                        label: string;
                        value: MonthRange | "*";
                      }[]
                    ).filter((o) => o.value !== "*");
                    updateCron({
                      month:
                        opts.length === 0
                          ? cronMonths
                          : opts.map((opt) => opt.value as MonthRange),
                    });
                  }}
                />
                <StringSelect
                  label={t("dayOfMonth")}
                  isMulti
                  required={scheduled}
                  isDisabled={!scheduled}
                  options={options.daysOfMonth}
                  value={
                    cron.dayOfMonth.length === cronDaysOfMonth.length
                      ? [
                          {
                            label: t("everyDayOfMonth"),
                            value: "*",
                          },
                        ]
                      : options.daysOfMonth.filter((o) =>
                          cron.dayOfMonth.includes(o.value),
                        )
                  }
                  onChange={(v) => {
                    const opts = (
                      v as {
                        label: string;
                        value: DayOfTheMonthRange | "*";
                      }[]
                    ).filter((o) => o.value !== "*");
                    updateCron({
                      dayOfMonth:
                        opts.length === 0
                          ? cronDaysOfMonth
                          : opts.map((opt) => opt.value as DayOfTheMonthRange),
                    });
                  }}
                />
              </div>
              <StringSelect
                label={t("weekday")}
                isMulti
                required={scheduled}
                isDisabled={!scheduled}
                options={options.daysOfWeek}
                value={
                  // This is gte because cron-parser fills 0-7 (8 days) for
                  // `*`, but our `cronDaysOfWeek` uses 0-6 instead
                  cron.dayOfWeek.length >= cronDaysOfWeek.length
                    ? [
                        {
                          label: t("everyWeekday"),
                          value: "*",
                        },
                      ]
                    : options.daysOfWeek.filter((o) =>
                        cron.dayOfWeek.includes(o.value),
                      )
                }
                onChange={(v) => {
                  const opts = (
                    v as {
                      label: string;
                      value: DayOfTheWeekRange | "*";
                    }[]
                  ).filter((o) => o.value !== "*");
                  updateCron({
                    dayOfWeek:
                      opts.length === 0
                        ? cronDaysOfWeek
                        : opts.map((opt) => opt.value as DayOfTheWeekRange),
                  });
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <StringSelect
                  label={t("hourTime", {
                    replace: { timezone: getTimezone("longGeneric") },
                  })}
                  isMulti
                  required={scheduled}
                  isDisabled={!scheduled}
                  options={options.hours.map((opt) => ({
                    ...opt,
                    // Allow once every 2 hours
                    isDisabled:
                      // @ts-expect-error
                      // value gets cast to number, it doesn't matter
                      cron.hour.includes(opt.value + 1) ||
                      // @ts-expect-error
                      cron.hour.includes(opt.value - 1),
                  }))}
                  value={options.hours.filter((o) =>
                    cron.hour.includes(o.value),
                  )}
                  onChange={(v) => {
                    const opts = v as {
                      label: string;
                      value: HourRange;
                    }[];
                    updateCron({
                      hour: opts.map((opt) => opt.value as HourRange),
                    });
                  }}
                />
                <StringSelect
                  label={t("minute")}
                  required={scheduled}
                  isDisabled={!scheduled}
                  options={options.minutes}
                  value={options.minutes.filter((o) =>
                    cron.minute.includes(o.value),
                  )}
                  onChange={(v) => {
                    const opt = v as {
                      label: string;
                      value: SixtyRange;
                    };
                    updateCron({ minute: [opt.value] });
                  }}
                />
              </div>
              <p className="text-sm opacity-60">{t("scheduleFrequencyNote")}</p>
            </>
          ) : (
            <>
              <DatePicker
                label={t("day")}
                name="day"
                range={generateDateRange(
                  now,
                  new Date(new Date(now).setFullYear(now.getFullYear() + 2)),
                )}
                value={scheduleDate ?? null}
                onChange={(o) => {
                  if (o) {
                    const newDate = o.date.clone();
                    if (scheduleDate) {
                      // Preserve time since date picker will reset it
                      newDate.hour(scheduleDate.hour());
                      newDate.minute(scheduleDate.minute());
                      newDate.second(scheduleDate.second());
                    }
                    setScheduleDate(newDate);
                  }
                }}
                isDisabled={!scheduled || repeating}
                required={scheduled}
              />
              <TextInput
                type="time"
                name="time"
                label={t("time", {
                  replace: { timezone: getTimezone("longGeneric") },
                })}
                value={
                  scheduleDate
                    ? scheduleDate.toDate().toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : ""
                }
                onChange={(e) => {
                  if (scheduleDate) {
                    const [hour, minute] = e.currentTarget.value
                      .split(":")
                      .map(Number);
                    const newDate = scheduleDate.clone();
                    newDate.hour(hour);
                    newDate.minute(minute);
                    newDate.second(0);
                    setScheduleDate(newDate);
                  }
                }}
                min={
                  !scheduleDate ||
                  scheduleDate.toISOString().split("T")[0] ===
                    now.toISOString().split("T")[0]
                    ? now.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : ""
                }
                className="w-full"
                disabled={!scheduled || repeating || !scheduleDate}
                required={scheduled}
              />
            </>
          )}
        </div>
      </div>
      <div className="flex w-full mt-4">
        <Button
          type="submit"
          className="mx-auto"
          disabled={fetcher.state !== "idle"}
        >
          {t("save")}
        </Button>
      </div>
    </Form>
  );
};

export const BackupEditModal = (
  props: ModalProps & { backup?: LoadedBackup },
) => {
  const { t } = useTranslation();
  const { backup } = props;

  return (
    <Modal title={t("editBackupTitle")} {...props}>
      {backup && <Inner backup={backup} />}
    </Modal>
  );
};
