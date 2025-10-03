// Codex change: Landing view for the Texts tab with Tanakh entry point.
import React from "react";
import { useContent } from "@stores/useContent";
import { getSections } from "@lib/tanakhMetadata";

export const TextsView: React.FC = () => {
  const tanakhManifest = useContent((state) => state.registry?.tanakhManifest);
  const sections = React.useMemo(() => getSections(tanakhManifest), [tanakhManifest]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Library</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Begin exploring canonical texts. More collections are on the roadmap—today you can browse the Tanakh structure.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <a
          href="#/texts/tanakh"
          className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-pomegranate hover:shadow-lg focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Tanakh</h3>
            <span className="text-sm uppercase tracking-wide text-slate-400">Available</span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Navigate Torah, Nevi'im, and Ketuvim with chapter and parsha placeholders.
          </p>
          {tanakhManifest ? (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {sections.length} sections · {sections.reduce((count, section) => count + section.books.length, 0)} books
            </p>
          ) : (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Loading metadata…</p>
          )}
        </a>
      </div>
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
        Looking for the Siddur? It now lives in its own tab so we can grow both the library and prayer experience independently.
      </p>
    </div>
  );
};
