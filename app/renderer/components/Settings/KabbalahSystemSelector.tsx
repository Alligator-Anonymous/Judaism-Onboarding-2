// Codex change: Styled the kabbalah system selector with the shared Select wrapper.
import React from "react";
import { Select } from "@components/UI/Select";
import { useSettings } from "@stores/useSettings";

const OPTIONS = [
  { id: "none",    label: "None (hide mappings)" },
  { id: "gra",     label: "GRA (Vilna Gaon)" },
  { id: "ari",     label: "Ari (Lurianic)" },
  { id: "ramak",   label: "Ramak (Cordovero)" },
  { id: "kircher", label: "Golden Dawn (comparative)" }
] as const;

export function KabbalahSystemSelector() {
  const system = useSettings((s) => s.kabbalahSystem);
  const setSystem = useSettings((s) => s.setKabbalahSystem);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">Kabbalah system</span>
      <Select value={system} onChange={(e) => setSystem(e.target.value as any)}>
        {OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </Select>
      <p className="text-xs text-slate-500">
        Traditions differ; choose with a qualified teacher. (Golden Dawn is shown for comparison.)
      </p>
    </label>
  );
}
