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
}

export interface Commentary {
  id: string;
  author: "Rashi" | "Rambam" | "Ibn Ezra" | string;
  refs: string[];
  text: string;
  license: string;
}

export interface Prayer {
  id: string;
  section: "morning" | "afternoon" | "evening" | "bedtime";
  hebrew: string;
  translitAshkenazi?: string;
  translitSephardi?: string;
  translation: string;
  notes?: string;
}

export interface FAQEntry {
  id: string;
  question: string;
  tldr: string;
  fiveMin: string;
  deepDive: string;
  sources?: string[];
}

export interface Holiday {
  id: string;
  names: { he: string; en: string };
  description: string;
  practices: string[];
  blessings?: string[];
  notesForBeginners?: string[];
  dates?: string[];
}
