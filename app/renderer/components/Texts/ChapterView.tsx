import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Select } from "@components/UI/Select";
import { useContent } from "@stores/useContent";
import { getBookBySlug, getChapterCount, getSectionBySlug } from "@lib/tanakhMetadata";
import {
  getChapterCountFromBook,
  hasTranslation,
  loadBook,
  type LoadedTanakhBook,
  type TanakhTranslationId
} from "@lib/tanakhLoader";
import { copyText } from "@lib/clipboard";

const translationOptions: { id: TanakhTranslationId; label: string }[] = [
  { id: "en-jps1917", label: "English (JPS 1917)" },
  { id: "he-taamei", label: "Hebrew (Ta'amei Hamikra)" },
  { id: "ar-onqelos", label: "Targum Onqelos (Aramaic)" }
];

interface ChapterViewProps {
  sectionSlug: string;
  bookSlug: string;
  chapterNumber: number;
}

export const ChapterView: React.FC<ChapterViewProps> = ({ sectionSlug, bookSlug, chapterNumber }) => {
  const registry = useContent((state) => state.registry);
  const section = getSectionBySlug(registry?.tanakhManifest, sectionSlug);
  const book = getBookBySlug(section, bookSlug);
  const [translation, setTranslation] = React.useState<TanakhTranslationId>("en-jps1917");
  const [activeBook, setActiveBook] = React.useState<LoadedTanakhBook | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rashiEnabled, setRashiEnabled] = React.useState(false);
  const [selectedVerses, setSelectedVerses] = React.useState<Set<number>>(new Set());
  const [lastSelectedVerse, setLastSelectedVerse] = React.useState<number | null>(null);
  const [copyMessage, setCopyMessage] = React.useState<string | null>(null);

  const availability = React.useMemo(() => {
    return {
      "he-taamei": Boolean(book?.available?.he ?? hasTranslation(bookSlug, "he-taamei")),
      "en-jps1917": Boolean(book?.available?.en ?? hasTranslation(bookSlug, "en-jps1917")),
      "ar-onqelos": Boolean(book?.available?.onqelos ?? hasTranslation(bookSlug, "ar-onqelos"))
    };
  }, [book?.available, bookSlug]);

  const defaultTranslation = React.useMemo<TanakhTranslationId>(() => {
    const preferredOrder: TanakhTranslationId[] = [
      "en-jps1917",
      "he-taamei",
      "ar-onqelos"
    ];
    for (const option of preferredOrder) {
      if (availability[option]) {
        return option;
      }
    }
    return "he-taamei";
  }, [availability]);

  React.useEffect(() => {
    setTranslation(defaultTranslation);
  }, [bookSlug, defaultTranslation]);

  React.useEffect(() => {
    if (availability[translation]) return;
    setTranslation(defaultTranslation);
  }, [availability, translation, defaultTranslation]);

  const chapterCountFromMeta = getChapterCount(book);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadBook(bookSlug, translation)
      .then((loaded) => {
        if (cancelled) return;
        if (!loaded) {
          setActiveBook(null);
          setError("Translation not available yet.");
        } else {
          setActiveBook(loaded);
        }
        setLoading(false);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setActiveBook(null);
        setError(loadError instanceof Error ? loadError.message : String(loadError));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookSlug, translation]);

  const chapterCount = activeBook ? getChapterCountFromBook(activeBook) : chapterCountFromMeta;

  const verses = React.useMemo(() => {
    if (!activeBook) return [];
    const chapter = activeBook.chapters.find((entry) => entry.chapter === chapterNumber);
    return chapter ? chapter.verses : [];
  }, [activeBook, chapterNumber]);

  React.useEffect(() => {
    setSelectedVerses(new Set());
    setLastSelectedVerse(null);
    setCopyMessage(null);
  }, [bookSlug, chapterNumber, translation]);

  React.useEffect(() => {
    if (!copyMessage) return;
    const timer = window.setTimeout(() => setCopyMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [copyMessage]);

  const selectedVerseList = React.useMemo(() => {
    return Array.from(selectedVerses).sort((a, b) => a - b);
  }, [selectedVerses]);

  const prevChapter = chapterNumber > 1 ? chapterNumber - 1 : null;
  const nextChapter = chapterCount > chapterNumber ? chapterNumber + 1 : null;

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && prevChapter) {
        event.preventDefault();
        window.location.hash = `#/texts/tanakh/${sectionSlug}/${bookSlug}/${prevChapter}`;
      } else if (event.key === "ArrowRight" && nextChapter) {
        event.preventDefault();
        window.location.hash = `#/texts/tanakh/${sectionSlug}/${bookSlug}/${nextChapter}`;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bookSlug, nextChapter, prevChapter, sectionSlug]);

  if (!registry?.tanakhManifest) {
    return <p className="text-sm text-slate-500">Loading Tanakh metadata…</p>;
  }

  if (!section || !book || chapterNumber < 1 || chapterNumber > Math.max(chapterCount, chapterCountFromMeta)) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Texts", href: "#/texts" },
            { label: "Tanakh", href: "#/texts/tanakh" },
            section ? { label: section.en, href: `#/texts/tanakh/${section.id}` } : { label: "Unknown section" },
            book ? { label: book.en, href: `#/texts/tanakh/${section?.id ?? sectionSlug}/${book.id}` } : { label: "Unknown book" },
            { label: "Unknown chapter", current: true }
          ]}
        />
        <p className="text-sm text-red-600 dark:text-red-400">That chapter is outside the known range.</p>
      </div>
    );
  }

  const bookTitle = book.en;
  const selectedCount = selectedVerseList.length;

  const formatVerseForCopy = React.useCallback(
    (verseNumber: number) => {
      const verse = verses[verseNumber - 1];
      if (!verse) return null;
      const reference = `${bookTitle} ${chapterNumber}:${verseNumber}`;
      const lines = [reference];
      if (verse.primary) {
        lines.push(verse.primary.trim());
      }
      if (verse.secondary) {
        lines.push(verse.secondary.trim());
      }
      return lines.join("\n");
    },
    [bookTitle, chapterNumber, verses]
  );

  const handleCopyVerse = React.useCallback(
    async (verseNumber: number) => {
      const text = formatVerseForCopy(verseNumber);
      if (!text) return;
      try {
        await copyText(text);
        setCopyMessage(`Copied ${bookTitle} ${chapterNumber}:${verseNumber}`);
      } catch (copyError) {
        setCopyMessage("Copy failed. Try using your device’s copy command.");
      }
    },
    [bookTitle, chapterNumber, formatVerseForCopy]
  );

  const handleCopySelected = React.useCallback(async () => {
    const chunks = selectedVerseList
      .map((verseNumber) => formatVerseForCopy(verseNumber))
      .filter((value): value is string => Boolean(value));
    if (chunks.length === 0) return;
    try {
      await copyText(chunks.join("\n\n"));
      setCopyMessage(
        `Copied ${chunks.length} verse${chunks.length === 1 ? "" : "s"} from ${bookTitle} ${chapterNumber}.`
      );
    } catch (copyError) {
      setCopyMessage("Copy failed. Try using your device’s copy command.");
    }
  }, [bookTitle, chapterNumber, formatVerseForCopy, selectedVerseList]);

  const toggleVerseSelection = React.useCallback(
    (verseNumber: number, shiftKey: boolean) => {
      setSelectedVerses((previous) => {
        const next = new Set(previous);
        if (shiftKey && lastSelectedVerse !== null && lastSelectedVerse !== verseNumber) {
          const [start, end] = verseNumber > lastSelectedVerse ? [lastSelectedVerse, verseNumber] : [verseNumber, lastSelectedVerse];
          for (let current = start; current <= end; current += 1) {
            next.add(current);
          }
        } else if (next.has(verseNumber)) {
          next.delete(verseNumber);
        } else {
          next.add(verseNumber);
        }
        return next;
      });
      setLastSelectedVerse(verseNumber);
    },
    [lastSelectedVerse]
  );

  const handleCheckboxChange = React.useCallback(
    (verseNumber: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const nativeEvent = event.nativeEvent as MouseEvent | KeyboardEvent;
      const shiftKey = Boolean(nativeEvent?.shiftKey);
      toggleVerseSelection(verseNumber, shiftKey);
    },
    [toggleVerseSelection]
  );

  const clearSelection = React.useCallback(() => {
    setSelectedVerses(new Set());
    setLastSelectedVerse(null);
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Texts", href: "#/texts" },
          { label: "Tanakh", href: "#/texts/tanakh" },
          { label: section.en, href: `#/texts/tanakh/${section.id}` },
          { label: book.en, href: `#/texts/tanakh/${section.id}/${book.id}` },
          { label: `Chapter ${chapterNumber}`, current: true }
        ]}
      />
      <header className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {book.en} <span className="text-base font-semibold text-slate-500">Chapter {chapterNumber}</span>
          </h2>
          <span dir="rtl" className="text-xl font-medium text-pomegranate">
            {book.he}
          </span>
        </div>
      </header>
      <section className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="translation-select">
          Translation
        </label>
        <Select
          id="translation-select"
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
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading chapter text…</p>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : verses.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No text available for this chapter.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select verses to copy them together, or copy any verse instantly.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopySelected()}
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
                      onClick={clearSelection}
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
              <ol dir={activeBook?.direction ?? "rtl"} className="space-y-3 text-lg leading-relaxed">
                {verses.map((verse, index) => {
                  const verseNumber = index + 1;
                  const isSelected = selectedVerses.has(verseNumber);
                  return (
                    <li
                      key={index}
                      className={`space-y-2 rounded-lg border p-3 leading-loose shadow-sm transition ${
                        isSelected
                          ? "border-pomegranate/60 bg-pomegranate/10 dark:border-pomegranate/70 dark:bg-pomegranate/20"
                          : "border-transparent bg-slate-50 dark:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <input
                            id={`chapter-verse-${verseNumber}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={handleCheckboxChange(verseNumber)}
                            className="h-4 w-4 rounded border-slate-300 text-pomegranate focus:ring-pomegranate dark:border-slate-600"
                            aria-label={`Select verse ${verseNumber}`}
                          />
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pomegranate/10 text-xs font-semibold text-pomegranate dark:bg-pomegranate/20">
                            {verseNumber}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleCopyVerse(verseNumber)}
                          className="rounded-full border border-transparent px-2 py-1 text-xs font-semibold text-pomegranate transition hover:border-pomegranate/40 hover:bg-pomegranate/10 focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/40"
                          aria-label={`Copy verse ${verseNumber}`}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="space-y-1 pl-10">
                        <span>{verse.primary ?? "—"}</span>
                        {verse.secondary ? (
                          <p className="text-sm text-slate-600 dark:text-slate-300" dir="ltr">
                            {verse.secondary}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Commentary</h3>
        <div className="flex items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-pomegranate focus:ring-pomegranate"
              checked={rashiEnabled}
              onChange={(event) => setRashiEnabled(event.target.checked)}
            />
            <span>Rashi</span>
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">Commentaries coming soon.</span>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          No commentary is loaded yet. Toggle Rashi to plan your study preferences ahead of the full release.
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <ChapterNavButton
          label="Previous chapter"
          href={prevChapter ? `#/texts/tanakh/${section.id}/${book.id}/${prevChapter}` : null}
          disabled={!prevChapter}
        />
        <ChapterNavButton
          label="Next chapter"
          href={nextChapter ? `#/texts/tanakh/${section.id}/${book.id}/${nextChapter}` : null}
          disabled={!nextChapter}
        />
      </div>
    </div>
  );
};

interface ChapterNavButtonProps {
  label: string;
  href: string | null;
  disabled?: boolean;
}

const ChapterNavButton: React.FC<ChapterNavButtonProps> = ({ label, href, disabled }) => {
  if (!href || disabled) {
    return (
      <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 dark:border-slate-700 dark:text-slate-600">
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:text-slate-200"
    >
      {label}
    </a>
  );
};
