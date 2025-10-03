// Codex change: Hydrate the content registry with Tanakh and parsha metadata alongside pack content.

import {
  ContentPackManifest,
  ContentRegistry,
  FAQEntry,
  Holiday,
  Prayer,
  TanakhChapter,
  Commentary,
  AlefBetLetter,
  TanakhManifest,
  ParshaMetadataEntry,
  ParshaRangeEntry
} from "@/types";
import type { SiddurEntry, SiddurManifest } from "@/types/siddur";
import tanakhManifestData from "@/data/metadata/tanakh.manifest.json";
import parshaMeta from "@/data/metadata/parshiyot.index.json";
import parshaRangesData from "@/data/metadata/parsha.ranges.json";

const coreModules = import.meta.glob("@/data/packs/core-v1/**/*.json", {
  eager: true
});

const siddurModules = import.meta.glob("@/data/packs/siddur/core-v1/**/*.json", {
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

  const siddurManifestKey = Object.keys(siddurModules).find((key) => key.endsWith("manifest.json"));
  const siddurManifest = siddurManifestKey
    ? ((siddurModules[siddurManifestKey] as { default: SiddurManifest }).default as SiddurManifest)
    : null;

  const tanakhManifest = tanakhManifestData as TanakhManifest;
  const parshaMetadata = parshaMeta as ParshaMetadataEntry[];
  const parshaRanges = parshaRangesData as ParshaRangeEntry[];

  const registry: ContentRegistry = {
    manifest,
    siddur: { manifest: siddurManifest, entries: {}, legacy: {} },
    tanakh: {},
    commentary: {},
    holidays: {},
    faq: {},
    alefbet: [],
    tanakhManifest: tanakhManifest ?? null,
    parshaMeta: parshaMetadata ?? [],
    parshaRanges: parshaRanges ?? []
  };

  const legacySiddur: Record<string, Prayer[]> = {};

  Object.entries(coreModules).forEach(([key, mod]) => {
    if (key.endsWith("pack.json")) return;
    const data = (mod as { default: unknown }).default ?? mod;
    const relative = extractRelativePath(key);
    if (!relative) return;

    if (relative.startsWith("siddur/")) {
      legacySiddur[relative.split("/")[1].replace(/\\..+$/, "")] = data as Prayer[];
    } else if (relative.startsWith("tanakh/")) {
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

  const siddurPathMap = new Map<string, SiddurEntry>();

  Object.entries(siddurModules).forEach(([key, mod]) => {
    if (key.endsWith("manifest.json")) return;
    const relative = (() => {
      const pivot = "/packs/siddur/core-v1/";
      const index = key.lastIndexOf(pivot);
      if (index === -1) return null;
      return key.slice(index + pivot.length);
    })();
    if (!relative) return;
    const data = (mod as { default: SiddurEntry }).default as SiddurEntry;
    siddurPathMap.set(relative.replace(/\.json$/i, ".json"), data);
  });

  if (siddurManifest) {
    Object.entries(siddurManifest.entries).forEach(([entryId, path]) => {
      const normalizedPath = path.endsWith(".json") ? path : `${path}.json`;
      const entry = siddurPathMap.get(normalizedPath);
      if (entry) {
        registry.siddur.entries[entryId] = entry;
      }
    });
  }

  if (Object.keys(legacySiddur).length > 0) {
    registry.siddur.legacy = legacySiddur;
  } else {
    delete registry.siddur.legacy;
  }

  return registry;
}
