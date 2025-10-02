import { differenceInCalendarDays, format } from "date-fns";
import { HebrewCalendar, HDate, Sedra } from "@hebcal/core";

export type ParshaCycle = "diaspora" | "israel";

export interface HebrewDateParts {
  year: number;
  monthName: string;
  day: number;
}

export interface ParshaOptions {
  cycle?: ParshaCycle;
}

export function getHebrewDateParts(date: Date): HebrewDateParts {
  const hdate = new HDate(date);
  return {
    year: hdate.getFullYear(),
    monthName: hdate.getMonthName("en"),
    day: hdate.getDate()
  };
}

export function formatHebrewDate(parts: HebrewDateParts): string {
  return `${parts.day} ${parts.monthName} ${parts.year}`;
}

export function getParshaForUpcomingShabbat(date: Date, options: ParshaOptions = {}): string | null {
  const shabbat = new Date(date);
  const diff = (6 - shabbat.getDay() + 7) % 7;
  if (diff !== 0) {
    shabbat.setDate(shabbat.getDate() + diff);
  }
  const inIsrael = options.cycle === "israel";
  const events = HebrewCalendar.calendar({
    start: shabbat,
    end: shabbat,
    sedra: true,
    diaspora: !inIsrael,
    israel: inIsrael
  }) as Array<{ getDesc: () => string } | undefined>;

  for (const event of events) {
    if (!event) continue;
    const description = event.getDesc();
    if (description && description.startsWith("Parashat")) {
      return description;
    }
  }

  const hdate = new HDate(shabbat);
  const sedra = new Sedra(hdate.getFullYear(), inIsrael);
  const parsha = sedra.getString(hdate);
  return parsha ? `Parashat ${parsha}` : null;
}

export function formatFriendlyGregorian(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}

export function getUpcomingHoliday(
  date: Date,
  holidays: { id: string; names: { en: string }; dates?: string[] }[]
): { id: string; name: string; daysAway: number } | null {
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

export function isErevShabbat(date: Date): boolean {
  return date.getDay() === 5;
}
