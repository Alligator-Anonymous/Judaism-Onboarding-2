import React from "react";
import { letterCards } from "@data/alefbet";

export const AlefBetLab: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {letterCards.map((card) => (
        <article key={card.letter} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
          <img src={card.svg} alt={`Stroke order for ${card.name}`} className="h-24 w-full object-contain" />
          <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{card.letter} · {card.name}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">Sound: {card.sound}</p>
          {card.finalForm ? (
            <p className="text-sm text-slate-500">Final form: {card.finalForm}</p>
          ) : null}
          <p className="text-xs text-slate-500">Common confusions: {card.confusions.join(", ")}</p>
        </article>
      ))}
    </div>
  );
};
