"use client";

import { type EarningsSummary } from "@/src/data/creator-profiles";

export function EarningsSummaryCard({
  earnings
}: {
  earnings: EarningsSummary;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(22,27,43,0.96),rgba(13,17,27,0.98))] p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Total Earnings</p>
          <p className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-white">
            {earnings.total}
          </p>
        </div>
        {earnings.monthlyChangeLabel ? (
          <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            {earnings.monthlyChangeLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[20px] bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-app-purple" />
            <p className="text-xs uppercase tracking-[0.14em] text-app-muted">Available</p>
          </div>
          <p className="mt-2 text-base font-semibold text-white">{earnings.available}</p>
        </div>
        <div className="rounded-[20px] bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#7B84FF]" />
            <p className="text-xs uppercase tracking-[0.14em] text-app-muted">Pending</p>
          </div>
          <p className="mt-2 text-base font-semibold text-white">{earnings.pending}</p>
        </div>
      </div>
    </section>
  );
}
