// Codex change: Book listing for a given Tanakh section.
import React from "react";
import { useContent } from "@stores/useContent";
import { Breadcrumbs } from "./Breadcrumbs";
import { getSectionBySlug } from "@lib/tanakhMetadata";

interface SectionIndexProps {
  sectionSlug: string;
}

export const SectionIndex: React.FC<SectionIndexProps> = ({ sectionSlug }) => {
  const tanakhMeta = useContent((state) => state.registry?.tanakhMeta);
  const section = getSectionBySlug(tanakhMeta, sectionSlug);

  if (!tanakhMeta) {
    return <p className="text-sm text-slate-500">Loading Tanakh metadata…</p>;
  }

  if (!section) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: "Texts", href: "#/texts" }, { label: "Tanakh", href: "#/texts/tanakh" }, { label: "Unknown section", current: true }]} />
        <p className="text-sm text-red-600 dark:text-red-400">That section was not found. Please choose another.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Texts", href: "#/texts" },
          { label: "Tanakh", href: "#/texts/tanakh" },
          { label: section.en, current: true }
        ]}
      />
      <header className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{section.en}</h2>
          <span dir="rtl" className="text-xl font-medium text-pomegranate">
            {section.he}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Choose a book to explore its chapters.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {section.books.map((book) => (
          <a
            key={book.id}
            href={`#/texts/tanakh/${section.id}/${book.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pomegranate hover:shadow-lg focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{book.en}</h3>
              <span dir="rtl" className="text-base font-medium text-pomegranate">
                {book.he}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {book.chapters} chapter{book.chapters === 1 ? "" : "s"}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};
