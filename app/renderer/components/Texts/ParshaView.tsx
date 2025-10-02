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
import { copyText } from "@lib/clipboard";

const translationOptions: { id: TanakhTranslationId; label: string }[] = [
  { id: "en-jps1917", label: "English (JPS 1917)" },
  { id: "he-taamei", label: "Hebrew (Ta'amei Hamikra)" },
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
  const [translation, setTranslation] = React.useState<TanakhTranslationId>("en-jps1917");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = React.useState<Set<number>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number | null>(null);
  const [copyMessage, setCopyMessage] = React.useState<string | null>(null);

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

  const bookNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const section of sections) {
      for (const entry of section.books) {
        map.set(entry.id, entry.en);
      }
    }
    return map;
  }, [sections]);

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
    const order: TanakhTranslationId[] = ["en-jps1917", "he-taamei", "ar-onqelos"];
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

  React.useEffect(() => {
    setSelectedIndices(new Set());
    setLastSelectedIndex(null);
    setCopyMessage(null);
  }, [parshaSlug, translation, reading?.tokens?.length]);

  React.useEffect(() => {
    if (!copyMessage) return;
    const timer = window.setTimeout(() => setCopyMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [copyMessage]);

  const selectedIndexList = React.useMemo(() => {
    return Array.from(selectedIndices).sort((a, b) => a - b);
  }, [selectedIndices]);

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

  const tokens = reading?.tokens ?? [];
  const selectedCount = selectedIndexList.length;
  const defaultParshaBookTitle = book?.book.en ?? "";

  const formatTokenForCopy = React.useCallback(
    (index: number) => {
      const token = tokens[index];
      if (!token) return null;
      const bookLabel = bookNameMap.get(token.bookId) ?? defaultParshaBookTitle || token.bookId;
      const reference = `${bookLabel} ${token.c}:${token.v}`;
      const lines = [reference];
      if (token.primary) {
        lines.push(token.primary.trim());
      }
      if (token.secondary) {
        lines.push(token.secondary.trim());
      }
      return lines.join("\n");
    },
    [bookNameMap, defaultParshaBookTitle, tokens]
  );

  const handleCopyToken = React.useCallback(
    async (index: number) => {
      const text = formatTokenForCopy(index);
      if (!text) return;
      try {
        await copyText(text);
        const token = tokens[index];
        if (token) {
          const bookLabel = bookNameMap.get(token.bookId) ?? defaultParshaBookTitle || token.bookId;
          setCopyMessage(`Copied ${bookLabel} ${token.c}:${token.v}`);
        } else {
          setCopyMessage(`Copied verse from ${parsha.en}.`);
        }
      } catch (copyError) {
        setCopyMessage("Copy failed. Try using your device’s copy command.");
      }
    },
    [bookNameMap, defaultParshaBookTitle, formatTokenForCopy, parsha.en, tokens]
  );

  const handleCopySelectedTokens = React.useCallback(async () => {
    const chunks = selectedIndexList
      .map((index) => formatTokenForCopy(index))
      .filter((value): value is string => Boolean(value));
    if (chunks.length === 0) return;
    try {
      await copyText(chunks.join("\n\n"));
      setCopyMessage(`Copied ${chunks.length} verse${chunks.length === 1 ? "" : "s"} from ${parsha.en}.`);
    } catch (copyError) {
      setCopyMessage("Copy failed. Try using your device’s copy command.");
    }
  }, [formatTokenForCopy, parsha.en, selectedIndexList]);

  const toggleTokenSelection = React.useCallback(
    (index: number, shiftKey: boolean) => {
      setSelectedIndices((previous) => {
        const next = new Set(previous);
        if (shiftKey && lastSelectedIndex !== null && lastSelectedIndex !== index) {
          const [start, end] = index > lastSelectedIndex ? [lastSelectedIndex, index] : [index, lastSelectedIndex];
          for (let cursor = start; cursor <= end; cursor += 1) {
            next.add(cursor);
          }
        } else if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
      setLastSelectedIndex(index);
    },
    [lastSelectedIndex]
  );

  const handleTokenCheckboxChange = React.useCallback(
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const nativeEvent = event.nativeEvent as MouseEvent | KeyboardEvent;
      const shiftKey = Boolean(nativeEvent?.shiftKey);
      toggleTokenSelection(index, shiftKey);
    },
    [toggleTokenSelection]
  );

  const clearTokenSelection = React.useCallback(() => {
    setSelectedIndices(new Set());
    setLastSelectedIndex(null);
  }, []);

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
        ) : !reading || tokens.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No text available for this parsha.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select verses to copy them together, or copy any verse instantly.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopySelectedTokens()}
                  disabled={selectedCount === 0}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring focus-visible:ring-pomegranate ${
                    selectedCount === 0
                      ? "cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600"
                      : "border-pomegranate/40 text-pomegranate hover:bg-pomegranate/10"
                  }`}
                >
                  Copy selected{selectedCount ? ` (${selectedCount})` : ""}
                </button>
                {selectedCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearTokenSelection}
                    className="rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:text-slate-200"
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>
            </div>
            {copyMessage ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{copyMessage}</p>
            ) : null}
            <ol dir={reading.direction} className="space-y-4 text-lg leading-relaxed">
              {tokens.map((token, index) => {
                const aliyah = aliyahStarts.get(`${token.c}:${token.v}`);
                const isSelected = selectedIndices.has(index);
                const verseId = `parsha-verse-${token.c}-${token.v}-${index}`;
                return (
                  <li key={`${token.c}:${token.v}`} className="space-y-2">
                    {aliyah ? (
                      <div className="inline-flex rounded-full bg-pomegranate/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pomegranate dark:bg-pomegranate/20">
                        Aliyah {aliyah}
                      </div>
                    ) : null}
                    <div
                      className={`space-y-2 rounded-lg border p-3 leading-loose shadow-sm transition ${
                        isSelected
                          ? "border-pomegranate/60 bg-pomegranate/10 dark:border-pomegranate/70 dark:bg-pomegranate/20"
                          : "border-transparent bg-slate-50 dark:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <input
                            id={verseId}
                            type="checkbox"
                            checked={isSelected}
                            onChange={handleTokenCheckboxChange(index)}
                            className="h-4 w-4 rounded border-slate-300 text-pomegranate focus:ring-pomegranate dark:border-slate-600"
                            aria-label={`Select verse ${token.c}:${token.v}`}
                          />
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pomegranate/10 text-xs font-semibold text-pomegranate dark:bg-pomegranate/20">
                            {token.c}:{token.v}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleCopyToken(index)}
                          className="rounded-full border border-transparent px-2 py-1 text-xs font-semibold text-pomegranate transition hover:border-pomegranate/40 hover:bg-pomegranate/10 focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/40"
                          aria-label={`Copy verse ${token.c}:${token.v}`}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="space-y-1 pl-10">
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
          </div>
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
