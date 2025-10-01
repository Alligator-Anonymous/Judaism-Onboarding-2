#!/usr/bin/env node
// Codex change: Download Tanakh and Onqelos text plus parsha aliyah metadata from Sefaria.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const TANAKH_INDEX_PATH = path.join(repoRoot, "app/renderer/data/metadata/tanakh.index.json");
const PARSHA_INDEX_PATH = path.join(repoRoot, "app/renderer/data/metadata/parshiyot.index.json");
const OUTPUT_HE_ROOT = path.join(repoRoot, "app/renderer/data/packs/tanakh/he-masoretic/books");
const OUTPUT_AR_ROOT = path.join(repoRoot, "app/renderer/data/packs/tanakh/ar-onqelos/books");
const PARSHA_RANGES_OUTPUT = path.join(repoRoot, "app/renderer/data/metadata/parsha.ranges.json");

const USER_AGENT = "JudaismOnboardingFetcher/1.0 (+https://example.org)";

const BOOK_ID_TO_SEFARIA = {
  genesis: "Genesis",
  exodus: "Exodus",
  leviticus: "Leviticus",
  numbers: "Numbers",
  deuteronomy: "Deuteronomy",
  "samuel-1": "I Samuel",
  "samuel-2": "II Samuel",
  "kings-1": "I Kings",
  "kings-2": "II Kings",
  "chronicles-1": "I Chronicles",
  "chronicles-2": "II Chronicles"
};

const ONQELOS_BOOK_TO_REF = {
  genesis: "Targum Onkelos on Genesis",
  exodus: "Targum Onkelos on Exodus",
  leviticus: "Targum Onkelos on Leviticus",
  numbers: "Targum Onkelos on Numbers",
  deuteronomy: "Targum Onkelos on Deuteronomy"
};

const TORAH_BOOK_IDS = new Set(["genesis", "exodus", "leviticus", "numbers", "deuteronomy"]);

function sefariaRefForBook(bookId, fallbackEn) {
  return BOOK_ID_TO_SEFARIA[bookId] ?? fallbackEn;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText} ${text}`);
  }
  return response.json();
}

function sanitizeVerse(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeChapters(heArray) {
  if (!Array.isArray(heArray)) return [];
  return heArray
    .map((chapter) => {
      if (!Array.isArray(chapter)) return [];
      return chapter.map((verse) => sanitizeVerse(verse));
    })
    .filter((chapter) => chapter.length > 0);
}

function computeVersesPerChapter(chapters) {
  return chapters.map((chapter) => chapter.length);
}

function formatBookPayload(bookId, heName, enName, chapters) {
  const chaptersObject = {};
  chapters.forEach((chapter, index) => {
    chaptersObject[String(index + 1)] = chapter;
  });
  return {
    bookId,
    he: heName,
    en: enName,
    chapters: chaptersObject,
    meta: {
      chapters: chapters.length,
      versesPerChapter: computeVersesPerChapter(chapters)
    }
  };
}

function parseRefSegment(ref) {
  const match = ref.match(/^(?<book>[\p{L} ]+?)\s+(?<chapter>\d+)(?::(?<verse>\d+))?$/u);
  if (!match || !match.groups) {
    throw new Error(`Unable to parse ref segment: ${ref}`);
  }
  return {
    book: match.groups.book.trim(),
    chapter: Number.parseInt(match.groups.chapter, 10),
    verse: match.groups.verse ? Number.parseInt(match.groups.verse, 10) : 1
  };
}

function parseSpan(refRange) {
  const [fromRef, toRef] = refRange.split("-").map((segment) => segment.trim());
  const from = parseRefSegment(fromRef);
  const to = parseRefSegment(toRef ?? fromRef);
  return { from, to };
}

function englishToBookId(english) {
  const normalized = english.replace(/\./g, "").trim();
  for (const [bookId, sefariaName] of Object.entries({ ...BOOK_ID_TO_SEFARIA })) {
    if (sefariaName === normalized) {
      return bookId;
    }
  }
  const fallback = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return fallback;
}

async function buildParshaRanges(parshaIndex) {
  const torahBooksMeta = JSON.parse(await fs.readFile(TANAKH_INDEX_PATH, "utf8"));
  const englishMap = new Map();
  for (const section of torahBooksMeta.sections) {
    for (const book of section.books) {
      englishMap.set(book.en, book.id);
    }
  }

  const bookAltStructCache = new Map();

  async function fetchBookAltStruct(bookId, enName) {
    if (bookAltStructCache.has(bookId)) return bookAltStructCache.get(bookId);
    const bookRef = sefariaRefForBook(bookId, enName);
    const json = await fetchJson(
      `https://www.sefaria.org/api/v2/raw/index/${encodeURIComponent(bookRef)}`
    );
    bookAltStructCache.set(bookId, json.alt_structs ?? {});
    return bookAltStructCache.get(bookId);
  }

  const parshaRanges = [];

  for (const entry of parshaIndex) {
    const bookId = entry.bookId;
    const bookEnglish = entry.en;
    const altStructs = await fetchBookAltStruct(bookId, bookEnglish);
    const parashaStruct = altStructs?.Parasha?.nodes ?? [];
    const node = parashaStruct.find((candidate) => {
      const titles = candidate.titles ?? {};
      return (
        candidate.key === entry.id ||
        titles?.en === entry.en ||
        titles?.he === entry.he ||
        titles?.he === entry.he.replace(/׳/g, "'")
      );
    });
    if (!node) {
      throw new Error(`Unable to locate parsha node for ${entry.id}`);
    }
    const span = parseSpan(node.wholeRef);
    if (englishToBookId(span.from.book) !== bookId || englishToBookId(span.to.book) !== bookId) {
      throw new Error(`Parsha ${entry.id} spans multiple books; please update metadata.`);
    }
    const aliyot = (node.nodes ?? []).map((aliyahNode, index) => {
      const aliyahRef = (aliyahNode.refs && aliyahNode.refs[0]) || aliyahNode.wholeRef;
      if (!aliyahRef) {
        throw new Error(`Missing aliyah ref for ${entry.id} aliyah ${index + 1}`);
      }
      const aliyahSpan = parseSpan(Array.isArray(aliyahRef) ? aliyahRef[0] : aliyahRef);
      return {
        n: index + 1,
        from: { c: aliyahSpan.from.chapter, v: aliyahSpan.from.verse },
        to: { c: aliyahSpan.to.chapter, v: aliyahSpan.to.verse }
      };
    });
    parshaRanges.push({
      id: entry.id,
      ordinal: entry.ordinal,
      bookId: entry.bookId,
      he: entry.he,
      en: entry.en,
      spans: [
        {
          from: { c: span.from.chapter, v: span.from.verse },
          to: { c: span.to.chapter, v: span.to.verse }
        }
      ],
      aliyot
    });
  }

  parshaRanges.sort((a, b) => a.ordinal - b.ordinal);
  return parshaRanges;
}

