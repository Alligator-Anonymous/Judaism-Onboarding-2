import { create } from "zustand";
import type { SpacedRepItem } from "@lib/spacedRep";
import { createItem, dueItems, gradeItem } from "@lib/spacedRep";

interface JournalEntry {
  id: string;
  date: string;
  prompt: string;
  reflection?: string;
}

interface LearningState {
  queue: SpacedRepItem[];
  journal: JournalEntry[];
  addWord: (prompt: string, answer: string) => void;
  grade: (id: string, quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
  due: () => SpacedRepItem[];
  upsertJournal: (entry: JournalEntry) => void;
}

export const useLearning = create<LearningState>((set, get) => ({
  queue: [],
  journal: [],
  addWord: (prompt, answer) =>
    set((state) => ({ queue: [...state.queue, createItem(`${prompt}-${Date.now()}`, prompt, answer)] })),
  grade: (id, quality) =>
    set((state) => ({
      queue: state.queue.map((item) => (item.id === id ? gradeItem(item, quality) : item))
    })),
  due: () => dueItems(get().queue),
  upsertJournal: (entry) =>
    set((state) => {
      const existingIndex = state.journal.findIndex((j) => j.id === entry.id);
      if (existingIndex >= 0) {
        const next = [...state.journal];
        next[existingIndex] = entry;
        return { journal: next };
      }
      return { journal: [...state.journal, entry] };
    })
}));
