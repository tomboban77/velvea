/**
 * Velvea operates out of Mississauga; every delivery date the customer picks is
 * a *Toronto* calendar day. Parsing "2026-09-14" with `new Date()` yields UTC
 * midnight, which renders as the 13th locally — so all conversions go through
 * the America/Toronto zone explicitly.
 */

export const STORE_TIMEZONE = "America/Toronto";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** The UTC offset (in minutes) that America/Toronto has at a given instant. */
function torontoOffsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second")
  );
  return (asUtc - at.getTime()) / 60000;
}

/** Turn "YYYY-MM-DD" into the instant of local noon in Toronto on that day. */
export function parseStoreDate(ymd: string): Date | null {
  if (!YMD.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  // Noon keeps the date stable on either side of a DST shift.
  const guess = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const offset = torontoOffsetMinutes(guess);
  const exact = new Date(guess.getTime() - offset * 60000);
  // Reject rollovers like 2026-02-30.
  return storeYmd(exact) === ymd ? exact : null;
}

/** Format an instant as the "YYYY-MM-DD" Toronto calendar day it falls on. */
export function storeYmd(at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Minutes past midnight, Toronto time, right now. */
export function storeMinutesOfDay(at: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIMEZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return (get("hour") % 24) * 60 + get("minute");
}

/** Parse a "HH:MM" cutoff into minutes past midnight. */
export function cutoffMinutes(cutoff: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(cutoff.trim());
  if (!m) return 16 * 60;
  return Math.min(23, Number(m[1])) * 60 + Math.min(59, Number(m[2]));
}

/** Add whole days to a Toronto calendar day, returning "YYYY-MM-DD". */
export function addStoreDays(ymd: string, days: number): string {
  const base = parseStoreDate(ymd);
  if (!base) return ymd;
  return storeYmd(new Date(base.getTime() + days * 86400000));
}

/** Render a stored delivery date as the Toronto day it was chosen for. */
export function formatStoreDate(date: Date | string, locale = "en-CA"): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: STORE_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
