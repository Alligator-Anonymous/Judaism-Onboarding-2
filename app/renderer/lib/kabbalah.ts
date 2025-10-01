type KabbalahSystem = "none" | "gra" | "ari" | "ramak" | "kircher";

export interface LetterSystemMapping {
  path?: number | null;
  element?: "Air" | "Fire" | "Water" | null;
  planet?: string | null;
  zodiac?: string | null;
  month?: string | null;
  notes?: string | null;
}

export interface KabbalahSystemFile {
  systemId: Exclude<KabbalahSystem, "none">;
  name: string;
  version: string;
  mappings: Record<string, LetterSystemMapping>;
}

// Vite imports all JSON in the folder at build time
const files = import.meta.glob("../data/kabbalah/systems/*.json", {
  eager: true,
  import: "default"
}) as Record<string, KabbalahSystemFile>;

const REGISTRY: Record<string, KabbalahSystemFile> = {};
for (const key in files) {
  const sys = files[key];
  REGISTRY[sys.systemId] = sys;
}

export function getLetterMapping(letter: string, system: KabbalahSystem) {
  if (system === "none") return undefined;
  return REGISTRY[system]?.mappings?.[letter];
}

export function getSystemDisplayName(system: KabbalahSystem) {
  if (system === "none") return "None";
  return REGISTRY[system]?.name ?? system.toUpperCase();
}
