import React, { useMemo } from "react";
import { useSettings } from "@stores/useSettings";
import { NusachSelector } from "./NusachSelector";
import { useContent } from "@stores/useContent";
import { KabbalahSystemSelector } from "../Settings/KabbalahSystemSelector";

const SECTION_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  bedtime: "Bedtime"
};

export const SiddurView: React.FC = () => {
  const { transliterationMode, setTransliterationMode } = useSettings();
  const registry = useContent((state) => state.registry);
  const prayers = registry?.siddur.basic ?? [];

  const grouped = useMemo(() => {
    return prayers.reduce<Record<string, typeof prayers>>((acc, prayer) => {
      if (!acc[prayer.section]) acc[prayer.section] = [];
      acc[prayer.section].push(prayer);
      return acc;
    }, {} as Record<string, typeof prayers>);
  }, [prayers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <NusachSelector />

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="translit-mode" className="font-medium">
            Transliteration
          </label>
          <select
            id="translit-mode"
            className="rounded-lg border border-slate-300 px-3 py-1 focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-900"
            value={transliterationMode}
            onChange={(event) => setTransliterationMode(event.target.value as typeof transliterationMode)}
          >
            <option value="ashkenazi">Ashkenazi</option>
            <option value="sephardi">Sephardi</option>
            <option value="none">Hide transliteration</option>
          </select>
        </div>

        {/* NEW: Kabbalah system selector */}
        <KabbalahSystemSelector />
      </div>

      {Object.entries(grouped).map(([section, sectionPrayers]) => (
        <section key={section} className="space-y-3">
          <header>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{SECTION_LABELS[section]}</h3>
            <p className="text-sm text-slate-500">"What am I saying?" notes follow each paragraph.</p>
          </header>
          <div className="space-y-3">
            {sectionPrayers.map((prayer) => {
              const translit =
                transliterationMode === "ashkenazi"
                  ? prayer.translitAshkenazi
                  : transliterationMode === "sephardi"
                  ? prayer.translitSephardi
                  : null;
              return (
                <article key={prayer.id} className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
                  <p className="text-right text-2xl leading-relaxed" dir="rtl">
                    {prayer.hebrew}
                  </p>
                  {translit ? (
                    <p className="mt-2 text-sm text-pomegranate" lang="en">
                      {translit}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{prayer.translation}</p>
                  {prayer.notes ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{prayer.notes}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
      {prayers.length === 0 ? (
        <p className="text-sm text-slate-500">Siddur content is loading…</p>
      ) : null}
      <p className="text-xs text-slate-500">
        Transliteration is a learning aid. For personal practice consult a rabbi to learn your community’s pronunciation.
      </p>
    </div>
  );
};
