import React from "react";
import type { Commentary } from "@/types";

interface CommentaryPanelProps {
  commentary: Commentary[];
  verseRef: string;
}

export const CommentaryPanel: React.FC<CommentaryPanelProps> = ({ commentary, verseRef }) => {
  if (!commentary.length) {
    return (
      <aside className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600">
        Commentary coming soon. We plan to include Rambam and Ibn Ezra in future updates.
      </aside>
    );
  }

  return (
    <aside className="space-y-4 rounded-lg border border-slate-200 p-4 shadow-sm dark:border-slate-700">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Commentary on {verseRef}</h4>
      {commentary.map((entry) => (
        <article key={entry.id} className="space-y-2">
          <header>
            <p className="text-xs font-semibold text-pomegranate">{entry.author}</p>
          </header>
          <p className="text-sm text-slate-700 dark:text-slate-300">{entry.text}</p>
          <p className="text-[0.65rem] uppercase tracking-widest text-slate-400">License: {entry.license}</p>
        </article>
      ))}
    </aside>
  );
};
