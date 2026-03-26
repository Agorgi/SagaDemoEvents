"use client";

import { cn } from "@/src/lib/utils";

export function PageHeroHeader({
  eyebrow,
  label,
  title,
  subtitle,
  className
}: {
  eyebrow: string;
  label?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <section className={cn("space-y-1.5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-app-muted">
        {eyebrow}
      </p>
      {label ? <p className="text-sm text-white/74">{label}</p> : null}
      <h1 className="max-w-[14ch] text-[1.85rem] font-semibold tracking-[-0.045em] text-white sm:text-[2.15rem]">
        {title}
      </h1>
      {subtitle ? <p className="text-sm text-white/58">{subtitle}</p> : null}
    </section>
  );
}
