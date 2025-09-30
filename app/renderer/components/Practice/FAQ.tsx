import React from "react";
import { faqEntries } from "@data/faq";

export const FAQ: React.FC = () => {
  return (
    <div className="space-y-4">
      {faqEntries.map((entry) => (
        <article key={entry.id} className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{entry.question}</h3>
          <p className="text-sm font-medium text-pomegranate">TL;DR: {entry.tldr}</p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{entry.fiveMin}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">{entry.deepDive}</p>
          {entry.sources?.length ? (
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
              Sources: {entry.sources.join(", ")}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
};
