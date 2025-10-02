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
            <ol dir={activeBook?.direction ?? "rtl"} className="space-y-2 text-lg leading-relaxed">
              {verses.map((verse, index) => (
                <li key={index} className="space-y-1 rounded-lg bg-slate-50 p-3 leading-loose text-slate-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-pomegranate/10 text-xs font-semibold text-pomegranate dark:bg-pomegranate/20">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <span>{verse.primary ?? "—"}</span>
                    {verse.secondary ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300" dir="ltr">
                        {verse.secondary}
                      </p>
                    ) : null}
                  </div>
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
