import type { StrategicPlan } from "./types";

export type AgendaEvent = {
  id: string;
  kind: "initiative" | "milestone" | "cadence";
  title: string;
  owner: string;
  description: string;
  start: string | null;
  end: string | null;
  originalPeriod: string;
  relative: boolean;
  linkedKr?: string;
  sourceIndex: number;
};

const DAY_MS = 86_400_000;

// Construct dates numerically: parsing a date string can change the civil day
// with the host's timezone. setUTCFullYear also avoids Date's 1900 offset.
function civilDate(year: number, month: number, day: number): Date | null {
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

/** Accept only full ISO dates or Brazilian DD/MM/YYYY dates, never rollovers. */
export function parseDay(value: string): string | null {
  const input = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  const brazilian = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
  if (!iso && !brazilian) return null;
  const year = Number(iso ? iso[1] : brazilian![3]);
  const month = Number(iso ? iso[2] : brazilian![2]);
  const day = Number(iso ? iso[3] : brazilian![1]);
  if (!civilDate(year, month, day)) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function requireDay(day: string): Date {
  const parsed = parseDay(day);
  if (!parsed || parsed !== day) throw new RangeError("Expected a valid canonical YYYY-MM-DD civil day.");
  const [year, month, date] = parsed.split("-").map(Number);
  return civilDate(year, month, date)!;
}

/** Return a canonical civil day. Invalid dates/offsets throw RangeError. */
export function addDays(day: string, count: number): string {
  const date = requireDay(day);
  if (!Number.isSafeInteger(count)) throw new RangeError("Day offset must be an integer.");
  date.setUTCDate(date.getUTCDate() + count);
  const year = date.getUTCFullYear();
  if (!Number.isFinite(date.getTime()) || year < 1 || year > 9999) throw new RangeError("Civil day is outside the supported year range.");
  return date.toISOString().slice(0, 10);
}

/** Monday containing this civil day. */
export function startOfWeek(day: string): string {
  const weekday = requireDay(day).getUTCDay();
  return addDays(day, -((weekday + 6) % 7));
}

/** Signed number of civil days from a to b. */
export function daysBetween(a: string, b: string): number {
  return (requireDay(b).getTime() - requireDay(a).getTime()) / DAY_MS;
}

/** Format a civil day in pt-BR; timezone stays UTC even if options include one. */
export function formatDay(day: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("pt-BR", { ...(options ?? { day: "2-digit", month: "2-digit", year: "numeric" }), timeZone: "UTC" }).format(requireDay(day));
}

type Period = { from: string; to: string; mode: "point" | "range" | "until"; relative: boolean };
type ParsedPeriod = { period: Period | null; relative: boolean };

function parsePeriod(value: string, anchor: string | null): ParsedPeriod {
  const input = value.trim();
  const absolute = parseDay(input);
  if (absolute) return { period: { from: absolute, to: absolute, mode: "point", relative: false }, relative: false };

  const normalized = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ");
  const point = /^dia\s*(\d+)$/.exec(normalized);
  const until = /^ate\s+(?:o\s+)?dia\s*(\d+)$/.exec(normalized);
  const first = /^primeiros\s+(\d+)\s+dias$/.exec(normalized);
  const range = /^dias\s*(\d+)\s*(?:[-–—]|a|ate)\s*(\d+)$/.exec(normalized);
  const relative = Boolean(point || until || first || range);
  if (relative) {
    const from = Number(range ? range[1] : point ? point[1] : 1);
    const to = Number(range ? range[2] : point ? point[1] : (until || first)![1]);
    if (!anchor || !Number.isSafeInteger(from) || !Number.isSafeInteger(to) || from < 1 || to < from) return { period: null, relative: true };
    try {
      return { period: { from: addDays(anchor, from - 1), to: addDays(anchor, to - 1), mode: point ? "point" : until ? "until" : "range", relative: true }, relative: true };
    } catch {
      return { period: null, relative: true };
    }
  }

  // Require complete dates on both sides and an explicit range separator.
  const absoluteRange = /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\s*(?:\s+a\s+|\s+at[eé]\s+|[–—→]|\s+-\s+)\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/.exec(input);
  if (absoluteRange) {
    const from = parseDay(absoluteRange[1]);
    const to = parseDay(absoluteRange[2]);
    if (from && to && from <= to) return { period: { from, to, mode: "range", relative: false }, relative: false };
  }
  return { period: null, relative: false };
}

function initiativeDates(start: string, end: string, anchor: string | null): Pick<AgendaEvent, "start" | "end" | "relative"> {
  const left = parsePeriod(start, anchor);
  const right = parsePeriod(end, anchor);
  const relative = left.relative || right.relative;
  const unscheduled = { start: null, end: null, relative };
  // Only an empty side counts as missing. An invalid expression is not silently
  // discarded. A single supplied date is a point event, not an inferred span.
  if (start.trim() && !left.period || end.trim() && !right.period) return unscheduled;
  if (!left.period && !right.period) return unscheduled;
  if (!left.period || !right.period) {
    const period = (left.period || right.period)!;
    return { start: period.from, end: period.to, relative };
  }
  const from = left.period.from;
  const to = right.period.to;
  // Two fields cannot contradict an explicitly stated range. An "até" end
  // supplies the deadline when paired with a start; alone it means days 1…N.
  if (from > to || left.period.mode !== "point" && left.period.to !== to || right.period.mode === "range" && right.period.from !== from) return unscheduled;
  return { start: from, end: to, relative };
}

/**
 * Project existing plan fields into an agenda without mutating them. Relative
 * days use the valid civil prefix of generatedAt (day 1), never today's date.
 * Cadences remain unscheduled: frequency does not establish a meeting date.
 */
export function buildAgenda(plan: StrategicPlan): { events: AgendaEvent[]; anchor: string | null } {
  const prefix = plan.meta.generatedAt.slice(0, 10);
  const anchor = /^\d{4}-\d{2}-\d{2}$/.test(prefix) ? parseDay(prefix) : null;
  const events: AgendaEvent[] = plan.initiatives.map((initiative, sourceIndex) => ({
    id: `initiative:${sourceIndex}:${initiative.id}`,
    kind: "initiative",
    title: initiative.title,
    owner: initiative.owner,
    description: [initiative.why, initiative.how].filter(Boolean).join("\n"),
    ...initiativeDates(initiative.startDate, initiative.endDate, anchor),
    originalPeriod: [initiative.startDate, initiative.endDate].filter((value) => value.trim()).join(" → "),
    linkedKr: initiative.linkedKr,
    sourceIndex,
  }));
  plan.first90Days.forEach((milestone, sourceIndex) => {
    const parsed = parsePeriod(milestone.period, anchor);
    events.push({
      id: `milestone:${sourceIndex}`,
      kind: "milestone",
      title: milestone.deliverable,
      owner: milestone.owner,
      description: milestone.deliverable,
      start: parsed.period?.from ?? null,
      end: parsed.period?.to ?? null,
      originalPeriod: milestone.period,
      relative: parsed.relative,
      sourceIndex,
    });
  });
  plan.governance.cadences.forEach((cadence, sourceIndex) => events.push({
    id: `cadence:${sourceIndex}`,
    kind: "cadence",
    title: cadence.name,
    owner: "A definir",
    description: cadence.purpose,
    start: null,
    end: null,
    originalPeriod: cadence.frequency,
    relative: false,
    sourceIndex,
  }));
  return { events, anchor };
}
