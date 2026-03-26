"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { BusinessMatchCard } from "@/src/components/BusinessMatchCard";
import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { getBusinessProfileById, matchExplanations } from "@/src/data/economy";
import { useAppState } from "@/src/lib/app-state";
import { getWorkTabHref, WORK_TABS } from "@/src/lib/routes";

export default function BusinessProfilePage() {
  const params = useParams<{ businessId: string }>();
  const { businessProfiles, respondToBusinessMatch, supportIntents } = useAppState();
  const business = getBusinessProfileById(params.businessId, businessProfiles);

  if (!business) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center text-app-muted">
          Business profile not found.
        </main>
      </div>
    );
  }

  const matches = matchExplanations.filter((item) => item.businessId === business.id);

  function matchHref(match: (typeof matches)[number]) {
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
      <main className="mx-auto max-w-[1000px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] bg-[#0f1320] shadow-soft">
          <div className="relative h-[240px]">
            <img alt={business.name} className="h-full w-full object-cover" src={business.coverImageUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/30 to-transparent" />
          </div>
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-[#0f1320]" name={business.name} size="lg" src={business.avatarUrl} />
              <div className="pb-1">
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">{business.businessType}</p>
                <h1 className="mt-1 text-4xl font-semibold text-white">{business.name}</h1>
                <p className="mt-1 text-sm text-app-muted">
                  {business.handle} · {business.city}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-[60ch] text-sm text-white/72">{business.summary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {business.hostingPreferences.slice(0, 4).map((item) => (
                <span
                  className="inline-flex items-center rounded-full bg-white/[0.05] px-3 py-1 text-xs text-app-muted"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(310px,0.9fr)]">
          <section className="space-y-4">
            <div className="rounded-[28px] bg-white/[0.04] p-5">
              <p className="text-lg font-semibold text-white">Availability</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <TagChip label={business.availability.status} subdued />
                {business.availability.windows.map((item) => (
                  <TagChip key={item} label={item} subdued />
                ))}
                {business.availability.capacities.map((item) => (
                  <TagChip key={item} label={item} subdued />
                ))}
              </div>
              <p className="mt-4 text-sm text-app-muted">{business.availability.notes}</p>
            </div>

            <div className="grid gap-4">
              {matches.map((match) => {
                const actionState = supportIntents.find(
                  (intent) =>
                    intent.businessId === match.businessId &&
                    intent.targetId === match.targetId &&
                    intent.targetType === match.targetType
                )?.action;

                return (
                  <BusinessMatchCard
                    actionState={actionState}
                    href={matchHref(match)}
                    key={match.id}
                    match={match}
                    onRespond={(action) =>
                      respondToBusinessMatch(match.businessId, match.targetType, match.targetId, action)
                    }
                  />
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] bg-white/[0.04] p-5">
              <p className="text-lg font-semibold text-white">Fandom fit</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {business.fandomInterests.map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-white/[0.04] p-5">
              <p className="text-lg font-semibold text-white">Support interests</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {business.supportInterests.map((tag) => (
                  <TagChip key={tag} label={tag} subdued />
                ))}
              </div>
            </div>

            <Link
              className="block rounded-[28px] bg-white/[0.04] p-5 transition hover:bg-white/[0.06]"
              href={getWorkTabHref(WORK_TABS.venues)}
            >
              <p className="text-lg font-semibold text-white">Open business hub</p>
              <p className="mt-2 text-sm text-app-muted">See the full match slate and support actions.</p>
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
