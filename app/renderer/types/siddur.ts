export type SiddurTradition = "ashkenaz" | "nusach-sefarad" | "edot-hamizrach";

export interface SiddurManifestPrayer {
  id: string;
  title_en: string;
  title_he?: string;
  description?: string;
  tags?: string[];
}

export interface SiddurManifestSection {
  id: string;
  title_en: string;
  title_he?: string;
  description?: string;
  prayers?: SiddurManifestPrayer[];
  sections?: SiddurManifestSection[];
}

export interface SiddurManifestCategory {
  id: string;
  title_en: string;
  title_he?: string;
  description?: string;
  sections: SiddurManifestSection[];
}

export interface SiddurManifest {
  version: string;
  categories: SiddurManifestCategory[];
}

export interface SiddurPrayerSegment {
  label_en?: string;
  label_he?: string;
  he?: string;
  en?: string;
}

export interface SiddurPrayerContent {
  id: string;
  title_en: string;
  title_he?: string;
  segments: SiddurPrayerSegment[];
}

export interface SiddurContentLibrary {
  common: Record<string, SiddurPrayerContent>;
  traditions: Record<SiddurTradition, Record<string, SiddurPrayerContent>>;
}
