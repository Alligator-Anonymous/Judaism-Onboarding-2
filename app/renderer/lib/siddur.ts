import { HebrewCalendar, HDate } from "@hebcal/core";
import type {
  SiddurApplicability,
  SiddurBucketEntry,
  SiddurCategoryEntry,
  SiddurDiasporaContext,
  SiddurFastDayKey,
  SiddurImportance,
  SiddurItemEntry,
  SiddurMetadata,
  SiddurMode,
  SiddurServiceEntry,
  SiddurTradition,
  SiddurWeekdayKey
} from "@/types/siddur";

export interface SiddurFilterContext {
  date: Date;
  weekday: number;
  weekdayKey: SiddurWeekdayKey;
  isShabbat: boolean;
  isMotzaeiShabbat: boolean;
  isRoshChodesh: boolean;
  isOmer: boolean;
  omerDay: number | null;
  holidaysToday: string[];
  fastDaysToday: SiddurFastDayKey[];
  diasporaOrIsrael: SiddurDiasporaContext;
  hasMinyan: boolean;
  isMourner: boolean;
}

export interface SiddurNavigationItem {
  item: SiddurItemEntry;
  applicableToday: boolean;
}

export interface SiddurNavigationBucket {
  bucket: SiddurBucketEntry;
  applicableToday: boolean;
  items: SiddurNavigationItem[];
}

export interface SiddurNavigationService {
  service: SiddurServiceEntry;
  applicableToday: boolean;
  buckets: SiddurNavigationBucket[];
}

export interface SiddurNavigationCategory {
  category: SiddurCategoryEntry;
  applicableToday: boolean;
  services: SiddurNavigationService[];
}

export interface SiddurNavigationData {
  categories: SiddurNavigationCategory[];
  categoryMap: Map<string, SiddurNavigationCategory>;
  serviceMap: Map<string, SiddurNavigationService>;
  bucketMap: Map<string, SiddurNavigationBucket>;
  itemMap: Map<string, SiddurNavigationItem>;
}

const WEEKDAY_KEYS: SiddurWeekdayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const HOLIDAY_KEYWORDS: Record<string, string> = {
  "rosh hashanah": "rosh_hashanah",
  "yom kippur": "yom_kippur",
  pesach: "pesach",
  passover: "pesach",
  shavuot: "shavuot",
  sukkot: "sukkot",
  "shemini atzeret": "shemini_atzeret",
  "simchat torah": "simchat_torah",
  chanukah: "chanukah",
  hanukkah: "chanukah",
  purim: "purim"
};

const FAST_DAY_KEYWORDS: Record<string, SiddurFastDayKey> = {
  "tzom gedaliah": "tzom_gedaliah",
  "gedaliah": "tzom_gedaliah",
  "asarah b'tevet": "asara_btevet",
  "10 tevet": "asara_btevet",
  "fast of esther": "taanit_esther",
  "ta'anit esther": "taanit_esther",
  "shivah asar b'tammuz": "shivah_asar_btammuz",
  "17 tammuz": "shivah_asar_btammuz",
  "tisha b'av": "tisha_bav",
  "tish'a b'av": "tisha_bav",
  "ta'anit bechorot": "taanit_bechorot",
  "fast of the firstborn": "taanit_bechorot"
};

function normalize(text: string): string {
  return text.toLowerCase();
}

function detectHoliday(desc: string): string | null {
  const normalized = normalize(desc);
  for (const [keyword, key] of Object.entries(HOLIDAY_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return key;
    }
  }
  return null;
}

function detectFastDay(desc: string): SiddurFastDayKey | null {
  const normalized = normalize(desc);
  for (const [keyword, key] of Object.entries(FAST_DAY_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return key;
    }
  }
  return null;
}

function detectOmer(desc: string): number | null {
  const match = /([0-9]{1,2})[^0-9]*day of the omer/i.exec(desc);
  if (match) {
    return Number(match[1]);
  }
  const lagMatch = /lag baomer|lag b'omer/i.test(desc);
  if (lagMatch) {
    return 33;
  }
  return null;
}

export interface CreateContextOptions {
  date: Date;
  diasporaOrIsrael: SiddurDiasporaContext;
  hasMinyan: boolean;
  isMourner: boolean;
}

