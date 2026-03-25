"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BusinessMatchCard } from "@/src/components/BusinessMatchCard";
import { FilterChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { OpportunityCard } from "@/src/components/OpportunityCard";
import { businessProfiles as seedBusinessProfiles, matchExplanations } from "@/src/data/economy";
import { useAppState } from "@/src/lib/app-state";

type WorkTab = "jobs" | "businesses";

export default function WorkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <WorkPageContent />
    </Suspense>
  );
}

function WorkPageContent() {
  const searchParams = useSearchParams();
  const {
    businessProfiles,
    currentBusinessProfile,
    getApplicationForCurrentUser,
    homeCity,
    onboarding,
    opportunities,
    preferredFandoms,
    respondToBusinessMatch,
    setMode,
    supportIntents
  } = useAppState();

  const [activeTab, setActiveTab] = useState<WorkTab>(
    searchParams.get("tab") === "business" || searchParams.get("tab") === "businesses"
      ? "businesses"
      : "jobs"
  );

  useEffect(() => {
    setMode(activeTab === "businesses" ? "business" : "creator");
  }, [activeTab, setMode]);

  const relevantJobs = useMemo(
    () =>
      opportunities.filter(
        (item) =>
          item.city === homeCity ||
          item.fandomTags.some((tag) => preferredFandoms.includes(tag))
      ).sort((left, right) => {
        const leftScore =
          left.skillTags.filter((tag) => onboarding.skills.includes(tag)).length * 3 +
          left.fandomTags.filter((tag) => preferredFandoms.includes(tag)).length * 2 +
          (left.city === homeCity ? 2 : 0) +
          onboarding.workEventTypes.filter((tag) =>
            `${left.title} ${left.summary} ${left.schema.eventFormats.join(" ")}`.toLowerCase().includes(tag.toLowerCase())
          ).length;
        const rightScore =
          right.skillTags.filter((tag) => onboarding.skills.includes(tag)).length * 3 +
          right.fandomTags.filter((tag) => preferredFandoms.includes(tag)).length * 2 +
          (right.city === homeCity ? 2 : 0) +
          onboarding.workEventTypes.filter((tag) =>
            `${right.title} ${right.summary} ${right.schema.eventFormats.join(" ")}`.toLowerCase().includes(tag.toLowerCase())
          ).length;

        return rightScore - leftScore;
      }),
    [homeCity, onboarding.skills, onboarding.workEventTypes, opportunities, preferredFandoms]
  );

  const activeBusiness = currentBusinessProfile ?? businessProfiles[0] ?? seedBusinessProfiles[0];
  const businessMatches = useMemo(
    () =>
      matchExplanations
        .filter((item) => item.businessId === activeBusiness?.id)
        .sort((left, right) => {
          const leftScore = left.chips.filter((chip) =>
            onboarding.businessSceneTags.includes(chip)
          ).length;
          const rightScore = right.chips.filter((chip) =>
            onboarding.businessSceneTags.includes(chip)
          ).length;
          return rightScore - leftScore;
        }),
    [activeBusiness, onboarding.businessSceneTags]
  );

  function matchHref(match: (typeof businessMatches)[number]) {
    if (match.targetType === "launch") {
      return `/campaigns/${match.targetId}`;
    }
    if (match.targetType === "event") {
      return `/events/${match.targetId}`;
    }
    if (match.targetType === "creator") {
      return `/profiles/${match.targetId}`;
    }
    return `/opportunities/${match.targetId}`;
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Work</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Work</h1>
          <p className="text-sm text-app-muted">Jobs and venue fits.</p>
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {[
            { value: "jobs", label: "Jobs" },
            { value: "businesses", label: "Businesses" }
          ].map((tab) => (
            <FilterChip
              active={activeTab === tab.value}
              key={tab.value}
              label={tab.label}
              onClick={() => setActiveTab(tab.value as WorkTab)}
            />
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {activeTab === "jobs"
            ? relevantJobs.map((opportunity) => {
                const application = getApplicationForCurrentUser(opportunity.id);
                return (
                  <OpportunityCard
                    applicationStatus={application?.status}
                    href={`/opportunities/${opportunity.id}`}
                    key={opportunity.id}
                    onPrimaryAction={() => window.location.assign(`/opportunities/${opportunity.id}`)}
                    opportunity={opportunity}
                    primaryLabel={application ? "View" : "Apply"}
                  />
                );
              })
            : businessMatches.map((match) => {
                const supportState = supportIntents.find(
                  (item) =>
                    item.businessId === match.businessId &&
                    item.targetType === match.targetType &&
                    item.targetId === match.targetId
                )?.action;

                return (
                  <BusinessMatchCard
                    actionState={supportState}
                    href={matchHref(match)}
                    key={match.id}
                    match={match}
                    onRespond={(action) => {
                      if (match.targetType === "launch" || match.targetType === "event") {
                        respondToBusinessMatch(match.businessId, match.targetType, match.targetId, action);
                        return;
                      }
                      if (action === "hosting" || action === "supporting" || action === "saved") {
                        window.location.assign(matchHref(match));
                      }
                    }}
                  />
                );
              })}
        </section>
      </main>
    </div>
  );
}
