"use client";

import { cn } from "@/src/lib/utils";

export function LaunchChoiceCard({
  title,
  subtitle,
  accentClassName,
  onClick
}: {
  title: string;
  subtitle: string;
  accentClassName: string;
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
        <p className="text-[28px] font-semibold text-white sm:text-[32px]">{title}</p>
        <p className="max-w-[24ch] text-sm leading-6 text-white/72">{subtitle}</p>
      </div>
    </button>
  );
}
