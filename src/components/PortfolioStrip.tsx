"use client";

import { type CreatorPortfolioItem } from "@/src/data/creator-profiles";

export function PortfolioStrip({
  items
}: {
  items: CreatorPortfolioItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 subtle-scrollbar">
      {items.map((item) => (
        <div
          className="w-[180px] shrink-0 overflow-hidden rounded-[24px] border border-white/8 bg-[#0d1119]"
          key={item.id}
        >
          <img
            alt={item.title ?? "Portfolio item"}
            className="h-[220px] w-full object-cover"
            src={item.image}
          />
        </div>
      ))}
    </div>
  );
}
