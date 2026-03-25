"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { getListingsForUser, getStorefrontForUser } from "@/src/data/economy";
import { getPortfolioForUser } from "@/src/data/social";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

export default function ProfilePage() {
  const {
    currentProfile,
    currentUser,
    currentUserId,
    currentBusinessProfile,
    goingEventIds,
    listings,
    preferredFandoms,
    savedEventIds
  } = useAppState();
  const { roles } = useDemoState();

  const portfolio = getPortfolioForUser(currentUserId);
  const storefront = getStorefrontForUser(currentUserId);
  const storefrontListings = getListingsForUser(currentUserId, listings);
  const creditsCount = roles.filter((role) => role.filledByUserId === currentUserId).length;
  const plansCount = goingEventIds.length + savedEventIds.length;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[#0f1320] shadow-soft">
          <div className="relative h-[180px] bg-[#121622] sm:h-[220px]">
            <img
              alt={currentUser.name}
              className="h-full w-full object-cover"
              src={currentProfile?.coverImageUrl ?? "/group-88462-v2.png"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/35 to-transparent" />
          </div>
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12">
              <Avatar
                className="h-20 w-20 border-4 border-[#0f1320] text-xl sm:h-24 sm:w-24"
                name={currentUser.name}
                size="lg"
                src={currentUser.avatarUrl}
              />
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold text-white">{currentUser.name}</h1>
                <p className="text-sm text-app-muted">
                  {currentUser.handle} · {currentUser.city}
                </p>
                <ExpandableText
                  collapsedLines={2}
                  text={currentProfile?.headline ?? currentUser.bio}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentProfile?.fandoms ?? preferredFandoms).slice(0, 5).map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 sm:max-w-[360px]">
                <StatCard label="Credits" value={String(creditsCount)} />
                <StatCard label="Plans" value={String(plansCount)} />
                <StatCard label="Listings" value={String(storefrontListings.length)} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-[46px] items-center rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  href={`/profiles/${currentUserId}`}
                >
                  View public page
                </Link>
                <Link
                  className="inline-flex min-h-[46px] items-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  href="/my-events"
                >
                  Open plans
                </Link>
                <Link
                  className="inline-flex min-h-[46px] items-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  href="/settings/data"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Credits</h2>
            <div className="surface-card p-5">
              <p className="text-sm text-app-muted">
                {creditsCount > 0
                  ? `${creditsCount} past event credits are attached to this profile.`
                  : "Event credits will show up here."}
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Portfolio</h2>
            {portfolio.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {portfolio.slice(0, 4).map((item) => (
                  <div className="overflow-hidden rounded-[26px] border border-white/8 bg-[#0d1119]" key={item.id}>
                    <img alt={item.title} className="h-44 w-full object-cover" src={item.imageUrl} />
                    <div className="p-4">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-app-muted">{item.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="surface-card p-5">
                <p className="text-sm text-app-muted">Portfolio cards will show up here.</p>
              </div>
            )}
          </section>

          {storefront || storefrontListings.length > 0 || currentBusinessProfile ? (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Public links</h2>
              <div className="grid gap-4">
                {storefront ? (
                  <div className="surface-card p-5">
                    <p className="font-semibold text-white">{storefront.title}</p>
                    <p className="mt-1 text-sm text-app-muted">{storefront.headline}</p>
                  </div>
                ) : null}
                {currentBusinessProfile ? (
                  <div className="surface-card p-5">
                    <p className="font-semibold text-white">{currentBusinessProfile.name}</p>
                    <p className="mt-1 text-sm text-app-muted">{currentBusinessProfile.summary}</p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.02] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-app-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
