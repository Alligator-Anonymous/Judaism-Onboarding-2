import React, { useMemo, useState } from "react";
import { useSettings } from "@stores/useSettings";
import { useContent } from "@stores/useContent";
import type {
  SiddurManifest,
  SiddurManifestCategory,
  SiddurManifestGroup,
  SiddurManifestNode
} from "@/types/siddur";

interface SearchResult {
  entryId: string;
  title: string;
  tags: string[];
  breadcrumbs: string[];
  categoryId: string;
  groupPath: string[];
}

type ManifestGroupNode = SiddurManifestGroup;

type NodeList = SiddurManifestNode[];

function collectEntries(
  manifest: SiddurManifest,
  entries: Record<string, { title: string; tags: string[] }>
): SearchResult[] {
  const results: SearchResult[] = [];

  manifest.categories.forEach((category) => {
    const walk = (
      nodes: NodeList,
      groupPath: string[],
      breadcrumbTitles: string[]
    ) => {
      nodes.forEach((node) => {
        if (node.type === "group") {
          walk(node.children, [...groupPath, node.id], [...breadcrumbTitles, node.title]);
        } else {
          const entry = entries[node.entryId];
          const mergedTags = Array.from(
            new Set([...(entry?.tags ?? []), ...(node.tags ?? [])])
          );
          results.push({
            entryId: node.entryId,
            title: entry?.title ?? node.title,
            tags: mergedTags,
            breadcrumbs: [category.title, ...breadcrumbTitles, node.title],
            categoryId: category.id,
            groupPath,
          });
        }
      });
    };

    walk(category.children, [], []);
  });

  return results;
}

function findCategory(
  manifest: SiddurManifest | null,
  categoryId: string | null
): SiddurManifestCategory | null {
  if (!manifest || !categoryId) return null;
  return manifest.categories.find((category) => category.id === categoryId) ?? null;
}

function resolveGroupPath(
  category: SiddurManifestCategory,
  stack: string[]
): { id: string; title: string }[] {
  const segments: { id: string; title: string }[] = [];
  let nodes: NodeList = category.children;

  stack.forEach((groupId) => {
    const group = nodes.find(
      (node): node is ManifestGroupNode => node.type === "group" && node.id === groupId
    );
    if (group) {
      segments.push({ id: group.id, title: group.title });
      nodes = group.children;
    }
  });

  return segments;
}

function getActiveNodes(category: SiddurManifestCategory, stack: string[]): NodeList {
  let nodes: NodeList = category.children;

  stack.forEach((groupId) => {
    const group = nodes.find(
      (node): node is ManifestGroupNode => node.type === "group" && node.id === groupId
    );
    nodes = group ? group.children : [];
  });

  return nodes;
}

function EntryTags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full bg-pomegranate/10 px-3 py-1 font-semibold uppercase tracking-wide text-pomegranate"
        >
          {tag.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}

