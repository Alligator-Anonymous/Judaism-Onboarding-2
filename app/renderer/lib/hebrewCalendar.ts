import { differenceInCalendarDays, format } from "date-fns";

export interface HebrewDate {
  year: number;
  month: number;
  monthName: string;
  day: number;
  isLeapYear: boolean;
  hebrew: string;
}

const HEBREW_MONTHS = [
  "Tishrei",
  "Cheshvan",
  "Kislev",
  "Tevet",
  "Shevat",
  "Adar I",
  "Adar II",
  "Nisan",
  "Iyar",
  "Sivan",
  "Tammuz",
  "Av",
  "Elul"
];

const PARASHOT = [
  "Bereshit",
  "Noach",
  "Lech-Lecha",
  "Vayera",
  "Chayei Sarah",
  "Toldot",
  "Vayetzei",
  "Vayishlach",
  "Vayeshev",
  "Miketz",
  "Vayigash",
  "Vayechi",
  "Shemot",
  "Vaera",
  "Bo",
  "Beshalach",
  "Yitro",
  "Mishpatim",
  "Terumah",
  "Tetzaveh",
  "Ki Tisa",
  "Vayakhel",
  "Pekudei",
  "Vayikra",
  "Tzav",
  "Shmini",
  "Tazria",
  "Metzora",
  "Achrei Mot",
  "Kedoshim",
  "Emor",
  "Behar",
  "Bechukotai",
  "Bamidbar",
  "Naso",
  "Beha'alotcha",
  "Shlach",
  "Korach",
  "Chukat",
  "Balak",
  "Pinchas",
  "Matot",
  "Masei",
  "Devarim",
  "Vaetchanan",
  "Eikev",
  "Re'eh",
  "Shoftim",
  "Ki Tetze",
  "Ki Tavo",
  "Nitzavim",
  "Vayelech",
  "Ha'Azinu",
  "Vezot Haberachah"
];

const HEBREW_NUMERALS = [
  "",
  "א",
  "ב",
  "ג",
  "ד",
  "ה",
  "ו",
  "ז",
  "ח",
  "ט",
  "י",
  "יא",
  "יב",
  "יג",
  "יד",
  "טו",
  "טז",
  "יז",
  "יח",
  "יט",
  "כ",
  "כא",
  "כב",
  "כג",
  "כד",
  "כה",
  "כו",
  "כז",
  "כח",
  "כט",
  "ל"
];

function isHebrewLeapYear(year: number): boolean {
  return ((7 * year + 1) % 19) < 7;
}

function monthsElapsed(year: number): number {
  const months = Math.floor((235 * year - 234) / 19);
  const parts = 204 + 793 * (months % 1080);
  const hours = 5 + 12 * months + 793 * Math.floor(months / 1080) + Math.floor(parts / 1080);
  let day = 1 + 29 * months + Math.floor(hours / 24);
  let partsRemaining = 1080 * (hours % 24) + (parts % 1080);

  if (
    partsRemaining >= 19440 ||
    ((day % 7) === 2 && partsRemaining >= 9924 && !isHebrewLeapYear(year)) ||
    ((day % 7) === 1 && partsRemaining >= 16789 && isHebrewLeapYear(year - 1))
  ) {
    day += 1;
  }

  if ([0, 3, 5].includes(day % 7)) {
    day += 1;
  }

  return day;
}

function roshHashanahAbsolute(year: number): number {
  return monthsElapsed(year);
}

function daysInHebrewYear(year: number): number {
  return roshHashanahAbsolute(year + 1) - roshHashanahAbsolute(year);
}

function lastMonthOfYear(year: number): number {
  return isHebrewLeapYear(year) ? 13 : 12;
}

function daysInHebrewMonth(year: number, month: number): number {
  if (month === 2 && !isHebrewLeapYear(year) && ((daysInHebrewYear(year) % 10) === 5)) {
    return 29; // Cheshvan short in deficient years
  }
  if (month === 3 && !isHebrewLeapYear(year) && ((daysInHebrewYear(year) % 10) === 3)) {
    return 30; // Kislev long in complete years
  }

  const thirtyDayMonths = [1, 3, 5, 7, 9, 11];
  if (isHebrewLeapYear(year)) {
    thirtyDayMonths.push(6);
  }
  return thirtyDayMonths.includes(month) ? 30 : 29;
}

