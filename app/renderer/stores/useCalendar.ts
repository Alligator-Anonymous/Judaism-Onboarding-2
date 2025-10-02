import { create } from "zustand";
import { calculateZmanim, formatTime } from "@lib/zmanim";
import {
  formatHebrewDate,
  getHebrewDateParts,
  getParshaForUpcomingShabbat,
  getUpcomingHoliday,
  isErevShabbat
} from "@lib/calendar";
import { useSettings } from "./useSettings";
import type { Holiday } from "@/types";

interface CalendarState {
  date: Date;
  hebrewDate: string;
  parashah: string;
  zmanim: {
    sunrise: string;
    sunset: string;
    dawn: string;
    nightfall: string;
  };
  upcomingHoliday: { name: string; daysAway: number } | null;
  isShabbatEve: boolean;
  refresh: (holidays: Holiday[]) => void;
}

function formatZmanim(date: Date, timezone: string) {
  const { sunrise, sunset, dawn, nightfall } = calculateZmanim(date, useSettings.getState());
  return {
    sunrise: formatTime(sunrise, timezone),
    sunset: formatTime(sunset, timezone),
    dawn: formatTime(dawn, timezone),
    nightfall: formatTime(nightfall, timezone)
  };
}

export const useCalendar = create<CalendarState>((set) => ({
  date: new Date(),
  hebrewDate: "",
  parashah: "",
  zmanim: {
    sunrise: "",
    sunset: "",
    dawn: "",
    nightfall: ""
  },
  upcomingHoliday: null,
  isShabbatEve: false,
  refresh: (holidays) => {
    const now = new Date();
    const settings = useSettings.getState();
    const hebrew = getHebrewDateParts(now);
    const parashah =
      getParshaForUpcomingShabbat(now, { cycle: settings.parshaCycle }) ?? "";
    const zmanim = formatZmanim(now, settings.location.timezone);
    const upcoming = getUpcomingHoliday(now, holidays.map((h) => ({ ...h, dates: h.dates })));
    set({
      date: now,
      hebrewDate: formatHebrewDate(hebrew),
      parashah,
      zmanim,
      upcomingHoliday: upcoming ? { name: upcoming.name, daysAway: upcoming.daysAway } : null,
      isShabbatEve: isErevShabbat(now)
    });
  }
}));
