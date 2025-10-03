import React from "react";

export const JournalView: React.FC = () => {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Journal</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          A dedicated journaling space is on the way. Soon you&apos;ll be able to save, revisit, and organize your daily reflections here.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        Placeholder journal canvas — stay tuned!
      </div>
    </div>
  );
};

export default JournalView;
