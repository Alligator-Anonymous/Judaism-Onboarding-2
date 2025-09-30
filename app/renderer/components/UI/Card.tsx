import clsx from "clsx";
import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "accent";
}

export const Card: React.FC<CardProps> = ({ tone = "default", className, ...rest }) => {
  return (
    <div
      className={clsx(
        "rounded-xl border p-4 shadow-sm transition-colors",
        tone === "accent"
          ? "border-pomegranate/40 bg-pomegranate/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
        className,
      )}
      {...rest}
    />
  );
};
