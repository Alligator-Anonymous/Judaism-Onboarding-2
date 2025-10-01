import React from "react";
import { useSettings, type Nusach } from "@stores/useSettings";

const NUSACH_LABELS: Record<Nusach, string> = {
  ashkenaz: "Ashkenaz",
  sefard: "Sefard",
  "edot-mizrach": "Edot Mizrach"
};

export const NusachSelector: React.FC = () => {
  const { nusach, setNusach } = useSettings();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="nusach" className="text-sm font-medium">
        Nusach
      </label>
      <select
        id="nusach"
        className="rounded-lg border border-slate-300 px-3 py-1 text-sm focus:border-pomegranate focus:outline-none focus:ring focus:ring-pomegranate/30 dark:border-slate-600 dark:bg-slate-900"
        value={nusach}
        onChange={(event) => setNusach(event.target.value as Nusach)}
      >
        {Object.entries(NUSACH_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
