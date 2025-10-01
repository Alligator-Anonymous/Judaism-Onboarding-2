import React from "react";
import { useContent } from "@stores/useContent";
import { useSettings } from "@stores/useSettings";
import { getLetterMapping, getSystemDisplayName } from "../../lib/kabbalah";

export const AlefBetLab: React.FC = () => {
  const letters = useContent((state) => state.registry?.alefbet ?? []);
  const system = useSettings((s) => s.kabbalahSystem ?? "none");
  const systemName = getSystemDisplayName(system);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {letters.map((card) => {
        const map = getLetterMapping(card.letter, system);
        return (
          <article
            key={`${card.letter}-${card.nameEn}`}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-4xl" dir="rtl">{card.letter}</span>
              {card.finalForm ? <span className="text-xl text-slate-500" dir="rtl">{card.finalForm}</span> : null}
            </div>

            <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {card.nameEn} <span className="text-sm text-slate-500">({card.nameHe})</span>
            </h4>

            <p className="text-sm text-slate-600 dark:text-slate-300">Sound: {card.sound}</p>
            {card.tips ? <p className="text-xs text-slate-500">{card.tips}</p> : null}

            {/* Optional: show gematria if present in your letters.json */}
            {card.gematria?.standard != null && (
              <p className="text-xs text-slate-600 dark:text-slate-300">Gematria: {card.gematria.standard}</p>
            )}

            {/* System overlay */}
            {system !== "none" && (
              <div className="mt-1 rounded bg-slate-50 p-2 text-sm dark:bg-slate-800/40">
                <div className="font-medium mb-1">Kabbalah — {systemName}</div>
                {map?.path != null && <div>Tree-of-Life path: {map.path}</div>}
                {map?.element && <div>Element (Mothers): {map.element}</div>}
                {map?.planet && <div>Planet (Doubles): {map.planet}</div>}
                {map?.zodiac && <div>Zodiac (Simples): {map.zodiac}</div>}
                {map?.month && <div>Hebrew month: {map.month}</div>}
                {map?.notes && <div className="text-xs text-slate-500 mt-1">{map.notes}</div>}
                <div className="text-[11px] text-slate-500 mt-1">
                  Presented for study; traditions vary—ask a teacher for depth.
                </div>
              </div>
            )}

            {card.license ? <p className="text-[0.65rem] text-slate-400">License: {card.license}</p> : null}
          </article>
        );
      })}
      {letters.length === 0 ? <p className="text-sm text-slate-500">Letter cards are loading…</p> : null}
    </div>
  );
};
