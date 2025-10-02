#!/usr/bin/env node
// Codex change: Validate locally cached Tanakh, Onqelos, and parsha range datasets.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const TANAKH_MANIFEST_PATH = path.join(repoRoot, "app/renderer/data/metadata/tanakh.manifest.json");
const HEBREW_BOOKS_DIR = path.join(repoRoot, "app/renderer/data/packs/tanakh/he-taamei/books");
const ONQELOS_BOOKS_DIR = path.join(repoRoot, "app/renderer/data/packs/tanakh/ar-onqelos/books");
const PARSHA_RANGES_PATH = path.join(repoRoot, "app/renderer/data/metadata/parsha.ranges.json");

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function ensureBookIntegrity(manifestEntry) {
  const filePath = path.join(HEBREW_BOOKS_DIR, `${manifestEntry.slug}.json`);
  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    throw new Error(`Missing Hebrew book payload for ${manifestEntry.slug}`);
  }
  const json = await readJson(filePath);
  const chapters = json.chapters ?? [];
  if (!Array.isArray(chapters) || chapters.length !== manifestEntry.chapters) {
    throw new Error(
      `Chapter count mismatch for ${manifestEntry.slug}: expected ${manifestEntry.chapters}, found ${Array.isArray(chapters) ? chapters.length : 0}`
    );
  }
  const versesPerChapter = chapters.map((chapter, index) => {
    if (typeof chapter.chapter !== "number" || !Array.isArray(chapter.verses)) {
      throw new Error(`Invalid structure for chapter ${index + 1} in ${manifestEntry.slug}`);
    }
    return chapter.verses.length;
  });

  if (manifestEntry.section === "Torah" && manifestEntry.available.onqelos) {
    const onqelosPath = path.join(ONQELOS_BOOKS_DIR, `${manifestEntry.slug}.json`);
    const onqelosExists = await fs
      .access(onqelosPath)
      .then(() => true)
      .catch(() => false);
    if (!onqelosExists) {
      throw new Error(`Missing Onqelos payload for ${manifestEntry.slug}`);
    }
    const onqelos = await readJson(onqelosPath);
    const onqelosChapters = onqelos.chapters ?? [];
    if (onqelosChapters.length !== chapters.length) {
      throw new Error(
        `Onqelos chapter count mismatch for ${manifestEntry.slug}: expected ${chapters.length}, found ${onqelosChapters.length}`
      );
    }
    onqelosChapters.forEach((chapter, index) => {
      if (!Array.isArray(chapter.verses) || chapter.verses.length !== versesPerChapter[index]) {
        throw new Error(
          `Onqelos verse mismatch in ${manifestEntry.slug} chapter ${index + 1}: expected ${versesPerChapter[index]}, found ${
            Array.isArray(chapter.verses) ? chapter.verses.length : 0
          }`
        );
      }
    });
  }

  return { chapters, versesPerChapter };
}

function parseReference(ref) {
  const match = ref.match(/^([a-z0-9-]+)\s+(\d+):(\d+)$/);
  if (!match) {
    throw new Error(`Invalid parsha reference: ${ref}`);
  }
  return {
    book: match[1],
    chapter: Number.parseInt(match[2], 10),
    verse: Number.parseInt(match[3], 10)
  };
}

function validateAliyot(parsha, bookData) {
  const aliyot = parsha.aliyot ?? [];
  if (aliyot.length !== 7) {
    throw new Error(`Parsha ${parsha.slug} should contain 7 aliyot; found ${aliyot.length}`);
  }
  for (const aliyah of aliyot) {
    const start = parseReference(aliyah.start);
    const end = parseReference(aliyah.end);
    if (start.book !== parsha.book || end.book !== parsha.book) {
      throw new Error(`Parsha ${parsha.slug} references multiple books`);
    }
    if (start.chapter < 1 || start.chapter > bookData.versesPerChapter.length) {
      throw new Error(`Parsha ${parsha.slug} aliyah ${aliyah.n} start out of bounds`);
    }
    if (end.chapter < 1 || end.chapter > bookData.versesPerChapter.length) {
      throw new Error(`Parsha ${parsha.slug} aliyah ${aliyah.n} end out of bounds`);
    }
    const startLimit = bookData.versesPerChapter[start.chapter - 1];
    const endLimit = bookData.versesPerChapter[end.chapter - 1];
    if (start.verse < 1 || start.verse > startLimit) {
      throw new Error(`Parsha ${parsha.slug} aliyah ${aliyah.n} start verse out of bounds`);
    }
    if (end.verse < 1 || end.verse > endLimit) {
      throw new Error(`Parsha ${parsha.slug} aliyah ${aliyah.n} end verse out of bounds`);
    }
  }
}

async function main() {
  const tanakhManifest = await readJson(TANAKH_MANIFEST_PATH);
  const parshaRanges = await readJson(PARSHA_RANGES_PATH);

  const bookMetaMap = new Map();
  for (const book of tanakhManifest.books ?? []) {
    const integrity = await ensureBookIntegrity(book);
    bookMetaMap.set(book.slug, integrity);
  }

  const skipped = new Set();
  for (const parsha of parshaRanges) {
    const bookData = bookMetaMap.get(parsha.book);
    if (!bookData) {
      skipped.add(parsha.book);
      continue;
    }
    validateAliyot(parsha, bookData);
  }

  if (skipped.size > 0) {
    console.warn(
      `Skipped ${skipped.size} parsha book(s) without manifest coverage: ${[...skipped]
        .sort()
        .join(", ")}`
    );
  }

  console.log("All Tanakh datasets validated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
