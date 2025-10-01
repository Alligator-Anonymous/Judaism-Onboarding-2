import { create } from "zustand";

export type Nusach = "ashkenaz" | "sefard" | "edot-mizrach";
export type TransliterationMode = "ashkenazi" | "sephardi" | "none";

export interface LocationSettings {
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ZmanimOffsets {
  dawnOffsetMinutes: number;
  nightfallOffsetMinutes: number;
}

export interface SettingsState {
  darkMode: boolean;
  largeText: boolean;
  dyslexiaFriendlyHebrew: boolean;
  nusach: Nusach;
  transliterationMode: TransliterationMode;
  kabbalahSystem: "none" | "gra" | "ari" | "ramak" | "kircher";
  location: LocationSettings;
  zmanimOffsets: ZmanimOffsets;
  minhagProfile?: string; // reserved for future customisations
  setDarkMode: (value: boolean) => void;
  setLargeText: (value: boolean) => void;
  setDyslexiaFriendlyHebrew: (value: boolean) => void;
  setNusach: (nusach: Nusach) => void;
  setTransliterationMode: (mode: TransliterationMode) => void;
  setKabbalahSystem: (system: "none" | "gra" | "ari" | "ramak" | "kircher") => void;
  setLocation: (location: LocationSettings) => void;
  setZmanimOffsets: (offsets: ZmanimOffsets) => void;
}

const defaultLocation: LocationSettings = {
  latitude: 40.7128,
  longitude: -74.006,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
};

export const useSettings = create<SettingsState>((set) => ({
  darkMode: false,
  largeText: false,
  dyslexiaFriendlyHebrew: false,
  nusach: "ashkenaz",
  transliterationMode: "ashkenazi",
  kabbalahSystem: "none",
  location: defaultLocation,
  zmanimOffsets: {
    dawnOffsetMinutes: -72,
    nightfallOffsetMinutes: 40
  },
  setDarkMode: (value) => set({ darkMode: value }),
  setLargeText: (value) => set({ largeText: value }),
  setDyslexiaFriendlyHebrew: (value) => set({ dyslexiaFriendlyHebrew: value }),
  setNusach: (nusach) => set({ nusach }),
  setTransliterationMode: (mode) => set({ transliterationMode: mode }),
  setKabbalahSystem: (system) => set({ kabbalahSystem: system }),
  setLocation: (location) => set({ location }),
  setZmanimOffsets: (offsets) => set({ zmanimOffsets: offsets })
}));
