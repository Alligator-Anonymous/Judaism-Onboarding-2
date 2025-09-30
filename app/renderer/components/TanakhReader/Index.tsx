import React, { useMemo, useState } from "react";
import { genesisOne } from "@data/tanakh";
import { commentaries } from "@data/commentary";
import { VerseView } from "./Verse";
import { CommentaryPanel } from "./CommentaryPanel";
import { useSettings } from "@stores/useSettings";

export const TanakhReader: React.FC = () => {
  const [selectedRef, setSelectedRef] = useState(genesisOne[0]?.ref ?? "Genesis 1:1");
  const [wordInfo, setWordInfo] = useState<{ surface: string; lemma?: string; root?: string } | null>(null);
  const settings = useSettings();
  const transliterationLabel = settings.transliterationMode === "ashkenazi" ? "Ashkenazi" : "Sephardi";

  const selectedCommentary = useMemo(
    () => commentaries.filter((entry) => entry.refs.includes(selectedRef)),
    [selectedRef]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-4" aria-label="Tanakh verses">
        {genesisOne.map((verse) => (
          <VerseView
            key={verse.ref}
            verse={verse}
            showTranslit={settings.transliterationMode !== "none"}
            transliterationLabel={transliterationLabel}
            onWordClick={setWordInfo}
            onSelect={() => {
              setSelectedRef(verse.ref);
            }}
            isSelected={selectedRef === verse.ref}
          />
        ))}
      </section>
      <aside className="space-y-4">
        <CommentaryPanel commentary={selectedCommentary} verseRef={selectedRef} />
        {wordInfo ? (
          <div className="rounded-lg border border-slate-200 p-4 text-sm shadow-sm dark:border-slate-700" aria-live="polite">
            <h4 className="font-semibold text-pomegranate">Word insights</h4>
            <p>
              <strong>Surface:</strong> {wordInfo.surface}
            </p>
            {wordInfo.lemma ? (
              <p>
                <strong>Lemma:</strong> {wordInfo.lemma}
              </p>
            ) : null}
            {wordInfo.root ? (
              <p>
                <strong>Shoresh:</strong> {wordInfo.root}
              </p>
            ) : null}
            <p className="text-xs text-slate-500">
              Mini concordance demo: this root appears {genesisOne.filter((verse) =>
                verse.words.some((word) => word.root === wordInfo.root)
              ).length}{" "}
              time(s) in Genesis 1 sample.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600">
            Tap a word to explore its shoresh (root) and lemma.
          </div>
        )}
      </aside>
    </div>
  );
};
