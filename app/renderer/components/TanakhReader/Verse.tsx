import React from "react";
import type { Verse } from "@/types";

interface VerseProps {
  verse: Verse;
  showTranslit: boolean;
  transliterationLabel: string;
  onWordClick: (word: { surface: string; lemma?: string; root?: string }) => void;
  onSelect: () => void;
  isSelected: boolean;
}

export const VerseView: React.FC<VerseProps> = ({
  verse,
  showTranslit,
  transliterationLabel,
  onWordClick,
  onSelect,
  isSelected
}) => {
  return (
    <article
      className={`rounded-lg border p-4 shadow-sm transition hover:border-pomegranate focus-within:border-pomegranate ${
        isSelected ? "border-pomegranate" : "border-slate-200 dark:border-slate-700"
      }`}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      aria-pressed={isSelected}
    >
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase text-slate-500">{verse.ref}</h3>
        {showTranslit && verse.translit ? (
          <span className="text-xs text-pomegranate" aria-label={`Transliteration (${transliterationLabel})`}>
            {verse.translit}
          </span>
        ) : null}
      </header>
      <p className="mt-2 text-right text-2xl leading-relaxed font-hebrew" dir="rtl">
        {verse.hebrew}
      </p>
      <div className="mt-2 flex flex-wrap justify-end gap-2" dir="rtl">
        {verse.words.map((word, idx) => (
          <button
            key={`${verse.ref}-${idx}`}
            type="button"
            className="rounded-full border border-pomegranate/30 px-2 py-1 text-sm text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate"
            onClick={(event) => {
              event.stopPropagation();
              onWordClick(word);
            }}
          >
            {word.surface}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{verse.translation}</p>
      {verse.audio ? (
        <audio className="mt-2 w-full" controls src={verse.audio.url}>
          Your browser does not support the audio element.
        </audio>
      ) : null}
    </article>
  );
};
