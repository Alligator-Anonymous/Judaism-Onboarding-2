#!/usr/bin/env node
// Local importer that assembles Tanakh content packs from offline Sefaria exports.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const BOOKS_TO_IMPORT = [
  "Genesis",
  "Exodus"
];

const SOURCE_ROOT = path.join(repoRoot, "Codex imports");
const HEBREW_OUTPUT_DIR = path.join(repoRoot, "app/renderer/data/packs/tanakh/he-taamei/books");
const ENGLISH_OUTPUT_DIR = path.join(repoRoot, "app/renderer/data/packs/tanakh/en/books");
const ONQELOS_OUTPUT_DIR = path.join(repoRoot, "app/renderer/data/packs/tanakh/ar-onqelos/books");
const MANIFEST_PATH = path.join(repoRoot, "app/renderer/data/metadata/tanakh.manifest.json");
const PARSHA_RANGES_PATH = path.join(repoRoot, "app/renderer/data/metadata/parsha.ranges.json");
const TANAKH_INDEX_PATH = path.join(repoRoot, "app/renderer/data/metadata/tanakh.index.json");
const PARSHIYOT_INDEX_PATH = path.join(repoRoot, "app/renderer/data/metadata/parshiyot.index.json");
const PARSHA_CSV_PATH = path.join(SOURCE_ROOT, "fullkriyah-5786.csv");

const SECTION_LABELS = {
  torah: "Torah",
  neviim: "Prophets",
  ketuvim: "Writings"
};

const BOOK_NAME_TO_SLUG = new Map([
  ["Genesis", "genesis"],
  ["Exodus", "exodus"],
  ["Leviticus", "leviticus"],
  ["Numbers", "numbers"],
  ["Deuteronomy", "deuteronomy"],
  ["Joshua", "joshua"],
  ["Judges", "judges"],
  ["I Samuel", "samuel-1"],
  ["II Samuel", "samuel-2"],
  ["1 Samuel", "samuel-1"],
  ["2 Samuel", "samuel-2"],
  ["I Kings", "kings-1"],
  ["II Kings", "kings-2"],
  ["1 Kings", "kings-1"],
  ["2 Kings", "kings-2"],
  ["Isaiah", "isaiah"],
  ["Jeremiah", "jeremiah"],
  ["Ezekiel", "ezekiel"],
  ["Hosea", "hosea"],
  ["Joel", "joel"],
  ["Amos", "amos"],
  ["Obadiah", "obadiah"],
  ["Jonah", "jonah"],
  ["Micah", "micah"],
  ["Nahum", "nahum"],
  ["Habakkuk", "habakkuk"],
  ["Zephaniah", "zephaniah"],
  ["Haggai", "haggai"],
  ["Zechariah", "zechariah"],
  ["Malachi", "malachi"],
  ["Psalms", "psalms"],
  ["Proverbs", "proverbs"],
  ["Job", "job"],
  ["Song of Songs", "song-of-songs"],
  ["Ruth", "ruth"],
  ["Lamentations", "lamentations"],
  ["Ecclesiastes", "ecclesiastes"],
  ["Esther", "esther"],
  ["Daniel", "daniel"],
  ["Ezra", "ezra"],
  ["Nehemiah", "nehemiah"],
  ["I Chronicles", "chronicles-1"],
  ["II Chronicles", "chronicles-2"],
  ["1 Chronicles", "chronicles-1"],
  ["2 Chronicles", "chronicles-2"],
  ["Song-of-Songs", "song-of-songs"],
  ["Song_of_Songs", "song-of-songs"],
  ["Shir HaShirim", "song-of-songs"]
]);

const HEBREW_PRIORITIES = [
  "Tanach with Ta'amei Hamikra.json",
  "Tanach with Nikkud.json",
  "Tanach with Text Only.json",
  "Miqra according to the Masorah.json"
];

const ENGLISH_SCT = "Sefaria Community Translation.json";
const ENGLISH_JPS = "The Holy Scriptures A New Translation JPS 1917.json";

const COMBINED_PARSHA = new Map([
  ["Vayakhel-Pekudei", ["Vayakhel", "Pekudei"]],
  ["Tazria-Metzora", ["Tazria", "Metzora"]],
  ["Achrei Mot-Kedoshim", ["Acharei Mot", "Kedoshim"]],
  ["Behar-Bechukotai", ["Behar", "Bechukotai"]],
  ["Chukat-Balak", ["Chukat", "Balak"]],
  ["Matot-Masei", ["Matot", "Masei"]],
  ["Nitzavim-Vayeilech", ["Nitzavim", "Vayelech"]]
]);

