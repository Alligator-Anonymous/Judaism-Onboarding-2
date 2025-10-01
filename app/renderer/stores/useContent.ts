import { create } from "zustand";
import { ContentRegistry } from "@/types";
import { loadContentRegistry } from "@lib/content";

export interface ContentState {
  registry: ContentRegistry | null;
  hydrate: () => void;
}

export const useContent = create<ContentState>((set, get) => ({
  registry: null,
  hydrate: () => {
    if (get().registry) return;
    const registry = loadContentRegistry();
    set({ registry });
  }
}));
