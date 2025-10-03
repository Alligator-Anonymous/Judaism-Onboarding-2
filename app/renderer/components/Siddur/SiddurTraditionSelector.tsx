import React from "react";
import { Select } from "@components/UI/Select";
import { useSettings, type SiddurTradition } from "@stores/useSettings";

const TRADITION_LABELS: Record<SiddurTradition, string> = {
  ashkenaz: "Ashkenaz",
  sefard: "Nusach Sefard",
  edot_hamizrach: "Edot HaMizrach"
};

export const SiddurTraditionSelector: React.FC = () => {
  const { siddurTradition, setSiddurTradition } = useSettings();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="siddur-tradition" className="text-sm font-medium">
        Siddur tradition
      </label>
      <Select
        id="siddur-tradition"
        value={siddurTradition}
        onChange={(event) => setSiddurTradition(event.target.value as SiddurTradition)}
      >
        {Object.entries(TRADITION_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
};
