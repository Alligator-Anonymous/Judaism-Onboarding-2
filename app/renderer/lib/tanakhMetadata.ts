// Codex change: Helper selectors for Tanakh sections, books, chapters, and parshiot.
import { ParshaMetadataEntry, TanakhManifest, TanakhManifestBookAvailability } from "@/types";

interface SectionDefinition {
  id: string;
  he: string;
  en: string;
}

const SECTION_MAP: Record<string, SectionDefinition> = {
  Torah: { id: "torah", he: "תורה", en: "Torah" },
  Prophets: { id: "neviim", he: "נביאים", en: "Nevi'im" },
  Writings: { id: "ketuvim", he: "כתובים", en: "Ketuvim" }
};

export interface ManifestBookInfo {
  id: string;
  he: string;
  en: string;
  chapters: number;
  available: TanakhManifestBookAvailability;
}

export interface ManifestSectionInfo extends SectionDefinition {
  books: ManifestBookInfo[];
}

function groupSections(manifest: TanakhManifest | null | undefined): ManifestSectionInfo[] {
  if (!manifest?.books?.length) return [];
  const orderMap = new Map<string, number>();
  manifest.books.forEach((book, index) => orderMap.set(book.slug, index));
  const sections = new Map<string, ManifestSectionInfo>();
  for (const book of manifest.books) {
    const sectionDef = SECTION_MAP[book.section];
    if (!sectionDef) continue;
    if (!sections.has(sectionDef.id)) {
      sections.set(sectionDef.id, { ...sectionDef, books: [] });
    }
    const heTitle = book.heTitle ?? book.title;
    const info: ManifestBookInfo = {
      id: book.slug,
      he: heTitle,
      en: book.title,
      chapters: book.chapters,
      available: book.available
    };
    sections.get(sectionDef.id)!.books.push(info);
  }
  return Array.from(sections.values()).map((section) => ({
    ...section,
    books: section.books.sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 0;
      const orderB = orderMap.get(b.id) ?? 0;
      return orderA - orderB;
    })
  }));
}

export function getSections(manifest: TanakhManifest | null | undefined): ManifestSectionInfo[] {
  return groupSections(manifest);
}

export function getSectionBySlug(
  manifest: TanakhManifest | null | undefined,
  sectionSlug: string
): ManifestSectionInfo | undefined {
  return groupSections(manifest).find((section) => section.id === sectionSlug);
}

export function getBookBySlug(
  section: ManifestSectionInfo | undefined,
  bookSlug: string
): ManifestBookInfo | undefined {
  if (!section) return undefined;
  return section.books.find((book) => book.id === bookSlug);
}

export function getChapterCount(book: ManifestBookInfo | undefined): number {
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
