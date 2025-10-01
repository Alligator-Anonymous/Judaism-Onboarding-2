// Codex change: Rebuilt the app shell with hash-based navigation and global accessibility sync.
import React, { useEffect } from "react";
import { Today } from "@components/Today";
import { TanakhReader } from "@components/TanakhReader/Index";
import { SiddurView } from "@components/Siddur/SiddurView";
import { PracticeView } from "@components/Practice";
import { AlefBetLab } from "@components/Practice/AlefBet";
import { NiqqudBuilder } from "@components/Practice/NiqqudBuilder";
import { WordGarden } from "@components/Practice/WordGarden";
import { FAQ } from "@components/Practice/FAQ";
import { TropeCoach } from "@components/Practice/TropeCoach";
import { KabbalahOverview } from "@components/Practice/KabbalahOverview";
import { SettingsView } from "@components/Settings/SettingsView";
import { Tabs } from "@components/UI/Tabs";
import { copy } from "@/copy";
import { useSettings } from "@stores/useSettings";
import { useContent } from "@stores/useContent";

interface PageSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const practiceNavItems = [
  { path: "/practice", label: "Overview" },
  { path: "/alefbet", label: "Alef-Bet" },
  { path: "/kabbalah", label: "Kabbalah" },
  { path: "/faq", label: "Curious Questions" },
  { path: "/vocab", label: "Word Garden" },
  { path: "/syllables", label: "Compose a syllable" },
  { path: "/trope", label: "Trope" }
] as const;

const primaryNavItems = [
  { path: "/", label: copy.tabs.today },
  { path: "/texts", label: copy.tabs.texts },
  { path: "/practice", label: copy.tabs.practice },
  { path: "/settings", label: "Settings" }
] as const;

const validPaths = new Set<string>([
  ...primaryNavItems.map((item) => item.path),
  ...practiceNavItems.map((item) => item.path)
]);

function getPathFromHash(): string {
  const raw = window.location.hash ?? "";
  const withoutHash = raw.startsWith("#") ? raw.slice(1) : raw;
  if (!withoutHash || withoutHash === "/") {
    return "/";
  }
  return withoutHash.startsWith("/") ? withoutHash : `/${withoutHash}`;
}

function useHashNavigation() {
  const [path, setPath] = React.useState<string>(() => getPathFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setPath(getPathFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = React.useCallback((nextPath: string) => {
    const normalized = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
    if (window.location.hash === `#${normalized}`) return;
    window.location.hash = normalized;
    setPath(normalized);
  }, []);

  return { path, navigate };
}

const PageSection: React.FC<PageSectionProps> = ({ title, description, children }) => (
  <section className="space-y-4">
    <header className="space-y-1">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      {description ? <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
    </header>
    <div>{children}</div>
  </section>
);

const TextsView: React.FC = () => (
  <Tabs
    tabs={[
      { id: "tanakh", label: "Tanakh", panel: <TanakhReader /> },
      { id: "siddur", label: "Siddur", panel: <SiddurView /> }
    ]}
  />
);

export const App: React.FC = () => {
  const darkMode = useSettings((state) => state.darkMode);
  const setDarkMode = useSettings((state) => state.setDarkMode);
  const largeText = useSettings((state) => state.largeText);
  const dyslexiaFriendlyHebrew = useSettings((state) => state.dyslexiaFriendlyHebrew);
  const hydrateContent = useContent((state) => state.hydrate);
  const { path, navigate } = useHashNavigation();

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
    const root = document.documentElement;
    root.dataset.fontScale = largeText ? "large" : "base";
    root.dataset.dyslexiaHebrew = dyslexiaFriendlyHebrew ? "true" : "false";
  }, [largeText, dyslexiaFriendlyHebrew]);

  const currentPath = path || "/";

  useEffect(() => {
    if (!validPaths.has(currentPath)) {
      navigate("/");
    }
  }, [currentPath, navigate]);
  const isPracticeSection = practiceNavItems.some((item) => item.path === currentPath);

  let content: React.ReactNode;
  switch (currentPath) {
    case "/":
      content = <Today />;
      break;
    case "/texts":
      content = <TextsView />;
      break;
    case "/practice":
      content = <PracticeView practiceNavItems={practiceNavItems} />;
      break;
    case "/alefbet":
      content = (
        <PageSection
          title="Alef-Bet Lab"
          description="Explore each Hebrew letter, pronunciation tips, and optional kabbalistic correspondences."
        >
          <AlefBetLab />
        </PageSection>
      );
      break;
    case "/kabbalah":
      content = <KabbalahOverview />;
      break;
    case "/faq":
      content = (
        <PageSection title="Curious Questions" description="Gentle answers to common beginner questions.">
          <FAQ />
        </PageSection>
      );
      break;
    case "/vocab":
      content = (
        <PageSection title="Word Garden" description="Practice vocabulary with a light-touch spaced repetition queue.">
          <WordGarden />
        </PageSection>
      );
      break;
    case "/syllables":
      content = (
        <PageSection title="Compose a syllable" description="Build confidence by pairing Hebrew letters with vowel marks.">
          <NiqqudBuilder />
        </PageSection>
      );
      break;
    case "/trope":
      content = (
        <PageSection title="Trope Lab" description="Cantillation trainer coming soon.">
          <TropeCoach />
        </PageSection>
      );
      break;
    case "/settings":
      content = <SettingsView />;
      break;
    default:
      content = <Today />;
  }

  const renderNavLink = (item: { path: string; label: string }) => {
    const active = currentPath === item.path;
    return (
      <a
        key={item.path}
        href={`#${item.path}`}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring focus-visible:ring-pomegranate ${
          active
            ? "border-pomegranate text-pomegranate shadow"
            : "border-slate-300 text-slate-600 hover:border-pomegranate hover:text-pomegranate dark:border-slate-600 dark:text-slate-200"
        }`}
      >
        {item.label}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-pomegranate">{copy.appName}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">A gentle path into Jewish learning.</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium shadow-sm transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-600"
            >
              {darkMode ? "Switch to light mode" : "Switch to dark mode"}
            </button>
          </div>
          <nav className="flex flex-wrap gap-2">{primaryNavItems.map(renderNavLink)}</nav>
          {isPracticeSection ? (
            <nav className="flex flex-wrap gap-2 text-sm">{practiceNavItems.map(renderNavLink)}</nav>
          ) : null}
        </header>
        <main
          id="main"
          className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800"
        >
          {content}
        </main>
        <footer className="text-xs text-slate-500">{copy.footerDisclaimer}</footer>
      </div>
    </div>
  );
};

export default App;
