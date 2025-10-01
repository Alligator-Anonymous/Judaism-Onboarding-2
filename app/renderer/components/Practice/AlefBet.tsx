import React from "react";
import { useContent } from "@stores/useContent";

export const AlefBetLab: React.FC = () => {
  const letters = useContent((state) => state.registry?.alefbet ?? []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {letters.map((card) => (
        <article key={`${card.letter}-${card.nameEn}`} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-4xl" dir="rtl">
              {card.letter}
            </span>
            {card.finalForm ? <span className="text-xl text-slate-500" dir="rtl">{card.finalForm}</span> : null}
          </div>
          <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {card.nameEn} <span className="text-sm text-slate-500">({card.nameHe})</span>
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">Sound: {card.sound}</p>
          {card.tips ? <p className="text-xs text-slate-500">{card.tips}</p> : null}
          {card.license ? <p className="text-[0.65rem] text-slate-400">License: {card.license}</p> : null}
        </article>
      ))}
      {letters.length === 0 ? <p className="text-sm text-slate-500">Letter cards are loading…</p> : null}
    </div>
  );
};
