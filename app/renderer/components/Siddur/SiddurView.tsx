import React from "react";
import { useSettings } from "@stores/useSettings";
import { useContent } from "@stores/useContent";
import type {
  SiddurContentLibrary,
  SiddurManifest,
  SiddurManifestCategory,
  SiddurManifestSection,
  SiddurManifestPrayer,
  SiddurPrayerContent,
  SiddurTradition
} from "@/types/siddur";

interface SearchResult {
  prayerId: string;
  title: string;
  breadcrumbs: string[];
  categoryId: string;
  sectionPath: string[];
  tags: string[];
}

const TRADITION_LABELS: Record<SiddurTradition, string> = {
  ashkenaz: "Ashkenaz",
  "nusach-sefarad": "Nusach Sefarad",
  "edot-hamizrach": "Edot HaMizrach"
};

function getSections(section?: SiddurManifestSection | null): SiddurManifestSection[] {
  if (!section) return [];
  return section.sections ?? [];
}

function getPrayers(section?: SiddurManifestSection | null): SiddurManifestPrayer[] {
  if (!section) return [];
  return section.prayers ?? [];
}

function findCategory(manifest: SiddurManifest | null, id: string | null): SiddurManifestCategory | null {
  if (!manifest || !id) return null;
  return manifest.categories.find((category) => category.id === id) ?? null;
}

function resolveSection(category: SiddurManifestCategory | null, path: string[]): SiddurManifestSection | null {
  if (!category || path.length === 0) return null;
  let current: SiddurManifestSection | null = null;
  let cursorSections = category.sections;

  path.forEach((segment) => {
    const next = cursorSections.find((section) => section.id === segment) ?? null;
    current = next;
    cursorSections = next?.sections ?? [];
  });

  return current;
}

function collectSearchIndex(manifest: SiddurManifest | null): SearchResult[] {
  if (!manifest) return [];
  const results: SearchResult[] = [];

  manifest.categories.forEach((category) => {
    const walk = (
      sections: SiddurManifestSection[] | undefined,
      path: string[],
      breadcrumbTitles: string[]
    ) => {
      if (!sections) return;

      sections.forEach((section) => {
        const nextPath = [...path, section.id];
        const nextBreadcrumbs = [...breadcrumbTitles, section.title_en];

        (section.prayers ?? []).forEach((prayer) => {
          results.push({
            prayerId: prayer.id,
            title: prayer.title_en,
            breadcrumbs: [category.title_en, ...nextBreadcrumbs, prayer.title_en],
            categoryId: category.id,
            sectionPath: nextPath,
            tags: prayer.tags ?? []
          });
        });

        if (section.sections && section.sections.length > 0) {
          walk(section.sections, nextPath, nextBreadcrumbs);
        }
      });
    };

    walk(category.sections, [], []);
  });

  return results;
}

function resolveContent(
  library: SiddurContentLibrary | null,
  prayerId: string,
  tradition: SiddurTradition
): SiddurPrayerContent | null {
  if (!library) return null;
  const { common, traditions } = library;
  const traditionMap = traditions?.[tradition];
  if (traditionMap && traditionMap[prayerId]) {
    return traditionMap[prayerId];
  }
  if (common && common[prayerId]) {
    return common[prayerId];
  }
  const ashkenazFallback = traditions?.ashkenaz;
  if (ashkenazFallback && ashkenazFallback[prayerId]) {
    return ashkenazFallback[prayerId];
  }
  return null;
}

interface SectionSummaryProps {
  section: SiddurManifestSection;
  path: string[];
  isActive: boolean;
  onSelectSection: (path: string[]) => void;
  onSelectPrayer: (prayerId: string) => void;
}

