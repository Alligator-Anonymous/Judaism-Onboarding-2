import React from "react";
import clsx from "clsx";
import { useContent } from "@stores/useContent";
import { useSettings } from "@stores/useSettings";
import {
  buildSiddurNavigation,
  createSiddurFilterContext,
  getTodaySiddurOutline,
  type SiddurFilterContext,
  type SiddurNavigationBucket,
  type SiddurNavigationCategory,
  type SiddurNavigationItem,
  type SiddurNavigationService
} from "@lib/siddur";
import type { SiddurMetadata, SiddurTradition } from "@/types/siddur";

interface SearchResult {
  item: SiddurNavigationItem;
  category: SiddurNavigationCategory;
  service: SiddurNavigationService;
  bucket: SiddurNavigationBucket;
}

const formatApplicabilityBadge = (applicable: boolean, showOnlyApplicable: boolean) => {
  if (showOnlyApplicable || applicable) {
    return null;
  }
  return (
    <span className="ml-3 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
      Not in effect today
    </span>
  );
};

const PlaceholderText: React.FC = () => (
  <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
    Text coming soon. This placeholder will update when primary sources are added.
  </div>
);

function ensureActiveCategory(
  navigation: ReturnType<typeof buildSiddurNavigation>,
  activeId: string | null
): string | null {
  if (activeId && navigation.categoryMap.has(activeId)) {
    return activeId;
  }
  const first = navigation.categories[0];
  return first ? first.category.id : null;
}

function ensureActiveService(
  navigation: ReturnType<typeof buildSiddurNavigation>,
  categoryId: string | null,
  activeId: string | null
): string | null {
  if (!categoryId) return null;
  const category = navigation.categoryMap.get(categoryId);
  if (!category) return null;
  if (activeId && category.services.some((service) => service.service.id === activeId)) {
    return activeId;
  }
  const first = category.services[0];
  return first ? first.service.id : null;
}

function ensureActiveBucket(
  navigation: ReturnType<typeof buildSiddurNavigation>,
  serviceId: string | null,
  activeId: string | null
): string | null {
  if (!serviceId) return null;
  const service = navigation.serviceMap.get(serviceId);
  if (!service) return null;
  if (activeId && service.buckets.some((bucket) => bucket.bucket.id === activeId)) {
    return activeId;
  }
  const first = service.buckets[0];
  return first ? first.bucket.id : null;
}

