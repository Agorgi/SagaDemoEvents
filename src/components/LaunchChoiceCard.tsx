"use client";

import { cn } from "@/src/lib/utils";

export function LaunchChoiceCard({
  title,
  subtitle,
  accentClassName,
  badge,
  onClick
}: {
  title: string;
  subtitle: string;
  accentClassName: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "launch-choice-card surface-card-strong w-full rounded-[30px] px-5 py-6 text-left transition hover:-translate-y-[1px] hover:border-white/12 sm:px-6 sm:py-7",
        accentClassName
      )}
      onClick={onClick}
      type="button"
    >
      <div className="space-y-2">
        {badge ? (
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">
            {badge}
          </span>
        ) : null}
        <p className="text-[28px] font-semibold text-white sm:text-[32px]">{title}</p>
        <p className="max-w-[24ch] text-sm leading-6 text-white/72">{subtitle}</p>
      </div>
    </button>
  );
}
