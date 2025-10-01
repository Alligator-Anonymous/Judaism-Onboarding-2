#!/usr/bin/env node
// Codex change: Validate locally cached Tanakh, Onqelos, and parsha range datasets.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const TANAKH_INDEX_PATH = path.join(repoRoot, "app/renderer/data/metadata/tanakh.index.json");
const HEBREW_BOOKS_DIR = path.join(repoRoot, "app/renderer/data/packs/tanakh/he-masoretic/books");
const ONQELOS_BOOKS_DIR = path.join(repoRoot, "app/renderer/data/packs/tanakh/ar-onqelos/books");
const PARSHA_RANGES_PATH = path.join(repoRoot, "app/renderer/data/metadata/parsha.ranges.json");

const TORAH_BOOK_IDS = new Set(["genesis", "exodus", "leviticus", "numbers", "deuteronomy"]);

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function ensureBookIntegrity(bookId, expectedChapters) {
  const filePath = path.join(HEBREW_BOOKS_DIR, `${bookId}.json`);
  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    throw new Error(`Missing Hebrew book payload for ${bookId}`);
  }
  const json = await readJson(filePath);
  const chapterKeys = Object.keys(json.chapters || {});
  if (chapterKeys.length !== expectedChapters) {
    throw new Error(`Chapter count mismatch for ${bookId}: expected ${expectedChapters}, found ${chapterKeys.length}`);
  }
  json.meta?.versesPerChapter?.forEach((verseCount, index) => {
    const chapterNumber = String(index + 1);
    const chapterArray = json.chapters?.[chapterNumber];
    if (!Array.isArray(chapterArray)) {
      throw new Error(`Chapter ${chapterNumber} in ${bookId} is not an array`);
    }
    if (chapterArray.length !== verseCount) {
      throw new Error(
        `Verse count mismatch in ${bookId} chapter ${chapterNumber}: expected ${verseCount}, found ${chapterArray.length}`
      );
    }
  });

  if (TORAH_BOOK_IDS.has(bookId)) {
    const onqelosPath = path.join(ONQELOS_BOOKS_DIR, `${bookId}.json`);
    const onqelosExists = await fs
      .access(onqelosPath)
      .then(() => true)
      .catch(() => false);
    if (!onqelosExists) {
      throw new Error(`Missing Onqelos payload for ${bookId}`);
    }
    const onqelos = await readJson(onqelosPath);
    json.meta?.versesPerChapter?.forEach((verseCount, index) => {
      const chapterNumber = String(index + 1);
      const arChapterArray = onqelos.chapters?.[chapterNumber];
      if (!Array.isArray(arChapterArray)) {
        throw new Error(`Onqelos chapter ${chapterNumber} in ${bookId} is not an array`);
      }
      if (arChapterArray.length !== verseCount) {
        throw new Error(
          `Onqelos verse mismatch in ${bookId} chapter ${chapterNumber}: expected ${verseCount}, found ${arChapterArray.length}`
        );
      }
    });
  }
}

function validateAliyot(parsha, bookMeta) {
  const totalChapters = bookMeta.meta?.chapters ?? 0;
  const versesPerChapter = bookMeta.meta?.versesPerChapter ?? [];

  const withinBounds = (chapter, verse) => {
    if (chapter < 1 || chapter > totalChapters) return false;
    const expectedVerses = versesPerChapter[chapter - 1];
    return verse >= 1 && verse <= expectedVerses;
  };

  parsha.spans.forEach((span) => {
    if (!withinBounds(span.from.c, span.from.v)) {
      throw new Error(`Parsha ${parsha.id} span start ${span.from.c}:${span.from.v} is out of bounds`);
    }
    if (!withinBounds(span.to.c, span.to.v)) {
      throw new Error(`Parsha ${parsha.id} span end ${span.to.c}:${span.to.v} is out of bounds`);
    }
  });

  const aliyot = parsha.aliyot ?? [];
  if (aliyot.length !== 7) {
    throw new Error(`Parsha ${parsha.id} should contain 7 aliyot; found ${aliyot.length}`);
  }
  const [firstAliyah] = aliyot;
  const lastAliyah = aliyot[aliyot.length - 1];
  if (
    firstAliyah.from.c !== parsha.spans[0].from.c ||
    firstAliyah.from.v !== parsha.spans[0].from.v
  ) {
    throw new Error(`Parsha ${parsha.id} first aliyah does not start at parsha beginning`);
  }
  if (
    lastAliyah.to.c !== parsha.spans[parsha.spans.length - 1].to.c ||
    lastAliyah.to.v !== parsha.spans[parsha.spans.length - 1].to.v
  ) {
    throw new Error(`Parsha ${parsha.id} last aliyah does not end at parsha end`);
  }
  for (const aliyah of aliyot) {
    if (!withinBounds(aliyah.from.c, aliyah.from.v)) {
      throw new Error(`Parsha ${parsha.id} aliyah ${aliyah.n} start out of bounds`);
    }
    if (!withinBounds(aliyah.to.c, aliyah.to.v)) {
      throw new Error(`Parsha ${parsha.id} aliyah ${aliyah.n} end out of bounds`);
    }
  }
}

async function main() {
  const tanakhIndex = await readJson(TANAKH_INDEX_PATH);
  const parshaRanges = await readJson(PARSHA_RANGES_PATH);

  const bookMetaMap = new Map();
  for (const section of tanakhIndex.sections) {
    for (const book of section.books) {
      await ensureBookIntegrity(book.id, book.chapters);
      const bookJson = await readJson(path.join(HEBREW_BOOKS_DIR, `${book.id}.json`));
      bookMetaMap.set(book.id, bookJson);
    }
  }

  for (const parsha of parshaRanges) {
    const bookJson = bookMetaMap.get(parsha.bookId);
    if (!bookJson) {
      throw new Error(`Missing book metadata for parsha ${parsha.id}`);
    }
    validateAliyot(parsha, bookJson);
  }

  console.log("All Tanakh datasets validated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
