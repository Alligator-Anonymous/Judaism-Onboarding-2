// Codex change: Lazy-load Tanakh book packs and parsha ranges with helper utilities.
import type {
  PackedTanakhBook,
  ParshaRangeEntry,
  ParshaAliyahRange,
  ParshaSpan
} from "@/types";

export type TanakhTranslationId = "he-masoretic" | "ar-onqelos";

type BookModule = { default: PackedTanakhBook };
type BookImporter = () => Promise<BookModule>;

type TranslationCache = Map<string, PackedTanakhBook>;

type TranslationLookup = Map<string, BookImporter>;

const hebrewModules = import.meta.glob<BookModule>(
  "../data/packs/tanakh/he-masoretic/books/*.json"
);
const onqelosModules = import.meta.glob<BookModule>(
  "../data/packs/tanakh/ar-onqelos/books/*.json"
);

function buildLookup(modules: Record<string, BookImporter>): TranslationLookup {
  const lookup: TranslationLookup = new Map();
  for (const [key, importer] of Object.entries(modules)) {
    const match = key.match(/\/([^/]+)\.json$/);
    if (match) {
      lookup.set(match[1], importer as BookImporter);
    }
  }
  return lookup;
}

const translationLookups: Record<TanakhTranslationId, TranslationLookup> = {
  "he-masoretic": buildLookup(hebrewModules),
  "ar-onqelos": buildLookup(onqelosModules)
};

const translationCaches: Record<TanakhTranslationId, TranslationCache> = {
  "he-masoretic": new Map(),
  "ar-onqelos": new Map()
};

export async function loadBook(
  bookId: string,
  translationId: TanakhTranslationId
): Promise<PackedTanakhBook | null> {
  const lookup = translationLookups[translationId];
  if (!lookup.has(bookId)) {
    return null;
  }
  const cache = translationCaches[translationId];
  if (cache.has(bookId)) {
    return cache.get(bookId) ?? null;
  }
  const importer = lookup.get(bookId);
  if (!importer) {
    return null;
  }
  const module = await importer();
  cache.set(bookId, module.default);
  return module.default;
}

export function hasTranslation(bookId: string, translationId: TanakhTranslationId): boolean {
  return translationLookups[translationId].has(bookId);
}

export function getChapterCountFromBook(book: PackedTanakhBook | null | undefined): number {
  return book?.meta?.chapters ?? 0;
}

export function getVerseCountFromBook(
  book: PackedTanakhBook | null | undefined,
  chapterNumber: number
): number {
  if (!book) return 0;
  const verses = book.chapters?.[String(chapterNumber)];
  return Array.isArray(verses) ? verses.length : 0;
}

let parshaRangesPromise: Promise<ParshaRangeEntry[]> | null = null;

export async function loadParshaRanges(): Promise<ParshaRangeEntry[]> {
  if (!parshaRangesPromise) {
    parshaRangesPromise = import("../data/metadata/parsha.ranges.json")
      .then((module) => module.default as ParshaRangeEntry[])
      .catch(() => []);
  }
  return parshaRangesPromise;
}

export interface ParshaReadingToken {
  bookId: string;
  c: number;
  v: number;
  text: string;
}

export interface ParshaReading {
  tokens: ParshaReadingToken[];
  aliyot: ParshaAliyahRange[];
  spans: ParshaSpan[];
}

interface ComposeParshaOptions {
  translationId?: TanakhTranslationId;
}

export async function composeParshaReading(
  parsha: ParshaRangeEntry,
  options: ComposeParshaOptions = {}
): Promise<ParshaReading> {
  const translationId = options.translationId ?? "he-masoretic";
  const book = await loadBook(parsha.bookId, translationId);
  if (!book) {
    return { tokens: [], aliyot: parsha.aliyot ?? [], spans: parsha.spans };
  }
  const tokens: ParshaReadingToken[] = [];
  for (const span of parsha.spans) {
    for (let chapter = span.from.c; chapter <= span.to.c; chapter += 1) {
      const verses = book.chapters[String(chapter)] ?? [];
      const startVerse = chapter === span.from.c ? span.from.v : 1;
      const endVerse = chapter === span.to.c ? span.to.v : verses.length;
      for (let verse = startVerse; verse <= endVerse; verse += 1) {
        const text = verses[verse - 1] ?? "";
        tokens.push({
          bookId: parsha.bookId,
          c: chapter,
          v: verse,
          text
        });
      }
    }
  }
  return {
    tokens,
    aliyot: parsha.aliyot ?? [],
    spans: parsha.spans
  };
}
