// Codex change: Ensured settings expose accessibility and kabbalah preferences for new views.
import { create } from "zustand";
import type { ParshaCycle } from "@lib/calendar";
import type { RoundingMode, TimeFormat, TwilightPreference } from "@lib/zmanim";
import type { SiddurMode, SiddurTradition } from "@/types/siddur";

export type Nusach = "ashkenaz" | "sefard" | "edot_hamizrach";
export type { SiddurTradition } from "@/types/siddur";
export type TransliterationMode = "ashkenazi" | "sephardi" | "none";

export interface ZmanimLocation {
  lat: number | null;
  lon: number | null;
}

export interface ZmanimSettings {
  locationMode: "manual" | "device";
  manualLocation: ZmanimLocation;
  deviceLocation: ZmanimLocation;
  timeZone: string | null;
  dayLengthModel: "gra" | "magenAvraham";
  dawn: TwilightPreference;
  nightfall: TwilightPreference;
  candleLightingOffsetMin: number;
  rounding: RoundingMode;
  timeFormat: TimeFormat;
}

export interface SettingsState {
  darkMode: boolean;
  largeText: boolean;
  dyslexiaFriendlyHebrew: boolean;
  nusach: Nusach;
  siddurMode: SiddurMode;
  siddurShowApplicable: boolean;
  siddurTradition: SiddurTradition;
  transliterationMode: TransliterationMode;
  kabbalahSystem: "none" | "gra" | "ari" | "ramak" | "kircher";
  parshaCycle: ParshaCycle;
  zmanim: ZmanimSettings;
  minhagProfile?: string;
  setDarkMode: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
  setDyslexiaFriendlyHebrew: (value: boolean) => void;
  setNusach: (nusach: Nusach) => void;
  setSiddurMode: (mode: SiddurMode) => void;
  setSiddurShowApplicable: (value: boolean) => void;
  setSiddurTradition: (tradition: SiddurTradition) => void;
  setTransliterationMode: (mode: TransliterationMode) => void;
  setKabbalahSystem: (system: "none" | "gra" | "ari" | "ramak" | "kircher") => void;
  setParshaCycle: (cycle: ParshaCycle) => void;
  setLocationMode: (mode: "manual" | "device") => void;
  setManualLocation: (location: ZmanimLocation) => void;
  useDeviceLocation: () => void;
  setTimeZone: (timeZone: string | null) => void;
  setDayLengthModel: (model: "gra" | "magenAvraham") => void;
  setDawnPreference: (preference: TwilightPreference) => void;
  setNightfallPreference: (preference: TwilightPreference) => void;
  setCandleLightingOffset: (minutes: number) => void;
  setZmanimRounding: (rounding: RoundingMode) => void;
  setTimeFormat: (format: TimeFormat) => void;
}

const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const defaultZmanim: ZmanimSettings = {
  locationMode: "manual",
  manualLocation: { lat: 40.7128, lon: -74.006 },
  deviceLocation: { lat: null, lon: null },
  timeZone: defaultTimeZone,
  dayLengthModel: "gra",
  dawn: { type: "fixedMinutes", value: 72 },
  nightfall: { type: "fixedMinutes", value: 72 },
  candleLightingOffsetMin: 18,
  rounding: "nearestMinute",
  timeFormat: "12h"
};

export const useSettings = create<SettingsState>((set) => ({
  darkMode: false,
  largeText: false,
  dyslexiaFriendlyHebrew: false,
  nusach: "ashkenaz",
  siddurMode: "basic",
  siddurShowApplicable: true,
  siddurTradition: "ashkenaz",
  transliterationMode: "ashkenazi",
  kabbalahSystem: "none",
  parshaCycle: "diaspora",
  zmanim: defaultZmanim,
  setDarkMode: (value) => set({ darkMode: value }),
  setLargeText: (value) => set({ largeText: value }),
  setDyslexiaFriendlyHebrew: (value) => set({ dyslexiaFriendlyHebrew: value }),
  setNusach: (nusach) => set({ nusach }),
  setSiddurMode: (mode) => set({ siddurMode: mode }),
  setSiddurShowApplicable: (value) => set({ siddurShowApplicable: value }),
  setSiddurTradition: (tradition) => set({ siddurTradition: tradition }),
  setTransliterationMode: (mode) => set({ transliterationMode: mode }),
  setKabbalahSystem: (system) => set({ kabbalahSystem: system }),
  setParshaCycle: (cycle) => set({ parshaCycle: cycle }),
  setLocationMode: (mode) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        locationMode: mode
      }
    })),
  setManualLocation: (location) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        manualLocation: location
      }
    })),
  useDeviceLocation: () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        set((state) => ({
          zmanim: {
            ...state.zmanim,
            locationMode: "device",
            deviceLocation: { lat: latitude, lon: longitude }
          }
        }));
      },
      () => {
        // Ignore errors silently; user can keep manual mode.
      },
      { enableHighAccuracy: true, maximumAge: 300_000 }
    );
  },
  setTimeZone: (timeZone) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        timeZone
      }
    })),
  setDayLengthModel: (model) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        dayLengthModel: model
      }
    })),
  setDawnPreference: (preference) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        dawn: preference
      }
    })),
  setNightfallPreference: (preference) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        nightfall: preference
      }
    })),
  setCandleLightingOffset: (minutes) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        candleLightingOffsetMin: minutes
      }
    })),
  setZmanimRounding: (rounding) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        rounding
      }
    })),
  setTimeFormat: (format) =>
    set((state) => ({
      zmanim: {
        ...state.zmanim,
        timeFormat: format
      }
    }))
}));
