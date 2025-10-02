// Codex change: Introduced a consolidated Settings page for preferences and accessibility.
import React from "react";
import { Select } from "@components/UI/Select";
import { NusachSelector } from "@components/Siddur/NusachSelector";
import { KabbalahSystemSelector } from "./KabbalahSystemSelector";
import { useSettings } from "@stores/useSettings";
import type { TwilightPreference } from "@lib/zmanim";

const transliterationLabels = {
  ashkenazi: "Ashkenazi",
  sephardi: "Sephardi",
  none: "Hide transliteration"
} as const;

type TransliterationKey = keyof typeof transliterationLabels;

export const SettingsView: React.FC = () => {
  const transliterationMode = useSettings((state) => state.transliterationMode);
  const setTransliterationMode = useSettings((state) => state.setTransliterationMode);
  const largeText = useSettings((state) => state.largeText);
  const setLargeText = useSettings((state) => state.setLargeText);
  const dyslexiaFriendlyHebrew = useSettings((state) => state.dyslexiaFriendlyHebrew);
  const setDyslexiaFriendlyHebrew = useSettings((state) => state.setDyslexiaFriendlyHebrew);
  const zmanimSettings = useSettings((state) => state.zmanim);
  const setLocationMode = useSettings((state) => state.setLocationMode);
  const setManualLocation = useSettings((state) => state.setManualLocation);
  const useDeviceLocation = useSettings((state) => state.useDeviceLocation);
  const setTimeZone = useSettings((state) => state.setTimeZone);
  const setDayLengthModel = useSettings((state) => state.setDayLengthModel);
  const setDawnPreference = useSettings((state) => state.setDawnPreference);
  const setNightfallPreference = useSettings((state) => state.setNightfallPreference);
  const setCandleLightingOffset = useSettings((state) => state.setCandleLightingOffset);
  const setZmanimRounding = useSettings((state) => state.setZmanimRounding);
  const setTimeFormat = useSettings((state) => state.setTimeFormat);

  const encodeTwilight = (pref: TwilightPreference) => `${pref.type}:${pref.value}`;

  const handleTwilightChange = (value: string): TwilightPreference => {
    const [type, amount] = value.split(":");
    return { type: type as TwilightPreference["type"], value: Number(amount) };
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tailor Derech for your community’s practice and personal comfort. Changes apply instantly.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Prayer customs</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Choose the nusach and transliteration style that matches your teacher or community.
            </p>
            <div className="space-y-4">
              <NusachSelector />
              <label className="block space-y-2 text-sm">
                <span className="font-medium">Transliteration</span>
                <Select
                  value={transliterationMode}
                  onChange={(event) => setTransliterationMode(event.target.value as TransliterationKey)}
                >
                  {(Object.keys(transliterationLabels) as TransliterationKey[]).map((key) => (
                    <option key={key} value={key}>
                      {transliterationLabels[key]}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mystical overlays</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Show or hide kabbalistic correspondences when studying the Alef-Bet.
            </p>
            <KabbalahSystemSelector />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Calendar & Times (Zmanim)</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Configure your location and preferred halachic opinions so the Today screen shows accurate times.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Location mode</span>
              <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
                {["manual", "device"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`px-3 py-1 text-sm font-semibold transition focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                      zmanimSettings.locationMode === mode
                        ? "bg-pomegranate text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => {
                      setLocationMode(mode as "manual" | "device");
                      if (mode === "device") {
                        useDeviceLocation();
                      }
                    }}
                    aria-pressed={zmanimSettings.locationMode === mode}
                  >
                    {mode === "manual" ? "Manual" : "Use device"}
                  </button>
                ))}
              </div>
              {zmanimSettings.locationMode === "device" ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We’ll request your browser’s approximate location (no network calls). If permission is denied, stay in manual mode.
                </p>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Latitude</span>
                <input
                  type="number"
                  step="0.0001"
                  value={zmanimSettings.manualLocation.lat ?? ""}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const parsed = Number(raw);
                    setManualLocation({
                      lat: raw === "" || Number.isNaN(parsed) ? null : parsed,
                      lon: zmanimSettings.manualLocation.lon
                    });
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-900"
                  disabled={zmanimSettings.locationMode === "device"}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Longitude</span>
                <input
                  type="number"
                  step="0.0001"
                  value={zmanimSettings.manualLocation.lon ?? ""}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const parsed = Number(raw);
                    setManualLocation({
                      lat: zmanimSettings.manualLocation.lat,
                      lon: raw === "" || Number.isNaN(parsed) ? null : parsed
                    });
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-900"
                  disabled={zmanimSettings.locationMode === "device"}
                />
              </label>
            </div>
            {zmanimSettings.locationMode === "device" ? (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-pomegranate px-3 py-1.5 text-sm font-semibold text-pomegranate transition hover:bg-pomegranate/10 focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/50"
                onClick={() => useDeviceLocation()}
              >
                Refresh device location
              </button>
            ) : null}
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Time zone</span>
              <input
                type="text"
                value={zmanimSettings.timeZone ?? ""}
                onChange={(event) => setTimeZone(event.target.value || null)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-900"
                placeholder="e.g., America/New_York"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Day-length model</span>
              <Select
                value={zmanimSettings.dayLengthModel}
                onChange={(event) => setDayLengthModel(event.target.value as "gra" | "magenAvraham")}
              >
                <option value="gra">Gra (sunrise to sunset)</option>
                <option value="magenAvraham">Magen Avraham (dawn to nightfall)</option>
              </Select>
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Dawn preset</span>
              <Select
                value={encodeTwilight(zmanimSettings.dawn)}
                onChange={(event) => setDawnPreference(handleTwilightChange(event.target.value))}
              >
                <option value="fixedMinutes:72">72 minutes before sunrise</option>
                <option value="fixedMinutes:90">90 minutes before sunrise</option>
                <option value="fixedMinutes:96">96 minutes before sunrise</option>
                <option value="degrees:16.1">16.1° below horizon</option>
                <option value="degrees:19.8">19.8° below horizon</option>
                <option value="degrees:26">26° below horizon</option>
              </Select>
            </label>
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Nightfall preset</span>
              <Select
                value={encodeTwilight(zmanimSettings.nightfall)}
                onChange={(event) => setNightfallPreference(handleTwilightChange(event.target.value))}
              >
                <option value="fixedMinutes:72">72 minutes after sunset</option>
                <option value="fixedMinutes:90">90 minutes after sunset</option>
                <option value="fixedMinutes:96">96 minutes after sunset</option>
                <option value="degrees:16.1">16.1° below horizon</option>
                <option value="degrees:19.8">19.8° below horizon</option>
                <option value="degrees:26">26° below horizon</option>
              </Select>
            </label>
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Candle-lighting offset (minutes)</span>
              <input
                type="number"
                value={zmanimSettings.candleLightingOffsetMin}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  setCandleLightingOffset(Number.isNaN(parsed) ? 0 : parsed);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Time format</span>
                <Select value={zmanimSettings.timeFormat} onChange={(event) => setTimeFormat(event.target.value as "12h" | "24h")}>
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </Select>
              </label>
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">Rounding</span>
                <Select value={zmanimSettings.rounding} onChange={(event) => setZmanimRounding(event.target.value as "none" | "nearestMinute")}>
                  <option value="nearestMinute">Nearest minute</option>
                  <option value="none">Show seconds</option>
                </Select>
              </label>
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Accessibility</h3>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={largeText}
              onChange={(event) => setLargeText(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-pomegranate focus:outline-none focus:ring-pomegranate"
            />
            <span>
              <span className="block font-medium text-slate-900 dark:text-slate-100">Large text</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Increase the overall font scale for easier reading.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={dyslexiaFriendlyHebrew}
              onChange={(event) => setDyslexiaFriendlyHebrew(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-pomegranate focus:outline-none focus:ring-pomegranate"
            />
            <span>
              <span className="block font-medium text-slate-900 dark:text-slate-100">Dyslexia-friendly Hebrew</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Add spacing and disable ligatures for Hebrew text blocks across the app.
              </span>
            </span>
          </label>
        </div>
      </section>
    </div>
  );
};
