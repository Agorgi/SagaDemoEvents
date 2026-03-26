"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { CommissionProgress } from "@/src/components/CommissionProgress";
import { StatusChip, TagChip } from "@/src/components/Chips";
import {
  getCommissionOpenRoleCount,
  type DemoCommission
} from "@/src/data/commissions";
import { getUserById } from "@/src/data/demo";
import { cn, formatCompactNumber } from "@/src/lib/utils";

function getStatusLabel(commission: DemoCommission) {
  if (commission.status === "funded") {
    return "Funded";
  }

  if (commission.status === "ending soon") {
    return "Ending Soon";
  }

  return "Live";
}

function getStatusTone(commission: DemoCommission) {
  if (commission.status === "funded") {
    return "filled" as const;
  }

  if (commission.status === "ending soon") {
    return "invited" as const;
  }

  return "neutral" as const;
}

function getPrimaryCta(commission: DemoCommission) {
  if (commission.status === "funded") {
    return "See unlocks";
  }

  return commission.type === "event" ? "Boost this event" : "Back this project";
}

function getSecondaryCta(commission: DemoCommission, openRoleCount: number) {
  if (openRoleCount > 0) {
    return "Apply to help";
  }

  return commission.linkedEventId ? "View event" : "See updates";
}

export function CommissionCard({
  commission,
  backed = false,
  variant = "card",
  className
}: {
  commission: DemoCommission;
  backed?: boolean;
  variant?: "card" | "hero";
  className?: string;
}) {
  const host = getUserById(commission.hostId);
  const openRoleCount = getCommissionOpenRoleCount(commission);
  const href = `/commissions/${commission.id}`;

  if (variant === "hero") {
    return (
      <Link
        className={cn(
          "block overflow-hidden rounded-[30px] bg-white/[0.04] p-4 transition hover:bg-white/[0.05]",
          className
        )}
        href={href}
      >
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[28px]">
            <img
              alt={commission.title}
              className="h-[320px] w-full object-cover sm:h-[380px]"
              src={commission.imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/25 to-transparent" />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <StatusChip label={getStatusLabel(commission)} tone={getStatusTone(commission)} />
              {backed ? <StatusChip label="Backed" tone="open" /> : null}
              {openRoleCount > 0 ? (
                <span className="rounded-full bg-app-purple/14 px-3 py-1 text-xs font-semibold text-[#DEDCFF]">
                  Open Roles: {openRoleCount}
                </span>
              ) : null}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                {commission.fandomTags.map((tag) => (
                  <TagChip key={tag} label={tag} subdued />
                ))}
              </div>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
                {commission.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-app-muted sm:text-base">
                {commission.shortDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[28px] bg-white/[0.04] p-5">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                Featured boost
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={host?.name ?? "Host"} size="md" src={host?.avatarUrl} />
                <div>
                  <p className="font-semibold text-white">{host?.handle ?? "@host"}</p>
                  <p className="text-sm text-app-muted">
                    {commission.city} · {commission.timingLabel}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <CommissionProgress
                  goalAmount={commission.goalAmount}
                  raisedAmount={commission.raisedAmount}
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-[20px] bg-white/[0.05] p-3">
                  <p className="text-xs text-app-muted">Backers</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatCompactNumber(commission.backerCount)}
                  </p>
                </div>
                <div className="rounded-[20px] bg-white/[0.05] p-3">
                  <p className="text-xs text-app-muted">Days left</p>
                  <p className="mt-2 text-xl font-semibold text-white">{commission.daysLeft}</p>
                </div>
                <div className="rounded-[20px] bg-white/[0.05] p-3">
                  <p className="text-xs text-app-muted">Type</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {commission.type === "event" ? "Event boost" : "Creator add-on"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <span className="rounded-2xl bg-app-purple px-4 py-3 text-center text-sm font-semibold text-white">
                {getPrimaryCta(commission)}
              </span>
              <span className="rounded-2xl bg-white/[0.06] px-4 py-3 text-center text-sm font-semibold text-white">
                {getSecondaryCta(commission, openRoleCount)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      className={cn(
        "block overflow-hidden rounded-[30px] bg-white/[0.04] p-4 transition duration-200 hover:-translate-y-1 hover:bg-white/[0.05]",
        className
      )}
      href={href}
    >
      <div className="relative overflow-hidden rounded-[24px]">
        <img
          alt={commission.title}
          className="h-[260px] w-full object-cover"
          src={commission.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090d] via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <StatusChip label={getStatusLabel(commission)} tone={getStatusTone(commission)} />
          {backed ? <StatusChip label="Backed" tone="open" /> : null}
          {openRoleCount > 0 ? (
            <span className="rounded-full bg-app-purple/14 px-3 py-1 text-xs font-semibold text-[#DEDCFF]">
              Open Roles: {openRoleCount}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {commission.fandomTags.map((tag) => (
            <TagChip key={tag} label={tag} subdued />
          ))}
        </div>
        <div>
          <h3 className="text-[26px] font-semibold leading-tight text-white">
            {commission.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            {commission.shortDescription}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{host?.handle ?? "@host"}</p>
            <p className="text-xs text-app-muted">
              {commission.city} · {commission.timingLabel}
            </p>
          </div>
        </div>
        <CommissionProgress
          compact
          goalAmount={commission.goalAmount}
          raisedAmount={commission.raisedAmount}
        />
        <div className="flex items-center justify-between gap-3 text-sm text-app-muted">
          <span>{formatCompactNumber(commission.backerCount)} backers</span>
          <span>{commission.daysLeft} days left</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <span className="rounded-2xl bg-app-purple px-4 py-3 text-center text-sm font-semibold text-white">
            {getPrimaryCta(commission)}
          </span>
          <span className="rounded-2xl bg-white/[0.06] px-4 py-3 text-center text-sm font-semibold text-white">
            {getSecondaryCta(commission, openRoleCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}