function normalizeWhitespace(text) {
  if (typeof text !== "string") return "";
  return text.replace(/<[^>]+>/g, "").trim();
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function flattenChapter(node) {
  if (Array.isArray(node)) {
    return node.flatMap((child) => flattenChapter(child));
  }
  if (typeof node === "string") {
    return [node];
  }
  if (node == null) {
    return [];
  }
  return [String(node)];
}

function normalizeChapters(textNode) {
  if (!Array.isArray(textNode)) return [];
  return textNode.map((chapterNode) => {
    const verses = flattenChapter(chapterNode).map((verse) => normalizeWhitespace(verse));
    while (verses.length && !normalizeWhitespace(verses[verses.length - 1])) {
      verses.pop();
    }
    return verses;
  });
}

function alignToBase(baseChapters, candidateChapters) {
  return baseChapters.map((chapterVerses, chapterIndex) => {
    const candidate = candidateChapters[chapterIndex] ?? [];
    return chapterVerses.map((_, verseIndex) => {
      const raw = candidate[verseIndex];
      if (typeof raw !== "string") return null;
      const trimmed = raw.trim();
      return trimmed === "" ? null : trimmed;
    });
  });
}

function alignAramaic(baseChapters, candidateChapters) {
  return baseChapters.map((chapterVerses, chapterIndex) => {
    const candidate = candidateChapters[chapterIndex] ?? [];
    return chapterVerses.map((_, verseIndex) => {
      const raw = candidate[verseIndex];
      if (typeof raw !== "string") return null;
      const trimmed = raw.trim();
      return trimmed === "" ? null : trimmed;
    });
  });
}

function hasNonEmpty(alignedChapters) {
  return alignedChapters.some((chapter) => chapter.some((verse) => verse && verse.trim() !== ""));
}

async function loadTanakhIndex() {
  const exists = await fs
    .access(TANAKH_INDEX_PATH)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    throw new Error("Missing tanakh.index.json for metadata lookup");
  }
  const index = await readJson(TANAKH_INDEX_PATH);
  const books = new Map();
  for (const section of index.sections ?? []) {
    const sectionLabel = SECTION_LABELS[section.id] ?? "Torah";
    for (const book of section.books ?? []) {
      books.set(book.id, {
        slug: book.id,
        title: book.en,
        heTitle: book.he,
        section: sectionLabel
      });
    }
  }
  return books;
}

async function loadParshaIndex() {
  const parshiot = await readJson(PARSHIYOT_INDEX_PATH);
  const byEnglish = new Map();
  const bySlug = new Map();
  for (const entry of parshiot) {
    byEnglish.set(entry.en, entry.id);
    bySlug.set(entry.id, entry);
  }
  return { byEnglish, bySlug };
}

async function loadManifest() {
  const exists = await fs
    .access(MANIFEST_PATH)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    return { books: [] };
  }
  return readJson(MANIFEST_PATH);
}

function buildCanonicalOrder() {
  return [
    "genesis",
    "exodus",
    "leviticus",
    "numbers",
    "deuteronomy",
    "joshua",
    "judges",
    "samuel-1",
    "samuel-2",
    "kings-1",
    "kings-2",
    "isaiah",
    "jeremiah",
    "ezekiel",
    "hosea",
    "joel",
    "amos",
    "obadiah",
    "jonah",
    "micah",
    "nahum",
    "habakkuk",
    "zephaniah",
    "haggai",
    "zechariah",
    "malachi",
    "psalms",
    "proverbs",
    "job",
    "song-of-songs",
    "ruth",
    "lamentations",
    "ecclesiastes",
    "esther",
    "daniel",
    "ezra",
    "nehemiah",
    "chronicles-1",
    "chronicles-2"
  ];
}

async function findPreferredFile(dirPath, priorities) {
  const exists = await fs
    .access(dirPath)
    .then(() => true)
    .catch(() => false);
  if (!exists) return null;
  const files = await fs.readdir(dirPath);
  for (const filename of priorities) {
    if (files.includes(filename)) {
      return path.join(dirPath, filename);
    }
  }
  return null;
}

