// Codex change: Section-level index for Tanakh navigation.
import React from "react";
import { useContent } from "@stores/useContent";
import { Breadcrumbs } from "./Breadcrumbs";

export const TanakhIndex: React.FC = () => {
  const tanakhMeta = useContent((state) => state.registry?.tanakhMeta);

  if (!tanakhMeta) {
    return <p className="text-sm text-slate-500">Loading Tanakh metadata…</p>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Texts", href: "#/texts" }, { label: "Tanakh", current: true }]} />
      <header className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tanakh</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Choose a section to drill down into the books of Torah, Nevi'im, or Ketuvim.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {tanakhMeta.sections.map((section) => (
          <a
            key={section.id}
            href={`#/texts/tanakh/${section.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pomegranate hover:shadow-lg focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.en}</h3>
              <span dir="rtl" className="text-base font-medium text-pomegranate">
                {section.he}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {section.books.length} book{section.books.length === 1 ? "" : "s"}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};
