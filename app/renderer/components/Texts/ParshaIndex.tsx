// Codex change: Full parsha listing with links into the placeholder views.
import React from "react";
import { useContent } from "@stores/useContent";
import { Breadcrumbs } from "./Breadcrumbs";

export const ParshaIndex: React.FC = () => {
  const registry = useContent((state) => state.registry);
  const parshiot = React.useMemo(() => {
    if (!registry?.parshaMeta) return [];
    return [...registry.parshaMeta].sort((a, b) => a.ordinal - b.ordinal);
  }, [registry?.parshaMeta]);

  const bookLookup = React.useMemo(() => {
    const lookup = new Map<string, { he: string; en: string }>();
    registry?.tanakhManifest?.books.forEach((book) => {
      lookup.set(book.slug, { he: book.heTitle ?? book.title, en: book.title });
    });
    return lookup;
  }, [registry?.tanakhManifest]);

  if (!registry?.parshaMeta?.length) {
    return <p className="text-sm text-slate-500">Loading parsha metadata…</p>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Texts", href: "#/texts" },
          { label: "Tanakh", href: "#/texts/tanakh" },
          { label: "Torah", href: "#/texts/tanakh/torah" },
          { label: "Parshiyot", current: true }
        ]}
      />
      <header className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Parsha Index</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Browse all weekly Torah portions by their traditional order.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {parshiot.map((parsha) => {
          const book = bookLookup.get(parsha.bookId);
          return (
            <a
              key={parsha.id}
              href={`#/texts/tanakh/torah/parsha/${parsha.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-pomegranate hover:shadow-lg focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{parsha.ordinal} / 54</span>
                <span dir="rtl" className="text-base font-medium text-pomegranate">
                  {parsha.he}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{parsha.en}</h3>
              {book ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">{book.en}</p>
              ) : null}
            </a>
          );
        })}
      </div>
    </div>
  );
};