async function findFileByPrefix(dirPath, prefix) {
  const exists = await fs
    .access(dirPath)
    .then(() => true)
    .catch(() => false);
  if (!exists) return null;
  const files = await fs.readdir(dirPath);
  return files
    .filter((name) => name.toLowerCase().includes(prefix.toLowerCase()))
    .map((name) => path.join(dirPath, name))[0] ?? null;
}

function buildChapterPayload(bookId, bookTitle, hebrewChapters) {
  return {
    bookId,
    bookTitle,
    chapters: hebrewChapters.map((verses, chapterIndex) => ({
      chapter: chapterIndex + 1,
      verses: verses.map((text, verseIndex) => ({
        n: verseIndex + 1,
        he: text,
        ref: `${bookId} ${chapterIndex + 1}:${verseIndex + 1}`
      }))
    }))
  };
}

function buildEnglishPayload(bookId, bookTitle, baseChapters, sctChapters, jpsChapters) {
  return {
    bookId,
    bookTitle,
    chapters: baseChapters.map((_, chapterIndex) => ({
      chapter: chapterIndex + 1,
      verses: baseChapters[chapterIndex].map((__, verseIndex) => ({
        n: verseIndex + 1,
        en: {
          sct: sctChapters[chapterIndex]?.[verseIndex] ?? null,
          jps1917: jpsChapters[chapterIndex]?.[verseIndex] ?? null
        },
        ref: `${bookId} ${chapterIndex + 1}:${verseIndex + 1}`
      }))
    }))
  };
}

function buildOnqelosPayload(bookId, bookTitle, baseChapters, aramaicChapters, englishChapters) {
  return {
    bookId,
    bookTitle,
    chapters: baseChapters.map((_, chapterIndex) => ({
      chapter: chapterIndex + 1,
      verses: baseChapters[chapterIndex].map((__, verseIndex) => ({
        n: verseIndex + 1,
        ar_he: aramaicChapters[chapterIndex]?.[verseIndex] ?? null,
        ar_en: englishChapters[chapterIndex]?.[verseIndex] ?? null,
        ref: `${bookId} ${chapterIndex + 1}:${verseIndex + 1}`
      }))
    }))
  };
}

