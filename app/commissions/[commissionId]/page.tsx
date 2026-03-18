"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Avatar, AvatarStack } from "@/src/components/Avatar";
import { CommissionActivityFeed } from "@/src/components/CommissionActivityFeed";
import { CommissionProgress } from "@/src/components/CommissionProgress";
import { CommissionRoleCard } from "@/src/components/CommissionRoleCard";
import { CommitFundsModal } from "@/src/components/CommitFundsModal";
import { ContributionTierCard } from "@/src/components/ContributionTierCard";
import { OpenRolesPill, StatusChip, TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import {
  getCommissionById,
  getCommissionOpenRoleCount
} from "@/src/data/commissions";
import { getUserById } from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";
import { formatCompactNumber } from "@/src/lib/utils";

export default function CommissionDetailPage() {
  const params = useParams<{ commissionId: string }>();
  const router = useRouter();
  const { activeUserId, applyToCommissionRole, commissions } = useDemoState();
  const [commitOpen, setCommitOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const commission = getCommissionById(params.commissionId, commissions);
  const host = getUserById(commission?.hostId);

  const backerPreview = useMemo(
    () =>
      commission?.backedByUserIds
        .map((userId) => getUserById(userId))
        .filter((user): user is NonNullable<typeof user> => Boolean(user))
        .slice(0, 4) ?? [],
    [commission]
  );

  if (!commission) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Event boost not found.
        </main>
      </div>
    );
  }

  const openRoleCount = getCommissionOpenRoleCount(commission);
  const statusTone =
    commission.status === "funded"
      ? "filled"
      : commission.status === "ending soon"
        ? "invited"
        : "neutral";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1400);
    } catch {
      setShareCopied(false);
    }
  };

  const handleJoinTeam = () => {
    const target = document.getElementById("open-roles");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6">
        <div className="space-y-6">
          <section className="surface-card-strong overflow-hidden p-4">
            <div className="relative overflow-hidden rounded-[32px] border border-white/8">
              <img
                alt={commission.title}
                className="h-[320px] w-full object-cover sm:h-[460px]"
                src={commission.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-[#06080d]/25 to-transparent" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <StatusChip
                  label={
                    commission.status === "funded"
                      ? "Funded"
                      : commission.status === "ending soon"
                        ? "Ending Soon"
                        : "Live"
                  }
                  tone={statusTone}
                />
                {openRoleCount > 0 ? <OpenRolesPill count={openRoleCount} emphasized /> : null}
                {commission.fandomTags.map((tag) => (
                  <TagChip key={tag} label={tag} subdued />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <p className="text-sm uppercase tracking-[0.16em] text-white/65">
                  {commission.linkedEventId ? "Event boost" : "Creator upgrade"}
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-white sm:text-6xl">
                  {commission.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-app-muted sm:text-base">
                  {commission.shortDescription}
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
            <section className="space-y-6">
              <div className="surface-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                      Overview
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">
                      Fund a concrete upgrade
                    </h2>
                  </div>
                  {commission.linkedEventId ? (
                    <Link
                      className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                      href={`/events/${commission.linkedEventId}`}
                    >
                      View event
                    </Link>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm text-app-muted">Location</p>
                    <p className="mt-3 text-xl font-semibold text-white">{commission.city}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm text-app-muted">Timing</p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {commission.timingLabel}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm text-app-muted">Type</p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {commission.type === "event" ? "Event upgrade" : "Creator add-on"}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-base leading-7 text-app-muted">
                  {commission.description}
                </p>
              </div>

              <div className="surface-card p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  What this unlocks
                </p>
                <div className="mt-5 grid gap-4">
                  {commission.whatThisUnlocks.map((item) => (
                    <div
                      className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4"
                      key={item}
                    >
                      <p className="text-base font-semibold text-white">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                      Contribution tiers
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">
                      Reward tiers that feel native to the community
                    </h2>
                  </div>
                </div>
                <div className="grid gap-4">
                  {commission.tiers.map((tier) => (
                    <ContributionTierCard key={tier.id} tier={tier} />
                  ))}
                </div>
              </div>

              <div className="surface-card p-6" id="open-roles">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                      Open roles
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">
                      Help build the upgrade
                    </h2>
                  </div>
                  {openRoleCount > 0 ? <OpenRolesPill count={openRoleCount} emphasized /> : null}
                </div>
                <div className="grid gap-4">
                  {commission.openRoles.map((role) => {
                    const applied = role.applicantUserIds.includes(activeUserId);
                    const actionLabel =
                      role.status === "filled" ? undefined : applied ? "Applied" : "Apply to help";

                    return (
                      <CommissionRoleCard
                        actionLabel={actionLabel}
                        applied={applied}
                        key={role.id}
                        onAction={
                          actionLabel
                            ? () => {
                                if (!applied) {
                                  applyToCommissionRole({
                                    commissionId: commission.id,
                                    roleId: role.id,
                                    applicantUserId: activeUserId
                                  });
                                }
                              }
                            : undefined
                        }
                        role={role}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="surface-card p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  Funding progress
                </p>
                <div className="mt-4">
                  <CommissionProgress
                    goalAmount={commission.goalAmount}
                    raisedAmount={commission.raisedAmount}
                  />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm text-app-muted">Backers</p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {formatCompactNumber(commission.backerCount)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm text-app-muted">Days left</p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      {commission.daysLeft}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm text-app-muted">Open roles</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{openRoleCount}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                    onClick={() => setCommitOpen(true)}
                    type="button"
                  >
                    Boost this event
                  </button>
                  <button
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                    onClick={handleShare}
                    type="button"
                  >
                    {shareCopied ? "Link copied" : "Share"}
                  </button>
                  {openRoleCount > 0 ? (
                    <button
                      className="sm:col-span-2 rounded-2xl border border-app-purple/25 bg-app-purple/10 px-4 py-3 text-sm font-semibold text-[#E0DEFF] transition hover:border-app-purple/40"
                      onClick={handleJoinTeam}
                      type="button"
                    >
                      Join Team
                    </button>
                  ) : null}
                  {commission.linkedEventId ? (
                    <button
                      className="sm:col-span-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                      onClick={() => router.push(`/events/${commission.linkedEventId}`)}
                      type="button"
                    >
                      Open linked event
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="surface-card p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  Host
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Avatar name={host?.name ?? "Host"} size="lg" src={host?.avatarUrl} />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{host?.name}</h3>
                    <p className="text-sm text-app-muted">{host?.bio}</p>
                  </div>
                </div>
                {backerPreview.length > 0 ? (
                  <div className="mt-5 rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-sm text-app-muted">Community backing</p>
                    <div className="mt-3 flex items-center gap-3">
                      <AvatarStack people={backerPreview} />
                      <p className="text-sm text-app-muted">
                        Backers from inside the fandom are already moving this forward.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="surface-card p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  Why this is scoped well
                </p>
                <div className="mt-5 grid gap-3">
                  {commission.trustNotes.map((note) => (
                    <div
                      className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4"
                      key={note}
                    >
                      <p className="text-sm leading-6 text-app-muted">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  Backer activity
                </p>
                <div className="mt-5">
                  <CommissionActivityFeed activity={commission.activity} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <CommitFundsModal
        commission={commission}
        onClose={() => setCommitOpen(false)}
        open={commitOpen}
      />
    </div>
  );
}
