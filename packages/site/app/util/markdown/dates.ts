const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30.436875 * DAY;
const YEAR = 12 * MONTH;

export function getRelativeDateFormat(date: Date) {
  const now = new Date();
  const timeline = date.getTime() > now.getTime() ? "future" : "past";
  const diff = Math.abs(date.getTime() - now.getTime());

  if (diff < MINUTE) {
    return [`seconds_${timeline}` as const, Math.round(diff / SECOND)] as const;
  }
  if (diff < HOUR) {
    return [`minutes_${timeline}` as const, Math.round(diff / MINUTE)] as const;
  }
  if (diff < HOUR * 21.5) {
    return [`hours_${timeline}` as const, Math.round(diff / HOUR)] as const;
  }
  if (diff < DAY * 25.5) {
    return [`days_${timeline}` as const, Math.round(diff / DAY)] as const;
  }
  if (diff < MONTH * 10.5) {
    return [`months_${timeline}` as const, Math.round(diff / MONTH)] as const;
  }
  return [`years_${timeline}` as const, Math.round(diff / YEAR)] as const;
}

export function getDisplayDateFormat(date: Date) {
  const given = new Date(date).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);

  const difference = (given - now) / DAY;

  if (difference === -1) return "yesterday" as const;
  if (difference === 0) return "today" as const;
  if (difference === 1) return "tomorrow" as const;
  return "other" as const;
}
