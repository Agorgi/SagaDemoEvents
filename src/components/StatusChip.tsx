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
    draft: "border-white/10 bg-white/[0.03] text-app-muted",
    planning: "border-white/10 bg-white/[0.03] text-white",
    recruiting: "border-app-purple/25 bg-app-purple/10 text-white",
    validating: "border-[#8AB4FF]/25 bg-[#8AB4FF]/10 text-white",
    live: "border-app-success/25 bg-app-success/10 text-white",
    "live_soft_launch": "border-[#87A6FF]/25 bg-[#87A6FF]/10 text-white",
    near_goal: "border-[#FFD166]/25 bg-[#FFD166]/10 text-white",
    funded: "border-[#74F0B8]/25 bg-[#74F0B8]/10 text-white",
    paired: "border-[#8AE3FF]/25 bg-[#8AE3FF]/10 text-white",
    confirmed: "border-app-success/25 bg-app-success/10 text-white",
    expired: "border-white/10 bg-white/[0.03] text-app-muted",
    completed: "border-white/10 bg-white/[0.03] text-white",
    "almost-there": "border-[#FFD166]/25 bg-[#FFD166]/10 text-white",
    "sold-out": "border-app-success/25 bg-app-success/10 text-white",
    "payouts-ready": "border-[#34d399]/25 bg-[#34d399]/10 text-white"
  };

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", toneMap[status])}>
      {labelMap[status]}
    </span>
  );
}
