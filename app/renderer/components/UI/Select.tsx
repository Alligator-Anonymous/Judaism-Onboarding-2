// Codex change: Added a themed select wrapper for consistent light/dark styling.
import React from "react";
import clsx from "clsx";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clsx(
          "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
