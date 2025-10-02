// Updated Tanakh loader capable of reading canonical packs for Hebrew, English, and Onqelos.
import type {
  EnglishPackBook,
  HebrewPackBook,
  OnqelosPackBook,
  ParshaRangeEntry
} from "@/types";

export type TanakhTranslationId = "he-taamei" | "en-jps1917" | "ar-onqelos";

type BookModule<T> = { default: T };
type BookImporter<T> = () => Promise<BookModule<T>>;

const hebrewModules = import.meta.glob<BookModule<HebrewPackBook>>(
  "../data/packs/tanakh/he-taamei/books/*.json"
);
const englishModules = import.meta.glob<BookModule<EnglishPackBook>>(
  "../data/packs/tanakh/en/books/*.json"
);
const onqelosModules = import.meta.glob<BookModule<OnqelosPackBook>>(
  "../data/packs/tanakh/ar-onqelos/books/*.json"
);

function buildLookup<T>(modules: Record<string, BookImporter<T>>): Map<string, BookImporter<T>> {
  const lookup = new Map<string, BookImporter<T>>();
  for (const [key, importer] of Object.entries(modules)) {
    const match = key.match(/\/([^/]+)\.json$/);
    if (match) {
      lookup.set(match[1], importer);
    }
  }
  return lookup;
}

const hebrewLookup = buildLookup(hebrewModules);
const englishLookup = buildLookup(englishModules);
const onqelosLookup = buildLookup(onqelosModules);

const hebrewCache = new Map<string, HebrewPackBook>();
const englishCache = new Map<string, EnglishPackBook>();
const onqelosCache = new Map<string, OnqelosPackBook>();

async function loadFromLookup<T>(
  bookId: string,
  lookup: Map<string, BookImporter<T>>,
  cache: Map<string, T>
): Promise<T | null> {
  if (!lookup.has(bookId)) {
    return null;
  }
  if (cache.has(bookId)) {
    return cache.get(bookId) ?? null;
  }
  const importer = lookup.get(bookId);
  if (!importer) {
    return null;
  }
  const module = await importer();
  const payload = module.default;
  cache.set(bookId, payload);
  return payload;
}

export interface LoadedVerse {
  n: number;
  ref: string;
  primary: string | null;
  secondary?: string | null;
}

export interface LoadedChapter {
  chapter: number;
  verses: LoadedVerse[];
}

export interface LoadedTanakhBook {
  bookId: string;
  bookTitle: string;
  translationId: TanakhTranslationId;
  direction: "rtl" | "ltr";
  chapters: LoadedChapter[];
}

function mapHebrewBook(book: HebrewPackBook): LoadedTanakhBook {
  return {
    bookId: book.bookId,
    bookTitle: book.bookTitle,
    translationId: "he-taamei",
    direction: "rtl",
    chapters: book.chapters.map((chapter) => ({
      chapter: chapter.chapter,
      verses: chapter.verses.map((verse) => ({
        n: verse.n,
        ref: verse.ref,
        primary: verse.he ?? ""
      }))
    }))
  };
}

function mapEnglishBook(book: EnglishPackBook): LoadedTanakhBook {
  return {
    bookId: book.bookId,
    bookTitle: book.bookTitle,
    translationId: "en-jps1917",
    direction: "ltr",
    chapters: book.chapters.map((chapter) => ({
      chapter: chapter.chapter,
      verses: chapter.verses.map((verse) => ({
        n: verse.n,
        ref: verse.ref,
        primary: verse.en ?? null
      }))
    }))
  };
}

function mapOnqelosBook(book: OnqelosPackBook): LoadedTanakhBook {
  return {
    bookId: book.bookId,
    bookTitle: book.bookTitle,
    translationId: "ar-onqelos",
    direction: "rtl",
    chapters: book.chapters.map((chapter) => ({
      chapter: chapter.chapter,
      verses: chapter.verses.map((verse) => ({
        n: verse.n,
        ref: verse.ref,
        primary: verse.ar_he ?? null,
        secondary: verse.ar_en ?? null
      }))
    }))
  };
}

export async function loadBook(
  bookId: string,
  translationId: TanakhTranslationId
): Promise<LoadedTanakhBook | null> {
  if (translationId === "he-taamei") {
    const book = await loadFromLookup(bookId, hebrewLookup, hebrewCache);
    return book ? mapHebrewBook(book) : null;
  }
  if (translationId === "ar-onqelos") {
    const book = await loadFromLookup(bookId, onqelosLookup, onqelosCache);
    return book ? mapOnqelosBook(book) : null;
  }
  if (translationId === "en-jps1917") {
    const englishBook = await loadFromLookup(bookId, englishLookup, englishCache);
    return englishBook ? mapEnglishBook(englishBook) : null;
  }
  return null;
}

