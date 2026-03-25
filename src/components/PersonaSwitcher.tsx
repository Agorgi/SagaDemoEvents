"use client";

import { demoPersonaPresets } from "@/src/data/social";
import { useAppState } from "@/src/lib/app-state";

export function PersonaSwitcher({
  className = "",
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  const { activePersonaId, switchPersona } = useAppState();

  return (
    <label
      className={`flex items-center gap-2 rounded-[16px] border border-white/8 bg-white/[0.03] ${compact ? "px-2.5 py-2" : "px-3 py-2"} ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-app-muted">
        Persona
      </span>
      <select
        aria-label="Switch demo persona"
        className={`${compact ? "max-w-[150px]" : "max-w-[180px]"} bg-transparent text-sm font-semibold text-white outline-none`}
        onChange={(event) => switchPersona(event.target.value)}
        value={activePersonaId}
      >
        {demoPersonaPresets.map((persona) => (
          <option className="bg-[#090b10]" key={persona.id} value={persona.id}>
            {persona.label}
          </option>
        ))}
      </select>
    </label>
  );
}
