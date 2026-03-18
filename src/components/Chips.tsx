"use client";

import { cn } from "@/src/lib/utils";

export function FilterChip({
  label,
  active = false,
  onClick
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn("pill", active ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function TagChip({
  label,
  subdued = false
}: {
  label: string;
  subdued?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.02em]",
        subdued
          ? "border-white/8 bg-white/5 text-app-muted"
          : "border-app-purple/40 bg-app-purple/10 text-[#D7D6FF]"
      )}
    >
      {label}
    </span>
  );
}

export function OpenRolesPill({
  count,
  emphasized = false
}: {
  count: number;
  emphasized?: boolean;
}) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-app-success/40 bg-app-success/10 px-3 py-1 text-xs font-semibold text-app-success">
        Staffed
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        emphasized
          ? "border-app-purple/40 bg-app-purple/15 text-[#E0DEFF]"
          : "border-app-purple/35 text-[#CFCDFE]"
      )}
    >
      Open Roles: {count}
    </span>
  );
}

export function StatusChip({
  label,
  tone
}: {
  label: string;
  tone: "open" | "invited" | "filled" | "neutral";
}) {
  const toneClasses = {
    open: "border-app-purple/40 bg-app-purple/10 text-[#D8D6FF]",
    invited: "border-[#FFD166]/30 bg-[#FFD166]/10 text-[#FFD166]",
    filled: "border-app-success/30 bg-app-success/10 text-app-success",
    neutral: "border-white/10 bg-white/5 text-app-muted"
  };

  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", toneClasses[tone])}>
      {label}
    </span>
  );
}
