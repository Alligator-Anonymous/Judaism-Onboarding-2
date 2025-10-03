export type SiddurTag =
  | "daily"
  | "shabbat"
  | "rosh_chodesh"
  | "yom_tov"
  | "chol_hamoed"
  | "chanukah"
  | "purim"
  | "fast_day"
  | "omer"
  | "mourner"
  | "life_cycle"
  | "synagogue"
  | "festival"
  | "weekday"
  | "special_insert"
  | "practice"
  | "meal"
  | "bedtime"
  | "seasonal"
  | "personal"
  | "education"
  | "omer_day"
  | string;

export type SiddurLanguage = "he" | "en";

export interface SiddurEntryBodySection {
  heading: string;
  text: string;
}

export interface SiddurEntryVariant {
  id: string;
  label: string;
  languages: SiddurLanguage[];
  body: SiddurEntryBodySection[];
}

export interface SiddurEntry {
  id: string;
  title: string;
  heTitle?: string;
  tags: SiddurTag[];
  variants: SiddurEntryVariant[];
  notes?: string;
}

export interface SiddurManifestEntryRef {
  type: "entry";
  id: string;
  title: string;
  description?: string;
  entryId: string;
  tags?: SiddurTag[];
}

export interface SiddurManifestGroup {
  type: "group";
  id: string;
  title: string;
  description?: string;
  children: SiddurManifestNode[];
}

export type SiddurManifestNode = SiddurManifestEntryRef | SiddurManifestGroup;

export interface SiddurManifestCategory {
  id: string;
  title: string;
  description?: string;
  children: SiddurManifestNode[];
}

export interface SiddurManifest {
  id: string;
  name: string;
  version: string;
  categories: SiddurManifestCategory[];
  entries: Record<string, string>;
}
