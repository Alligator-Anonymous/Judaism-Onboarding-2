// Codex change: Converted Practice landing into a hub linking to dedicated practice routes.
import React from "react";

interface PracticeNavItem {
  path: string;
  label: string;
}

interface PracticeViewProps {
  practiceNavItems: readonly PracticeNavItem[];
}

const descriptions: Record<string, string> = {
  "/practice": "Start here to see what to explore today.",
  "/alefbet": "Study the letters with pronunciation guides and optional mystical overlays.",
  "/kabbalah": "Preview how different kabbalah systems map to the alef-bet.",
  "/faq": "Browse gentle answers to curious beginner questions.",
  "/vocab": "Tend the Word Garden spaced-repetition queue.",
  "/syllables": "Compose syllables by pairing consonants and vowels.",
  "/trope": "Future home for cantillation training exercises."
};

export const PracticeView: React.FC<PracticeViewProps> = ({ practiceNavItems }) => {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Practice Lab</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Choose an area to focus on—letters, vocabulary, mystical correspondences, or questions that arise along the way.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {practiceNavItems
          .filter((item) => item.path !== "/practice")
          .map((item) => (
          <a
            key={item.path}
            href={`#${item.path}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pomegranate hover:shadow-lg focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.label}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{descriptions[item.path] ?? "Jump in and learn."}</p>
          </a>
        ))}
      </div>
    </div>
  );
};
