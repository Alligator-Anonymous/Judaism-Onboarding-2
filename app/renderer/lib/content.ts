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
  TanakhMetadata,
  ParshaMetadataEntry
} from "@/types";
import tanakhMeta from "@/data/metadata/tanakh.index.json";
import parshaMeta from "@/data/metadata/parshiyot.index.json";

const jsonModules = import.meta.glob("@/data/packs/core-v1/**/*.json", {
  eager: true
});

function extractRelativePath(path: string): string | null {
  const pivot = "/packs/core-v1/";
  const index = path.lastIndexOf(pivot);
  if (index === -1) return null;
  return path.slice(index + pivot.length).replace(/\.(json)$/i, "");
}

export function loadContentRegistry(): ContentRegistry {
  const manifestKey = Object.keys(jsonModules).find((key) => key.endsWith("pack.json"));
  if (!manifestKey) {
    throw new Error("Core content pack manifest not found");
  }
  const manifest = (jsonModules[manifestKey] as { default: ContentPackManifest }).default;

  const tanakhMetadata = tanakhMeta as TanakhMetadata;
  const parshaMetadata = parshaMeta as ParshaMetadataEntry[];

  const registry: ContentRegistry = {
    manifest,
    siddur: {},
    tanakh: {},
    commentary: {},
    holidays: {},
    faq: {},
    alefbet: [],
    tanakhMeta: tanakhMetadata ?? null,
    parshaMeta: parshaMetadata ?? []
  };

  Object.entries(jsonModules).forEach(([key, mod]) => {
    if (key.endsWith("pack.json")) return;
    const data = (mod as { default: unknown }).default ?? mod;
    const relative = extractRelativePath(key);
    if (!relative) return;

    if (relative.startsWith("siddur/")) {
      registry.siddur[relative.split("/")[1].replace(/\\..+$/, "")] = data as Prayer[];
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

  return registry;
}
