"use client";

import { formatCurrency } from "@/src/lib/utils";

export function CommissionProgress({
  goalAmount,
  raisedAmount,
  compact = false
}: {
  goalAmount: number;
  raisedAmount: number;
  compact?: boolean;
}) {
  const progress = Math.min(
    100,
    Math.round((raisedAmount / Math.max(goalAmount, 1)) * 100)
  );

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={compact ? "h-[8px] rounded-full bg-white/6" : "h-[10px] rounded-full bg-white/6"}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-app-purple to-[#6B66FF] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-semibold text-white">
          {formatCurrency(raisedAmount)}
          <span className="font-medium text-app-muted"> raised</span>
        </p>
        <p className="text-app-muted">of {formatCurrency(goalAmount)}</p>
      </div>
    </div>
  );
}
