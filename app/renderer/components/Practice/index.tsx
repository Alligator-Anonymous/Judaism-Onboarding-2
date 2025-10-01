import React from "react";
import { AlefBetLab } from "./AlefBet";
import { NiqqudBuilder } from "./NiqqudBuilder";
import { WordGarden } from "./WordGarden";
import { FAQ } from "./FAQ";
import { TropeCoach } from "./TropeCoach";

export const PracticeView: React.FC = () => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Alef-Bet & Reading Lab</h2>
        <p className="text-sm text-slate-600">Explore letters, build syllables, and celebrate progress with positive reinforcement.</p>
        <AlefBetLab />
      </section>
      <NiqqudBuilder />
      <WordGarden />
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Curious Questions</h2>
        <FAQ />
      </section>
      <TropeCoach />
    </div>
  );
};
