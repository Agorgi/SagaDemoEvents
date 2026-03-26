import { type LaunchStatus } from "@/src/data/launches";
import { cn } from "@/src/lib/utils";

export function StatusChip({
  status
}: {
  status: LaunchStatus | "almost-there" | "sold-out" | "payouts-ready";
}) {
  type StatusValue = LaunchStatus | "almost-there" | "sold-out" | "payouts-ready";

  const labelMap: Record<StatusValue, string> = {
    draft: "Draft",
    planning: "Planning",
    recruiting: "Recruiting",
    validating: "Validating",
    live: "Live",
    "live_soft_launch": "Soft launch",
    near_goal: "Near goal",
    funded: "Funded",
    paired: "Paired",
    confirmed: "Confirmed",
    expired: "Expired",
    completed: "Completed",
    "almost-there": "Almost there",
    "sold-out": "Sold out",
    "payouts-ready": "Payouts ready"
  };

  const toneMap: Record<StatusValue, string> = {
    draft: "bg-white/[0.05] text-app-muted",
    planning: "bg-white/[0.06] text-white",
    recruiting: "bg-app-purple/16 text-white",
    validating: "bg-[#8AB4FF]/14 text-white",
    live: "bg-app-success/14 text-white",
    "live_soft_launch": "bg-[#87A6FF]/14 text-white",
    near_goal: "bg-[#FFD166]/14 text-white",
    funded: "bg-[#74F0B8]/14 text-white",
    paired: "bg-[#8AE3FF]/14 text-white",
    confirmed: "bg-app-success/14 text-white",
    expired: "bg-white/[0.05] text-app-muted",
    completed: "bg-white/[0.06] text-white",
    "almost-there": "bg-[#FFD166]/14 text-white",
    "sold-out": "bg-app-success/14 text-white",
    "payouts-ready": "bg-[#34d399]/14 text-white"
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold shadow-[0_10px_22px_rgba(0,0,0,0.14)] backdrop-blur-sm",
        toneMap[status]
      )}
    >
      {labelMap[status]}
    </span>
  );
}
