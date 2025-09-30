import React, { useEffect } from "react";
import { commonWords } from "@data/alefbet";
import { useLearning } from "@stores/useLearning";

export const WordGarden: React.FC = () => {
  const { queue, addWord, grade, due } = useLearning();

  useEffect(() => {
    if (queue.length === 0) {
      commonWords.slice(0, 10).forEach((word) => addWord(word.hebrew, word.translation));
    }
  }, [addWord, queue.length]);

  const dueList = due();

  return (
    <section className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Word Garden</h3>
      <p className="text-sm text-slate-600">Practice ten common words with gentle spaced repetition.</p>
      <div className="mt-4 space-y-3">
        {dueList.length === 0 ? (
          <p className="text-sm text-slate-500">All words are resting. Check back tomorrow!</p>
        ) : (
          dueList.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
              <div>
                <p className="text-xl font-semibold text-slate-800 dark:text-slate-100" dir="rtl">
                  {item.prompt}
                </p>
                <p className="text-sm text-slate-500">{item.answer}</p>
              </div>
              <div className="flex gap-2">
                {[1, 3, 5].map((quality) => (
                  <button
                    key={quality}
                    type="button"
                    className="rounded-full bg-pomegranate px-3 py-1 text-xs font-semibold text-white shadow focus:outline-none focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-pomegranate"
                    onClick={() => grade(item.id, quality as 0 | 1 | 2 | 3 | 4 | 5)}
                  >
                    {quality === 1 ? "Retry" : quality === 3 ? "Good" : "Great"}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
