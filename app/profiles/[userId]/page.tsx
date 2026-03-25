"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { Nav } from "@/src/components/Nav";
import { PortfolioLightboxModal } from "@/src/components/PortfolioLightboxModal";
import { ProfileStatsCard } from "@/src/components/ProfileStatsCard";
import { ServicesSection } from "@/src/components/ServicesSection";
import { TagChip } from "@/src/components/Chips";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange } from "@/src/lib/utils";

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const { currentUserId, followingIds, resolveCreatorProfile, resolveUser, toggleFollow } = useAppState();
  const { events } = useDemoState();
  const [activePortfolioItemId, setActivePortfolioItemId] = useState<string | null>(null);

  const user = resolveUser(params.userId);
  const profile = resolveCreatorProfile(params.userId);

  if (!user || !profile) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Profile not found.
        </main>
      </div>
    );
  }

  const isCurrentUser = currentUserId === user.id;
  const isFollowing = followingIds.includes(user.id);
  const visibleServices = profile.services.filter((service) => service.visibleOnPublicProfile);
  const activePortfolioItem =
    profile.portfolio.find((item) => item.id === activePortfolioItemId) ?? null;
  const featuredEvents = events
    .filter(
      (event) =>
        event.hostId === user.id ||
        profile.tags.some((tag) =>
          event.fandomTags.some((eventTag) =>
            eventTag.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(eventTag.toLowerCase())
          )
        )
    )
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#090b10]">
      <Nav />

      <main className="mx-auto w-full max-w-[560px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative h-[260px]">
            <img
              alt={profile.displayName}
              className="h-full w-full object-cover"
              src={profile.coverImage ?? profile.avatarImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/34 to-transparent" />
          </div>

          <div className="relative px-5 pb-6 sm:px-6">
            <div className="-mt-12 flex flex-col items-center text-center">
              <Avatar
                className="h-24 w-24 border-4 border-[#0f1320] text-2xl"
                name={profile.displayName}
                size="lg"
                src={profile.avatarImage || user.avatarUrl}
              />

              <div className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">
                Creator profile
              </div>

              <h1 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-white">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-sm text-app-muted">{profile.handle}</p>
              <p className="mt-3 text-sm leading-6 text-[#D5D9E8]">{profile.bio}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted">
                  {profile.location}
                </span>
                {profile.tags.slice(0, 4).map((tag) => (
                  <TagChip key={tag} label={tag} subdued />
                ))}
              </div>

              <div className="mt-6 w-full">
                <ProfileStatsCard
                  items={[
                    { label: "Projects", value: profile.stats.privateProjects ?? profile.portfolio.length },
                    { label: "Followers", value: profile.stats.publicFollowers ?? 0 },
                    { label: "Services", value: visibleServices.length }
                  ]}
                />
              </div>

              <div className="mt-5 grid w-full grid-cols-2 gap-3">
                {isCurrentUser ? (
                  <>
                    <Link
                      className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                      href="/profile"
                    >
                      Your profile
                    </Link>
                    <Link
                      className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                      href="/settings/data"
                    >
                      Share
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      className={`inline-flex min-h-[48px] items-center justify-center rounded-[22px] px-4 py-3 text-sm font-semibold text-white transition ${
                        isFollowing
                          ? "border border-white/10 hover:border-white/20"
                          : "bg-app-purple hover:bg-app-purple-hover"
                      }`}
                      onClick={() => toggleFollow(user.id)}
                      type="button"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <Link
                      className="inline-flex min-h-[48px] items-center justify-center rounded-[22px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                      href="/inbox"
                    >
                      Message
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-8">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-white">Portfolio</h2>
            {profile.portfolio.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1 subtle-scrollbar">
                {profile.portfolio.map((item) => (
                  <button
                    className="w-[180px] shrink-0 overflow-hidden rounded-[24px] border border-white/8 bg-[#0d1119] transition hover:border-white/14"
                    key={item.id}
                    onClick={() => setActivePortfolioItemId(item.id)}
                    type="button"
                  >
                    <img
                      alt={item.title ?? "Portfolio item"}
                      className="h-[220px] w-full object-cover"
                      src={item.image}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <ServicesSection publicView services={visibleServices} title="Services" />

          {featuredEvents.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-white">Credits</h2>
              <div className="space-y-3">
                {featuredEvents.map((event) => (
                  <Link
                    className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-[#101522] p-4 transition hover:border-white/14"
                    href={`/events/${event.id}`}
                    key={event.id}
                  >
                    <img
                      alt={event.title}
                      className="h-20 w-20 rounded-[18px] object-cover"
                      src={event.posterUrl}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{event.title}</p>
                      <p className="mt-1 text-sm text-app-muted">
                        {formatDateRange(event.startsAt, event.endsAt)} · {event.city}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <PortfolioLightboxModal
        item={activePortfolioItem}
        onClose={() => setActivePortfolioItemId(null)}
        open={Boolean(activePortfolioItem)}
      />
    </div>
  );
}
