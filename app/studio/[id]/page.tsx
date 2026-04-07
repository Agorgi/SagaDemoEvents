"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Nav } from "@/src/components/Nav";
import { NextActionPanel } from "@/src/components/NextActionPanel";
import { PayoutWaterfallCard } from "@/src/components/PayoutWaterfallCard";
import { StatusChip } from "@/src/components/StatusChip";
import { TagChip } from "@/src/components/Chips";
import { buildCrewPlanRoles } from "@/src/data/crew-plan";
import { getLaunchFundingProgress } from "@/src/data/launches";
import { useAppState } from "@/src/lib/app-state";
import { formatCurrency, formatDateRange } from "@/src/lib/utils";

const tabs = ["overview", "demand", "venue", "team", "run-of-show", "payouts"] as const;
type WorkspaceTab = (typeof tabs)[number];

export default function StudioLaunchPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as WorkspaceTab | null) ?? "overview";
  const {
    launches,
    users,
    creatorProfiles,
    publishLaunch,
    completeLaunch,
    addLaunchUpdate,
    acceptVenuePairing,
    setMode
  } = useAppState();
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");

  useEffect(() => {
    setMode("host");
  }, [setMode]);

  const launch = launches.find((item) => item.id === params.id);

  if (!launch) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Launch not found.
        </main>
      </div>
    );
  }

  const funding = getLaunchFundingProgress(launch);
  const selectedVenue =
    launch.selectedVenueId
      ? launch.venueCandidates.find((candidate) => candidate.id === launch.selectedVenueId)
      : null;
  const crewPlanRoles = buildCrewPlanRoles(
      {
        id: launch.id,
        launchMode: launch.status === "live_soft_launch" ? "soft" : "happening",
        format: mapLaunchFormatToBriefFormat(launch.format),
        sizeBucket: launch.attendanceGoal >= 180 ? "101–250" : launch.attendanceGoal >= 100 ? "51–100" : "21–50",
      city: launch.city,
      fandomTags: launch.fandomTags,
      conceptVision: launch.description,
      visualDirectionSelections: launch.inspiration,
      crewBudgetRange: launch.budgetRange,
      deliverableSelections: [],
      briefStartDate: launch.startsAt.slice(0, 10),
      briefEndDate: launch.startsAt.slice(0, 10)
    },
    creatorProfiles,
    users
  );

  const nextAction =
    launch.status === "draft"
      ? {
          title: "Launch the interest check",
          body: "The concept is staged. Open it to fans so date votes and early reserves can start rolling in.",
          label: "Launch soft launch",
          action: () => publishLaunch(launch.id)
        }
      : launch.status === "live_soft_launch" || launch.status === "near_goal"
        ? {
            title: "Push momentum",
            body: funding.statusLine,
            label: "Open public page",
            action: () => window.location.assign(`/campaigns/${launch.id}`)
          }
        : launch.status === "funded"
          ? {
              title: "Pick a venue",
              body: "The threshold cleared. Choose the room that fits the turnout and vibe.",
              label: "Open venue matches",
              action: () => router.replace(`${pathname}?tab=venue`)
            }
          : launch.status === "paired"
            ? {
                title: "Confirm the event",
                body: "The room is chosen. Publish the confirmed public event next.",
                label: "Confirm event",
                action: () => {
                  if (launch.selectedVenueId) {
                    acceptVenuePairing(launch.id, launch.selectedVenueId);
                  }
                }
              }
            : launch.status === "confirmed" && launch.eventId
              ? {
                  title: "Open the public event",
                  body: "The soft launch graduated. Tickets and room updates now live on the event page.",
                  label: "Open event page",
                  action: () => window.location.assign(`/events/${launch.eventId}`)
                }
              : {
                  title: "Review payouts",
                  body: "This run is closed. Review what worked and what to repeat next.",
                  label: "Review payouts",
                  action: () => router.replace(`${pathname}?tab=payouts`)
                };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[1040px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <StatusChip status={launch.status} />
                <p className="text-sm text-app-muted">{formatDateRange(launch.startsAt)}</p>
              </div>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{launch.title}</h1>
              <p className="mt-3 text-sm text-app-muted">Turn an idea into a real night.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={nextAction.action}
                type="button"
              >
                {nextAction.label}
              </button>
              <Link
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                href={launch.eventId ? `/events/${launch.eventId}` : `/campaigns/${launch.id}`}
              >
                {launch.eventId ? "Open event page" : "Open public page"}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-6 gap-1.5 sm:flex sm:gap-2 sm:overflow-x-auto sm:pb-1 sm:subtle-scrollbar">
            {tabs.map((item) => (
              <button
                className={`pill !rounded-[14px] !px-2 !py-2 text-[11px] font-semibold leading-none tracking-[-0.01em] whitespace-nowrap sm:!rounded-full sm:!px-3 sm:!py-2 sm:text-xs ${
                  tab === item ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"
                }`}
                key={item}
                onClick={() => router.replace(`${pathname}?tab=${item}`)}
                type="button"
              >
                <span className="sm:hidden">
                  {item === "run-of-show" ? "Run" : item === "overview" ? "Overview" : item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
                <span className="hidden sm:inline">
                  {item === "run-of-show" ? "Run of Show" : item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 space-y-6">
          {tab === "overview" ? (
            <>
              <NextActionPanel
                actionLabel={nextAction.label}
                body={nextAction.body}
                onAction={nextAction.action}
                title={nextAction.title}
              />

              <section className="grid gap-4 sm:grid-cols-2">
                <MetricCard label="Threshold" value={`${funding.current} / ${funding.target}`} />
                <MetricCard label="Locked price" value={formatCurrency(launch.ticketPrice)} />
                <MetricCard label="Date options" value={`${launch.dateOptions.length} live options`} />
                <MetricCard
                  label={selectedVenue ? "Venue paired" : "Team needs"}
                  value={selectedVenue ? selectedVenue.name : `${launch.teamRoleNames.length} roles`}
                />
              </section>

              <section className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Launch notes</p>
                <div className="mt-4 space-y-3 rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                  <p className="text-sm leading-6 text-app-muted">{launch.vibeNote}</p>
                  <div className="flex flex-wrap gap-2">
                    {launch.inspiration.map((item) => (
                      <TagChip key={item} label={item} subdued />
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {tab === "demand" ? (
            <>
              <section className="surface-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Demand curve</p>
                    <p className="mt-1 text-sm text-app-muted">Signal against the threshold line.</p>
                  </div>
                  <StatusChip status={launch.status} />
                </div>
                <div className="mt-5 rounded-[26px] bg-[#0d1119] p-4">
                  <DemandCurve
                    points={[
                      Math.max(6, Math.round(funding.current * 0.18)),
                      Math.max(12, Math.round(funding.current * 0.32)),
                      Math.max(16, Math.round(funding.current * 0.52)),
                      Math.max(24, Math.round(funding.current * 0.76)),
                      funding.current
                    ]}
                    threshold={funding.target}
                  />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Total reservations" value={String(funding.current)} />
                  <MetricCard label="Conversion rate" value={`${Math.max(14, Math.min(48, Math.round((funding.pledges / Math.max(funding.watchers, 1)) * 100)))}%`} />
                  <MetricCard label="Top referral source" value="Instagram Stories" />
                </div>
              </section>

              <section className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Recent activity</p>
                <div className="mt-4 space-y-3">
                  {[
                    `${Math.max(8, Math.round(funding.current * 0.18))} new reserves this week`,
                    `Shared ${Math.max(22, funding.watchers * 3)} times on Instagram`,
                    `${launch.fandomTags[0] ?? "Community"} is driving the strongest click-through`
                  ].map((item) => (
                    <div className="rounded-[22px] bg-white/[0.04] px-4 py-4" key={item}>
                      <p className="text-sm text-white/86">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Post an update</p>
                <div className="mt-4 space-y-3">
                  <input
                    className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setUpdateTitle(event.target.value)}
                    placeholder="Update title"
                    value={updateTitle}
                  />
                  <textarea
                    className="min-h-[120px] w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setUpdateBody(event.target.value)}
                    placeholder="What changed, what is new, or why this project is moving..."
                    value={updateBody}
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                      onClick={() => {
                        if (!updateTitle.trim() || !updateBody.trim()) {
                          return;
                        }
                        addLaunchUpdate(launch.id, {
                          title: updateTitle,
                          body: updateBody
                        });
                        setUpdateTitle("");
                        setUpdateBody("");
                      }}
                      type="button"
                    >
                      Post update
                    </button>
                    <Link
                      className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                      href={`/campaigns/${launch.id}`}
                    >
                      Open public page
                    </Link>
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {tab === "venue" ? (
            <section className="space-y-4">
              <div className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Venue suggestions</p>
                <p className="mt-3 text-sm leading-6 text-app-muted">
                  Suggestions based on your event size, city, and visual direction.
                </p>
              </div>

              {launch.venueCandidates.map((venue) => (
                <div className="surface-card p-5 sm:p-6" key={venue.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-white">{venue.name}</p>
                      <p className="mt-1 text-sm text-app-muted">
                        {venue.area} · {venue.capacity} capacity
                      </p>
                    </div>
                    <TagChip
                      label={
                        launch.selectedVenueId === venue.id
                          ? launch.eventId
                            ? "Held"
                            : "Requested"
                          : `Fits ${launch.attendanceGoal} / ${formatDateRange(launch.startsAt)}`
                      }
                      subdued
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <TagChip label={venue.vibe} subdued />
                    <TagChip label={launch.fandomTags[0] ?? launch.format} subdued />
                    <TagChip label={launch.budgetRange} subdued />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-app-muted">{venue.note}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={funding.current < funding.target}
                      onClick={() => acceptVenuePairing(launch.id, venue.id)}
                      type="button"
                    >
                      {launch.selectedVenueId === venue.id || launch.eventId ? "Request hold" : "Contact"}
                    </button>
                    {launch.selectedVenueId === venue.id && launch.eventId ? (
                      <Link
                        className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                        href={`/events/${launch.eventId}`}
                      >
                        Open event
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {tab === "team" ? (
            <section className="space-y-5">
              <section className="surface-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Crew plan</p>
                    <p className="mt-1 text-sm text-app-muted">Recommended collaborators, rates, and status.</p>
                  </div>
                  <Link
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                    href={`/studio/crew-plan/${launch.id}`}
                  >
                    Open full crew plan
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {crewPlanRoles.map((role) => {
                    const lead = role.matches[0];
                    return (
                      <div className="rounded-[24px] bg-white/[0.04] p-4" key={role.id}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              alt={lead?.name ?? role.title}
                              className="h-14 w-14 rounded-[16px] object-cover"
                              src={lead?.portfolioImages[0] ?? launch.coverImageUrl}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{role.title}</p>
                              <p className="truncate text-sm text-app-muted">
                                {lead?.name ?? "Suggested creator"} · {lead?.rateLabel ?? role.suggestedRateLabel}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/72">
                            {launch.acceptedTeam.some((entry) => entry.roleName === role.title)
                              ? "Confirmed"
                              : launch.status === "confirmed"
                                ? "Pending review"
                                : "Outreach sent"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                    href={`/studio/crew-plan/${launch.id}`}
                  >
                    Open full crew plan
                  </Link>
                  <button
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                    type="button"
                  >
                    Add role
                  </button>
                </div>
              </section>
            </section>
          ) : null}

          {tab === "run-of-show" ? (
            <section className="surface-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Run of show</p>
                  <p className="mt-1 text-sm text-app-muted">Event-day timing and assigned coverage.</p>
                </div>
                <button
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  type="button"
                >
                  Edit schedule
                </button>
              </div>
              {launch.eventId ? (
                <div className="mt-4 space-y-3">
                  {launch.runOfShow.map((step) => (
                    <div className="flex items-center justify-between gap-4 rounded-[22px] bg-white/[0.04] p-4" key={`${step.time}-${step.label}`}>
                      <div>
                        <p className="font-semibold text-white">{step.label}</p>
                        <p className="text-sm text-app-muted">{step.owner}</p>
                      </div>
                      <p className="text-sm text-white">{step.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-app-muted">
                  This unlocks after the launch confirms and the venue is locked.
                </p>
              )}
            </section>
          ) : null}

          {tab === "payouts" ? (
            <section className="space-y-4">
              {launch.status !== "completed" ? (
                <div className="surface-card p-5">
                  <p className="text-sm font-semibold text-white">Payouts are not ready yet.</p>
                  <p className="mt-2 text-sm text-app-muted">
                    Close the run after the confirmed event finishes to unlock the payout view.
                  </p>
                  {launch.eventId ? (
                    <button
                      className="mt-4 rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                      onClick={() => completeLaunch(launch.id)}
                      type="button"
                    >
                      Mark event complete
                    </button>
                  ) : null}
                </div>
              ) : null}
              <div className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Crew payout breakdown</p>
                <div className="mt-4 space-y-3">
                  {launch.payouts.contributorPayouts.map((payout) => {
                    const teammate = users.find((user) => user.id === payout.userId) ?? crewPlanRoles.find((role) => role.title === payout.roleName)?.matches[0];
                    return (
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-[22px] bg-white/[0.04] p-4" key={`${payout.roleName}-${payout.amount}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{payout.roleName}</p>
                          <p className="truncate text-sm text-app-muted">
                            {"name" in (teammate ?? {}) ? teammate?.name : "Pending assignment"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{formatCurrency(payout.amount)}</p>
                          <p className="mt-1 text-xs text-app-muted">
                            {launch.status === "completed" ? "Scheduled" : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Total crew cost" value={formatCurrency(launch.payouts.contributorPayouts.reduce((sum, item) => sum + item.amount, 0))} />
                  <MetricCard label="Saga fee (15%)" value={formatCurrency(Math.round(launch.payouts.ticketSales * 0.15))} />
                  <MetricCard label="Net to host" value={formatCurrency(launch.payouts.hostNet)} />
                </div>
                <button
                  className="mt-4 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  type="button"
                >
                  Review payouts
                </button>
              </div>
              <PayoutWaterfallCard payouts={launch.payouts} />
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-app-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function DemandCurve({ points, threshold }: { points: number[]; threshold: number }) {
  const width = 320;
  const height = 140;
  const maxValue = Math.max(threshold, ...points, 1);
  const linePoints = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - (point / maxValue) * (height - 12);
      return `${x},${y}`;
    })
    .join(" ");
  const thresholdY = height - (threshold / maxValue) * (height - 12);

  return (
    <svg className="h-[150px] w-full" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="demandLine" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#6D5EF3" />
          <stop offset="100%" stopColor="#7B84FF" />
        </linearGradient>
      </defs>
      <line stroke="rgba(255,255,255,0.18)" strokeDasharray="6 6" strokeWidth="2" x1="0" x2={width} y1={thresholdY} y2={thresholdY} />
      <polyline
        fill="none"
        points={linePoints}
        stroke="url(#demandLine)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {points.map((point, index) => {
        const x = (index / Math.max(points.length - 1, 1)) * width;
        const y = height - (point / maxValue) * (height - 12);
        return <circle cx={x} cy={y} fill="#FFFFFF" key={`${point}-${index}`} r="3.5" />;
      })}
    </svg>
  );
}

function mapLaunchFormatToBriefFormat(format: string) {
  switch (format) {
    case "social":
      return "Meetup / hangout";
    case "showcase":
      return "Live show / performance";
    case "pop-up":
      return "Market / vendor night";
    case "workshop":
      return "Tournament / competition";
    default:
      return "Themed experience / ball";
  }
}