export function createSiddurFilterContext(options: CreateContextOptions): SiddurFilterContext {
  const { date, diasporaOrIsrael, hasMinyan, isMourner } = options;
  const weekday = date.getDay();
  const weekdayKey = WEEKDAY_KEYS[weekday] ?? "sun";
  const isShabbat = weekday === 6;
  const isMotzaeiShabbat = weekdayKey === "sat" && date.getHours() >= 18;

  const hdate = new HDate(date);
  const hebrewDay = hdate.getDate();
  const monthLength = hdate.monthLength();
  const isRoshChodesh = hebrewDay === 1 || hebrewDay === monthLength;

  const diaspora = diasporaOrIsrael !== "israel";
  const events: string[] = [];
  const fastDays: SiddurFastDayKey[] = [];
  let omerDay: number | null = null;

  try {
    const hebcalEvents = HebrewCalendar.calendar({
      start: date,
      end: date,
      diaspora,
      israel: !diaspora,
      sedra: false,
      omer: true,
      candlelighting: false,
      yomtov: true,
      fasts: true,
      cholHamoedPesach: true,
      cholHamoedSuccot: true
    }) as Array<{ getDesc: () => string } | undefined>;

    hebcalEvents.forEach((event) => {
      if (!event) return;
      const desc = event.getDesc();
      if (!desc) return;
      const holiday = detectHoliday(desc);
      if (holiday) {
        events.push(holiday);
      }
      const fast = detectFastDay(desc);
      if (fast) {
        fastDays.push(fast);
      }
      const maybeOmer = detectOmer(desc);
      if (maybeOmer !== null) {
        omerDay = maybeOmer;
      }
    });
  } catch (error) {
    // Silent fallback; rely on heuristics below.
  }

  if (omerDay === null) {
    try {
      const hebrewYear = hdate.getFullYear();
      const omerStart = new HDate(16, "Nisan", hebrewYear);
      const diff = hdate.abs() - omerStart.abs();
      if (diff >= 0 && diff < 49) {
        omerDay = diff + 1;
      }
    } catch (error) {
      // Ignore fallback failure; rely on upstream calendar results when available.
    }
  }

  return {
    date,
    weekday,
    weekdayKey,
    isShabbat,
    isMotzaeiShabbat,
    isRoshChodesh,
    isOmer: omerDay !== null,
    omerDay,
    holidaysToday: events,
    fastDaysToday: Array.from(new Set(fastDays)),
    diasporaOrIsrael,
    hasMinyan,
    isMourner
  };
}

function evaluateApplicability(applicability: SiddurApplicability, context: SiddurFilterContext): boolean {
  const { shabbat, roshChodesh, omer, motzaeiShabbat, holidays, fastDays, weekdays, diasporaOrIsrael, requiresMinyan, mournerOnly } = applicability;

  if (shabbat === true && !context.isShabbat) return false;
  if (shabbat === false && context.isShabbat) return false;

  if (roshChodesh === true && !context.isRoshChodesh) return false;
  if (roshChodesh === false && context.isRoshChodesh) return false;

  if (omer === true && !context.isOmer) return false;
  if (omer === false && context.isOmer) return false;

  if (motzaeiShabbat === true && !context.isMotzaeiShabbat) return false;
  if (motzaeiShabbat === false && context.isMotzaeiShabbat) return false;

  if (holidays.length > 0 && !holidays.some((holiday) => context.holidaysToday.includes(holiday))) {
    return false;
  }

  if (fastDays.length > 0 && !fastDays.some((fast) => context.fastDaysToday.includes(fast))) {
    return false;
  }

  if (weekdays.length > 0 && !weekdays.includes(context.weekdayKey)) {
    return false;
  }

  if (diasporaOrIsrael && diasporaOrIsrael !== "both" && diasporaOrIsrael !== context.diasporaOrIsrael) {
    return false;
  }

  if (requiresMinyan && !context.hasMinyan) {
    return false;
  }

  if (mournerOnly && !context.isMourner) {
    return false;
  }

  return true;
}

function filterByMode(importance: SiddurImportance, mode: SiddurMode): boolean {
  if (mode === "full") return true;
  return importance === "core";
}

export interface BuildNavigationOptions {
  metadata: SiddurMetadata | null;
  tradition: SiddurTradition;
  mode: SiddurMode;
  showOnlyApplicable: boolean;
  context: SiddurFilterContext;
}

