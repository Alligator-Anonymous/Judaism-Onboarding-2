// Codex change: Routed nusach selection through the styled Select component.
import React from "react";
import { Select } from "@components/UI/Select";
import { useSettings, type Nusach } from "@stores/useSettings";

const NUSACH_LABELS: Record<Nusach, string> = {
  ashkenaz: "Ashkenaz",
  sefard: "Sefard",
  edot_hamizrach: "Edot HaMizrach"
};

export const NusachSelector: React.FC = () => {
  const { nusach, setNusach } = useSettings();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="nusach" className="text-sm font-medium">
        Nusach
      </label>
      <Select
        id="nusach"
        value={nusach}
        onChange={(event) => setNusach(event.target.value as Nusach)}
      >
        {Object.entries(NUSACH_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
};
