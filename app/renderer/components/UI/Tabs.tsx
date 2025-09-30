import clsx from "clsx";
import React, { useState } from "react";

export interface TabsProps {
  tabs: { id: string; label: string; panel: React.ReactNode }[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultIndex = 0, onChange }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div>
      <div role="tablist" className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selected}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              className={clsx(
                "rounded-t px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring focus-visible:ring-pomegranate",
                selected
                  ? "bg-white text-pomegranate dark:bg-slate-800 dark:text-pomegranate"
                  : "text-slate-600 hover:text-pomegranate dark:text-slate-300"
              )}
              onClick={() => {
                setActiveIndex(index);
                onChange?.(index);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            id={`${tab.id}-panel`}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
            hidden={index !== activeIndex}
          >
            {index === activeIndex ? tab.panel : null}
          </div>
        ))}
      </div>
    </div>
  );
};
