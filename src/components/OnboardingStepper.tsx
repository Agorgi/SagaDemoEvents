import { cn } from "@/src/lib/utils";

export function OnboardingStepper({
  current,
  labels
}: {
  current: number;
  labels: string[];
}) {
  return (
    <div className="space-y-3">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
      >
        {labels.map((label, index) => {
          const active = index === current;
          const complete = index < current;

          return (
            <div
              className={cn(
                "h-2 rounded-full transition",
                complete || active ? "bg-app-purple" : "bg-white/[0.08]"
              )}
              key={label}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.16em] text-app-muted">
        <span>Step {current + 1} of {labels.length}</span>
        <span>{labels[current]}</span>
      </div>
    </div>
  );
}
