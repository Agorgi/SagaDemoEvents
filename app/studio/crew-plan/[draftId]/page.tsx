"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import {
  buildCrewPlanRoles,
  estimateCrewCost,
  inferDeliverablesFromBrief,
  inferVisualDirectionSelections,
  resolveBudgetCeiling,
  type CrewPlanCandidate,
  type CrewBriefInput,
  type CrewPlanRole
} from "@/src/data/crew-plan";
import { useAppState } from "@/src/lib/app-state";
import {
  CrewBudgetSummary,
  CrewCandidateModal,
  CrewRoleSection,
  CrewSummaryTable
} from "@/src/features/crew-plan/components";

export default function CrewPlanPage() {
  const params = useParams<{ draftId: string }>();
  const {
    creatorProfiles,
    launchDrafts,
    launches,
    saveLaunchDraft,
    setMode,
    updateLaunchDraft,
    mode,
    users
  } = useAppState();
  const [activeCandidate, setActiveCandidate] = useState<CrewPlanCandidate | null>(null);
  const [reviewIndexByRole, setReviewIndexByRole] = useState<Record<string, number>>({});
  const [localShortlistByRole, setLocalShortlistByRole] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "host") {
      setMode("host");
    }
  }, [mode, setMode]);

  const draft = launchDrafts.find((item) => item.id === params.draftId);
  const launch = launches.find((item) => item.id === params.draftId);

  const source = useMemo(() => {
    if (draft) {
      return {
        id: draft.id,
        launchMode: draft.launchMode,
        format: draft.format,
        sizeBucket: draft.sizeBucket,
        city: draft.city,
        neighborhood: draft.neighborhood,
        fandomTags: draft.fandomTags,
        conceptVision: draft.conceptVision || draft.generatedDraft.summary,
        visualDirectionSelections:
          draft.visualDirectionSelections.length > 0
            ? draft.visualDirectionSelections
            : inferVisualDirectionSelections({
                format: draft.format,
                sizeBucket: draft.sizeBucket,
                city: draft.city,
                fandomTags: draft.fandomTags,
                conceptVision: draft.conceptVision || draft.generatedDraft.summary
              }),
        crewBudgetRange: draft.crewBudgetRange,
        deliverableSelections:
          draft.deliverableSelections.length > 0
            ? draft.deliverableSelections
            : inferDeliverablesFromBrief({
                format: draft.format,
                sizeBucket: draft.sizeBucket,
                city: draft.city,
                fandomTags: draft.fandomTags,
                conceptVision: draft.conceptVision || draft.generatedDraft.summary
              }),
        briefStartDate: draft.briefStartDate,
        briefEndDate: draft.briefEndDate
      } satisfies CrewBriefInput;
    }

    if (launch) {
      return {
        id: launch.id,
        launchMode: launch.status === "live_soft_launch" ? "soft" : "happening",
        format: mapLaunchFormatToBriefFormat(launch.format),
        sizeBucket: launch.attendanceGoal >= 180 ? "101–250" : launch.attendanceGoal >= 100 ? "51–100" : "21–50",
        city: launch.city,
        fandomTags: launch.fandomTags,
        conceptVision: launch.description,
        visualDirectionSelections: launch.inspiration,
        crewBudgetRange: launch.budgetRange,
        deliverableSelections: [],
        briefStartDate: launch.startsAt.slice(0, 10),
        briefEndDate: launch.startsAt.slice(0, 10)
      } satisfies CrewBriefInput;
    }

    return null;
  }, [draft, launch]);

  const persistedShortlistByRole = draft?.crewShortlistByRole ?? {};
  const shortlistByRole = draft ? persistedShortlistByRole : localShortlistByRole;

  const roles = useMemo(
    () => (source ? buildCrewPlanRoles(source, creatorProfiles, users, shortlistByRole) : []),
    [creatorProfiles, shortlistByRole, source, users]
  );

  const estimatedCrewCost = estimateCrewCost(roles, shortlistByRole);
  const totalBudget = resolveBudgetCeiling(source?.crewBudgetRange);
  const remainingBudget = Math.max(0, totalBudget - estimatedCrewCost);

  function getActiveCandidateForRole(role: CrewPlanRole) {
    const shortlistedId = shortlistByRole[role.key];
    if (shortlistedId) {
      return role.matches.find((match) => match.userId === shortlistedId) ?? role.matches[0];
    }

    return role.matches[reviewIndexByRole[role.key] ?? 0] ?? role.matches[0];
  }

  function keepCandidate(role: CrewPlanRole) {
    const candidate = getActiveCandidateForRole(role);
    if (!candidate) {
      return;
    }

    if (draft) {
      updateLaunchDraft(draft.id, {
        crewShortlistByRole: {
          ...draft.crewShortlistByRole,
          [role.key]: candidate.userId
        }
      });
    } else {
      setLocalShortlistByRole((current) => ({
        ...current,
        [role.key]: candidate.userId
      }));
    }

    setBanner(`${candidate.name} kept for ${role.title}.`);
  }

  function passCandidate(role: CrewPlanRole) {
    if (role.matches.length <= 1) {
      setBanner(`No other ${role.title.toLowerCase()} matches yet.`);
      return;
    }

    const active = getActiveCandidateForRole(role);
    const currentIndex = role.matches.findIndex((match) => match.id === active?.id);
    const nextIndex = ((currentIndex >= 0 ? currentIndex : 0) + 1) % role.matches.length;

    if (draft?.crewShortlistByRole[role.key]) {
      const nextShortlist = { ...draft.crewShortlistByRole };
      delete nextShortlist[role.key];
      updateLaunchDraft(draft.id, {
        crewShortlistByRole: nextShortlist
      });
    } else if (localShortlistByRole[role.key]) {
      setLocalShortlistByRole((current) => {
        const next = { ...current };
        delete next[role.key];
        return next;
      });
    }

    setReviewIndexByRole((current) => ({
      ...current,
      [role.key]: nextIndex
    }));
  }

  if (!source) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-[860px] px-4 py-20 text-center text-app-muted">
          Crew plan not found.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
                  {source.launchMode === "soft" ? "Test demand first" : "Publish now"}
                </p>
                <h1 className="max-w-[16ch] text-[2rem] font-semibold tracking-[-0.045em] text-white sm:text-[2.7rem]">
                  {draft?.generatedDraft.title ?? launch?.title ?? "Crew plan"}
                </h1>
              </div>
              <Link
                className="text-sm font-semibold text-app-muted transition hover:text-white"
                href={draft ? `/studio/new?draft=${draft.id}` : "/studio"}
              >
                Edit brief
              </Link>
            </div>
            <p className="max-w-[60ch] text-sm leading-6 text-app-muted">
              {draft?.generatedDraft.summary ?? launch?.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {source.city ? <TagChip label={source.city} subdued /> : null}
              {draft?.generatedDraft.dateSummary ? <TagChip label={draft.generatedDraft.dateSummary} subdued /> : null}
              {(source.visualDirectionSelections ?? []).slice(0, 3).map((tag) => (
                <TagChip key={tag} label={tag} subdued />
              ))}
            </div>
          </div>

          <CrewBudgetSummary
            estimatedCrewCost={formatCurrency(estimatedCrewCost)}
            remaining={formatCurrency(remainingBudget)}
            totalBudget={source.crewBudgetRange || formatCurrency(totalBudget)}
            totalBudgetCeiling={totalBudget}
          />
        </section>

        {banner ? (
          <div className="mt-5 rounded-[22px] border border-app-success/20 bg-app-success/10 px-4 py-3 text-sm font-medium text-app-success">
            {banner}
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          {roles.map((role) => (
            <CrewRoleSection
              activeCandidate={getActiveCandidateForRole(role)}
              activeIndex={
                (() => {
                  const candidate = getActiveCandidateForRole(role);
                  const index = role.matches.findIndex((match) => match.id === candidate?.id);
                  return index >= 0 ? index : 0;
                })()
              }
              key={role.id}
              onCandidateClick={(candidate) => setActiveCandidate(candidate)}
              onKeep={() => keepCandidate(role)}
              onPass={() => passCandidate(role)}
              role={role}
            />
          ))}

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <CrewSummaryTable roles={roles} shortlistedByRole={shortlistByRole} />

            <div className="surface-card space-y-4 p-5">
              <p className="text-sm font-semibold text-white">Next step</p>
              <p className="text-sm leading-6 text-app-muted">
                Send a first outreach pass to the crew you&apos;ve shortlisted. We&apos;ll keep the plan saved here.
              </p>
              <button
                className="min-h-[48px] w-full rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() => {
                  if (draft) {
                    updateLaunchDraft(draft.id, { outreachSentAt: new Date().toISOString() });
                  }
                  setBanner(`Outreach sent to ${roles.length} creators. We'll notify you when they respond.`);
                }}
                type="button"
              >
                Send outreach
              </button>
              <button
                className="min-h-[46px] w-full rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/18"
                onClick={() => {
                  if (draft) {
                    saveLaunchDraft(draft.id);
                  }
                  setBanner("Crew plan saved.");
                }}
                type="button"
              >
                Save draft
              </button>
            </div>
          </section>
        </div>
      </main>

      <CrewCandidateModal
        candidate={activeCandidate}
        href={activeCandidate ? `/profiles/${activeCandidate.userId}` : undefined}
        onClose={() => setActiveCandidate(null)}
      />
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function mapLaunchFormatToBriefFormat(format: string) {
  switch (format) {
    case "social":
      return "Meetup / hangout";
    case "showcase":
      return "Live show / performance";
    case "pop-up":
      return "Market / vendor night";
    case "workshop":
      return "Tournament / competition";
    default:
      return "Themed experience / ball";
  }
}
