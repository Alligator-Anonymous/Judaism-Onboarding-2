import { differenceInCalendarDays, format } from "date-fns";
import { HebrewCalendar, HDate, Sedra } from "@hebcal/core";
import parshaRangesData from "@data/metadata/parsha.ranges.json";
import tanakhIndexData from "@data/metadata/tanakh.index.json";
import type { ParshaRangeEntry } from "@/types";

export type ParshaCycle = "diaspora" | "israel";

export interface HebrewDateParts {
  year: number;
  monthName: string;
  day: number;
}

export interface ParshaOptions {
  cycle?: ParshaCycle;
}

export interface ParshaSummary {
  label: string;
  shortName: string;
  slug: string | null;
  reading: string | null;
}

interface TanakhIndexBookEntry {
  id: string;
  en: string;
}

interface TanakhIndexSection {
  books?: TanakhIndexBookEntry[];
}

interface TanakhIndexData {
  sections?: TanakhIndexSection[];
}

const tanakhIndex = tanakhIndexData as TanakhIndexData;
const parshaRanges = parshaRangesData as ParshaRangeEntry[];

const BOOK_NAME_MAP = new Map<string, string>();
const PARSHA_RANGE_MAP = new Map<string, ParshaRangeEntry>();

if (tanakhIndex?.sections) {
  for (const section of tanakhIndex.sections) {
    if (!section?.books) continue;
    for (const book of section.books) {
      BOOK_NAME_MAP.set(book.id.toLowerCase(), book.en);
    }
  }
}

if (Array.isArray(parshaRanges)) {
  for (const entry of parshaRanges) {
    PARSHA_RANGE_MAP.set(normalizeParshaKey(entry.parsha), entry);
  }
}

const PARSHA_ALIASES = new Map<string, string>([
  ["beha'alotecha", "beha'alotcha"],
  ["behaalotecha", "beha'alotcha"],
  ["shelach", "sh'lach"],
  ["vayetzei", "vayetze"],
  ["kitetzei", "ki teitzei"],
  ["achareimot", "achrei mot"],
  ["netzavim", "nitzavim"],
  ["chukkat", "chukat"],
  ["vezothaberakhah", "v'zot haberachah"],
  ["vezothaberacha", "v'zot haberachah"],
  ["vezot haberakhah", "v'zot haberachah"],
  ["vezot haberacha", "v'zot haberachah"],
  ["haazinu", "ha'azinu"]
].map(([variant, canonical]) => [normalizeParshaKey(variant), normalizeParshaKey(canonical)]));

export function getHebrewDateParts(date: Date): HebrewDateParts {
  const hdate = new HDate(date);
  return {
    year: hdate.getFullYear(),
    monthName: hdate.getMonthName("en"),
    day: hdate.getDate()
  };
}

export function formatHebrewDate(parts: HebrewDateParts): string {
  return `${parts.day} ${parts.monthName} ${parts.year}`;
}

export function getParshaForUpcomingShabbat(
  date: Date,
  options: ParshaOptions = {}
): ParshaSummary | null {
  const shabbat = new Date(date);
  const diff = (6 - shabbat.getDay() + 7) % 7;
  if (diff !== 0) {
    shabbat.setDate(shabbat.getDate() + diff);
  }
  const inIsrael = options.cycle === "israel";
  const events = HebrewCalendar.calendar({
    start: shabbat,
    end: shabbat,
    sedra: true,
    diaspora: !inIsrael,
    israel: inIsrael
  }) as Array<{ getDesc: () => string } | undefined>;

  let label: string | null = null;
  let shortName: string | null = null;

  for (const event of events) {
    if (!event) continue;
    const description = event.getDesc();
    if (description && description.startsWith("Parashat")) {
      label = description;
      shortName = description.replace(/^Parashat\s+/i, "").trim();
      break;
    }
  }

  const hdate = new HDate(shabbat);
  const sedra = new Sedra(hdate.getFullYear(), inIsrael);
  if (!shortName) {
    const fallback = sedra.getString(hdate);
    if (fallback) {
      shortName = fallback.trim();
      label = `Parashat ${fallback.trim()}`;
    }
  }

  if (!label || !shortName) {
    return null;
  }

  const parshaNames = extractParshaNames(shortName);
  const readings: string[] = [];
  const slugs: string[] = [];

  for (const name of parshaNames) {
    const entry = lookupParshaRange(name);
    if (!entry) continue;
    const summary = formatParshaReading(entry);
    if (summary) {
      readings.push(summary);
    }
    if (entry.slug) {
      slugs.push(entry.slug);
    }
  }

  return {
    label,
    shortName,
    slug: slugs.length > 0 ? slugs[0] : null,
    reading: readings.length > 0 ? readings.join("; ") : null
  };
}