async function main() {
  await ensureDir(OUTPUT_HE_ROOT);
  await ensureDir(OUTPUT_AR_ROOT);

  const tanakhMetaRaw = await fs.readFile(TANAKH_INDEX_PATH, "utf8");
  const tanakhMeta = JSON.parse(tanakhMetaRaw);
  const parshaIndex = JSON.parse(await fs.readFile(PARSHA_INDEX_PATH, "utf8"));

  const books = tanakhMeta.sections.flatMap((section) => section.books.map((book) => ({ ...book, section: section.id })));

  const results = [];

  for (const book of books) {
    const sefariaRef = sefariaRefForBook(book.id, book.en);
    const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(sefariaRef)}?context=0&commentary=0&pad=0&lang=he`;
    console.log(`Fetching ${book.en} from ${url}`);
    const payload = await fetchJson(url);
    const chapters = normalizeChapters(payload.he || payload.text || []);
    const formatted = formatBookPayload(book.id, book.he, book.en, chapters);
    await fs.writeFile(
      path.join(OUTPUT_HE_ROOT, `${book.id}.json`),
      JSON.stringify(formatted, null, 2) + "\n",
      "utf8"
    );
    results.push({ bookId: book.id, chapters: formatted.meta.chapters, versesPerChapter: formatted.meta.versesPerChapter });

    if (TORAH_BOOK_IDS.has(book.id)) {
      const onqelosRef = ONQELOS_BOOK_TO_REF[book.id];
      if (!onqelosRef) {
        throw new Error(`Missing Onqelos ref for ${book.id}`);
      }
      const onqelosUrl = `https://www.sefaria.org/api/texts/${encodeURIComponent(onqelosRef)}?context=0&commentary=0&pad=0&lang=he`;
      console.log(`Fetching ${book.en} (Onqelos) from ${onqelosUrl}`);
      const onqelosPayload = await fetchJson(onqelosUrl);
      const onqelosChapters = normalizeChapters(onqelosPayload.he || onqelosPayload.text || []);
      const onqelosFormatted = formatBookPayload(book.id, book.he, book.en, onqelosChapters);
      await fs.writeFile(
        path.join(OUTPUT_AR_ROOT, `${book.id}.json`),
        JSON.stringify(onqelosFormatted, null, 2) + "\n",
        "utf8"
      );
    }
  }

  const parshaRanges = await buildParshaRanges(parshaIndex);
  await fs.writeFile(PARSHA_RANGES_OUTPUT, JSON.stringify(parshaRanges, null, 2) + "\n", "utf8");

  console.log("Download complete. Summary:");
  for (const entry of results) {
    console.log(
      `${entry.bookId}: ${entry.chapters} chapters, verses per chapter = ${entry.versesPerChapter.join(",")}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
