"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { FilterChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { OpportunityCard } from "@/src/components/OpportunityCard";
import { VenueCard } from "@/src/components/VenueCard";
import { getOpportunityContext, type ApplicationStatus, type BusinessProfile, type Opportunity } from "@/src/data/economy";
import { useAppState } from "@/src/lib/app-state";

type WorkTab = "roles" | "venues";
type RoleFilter = "all" | "happening" | "soft_launch" | "nearby";
type VenueFilter = "all" | "open" | "soft_launch_friendly" | "happening_ready";

type NormalizedRoleCard = {
  id: string;
  title: string;
  href: string;
  projectName: string;
  projectState: "happening" | "soft_launch";
  imageUrl: string;
  metadataLine: string;
  contextLine: string;
  applicationStatus?: ApplicationStatus;
  city: string;
};

type NormalizedVenueCard = {
  id: string;
  href: string;
  name: string;
  imageUrl: string;
  metadataLine: string;
  contextLine: string;
  stateLabel: string;
  kind: VenueFilter;
};

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
    getApplicationForCurrentUser,
    homeCity,
    onboarding,
    opportunities,
    preferredFandoms
  } = useAppState();

  const [activeTab, setActiveTab] = useState<WorkTab>(() => {
    const tab = searchParams.get("tab");
    if (tab === "venue" || tab === "venues" || tab === "business" || tab === "businesses") {
      return "venues";
    }
    return "roles";
  });
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [venueFilter, setVenueFilter] = useState<VenueFilter>("all");

  const roleCards = useMemo(() => {
    return opportunities
      .map<NormalizedRoleCard | null>((opportunity) => {
        const context = getOpportunityContext(opportunity);
        if (!context) {
          return null;
        }

        const projectState = opportunity.campaignId ? "soft_launch" : "happening";
        const imageUrl =
          "coverImageUrl" in context ? context.coverImageUrl : context.posterUrl;
        const application = getApplicationForCurrentUser(opportunity.id);

        return {
          id: opportunity.id,
          title: opportunity.title,
          href: `/opportunities/${opportunity.id}`,
          projectName: context.title,
          projectState,
          imageUrl,
          metadataLine: buildRoleMetadata(opportunity.city, opportunity.dateLabel, opportunity.compensation),
          contextLine: buildRoleContext(opportunity, application?.status),
          applicationStatus: application?.status,
          city: opportunity.city
        };
      })
      .filter((item): item is NormalizedRoleCard => Boolean(item))
      .sort((left, right) => {
        const leftOpportunity = opportunities.find((item) => item.id === left.id);
        const rightOpportunity = opportunities.find((item) => item.id === right.id);
        if (!leftOpportunity || !rightOpportunity) {
          return 0;
        }

        const leftScore =
          leftOpportunity.skillTags.filter((tag) => onboarding.skills.includes(tag)).length * 3 +
          leftOpportunity.fandomTags.filter((tag) => preferredFandoms.includes(tag)).length * 2 +
          (left.city === homeCity ? 2 : 0) +
          (left.projectState === "soft_launch" ? 1 : 0);
        const rightScore =
          rightOpportunity.skillTags.filter((tag) => onboarding.skills.includes(tag)).length * 3 +
          rightOpportunity.fandomTags.filter((tag) => preferredFandoms.includes(tag)).length * 2 +
          (right.city === homeCity ? 2 : 0) +
          (right.projectState === "soft_launch" ? 1 : 0);

        return rightScore - leftScore;
      });
  }, [getApplicationForCurrentUser, homeCity, onboarding.skills, opportunities, preferredFandoms]);

  const filteredRoles = useMemo(() => {
    if (roleFilter === "all") {
      return roleCards;
    }
    if (roleFilter === "nearby") {
      return roleCards.filter((item) => item.city === homeCity);
    }
    return roleCards.filter((item) => item.projectState === roleFilter);
  }, [homeCity, roleCards, roleFilter]);

  const venueCards = useMemo(() => {
    return businessProfiles
      .map<NormalizedVenueCard>((business) => {
        const kind = getVenueFilterKind(business);
        return {
          id: business.id,
          href: `/businesses/${business.id}`,
          name: business.name,
          imageUrl: business.coverImageUrl,
          metadataLine: `${shortCity(business.city)} · ${business.availability.capacities[0] ?? "Flexible cap"} · ${formatBusinessType(business.businessType)}`,
          contextLine: buildVenueContext(business),
          stateLabel: getVenueStateLabel(business),
          kind
        };
      })
      .sort((left, right) => {
        const leftBusiness = businessProfiles.find((item) => item.id === left.id);
        const rightBusiness = businessProfiles.find((item) => item.id === right.id);
        if (!leftBusiness || !rightBusiness) {
          return 0;
        }

        const leftScore =
          (leftBusiness.city === homeCity ? 2 : 0) +
          leftBusiness.fandomInterests.filter((tag) => preferredFandoms.includes(tag)).length * 2;
        const rightScore =
          (rightBusiness.city === homeCity ? 2 : 0) +
          rightBusiness.fandomInterests.filter((tag) => preferredFandoms.includes(tag)).length * 2;

        return rightScore - leftScore;
      });
  }, [businessProfiles, homeCity, preferredFandoms]);

  const filteredVenues = useMemo(() => {
    if (venueFilter === "all") {
      return venueCards;
    }
    return venueCards.filter((item) => item.kind === venueFilter);
  }, [venueCards, venueFilter]);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-1.5">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Open roles & venues
          </h1>
          <p className="text-sm text-app-muted">Find ways to join live projects.</p>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-[22px] border border-white/8 bg-[#101522] p-1">
          {[
            { value: "roles", label: "Roles" },
            { value: "venues", label: "Venues" }
          ].map((tab) => (
            <button
              className={`min-h-[44px] rounded-[18px] text-sm font-semibold transition ${
                activeTab === tab.value
                  ? "bg-app-purple text-white"
                  : "text-app-muted hover:text-white"
              }`}
              key={tab.value}
              onClick={() => setActiveTab(tab.value as WorkTab)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {activeTab === "roles"
            ? [
                { value: "all", label: "All" },
                { value: "happening", label: "Happening" },
                { value: "soft_launch", label: "Soft launch" },
                { value: "nearby", label: "Nearby" }
              ].map((filter) => (
                <FilterChip
                  active={roleFilter === filter.value}
                  key={filter.value}
                  label={filter.label}
                  onClick={() => setRoleFilter(filter.value as RoleFilter)}
                />
              ))
            : [
                { value: "all", label: "All" },
                { value: "open", label: "Open to host" },
                { value: "soft_launch_friendly", label: "Soft launch friendly" },
                { value: "happening_ready", label: "Happening ready" }
              ].map((filter) => (
                <FilterChip
                  active={venueFilter === filter.value}
                  key={filter.value}
                  label={filter.label}
                  onClick={() => setVenueFilter(filter.value as VenueFilter)}
                />
              ))}
        </div>

        <section className="mt-6 space-y-4">
          {activeTab === "roles" ? (
            filteredRoles.length > 0 ? (
              filteredRoles.map((role) => {
                const opportunity = opportunities.find((item) => item.id === role.id);
                if (!opportunity) {
                  return null;
                }

                return (
                  <OpportunityCard
                    applicationStatus={role.applicationStatus}
                    href={role.href}
                    imageUrl={role.imageUrl}
                    key={role.id}
                    metadataLine={role.metadataLine}
                    onPrimaryAction={() => window.location.assign(role.href)}
                    opportunity={opportunity}
                    parentProjectName={role.projectName}
                    parentProjectState={role.projectState}
                    primaryLabel="Apply"
                    contextLine={role.contextLine}
                  />
                );
              })
            ) : (
              <EmptyFeed text="No roles match that filter yet." />
            )
          ) : filteredVenues.length > 0 ? (
            filteredVenues.map((venue) => {
              const business = businessProfiles.find((item) => item.id === venue.id);
              if (!business) {
                return null;
              }

              return (
                <VenueCard
                  business={business}
                  contextLine={venue.contextLine}
                  href={venue.href}
                  key={venue.id}
                  metadataLine={venue.metadataLine}
                  onPrimaryAction={() => window.location.assign(venue.href)}
                  statusLabel={venue.stateLabel}
                />
              );
            })
          ) : (
            <EmptyFeed text="No venues match that filter yet." />
          )}
        </section>
      </main>
    </div>
  );
}

function shortCity(value: string) {
  return value.split(",")[0]?.trim() ?? value;
}

function simplifyDateLabel(value: string) {
  if (value.toLowerCase().includes("remote")) {
    return value;
  }

  return value.split("·")[0]?.trim() ?? value;
}

function compensationTone(value: string) {
  if (/revenue share|split/i.test(value)) {
    return "Revenue share";
  }
  if (/\$\d/.test(value)) {
    return "Paid";
  }
  return value;
}

function buildRoleMetadata(city: string, dateLabel: string, compensation: string) {
  return `${shortCity(city)} · ${simplifyDateLabel(dateLabel)} · ${compensationTone(compensation)}`;
}

function buildRoleContext(
  opportunity: Opportunity,
  applicationStatus?: ApplicationStatus
) {
  if (applicationStatus === "shortlisted") {
    return "Shortlisted";
  }
  if (applicationStatus === "accepted") {
    return "Accepted";
  }
  if (applicationStatus === "submitted") {
    return "Applied";
  }
  if (opportunity.campaignId) {
    return "Starts once launch goes live";
  }
  if (/vendor/i.test(opportunity.roleType)) {
    return "2 spots open";
  }
  if (/guest|dj|artist|moderator|photography|photo|video|host/i.test(opportunity.roleType)) {
    return "1 spot open";
  }
  return "2 spots open";
}

function formatBusinessType(value: string) {
  if (value === "cafe") {
    return "Café";
  }
  return value[0].toUpperCase() + value.slice(1);
}

function buildVenueContext(
  business: BusinessProfile
) {
  if (business.hostingPreferences.some((item) => /soft-launch|soft launch/i.test(item))) {
    return "Good fit for soft launches";
  }
  if (business.supportInterests.some((item) => /launch|support/i.test(item))) {
    return "Open to community events";
  }
  return `Best for ${business.hostingPreferences[0]?.toLowerCase() ?? "live nights"}`;
}

function getVenueStateLabel(
  business: BusinessProfile
) {
  if (business.hostingPreferences.some((item) => /soft-launch|soft launch/i.test(item))) {
    return "Soft launch friendly";
  }
  if (business.availability.status === "available") {
    return "Open to host";
  }
  return "Happening ready";
}

function getVenueFilterKind(
  business: BusinessProfile
): VenueFilter {
  if (business.hostingPreferences.some((item) => /soft-launch|soft launch/i.test(item))) {
    return "soft_launch_friendly";
  }
  if (business.availability.status === "available") {
    return "open";
  }
  return "happening_ready";
}

function EmptyFeed({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center">
      <p className="text-sm text-app-muted">{text}</p>
    </div>
  );
}
