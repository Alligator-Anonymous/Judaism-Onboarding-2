// Codex change: Added a placeholder Kabbalah overview page that reflects the selected system.
import React from "react";
import { getSystemDisplayName } from "../../lib/kabbalah";
import { useSettings } from "@stores/useSettings";

export const KabbalahOverview: React.FC = () => {
  const system = useSettings((state) => state.kabbalahSystem);
  const displayName = getSystemDisplayName(system);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Kabbalah Mappings</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Preview how mystical correspondences shift across traditions. Choose a system in Settings and explore the Alef-Bet lab
          for detailed letter cards.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
        <p>
          Current system: <strong>{displayName}</strong>.
        </p>
        <p className="mt-2">
          Future releases will show interactive Tree-of-Life diagrams, elemental groupings, and study notes. For now, switch
          systems in <a className="text-pomegranate underline" href="#/settings">Settings</a> and compare how the Alef-Bet lab
          updates.
        </p>
      </div>
    </section>
  );
};
