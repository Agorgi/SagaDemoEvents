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
    <article className="surface-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={launch.status} />
            <p className="text-sm text-app-muted">{formatDateRange(launch.startsAt)}</p>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">{launch.title}</h3>
          <p className="mt-1 text-sm text-app-muted">{launch.city}</p>
        </div>
        <button
          className="shrink-0 rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
      <div className="mt-4">
        <ThresholdProgress
          compact
          current={launch.reserveCount + launch.ticketCount}
          target={launch.plan.thresholdTarget}
        />
      </div>
    </article>
  );
}
