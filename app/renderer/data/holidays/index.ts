import type { Holiday } from "@/types";
import shabbat from "./shabbat.json";
import roshChodesh from "./rosh-chodesh.json";

const upcomingShabbatDates = (() => {
  const results: string[] = [];
  const today = new Date();
  const base = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  for (let i = 0; i < 8; i += 1) {
    const candidate = new Date(base);
    candidate.setUTCDate(candidate.getUTCDate() + i);
    if (candidate.getUTCDay() === 6) {
      results.push(candidate.toISOString());
    }
  }
  return results;
})();

const roshChodeshDates = ["2024-04-09T00:00:00.000Z", "2024-05-09T00:00:00.000Z"];

export const holidays: Holiday[] = [
  { ...shabbat, dates: upcomingShabbatDates },
  { ...roshChodesh, dates: roshChodeshDates }
];
