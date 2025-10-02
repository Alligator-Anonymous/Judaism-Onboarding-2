// scripts/local-import-tanakh.mjs
import fs from "node:fs";
import path from "node:path";

const BOOK_TO_IMPORT = "Song of Songs";

const CANONICAL_ORDER = [
  "genesis",
  "exodus",
  "leviticus",
  "numbers",
  "deuteronomy",
  "joshua",
  "judges",
  "i-samuel",
  "ii-samuel",
  "i-kings",
  "ii-kings",
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
  "i-chronicles",
  "ii-chronicles"
];

const SECTION_BY_SLUG = (() => {
  const torah = new Set(["genesis", "exodus", "leviticus", "numbers", "deuteronomy"]);
  const formerProphets = new Set(["joshua", "judges", "i-samuel", "ii-samuel", "i-kings", "ii-kings"]);
  const latterProphets = new Set([
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
    "malachi"
  ]);

  const mapping = {};
  for (const slug of CANONICAL_ORDER) {
    if (torah.has(slug)) {
      mapping[slug] = "Torah";
    } else if (formerProphets.has(slug) || latterProphets.has(slug)) {
      mapping[slug] = "Neviim";
    } else {
      mapping[slug] = "Ketuvim";
    }
  }
  return mapping;
})();

if (!BOOK_TO_IMPORT || typeof BOOK_TO_IMPORT !== "string") {
  console.error("BOOK_TO_IMPORT must be a single book title string.");
  process.exit(1);
}

// Allowed sources (strict, no fallbacks)
const HEB_NAME = "Tanach with Ta'amei Hamikra.json";                 // Hebrew (sole source)
const EN_NAME  = "The Holy Scriptures A New Translation JPS 1917.json"; // English (sole source)

const SRC_ROOT_CANDIDATES = ["Codex Imports", "Codex imports"];
const SRC_ROOT = SRC_ROOT_CANDIDATES.find(dir => fs.existsSync(dir)) ?? SRC_ROOT_CANDIDATES[0];

// Output packs (app expects these)
const OUT_HE  = "app/renderer/data/packs/tanakh/he-taamei/books";
const OUT_EN  = "app/renderer/data/packs/tanakh/en/books";
const OUT_ONQ = "app/renderer/data/packs/tanakh/ar-onqelos/books"; // optional if present