function absoluteFromGregorian(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const n = Math.floor((m - 14) / 12);
  return (
    Math.floor(1461 * (y + 4800 + n) / 4) +
    Math.floor(367 * (m - 2 - 12 * n) / 12) -
    Math.floor(3 * Math.floor((y + 4900 + n) / 100) / 4) +
    d -
    32075
  );
}

function absoluteToHebrew(abs: number): { year: number; month: number; day: number } {
  let year = Math.floor((abs - 347995.5) / 365.246822206) + 1;
  while (abs >= roshHashanahAbsolute(year + 1)) {
    year += 1;
  }
  while (abs < roshHashanahAbsolute(year)) {
    year -= 1;
  }
  const dayOfYear = abs - roshHashanahAbsolute(year) + 1;
  let month = 1;
  while (month <= lastMonthOfYear(year)) {
    const days = daysInHebrewMonth(year, month);
    if (dayOfYear <= cumulativeDays(year, month)) {
      const previousCumulative = cumulativeDays(year, month - 1);
      const day = dayOfYear - previousCumulative;
      return { year, month, day };
    }
    month += 1;
  }
  return { year, month: lastMonthOfYear(year), day: dayOfYear - cumulativeDays(year, lastMonthOfYear(year) - 1) };
}

function cumulativeDays(year: number, month: number): number {
  let total = 0;
  for (let m = 1; m <= month; m += 1) {
    total += daysInHebrewMonth(year, m);
  }
  return total;
}

export function gregorianToHebrew(date: Date): HebrewDate {
  const abs = absoluteFromGregorian(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
  const { year, month, day } = absoluteToHebrew(abs);
  const monthName = HEBREW_MONTHS[month - 1] ?? "Unknown";
  return {
    year,
    month,
    monthName,
    day,
    isLeapYear: isHebrewLeapYear(year),
    hebrew: `${HEBREW_NUMERALS[day]} ${monthName} ${year}`
  };
}

export function formatHebrewDate(date: HebrewDate): string {
  return `${date.hebrew}`;
}

export function formatFriendlyGregorian(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}

export function getParashahForDate(date: Date): string {
  const roshHashanah = hebrewNewYearForDate(date);
  const weeks = Math.floor(differenceInCalendarDays(date, roshHashanah) / 7);
  return PARASHOT[weeks % PARASHOT.length] ?? PARASHOT[0];
}

function hebrewNewYearForDate(date: Date): Date {
  const hebrewDate = gregorianToHebrew(date);
  const hebrewNewYear = absoluteToGregorian(roshHashanahAbsolute(hebrewDate.year));
  return hebrewNewYear;
}

function absoluteToGregorian(abs: number): Date {
  let l = abs + 68569;
  const n = Math.floor(4 * l / 146097);
  l = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor(4000 * (l + 1) / 1461001);
  l = l - Math.floor(1461 * i / 4) + 31;
  const j = Math.floor(80 * l / 2447);
  const day = l - Math.floor(2447 * j / 80);
  l = Math.floor(j / 11);
  const month = j + 2 - 12 * l;
  const year = 100 * (n - 49) + i + l;
  return new Date(Date.UTC(year, month - 1, day));
}

export function getUpcomingHoliday(date: Date, holidays: { id: string; names: { en: string }; dates?: string[] }[]):
  | { id: string; name: string; daysAway: number }
  | null {
  let closest: { id: string; name: string; daysAway: number } | null = null;
  holidays.forEach((holiday) => {
    if (!holiday.dates) return;
    holiday.dates.forEach((iso) => {
      const holidayDate = new Date(iso);
      const diff = differenceInCalendarDays(holidayDate, date);
      if (diff >= 0 && (closest === null || diff < closest.daysAway)) {
        closest = { id: holiday.id, name: holiday.names.en, daysAway: diff };
      }
    });
  });
  return closest;
}

export function hebrewWeekday(date: Date): string {
  const weekdays = ["Yom Rishon", "Yom Sheini", "Yom Shlishi", "Yom Revi'i", "Yom Chamishi", "Yom Shishi", "Yom Shabbat"];
  return weekdays[date.getDay()];
}

export function isErevShabbat(date: Date): boolean {
  return date.getDay() === 5;
}

export function isShabbat(date: Date): boolean {
  return date.getDay() === 6;
}

export function hebrewCalendarSummary(date: Date): { hebrewDate: HebrewDate; parashah: string } {
  const hebrewDate = gregorianToHebrew(date);
  return {
    hebrewDate,
    parashah: getParashahForDate(date)
  };
}
