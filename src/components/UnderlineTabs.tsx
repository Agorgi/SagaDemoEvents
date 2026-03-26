"use client";

import { cn } from "@/src/lib/utils";

export function UnderlineTabs<T extends string>({
  value,
  onChange,
  items,
  className
}: {
  value: T;
  onChange: (value: T) => void;
  items: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-6 border-b border-white/6", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            className={cn(
              "relative min-h-[42px] pb-3 text-sm font-semibold transition",
              active ? "text-white" : "text-app-muted hover:text-white"
            )}
            key={item.value}
            onClick={() => onChange(item.value)}
            type="button"
          >
            {item.label}
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-white transition-opacity",
                active ? "opacity-100" : "opacity-0"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