async function importBook(def, heTitle) {
  const sourceDir = path.join(SOURCE_ROOT, def.section, def.name);
  const hebrewDir = path.join(sourceDir, "Hebrew");
  const englishDir = path.join(sourceDir, "English");

  const hebrewFile = await findPreferredFile(hebrewDir, HEBREW_PRIORITIES);
  if (!hebrewFile) {
    throw new Error(`Missing Hebrew source for ${def.name}`);
  }
  const hebrewJson = await readJson(hebrewFile);
  const hebrewChapters = normalizeChapters(hebrewJson.text);
  if (hebrewChapters.length === 0) {
    throw new Error(`Hebrew text for ${def.name} is empty`);
  }

  const englishSctFile = path.join(englishDir, ENGLISH_SCT);
  const englishJpsFile = path.join(englishDir, ENGLISH_JPS);

  const englishSctExists = await fs
    .access(englishSctFile)
    .then(() => true)
    .catch(() => false);
  const englishJpsExists = await fs
    .access(englishJpsFile)
    .then(() => true)
    .catch(() => false);

  const englishSctChaptersRaw = englishSctExists ? normalizeChapters((await readJson(englishSctFile)).text) : [];
  const englishJpsChaptersRaw = englishJpsExists ? normalizeChapters((await readJson(englishJpsFile)).text) : [];

  const englishSct = alignToBase(hebrewChapters, englishSctChaptersRaw);
  const englishJps = alignToBase(hebrewChapters, englishJpsChaptersRaw);

  const onqelosHebrewFile = await findFileByPrefix(path.join(SOURCE_ROOT, "Onkelos", "Hebrew"), `Onkelos ${def.name}`);
  const onqelosEnglishFile = await findFileByPrefix(path.join(SOURCE_ROOT, "Onkelos", "English"), `Onkelos ${def.name}`);

  let onqelosHebrew = [];
  let onqelosEnglish = [];

  if (onqelosHebrewFile) {
    const onqelosHeJson = await readJson(onqelosHebrewFile);
    onqelosHebrew = alignAramaic(hebrewChapters, normalizeChapters(onqelosHeJson.text));
  }
  if (onqelosEnglishFile) {
    const onqelosEnJson = await readJson(onqelosEnglishFile);
    onqelosEnglish = alignAramaic(hebrewChapters, normalizeChapters(onqelosEnJson.text));
  }

  const hebrewPayload = buildChapterPayload(def.slug, def.name, hebrewChapters);
  const englishPayload = buildEnglishPayload(def.slug, def.name, hebrewChapters, englishSct, englishJps);
  const onqelosPayload = buildOnqelosPayload(def.slug, def.name, hebrewChapters, onqelosHebrew, onqelosEnglish);

  await ensureDir(HEBREW_OUTPUT_DIR);
  await ensureDir(ENGLISH_OUTPUT_DIR);
  await ensureDir(ONQELOS_OUTPUT_DIR);

  await fs.writeFile(path.join(HEBREW_OUTPUT_DIR, `${def.slug}.json`), `${JSON.stringify(hebrewPayload, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(ENGLISH_OUTPUT_DIR, `${def.slug}.json`), `${JSON.stringify(englishPayload, null, 2)}\n`, "utf8");

  const hasOnqelos = onqelosHebrew.length > 0 && onqelosHebrew.some((chapter) => chapter.some((verse) => verse));
  if (hasOnqelos) {
    await fs.writeFile(
      path.join(ONQELOS_OUTPUT_DIR, `${def.slug}.json`),
      `${JSON.stringify(onqelosPayload, null, 2)}\n`,
      "utf8"
    );
  } else {
    const onqelosPath = path.join(ONQELOS_OUTPUT_DIR, `${def.slug}.json`);
    const exists = await fs
      .access(onqelosPath)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      await fs.rm(onqelosPath);
    }
  }

  const hasSct = hasNonEmpty(englishSct);
  const hasJps = hasNonEmpty(englishJps);

  return {
    slug: def.slug,
    name: def.name,
    heTitle,
    section: def.section,
    chapters: hebrewChapters.length,
    hasSct,
    hasJps,
    hasOnqelos
  };
}

function normalizeParshaLabel(label) {
  return label
    .replace(/[’׳״]/g, "'")
    .replace(/[^A-Za-z'-]/g, "")
    .toLowerCase();
}

const CANONICAL_PARSHA = [
  "Bereshit",
  "Noach",
  "Lech-Lecha",
  "Vayera",
  "Chayei Sarah",
  "Toldot",
  "Vayetze",
  "Vayishlach",
  "Vayeshev",
  "Miketz",
  "Vayigash",
  "Vayechi",
  "Shemot",
  "Vaera",
  "Bo",
  "Beshalach",
  "Yitro",
  "Mishpatim",
  "Terumah",
  "Tetzaveh",
  "Ki Tisa",
  "Vayakhel",
  "Pekudei",
  "Vayikra",
  "Tzav",
  "Shemini",
  "Tazria",
  "Metzora",
  "Acharei Mot",
  "Kedoshim",
  "Emor",
  "Behar",
  "Bechukotai",
  "Bamidbar",
  "Naso",
  "Beha'alotcha",
  "Sh'lach",
  "Korach",
  "Chukat",
  "Balak",
  "Pinchas",
  "Matot",
  "Masei",
  "Devarim",
  "Vaetchanan",
  "Eikev",
  "Re'eh",
  "Shoftim",
  "Ki Teitzei",
  "Ki Tavo",
  "Nitzavim",
  "Vayelech",
  "Ha'Azinu",
  "V'Zot HaBerachah"
];

function buildParshaNameMap() {
  const map = new Map();
  for (const name of CANONICAL_PARSHA) {
    map.set(normalizeParshaLabel(name), name);
  }
  COMBINED_PARSHA.forEach((names, key) => {
    map.set(normalizeParshaLabel(key), names);
  });
  map.set(normalizeParshaLabel("Chayei Sara"), "Chayei Sarah");
  map.set(normalizeParshaLabel("Vayetzei"), "Vayetze");
  map.set(normalizeParshaLabel("Shmini"), "Shemini");
  map.set(normalizeParshaLabel("Nasso"), "Naso");
  map.set(normalizeParshaLabel("Achrei Mot"), "Acharei Mot");
  map.set(normalizeParshaLabel("Shelach"), "Sh'lach");
  map.set(normalizeParshaLabel("Shlach"), "Sh'lach");
  map.set(normalizeParshaLabel("Shlach Lecha"), "Sh'lach");
  map.set(normalizeParshaLabel("Ki Tetze"), "Ki Teitzei");
  map.set(normalizeParshaLabel("Vezot Haberachah"), "V'Zot HaBerachah");
  map.set(normalizeParshaLabel("Vezot Habracha"), "V'Zot HaBerachah");
  map.set(normalizeParshaLabel("Haazinu"), "Ha'Azinu");
  map.set(normalizeParshaLabel("Hazinu"), "Ha'Azinu");
  return map;
}

function parseAliyahRange(reading) {
  const [primary] = reading.split("|");
  const segment = primary.trim();
  const match = segment.match(/^(.+?)\s+(\d+):(\d+)\s*-\s*(?:(\d+):(\d+)|(\d+))$/);
  if (!match) {
    throw new Error(`Unable to parse aliyah reading: ${reading}`);
  }
  const book = match[1].trim();
  const startChapter = Number.parseInt(match[2], 10);
  const startVerse = Number.parseInt(match[3], 10);
  const endChapter = match[4] ? Number.parseInt(match[4], 10) : startChapter;
  const endVerse = match[4] ? Number.parseInt(match[5], 10) : Number.parseInt(match[6], 10);
  return {
    book,
    startChapter,
    startVerse,
    endChapter,
    endVerse
  };
}

async function buildParshaRanges(bookMeta, parshaIndex) {
  const parshaNameMap = buildParshaNameMap();
  const ranges = new Map();
  const csvContent = await fs.readFile(PARSHA_CSV_PATH, "utf8");
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const header = lines.shift();
  if (!header) return [];

  function addAliyah(canonicalName, slug, bookSlug, aliyahNumber, startRef, endRef) {
    if (!ranges.has(slug)) {
      ranges.set(slug, {
        parsha: canonicalName,
        slug,
        book: bookSlug,
        aliyot: []
      });
    }
    const entry = ranges.get(slug);
    entry.aliyot[aliyahNumber - 1] = {
      n: aliyahNumber,
      start: startRef,
      end: endRef
    };
  }

  for (const line of lines) {
    const columns = line.match(/("[^"]*"|[^,]+)/g);
    if (!columns || columns.length < 5) continue;
    const parshaRaw = columns[1].replace(/^"|"$/g, "");
    const aliyahRaw = columns[2].replace(/^"|"$/g, "");
    const readingRaw = columns[3].replace(/^"|"$/g, "");

    const normalized = normalizeParshaLabel(parshaRaw);
    if (!parshaNameMap.has(normalized)) continue;

    const aliNumber = Number.parseInt(aliyahRaw, 10);
    if (!Number.isFinite(aliNumber) || aliNumber < 1 || aliNumber > 7) continue;

    let canonical = parshaNameMap.get(normalized);
    if (!canonical) continue;

    const { book, startChapter, startVerse, endChapter, endVerse } = parseAliyahRange(readingRaw);
    const bookSlug = BOOK_NAME_TO_SLUG.get(book) ?? BOOK_NAME_TO_SLUG.get(book.replace(/-/g, " "));
    if (!bookSlug) continue;

    const targetParshiot = Array.isArray(canonical) ? canonical : [canonical];
    for (const name of targetParshiot) {
      const slug = parshaIndex.byEnglish.get(name);
      if (!slug) continue;
      const entry = parshaIndex.bySlug.get(slug);
      const resolvedBookSlug = entry?.bookId ?? bookSlug;
      addAliyah(
        name,
        slug,
        resolvedBookSlug,
        aliNumber,
        `${resolvedBookSlug} ${startChapter}:${startVerse}`,
        `${resolvedBookSlug} ${endChapter}:${endVerse}`
      );
    }
  }

  const manualFallbacks = [];
  const vzotSlug = parshaIndex.byEnglish.get("V'Zot HaBerachah");
  if (vzotSlug) {
    const vzotMeta = parshaIndex.bySlug.get(vzotSlug);
    manualFallbacks.push({
      parsha: "V'Zot HaBerachah",
      slug: vzotSlug,
      book: vzotMeta?.bookId ?? "deuteronomy",
      aliyot: [
        { n: 1, start: "deuteronomy 33:1", end: "deuteronomy 33:7" },
        { n: 2, start: "deuteronomy 33:8", end: "deuteronomy 33:12" },
        { n: 3, start: "deuteronomy 33:13", end: "deuteronomy 33:17" },
        { n: 4, start: "deuteronomy 33:18", end: "deuteronomy 33:21" },
        { n: 5, start: "deuteronomy 33:22", end: "deuteronomy 33:26" },
        { n: 6, start: "deuteronomy 33:27", end: "deuteronomy 33:29" },
        { n: 7, start: "deuteronomy 34:1", end: "deuteronomy 34:12" }
      ]
    });
  }

  for (const fallback of manualFallbacks) {
    const existing = ranges.get(fallback.slug);
    const existingCount = existing?.aliyot?.filter(Boolean).length ?? 0;
    if (!existing || existingCount < 7) {
      ranges.set(fallback.slug, fallback);
    }
  }

  const canonicalOrder = [...parshaIndex.bySlug.values()].sort((a, b) => a.ordinal - b.ordinal);
  const output = [];
  for (const entry of canonicalOrder) {
    if (!ranges.has(entry.id)) continue;
    const payload = ranges.get(entry.id);
    const aliyot = payload.aliyot.filter(Boolean);
    if (aliyot.length === 7) {
      output.push({
        parsha: payload.parsha,
        slug: payload.slug,
        book: payload.book,
        aliyot
      });
    }
  }
  return output;
}

async function writeManifest(manifest) {
  const canonicalOrder = buildCanonicalOrder();
  manifest.books.sort((a, b) => canonicalOrder.indexOf(a.slug) - canonicalOrder.indexOf(b.slug));
  await ensureDir(path.dirname(MANIFEST_PATH));
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function writeParshaRanges(entries, existing, parshaIndex) {
  const combined = new Map();
  for (const entry of existing) {
    combined.set(entry.slug, entry);
  }
  for (const entry of entries) {
    combined.set(entry.slug, entry);
  }
  const orderedSlugs = [...parshaIndex.bySlug.values()]
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((entry) => entry.id);
  const sorted = [];
  for (const slug of orderedSlugs) {
    if (combined.has(slug)) {
      sorted.push(combined.get(slug));
      combined.delete(slug);
    }
  }
  for (const [, entry] of combined) {
    sorted.push(entry);
  }
  await ensureDir(path.dirname(PARSHA_RANGES_PATH));
  await fs.writeFile(PARSHA_RANGES_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}

async function main() {
  if (BOOKS_TO_IMPORT.length === 0) {
    console.log("No books specified for import.");
    return;
  }

  const bookMeta = await loadTanakhIndex();
  const manifest = await loadManifest();
  const parshaIndex = await loadParshaIndex();
  const parshaRangesExisting = await readJson(PARSHA_RANGES_PATH).catch(() => []);

  const summaries = [];
  for (const name of BOOKS_TO_IMPORT) {
    const slug = BOOK_NAME_TO_SLUG.get(name);
    if (!slug) {
      console.warn(`Skipping unknown book name: ${name}`);
      continue;
    }
    const meta = bookMeta.get(slug) ?? { slug, title: name, heTitle: name, section: SECTION_LABELS.torah };
    const summary = await importBook({
      name,
      slug,
      section: meta.section
    }, meta.heTitle ?? name);
    summaries.push(summary);

    const manifestEntry = {
      slug: summary.slug,
      title: summary.name,
      heTitle: summary.heTitle,
      section: summary.section,
      chapters: summary.chapters,
      available: {
        he: true,
        en: { sct: summary.hasSct, jps1917: summary.hasJps },
        onqelos: summary.hasOnqelos && summary.section === "Torah"
      }
    };

    const existingIndex = manifest.books.findIndex((entry) => entry.slug === summary.slug);
    if (existingIndex === -1) {
      manifest.books.push(manifestEntry);
    } else {
      manifest.books[existingIndex] = manifestEntry;
    }
  }

  await writeManifest(manifest);

  const parshaRanges = await buildParshaRanges(bookMeta, parshaIndex);
  await writeParshaRanges(parshaRanges, parshaRangesExisting, parshaIndex);

  console.log("Tanakh import summary:");
  for (const entry of summaries) {
    console.log(
      `- ${entry.name} (${entry.slug}): ${entry.chapters} chapters | Hebrew ✓ | SCT ${entry.hasSct ? "✓" : "—"} | JPS ${
        entry.hasJps ? "✓" : "—"
      } | Onqelos ${entry.hasOnqelos ? "✓" : "—"}`
    );
  }
  console.log(`Updated ${parshaRanges.length} parsha ranges.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