function slugify(book) {
  return book
    .replace(/^I+\s+/i, m => m.toLowerCase().replace(/\s+/g, "") + "-") // "I Samuel" -> "i-"
    .replace(/^II+\s+/i, m => m.toLowerCase().replace(/\s+/g, "") + "-") // "II Kings" -> "ii-"
    .replace(/\s+/g, "-")
    .replace(/'/g, "")
    .toLowerCase();
}

function findSource(book, langFolder, fileName) {
  const sections = ["Torah", "Prophets", "Writings"];
  for (const sec of sections) {
    const folder = path.join(SRC_ROOT, sec, book, langFolder);
    const exact = path.join(folder, fileName);
    if (fs.existsSync(exact)) return exact;

    if (!fs.existsSync(folder)) continue;

    const jsonCandidates = fs
      .readdirSync(folder)
      .filter(name => name.toLowerCase().endsWith(".json"));

    if (jsonCandidates.length === 1) {
      const fallback = path.join(folder, jsonCandidates[0]);
      console.warn(
        `Using fallback source for ${book} (${langFolder}): expected ${fileName}, found ${jsonCandidates[0]}`
      );
      return fallback;
    }
  }
  return null;
}

function readJsonSafe(p) {
  if (!p) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function writeJson(p, obj) { ensureDir(path.dirname(p)); fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8"); }

// Optional Onqelos (Torah only) if user supplied under Codex Imports/Onkelos/<Book>/(Hebrew|English)/*.json
function tryLoadOnqelos(book) {
  const base = path.join(SRC_ROOT, "Onkelos", book);
  const heP = path.join(base, "Hebrew", `${book}.json`);
  const enP = path.join(base, "English", `${book}.json`);
  const hasHe = fs.existsSync(heP);
  const hasEn = fs.existsSync(enP);
  if (!hasHe && !hasEn) return null;
  return {
    he: hasHe ? readJsonSafe(heP) : null,
    en: hasEn ? readJsonSafe(enP) : null,
  };
}

// Normalize Sefaria-style per-book JSON into our shape
function cleanEnglishVerse(str) {
  if (typeof str !== "string") return null;
  const withoutSmall = str.replace(/<small>.*?<\/small>/gis, "");
  const withoutBreaks = withoutSmall.replace(/<br\s*\/?>/gi, " ");
  const withoutTags = withoutBreaks.replace(/<[^>]+>/g, "");
  const withoutCommunity = withoutTags.replace(/Sefaria Community Translation/gi, "");
  const normalized = withoutCommunity.replace(/\s+/g, " ").trim();
  return normalized.length ? normalized : null;
}

function normalize(book, heSrc, enSrc) {
  // Hebrew chapters (prefer `he`, else `text`)
  const heChapters = Array.isArray(heSrc?.he) ? heSrc.he
                    : Array.isArray(heSrc?.text) ? heSrc.text
                    : [];
  // English chapters (JPS text only, no community translation fallback)
  const enChapters = Array.isArray(enSrc?.text) ? enSrc.text : [];

  const chapters = [];
  for (let c = 0; c < heChapters.length; c++) {
    const heVerses = Array.isArray(heChapters[c]) ? heChapters[c] : [];
    const enVerses = Array.isArray(enChapters[c]) ? enChapters[c] : [];
    const verses = [];
    for (let v = 0; v < heVerses.length; v++) {
      const he = typeof heVerses[v] === "string" ? heVerses[v].trim() : null;
      const en = cleanEnglishVerse(enVerses[v]);
      verses.push({ n: v + 1, he, en, ref: `${slugify(book)} ${c + 1}:${v + 1}` });
    }
    chapters.push({ chapter: c + 1, verses });
  }
  return { chapters };
}

function main() {
  const book = BOOK_TO_IMPORT;
  const slug = slugify(book);

  // Locate strict sources
  const heP = findSource(book, "Hebrew", HEB_NAME);
  const enP = findSource(book, "English", EN_NAME);

  if (!heP) { console.error(`Missing Hebrew source for ${book}: ${HEB_NAME}`); process.exit(1); }
  if (!enP) { console.error(`Missing English source for ${book}: ${EN_NAME}`); process.exit(1); }

  const heSrc = readJsonSafe(heP);
  const enSrc = readJsonSafe(enP);

  if (!Array.isArray(enSrc?.text)) {
    console.error(`English source for ${book} is missing the expected JPS text array; refusing to fall back to other translations.`);
    process.exit(1);
  }

  const { chapters } = normalize(book, heSrc, enSrc);

  // Write Hebrew pack
  const heOut = {
    bookId: slug,
    bookTitle: book,
    chapters: chapters.map((ch) => ({
      chapter: ch.chapter,
      verses: ch.verses.map((v) => ({ n: v.n, he: v.he, ref: v.ref }))
    }))
  };
  writeJson(path.join(OUT_HE, `${slug}.json`), heOut);

  // Write English pack (JPS1917 only)
  const enOut = {
    bookId: slug,
    bookTitle: book,
    chapters: chapters.map((ch) => ({
      chapter: ch.chapter,
      verses: ch.verses.map((v) => ({
        n: v.n,
        en: { sct: null, jps1917: v.en ?? null },
        ref: v.ref
      }))
    }))
  };
  writeJson(path.join(OUT_EN, `${slug}.json`), enOut);

  // Optional Onqelos (if present)
  const onq = tryLoadOnqelos(book);
  if (onq) {
    const arOut = {
      bookId: slug,
      bookTitle: book,
      chapters: chapters.map(ch => ({
        chapter: ch.chapter,
        verses: ch.verses.map(v => ({
          n: v.n,
          ar_he: null, // placeholder if not mapped yet
          ar_en: null, // placeholder if not mapped yet
          ref: v.ref
        }))
      }))
    };
    writeJson(path.join(OUT_ONQ, `${slug}.json`), arOut);
  }

  // Update manifest
  const manifestPath = "app/renderer/data/metadata/tanakh.manifest.json";
  const manifest = fs.existsSync(manifestPath) ? readJsonSafe(manifestPath) : { books: [] };
  const bySlug = new Map(manifest.books.map(b => [b.slug, b]));

  const entry = bySlug.get(slug) || { slug, title: book, section: null, chapters: 0, available: {} };
  entry.section = SECTION_BY_SLUG[slug] ?? entry.section ?? "Ketuvim";
  entry.chapters = heOut.chapters.length;
  entry.available = {
    he: true,
    en: {
      sct: entry.available?.en?.sct ?? false,
      jps1917: true
    },
    onqelos: !!onq
  };
  bySlug.set(slug, entry);

  const books = Array.from(bySlug.values());
  books.sort((a, b) => {
    const orderA = CANONICAL_ORDER.indexOf(a.slug);
    const orderB = CANONICAL_ORDER.indexOf(b.slug);
    if (orderA !== -1 && orderB !== -1) {
      return orderA - orderB;
    }
    if (orderA !== -1) return -1;
    if (orderB !== -1) return 1;
    return a.title.localeCompare(b.title);
  });
  writeJson(manifestPath, { books });

  console.log("Import complete for:", book);
}

main();
