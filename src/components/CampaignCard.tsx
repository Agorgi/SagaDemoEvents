"use client";

import Link from "next/link";

import { StatusChip } from "@/src/components/StatusChip";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { type DemoLaunch, getLaunchFundingProgress } from "@/src/data/launches";
import { cn } from "@/src/lib/utils";

type CampaignCardProps = {
  launch: DemoLaunch;
  href?: string;
  className?: string;
  compact?: boolean;
  metadataLine: string;
  reasonLine: string;
  socialLine: string;
  primaryLabel: string;
  onPrimaryAction?: () => void;
};

export function CampaignCard({
  launch,
  href,
  className,
  compact = false,
  metadataLine,
  reasonLine,
  socialLine,
  primaryLabel,
  onPrimaryAction
}: CampaignCardProps) {
  const progress = getLaunchFundingProgress(launch);
  const cardHref = href ?? `/campaigns/${launch.id}`;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[30px] border border-[#93a6ff]/16 bg-[linear-gradient(180deg,rgba(13,17,28,0.98),rgba(9,12,20,0.99))] shadow-card transition hover:border-[#93a6ff]/24",
        className
      )}
    >
      <Link className="block" href={cardHref}>
        <div className="relative overflow-hidden">
          <img
            alt={launch.title}
            className={cn(
              "w-full object-cover transition duration-500 group-hover:scale-[1.02]",
              compact ? "h-[220px]" : "h-[280px] sm:h-[320px]"
            )}
            src={launch.coverImageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/14 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#1F1CB8]/24 to-transparent" />
          <div className="absolute left-4 top-4">
            <StatusChip status={launch.status} />
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="space-y-1.5">
          <Link href={cardHref}>
            <h3 className="line-clamp-2 text-2xl font-semibold leading-tight text-white sm:text-[28px]">
              {launch.title}
            </h3>
          </Link>
          <p className="text-sm text-white/68">{metadataLine}</p>
          <p className="line-clamp-1 text-sm text-app-muted">{socialLine}</p>
          <p className="line-clamp-1 text-sm text-white/76">{reasonLine}</p>
        </div>

        <ThresholdProgress
          compact
          current={progress.current}
          label={`${progress.current} / ${progress.target} pledged`}
          target={progress.target}
        />

        <button
          className="min-h-[46px] w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onPrimaryAction}
          type="button"
        >
          {primaryLabel}
        </button>
      </div>
    </article>
  );
}
