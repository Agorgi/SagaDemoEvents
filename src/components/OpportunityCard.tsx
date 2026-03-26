"use client";

import Link from "next/link";

import { VolunteerBadge } from "@/src/components/VolunteerBadge";
import { getOpportunityContext, type ApplicationStatus, type Opportunity } from "@/src/data/economy";
import { cn } from "@/src/lib/utils";

type OpportunityCardProps = {
  opportunity: Opportunity;
  href: string;
  applicationStatus?: ApplicationStatus;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
  compact?: boolean;
  metadataLine?: string;
  contextLine?: string;
  parentProjectName?: string;
  parentProjectState?: "happening" | "soft_launch";
  imageUrl?: string;
};

function simplifyDateLabel(value: string) {
  if (value.toLowerCase().includes("remote")) {
    return value;
  }

  return value.split("·")[0]?.trim() ?? value;
}

function compensationTone(value: string) {
  if (/\$\d|revenue share|split/i.test(value)) {
    return "Paid";
  }

  return value;
}

export function OpportunityCard({
  opportunity,
  href,
  applicationStatus,
  onPrimaryAction,
  primaryLabel = "Apply",
  compact = false,
  metadataLine,
  contextLine,
  parentProjectName,
  parentProjectState,
  imageUrl
}: OpportunityCardProps) {
  const context = getOpportunityContext(opportunity);
  const projectName = parentProjectName ?? (context?.title || "Live project");
  const projectState =
    parentProjectState ?? (opportunity.campaignId ? "soft_launch" : "happening");
  const posterUrl =
    imageUrl ??
    (context
      ? "coverImageUrl" in context
        ? context.coverImageUrl
        : context.posterUrl
      : undefined) ??
    "/group-88462-v2.png";

  const compactMetadata =
    metadataLine ??
    `${opportunity.city.split(",")[0]} · ${simplifyDateLabel(opportunity.dateLabel)} · ${compensationTone(opportunity.compensation)}`;

  const compactContext =
    contextLine ??
    (projectState === "soft_launch"
      ? "Starts once launch goes live"
      : applicationStatus
        ? statusLabel[applicationStatus]
        : opportunity.socialProof);
  const volunteerBadge = opportunity.openToVolunteering ? "Volunteer" : null;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,21,34,0.94),rgba(10,13,20,0.98))] shadow-card transition hover:border-white/12",
        compact ? "" : ""
      )}
    >
      <Link className="block" href={href}>
        <div className="relative overflow-hidden">
          <img
            alt={projectName}
            className={cn(
              "w-full object-cover transition duration-500 group-hover:scale-[1.02]",
              compact ? "h-[220px]" : "h-[250px] sm:h-[290px]"
            )}
            src={posterUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/10 to-transparent" />
          <div className="absolute left-4 top-4">
            <ProjectStateChip state={projectState} />
          </div>
          {volunteerBadge ? (
            <div className="absolute right-4 top-4">
              <VolunteerBadge className="shadow-[0_10px_30px_rgba(0,0,0,0.28)]" />
            </div>
          ) : null}
        </div>
      </Link>

      <div className="space-y-2.5 p-4 sm:p-5">
        <div className="space-y-1.5">
          <Link href={href}>
            <h3 className="line-clamp-2 text-[26px] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
              {opportunity.title}
            </h3>
          </Link>
          <p className="line-clamp-1 text-sm font-medium text-[#D8DBFF]">For {projectName}</p>
          <p className="text-sm text-white/66">{compactMetadata}</p>
          <p className="line-clamp-1 text-sm text-app-muted">{compactContext}</p>
        </div>

        <button
          className="min-h-[46px] w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onPrimaryAction ?? (() => window.location.assign(href))}
          type="button"
        >
          {applicationStatus ? "View role" : primaryLabel}
        </button>
      </div>
    </article>
  );
}

function ProjectStateChip({
  state
}: {
  state: "happening" | "soft_launch";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm",
        state === "happening"
          ? "border-app-success/25 bg-app-success/12"
          : "border-[#87A6FF]/25 bg-[#87A6FF]/12"
      )}
    >
      {state === "happening" ? "Happening" : "Soft launch"}
    </span>
  );
}

const statusLabel: Record<ApplicationStatus, string> = {
  submitted: "Applied",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  declined: "Closed"
};
