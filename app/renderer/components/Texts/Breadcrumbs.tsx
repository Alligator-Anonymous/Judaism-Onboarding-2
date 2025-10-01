// Codex change: Shared breadcrumb trail for the Texts explorer hierarchy.
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600 dark:text-slate-300">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = item.href && !item.current ? (
            <a
              href={item.href}
              className="font-medium text-pomegranate transition hover:underline"
            >
              {item.label}
            </a>
          ) : (
            <span className={item.current ? "font-semibold text-slate-900 dark:text-slate-100" : undefined}>
              {item.label}
            </span>
          );

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {content}
              {!isLast ? <span aria-hidden="true">›</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
