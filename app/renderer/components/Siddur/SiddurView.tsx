// Codex change: Streamlined Siddur view to read settings and link to the dedicated Settings page.
import React, { useMemo } from "react";
import { useSettings } from "@stores/useSettings";
import { useContent } from "@stores/useContent";

const SECTION_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  bedtime: "Bedtime"
};

export const SiddurView: React.FC = () => {
  const transliterationMode = useSettings((state) => state.transliterationMode);
  const parshaCycle = useSettings((state) => state.parshaCycle);
  const setParshaCycle = useSettings((state) => state.setParshaCycle);
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
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        Prayer preferences now live in <a className="font-medium text-pomegranate underline" href="#/settings">Settings</a>.
        Adjust nusach, transliteration style, and kabbalah overlays there.
        <div className="mt-3 flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
          <span className="font-medium text-slate-700 dark:text-slate-200">Parsha cycle: Diaspora / Israel</span>
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
            {(
              [
                { value: "diaspora" as const, label: "Diaspora" },
                { value: "israel" as const, label: "Israel" }
              ]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={`px-3 py-1 text-sm font-semibold transition focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  parshaCycle === option.value
                    ? "bg-pomegranate text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                onClick={() => setParshaCycle(option.value)}
                aria-pressed={parshaCycle === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
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
