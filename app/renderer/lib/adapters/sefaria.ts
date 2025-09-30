import type { Commentary, Verse } from "@/types";

/**
 * Interface description for a future Sefaria API adapter.
 * The adapter should translate remote JSON responses into the local
 * `Verse` and `Commentary` shapes while respecting licensing terms.
 */
export interface SefariaAdapter {
  fetchVerses: (ref: string) => Promise<Verse[]>;
  fetchCommentary: (ref: string) => Promise<Commentary[]>;
}

// TODO: Implement actual network calls. For now we expose a stub so that
// future contributors can wire in data fetching without touching UI code.
export const sefariaAdapter: SefariaAdapter = {
  async fetchVerses() {
    throw new Error("Sefaria adapter not yet implemented");
  },
  async fetchCommentary() {
    throw new Error("Sefaria adapter not yet implemented");
  }
};
