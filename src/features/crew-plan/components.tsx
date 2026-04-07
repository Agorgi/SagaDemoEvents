"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { Modal } from "@/src/components/Modal";
import { type CrewPlanCandidate, type CrewPlanRole } from "@/src/data/crew-plan";
import { cn } from "@/src/lib/utils";

export function CrewBudgetSummary({
  totalBudget,
  totalBudgetCeiling,
  estimatedCrewCost,
  remaining
}: {
  totalBudget: string;
  totalBudgetCeiling: number;
  estimatedCrewCost: string;
  remaining: string;
}) {
  return (
    <section className="surface-card-strong space-y-4 p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <BudgetMetric label="Total budget" value={totalBudget} />
        <BudgetMetric label="Estimated crew cost" value={estimatedCrewCost} />
        <BudgetMetric label="Remaining" value={remaining} />
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-app-purple via-[#5f77ff] to-[#8e97ff]"
          style={{
            width: `${Math.max(14, Math.min(100, Math.round((parseCurrency(estimatedCrewCost) / Math.max(totalBudgetCeiling, 1)) * 100)))}%`
          }}
        />
      </div>
    </section>
  );
}

export function CrewRoleSection({
  activeCandidate,
  activeIndex,
  onCandidateClick,
  onKeep,
  onPass,
  role
}: {
  role: CrewPlanRole;
  activeCandidate: CrewPlanCandidate;
  activeIndex: number;
  onCandidateClick: (candidate: CrewPlanCandidate) => void;
  onKeep: () => void;
  onPass: () => void;
}) {
  const totalMatches = role.matches.length;

  return (
    <section className="surface-card-strong space-y-5 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xl font-semibold text-white">{role.title}</p>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/62">
              {role.reviewMode === "visual" ? "Visual review" : "Fit review"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-app-muted">
            <span>{role.suggestedRateLabel}</span>
            <span>·</span>
            <span>{role.scopeSummary}</span>
            <span>·</span>
            <span>{role.budgetFitLabel}</span>
          </div>
          <p className="text-sm leading-6 text-app-muted">{role.whyThisRole}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/74">
          {role.statusLabel}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-app-muted">
          <span>{role.matchCountLabel}</span>
          <span>
            {activeIndex + 1} of {totalMatches}
          </span>
        </div>
        {role.reviewMode === "visual" ? (
          <VisualMatchCard candidate={activeCandidate} onClick={() => onCandidateClick(activeCandidate)} />
        ) : (
          <TextMatchCard candidate={activeCandidate} onClick={() => onCandidateClick(activeCandidate)} />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {role.matches.map((candidate, index) => (
            <span
              className={cn(
                "h-1.5 rounded-full transition",
                activeCandidate.id === candidate.id ? "w-6 bg-white" : "w-1.5 bg-white/18"
              )}
              key={`${candidate.id}-${index}`}
            />
          ))}
        </div>
        <p className="text-xs text-app-muted">
          {role.reviewMode === "visual" ? "Swipe-style review for creative fit." : "Review past work and trust signals."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className="min-h-[48px] rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/18"
          onClick={onPass}
          type="button"
        >
          Pass
        </button>
        <button
          className="min-h-[48px] rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onKeep}
          type="button"
        >
          Keep
        </button>
      </div>
    </section>
  );
}

export function CrewSummaryTable({
  roles,
  shortlistedByRole
}: {
  roles: CrewPlanRole[];
  shortlistedByRole: Record<string, string>;
}) {
  return (
    <section className="surface-card space-y-3 p-5">
      <p className="text-sm font-semibold text-white">Crew summary</p>
      <div className="space-y-3">
        {roles.map((role) => {
          const active = shortlistedByRole[role.key]
            ? role.matches.find((match) => match.userId === shortlistedByRole[role.key]) ?? role.matches[0]
            : role.matches[0];
          if (!active) {
            return null;
          }

          return (
            <div
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-[22px] bg-white/[0.04] px-4 py-4"
              key={role.id}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{role.title}</p>
                <p className="mt-1 truncate text-sm text-app-muted">{active.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{active.rateLabel}</p>
                <p className="mt-1 text-xs text-app-muted">
                  {shortlistedByRole[role.key] ? "Shortlisted" : "Suggested"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CrewCandidateModal({
  candidate,
  href,
  onClose
}: {
  candidate: CrewPlanCandidate | null;
  href?: string;
  onClose: () => void;
}) {
  return (
    <Modal
      description={candidate ? candidate.matchReason : undefined}
      onClose={onClose}
      open={Boolean(candidate)}
      panelClassName="max-w-2xl"
      title={candidate ? candidate.name : "Creator"}
    >
      {candidate ? (
        <div className="space-y-5">
          {candidate.reviewMode === "visual" ? (
            <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-[24px] border border-white/8">
              {candidate.portfolioImages.map((image, index) => (
                <img
                  alt={`${candidate.name} portfolio ${index + 1}`}
                  className={cn(
                    "w-full object-cover",
                    index === 0 ? "col-span-2 h-[220px]" : "h-[160px]"
                  )}
                  key={`${candidate.id}-${index}`}
                  src={image}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white/[0.04] p-5">
              <p className="text-sm leading-6 text-white/86">{candidate.pastWorkSummary}</p>
              <ul className="mt-4 space-y-2">
                {candidate.pastWorkHighlights.map((highlight) => (
                  <li className="flex gap-3 text-sm text-app-muted" key={highlight}>
                    <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-app-purple" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Avatar name={candidate.name} size="md" src={candidate.avatarUrl} />
            <div className="min-w-0">
              <p className="text-base font-semibold text-white">{candidate.name}</p>
              <p className="text-sm text-app-muted">
                {candidate.craft} · {candidate.city}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <DetailMetric label="Match" value={candidate.matchLabel} />
            <DetailMetric label="Rate" value={candidate.rateLabel} />
            <DetailMetric label="Availability" value={candidate.availabilityLabel} />
          </div>

          {candidate.styleTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.styleTags.map((tag) => (
                <span className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/74" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {href ? (
            <Link
              className="inline-flex min-h-[46px] w-full items-center justify-center rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/18"
              href={href}
            >
              Open public profile
            </Link>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function VisualMatchCard({
  candidate,
  onClick
}: {
  candidate: CrewPlanCandidate;
  onClick: () => void;
}) {
  return (
    <button
      className="group w-full overflow-hidden rounded-[28px] border border-white/8 bg-[#0d1119] text-left transition hover:border-white/16"
      onClick={onClick}
      type="button"
    >
      <div className="relative grid h-[220px] grid-cols-2 gap-[1px] overflow-hidden bg-black/20">
        <img alt={`${candidate.name} portfolio 1`} className="h-full w-full object-cover" src={candidate.portfolioImages[0]} />
        <div className="grid gap-[1px]">
          <img alt={`${candidate.name} portfolio 2`} className="h-full w-full object-cover" src={candidate.portfolioImages[1]} />
          <img alt={`${candidate.name} portfolio 3`} className="h-full w-full object-cover" src={candidate.portfolioImages[2]} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070c]/78 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <MatchBadge label={candidate.matchLabel} />
          {candidate.isTopPick ? (
            <span className="rounded-full border border-[#F0C453]/30 bg-[#F0C453]/12 px-2.5 py-1 text-[11px] font-semibold text-[#F8DB7B]">
              Top pick
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-white">{candidate.name}</p>
              <p className="text-sm text-app-muted">{candidate.craft}</p>
            </div>
            <p className="text-sm font-medium text-white/82">{candidate.rating.toFixed(1)}</p>
          </div>
          <p className="text-sm leading-6 text-app-muted">{candidate.matchReason}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {candidate.styleTags.map((tag) => (
            <span className="rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/74" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="font-semibold text-white">{candidate.rateLabel}</p>
          <div className="flex items-center gap-2 text-app-muted">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                candidate.availabilityLabel === "Available" ? "bg-app-success" : "bg-[#FFD166]"
              )}
            />
            <span>{candidate.availabilityLabel}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function TextMatchCard({
  candidate,
  onClick
}: {
  candidate: CrewPlanCandidate;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full rounded-[28px] border border-white/8 bg-[#0d1119] p-5 text-left transition hover:border-white/16"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={candidate.name} size="md" src={candidate.avatarUrl} />
          <div>
            <p className="text-base font-semibold text-white">{candidate.name}</p>
            <p className="text-sm text-app-muted">
              {candidate.craft} · {candidate.city}
            </p>
          </div>
        </div>
        <MatchBadge label={candidate.matchLabel} />
      </div>

      <div className="mt-5 rounded-[22px] bg-white/[0.04] p-4">
        <p className="text-sm leading-6 text-white/86">{candidate.pastWorkSummary}</p>
      </div>

      <div className="mt-4 space-y-2">
        {candidate.pastWorkHighlights.map((highlight) => (
          <div className="flex gap-3 text-sm text-app-muted" key={highlight}>
            <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-app-purple" />
            <span>{highlight}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <p className="font-semibold text-white">{candidate.rateLabel}</p>
        <div className="flex items-center gap-2 text-app-muted">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              candidate.availabilityLabel === "Available" ? "bg-app-success" : "bg-[#FFD166]"
            )}
          />
          <span>{candidate.availabilityLabel}</span>
        </div>
      </div>
    </button>
  );
}

function BudgetMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-white/[0.04] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-app-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function MatchBadge({ label }: { label: CrewPlanCandidate["matchLabel"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
        label === "Strong match"
          ? "bg-app-success/14 text-[#8CE2B9]"
          : label === "Good match"
            ? "bg-[#4C6FFF]/18 text-[#C9D4FF]"
            : "bg-app-purple/16 text-[#D8D6FF]"
      )}
    >
      {label}
    </span>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-white/[0.04] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function parseCurrency(value: string) {
  const numeric = value.match(/\$([\d,]+)/);
  return numeric ? Number.parseInt(numeric[1].replace(/,/g, ""), 10) : 0;
}
