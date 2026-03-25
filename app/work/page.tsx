"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { BusinessMatchCard } from "@/src/components/BusinessMatchCard";
import { FilterChip, TagChip } from "@/src/components/Chips";
import { ListingCard } from "@/src/components/ListingCard";
import { Nav } from "@/src/components/Nav";
import { OpportunityCard } from "@/src/components/OpportunityCard";
import { getOpportunityContext, getStorefrontForUser, matchExplanations } from "@/src/data/economy";
import { useAppState } from "@/src/lib/app-state";

type WorkTab = "opportunities" | "shop" | "business";

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
    currentUserId,
    currentUser,
    homeCity,
    listings,
    listingInterests,
    mode,
    opportunities,
    preferredFandoms,
    respondToBusinessMatch,
    supportIntents,
    getApplicationForCurrentUser
  } = useAppState();
  const [activeTab, setActiveTab] = useState<WorkTab>(
    (searchParams.get("tab") as WorkTab | null) ??
      (mode === "business" ? "business" : mode === "creator" ? "opportunities" : "shop")
  );

  const relevantOpportunities = useMemo(
    () =>
      opportunities.filter(
        (item) =>
          item.city === homeCity ||
          item.fandomTags.some((tag) => preferredFandoms.includes(tag))
      ),
    [homeCity, opportunities, preferredFandoms]
  );

  const creatorStorefront = getStorefrontForUser(currentUserId);
  const creatorListings = listings.filter((item) => item.creatorUserId === currentUserId);
  const visibleListings = useMemo(
    () =>
      listings.filter(
        (item) =>
          item.city === homeCity ||
          item.fandomTags.some((tag) => preferredFandoms.includes(tag))
      ),
    [homeCity, listings, preferredFandoms]
  );

  const activeBusiness = currentBusinessProfile ?? businessProfiles[0];
  const activeMatches = matchExplanations.filter((item) => item.businessId === activeBusiness?.id);

  function matchHref(match: (typeof activeMatches)[number]) {
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
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-3">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Work</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Book, sell, and support the scene.</h1>
          <p className="max-w-[48ch] text-sm text-app-muted">
            Opportunities, storefronts, and venue-side matches connected to the same fandom graph.
          </p>
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {[
            { value: "opportunities", label: "Opportunities" },
            { value: "shop", label: "Shop / Sell" },
            { value: "business", label: "Business" }
          ].map((tab) => (
            <FilterChip
              active={activeTab === tab.value}
              key={tab.value}
              label={tab.label}
              onClick={() => setActiveTab(tab.value as WorkTab)}
            />
          ))}
        </div>

        {activeTab === "opportunities" ? (
          <section className="mt-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-white">Open calls</p>
                <p className="mt-1 text-sm text-app-muted">
                  Guest slots, vendor tables, performers, and creator support roles.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferredFandoms.slice(0, 3).map((tag) => (
                  <TagChip key={tag} label={tag} subdued />
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {relevantOpportunities.map((opportunity) => {
                const application = getApplicationForCurrentUser(opportunity.id);
                const context = getOpportunityContext(opportunity);
                return (
                  <div className="space-y-3" key={opportunity.id}>
                    <OpportunityCard
                      applicationStatus={application?.status}
                      href={`/opportunities/${opportunity.id}`}
                      onPrimaryAction={() => window.location.assign(`/opportunities/${opportunity.id}`)}
                      opportunity={opportunity}
                      primaryLabel="Open call"
                    />
                    {context ? (
                      <Link
                        className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-app-muted transition hover:border-white/14 hover:text-white"
                        href={opportunity.eventId ? `/events/${opportunity.eventId}` : `/campaigns/${opportunity.campaignId}`}
                      >
                        <img
                          alt={opportunity.title}
                          className="h-12 w-12 rounded-[16px] object-cover"
                          src={"coverImageUrl" in context ? context.coverImageUrl : context.posterUrl}
                        />
                        <span className="truncate">
                          Linked to {"eventId" in context ? context.title : context.title}
                        </span>
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeTab === "shop" ? (
          <section className="mt-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-white">Storefronts and drops</p>
                <p className="mt-1 text-sm text-app-muted">
                  Services, merch, resale, and commissions connected to real fandom people.
                </p>
              </div>
              {mode !== "business" ? (
                <Link
                  className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  href="/work/new-listing"
                >
                  New listing
                </Link>
              ) : null}
            </div>

            {creatorStorefront ? (
              <Link
                className="surface-card block p-5 transition hover:border-white/12"
                href={`/profiles/${currentUserId}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Your storefront</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{creatorStorefront.title}</p>
                    <p className="mt-2 max-w-[40ch] text-sm text-app-muted">{creatorStorefront.headline}</p>
                  </div>
                  <Avatar name={currentUser.name} size="md" src={currentUser.avatarUrl} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {creatorStorefront.serviceHighlights.map((item) => (
                    <TagChip key={item} label={item} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-white/70">
                  {creatorListings.length} live {creatorListings.length === 1 ? "listing" : "listings"}
                </p>
              </Link>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {visibleListings.map((listing) => {
                const interest = listingInterests.find(
                  (item) => item.listingId === listing.id && item.userId === currentUserId
                );
                return (
                  <ListingCard
                    compact
                    href={`/listings/${listing.id}`}
                    interestKind={interest?.kind}
                    key={listing.id}
                    listing={listing}
                    onPrimaryAction={() => window.location.assign(`/listings/${listing.id}`)}
                  />
                );
              })}
            </div>
          </section>
        ) : null}

        {activeTab === "business" ? (
          <section className="mt-6 space-y-6">
            {activeBusiness ? (
              <Link
                className="surface-card block p-5 transition hover:border-white/12"
                href={`/businesses/${activeBusiness.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                      {activeBusiness.businessType}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{activeBusiness.name}</p>
                    <p className="mt-2 max-w-[44ch] text-sm text-app-muted">{activeBusiness.summary}</p>
                  </div>
                  <Avatar name={activeBusiness.name} size="md" src={activeBusiness.avatarUrl} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeBusiness.hostingPreferences.slice(0, 3).map((item) => (
                    <TagChip key={item} label={item} />
                  ))}
                </div>
              </Link>
            ) : null}

            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">Match slate</p>
                  <p className="mt-1 text-sm text-app-muted">
                    Lightweight match notes for launches, creators, and hostable nights.
                  </p>
                </div>
                <Link
                  className="text-sm font-semibold text-app-muted transition hover:text-white"
                  href="/settings/data"
                >
                  Data settings
                </Link>
              </div>
              <div className="mt-4 grid gap-4">
                {activeMatches.map((match) => {
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {businessProfiles
                .filter((profile) => profile.id !== activeBusiness?.id)
                .map((profile) => (
                  <Link
                    className="surface-card block p-5 transition hover:border-white/12"
                    href={`/businesses/${profile.id}`}
                    key={profile.id}
                  >
                    <p className="text-lg font-semibold text-white">{profile.name}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-app-muted">{profile.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {profile.fandomInterests.slice(0, 3).map((tag) => (
                        <TagChip key={tag} label={tag} subdued />
                      ))}
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