export function formatFriendlyGregorian(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}

export function getUpcomingHoliday(
  date: Date,
  holidays: { id: string; names: { en: string }; dates?: string[] }[]
): { id: string; name: string; daysAway: number } | null {
  let closest: { id: string; name: string; daysAway: number } | null = null;
  holidays.forEach((holiday) => {
    if (!holiday.dates) return;
    holiday.dates.forEach((iso) => {
      const holidayDate = new Date(iso);
      const diff = differenceInCalendarDays(holidayDate, date);
      if (diff >= 0 && (closest === null || diff < closest.daysAway)) {
        closest = { id: holiday.id, name: holiday.names.en, daysAway: diff };
      }
    });
  });
  return closest;
}

export function isErevShabbat(date: Date): boolean {
  return date.getDay() === 5;
}

function normalizeParshaKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function lookupParshaRange(name: string): ParshaRangeEntry | null {
  const normalized = normalizeParshaKey(name);
  const canonicalKey = PARSHA_ALIASES.get(normalized) ?? normalized;
  const entry = PARSHA_RANGE_MAP.get(canonicalKey) ?? PARSHA_RANGE_MAP.get(normalized);
  if (entry) {
    return entry;
  }
  for (const [key, candidate] of PARSHA_RANGE_MAP.entries()) {
    if (key === canonicalKey || key === normalized) continue;
    if (key.startsWith(canonicalKey) || canonicalKey.startsWith(key)) {
      return candidate;
    }
  }
  return null;
}

interface ParsedRef {
  bookId: string;
  chapter: number;
  verse: number;
}

function parseAliyahRef(ref: string): ParsedRef | null {
  const match = ref.match(/^([a-z0-9'\-]+)\s+(\d+):(\d+)$/i);
  if (!match) return null;
  return {
    bookId: match[1].toLowerCase(),
    chapter: Number.parseInt(match[2], 10),
    verse: Number.parseInt(match[3], 10)
  };
}

function formatParshaReading(entry: ParshaRangeEntry): string | null {
  if (!entry.aliyot?.length) return null;
  const first = entry.aliyot[0];
  const last = entry.aliyot[entry.aliyot.length - 1];
  const start = parseAliyahRef(first.start);
  const end = parseAliyahRef(last.end);
  if (!start || !end) return null;
  const startBook = BOOK_NAME_MAP.get(start.bookId) ?? capitalize(start.bookId);
  const endBook = BOOK_NAME_MAP.get(end.bookId) ?? capitalize(end.bookId);

  if (start.bookId === end.bookId) {
    if (start.chapter === end.chapter) {
      return `${startBook} ${start.chapter}:${start.verse}–${end.verse}`;
    }
    return `${startBook} ${start.chapter}:${start.verse}–${end.chapter}:${end.verse}`;
  }

  return `${startBook} ${start.chapter}:${start.verse} – ${endBook} ${end.chapter}:${end.verse}`;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function extractParshaNames(name: string): string[] {
  const normalized = name.replace(/[\u2013\u2014]/g, "-");
  return normalized
    .split(/\s*-\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
