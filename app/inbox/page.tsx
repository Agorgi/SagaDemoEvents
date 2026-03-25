"use client";

import { useMemo, useState } from "react";

import { ActivityItem } from "@/src/components/ActivityItem";
import { Avatar } from "@/src/components/Avatar";
import { Nav } from "@/src/components/Nav";
import { getListingById, getOpportunityById } from "@/src/data/economy";
import { getUserById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";

type ActivityTab = "all" | "friends" | "events" | "work";

const tabs: Array<{ label: string; value: ActivityTab }> = [
  { label: "All", value: "all" },
  { label: "Friends", value: "friends" },
  { label: "Events", value: "events" },
  { label: "Work", value: "work" }
];

export default function InboxPage() {
  const {
    currentUserId,
    inbox,
    launches,
    listingInterests,
    markInboxRead,
    opportunityApplications,
    socialActivity,
    supportIntents
  } = useAppState();
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");

  const workFeed = useMemo(() => {
    const applicationItems = opportunityApplications
      .filter((application) => application.userId === currentUserId)
      .map((application) => {
        const opportunity = getOpportunityById(application.opportunityId);
        return opportunity
          ? {
              id: `work-application-${application.id}`,
              title: `${application.status} · ${opportunity.title}`,
              body: opportunity.summary,
              href: `/opportunities/${opportunity.id}`
            }
          : null;
      })
      .filter(Boolean) as Array<{ id: string; title: string; body: string; href: string }>;

    const listingItems = listingInterests
      .filter((interest) => interest.userId === currentUserId)
      .map((interest) => {
        const listing = getListingById(interest.listingId);
        return listing
          ? {
              id: `work-listing-${interest.id}`,
              title: `${interest.kind.replace("_", " ")} · ${listing.title}`,
              body: listing.summary,
              href: `/listings/${listing.id}`
            }
          : null;
      })
      .filter(Boolean) as Array<{ id: string; title: string; body: string; href: string }>;

    const supportItems = supportIntents
      .slice(0, 3)
      .map((intent) => ({
        id: `work-support-${intent.id}`,
        title: `${intent.action} intent saved`,
        body: "A business-side match just moved forward.",
        href: "/work?tab=business"
      }));

    return [...applicationItems, ...listingItems, ...supportItems].slice(0, 8);
  }, [currentUserId, listingInterests, opportunityApplications, supportIntents]);

  const filteredActivity = useMemo(() => {
    if (activeTab === "all") {
      return socialActivity;
    }
    if (activeTab === "friends") {
      return socialActivity.filter((item) => item.kind === "friend" || item.kind === "room");
    }
    if (activeTab === "events") {
      return socialActivity.filter((item) => item.kind === "event");
    }
    return socialActivity.filter((item) => item.kind === "creator" || item.kind === "follow");
  }, [activeTab, socialActivity]);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[880px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Activity</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">What’s moving</h1>
          <p className="text-sm text-app-muted">Friend activity, event updates, and scene signals in one place.</p>
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {tabs.map((tab) => (
            <button
              className={`pill ${activeTab === tab.value ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-3">
          {activeTab === "work" ? (
            workFeed.map((item) => (
              <a
                className="surface-card block p-4 transition hover:border-white/12"
                href={item.href}
                key={item.id}
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-app-muted">{item.body}</p>
              </a>
            ))
          ) : (
            <>
              {launches
            .filter((launch) =>
              launch.pledges.some((pledge) => pledge.userId === currentUserId) || launch.eventId
            )
            .slice(0, 3)
            .map((launch) => (
              <a
                className="surface-card block p-4 transition hover:border-white/12"
                href={launch.eventId ? `/events/${launch.eventId}` : `/campaigns/${launch.id}`}
                key={`${launch.id}-campaign-update`}
              >
                <div className="flex items-start gap-3">
                  <img
                    alt={launch.title}
                    className="h-14 w-14 rounded-[18px] object-cover"
                    src={launch.coverImageUrl}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{launch.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-app-muted">
                      {launch.eventId
                        ? "This soft launch is confirmed and now has a live event page."
                        : launch.status === "funded"
                          ? "Threshold reached. Venue pairing is the next move."
                          : launch.status === "near_goal"
                            ? "This launch is close. One more push could unlock it."
                            : "Momentum is building on this soft launch."}
                    </p>
                  </div>
                </div>
              </a>
            ))}

              {filteredActivity.map((item) => {
                const actor = getUserById(item.actorIds[0]);
                return (
                  <a
                    className="surface-card block p-4 transition hover:border-white/12"
                    href={item.href}
                    key={item.id}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar name={actor?.name ?? "Saga"} size="sm" src={actor?.avatarUrl} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-app-muted">{item.body}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </>
          )}
        </section>

        <section className="mt-8 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-semibold text-white">Event updates</p>
            <p className="text-sm text-app-muted">Transactional things still land here.</p>
          </div>
          {inbox.length > 0 ? (
            inbox.slice(0, 6).map((item) => (
              <ActivityItem item={item} key={item.id} onRead={() => markInboxRead(item.id)} />
            ))
          ) : (
            <div className="surface-card p-5">
              <p className="text-sm text-app-muted">Nothing new yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
