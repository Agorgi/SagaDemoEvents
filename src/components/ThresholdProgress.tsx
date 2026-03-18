import { cn, formatCompactNumber } from "@/src/lib/utils";

export function ThresholdProgress({
  current,
  target,
  label,
  compact = false
}: {
  current: number;
  target: number;
  label?: string;
  compact?: boolean;
}) {
  const progress = Math.max(0, Math.min(100, (current / Math.max(target, 1)) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs text-app-muted">
        <span>{label ?? "Threshold progress"}</span>
        <span>
          {formatCompactNumber(current)} / {formatCompactNumber(target)}
        </span>
      </div>
      <div className={cn("overflow-hidden rounded-full bg-white/[0.06]", compact ? "h-2" : "h-2.5")}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-app-purple to-[#5d7dff] transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

