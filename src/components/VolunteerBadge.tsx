"use client";

import { cn } from "@/src/lib/utils";

export function VolunteerBadge({
  className
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-[#F0C453]/30 bg-[#F0C453]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F0C453] backdrop-blur-sm",
        className
      )}
    >
      Volunteer
    </span>
  );
}
