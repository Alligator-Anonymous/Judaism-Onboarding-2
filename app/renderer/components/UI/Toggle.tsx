import clsx from "clsx";
import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description }) => (
  <label className="flex cursor-pointer items-center gap-3">
    <span className="flex flex-col">
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
      {description ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
      ) : null}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition",
        checked ? "bg-pomegranate" : "bg-slate-300 dark:bg-slate-600",
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white transition",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  </label>
);
