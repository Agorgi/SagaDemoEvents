"use client";

import Link from "next/link";
import { useEffect } from "react";

import { LaunchSummaryCard } from "@/src/components/LaunchSummaryCard";
import { type DemoLaunch } from "@/src/data/launches";
import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";

export default function StudioPage() {
  const { launches, setMode } = useAppState();

  useEffect(() => {
    setMode("host");
  }, [setMode]);

  const hostLaunches = launches
    .filter((launch) => launch.hostId === HOST_DEMO_USER_ID)
    .sort((left, right) => Number(left.status === "completed") - Number(right.status === "completed"));

  const drafts = hostLaunches.filter((launch) => launch.status === "draft");
  const liveSoftLaunches = hostLaunches.filter((launch) => launch.status === "live_soft_launch");
  const nearGoalLaunches = hostLaunches.filter((launch) => launch.status === "near_goal");
  const confirmedLaunches = hostLaunches.filter(
    (launch) => launch.status === "confirmed" || launch.status === "paired" || Boolean(launch.eventId)
  );

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[860px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Launch</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Launch</h1>
            <p className="mt-2 text-sm text-app-muted">Turn an idea into a real night.</p>
          </div>
          <Link
            className="inline-flex min-h-[46px] items-center rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            href="/studio/new"
          >
            Start a launch
          </Link>
        </section>

        <div className="mt-8 space-y-8">
          <LaunchSection
            actionLabel="Manage"
            launches={drafts}
            title="Drafts"
          />
          <LaunchSection
            actionLabel="Manage"
            launches={liveSoftLaunches}
            title="Live soft launches"
          />
          <LaunchSection
            actionLabel="Manage"
            launches={nearGoalLaunches}
            title="Near goal"
          />
          <LaunchSection
            actionLabel="View launch"
            launches={confirmedLaunches}
            title="Funded and confirmed"
          />
        </div>
      </main>
    </div>
  );
}

function LaunchSection({
  launches,
  title,
  actionLabel
}: {
  launches: DemoLaunch[];
  title: string;
  actionLabel: string;
}) {
  if (!launches.length) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="grid gap-4">
        {launches.map((launch) => (
          <LaunchSummaryCard
            actionLabel={actionLabel}
            key={launch.id}
            launch={launch}
            onAction={() => {
              if (launch.status === "completed") {
                window.location.assign(`/studio/${launch.id}?tab=payouts`);
                return;
              }
              if (launch.eventId) {
                window.location.assign(`/studio/${launch.id}`);
                return;
              }
              window.location.assign(`/studio/${launch.id}`);
            }}
          />
        ))}
      </div>
    </section>
  );
}
