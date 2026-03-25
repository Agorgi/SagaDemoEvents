"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { OpportunityCard } from "@/src/components/OpportunityCard";
import { getOpportunityById, getOpportunityContext } from "@/src/data/economy";
import { getUserById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";

export default function OpportunityDetailPage() {
  const params = useParams<{ opportunityId: string }>();
  const { applyToOpportunity, getApplicationForCurrentUser, mode } = useAppState();
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

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-[920px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <OpportunityCard
          applicationStatus={application?.status}
          href={`/opportunities/${opportunity.id}`}
          onPrimaryAction={() =>
            applyToOpportunity(
              opportunity.id,
              note || "I’m a strong fit for this role and can cover the listed timing."
            )
          }
          opportunity={opportunity}
          primaryLabel={application ? "Refresh application" : "Apply"}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
          <section className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">What they need</p>
              <div className="mt-4">
                <ExpandableText collapsedLines={4} text={opportunity.summary} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.skillTags.map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Compensation and perks</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <TagChip label={opportunity.compensation} subdued />
                {opportunity.perks.map((perk) => (
                  <TagChip key={perk} label={perk} subdued />
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Why this match looks strong</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.schema.confidenceNotes.map((noteItem) => (
                  <TagChip key={noteItem} label={noteItem} />
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Apply</p>
              <textarea
                className="mt-4 h-28 w-full rounded-[22px] border border-white/10 bg-[#0d1119] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a short note about why you fit."
                value={note}
              />
              <button
                className="mt-4 w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() =>
                  applyToOpportunity(
                    opportunity.id,
                    note || "I’m a strong fit for this role and can cover the listed timing."
                  )
                }
                type="button"
              >
                {application ? "Update application" : "Submit application"}
              </button>
              {application ? (
                <p className="mt-3 text-sm text-app-muted">
                  Status: <span className="text-white">{application.status}</span>
                </p>
              ) : (
                <p className="mt-3 text-sm text-app-muted">
                  This is a mock application flow. You’ll see status update in Work and Activity.
                </p>
              )}
            </div>

            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Hosted by</p>
              <Link
                className="mt-4 flex items-center gap-3 rounded-[22px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12"
                href={`/profiles/${host?.id ?? opportunity.hostUserId}`}
              >
                <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{host?.name ?? "Host"}</p>
                  <p className="truncate text-sm text-app-muted">{opportunity.socialProof}</p>
                </div>
              </Link>
            </div>

            {context ? (
              <div className="surface-card p-5">
                <p className="text-lg font-semibold text-white">Linked page</p>
                <Link
                  className="mt-4 flex items-center gap-3 rounded-[22px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12"
                  href={opportunity.eventId ? `/events/${opportunity.eventId}` : `/campaigns/${opportunity.campaignId}`}
                >
                  <img
                    alt={opportunity.title}
                    className="h-14 w-14 rounded-[16px] object-cover"
                    src={"coverImageUrl" in context ? context.coverImageUrl : context.posterUrl}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{context.title}</p>
                    <p className="truncate text-sm text-app-muted">
                      {opportunity.eventId ? "Confirmed event" : "Soft launch"}
                    </p>
                  </div>
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
