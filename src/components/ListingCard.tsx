"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { type Listing, type ListingInterestKind } from "@/src/data/economy";
import { getUserById } from "@/src/data/demo";
import { cn } from "@/src/lib/utils";

const actionLabel: Record<ListingInterestKind, string> = {
  saved: "Saved",
  requested: "Requested",
  mock_purchased: "Tracked"
};

export function ListingCard({
  listing,
  href,
  interestKind,
  onPrimaryAction,
  compact = false
}: {
  listing: Listing;
  href: string;
  interestKind?: ListingInterestKind;
  onPrimaryAction?: () => void;
  compact?: boolean;
}) {
  const creator = getUserById(listing.creatorUserId);

  return (
    <article className={cn("surface-card overflow-hidden", compact ? "p-3" : "p-4")}>
      <div className="overflow-hidden rounded-[24px]">
        <Link href={href}>
          <img
            alt={listing.title}
            className={cn(
              "w-full object-cover transition duration-500 hover:scale-[1.02]",
              compact ? "h-[150px]" : "h-[190px]"
            )}
            src={listing.imageUrl}
          />
        </Link>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
          {listing.sublabel}
        </p>
        <Link href={href}>
          <h3 className="mt-2 text-xl font-semibold text-white">{listing.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-white/72">{listing.summary}</p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Avatar name={creator?.name ?? "Creator"} size="sm" src={creator?.avatarUrl} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{creator?.name ?? "Creator"}</p>
          <p className="truncate text-xs text-app-muted">
            {listing.priceLabel} · {listing.city}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {listing.fandomTags.slice(0, 2).map((tag) => (
            <TagChip key={tag} label={tag} subdued />
          ))}
        </div>
        <button
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
            interestKind
              ? "border border-white/10 text-white hover:border-white/20"
              : "bg-app-purple text-white hover:bg-app-purple-hover"
          )}
          onClick={onPrimaryAction}
          type="button"
        >
          {interestKind ? actionLabel[interestKind] : "Open"}
        </button>
      </div>
    </article>
  );
}
