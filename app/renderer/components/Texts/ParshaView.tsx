// Codex change: Placeholder parsha view with navigation controls.
import React from "react";
import { useContent } from "@stores/useContent";
import { Breadcrumbs } from "./Breadcrumbs";
import { getParshaBySlug, getPrevNextParsha } from "@lib/tanakhMetadata";

interface ParshaViewProps {
  parshaSlug: string;
}

export const ParshaView: React.FC<ParshaViewProps> = ({ parshaSlug }) => {
  const registry = useContent((state) => state.registry);
  const parsha = getParshaBySlug(registry?.parshaMeta, parshaSlug);
  const { prev, next } = getPrevNextParsha(registry?.parshaMeta, parsha?.ordinal ?? 0);

  const book = React.useMemo(() => {
    if (!parsha || !registry?.tanakhMeta) return null;
    for (const section of registry.tanakhMeta.sections) {
      const found = section.books.find((bookMeta) => bookMeta.id === parsha.bookId);
      if (found) return { section, book: found };
    }
    return null;
  }, [parsha, registry?.tanakhMeta]);

  if (!parsha) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Texts", href: "#/texts" },
            { label: "Tanakh", href: "#/texts/tanakh" },
            { label: "Torah", href: "#/texts/tanakh/torah" },
            { label: "Parshiyot", href: "#/texts/tanakh/torah/parsha" },
            { label: "Unknown parsha", current: true }
          ]}
        />
        <p className="text-sm text-red-600 dark:text-red-400">That parsha could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Texts", href: "#/texts" },
          { label: "Tanakh", href: "#/texts/tanakh" },
          { label: "Torah", href: `#/texts/tanakh/${book?.section.id ?? "torah"}` },
          { label: "Parshiyot", href: "#/texts/tanakh/torah/parsha" },
          { label: parsha.en, current: true }
        ]}
      />
      <header className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{parsha.en}</h2>
          <span dir="rtl" className="text-xl font-medium text-pomegranate">
            {parsha.he}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{parsha.ordinal} / 54</p>
      </header>
      {book ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Primary book: {book.book.en}
        </p>
      ) : null}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        Parsha content and aliyot coming soon.
      </div>
      <div className="flex flex-wrap gap-3">
        <NavButton label="Previous parsha" target={prev ? `#/texts/tanakh/torah/parsha/${prev.id}` : null} disabled={!prev} />
        <NavButton label="Next parsha" target={next ? `#/texts/tanakh/torah/parsha/${next.id}` : null} disabled={!next} />
      </div>
    </div>
  );
};

interface NavButtonProps {
  label: string;
  target: string | null;
  disabled?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ label, target, disabled }) => {
  if (disabled || !target) {
    return (
      <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 dark:border-slate-700 dark:text-slate-600">
        {label}
      </span>
    );
  }

  return (
    <a
      href={target}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:text-slate-200"
    >
      {label}
    </a>
  );
};
