import type { ReportDateRange } from "@/lib/reports/types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ARGENTINA_OFFSET = "-03:00";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateString(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function normalizeDate(value: string | undefined, fallback: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return fallback;
  }

  return value;
}

function addDays(dateString: string, days: number) {
  const date = fromDateString(dateString);

  if (!date) {
    return dateString;
  }

  return toDateString(new Date(date.getTime() + days * DAY_IN_MS));
}

export function getDefaultReportDateRange(today = new Date()): ReportDateRange {
  const to = toDateString(today);
  const from = addDays(to, -6);

  return {
    from,
    to,
    fromIso: `${from}T00:00:00${ARGENTINA_OFFSET}`,
    toIsoExclusive: `${addDays(to, 1)}T00:00:00${ARGENTINA_OFFSET}`,
  };
}

export function createReportDateRange(
  rawFrom: string | undefined,
  rawTo: string | undefined,
) {
  const defaults = getDefaultReportDateRange();
  let from = normalizeDate(rawFrom, defaults.from);
  let to = normalizeDate(rawTo, defaults.to);

  if (from > to) {
    [from, to] = [to, from];
  }

  return {
    from,
    to,
    fromIso: `${from}T00:00:00${ARGENTINA_OFFSET}`,
    toIsoExclusive: `${addDays(to, 1)}T00:00:00${ARGENTINA_OFFSET}`,
  };
}

export function getTodayReportDateRange(today = new Date()) {
  const date = toDateString(today);

  return createReportDateRange(date, date);
}
