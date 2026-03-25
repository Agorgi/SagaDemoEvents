"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { EarningsSummaryCard } from "@/src/components/EarningsSummaryCard";
import { ManageServicesModal } from "@/src/components/ManageServicesModal";
import { Modal } from "@/src/components/Modal";
import { Nav } from "@/src/components/Nav";
import { PortfolioGrid } from "@/src/components/PortfolioGrid";
import { ProfileStatsCard } from "@/src/components/ProfileStatsCard";
import { ServicesSection } from "@/src/components/ServicesSection";
import { StarRatingValue } from "@/src/components/StarRatingValue";
import { TagChip } from "@/src/components/Chips";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

export default function ProfilePage() {
  const {
    currentCreatorProfile,
    currentUser,
    currentUserId,
    resetOnboarding,
    saveCreatorServices,
    savedEventIds
  } = useAppState();
  const { events } = useDemoState();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"portfolio" | "saved">("portfolio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const profile = currentCreatorProfile;

  const savedItems = useMemo(() => {
    if (savedEventIds.length > 0) {
      return savedEventIds.reduce<Array<{
        id: string;
        image: string;
        title: string;
        kind: "event";
      }>>((items, eventId) => {
        const event = events.find((entry) => entry.id === eventId);
        if (!event) {
          return items;
        }

        items.push({
          id: `saved-event-${event.id}`,
          image: event.posterUrl,
          title: event.title,
          kind: "event"
        });
        return items;
      }, []);
    }

    return profile?.savedItems ?? [];
  }, [events, profile?.savedItems, savedEventIds]);

  if (!profile) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-[520px] px-4 py-16 text-center text-app-muted">
          Profile not found.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090b10]">
      <Nav />

      <main className="mx-auto w-full max-w-[520px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <div className="relative overflow-hidden rounded-[34px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(123,132,255,0.16),transparent_42%),linear-gradient(180deg,rgba(17,22,34,0.98),rgba(9,12,20,1))] px-5 pb-6 pt-5 shadow-soft sm:px-6">
          <div className="flex justify-end">
            <div className="relative">
              <button
                aria-label="Open profile actions"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-app-muted transition hover:border-white/18 hover:text-white"
                onClick={() => setMenuOpen((current) => !current)}
                type="button"
              >
                <OverflowIcon />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-12 z-20 min-w-[180px] overflow-hidden rounded-[20px] border border-white/10 bg-[#121826] p-2 shadow-[0_24px_44px_rgba(0,0,0,0.38)]">
                  <MenuLink href="/profile/setup" label="Edit profile" onClick={() => setMenuOpen(false)} />
                  <MenuLink
                    href={`/profiles/${currentUserId}`}
                    label="View public profile"
                    onClick={() => setMenuOpen(false)}
                  />
                  <MenuLink href="/settings/data" label="Settings" onClick={() => setMenuOpen(false)} />
                </div>
              ) : null}
            </div>
          </div>

          <section className="mt-2 flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-[-18px] rounded-full bg-[radial-gradient(circle,rgba(123,132,255,0.32),transparent_65%)] blur-2xl" />
              <Avatar
                className="relative h-24 w-24 border-4 border-[#0f1320] text-2xl sm:h-28 sm:w-28"
                name={profile.displayName}
                size="lg"
                src={profile.avatarImage || currentUser.avatarUrl}
              />
            </div>

            <h1 className="mt-5 text-[2rem] font-semibold tracking-[-0.04em] text-white">
              {profile.displayName}
            </h1>
            <p className="mt-1 text-sm text-app-muted">{profile.handle}</p>
            <p className="mt-3 max-w-[28rem] line-clamp-2 text-sm leading-6 text-[#D5D9E8]">
              {profile.bio}
            </p>
            <p className="mt-2 text-sm text-app-muted">{profile.location}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {profile.tags.slice(0, 4).map((tag) => (
                <TagChip key={tag} label={tag} subdued />
              ))}
            </div>
          </section>

          <div className="mt-6">
            <ProfileStatsCard
              items={[
                { label: "Projects", value: profile.stats.privateProjects ?? 0 },
                {
                  label: "Rating",
                  value: <StarRatingValue rating={profile.stats.privateRating ?? 4.8} />
                },
                { label: "Services", value: profile.stats.privateServices ?? profile.services.length }
              ]}
            />
          </div>

          {profile.earnings ? (
            <div className="mt-4">
              <EarningsSummaryCard earnings={profile.earnings} />
            </div>
          ) : null}

          <button
            className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-[22px] bg-app-purple px-4 py-3 text-base font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => setWithdrawOpen(true)}
            type="button"
          >
            Withdraw Funds
          </button>
        </div>

        <section className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-[22px] border border-white/8 bg-[#101522] p-1">
            <button
              className={`min-h-[44px] rounded-[18px] text-sm font-semibold transition ${
                activeTab === "portfolio"
                  ? "bg-app-purple text-white"
                  : "text-app-muted hover:text-white"
              }`}
              onClick={() => setActiveTab("portfolio")}
              type="button"
            >
              Portfolio
            </button>
            <button
              className={`min-h-[44px] rounded-[18px] text-sm font-semibold transition ${
                activeTab === "saved"
                  ? "bg-app-purple text-white"
                  : "text-app-muted hover:text-white"
              }`}
              onClick={() => setActiveTab("saved")}
              type="button"
            >
              Saved
            </button>
          </div>

          {activeTab === "portfolio" ? (
            <PortfolioGrid
              emptyText="Add work to build out your page."
              items={profile.portfolio}
            />
          ) : (
            <PortfolioGrid
              emptyText="Saved looks and nights will land here."
              items={savedItems}
            />
          )}
        </section>

        <div className="mt-8">
          <ServicesSection
            actionLabel="Add service"
            onAction={() => router.push("/profile/services/new")}
            onSecondaryAction={() => setManageOpen(true)}
            secondaryActionLabel="Manage"
            services={profile.services}
            title="Available services"
          />
        </div>

        <div className="mt-8">
          <button
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/18 hover:bg-white/[0.05]"
            onClick={() => {
              resetOnboarding();
              router.push("/onboarding");
            }}
            type="button"
          >
            Onboarding flow
          </button>
        </div>
      </main>

      <ManageServicesModal
        onClose={() => setManageOpen(false)}
        onSave={(services) => saveCreatorServices(currentUserId, services)}
        open={manageOpen}
        services={profile.services}
      />

      <Modal
        description="This is a demo-safe payout flow. Nothing will actually transfer."
        onClose={() => setWithdrawOpen(false)}
        open={withdrawOpen}
        panelClassName="max-w-md"
        title="Withdraw Funds"
      >
        <div className="space-y-4">
          <div className="rounded-[24px] border border-white/8 bg-[#101522] p-4">
            <p className="text-sm text-app-muted">Available now</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {profile.earnings?.available ?? "$0"}
            </p>
          </div>
          <p className="text-sm leading-6 text-app-muted">
            In production this would route into a payout destination and confirmation step.
          </p>
          <button
            className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => setWithdrawOpen(false)}
            type="button"
          >
            Got it
          </button>
        </div>
      </Modal>
    </div>
  );
}

function MenuLink({
  href,
  label,
  onClick
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      className="block rounded-[14px] px-3 py-2.5 text-sm text-white transition hover:bg-white/[0.04]"
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function OverflowIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M12 5.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm0 7a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm0 7a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