export function buildSiddurNavigation(options: BuildNavigationOptions): SiddurNavigationData {
  const { metadata, tradition, mode, showOnlyApplicable, context } = options;
  const categories: SiddurNavigationCategory[] = [];
  const categoryMap = new Map<string, SiddurNavigationCategory>();
  const serviceMap = new Map<string, SiddurNavigationService>();
  const bucketMap = new Map<string, SiddurNavigationBucket>();
  const itemMap = new Map<string, SiddurNavigationItem>();

  if (!metadata) {
    return { categories, categoryMap, serviceMap, bucketMap, itemMap };
  }

  const itemsByBucket = new Map<string, SiddurNavigationItem[]>();

  metadata.items.forEach((item) => {
    if (!item.nusach.includes(tradition)) return;
    if (!filterByMode(item.importance, mode)) return;
    const applicable = evaluateApplicability(item.applicability, context);
    if (showOnlyApplicable && !applicable) return;
    const navigationItem: SiddurNavigationItem = {
      item,
      applicableToday: applicable
    };
    if (!itemsByBucket.has(item.bucketId)) {
      itemsByBucket.set(item.bucketId, []);
    }
    itemsByBucket.get(item.bucketId)!.push(navigationItem);
    itemMap.set(item.id, navigationItem);
  });

  metadata.buckets.forEach((bucket) => {
    if (!bucket.nusach.includes(tradition)) return;
    if (!filterByMode(bucket.importance, mode)) return;
    const bucketItems = itemsByBucket.get(bucket.id) ?? [];
    const bucketApplicable = evaluateApplicability(bucket.applicability, context);
    if (showOnlyApplicable && (!bucketApplicable || bucketItems.length === 0)) {
      return;
    }
    if (bucketItems.length === 0) return;
    const navigationBucket: SiddurNavigationBucket = {
      bucket,
      applicableToday: bucketApplicable,
      items: bucketItems.sort((a, b) => a.item.order - b.item.order)
    };
    bucketMap.set(bucket.id, navigationBucket);
    const serviceKey = bucket.serviceId;
    if (!serviceMap.has(serviceKey)) {
      const serviceEntry = metadata.services.find((service) => service.id === serviceKey);
      if (!serviceEntry) return;
      if (!serviceEntry.nusach.includes(tradition)) return;
      if (!filterByMode(serviceEntry.importance, mode)) return;
      const serviceApplicable = evaluateApplicability(serviceEntry.applicability, context);
      const serviceBuckets: SiddurNavigationBucket[] = [];
      const navigationService: SiddurNavigationService = {
        service: serviceEntry,
        applicableToday: serviceApplicable,
        buckets: serviceBuckets
      };
      serviceMap.set(serviceKey, navigationService);
    }
    serviceMap.get(serviceKey)!.buckets.push(navigationBucket);
  });

  serviceMap.forEach((serviceValue, serviceId) => {
    serviceValue.buckets.sort((a, b) => a.bucket.order - b.bucket.order);
    if (showOnlyApplicable) {
      serviceValue.buckets = serviceValue.buckets.filter((bucket) => bucket.applicableToday);
    }
    if (serviceValue.buckets.length === 0) {
      serviceMap.delete(serviceId);
    }
  });

  metadata.services.forEach((service) => {
    const navigationService = serviceMap.get(service.id);
    if (!navigationService) return;
    const categoryKey = service.categoryId;
    if (!categoryMap.has(categoryKey)) {
      const categoryEntry = metadata.categories.find((category) => category.id === categoryKey);
      if (!categoryEntry) return;
      if (!categoryEntry.nusach.includes(tradition)) return;
      if (!filterByMode(categoryEntry.importance, mode)) return;
      const categoryApplicable = evaluateApplicability(categoryEntry.applicability, context);
      const categoryServices: SiddurNavigationService[] = [];
      const navigationCategory: SiddurNavigationCategory = {
        category: categoryEntry,
        applicableToday: categoryApplicable,
        services: categoryServices
      };
      categoryMap.set(categoryKey, navigationCategory);
      categories.push(navigationCategory);
    }
    categoryMap.get(categoryKey)!.services.push(navigationService);
  });

  categoryMap.forEach((categoryValue, categoryId) => {
    categoryValue.services.sort((a, b) => a.service.order - b.service.order);
    if (showOnlyApplicable) {
      categoryValue.services = categoryValue.services.filter((service) => service.applicableToday && service.buckets.length > 0);
    }
    if (categoryValue.services.length === 0) {
      categoryMap.delete(categoryId);
      const idx = categories.findIndex((entry) => entry.category.id === categoryId);
      if (idx !== -1) {
        categories.splice(idx, 1);
      }
    }
  });

  categories.sort((a, b) => a.category.order - b.category.order);

  return { categories, categoryMap, serviceMap, bucketMap, itemMap };
}

export function getTodaySiddurOutline(
  metadata: SiddurMetadata | null,
  tradition: SiddurTradition,
  mode: SiddurMode,
  context: SiddurFilterContext
): SiddurNavigationCategory[] {
  return buildSiddurNavigation({ metadata, tradition, mode, showOnlyApplicable: true, context }).categories;
}
