"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { FeedPostCard } from "@/src/components/FeedPostCard";
import {
  getFollowersForUser,
  getPortfolioForUser
} from "@/src/data/social";
import { getListingsForUser, getStorefrontForUser } from "@/src/data/economy";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange } from "@/src/lib/utils";

type ProfileView = "fan" | "creator" | "business";

export default function ProfilePage() {
  const {
    currentPersona,
    currentBusinessProfile,
    currentProfile,
    currentUser,
    currentUserId,
    followingIds,
    goingEventIds,
    importedDataSettings,
    interestedEventIds,
    listings,
    mode,
    preferredFandoms,
    savedEventIds
  } = useAppState();
  const { events, posts, roles } = useDemoState();
  const [view, setView] = useState<ProfileView>(
    mode === "creator" ? "creator" : mode === "business" ? "business" : "fan"
  );

  const followerCount = getFollowersForUser(currentUserId).length;
  const followingCount = followingIds.length;
  const portfolio = getPortfolioForUser(currentUserId);
  const upcomingPlans = events
    .filter((event) => goingEventIds.includes(event.id) || interestedEventIds.includes(event.id))
    .slice(0, 3);
  const helping = roles.filter(
    (role) =>
      role.filledByUserId === currentUserId ||
      role.applicants.some((entry) => entry.applicantUserId === currentUserId)
  );
  const recentPosts = posts.filter((post) => post.authorId === currentUserId).slice(0, 2);
  const savedPlans = events.filter((event) => savedEventIds.includes(event.id)).slice(0, 3);
  const storefront = getStorefrontForUser(currentUserId);
  const storefrontListings = getListingsForUser(currentUserId, listings);

  const modeCards = useMemo(
    () => [
      {
        id: "fan",
        title: "Fan view",
        caption: `${goingEventIds.length} going · ${savedEventIds.length} saved`
      },
      {
        id: "creator",
        title: "Creator view",
        caption: `${helping.length} role flows · ${portfolio.length} portfolio items`
      },
      {
        id: "business",
        title: "Business view",
        caption: `${currentBusinessProfile ? 1 : 0} business profile · ${currentBusinessProfile?.matchedItemIds.length ?? 0} active matches`
      }
    ],
    [
      currentBusinessProfile,
      goingEventIds.length,
      helping.length,
      portfolio.length,
      savedEventIds.length
    ]
  );

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[980px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative h-[190px] bg-[#121622] sm:h-[230px]">
            <img
              alt={currentUser.name}
              className="h-full w-full object-cover"
              src={currentProfile?.coverImageUrl ?? "/group-88462-v2.png"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/30 to-transparent" />
          </div>
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end">
              <Avatar
                className="h-20 w-20 border-4 border-[#0f1320] text-xl sm:h-24 sm:w-24"
                name={currentUser.name}
                size="lg"
                src={currentUser.avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-semibold text-white">{currentUser.name}</h1>
                  {currentProfile?.roleBadges.map((badge) => (
                    <TagChip key={badge} label={badge} subdued />
                  ))}
                </div>
                <p className="mt-2 text-sm text-app-muted">
                  {currentUser.handle} · {currentUser.city}
                </p>
                <div className="mt-4 max-w-[60ch]">
                  <ExpandableText collapsedLines={2} text={currentProfile?.headline ?? currentUser.bio} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(currentProfile?.fandoms ?? preferredFandoms).slice(0, 5).map((tag) => (
                    <TagChip key={tag} label={tag} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-[420px]">
              <StatCard label="Followers" value={String(followerCount)} />
              <StatCard label="Following" value={String(followingCount)} />
              <StatCard label="Plans" value={String(upcomingPlans.length)} />
            </div>
          </div>
        </section>

        <section className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {modeCards.map((item) => (
            <button
              className={`pill ${view === item.id ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
              key={item.id}
              onClick={() => setView(item.id as ProfileView)}
              type="button"
            >
              {item.title}
            </button>
          ))}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <section className="space-y-6">
            {view === "fan" ? (
              <>
                <SurfaceBlock title="Upcoming plans">
                  {upcomingPlans.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingPlans.map((event) => (
                        <Link
                          className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                          href={`/events/${event.id}`}
                          key={event.id}
                        >
                          <img alt={event.title} className="h-20 w-20 rounded-[20px] object-cover" src={event.posterUrl} />
                          <div className="min-w-0">
                            <p className="font-semibold text-white">{event.title}</p>
                            <p className="mt-1 text-sm text-app-muted">
                              {formatDateRange(event.startsAt, event.endsAt)} · {event.city}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="No plans locked yet." />
                  )}
                </SurfaceBlock>

                <SurfaceBlock title="Saved for later">
                  {savedPlans.length > 0 ? (
                    <div className="space-y-3">
                      {savedPlans.map((event) => (
                        <Link
                          className="block rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                          href={`/events/${event.id}`}
                          key={event.id}
                        >
                          <p className="font-semibold text-white">{event.title}</p>
                          <p className="mt-1 text-sm text-app-muted">{event.subtitle}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Saved events will land here." />
                  )}
                </SurfaceBlock>
              </>
            ) : view === "creator" ? (
              <>
                <SurfaceBlock title="Portfolio">
                  {portfolio.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {portfolio.map((item) => (
                        <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#0d1119]" key={item.id}>
                          <img alt={item.title} className="h-40 w-full object-cover" src={item.imageUrl} />
                          <div className="p-4">
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-app-muted">{item.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState text="Portfolio cards will show up here." />
                  )}
                </SurfaceBlock>

                <SurfaceBlock title="Working now">
                  {helping.length > 0 ? (
                    <div className="space-y-3">
                      {helping.slice(0, 4).map((role) => {
                        const event = events.find((item) => item.id === role.eventId);
                        return event ? (
                          <Link
                            className="block rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                            href={`/events/${event.id}`}
                            key={role.id}
                          >
                            <p className="font-semibold text-white">{role.roleName}</p>
                            <p className="mt-1 text-sm text-app-muted">{event.title}</p>
                          </Link>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <EmptyState text="No active role flows yet." />
                  )}
                </SurfaceBlock>

                <SurfaceBlock title="Storefront">
                  {storefront ? (
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                        <p className="font-semibold text-white">{storefront.title}</p>
                        <p className="mt-1 text-sm text-app-muted">{storefront.headline}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {storefront.serviceHighlights.map((item) => (
                            <TagChip key={item} label={item} subdued />
                          ))}
                        </div>
                      </div>
                      {storefrontListings.length > 0 ? (
                        storefrontListings.slice(0, 3).map((listing) => (
                          <Link
                            className="block rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                            href={`/listings/${listing.id}`}
                            key={listing.id}
                          >
                            <p className="font-semibold text-white">{listing.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-app-muted">{listing.summary}</p>
                          </Link>
                        ))
                      ) : (
                        <EmptyState text="Create your first listing to make your storefront public." />
                      )}
                    </div>
                  ) : (
                    <EmptyState text="This profile can add services, merch, and commission listings." />
                  )}
                </SurfaceBlock>
              </>
            ) : (
              <>
                <SurfaceBlock title="Business profile">
                  {currentBusinessProfile ? (
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                        <p className="font-semibold text-white">{currentBusinessProfile.name}</p>
                        <p className="mt-1 text-sm text-app-muted">{currentBusinessProfile.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {currentBusinessProfile.hostingPreferences.map((item) => (
                            <TagChip key={item} label={item} subdued />
                          ))}
                        </div>
                      </div>
                      <Link
                        className="inline-flex rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                        href={`/businesses/${currentBusinessProfile.id}`}
                      >
                        Open business profile
                      </Link>
                    </div>
                  ) : (
                    <EmptyState text="Switch to the business persona to preview venue and support flows." />
                  )}
                </SurfaceBlock>

                <SurfaceBlock title="Connected data">
                  <div className="space-y-3">
                    <InlineStatus label="Instagram" value={importedDataSettings.instagramConnected ? "Connected" : "Off"} />
                    <InlineStatus label="TikTok" value={importedDataSettings.tiktokConnected ? "Connected" : "Off"} />
                    <InlineStatus
                      label="Portfolio import"
                      value={importedDataSettings.portfolioImportEnabled ? "On" : "Off"}
                    />
                  </div>
                </SurfaceBlock>
              </>
            )}
          </section>

          <aside className="space-y-6">
            <SurfaceBlock title="About">
              <ExpandableText collapsedLines={3} text={currentUser.bio} />
              <div className="mt-4 flex flex-wrap gap-2">
                {currentUser.skills.slice(0, 5).map((skill) => (
                  <TagChip key={skill} label={skill} subdued />
                ))}
              </div>
            </SurfaceBlock>

            <SurfaceBlock title="Recent activity">
              {recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <FeedPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <EmptyState text={`${currentPersona.label} activity will show up here.`} />
              )}
            </SurfaceBlock>

            <Link
              className="surface-card block p-5 transition hover:border-white/12"
              href={`/profiles/${currentUserId}`}
            >
              <p className="text-lg font-semibold text-white">Open public profile</p>
              <p className="mt-1 text-sm text-app-muted">See the shareable version of this identity page.</p>
            </Link>

            <Link
              className="surface-card block p-5 transition hover:border-white/12"
              href="/settings/data"
            >
              <p className="text-lg font-semibold text-white">Data settings</p>
              <p className="mt-1 text-sm text-app-muted">Control imported profile signals and storefront visibility.</p>
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SurfaceBlock({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5">
      <p className="text-lg font-semibold text-white">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
      <p className="text-xs text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5">
      <p className="text-sm text-app-muted">{text}</p>
    </div>
  );
}

function InlineStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-[#0d1119] px-4 py-3">
      <p className="text-sm text-app-muted">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
