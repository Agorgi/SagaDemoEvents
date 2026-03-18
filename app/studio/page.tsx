"use client";

import Link from "next/link";

import { LaunchSummaryCard } from "@/src/components/LaunchSummaryCard";
import { Nav } from "@/src/components/Nav";
import { NextActionPanel } from "@/src/components/NextActionPanel";
import { useAppState } from "@/src/lib/app-state";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";

export default function StudioPage() {
  const { launches } = useAppState();
  const hostLaunches = launches
    .filter((launch) => launch.hostId === HOST_DEMO_USER_ID)
    .sort((left, right) => Number(left.status === "completed") - Number(right.status === "completed"));

  const launchesInProgress = hostLaunches.filter((launch) => launch.status !== "completed");
  const currentLaunch =
    launchesInProgress.find((launch) => !launch.published) ??
    launchesInProgress[0] ??
    hostLaunches[0];

  const stats = [
    { label: "In progress", value: launchesInProgress.length },
    {
      label: "Needs team",
      value: launchesInProgress.filter(
        (launch) => launch.teamRoleNames.length > launch.acceptedTeam.length
      ).length
    },
    {
      label: "Payouts",
      value: hostLaunches.filter((launch) => launch.status === "completed").length
    }
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[860px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Studio</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Keep one launch moving.</h1>
          </div>
          <Link
            className="inline-flex rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            href="/studio/new"
          >
            Start a launch
          </Link>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div className="surface-card p-4" key={stat.label}>
              <p className="text-xs uppercase tracking-[0.14em] text-app-muted">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <NextActionPanel
            actionLabel={
              currentLaunch
                ? currentLaunch.status === "completed"
                  ? "Review payouts"
                  : "Open current launch"
                : "Start a launch"
            }
            body={currentLaunch ? currentLaunch.title : "Build your first event and publish when it feels ready."}
            onAction={() => {
              if (currentLaunch) {
                window.location.assign(`/studio/${currentLaunch.id}`);
                return;
              }
              window.location.assign("/studio/new");
            }}
            title={
              currentLaunch
                ? currentLaunch.plan.bestNextMove
                : "Start your first launch"
            }
          />
        </div>

        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">Your launches</h2>
            {hostLaunches.length > 0 ? (
              <Link
                className="text-sm font-semibold text-app-muted transition hover:text-white"
                href="/explore"
              >
                See live events
              </Link>
            ) : null}
          </div>

          {hostLaunches.length > 0 ? (
            <div className="grid gap-4">
              {hostLaunches.map((launch) => (
                <LaunchSummaryCard
                  actionLabel={launch.status === "completed" ? "Review payouts" : "Open current launch"}
                  key={launch.id}
                  launch={launch}
                  onAction={() => {
                    window.location.assign(`/studio/${launch.id}${launch.status === "completed" ? "?tab=payouts" : ""}`);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="surface-card p-5">
              <p className="text-sm text-app-muted">No launches yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
