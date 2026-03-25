"use client";

export function StarRatingValue({
  rating,
  variant = "stacked"
}: {
  rating: number;
  variant?: "stacked" | "inline";
}) {
  const clampedRating = Math.max(0, Math.min(5, rating));
  const fillPercent = `${(clampedRating / 5) * 100}%`;
  const stars = (
    <div className="relative text-[13px] leading-none tracking-[0.14em]">
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
  );

  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-2">
        {stars}
        <span className="text-xs font-semibold text-white">{clampedRating.toFixed(1)}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg font-semibold text-white">{clampedRating.toFixed(1)}</p>
      <div className="mt-1">{stars}</div>
    </div>
  );
}
