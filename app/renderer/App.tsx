import React, { useEffect } from "react";
import { Tabs } from "@components/UI/Tabs";
import { Today } from "@components/Today";
import { TanakhReader } from "@components/TanakhReader/Index";
import { SiddurView } from "@components/Siddur/SiddurView";
import { PracticeView } from "@components/Practice";
import { copy } from "@/copy";
import { useSettings } from "@stores/useSettings";
import { useContent } from "@stores/useContent";

const TextsPanel: React.FC = () => (
  <Tabs
    tabs={[
      { id: "tanakh", label: "Tanakh", panel: <TanakhReader /> },
      { id: "siddur", label: "Siddur", panel: <SiddurView /> }
    ]}
  />
);

export const App: React.FC = () => {
  const {
    darkMode,
    setDarkMode,
    largeText,
    setLargeText,
    dyslexiaFriendlyHebrew,
    setDyslexiaFriendlyHebrew
  } = useSettings();
  const hydrateContent = useContent((state) => state.hydrate);

  useEffect(() => {
    hydrateContent();
  }, [hydrateContent]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.dataset.theme = "dark";
      root.classList.add("dark");
    } else {
      delete root.dataset.theme;
      root.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle("large-text", largeText);
  }, [largeText]);

  useEffect(() => {
    document.body.classList.toggle("font-dyslexia", dyslexiaFriendlyHebrew);
  }, [dyslexiaFriendlyHebrew]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-pomegranate">{copy.appName}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">A gentle path into Jewish learning.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full border border-slate-300 px-4 py-2 shadow-sm transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-600"
            >
              {darkMode ? "Switch to light mode" : "Switch to dark mode"}
            </button>
            <button
              type="button"
              onClick={() => setLargeText(!largeText)}
              className="rounded-full border border-slate-300 px-4 py-2 shadow-sm transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-600"
            >
              {largeText ? "Standard text" : "Large text"}
            </button>
            <button
              type="button"
              onClick={() => setDyslexiaFriendlyHebrew(!dyslexiaFriendlyHebrew)}
              className="rounded-full border border-slate-300 px-4 py-2 shadow-sm transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-600"
            >
              {dyslexiaFriendlyHebrew ? "Default font" : "Dyslexia-friendly font"}
            </button>
          </div>
        </header>
        <main
          id="main"
          className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800"
        >
          <Tabs
            tabs={[
              { id: "today", label: copy.tabs.today, panel: <Today /> },
              { id: "texts", label: copy.tabs.texts, panel: <TextsPanel /> },
              { id: "practice", label: copy.tabs.practice, panel: <PracticeView /> }
            ]}
          />
        </main>
        <footer className="text-xs text-slate-500">
          {copy.footerDisclaimer}
        </footer>
      </div>
    </div>
  );
};

export default App;
