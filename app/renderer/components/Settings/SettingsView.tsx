// Codex change: Introduced a consolidated Settings page for preferences and accessibility.
import React from "react";
import { Select } from "@components/UI/Select";
import { NusachSelector } from "@components/Siddur/NusachSelector";
import { KabbalahSystemSelector } from "./KabbalahSystemSelector";
import { useSettings } from "@stores/useSettings";

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
