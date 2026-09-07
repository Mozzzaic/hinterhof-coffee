import { site } from "./site";

function formatHour(hour: number) {
  return `${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}`;
}

function isHoliday(month: number, day: number) {
  return (month === 1 && day === 1) || (month === 12 && day >= 24 && day <= 26);
}

/** Uses calendar parts in Berlin, independent of the visitor's timezone. */
export function computeOpenStatus(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (part: string) =>
    Number(parts.find((item) => item.type === part)?.value);
  const calendar = new Date(
    Date.UTC(value("year"), value("month") - 1, value("day")),
  );
  const now = value("hour") + value("minute") / 60;
  const [open, close] = site.weeklyHours[calendar.getUTCDay()];
  if (!isHoliday(value("month"), value("day")) && now >= open && now < close) {
    return `Open now — until ${formatHour(close)} Berlin time`;
  }
  for (let offset = 0; offset < 8; offset++) {
    const next = new Date(calendar);
    next.setUTCDate(next.getUTCDate() + offset);
    if (isHoliday(next.getUTCMonth() + 1, next.getUTCDate())) continue;
    const [opensAt] = site.weeklyHours[next.getUTCDay()];
    if (offset === 0 && now >= opensAt) continue;
    const when =
      offset === 0
        ? "today"
        : offset === 1
          ? "tomorrow"
          : new Intl.DateTimeFormat("en-GB", {
              weekday: "long",
              timeZone: "UTC",
            }).format(next);
    return `Closed — opens ${when} at ${formatHour(opensAt)}`;
  }
  return "See opening hours below";
}
