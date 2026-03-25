"use client";

export function StarRatingValue({ rating }: { rating: number }) {
  const clampedRating = Math.max(0, Math.min(5, rating));
  const fillPercent = `${(clampedRating / 5) * 100}%`;

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg font-semibold text-white">{clampedRating.toFixed(1)}</p>
      <div className="relative mt-1 text-[13px] leading-none tracking-[0.14em]">
        <span aria-hidden="true" className="text-white/12">
          ★★★★★
        </span>
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-[#F6C453]"
          style={{ width: fillPercent }}
        >
          ★★★★★
        </span>
      </div>
    </div>
  );
}