const SectionSummary: React.FC<SectionSummaryProps> = ({ section, path, isActive, onSelectSection, onSelectPrayer }) => {
  const childSections = getSections(section);
  const prayers = getPrayers(section);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-pomegranate/50 hover:shadow-md focus-within:border-pomegranate dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.title_en}</h3>
          {section.title_he ? (
            <p className="text-sm text-slate-500" dir="rtl">
              {section.title_he}
            </p>
          ) : null}
          {section.description ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{section.description}</p>
          ) : null}
        </div>
        {!isActive ? (
          <button
            type="button"
            onClick={() => onSelectSection(path)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/50 dark:border-slate-600 dark:text-slate-300"
          >
            View section
          </button>
        ) : null}
      </div>
      {childSections.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {childSections.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelectSection([...path, child.id])}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/50 dark:border-slate-600 dark:text-slate-300"
            >
              {child.title_en}
            </button>
          ))}
        </div>
      ) : null}
      {prayers.length > 0 ? (
        <div className="space-y-2">
          {prayers.map((prayer) => (
            <button
              key={prayer.id}
              type="button"
              onClick={() => onSelectPrayer(prayer.id)}
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-pomegranate hover:shadow-md focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{prayer.title_en}</span>
              {prayer.title_he ? (
                <span className="mt-1 block text-sm text-slate-500" dir="rtl">
                  {prayer.title_he}
                </span>
              ) : null}
              {prayer.description ? (
                <span className="mt-1 block text-xs text-slate-500">{prayer.description}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

interface PrayerContentViewProps {
  content: SiddurPrayerContent | null;
}

const PrayerContentView: React.FC<PrayerContentViewProps> = ({ content }) => {
  if (!content) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <h3 className="text-lg font-semibold">Content coming soon</h3>
        <p className="mt-2 text-sm">
          This prayer has not been populated yet for the selected tradition. Check back as we continue to expand the Siddur.
        </p>
      </div>
    );
  }

  const header = (
    <header>
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{content.title_en}</h2>
      {content.title_he ? (
        <p className="text-xl text-right font-semibold text-slate-700 dark:text-slate-200" dir="rtl">
          {content.title_he}
        </p>
      ) : null}
    </header>
  );

  if (content.segments.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <h3 className="text-lg font-semibold">Content coming soon</h3>
          <p className="mt-2 text-sm">
            This prayer outline is ready, but the text segments have not been added yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      <div className="space-y-5">
        {content.segments.map((segment, index) => (
          <article key={`${content.id}-segment-${index}`} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {(segment.label_en || segment.label_he) ? (
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span>{segment.label_en}</span>
                {segment.label_he ? (
                  <span dir="rtl" className="text-right">
                    {segment.label_he}
                  </span>
                ) : null}
              </div>
            ) : null}
            {segment.he ? (
              <p dir="rtl" className="text-xl leading-relaxed text-slate-900 dark:text-slate-100">
                {segment.he}
              </p>
            ) : null}
            {segment.en ? (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{segment.en}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
};

export const SiddurView: React.FC = () => {
  const tradition = useSettings((state) => state.siddurTradition);
  const nusach = useSettings((state) => state.nusach);
  const transliterationMode = useSettings((state) => state.transliterationMode);
  const hydrate = useContent((state) => state.hydrate);
  const registry = useContent((state) => state.registry);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const manifest = registry?.siddur.manifest ?? null;
  const contentLibrary = registry?.siddur.content ?? null;

  const [query, setQuery] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [sectionPath, setSectionPath] = React.useState<string[]>([]);
  const [activePrayerId, setActivePrayerId] = React.useState<string | null>(null);

  const searchIndex = React.useMemo(() => collectSearchIndex(manifest), [manifest]);
  const category = React.useMemo(() => findCategory(manifest, selectedCategoryId), [manifest, selectedCategoryId]);
  const currentSection = React.useMemo(() => resolveSection(category, sectionPath), [category, sectionPath]);

  const breadcrumbs = React.useMemo(() => {
    if (!category) return [] as string[];
    const crumbs = [category.title_en];

    let walker = category.sections;
    sectionPath.forEach((segment) => {
      const next = walker.find((section) => section.id === segment);
      if (next) {
        crumbs.push(next.title_en);
        walker = next.sections ?? [];
      }
    });

    if (activePrayerId) {
      const matches = searchIndex.find((entry) => entry.prayerId === activePrayerId);
      if (matches) {
        crumbs.push(matches.title);
      }
    }

    return crumbs;
  }, [category, sectionPath, activePrayerId, searchIndex]);

  const filteredResults = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [] as SearchResult[];

    return searchIndex.filter((entry) => {
      const haystack = `${entry.title} ${entry.tags.join(" ")}`.toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [query, searchIndex]);

  const handleBack = () => {
    if (activePrayerId) {
      setActivePrayerId(null);
      return;
    }
    if (sectionPath.length > 0) {
      setSectionPath((prev) => prev.slice(0, -1));
      return;
    }
    setSelectedCategoryId(null);
  };

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setSectionPath([]);
    setActivePrayerId(null);
  };

  const handleSelectSection = (path: string[]) => {
    setSectionPath(path);
    setActivePrayerId(null);
  };

  const handleSelectPrayer = (prayerId: string) => {
    setActivePrayerId(prayerId);
  };

  const handleSearchSelect = (result: SearchResult) => {
    setSelectedCategoryId(result.categoryId);
    setSectionPath(result.sectionPath);
    setActivePrayerId(result.prayerId);
    setQuery("");
  };

  const categoryCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    searchIndex.forEach((item) => {
      counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    });
    return counts;
  }, [searchIndex]);

  const resolvedContent = activePrayerId
    ? resolveContent(contentLibrary ?? null, activePrayerId, tradition)
    : null;

  return (
    <div className="space-y-6">
      <header className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Siddur</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Explore the prayer flow with a tradition-aware manifest. Texts load locally and will expand over time.
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <p>Siddur tradition: {TRADITION_LABELS[tradition] ?? tradition}</p>
            <p>Preferred nusach: {nusach}</p>
            <p>Transliteration mode: {transliterationMode}</p>
          </div>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a prayer or tag…"
          className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm transition focus:border-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-600 dark:bg-slate-800"
        />
        {breadcrumbs.length ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={`${crumb}-${index}`}>
                {index > 0 ? <span>/</span> : null}
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
        ) : null}
        {(selectedCategoryId || activePrayerId || sectionPath.length > 0) && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-600 dark:text-slate-300"
          >
            ← Back
          </button>
        )}
      </header>

      {query.trim() ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search results</h2>
          {filteredResults.length === 0 ? (
            <p className="text-sm text-slate-500">No prayers matched your search yet.</p>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((result) => (
                <button
                  key={`${result.prayerId}-${result.breadcrumbs.join("-")}`}
                  type="button"
                  onClick={() => handleSearchSelect(result)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-pomegranate hover:shadow-md focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{result.title}</span>
                    <span className="text-xs text-slate-500">{result.breadcrumbs.join(" › ")}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {!query.trim() && !selectedCategoryId ? (
        <section className="grid gap-4 md:grid-cols-2">
          {(manifest?.categories ?? []).map((cat) => {
            const total = categoryCounts.get(cat.id) ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-pomegranate hover:shadow-md focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{cat.title_en}</span>
                {cat.title_he ? (
                  <span className="text-sm text-slate-500" dir="rtl">
                    {cat.title_he}
                  </span>
                ) : null}
                {cat.description ? (
                  <span className="mt-2 text-sm text-slate-600 dark:text-slate-300">{cat.description}</span>
                ) : null}
                <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {total} prayer{total === 1 ? "" : "s"} mapped
                </span>
              </button>
            );
          })}
        </section>
      ) : null}

      {!query.trim() && !selectedCategoryId && (!manifest || manifest.categories.length === 0) ? (
        <p className="text-sm text-slate-500">Siddur manifest is loading…</p>
      ) : null}

      {!query.trim() && category && !activePrayerId ? (
        <section className="space-y-4">
          {(currentSection ? [currentSection] : category.sections).map((section) => {
            const path = currentSection ? sectionPath : [section.id];
            const isActive = currentSection ? path.join("/") === sectionPath.join("/") : false;
            return (
            <SectionSummary
              key={section.id}
              section={section}
              path={path}
              isActive={isActive}
              onSelectSection={handleSelectSection}
              onSelectPrayer={handleSelectPrayer}
            />
            );
          })}
          {currentSection && getPrayers(currentSection).length === 0 && getSections(currentSection).length === 0 ? (
            <p className="text-sm text-slate-500">This section will be populated soon.</p>
          ) : null}
        </section>
      ) : null}

      {!query.trim() && activePrayerId ? (
        <PrayerContentView content={resolvedContent} />
      ) : null}

      <footer className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        Siddur entries reference local placeholder texts. Always consult a trusted rabbi or printed siddur for personal prayer.
      </footer>
    </div>
  );
};
