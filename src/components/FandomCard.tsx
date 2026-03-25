"use client";

import Link from "next/link";

import { TagChip } from "@/src/components/Chips";
import { type Fandom } from "@/src/data/social";

export function FandomCard({
  fandom,
  href
}: {
  fandom: Fandom;
  href: string;
}) {
  return (
    <Link className="surface-card group block overflow-hidden p-3 transition hover:border-white/12" href={href}>
      <div className="relative overflow-hidden rounded-[26px]">
        <img
          alt={fandom.name}
          className="h-[188px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          src={fandom.coverImageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/30 to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/12 bg-black/28 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            {fandom.vibe}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-xl font-semibold text-white">{fandom.name}</p>
          <p className="mt-1 text-sm text-white/72">{fandom.memberIds.length} people in this cluster</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="line-clamp-2 text-sm text-app-muted">{fandom.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {fandom.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} label={tag} subdued />
          ))}
        </div>
      </div>
    </Link>
  );
}
