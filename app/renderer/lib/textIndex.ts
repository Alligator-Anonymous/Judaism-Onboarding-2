import type { Verse } from "@/types";

export interface WordIndexEntry {
  lemma: string;
  occurrences: { ref: string; surface: string }[];
}

export function buildRootIndex(verses: Verse[]): Record<string, WordIndexEntry> {
  const index: Record<string, WordIndexEntry> = {};
  verses.forEach((verse) => {
    verse.words.forEach((word) => {
      if (!word.root) return;
      if (!index[word.root]) {
        index[word.root] = { lemma: word.lemma ?? word.surface, occurrences: [] };
      }
      index[word.root].occurrences.push({ ref: verse.ref, surface: word.surface });
    });
  });
  return index;
}
