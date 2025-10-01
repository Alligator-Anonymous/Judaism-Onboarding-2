// Codex change: Extended shared types with Tanakh metadata definitions.

export interface VerseWord {
  surface: string;
  lemma?: string;
  root?: string;
}

export interface Verse {
  ref: string;
  hebrew: string;
  hebrewPlain?: string;
  translit?: string;
  translation: string;
  words: VerseWord[];
  audio?: { url: string; startMs?: number; endMs?: number };
  commentaryRefs?: string[];
  license?: string;
  source?: string;
}

export interface Commentary {
  id: string;
  author: "Rashi" | "Rambam" | "Ibn Ezra" | string;
  refs: string[];
  text: string;
  license: string;
  source?: string;
}

export interface Prayer {
  id: string;
  section: "morning" | "afternoon" | "evening" | "bedtime";
  hebrew: string;
  translitAshkenazi?: string;
  translitSephardi?: string;
  translation: string;
  notes?: string;
  license?: string;
  source?: string;
}

export interface FAQEntry {
  id: string;
  question: string;
  tldr: string;
  fiveMin: string;
  deepDive: string;
  sources?: string[];
  license?: string;
  disclaimer?: string;
}

export interface Holiday {
  id: string;
  names: { he: string; en: string };
  description: string;
  practices: string[];
  blessings?: string[];
  notesForBeginners?: string[];
  dates?: string[];
  license?: string;
  source?: string;
}

export interface AlefBetLetter {
  letter: string;
  nameHe: string;
  nameEn: string;
  sound: string;
  finalForm: string | null;
  tips?: string;
  license?: string;
}

export interface TanakhChapter {
  book: string;
  chapter: number;
  verses: Verse[];
  license?: string;
  source?: string;
}

export interface ContentPackManifest {
  id: string;
  name: string;
  version: string;
  license: string;
  languages: string[];
  files: Record<string, string[]>;
}

export interface ContentRegistry {
  manifest: ContentPackManifest;
  siddur: Record<string, Prayer[]>;
  tanakh: Record<string, TanakhChapter>;
  commentary: Record<string, Commentary[]>;
  holidays: Record<string, Holiday>;
  faq: Record<string, FAQEntry>;
  alefbet: AlefBetLetter[];
  tanakhMeta: TanakhMetadata | null;
  parshaMeta: ParshaMetadataEntry[];
}

export interface TanakhBookMetadata {
  id: string;
  he: string;
  en: string;
  chapters: number;
}

export interface TanakhSectionMetadata {
  id: string;
  he: string;
  en: string;
  books: TanakhBookMetadata[];
}

export interface TanakhMetadata {
  id: string;
  sections: TanakhSectionMetadata[];
}

export interface ParshaMetadataEntry {
  id: string;
  he: string;
  en: string;
  ordinal: number;
  bookId: string;
  range: [string, string] | null;
}
