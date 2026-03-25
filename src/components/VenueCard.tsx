"use client";

import Link from "next/link";

import { type BusinessProfile } from "@/src/data/economy";
import { cn } from "@/src/lib/utils";

export function VenueCard({
  business,
  href,
  metadataLine,
  contextLine,
  statusLabel,
  onPrimaryAction
}: {
  business: BusinessProfile;
  href: string;
  metadataLine: string;
  contextLine: string;
  statusLabel: string;
  onPrimaryAction?: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,21,34,0.94),rgba(10,13,20,0.98))] shadow-card transition hover:border-white/12">
      <Link className="block" href={href}>
        <div className="relative overflow-hidden">
          <img
            alt={business.name}
            className="h-[250px] w-full object-cover transition duration-500 group-hover:scale-[1.02] sm:h-[290px]"
            src={business.coverImageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/10 to-transparent" />
          <div className="absolute left-4 top-4">
            <VenueStateChip label={statusLabel} />
          </div>
        </div>
      </Link>

      <div className="space-y-2.5 p-4 sm:p-5">
        <div className="space-y-1.5">
          <Link href={href}>
            <h3 className="line-clamp-2 text-[26px] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
              {business.name}
            </h3>
          </Link>
          <p className="text-sm text-white/66">{metadataLine}</p>
          <p className="line-clamp-1 text-sm text-app-muted">{contextLine}</p>
        </div>

        <button
          className="min-h-[46px] w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onPrimaryAction ?? (() => window.location.assign(href))}
          type="button"
        >
          View venue
        </button>
      </div>
    </article>
  );
}

function VenueStateChip({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-white/12 bg-[#0a0d14]/72 px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm"
      )}
    >
      {label}
    </span>
  );
}
