import { cn } from "@/src/lib/utils";

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]",
        className
      )}
    />
  );
}

export function CardSkeleton({
  className
}: {
  className?: string;
}) {
  return (
    <div className={cn("surface-card p-4", className)}>
      <SkeletonBlock className="mb-4 h-44 w-full rounded-[20px]" />
      <SkeletonBlock className="mb-2 h-4 w-1/3" />
      <SkeletonBlock className="mb-2 h-7 w-3/4" />
      <SkeletonBlock className="h-4 w-1/2" />
    </div>
  );
}
