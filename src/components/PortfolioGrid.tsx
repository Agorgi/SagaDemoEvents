"use client";

import { type CreatorPortfolioItem } from "@/src/data/creator-profiles";

export function PortfolioGrid({
  items,
  emptyText = "Nothing here yet."
}: {
  items: CreatorPortfolioItem[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center">
        <p className="text-sm text-app-muted">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((item) => (
        <div className="aspect-square overflow-hidden rounded-[18px] bg-[#0f1320]" key={item.id}>
          <img
            alt={item.title ?? "Portfolio item"}
            className="h-full w-full object-cover"
            src={item.image}
          />
        </div>
      ))}
    </div>
  );
}
