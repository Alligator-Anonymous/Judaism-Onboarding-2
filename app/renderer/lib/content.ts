// Codex change: Hydrate the content registry with Tanakh and parsha metadata alongside pack content.

import {
  ContentPackManifest,
  ContentRegistry,
  FAQEntry,
  Holiday,
  TanakhChapter,
  Commentary,
  AlefBetLetter,
  TanakhManifest,
  ParshaMetadataEntry,
  ParshaRangeEntry
} from "@/types";
import type {
  SiddurContentLibrary,
  SiddurManifest,
  SiddurPrayerContent,
  SiddurTradition
} from "@/types/siddur";
import tanakhManifestData from "@/data/metadata/tanakh.manifest.json";
import parshaMeta from "@/data/metadata/parshiyot.index.json";
import parshaRangesData from "@/data/metadata/parsha.ranges.json";
import siddurManifestData from "@/data/siddur/manifest.json";

const coreModules = import.meta.glob("@/data/packs/core-v1/**/*.json", {
  eager: true
});

const siddurContentModules = import.meta.glob("@/data/siddur/content/**/*.json", {
  eager: true
});

function extractRelativePath(path: string): string | null {
  const pivot = "/packs/core-v1/";
  const index = path.lastIndexOf(pivot);
  if (index === -1) return null;
  return path.slice(index + pivot.length).replace(/\.(json)$/i, "");
}

export function loadContentRegistry(): ContentRegistry {
  const manifestKey = Object.keys(coreModules).find((key) => key.endsWith("pack.json"));
  if (!manifestKey) {
    throw new Error("Core content pack manifest not found");
  }
  const manifest = (coreModules[manifestKey] as { default: ContentPackManifest }).default;

  const siddurManifest = (siddurManifestData as SiddurManifest) ?? null;

  const tanakhManifest = tanakhManifestData as TanakhManifest;
  const parshaMetadata = parshaMeta as ParshaMetadataEntry[];
  const parshaRanges = parshaRangesData as ParshaRangeEntry[];

  const registry: ContentRegistry = {
    manifest,
    siddur: {
      manifest: siddurManifest,
      content: {
        common: {},
        traditions: {
          ashkenaz: {},
          "nusach-sefarad": {},
          "edot-hamizrach": {}
        }
      }
    },
    tanakh: {},
    commentary: {},
    holidays: {},
    faq: {},
    alefbet: [],
    tanakhManifest: tanakhManifest ?? null,
    parshaMeta: parshaMetadata ?? [],
    parshaRanges: parshaRanges ?? []
  };

  Object.entries(coreModules).forEach(([key, mod]) => {
    if (key.endsWith("pack.json")) return;
    const data = (mod as { default: unknown }).default ?? mod;
    const relative = extractRelativePath(key);
    if (!relative) return;

    if (relative.startsWith("tanakh/")) {
      const bookKey = relative.split("/")[1].replace(/\\..+$/, "");
      registry.tanakh[bookKey] = data as TanakhChapter;
    } else if (relative.startsWith("commentary/")) {
      const commentaryKey = relative.split("/")[1].replace(/\\..+$/, "");
      registry.commentary[commentaryKey] = data as Commentary[];
    } else if (relative.startsWith("holidays/")) {
      const id = (data as Holiday).id;
      registry.holidays[id] = data as Holiday;
    } else if (relative.startsWith("faq/")) {
      const entry = data as FAQEntry;
      registry.faq[entry.id] = entry;
    } else if (relative.startsWith("alefbet/")) {
      registry.alefbet = data as AlefBetLetter[];
    }
  });

  const library = registry.siddur.content;

  const ensureTradition = (tradition: SiddurTradition) => {
    if (!library.traditions[tradition]) {
      library.traditions[tradition] = {};
    }
    return library.traditions[tradition]!;
  };

  Object.entries(siddurContentModules).forEach(([key, mod]) => {
    const pivot = "/data/siddur/content/";
    const index = key.lastIndexOf(pivot);
    if (index === -1) return;

    const relative = key.slice(index + pivot.length);
    const [maybeTradition, ...rest] = relative.split("/");
    if (!maybeTradition || rest.length === 0) return;

    const data = (mod as { default: SiddurPrayerContent }).default as SiddurPrayerContent;
    if (!data?.id) return;

    if (maybeTradition === "common") {
      library.common[data.id] = data;
      return;
    }

    const tradition = maybeTradition as SiddurTradition;
    if (tradition === "ashkenaz" || tradition === "nusach-sefarad" || tradition === "edot-hamizrach") {
      const map = ensureTradition(tradition);
      map[data.id] = data;
    }
  });

  return registry;
}
