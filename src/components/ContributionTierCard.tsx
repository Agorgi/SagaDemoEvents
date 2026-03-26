"use client";

import { TagChip } from "@/src/components/Chips";
import { type CommissionTier } from "@/src/data/commissions";
import { cn, formatCurrency } from "@/src/lib/utils";

export function ContributionTierCard({
  tier,
  selected = false,
  onSelect
}: {
  tier: CommissionTier;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full rounded-[24px] bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.06]",
        selected && "bg-app-purple/10 shadow-[0_18px_32px_rgba(31,28,184,0.18)]"
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{tier.title}</p>
          <p className="mt-1 text-sm text-app-muted">{tier.description}</p>
        </div>
        <span className="rounded-full bg-app-purple/12 px-3 py-1 text-sm font-semibold text-[#E0DEFF]">
          {formatCurrency(tier.amount)}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tier.perks.map((perk) => (
          <TagChip key={perk} label={perk} subdued />
        ))}
      </div>
    </button>
  );
}