function VariantBadges({ labels }: { labels: string[] }) {
  if (!labels.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export const SiddurView: React.FC = () => {
  const transliterationMode = useSettings((state) => state.transliterationMode);
  const nusach = useSettings((state) => state.nusach);
  const registry = useContent((state) => state.registry);

  const manifest = registry?.siddur.manifest ?? null;
  const entryMap = registry?.siddur.entries ?? {};

  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [groupStack, setGroupStack] = useState<string[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  const sanitizedQuery = query.trim();

  const entryLookup = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(entryMap).map(([id, entry]) => [id, { title: entry.title, tags: entry.tags ?? [] }])
      ),
    [entryMap]
  );

  const searchIndex = useMemo(
    () => (manifest ? collectEntries(manifest, entryLookup) : []),
    [manifest, entryLookup]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    searchIndex.forEach((item) => {
      counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    });
    return counts;
  }, [searchIndex]);

  const category = findCategory(manifest, selectedCategoryId);
  const groupSegments = category ? resolveGroupPath(category, groupStack) : [];

  const breadcrumbs = useMemo(() => {
    if (!category) return [] as string[];
    const labels = [category.title, ...groupSegments.map((segment) => segment.title)];
    if (activeEntryId) {
      const node = entryMap[activeEntryId];
      if (node) {
        labels.push(node.title);
      }
    }
    return labels;
  }, [category, groupSegments, activeEntryId, entryMap]);

  const filteredResults = useMemo(() => {
    if (!sanitizedQuery) return [] as SearchResult[];
    const lower = sanitizedQuery.toLowerCase();
    return searchIndex.filter((item) => {
      const haystack = `${item.title} ${item.tags.join(" ")}`.toLowerCase();
      return haystack.includes(lower);
    });
  }, [sanitizedQuery, searchIndex]);

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setGroupStack([]);
    setActiveEntryId(null);
  };

  const handleSelectNode = (node: SiddurManifestNode) => {
    if (node.type === "group") {
      setGroupStack((prev) => [...prev, node.id]);
      setActiveEntryId(null);
    } else {
      setActiveEntryId(node.entryId);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    setSelectedCategoryId(result.categoryId);
    setGroupStack(result.groupPath);
    setActiveEntryId(result.entryId);
    setQuery("");
  };

  const handleBack = () => {
    if (activeEntryId) {
      setActiveEntryId(null);
      return;
    }
    if (groupStack.length > 0) {
      setGroupStack((prev) => prev.slice(0, -1));
      return;
    }
    setSelectedCategoryId(null);
  };

  const renderCategoryCards = () => {
    if (!manifest) {
      return (
        <p className="text-sm text-slate-500">Siddur content is loading…</p>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {manifest.categories.map((cat) => {
          const entryTotal = categoryCounts.get(cat.id) ?? 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-pomegranate hover:shadow-md focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{cat.title}</span>
              {cat.description ? (
                <span className="mt-2 text-sm text-slate-600 dark:text-slate-300">{cat.description}</span>
              ) : null}
              <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {entryTotal} placeholder entr{entryTotal === 1 ? "y" : "ies"}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderNodeList = () => {
    if (!category) return null;
    const nodes = getActiveNodes(category, groupStack);

    if (!nodes.length) {
      return <p className="text-sm text-slate-500">No prayers available in this section yet.</p>;
    }

    return (
      <div className="space-y-3">
        {nodes.map((node) => {
          if (node.type === "group") {
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => handleSelectNode(node)}
                className="flex w-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm transition hover:border-pomegranate hover:bg-white focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800"
              >
                <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{node.title}</span>
                {node.description ? (
                  <span className="mt-1 text-sm text-slate-600 dark:text-slate-300">{node.description}</span>
                ) : null}
                <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Explore prayers →</span>
              </button>
            );
          }

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handleSelectNode(node)}
              className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-pomegranate hover:shadow-md focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{node.title}</span>
              <EntryTags tags={Array.from(new Set([...(entryMap[node.entryId]?.tags ?? []), ...(node.tags ?? [])]))} />
            </button>
          );
        })}
      </div>
    );
  };

  const renderEntryView = () => {
    if (!category || !activeEntryId) return null;
    const entry = entryMap[activeEntryId];
    if (!entry) {
      return <p className="text-sm text-slate-500">This entry is not available yet.</p>;
    }

    const variantLabels = entry.variants.map((variant) => variant.label);

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{entry.title}</h2>
          {entry.heTitle ? (
            <p className="text-xl text-right font-semibold text-slate-700 dark:text-slate-200" dir="rtl">
              {entry.heTitle}
            </p>
          ) : null}
        </div>
        <VariantBadges labels={variantLabels} />
        <EntryTags tags={entry.tags ?? []} />
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <h3 className="text-lg font-semibold">Coming soon</h3>
          <p className="mt-2 text-sm">
            Full liturgy for this prayer will be added in a future update. For now, use this placeholder to explore the structure
            and associated nusach options.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Siddur</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Explore the prayer flow with placeholder content. Actual liturgy will arrive in future packs.
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <p>Transliteration preference: {transliterationMode}</p>
            <p>Preferred nusach: {nusach}</p>
          </div>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title or tag…"
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
        {(selectedCategoryId || activeEntryId || groupStack.length > 0) && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-pomegranate hover:text-pomegranate focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-600 dark:text-slate-300"
          >
            ← Back
          </button>
        )}
      </header>

      {sanitizedQuery ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search results</h2>
          {filteredResults.length === 0 ? (
            <p className="text-sm text-slate-500">No matches yet. Try a different title or tag.</p>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((result) => (
                <button
                  key={`${result.entryId}-${result.breadcrumbs.join("-")}`}
                  type="button"
                  onClick={() => handleSearchSelect(result)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-pomegranate hover:shadow-md focus:outline-none focus-visible:ring focus-visible:ring-pomegranate/60 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{result.title}</span>
                    <span className="text-xs text-slate-500">{result.breadcrumbs.join(" › ")}</span>
                    <EntryTags tags={result.tags} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {!sanitizedQuery && !activeEntryId && !groupStack.length && !selectedCategoryId
        ? renderCategoryCards()
        : null}

      {!sanitizedQuery && category && !activeEntryId ? renderNodeList() : null}

      {!sanitizedQuery && activeEntryId ? renderEntryView() : null}

      <footer className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
        Siddur entries currently contain placeholder text. Always consult a trusted rabbi or printed siddur for personal prayer.
      </footer>
    </div>
  );
};
