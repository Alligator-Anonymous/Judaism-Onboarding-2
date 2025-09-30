import { describe, expect, it } from "vitest";
import { gregorianToHebrew, getParashahForDate, isErevShabbat } from "@lib/hebrewCalendar";

describe("hebrewCalendar", () => {
  it("converts a known Gregorian date to the correct Hebrew date", () => {
    const date = new Date("2023-09-16T00:00:00Z"); // Rosh Hashanah 5784
    const hebrew = gregorianToHebrew(date);
    expect(hebrew.year).toBe(5784);
    expect(hebrew.monthName).toBe("Tishrei");
    expect(hebrew.day).toBe(1);
  });

  it("identifies erev Shabbat on Fridays", () => {
    const friday = new Date("2024-03-22T12:00:00Z");
    expect(isErevShabbat(friday)).toBe(true);
  });

  it("returns a parashah name for any date", () => {
    const today = new Date("2024-03-25T00:00:00Z");
    const parashah = getParashahForDate(today);
    expect(parashah).toBeTruthy();
  });
});
