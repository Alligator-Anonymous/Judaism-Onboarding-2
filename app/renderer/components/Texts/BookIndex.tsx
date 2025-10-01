// Codex change: Chapter list and parsha toggle for a Tanakh book view.
import React from "react";
import { useContent } from "@stores/useContent";
import { Breadcrumbs } from "./Breadcrumbs";
import { getBookBySlug, getChapterCount, getSectionBySlug } from "@lib/tanakhMetadata";

interface BookIndexProps {
  sectionSlug: string;
  bookSlug: string;
}

export const BookIndex: React.FC<BookIndexProps> = ({ sectionSlug, bookSlug }) => {
  const tanakhMeta = useContent((state) => state.registry?.tanakhMeta);
  const section = getSectionBySlug(tanakhMeta, sectionSlug);
  const book = getBookBySlug(section, bookSlug);
  const chapterCount = getChapterCount(book);
  const isTorah = section?.id === "torah";

  if (!tanakhMeta) {
    return <p className="text-sm text-slate-500">Loading Tanakh metadata…</p>;
  }

  if (!section || !book || chapterCount === 0) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Texts", href: "#/texts" },
            { label: "Tanakh", href: "#/texts/tanakh" },
            section ? { label: section.en, href: `#/texts/tanakh/${section.id}` } : { label: "Unknown section" },
            { label: "Unknown book", current: true }
          ]}
        />
        <p className="text-sm text-red-600 dark:text-red-400">That book was not found. Try another selection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Texts", href: "#/texts" },
          { label: "Tanakh", href: "#/texts/tanakh" },
          { label: section.en, href: `#/texts/tanakh/${section.id}` },
          { label: book.en, current: true }
        ]}
      />
      <header className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{book.en}</h2>
          <span dir="rtl" className="text-xl font-medium text-pomegranate">
            {book.he}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">Select a chapter to open the reader.</p>
      </header>
      {isTorah ? (
        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-pomegranate/10 px-4 py-2 font-semibold text-pomegranate">Chapters</span>
          <a
            href="#/texts/tanakh/torah/parsha"
            className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-pomegranate hover:text-pomegranate dark:border-slate-700 dark:text-slate-200"
          >
            Parshiyot
          </a>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: chapterCount }, (_, index) => index + 1).map((chapterNumber) => (
          <a
            key={chapterNumber}
            href={`#/texts/tanakh/${section.id}/${book.id}/${chapterNumber}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pomegranate hover:text-pomegranate hover:shadow-lg focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <span>Chapter {chapterNumber}</span>
            <span aria-hidden="true">→</span>
          </a>
        ))}
      </div>
    </div>
  );
};
