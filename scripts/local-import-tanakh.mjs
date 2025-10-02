// scripts/local-import-tanakh.mjs
import fs from "node:fs";
import path from "node:path";

const BOOK_TO_IMPORT = "Numbers";

if (!BOOK_TO_IMPORT || typeof BOOK_TO_IMPORT !== "string") {
  console.error("BOOK_TO_IMPORT must be a single book title string.");
  process.exit(1);
}

// Allowed sources (strict, no fallbacks)
const HEB_NAME = "Tanach with Ta'amei Hamikra.json";                 // Hebrew (sole source)
const EN_NAME  = "The Holy Scriptures A New Translation JPS 1917.json"; // English (sole source)

const SRC_ROOT = "Codex Imports"; // user placed all sources here

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
    const p = path.join(SRC_ROOT, sec, book, langFolder, fileName);
    if (fs.existsSync(p)) return p;
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
function normalize(book, heSrc, enSrc) {
  // Hebrew chapters (prefer `he`, else `text`)
  const heChapters = Array.isArray(heSrc?.he) ? heSrc.he
                    : Array.isArray(heSrc?.text) ? heSrc.text
                    : [];
  // English chapters (prefer `text`, else `en`)
  const enChapters = Array.isArray(enSrc?.text) ? enSrc.text
                    : Array.isArray(enSrc?.en) ? enSrc.en
                    : [];

  const chapters = [];
  for (let c = 0; c < heChapters.length; c++) {
    const heVerses = Array.isArray(heChapters[c]) ? heChapters[c] : [];
    const enVerses = Array.isArray(enChapters[c]) ? enChapters[c] : [];
    const verses = [];
    for (let v = 0; v < heVerses.length; v++) {
      const he = typeof heVerses[v] === "string" ? heVerses[v].trim() : null;
      const en = typeof enVerses[v] === "string" ? enVerses[v].trim() : null; // may be missing
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

  const { chapters } = normalize(book, heSrc, enSrc);

  // Write Hebrew pack
  const heOut = {
    bookId: slug,
    bookTitle: book,
    chapters: chapters.map(ch => ({
      chapter: ch.chapter,
      verses: ch.verses.map(v => ({ n: v.n, he: v.he, ref: v.ref }))
    }))
  };
  writeJson(path.join(OUT_HE, `${slug}.json`), heOut);

  // Write English pack (JPS1917 only)
  const enOut = {
    bookId: slug,
    bookTitle: book,
    chapters: chapters.map(ch => ({
      chapter: ch.chapter,
      verses: ch.verses.map(v => ({ n: v.n, en: v.en ?? null, ref: v.ref }))
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
  entry.section = entry.section || (["Genesis","Exodus","Leviticus","Numbers","Deuteronomy"].includes(book) ? "Torah"
                       : ["Joshua","Judges","Ruth","Samuel","Kings","Isaiah","Jeremiah","Ezekiel",
                          "Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"]
                         .some(n => book.includes(n)) ? "Nevi'im" : "Ketuvim");
  entry.chapters = heOut.chapters.length;
  entry.available = { he: true, en: { jps1917: true }, onqelos: !!onq };
  bySlug.set(slug, entry);

  const books = Array.from(bySlug.values());
  const secOrder = { "Torah": 0, "Nevi'im": 1, "Ketuvim": 2, null: 3, undefined: 3 };
  books.sort((a,b) => (secOrder[a.section] - secOrder[b.section]) || a.title.localeCompare(b.title));
  writeJson(manifestPath, { books });

  console.log("Import complete for:", book);
}

main();
