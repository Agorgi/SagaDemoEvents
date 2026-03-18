"use client";

import Link from "next/link";

import { LaunchSummaryCard } from "@/src/components/LaunchSummaryCard";
import { Nav } from "@/src/components/Nav";
import { NextActionPanel } from "@/src/components/NextActionPanel";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { useAppState } from "@/src/lib/app-state";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";
import { formatCompactNumber } from "@/src/lib/utils";

export default function StudioPage() {
  const { launches, mode } = useAppState();
  const hostLaunches = launches.filter((launch) => launch.hostId === HOST_DEMO_USER_ID);
  const launchesInProgress = hostLaunches.filter((launch) => launch.status !== "completed");
  const needsAttention = launchesInProgress.filter(
    (launch) => launch.status === "planning" || launch.status === "validating"
  );
  const teamGaps = launchesInProgress.filter(
    (launch) => launch.teamRoleNames.length > launch.acceptedTeam.length
  );
  const thresholdWatch = launchesInProgress.filter((launch) => {
    const progress = (launch.reserveCount + launch.ticketCount) / Math.max(launch.plan.thresholdTarget, 1);
    return progress >= 0.65 && progress < 1;
  });
  const payoutsReady = hostLaunches.filter((launch) => launch.status === "completed");
  const repeatCandidate = hostLaunches.find((launch) => launch.status === "completed") ?? hostLaunches[0];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[1080px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Studio</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                {mode === "host" ? "What should you do next?" : "Studio"}
              </h1>
              <p className="mt-3 max-w-[54ch] text-sm leading-6 text-app-muted">
                Move the launch that matters most. Publish what is ready, recruit where the team is thin, and close the loop on payouts once the run is done.
              </p>
            </div>
            <Link
              className="inline-flex rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              href="/studio/new"
            >
              Start a launch
            </Link>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="space-y-6">
            <NextActionPanel
              actionLabel={needsAttention[0]?.published ? "Open current launch" : "Publish launch"}
              body={
                needsAttention[0]
                  ? `${needsAttention[0].title} is the launch that needs a decision first. ${needsAttention[0].plan.bestNextMove.toLowerCase()} before the window cools off.`
                  : "Your launches are in a good spot. Open the strongest one and keep it moving."
              }
              onAction={() => {
                if (needsAttention[0]) {
                  window.location.assign(`/studio/${needsAttention[0].id}`);
                }
              }}
              title={needsAttention[0]?.title ?? "Everything is moving"}
            />

            <SectionGrid
              eyebrow="Launches in progress"
              title="Keep the pipeline moving"
              items={launchesInProgress}
              render={(launch) => (
                <LaunchSummaryCard
                  actionLabel="Open current launch"
                  key={launch.id}
                  launch={launch}
                  onAction={() => {
                    window.location.assign(`/studio/${launch.id}`);
                  }}
                />
              )}
            />

            <SectionGrid
              eyebrow="Needs attention"
              title="Handle the blockers"
              items={needsAttention}
              render={(launch) => (
                <Link
                  className="surface-card block p-5 transition hover:border-white/12"
                  href={`/studio/${launch.id}`}
                  key={launch.id}
                >
                  <p className="text-lg font-semibold text-white">{launch.title}</p>
                  <p className="mt-2 text-sm text-app-muted">{launch.plan.bestNextMove}</p>
                </Link>
              )}
            />
          </div>

          <div className="space-y-6">
            <SmallPanel title="Team gaps">
              {teamGaps.length > 0 ? (
                teamGaps.slice(0, 3).map((launch) => (
                  <Link className="block rounded-[20px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12" href={`/studio/${launch.id}?tab=team`} key={launch.id}>
                    <p className="font-semibold text-white">{launch.title}</p>
                    <p className="mt-2 text-sm text-app-muted">
                      {launch.teamRoleNames.length - launch.acceptedTeam.length} roles still need a person.
                    </p>
                  </Link>
                ))
              ) : (
                <EmptyLine text="No team gaps need attention right now." />
              )}
            </SmallPanel>

            <SmallPanel title="Threshold watch">
              {thresholdWatch.length > 0 ? (
                thresholdWatch.slice(0, 3).map((launch) => (
                  <div className="rounded-[20px] border border-white/8 bg-[#0d1119] p-4" key={launch.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{launch.title}</p>
                      <span className="text-sm text-app-muted">{formatCompactNumber(launch.reserveCount + launch.ticketCount)}</span>
                    </div>
                    <div className="mt-3">
                      <ThresholdProgress
                        compact
                        current={launch.reserveCount + launch.ticketCount}
                        target={launch.plan.thresholdTarget}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyLine text="Nothing is hovering near the threshold today." />
              )}
            </SmallPanel>

            <SmallPanel title="Payouts ready">
              {payoutsReady.length > 0 ? (
                payoutsReady.map((launch) => (
                  <Link className="block rounded-[20px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12" href={`/studio/${launch.id}?tab=payouts`} key={launch.id}>
                    <p className="font-semibold text-white">{launch.title}</p>
                    <p className="mt-2 text-sm text-app-muted">Review payouts and decide what to repeat next.</p>
                  </Link>
                ))
              ) : (
                <EmptyLine text="Payouts show up here after a launch is completed." />
              )}
            </SmallPanel>

            {repeatCandidate ? (
              <SmallPanel title="Repeat this in another city">
                <Link
                  className="block rounded-[20px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12"
                  href={`/studio/new?copy=${repeatCandidate.id}`}
                >
                  <p className="font-semibold text-white">{repeatCandidate.title}</p>
                  <p className="mt-2 text-sm text-app-muted">{repeatCandidate.payouts.repeatNote}</p>
                </Link>
              </SmallPanel>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionGrid<T>({
  eyebrow,
  title,
  items,
  render
}: {
  eyebrow: string;
  title: string;
  items: T[];
  render: (item: T) => React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-app-muted">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      </div>
      <div className="grid gap-4">{items.map((item) => render(item))}</div>
    </section>
  );
}

function SmallPanel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="text-sm leading-6 text-app-muted">{text}</p>;
}

