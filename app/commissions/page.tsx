"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CommissionCard } from "@/src/components/CommissionCard";
import { FilterChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { PageHeroHeader } from "@/src/components/PageHeroHeader";
import { StartCommissionModal } from "@/src/components/StartCommissionModal";
import { getUserById } from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";

type CommissionFilter =
  | "all"
  | "events"
  | "creator projects"
  | "near me"
  | "ending soon"
  | "backed";

export default function CommissionsPage() {
  const router = useRouter();
  const { activeUserId, commissions } = useDemoState();
  const [filter, setFilter] = useState<CommissionFilter>("all");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const activeUser = getUserById(activeUserId);

  const filteredCommissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return commissions.filter((commission) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "events"
            ? commission.type === "event"
            : filter === "creator projects"
              ? commission.type === "creator project"
              : filter === "near me"
                ? commission.city === activeUser?.city
                : filter === "ending soon"
                  ? commission.status === "ending soon" || commission.daysLeft <= 3
                  : commission.backedByUserIds.includes(activeUserId);

      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : `${commission.title} ${commission.shortDescription} ${commission.fandomTags.join(" ")}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeUser?.city, activeUserId, commissions, filter, query]);

  const featuredCommission =
    filteredCommissions.find((commission) => commission.featured) ?? filteredCommissions[0];
  const remainingCommissions = featuredCommission
    ? filteredCommissions.filter((commission) => commission.id !== featuredCommission.id)
    : filteredCommissions;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6">
        <div className="space-y-6">
          <section className="space-y-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <PageHeroHeader
                eyebrow="Event boosts"
                label={activeUser?.city ?? "Saga"}
                subtitle="Back the nights, upgrades, and creator-led add-ons you want to see happen."
                title="Unlock better productions"
              />
              <button
                className="inline-flex min-h-[48px] rounded-2xl bg-app-purple px-5 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() => setCreateOpen(true)}
                type="button"
              >
                Start an Event Boost
              </button>
            </div>

            <div className="grid gap-4 rounded-[30px] bg-white/[0.04] p-5 xl:grid-cols-[1fr_auto] xl:items-center">
              <label className="flex w-full items-center gap-3 rounded-[20px] bg-[#0d1119]/92 px-4 py-3 text-app-muted transition focus-within:bg-[#111728]">
                <span aria-hidden="true">⌕</span>
                <input
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search boosts, hosts, fandoms, and event upgrades"
                  type="search"
                  value={query}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "all",
                    "events",
                    "creator projects",
                    "near me",
                    "ending soon",
                    "backed"
                  ] satisfies CommissionFilter[]
                ).map((option) => (
                  <FilterChip
                    active={filter === option}
                    key={option}
                    label={
                      option === "all"
                        ? "All"
                        : option === "events"
                          ? "Events"
                          : option === "creator projects"
                            ? "Creator Projects"
                            : option === "near me"
                              ? "Near Me"
                              : option === "ending soon"
                                ? "Ending Soon"
                                : "Backed"
                    }
                    onClick={() => setFilter(option)}
                  />
                ))}
              </div>
            </div>
          </section>

          {featuredCommission ? (
            <CommissionCard
              backed={featuredCommission.backedByUserIds.includes(activeUserId)}
              commission={featuredCommission}
              variant="hero"
            />
          ) : null}

          {remainingCommissions.length > 0 ? (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {remainingCommissions.map((commission) => (
                <CommissionCard
                  backed={commission.backedByUserIds.includes(activeUserId)}
                  commission={commission}
                  key={commission.id}
                />
              ))}
            </section>
          ) : (
            <section className="rounded-[30px] bg-white/[0.04] p-8 text-center">
              <h2 className="text-2xl font-semibold text-white">No boosts match that view</h2>
              <p className="mt-3 text-app-muted">
                Adjust the filters or publish a new boost for an upcoming event.
              </p>
              <button
                className="mt-6 rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() => setCreateOpen(true)}
                type="button"
              >
                Start an Event Boost
              </button>
            </section>
          )}
        </div>
      </main>

      <StartCommissionModal
        onClose={() => setCreateOpen(false)}
        onPublished={(commissionId) => router.push(`/commissions/${commissionId}`)}
        open={createOpen}
      />
    </div>
  );
}
