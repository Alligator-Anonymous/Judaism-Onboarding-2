// Codex change: Book listing for a given Tanakh section.
import React from "react";
import { useContent } from "@stores/useContent";
import { Breadcrumbs } from "./Breadcrumbs";
import { getSectionBySlug, type ManifestBookInfo, type ManifestGroupInfo } from "@lib/tanakhMetadata";

interface SectionIndexProps {
  sectionSlug: string;
}

export const SectionIndex: React.FC<SectionIndexProps> = ({ sectionSlug }) => {
  const tanakhManifest = useContent((state) => state.registry?.tanakhManifest);
  const section = getSectionBySlug(tanakhManifest, sectionSlug);
  const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setOpenFolders({});
  }, [sectionSlug]);

  if (!tanakhManifest) {
    return <p className="text-sm text-slate-500">Loading Tanakh metadata…</p>;
  }

  if (!section) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={[{ label: "Texts", href: "#/texts" }, { label: "Tanakh", href: "#/texts/tanakh" }, { label: "Unknown section", current: true }]} />
        <p className="text-sm text-red-600 dark:text-red-400">That section was not found. Please choose another.</p>
      </div>
    );
  }

  const renderBookCard = (book: ManifestBookInfo) => (
    <a
      key={book.id}
      href={`#/texts/tanakh/${section.id}/${book.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pomegranate hover:shadow-lg focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{book.en}</h3>
        <span dir="rtl" className="text-base font-medium text-pomegranate">
          {book.he}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {book.chapters} chapter{book.chapters === 1 ? "" : "s"}
      </p>
    </a>
  );

  const toggleFolder = (groupId: string) => {
    setOpenFolders((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  const renderFolder = (group: ManifestGroupInfo) => {
    const isOpen = openFolders[group.id] ?? false;
    return (
      <div key={group.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => toggleFolder(group.id)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left text-slate-800 transition hover:bg-pomegranate/10 focus:outline-none focus-visible:ring focus-visible:ring-pomegranate dark:text-slate-100"
        >
          <span className="text-base font-semibold">{group.en}</span>
          <span aria-hidden="true" className="text-sm font-medium text-pomegranate">
            {isOpen ? "−" : "+"}
          </span>
        </button>
        {isOpen ? (
          <div className="space-y-4 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
            {group.books.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.books.map(renderBookCard)}
              </div>
            ) : null}
            {group.groups.map((nested) =>
              nested.type === "folder" ? renderFolder(nested) : renderGroup(nested)
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderGroup = (group: ManifestGroupInfo): React.ReactNode => {
    if (group.type === "folder") {
      return renderFolder(group);
    }
    return (
      <section key={group.id} className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{group.en}</h3>
            {group.he ? (
              <span dir="rtl" className="text-base font-medium text-pomegranate">
                {group.he}
              </span>
            ) : null}
          </div>
        </div>
        {group.books.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{group.books.map(renderBookCard)}</div>
        ) : null}
        {group.groups.length ? group.groups.map((nested) => renderGroup(nested)) : null}
      </section>
    );
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Texts", href: "#/texts" },
          { label: "Tanakh", href: "#/texts/tanakh" },
          { label: section.en, current: true }
        ]}
      />
      <header className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{section.en}</h2>
          <span dir="rtl" className="text-xl font-medium text-pomegranate">
            {section.he}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Choose a book to explore its chapters.
        </p>
      </header>
      {section.groups.length ? (
        <div className="space-y-8">
          {section.groups.map((group) => renderGroup(group))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{section.books.map(renderBookCard)}</div>
      )}
    </div>
  );
};
