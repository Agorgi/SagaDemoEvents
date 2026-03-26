"use client";

import { cn } from "@/src/lib/utils";

export function VolunteerBadge({
  variant = "default",
  className
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-[#F0C453]/26 bg-[#F0C453]/10 font-semibold uppercase text-[#F0C453] backdrop-blur-sm",
        variant === "compact"
          ? "px-2.5 py-[5px] text-[10px] tracking-[0.1em]"
          : "px-3 py-1 text-[11px] tracking-[0.12em]",
        className
      )}
    >
      Volunteer
    </span>
  );
}
