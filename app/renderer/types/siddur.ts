export type SiddurTradition = "ashkenaz" | "sefard" | "edot_hamizrach";

export type SiddurImportance = "core" | "extended";

export type SiddurMode = "basic" | "full";

export type SiddurStatus = "placeholder";

export type SiddurDiasporaContext = "diaspora" | "israel" | "both";

export type SiddurWeekdayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type SiddurHolidayKey =
  | "rosh_hashanah"
  | "yom_kippur"
  | "pesach"
  | "shavuot"
  | "sukkot"
  | "shemini_atzeret"
  | "simchat_torah"
  | "chanukah"
  | "purim";

export type SiddurFastDayKey =
  | "tzom_gedaliah"
  | "asara_btevet"
  | "taanit_esther"
  | "shivah_asar_btammuz"
  | "tisha_bav"
  | "taanit_bechorot";

export interface SiddurApplicability {
  shabbat: boolean | null;
  roshChodesh: boolean | null;
  omer: boolean | null;
  motzaeiShabbat: boolean | null;
  holidays: SiddurHolidayKey[];
  fastDays: SiddurFastDayKey[];
  weekdays: SiddurWeekdayKey[];
  diasporaOrIsrael: SiddurDiasporaContext;
  requiresMinyan: boolean;
  mournerOnly: boolean;
  kaddishType?: string | null;
  amidahSection?: string | null;
  pesukeiSection?: string | null;
  torahReadingContext?: string | null;
}

export interface SiddurLanguageReserve {
  [key: string]: unknown;
}

export interface SiddurBaseEntry {
  id: string;
  title: string;
  description?: string;
  outline?: string[];
  order: number;
  importance: SiddurImportance;
  nusach: SiddurTradition[];
  applicability: SiddurApplicability;
  notes?: string;
  status: SiddurStatus;
  he: SiddurLanguageReserve;
  en: SiddurLanguageReserve;
}

export interface SiddurCategoryEntry extends SiddurBaseEntry {
  type: "category";
}

export interface SiddurServiceEntry extends SiddurBaseEntry {
  type: "service";
  categoryId: string;
  categoryName: string;
}

export interface SiddurBucketEntry extends SiddurBaseEntry {
  type: "bucket";
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
}

export interface SiddurItemEntry extends SiddurBaseEntry {
  type: "item";
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  bucketId: string;
  bucketName: string;
  tags?: string[];
}

export interface SiddurMetadata {
  categories: SiddurCategoryEntry[];
  services: SiddurServiceEntry[];
  buckets: SiddurBucketEntry[];
  items: SiddurItemEntry[];
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
