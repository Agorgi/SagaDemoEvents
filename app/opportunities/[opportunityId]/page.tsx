"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { VolunteerBadge } from "@/src/components/VolunteerBadge";
import { getOpportunityById, getOpportunityContext } from "@/src/data/economy";
import { getUserById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";

export default function OpportunityDetailPage() {
  const params = useParams<{ opportunityId: string }>();
  const { applyToOpportunity, getApplicationForCurrentUser } = useAppState();
  const [note, setNote] = useState("");
  const opportunity = getOpportunityById(params.opportunityId);

  if (!opportunity) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center text-app-muted">
          Opportunity not found.
        </main>
      </div>
    );
  }

  const host = getUserById(opportunity.hostUserId);
  const application = getApplicationForCurrentUser(opportunity.id);
  const context = getOpportunityContext(opportunity);
  const opportunityId = opportunity.id;
  const projectState = opportunity.campaignId ? "soft_launch" : "happening";
  const projectTitle = context?.title ?? "Live project";
  const projectHref = opportunity.eventId
    ? `/events/${opportunity.eventId}`
    : `/campaigns/${opportunity.campaignId}`;
  const projectImage =
    context && "coverImageUrl" in context ? context.coverImageUrl : context?.posterUrl;
  const volunteerBadge = opportunity.openToVolunteering ? "Volunteer" : null;

  function submitApplication(customNote?: string) {
    applyToOpportunity(
      opportunityId,
      customNote || "Strong fit for this role and ready for the timing listed."
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[540px] px-4 pb-36 pt-5 sm:max-w-[620px] sm:px-6 sm:pb-16 sm:pt-8">
        <section className="space-y-5">
          <div className="mx-auto max-w-[340px] overflow-hidden rounded-[30px] bg-[#0f1320] shadow-soft">
            <div className="relative">
              <img
                alt={projectTitle}
                className="aspect-[4/5] w-full object-cover"
                src={projectImage ?? "/group-88462-v2.png"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070c]/68 via-transparent to-transparent" />
              <div className="absolute left-4 top-4">
                <ProjectStateChip state={projectState} />
              </div>
              {volunteerBadge ? (
                <div className="absolute right-4 top-4">
                  <VolunteerBadge className="shadow-[0_10px_30px_rgba(0,0,0,0.28)]" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-[32px] font-semibold leading-tight text-white sm:text-[42px]">
                {opportunity.title}
              </h1>
              <p className="text-sm font-medium text-[#D8DBFF]">For {projectTitle}</p>
              <p className="text-sm leading-6 text-white/78">{opportunity.summary}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                className="flex min-w-0 items-center gap-3"
                href={`/profiles/${host?.id ?? opportunity.hostUserId}`}
              >
                <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{host?.name ?? "Host"}</p>
                  <p className="truncate text-xs text-app-muted">{opportunity.socialProof}</p>
                </div>
              </Link>
            </div>

            <div className="rounded-[24px] bg-white/[0.04] px-4 py-4">
              <div className="space-y-2 text-sm text-white/86">
                <p>{opportunity.roleType}</p>
                <p>
                  {opportunity.locationLabel}, {opportunity.city}
                </p>
                <p>{opportunity.dateLabel}</p>
                <p>{opportunity.compensation}</p>
              </div>
            </div>

            <div>
              <button
                className={`min-h-[48px] w-full rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                  application
                    ? "bg-white/[0.08] text-white"
                    : "bg-app-purple text-white hover:bg-app-purple-hover"
                }`}
                onClick={() => {
                  if (!application) {
                    submitApplication();
                  }
                }}
                type="button"
              >
                {application ? "Applied" : "Apply"}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-8">
          <DetailSection title="About role">
            <ExpandableText collapsedLines={5} text={opportunity.summary} />
          </DetailSection>

          <DetailSection title="Skills">
            <div className="flex flex-wrap gap-2">
              {opportunity.skillTags.map((tag) => (
                <TagChip key={tag} label={tag} subdued />
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Pay & perks">
            <div className="flex flex-wrap gap-2">
              {volunteerBadge ? <VolunteerBadge /> : null}
              <TagChip label={opportunity.compensation} subdued />
              {opportunity.perks.map((perk) => (
                <TagChip key={perk} label={perk} subdued />
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Why this role fits">
            <ul className="space-y-3">
              {opportunity.schema.confidenceNotes.map((item) => (
                <li className="flex gap-3 text-sm leading-6 text-app-muted" key={item}>
                  <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-app-purple" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="Apply">
            <div className="space-y-4 rounded-[24px] bg-white/[0.04] p-4">
              <textarea
                className="h-28 w-full rounded-[22px] bg-[#090d15] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a short note if you want."
                value={note}
              />
              <button
                className="min-h-[46px] w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() => submitApplication(note || undefined)}
                type="button"
              >
                {application ? "Update application" : "Submit application"}
              </button>
              <p className="text-sm text-app-muted">
                {application
                  ? `Status: ${application.status}`
                  : "This is a demo-safe flow. Your status will update in Work and Updates."}
              </p>
            </div>
          </DetailSection>

          {context ? (
            <DetailSection title="Live project">
              <Link
                className="flex items-center gap-4 rounded-[24px] bg-white/[0.04] p-4 transition hover:bg-white/[0.06]"
                href={projectHref}
              >
                <img
                  alt={projectTitle}
                  className="h-20 w-20 rounded-[18px] object-cover"
                  src={projectImage ?? "/group-88462-v2.png"}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-white">{projectTitle}</p>
                  <p className="mt-1 text-sm text-app-muted">
                    {projectState === "soft_launch" ? "Soft launch" : "Happening"}
                  </p>
                </div>
              </Link>
            </DetailSection>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function DetailSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">{title}</h2>
      {children}
    </section>
  );
}

function ProjectStateChip({
  state
}: {
  state: "happening" | "soft_launch";
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm ${
        state === "happening"
          ? "border-app-success/25 bg-app-success/12"
          : "border-[#87A6FF]/25 bg-[#87A6FF]/12"
      }`}
    >
      {state === "happening" ? "Happening" : "Soft launch"}
    </span>
  );
}
