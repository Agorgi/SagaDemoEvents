"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { TagChip } from "@/src/components/Chips";
import { FeedPostCard } from "@/src/components/FeedPostCard";
import { Nav } from "@/src/components/Nav";
import {
  getFollowersForUser,
  getFollowingForUser,
  getPortfolioForUser,
  getProfileByUserId
} from "@/src/data/social";
import { businessProfiles, getListingsForUser, getStorefrontForUser } from "@/src/data/economy";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange } from "@/src/lib/utils";

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const { currentUserId, followingIds, listings, resolveUser, toggleFollow } = useAppState();
  const { events, posts, roles } = useDemoState();
  const user = resolveUser(params.userId);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Profile not found.
        </main>
      </div>
    );
  }

  const profile = getProfileByUserId(user.id);
  const portfolio = getPortfolioForUser(user.id);
  const followerCount = getFollowersForUser(user.id).length;
  const followingCount = getFollowingForUser(user.id).length;
  const recentPosts = posts.filter((post) => post.authorId === user.id).slice(0, 2);
  const relatedRoles = roles.filter(
    (role) =>
      role.filledByUserId === user.id ||
      role.applicants.some((entry) => entry.applicantUserId === user.id)
  );
  const upcomingEvents = events
    .filter(
      (event) =>
        event.hostId === user.id ||
        relatedRoles.some((role) => role.eventId === event.id)
    )
    .slice(0, 3);

  const isCurrentUser = currentUserId === user.id;
  const isFollowing = followingIds.includes(user.id);
  const storefront = getStorefrontForUser(user.id);
  const storefrontListings = getListingsForUser(user.id, listings);
  const businessProfile = businessProfiles.find((profile) => profile.ownerUserId === user.id);

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-[980px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative h-[220px]">
            <img
              alt={user.name}
              className="h-full w-full object-cover"
              src={profile?.coverImageUrl ?? user.avatarUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/30 to-transparent" />
          </div>
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Avatar
                  className="h-20 w-20 border-4 border-[#0f1320] text-xl sm:h-24 sm:w-24"
                  name={user.name}
                  size="lg"
                  src={user.avatarUrl}
                />
                <div className="pb-1">
                  <h1 className="text-4xl font-semibold text-white">{user.name}</h1>
                  <p className="mt-1 text-sm text-app-muted">
                    {user.handle} · {user.city}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {isCurrentUser ? (
                  <Link
                    className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                    href="/profile"
                  >
                    Your profile
                  </Link>
                ) : (
                  <button
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition ${isFollowing ? "border border-white/10" : "bg-app-purple hover:bg-app-purple-hover"}`}
                    onClick={() => toggleFollow(user.id)}
                    type="button"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 max-w-[60ch]">
              <ExpandableText collapsedLines={2} text={profile?.headline ?? user.bio} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(profile?.fandoms ?? user.fandomTags).slice(0, 5).map((tag) => (
                <TagChip key={tag} label={tag} />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-[420px]">
              <StatCard label="Followers" value={String(followerCount)} />
              <StatCard label="Following" value={String(followingCount)} />
              <StatCard label="Past events" value={String(user.pastEventsWorked)} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
          <section className="space-y-6">
            <SurfaceBlock title="Upcoming">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
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
                <EmptyState text="No upcoming plans linked yet." />
              )}
            </SurfaceBlock>

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
                <EmptyState text="Portfolio items will show up here." />
              )}
            </SurfaceBlock>

            {storefront ? (
              <SurfaceBlock title="Shop and services">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="font-semibold text-white">{storefront.title}</p>
                    <p className="mt-1 text-sm text-app-muted">{storefront.headline}</p>
                  </div>
                  {storefrontListings.slice(0, 3).map((listing) => (
                    <Link
                      className="block rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                      href={`/listings/${listing.id}`}
                      key={listing.id}
                    >
                      <p className="font-semibold text-white">{listing.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-app-muted">{listing.summary}</p>
                    </Link>
                  ))}
                </div>
              </SurfaceBlock>
            ) : null}
          </section>

          <aside className="space-y-6">
            <SurfaceBlock title="Best for">
              <div className="flex flex-wrap gap-2">
                {user.skills.slice(0, 6).map((skill) => (
                  <TagChip key={skill} label={skill} subdued />
                ))}
              </div>
              {profile?.servicesPreview.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.servicesPreview.map((item) => (
                    <TagChip key={item} label={item} subdued />
                  ))}
                </div>
              ) : null}
            </SurfaceBlock>

            {businessProfile ? (
              <SurfaceBlock title="Business side">
                <Link
                  className="block rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                  href={`/businesses/${businessProfile.id}`}
                >
                  <p className="font-semibold text-white">{businessProfile.name}</p>
                  <p className="mt-1 text-sm text-app-muted">{businessProfile.summary}</p>
                </Link>
              </SurfaceBlock>
            ) : null}

            <SurfaceBlock title="Recent activity">
              {recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <FeedPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <EmptyState text="No recent activity shared yet." />
              )}
            </SurfaceBlock>
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
