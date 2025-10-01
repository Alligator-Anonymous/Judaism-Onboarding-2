// Codex change: Helper selectors for Tanakh sections, books, chapters, and parshiot.
import {
  ParshaMetadataEntry,
  TanakhBookMetadata,
  TanakhMetadata,
  TanakhSectionMetadata
} from "@/types";

export function getSectionBySlug(
  meta: TanakhMetadata | null | undefined,
  sectionSlug: string
): TanakhSectionMetadata | undefined {
  if (!meta) return undefined;
  return meta.sections.find((section) => section.id === sectionSlug);
}

export function getBookBySlug(
  section: TanakhSectionMetadata | undefined,
  bookSlug: string
): TanakhBookMetadata | undefined {
  if (!section) return undefined;
  return section.books.find((book) => book.id === bookSlug);
}

export function getChapterCount(book: TanakhBookMetadata | undefined): number {
  return book?.chapters ?? 0;
}

export function getParshaBySlug(
  parshiot: ParshaMetadataEntry[] | undefined,
  slug: string
): ParshaMetadataEntry | undefined {
  if (!parshiot?.length) return undefined;
  return parshiot.find((entry) => entry.id === slug);
}

export function getPrevNextParsha(
  parshiot: ParshaMetadataEntry[] | undefined,
  ordinal: number
): { prev: ParshaMetadataEntry | null; next: ParshaMetadataEntry | null } {
  if (!parshiot?.length) {
    return { prev: null, next: null };
  }
  const sorted = [...parshiot].sort((a, b) => a.ordinal - b.ordinal);
  const index = sorted.findIndex((entry) => entry.ordinal === ordinal);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null
  };
}
