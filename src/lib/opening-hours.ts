import { site } from "./site";

function formatHour(hour: number) {
  return `${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}`;
}

function isHoliday(month: number, day: number) {
  return (month === 1 && day === 1) || (month === 12 && day >= 24 && day <= 26);
}

export type OpenState =
  | { open: true; closes: string }
  | { open: false; opensWhen: string; opensAt: string }
  | { open: false; opensWhen: null; opensAt: null };

/** Uses calendar parts in Berlin, independent of the visitor's timezone. */
export function computeOpenState(date = new Date()): OpenState {
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
    return { open: true, closes: formatHour(close) };
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
    return { open: false, opensWhen: when, opensAt: formatHour(opensAt) };
  }
  return { open: false, opensWhen: null, opensAt: null };
}

/** The full sentence, as the hero and the visit section print it. */
export function computeOpenStatus(date = new Date()): string {
  const state = computeOpenState(date);
  if (state.open) return `Open now — until ${state.closes} Berlin time`;
  if (state.opensWhen)
    return `Closed — opens ${state.opensWhen} at ${state.opensAt}`;
  return "See opening hours below";
}

/** The short form, for the header. */
export function computeOpenShort(date = new Date()): string {
  const state = computeOpenState(date);
  if (state.open) return `Open until ${state.closes}`;
  if (state.opensWhen === "today") return `Opens at ${state.opensAt}`;
  if (state.opensWhen === "tomorrow") return `Opens tomorrow ${state.opensAt}`;
  if (state.opensWhen) return `Opens ${state.opensWhen.slice(0, 3)} ${state.opensAt}`;
  return "Opening hours";
}

/** The shortest form, for the header on a phone: the next opening is implied. */
export function computeOpenTiny(date = new Date()): string {
  const state = computeOpenState(date);
  if (state.open) return `Open till ${state.closes}`;
  if (state.opensWhen === "today" || state.opensWhen === "tomorrow")
    return `Opens ${state.opensAt}`;
  if (state.opensWhen) return `Opens ${state.opensWhen.slice(0, 3)} ${state.opensAt}`;
  return "Hours";
}
