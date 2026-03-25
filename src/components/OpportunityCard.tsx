"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { type ApplicationStatus, type Opportunity } from "@/src/data/economy";
import { getUserById } from "@/src/data/demo";
import { cn } from "@/src/lib/utils";

const statusLabel: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  declined: "Declined"
};

export function OpportunityCard({
  opportunity,
  href,
  applicationStatus,
  onPrimaryAction,
  primaryLabel = "Apply",
  compact = false
}: {
  opportunity: Opportunity;
  href: string;
  applicationStatus?: ApplicationStatus;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
  compact?: boolean;
}) {
  const host = getUserById(opportunity.hostUserId);

  return (
    <article className={cn("surface-card overflow-hidden", compact ? "p-4" : "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
            {opportunity.roleType}
          </p>
          <Link href={href}>
            <h3 className="mt-2 text-xl font-semibold text-white">{opportunity.title}</h3>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-white/72">{opportunity.summary}</p>
        </div>
        {applicationStatus ? (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
              applicationStatus === "accepted"
                ? "bg-emerald-500/15 text-emerald-200"
                : applicationStatus === "shortlisted"
                  ? "bg-app-purple/15 text-white"
                  : applicationStatus === "declined"
                    ? "bg-rose-500/15 text-rose-200"
                    : "bg-white/8 text-white/78"
            )}
          >
            {statusLabel[applicationStatus]}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          opportunity.city,
          opportunity.dateLabel,
          opportunity.compensation
        ].map((item) => (
          <TagChip key={item} label={item} subdued />
        ))}
        {opportunity.skillTags.slice(0, 2).map((tag) => (
          <TagChip key={tag} label={tag} subdued />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{host?.name ?? "Host"}</p>
          <p className="truncate text-xs text-app-muted">{opportunity.socialProof}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {opportunity.fandomTags.slice(0, 2).map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
        <button
          className="rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onPrimaryAction}
          type="button"
        >
          {applicationStatus === "submitted" ? "View status" : primaryLabel}
        </button>
      </div>
    </article>
  );
}
