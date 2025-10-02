import React from "react";
import { useContent } from "@stores/useContent";
import { Breadcrumbs } from "./Breadcrumbs";
import { getParshaBySlug, getPrevNextParsha, getSections } from "@lib/tanakhMetadata";
import { Select } from "@components/UI/Select";
import {
  composeParshaReading,
  hasTranslation,
  loadParshaRanges,
  type ParshaReading,
  type TanakhTranslationId
} from "@lib/tanakhLoader";
import type { ParshaRangeEntry } from "@/types";

const translationOptions: { id: TanakhTranslationId; label: string }[] = [
  { id: "he-taamei", label: "Hebrew (Ta'amei Hamikra)" },
  { id: "en-jps1917", label: "English (JPS 1917)" },
  { id: "ar-onqelos", label: "Targum Onqelos (Aramaic)" }
];

interface ParshaViewProps {
  parshaSlug: string;
}

export const ParshaView: React.FC<ParshaViewProps> = ({ parshaSlug }) => {
  const registry = useContent((state) => state.registry);
  const parsha = getParshaBySlug(registry?.parshaMeta, parshaSlug);
  const { prev, next } = getPrevNextParsha(registry?.parshaMeta, parsha?.ordinal ?? 0);
  const [parshaRanges, setParshaRanges] = React.useState<ParshaRangeEntry[] | null>(null);
  const [parshaRange, setParshaRange] = React.useState<ParshaRangeEntry | null>(null);
  const [reading, setReading] = React.useState<ParshaReading | null>(null);
  const [translation, setTranslation] = React.useState<TanakhTranslationId>("he-taamei");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    loadParshaRanges()
      .then((ranges) => {
        if (cancelled) return;
        setParshaRanges(ranges);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setParshaRanges([]);
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!parshaRanges) {
      setParshaRange(null);
      return;
    }
    const found = parshaRanges.find((entry) => entry.slug === parshaSlug) ?? null;
    setParshaRange(found);
  }, [parshaRanges, parshaSlug]);

  React.useEffect(() => {
    let cancelled = false;
    if (!parshaRange) {
      setReading(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    setLoading(true);
    setError(null);
    composeParshaReading(parshaRange, { translationId: translation })
      .then((result) => {
        if (cancelled) return;
        setReading(result);
        setLoading(false);
      })
      .catch((readingError) => {
        if (cancelled) return;
        setReading(null);
        setError(readingError instanceof Error ? readingError.message : String(readingError));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [parshaRange, translation]);

  const sections = React.useMemo(() => getSections(registry?.tanakhManifest), [registry?.tanakhManifest]);

  const book = React.useMemo(() => {
    if (!parsha) return null;
    for (const section of sections) {
      const found = section.books.find((bookMeta) => bookMeta.id === parsha.bookId);
      if (found) return { section, book: found };
    }
    return null;
  }, [parsha, sections]);

  const availability = React.useMemo(() => {
    const fallback = {
      "he-taamei": parshaRange ? hasTranslation(parshaRange.book, "he-taamei") : false,
      "en-jps1917": parshaRange ? hasTranslation(parshaRange.book, "en-jps1917") : false,
      "ar-onqelos": parshaRange ? hasTranslation(parshaRange.book, "ar-onqelos") : false
    };
    if (!book?.book) return fallback;
    return {
      "he-taamei": book.book.available.he ?? fallback["he-taamei"],
      "en-jps1917": book.book.available.en ?? fallback["en-jps1917"],
      "ar-onqelos": book.book.available.onqelos ?? fallback["ar-onqelos"]
    };
  }, [book?.book, parshaRange]);

  const defaultTranslation = React.useMemo<TanakhTranslationId>(() => {
    const order: TanakhTranslationId[] = ["he-taamei", "en-jps1917", "ar-onqelos"];
    for (const option of order) {
      if (availability[option]) {
        return option;
      }
    }
    return "he-taamei";
  }, [availability]);

  React.useEffect(() => {
    setTranslation(defaultTranslation);
  }, [parshaSlug, defaultTranslation]);

  React.useEffect(() => {
    if (availability[translation]) return;
    setTranslation(defaultTranslation);
  }, [availability, translation, defaultTranslation]);

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

  const aliyahStarts = React.useMemo(() => {
    const starts = new Map<string, number>();
    if (reading?.aliyot) {
      for (const aliyah of reading.aliyot) {
        starts.set(`${aliyah.start.c}:${aliyah.start.v}`, aliyah.n);
      }
    }
    return starts;
  }, [reading]);

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
      <section className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="parsha-translation">
          Translation
        </label>
        <Select
          id="parsha-translation"
          value={translation}
          onChange={(event) => setTranslation(event.target.value as TanakhTranslationId)}
        >
          {translationOptions.map((option) => (
            <option key={option.id} value={option.id} disabled={!availability[option.id]}>
              {option.label}
              {!availability[option.id] ? " (Unavailable)" : ""}
            </option>
          ))}
        </Select>
      </section>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading parsha text…</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : !reading || reading.tokens.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No text available for this parsha.</p>
        ) : (
          <ol dir={reading.direction} className="space-y-4 text-lg leading-relaxed">
            {reading.tokens.map((token) => {
              const aliyah = aliyahStarts.get(`${token.c}:${token.v}`);
              return (
                <li key={`${token.c}:${token.v}`} className="space-y-2">
                  {aliyah ? (
                    <div className="inline-flex rounded-full bg-pomegranate/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pomegranate dark:bg-pomegranate/20">
                      Aliyah {aliyah}
                    </div>
                  ) : null}
                  <div className="rounded-lg bg-slate-50 p-3 leading-loose text-slate-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-pomegranate/10 text-xs font-semibold text-pomegranate dark:bg-pomegranate/20">
                      {token.c}:{token.v}
                    </span>
                    <div className="space-y-1">
                      <span>{token.primary ?? "—"}</span>
                      {token.secondary ? (
                        <p className="text-sm text-slate-600 dark:text-slate-300" dir="ltr">
                          {token.secondary}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
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