const SiddurView: React.FC = () => {
  const { registry, hydrate } = useContent();
  const tradition = useSettings((state) => state.siddurTradition);
  const mode = useSettings((state) => state.siddurMode);
  const showOnlyApplicable = useSettings((state) => state.siddurShowApplicable);
  const diasporaOrIsrael = useSettings((state) => (state.parshaCycle === "israel" ? "israel" : "diaspora"));

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const metadata = (registry?.siddur.metadata ?? null) as SiddurMetadata | null;

  const context = React.useMemo<SiddurFilterContext>(() => {
    return createSiddurFilterContext({
      date: new Date(),
      diasporaOrIsrael,
      hasMinyan: false,
      isMourner: false
    });
  }, [diasporaOrIsrael]);

  const navigation = React.useMemo(() => {
    return buildSiddurNavigation({
      metadata,
      tradition,
      mode,
      showOnlyApplicable,
      context
    });
  }, [metadata, tradition, mode, showOnlyApplicable, context]);

  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);
  const [activeServiceId, setActiveServiceId] = React.useState<string | null>(null);
  const [activeBucketId, setActiveBucketId] = React.useState<string | null>(null);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const categoryId = ensureActiveCategory(navigation, activeCategoryId);
    setActiveCategoryId(categoryId);
  }, [navigation.categories.length]);

  React.useEffect(() => {
    const categoryId = ensureActiveCategory(navigation, activeCategoryId);
    const serviceId = ensureActiveService(navigation, categoryId, activeServiceId);
    setActiveServiceId(serviceId);
    const bucketId = ensureActiveBucket(navigation, serviceId, activeBucketId);
    setActiveBucketId(bucketId);
    if (activeItemId && (!bucketId || !navigation.itemMap.has(activeItemId))) {
      setActiveItemId(null);
    }
  }, [navigation, activeCategoryId, activeServiceId, activeBucketId, activeItemId]);

  const activeCategory = activeCategoryId ? navigation.categoryMap.get(activeCategoryId) ?? null : null;
  const activeService = activeServiceId ? navigation.serviceMap.get(activeServiceId) ?? null : null;
  const activeBucket = activeBucketId ? navigation.bucketMap.get(activeBucketId) ?? null : null;
  const activeItem = activeItemId ? navigation.itemMap.get(activeItemId) ?? null : null;

  const searchResults = React.useMemo<SearchResult[]>(() => {
    if (!searchTerm) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    const results: SearchResult[] = [];
    navigation.categories.forEach((category) => {
      category.services.forEach((service) => {
        service.buckets.forEach((bucket) => {
          bucket.items.forEach((item) => {
            const haystack = `${item.item.title} ${item.item.description ?? ""}`.toLowerCase();
            if (haystack.includes(term)) {
              results.push({ item, category, service, bucket });
            }
          });
        });
      });
    });
    return results;
  }, [searchTerm, navigation]);

  const handleBack = () => {
    if (activeItemId) {
      setActiveItemId(null);
      return;
    }
    if (activeBucketId) {
      setActiveBucketId(null);
      return;
    }
    if (activeServiceId) {
      setActiveServiceId(null);
      setActiveBucketId(null);
      return;
    }
    if (activeCategoryId) {
      setActiveCategoryId(null);
      setActiveServiceId(null);
      setActiveBucketId(null);
      return;
    }
  };

  if (!metadata) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500 dark:text-slate-300">Loading siddur structure…</p>
      </div>
    );
  }

  const hasResults = navigation.categories.length > 0;

  const renderCategoryList = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {navigation.categories.map((category) => (
        <button
          key={category.category.id}
          type="button"
          onClick={() => {
            setActiveCategoryId(category.category.id);
            setActiveServiceId(null);
            setActiveBucketId(null);
            setActiveItemId(null);
          }}
          className={clsx(
            "rounded-2xl border p-5 text-left shadow-sm transition",
            activeCategoryId === category.category.id
              ? "border-pomegranate shadow-md"
              : "border-slate-200 hover:border-pomegranate/70 hover:shadow"
          )}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{category.category.title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{category.category.description}</p>
          {formatApplicabilityBadge(category.applicableToday, showOnlyApplicable)}
        </button>
      ))}
    </div>
  );

  const renderServiceList = (category: SiddurNavigationCategory) => (
    <div className="space-y-4">
      {category.services.map((service) => (
        <button
          key={service.service.id}
          type="button"
          onClick={() => {
            setActiveServiceId(service.service.id);
            setActiveBucketId(null);
            setActiveItemId(null);
          }}
          className={clsx(
            "w-full rounded-xl border p-4 text-left shadow-sm transition",
            activeServiceId === service.service.id
              ? "border-pomegranate shadow-md"
              : "border-slate-200 hover:border-pomegranate/70 hover:shadow"
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{service.service.title}</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{service.service.description}</p>
            </div>
            {formatApplicabilityBadge(service.applicableToday, showOnlyApplicable)}
          </div>
        </button>
      ))}
    </div>
  );

  const renderBucketList = (service: SiddurNavigationService) => (
    <div className="space-y-4">
      {service.buckets.map((bucket) => (
        <button
          key={bucket.bucket.id}
          type="button"
          onClick={() => {
            setActiveBucketId(bucket.bucket.id);
            setActiveItemId(null);
          }}
          className={clsx(
            "w-full rounded-xl border p-4 text-left shadow-sm transition",
            activeBucketId === bucket.bucket.id
              ? "border-pomegranate shadow-md"
              : "border-slate-200 hover:border-pomegranate/70 hover:shadow"
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">{bucket.bucket.title}</h5>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{bucket.bucket.description}</p>
            </div>
            {formatApplicabilityBadge(bucket.applicableToday, showOnlyApplicable)}
          </div>
        </button>
      ))}
    </div>
  );

  const renderItemList = (bucket: SiddurNavigationBucket) => (
    <div className="space-y-3">
      {bucket.items.map((entry) => (
        <button
          key={entry.item.id}
          type="button"
          onClick={() => setActiveItemId(entry.item.id)}
          className={clsx(
            "w-full rounded-xl border p-4 text-left shadow-sm transition",
            activeItemId === entry.item.id
              ? "border-pomegranate shadow-md"
              : "border-slate-200 hover:border-pomegranate/70 hover:shadow"
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{entry.item.title}</div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{entry.item.description}</p>
            </div>
            {formatApplicabilityBadge(entry.applicableToday, showOnlyApplicable)}
          </div>
        </button>
      ))}
    </div>
  );

  const renderItemDetail = (entry: SiddurNavigationItem, bucket: SiddurNavigationBucket, service: SiddurNavigationService, category: SiddurNavigationCategory) => (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {category.category.title} → {service.service.title} → {bucket.bucket.title}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{entry.item.title}</h2>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{entry.item.description}</p>
        {entry.item.outline && entry.item.outline.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Outline</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-slate-600 dark:text-slate-300">
              {entry.item.outline.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {!entry.applicableToday && !showOnlyApplicable ? (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/40 dark:text-amber-200">
            This item is not in effect right now. Check the notes for when it is used.
          </div>
        ) : null}
        {entry.item.notes ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <span className="font-semibold">Notes:</span> {entry.item.notes}
          </div>
        ) : null}
        <PlaceholderText />
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Applicability</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>Mode: {mode === "basic" ? "Basic" : "Full"}</li>
          <li>Tradition: {formatTraditionLabel(tradition)}</li>
          <li>
            Status: {entry.applicableToday ? "Active today" : "Not active today"}
          </li>
        </ul>
      </div>
    </div>
  );

  const formatTraditionLabel = (value: SiddurTradition) => {
    switch (value) {
      case "ashkenaz":
        return "Ashkenaz";
      case "sefard":
        return "Sefard";
      case "edot_hamizrach":
        return "Edot HaMizrach";
      default:
        return value;
    }
  };

  const renderSearchResults = () => (
    <div className="space-y-3">
      {searchResults.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-300">No prayers matched your search.</p>
      ) : (
        searchResults.map(({ item, bucket, service, category }) => (
          <button
            key={`${item.item.id}-${bucket.bucket.id}`}
            type="button"
            onClick={() => {
              setActiveCategoryId(category.category.id);
              setActiveServiceId(service.service.id);
              setActiveBucketId(bucket.bucket.id);
              setActiveItemId(item.item.id);
            }}
            className="w-full rounded-xl border border-slate-200 p-4 text-left shadow-sm transition hover:border-pomegranate/70 hover:shadow dark:border-slate-700"
          >
            <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {category.category.title} → {service.service.title} → {bucket.bucket.title}
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{item.item.title}</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.item.description}</p>
            {formatApplicabilityBadge(item.applicableToday, showOnlyApplicable)}
          </button>
        ))
      )}
    </div>
  );

  const todaySummary = React.useMemo(() => {
    if (!metadata) return [] as SiddurNavigationCategory[];
    return getTodaySiddurOutline(metadata, tradition, mode, context);
  }, [metadata, tradition, mode, context]);

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Siddur</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Browse structured categories for each service. Mode: {mode === "basic" ? "Basic" : "Full"} · Tradition: {formatTraditionLabel(tradition)}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label htmlFor="siddur-search" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Search prayers
        </label>
        <input
          id="siddur-search"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by title or description"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-950"
        />
        {searchTerm ? (
          <div className="mt-4">{renderSearchResults()}</div>
        ) : null}
      </section>

      {!showOnlyApplicable ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Today at a glance</h2>
          {todaySummary.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No specific items are active today with the current filters.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {todaySummary.map((category) => (
                <li key={category.category.id}>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{category.category.title}</span>
                  <ul className="mt-1 space-y-1 pl-4">
                    {category.services.map((service) => (
                      <li key={service.service.id}>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{service.service.title}</span>
                        <ul className="mt-1 space-y-1 pl-4">
                          {service.buckets.map((bucket) => (
                            <li key={bucket.bucket.id}>
                              <span className="text-slate-600 dark:text-slate-300">{bucket.bucket.title}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {searchTerm ? null : !hasResults ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          No siddur entries match your current filters. Try switching to Full mode or disabling the "Show only what applies today" option.
        </div>
      ) : (
        <section className="space-y-4">
          {activeCategory && activeService && activeBucket && activeItem ? (
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-pomegranate hover:text-pomegranate/80"
              >
                ← Back
              </button>
              {renderItemDetail(activeItem, activeBucket, activeService, activeCategory)}
            </div>
          ) : activeCategory && activeService && activeBucket ? (
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-pomegranate hover:text-pomegranate/80"
              >
                ← Back
              </button>
              {renderItemList(activeBucket)}
            </div>
          ) : activeCategory && activeService ? (
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-pomegranate hover:text-pomegranate/80"
              >
                ← Back
              </button>
              {renderBucketList(activeService)}
            </div>
          ) : activeCategory ? (
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-pomegranate hover:text-pomegranate/80"
              >
                ← Back
              </button>
              {renderServiceList(activeCategory)}
            </div>
          ) : (
            renderCategoryList()
          )}
        </section>
      )}
    </div>
  );
};

export default SiddurView;
