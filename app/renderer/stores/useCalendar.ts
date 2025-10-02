import { create } from "zustand";
import {
  formatHebrewDate,
  getHebrewDateParts,
  getParshaForUpcomingShabbat,
  getUpcomingHoliday,
  isErevShabbat,
  type ParshaSummary
} from "@lib/calendar";
import { useSettings } from "./useSettings";
import type { Holiday } from "@/types";

interface CalendarState {
  date: Date;
  hebrewDate: string;
  parashah: ParshaSummary | null;
  upcomingHoliday: { name: string; daysAway: number } | null;
  isShabbatEve: boolean;
  refresh: (holidays: Holiday[]) => void;
}

export const useCalendar = create<CalendarState>((set) => ({
  date: new Date(),
  hebrewDate: "",
  parashah: null,
  upcomingHoliday: null,
  isShabbatEve: false,
  refresh: (holidays) => {
    const now = new Date();
    const settings = useSettings.getState();
    const hebrew = getHebrewDateParts(now);
    const parashah = getParshaForUpcomingShabbat(now, {
      cycle: settings.parshaCycle
    });
    const upcoming = getUpcomingHoliday(now, holidays.map((h) => ({ ...h, dates: h.dates })));
    set({
      date: now,
      hebrewDate: formatHebrewDate(hebrew),
      parashah: parashah ?? null,
      upcomingHoliday: upcoming ? { name: upcoming.name, daysAway: upcoming.daysAway } : null,
      isShabbatEve: isErevShabbat(now)
    });
  }
}));
