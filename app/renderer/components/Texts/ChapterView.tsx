// Codex change: Render live Tanakh chapters with dynamic translation loading and commentary placeholders.
import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Select } from "@components/UI/Select";
import { useContent } from "@stores/useContent";
import { getBookBySlug, getChapterCount, getSectionBySlug } from "@lib/tanakhMetadata";
import { getChapterCountFromBook, hasTranslation, loadBook, type TanakhTranslationId } from "@lib/tanakhLoader";
import type { PackedTanakhBook } from "@/types";

const translationOptions = [
  { id: "he-masoretic", label: "Hebrew (Masoretic)" },
  { id: "ar-onqelos", label: "Targum Onqelos" }
] as const;

interface ChapterViewProps {
  sectionSlug: string;
  bookSlug: string;
  chapterNumber: number;
}

export const ChapterView: React.FC<ChapterViewProps> = ({ sectionSlug, bookSlug, chapterNumber }) => {
  const registry = useContent((state) => state.registry);
  const section = getSectionBySlug(registry?.tanakhMeta, sectionSlug);
  const book = getBookBySlug(section, bookSlug);
  const [translation, setTranslation] = React.useState<TanakhTranslationId>("he-masoretic");
  const [rashiEnabled, setRashiEnabled] = React.useState(false);
  const [baseBook, setBaseBook] = React.useState<PackedTanakhBook | null>(null);
  const [baseBookError, setBaseBookError] = React.useState<string | null>(null);
  const [baseLoading, setBaseLoading] = React.useState(true);
  const [translationBook, setTranslationBook] = React.useState<PackedTanakhBook | null>(null);
  const [translationLoading, setTranslationLoading] = React.useState(false);
  const [translationError, setTranslationError] = React.useState<string | null>(null);

  const isTorahBook = section?.id === "torah";
  const onqelosAvailable = isTorahBook && hasTranslation(bookSlug, "ar-onqelos");

  const chapterCountFromMeta = getChapterCount(book);

  React.useEffect(() => {
    let cancelled = false;
    setBaseLoading(true);
    setBaseBookError(null);
    loadBook(bookSlug, "he-masoretic")
      .then((loaded) => {
        if (cancelled) return;
        setBaseBook(loaded);
        setBaseBookError(loaded ? null : "Missing Masoretic text for this book.");
        setBaseLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setBaseBook(null);
        setBaseBookError(error instanceof Error ? error.message : String(error));
        setBaseLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookSlug]);

  React.useEffect(() => {
    let cancelled = false;
    if (translation === "he-masoretic") {
      setTranslationBook(baseBook);
      setTranslationError(null);
      setTranslationLoading(false);
      return () => {
        cancelled = true;
      };
    }
    if (!onqelosAvailable) {
      setTranslation("he-masoretic");
      return () => {
        cancelled = true;
      };
    }
    setTranslationLoading(true);
    setTranslationError(null);
    loadBook(bookSlug, translation)
      .then((loaded) => {
        if (cancelled) return;
        setTranslationBook(loaded);
        setTranslationError(loaded ? null : "Translation not available yet.");
        setTranslationLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setTranslationBook(null);
        setTranslationError(error instanceof Error ? error.message : String(error));
        setTranslationLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookSlug, translation, onqelosAvailable, baseBook]);

  const activeBook = translation === "he-masoretic" ? baseBook : translationBook;
  const chapterCount = baseBook ? getChapterCountFromBook(baseBook) : chapterCountFromMeta;

  const verses = React.useMemo(() => {
    if (!activeBook) return [];
    const chapter = activeBook.chapters?.[String(chapterNumber)] ?? [];
    return Array.isArray(chapter) ? chapter : [];
  }, [activeBook, chapterNumber]);

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

  if (!registry?.tanakhMeta) {
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
            <option key={option.id} value={option.id} disabled={option.id === "ar-onqelos" && !onqelosAvailable}>
              {option.label}
              {option.id === "ar-onqelos" && !onqelosAvailable ? " (Unavailable)" : ""}
            </option>
          ))}
        </Select>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          {baseLoading || translationLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading chapter text…</p>
          ) : baseBookError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{baseBookError}</p>
          ) : translationError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{translationError}</p>
          ) : verses.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No text available for this chapter.</p>
          ) : (
            <ol dir="rtl" className="space-y-2 text-lg leading-relaxed">
              {verses.map((verse, index) => (
                <li key={index} className="rounded-lg bg-slate-50 p-3 leading-loose text-slate-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-pomegranate/10 text-xs font-semibold text-pomegranate dark:bg-pomegranate/20">
                    {index + 1}
                  </span>
                  <span>{verse || "—"}</span>
                </li>
              ))}
            </ol>
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
