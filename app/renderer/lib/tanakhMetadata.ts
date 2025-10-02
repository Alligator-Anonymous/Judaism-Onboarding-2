// Codex change: Helper selectors for Tanakh sections, books, chapters, and parshiot.
import { ParshaMetadataEntry, TanakhManifest, TanakhManifestBook } from "@/types";

interface SectionDefinition {
  id: string;
  he: string;
  en: string;
}

interface CanonicalGroupDefinition {
  id: string;
  en: string;
  he?: string;
  type?: "group" | "folder";
  items: (string | CanonicalGroupDefinition)[];
}

interface CanonicalSectionDefinition extends SectionDefinition {
  items: (string | CanonicalGroupDefinition)[];
}

const CANONICAL_SECTIONS: CanonicalSectionDefinition[] = [
  {
    id: "torah",
    he: "תורה",
    en: "Torah",
    items: ["genesis", "exodus", "leviticus", "numbers", "deuteronomy"]
  },
  {
    id: "neviim",
    he: "נביאים",
    en: "Nevi'im",
    items: [
      {
        id: "former-prophets",
        en: "Former Prophets",
        items: ["joshua", "judges", "i-samuel", "ii-samuel", "i-kings", "ii-kings"]
      },
      {
        id: "latter-prophets",
        en: "Latter Prophets",
        items: [
          "isaiah",
          "jeremiah",
          "ezekiel",
          {
            id: "the-twelve",
            en: "The Twelve",
            type: "folder",
            items: [
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
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ketuvim",
    he: "כתובים",
    en: "Ketuvim",
    items: [
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
    ]
  }
];

export interface ManifestBookInfo {
  id: string;
  he: string;
  en: string;
  chapters: number;
  available: TanakhManifestBookAvailability;
}

export interface ManifestGroupInfo {
  id: string;
  en: string;
  he?: string;
  type: "group" | "folder";
  books: ManifestBookInfo[];
  groups: ManifestGroupInfo[];
}

export interface ManifestSectionInfo extends SectionDefinition {
  books: ManifestBookInfo[];
  groups: ManifestGroupInfo[];
}

function buildBookInfo(book: TanakhManifestBook | undefined): ManifestBookInfo | null {
  if (!book) return null;
  const heTitle = book.heTitle ?? book.title;
  return {
    id: book.slug,
    he: heTitle,
    en: book.title,
    chapters: book.chapters,
    available: book.available
  };
}

function groupSections(manifest: TanakhManifest | null | undefined): ManifestSectionInfo[] {
  if (!manifest?.books?.length) return [];
  const manifestMap = new Map(manifest.books.map((book) => [book.slug, book]));
  const sections: ManifestSectionInfo[] = [];

  for (const sectionDef of CANONICAL_SECTIONS) {
    const books: ManifestBookInfo[] = [];
    const seen = new Set<string>();
    const addToSection = (book: ManifestBookInfo) => {
      if (seen.has(book.id)) return;
      books.push(book);
      seen.add(book.id);
    };

    const groups: ManifestGroupInfo[] = [];

    const buildGroup = (groupDef: CanonicalGroupDefinition): ManifestGroupInfo | null => {
      const groupBooks: ManifestBookInfo[] = [];
      const nestedGroups: ManifestGroupInfo[] = [];

      for (const groupItem of groupDef.items) {
        if (typeof groupItem === "string") {
          const info = buildBookInfo(manifestMap.get(groupItem));
          if (info) {
            addToSection(info);
            groupBooks.push(info);
          }
        } else {
          const nested = buildGroup(groupItem);
          if (nested) {
            nestedGroups.push(nested);
          }
        }
      }

      if (groupBooks.length === 0 && nestedGroups.length === 0) {
        return null;
      }

      return {
        id: groupDef.id,
        en: groupDef.en,
        he: groupDef.he,
        type: groupDef.type ?? "group",
        books: groupBooks,
        groups: nestedGroups
      };
    };

    for (const item of sectionDef.items) {
      if (typeof item === "string") {
        const info = buildBookInfo(manifestMap.get(item));
        if (info) {
          addToSection(info);
        }
      } else {
        const group = buildGroup(item);
        if (group) {
          groups.push(group);
        }
      }
    }

    if (books.length === 0 && groups.length === 0) {
      continue;
    }

    sections.push({
      id: sectionDef.id,
      he: sectionDef.he,
      en: sectionDef.en,
      books,
      groups
    });
  }

  return sections;
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