export function hasTranslation(bookId: string, translationId: TanakhTranslationId): boolean {
  switch (translationId) {
    case "he-taamei":
      return hebrewLookup.has(bookId);
    case "en-jps1917":
      return englishLookup.has(bookId);
    case "ar-onqelos":
      return onqelosLookup.has(bookId);
    default:
      return false;
  }
}

export function getChapterCountFromBook(book: LoadedTanakhBook | null | undefined): number {
  return book?.chapters.length ?? 0;
}

export function getVerseCountFromBook(
  book: LoadedTanakhBook | null | undefined,
  chapterNumber: number
): number {
  if (!book) return 0;
  const chapter = book.chapters.find((entry) => entry.chapter === chapterNumber);
  return chapter ? chapter.verses.length : 0;
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
  primary: string | null;
  secondary?: string | null;
}

export interface ParshaReadingAliyah {
  n: number;
  start: { c: number; v: number };
  end: { c: number; v: number };
}

export interface ParshaReading {
  tokens: ParshaReadingToken[];
  aliyot: ParshaReadingAliyah[];
  direction: "rtl" | "ltr";
}

interface ComposeParshaOptions {
  translationId?: TanakhTranslationId;
}

interface ParsedRef {
  bookId: string;
  chapter: number;
  verse: number;
}

function parseReference(ref: string): ParsedRef | null {
  const match = ref.match(/^([a-z0-9-]+)\s+(\d+):(\d+)$/i);
  if (!match) return null;
  return {
    bookId: match[1].toLowerCase(),
    chapter: Number(match[2]),
    verse: Number(match[3])
  };
}

function advanceVerse(book: LoadedTanakhBook, chapter: number, verse: number): { chapter: number; verse: number } | null {
  const chapterEntry = book.chapters.find((entry) => entry.chapter === chapter);
  if (!chapterEntry) return null;
  if (verse < chapterEntry.verses.length) {
    return { chapter, verse: verse + 1 };
  }
  const chapterIndex = book.chapters.findIndex((entry) => entry.chapter === chapter);
  const nextChapter = book.chapters[chapterIndex + 1];
  if (!nextChapter) return null;
  return { chapter: nextChapter.chapter, verse: 1 };
}

export async function composeParshaReading(
  parsha: ParshaRangeEntry,
  options: ComposeParshaOptions = {}
): Promise<ParshaReading> {
  const translationId = options.translationId ?? "he-taamei";
  const book = await loadBook(parsha.book, translationId);
  if (!book) {
    return { tokens: [], aliyot: [], direction: "rtl" };
  }

  const seen = new Set<string>();
  const tokens: ParshaReadingToken[] = [];
  const aliyot: ParshaReadingAliyah[] = [];

  for (const aliyah of parsha.aliyot) {
    const startRef = parseReference(aliyah.start);
    const endRef = parseReference(aliyah.end);
    if (!startRef || !endRef) continue;
    if (startRef.bookId !== book.bookId || endRef.bookId !== book.bookId) continue;

    const aliyahEntry: ParshaReadingAliyah = {
      n: aliyah.n,
      start: { c: startRef.chapter, v: startRef.verse },
      end: { c: endRef.chapter, v: endRef.verse }
    };
    aliyot.push(aliyahEntry);

    let currentChapter = startRef.chapter;
    let currentVerse = startRef.verse;

    while (true) {
      const chapterEntry = book.chapters.find((entry) => entry.chapter === currentChapter);
      const verseEntry = chapterEntry?.verses.find((entry) => entry.n === currentVerse);
      const key = `${currentChapter}:${currentVerse}`;
      if (verseEntry && !seen.has(key)) {
        seen.add(key);
        tokens.push({
          bookId: book.bookId,
          c: currentChapter,
          v: currentVerse,
          primary: verseEntry.primary,
          secondary: verseEntry.secondary
        });
      }
      if (currentChapter === endRef.chapter && currentVerse === endRef.verse) {
        break;
      }
      const next = advanceVerse(book, currentChapter, currentVerse);
      if (!next) {
        break;
      }
      currentChapter = next.chapter;
      currentVerse = next.verse;
    }
  }

  return {
    tokens,
    aliyot,
    direction: book.direction
  };
}
