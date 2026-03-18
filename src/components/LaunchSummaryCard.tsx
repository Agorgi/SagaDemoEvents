import { type DemoLaunch } from "@/src/data/launches";
import { StatusChip } from "@/src/components/StatusChip";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { formatDateRange } from "@/src/lib/utils";

export function LaunchSummaryCard({
  launch,
  actionLabel,
  onAction
}: {
  launch: DemoLaunch;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-app-muted">{formatDateRange(launch.startsAt)}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{launch.title}</h3>
          <p className="mt-2 text-sm text-app-muted">{launch.city}</p>
        </div>
        <StatusChip status={launch.status} />
      </div>
      <div className="mt-5">
        <ThresholdProgress
          compact
          current={launch.reserveCount + launch.ticketCount}
          target={launch.plan.thresholdTarget}
        />
      </div>
      <button
        className="mt-5 rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </button>
    </article>
  );
}

