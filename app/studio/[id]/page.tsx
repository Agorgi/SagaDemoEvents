"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { Nav } from "@/src/components/Nav";
import { NextActionPanel } from "@/src/components/NextActionPanel";
import { PayoutWaterfallCard } from "@/src/components/PayoutWaterfallCard";
import { StatusChip } from "@/src/components/StatusChip";
import { TagChip } from "@/src/components/Chips";
import { TeamMatchCard } from "@/src/components/TeamMatchCard";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { type DemoEvent } from "@/src/data/demo";
import { getLaunchFundingProgress } from "@/src/data/launches";
import { useAppState } from "@/src/lib/app-state";
import { buildShortlist } from "@/src/lib/matching";
import { useDemoState } from "@/src/lib/demo-state";
import { formatCurrency, formatDateRange } from "@/src/lib/utils";

const tabs = ["overview", "demand", "venue", "team", "run-of-show", "payouts"] as const;
type WorkspaceTab = (typeof tabs)[number];

const roleSkillMap: Record<string, string[]> = {
  photographer: ["photography", "editing", "portrait lighting"],
  "social promo": ["social promo", "copywriting", "creator outreach"],
  "guest experience": ["hospitality", "community moderation", "guest lists"],
  "merch table": ["merch ops", "guest lists", "check-in"],
  "check-in": ["check-in", "front of house", "guest lists"],
  "host support": ["run of show", "ops", "hospitality"],
  "creator marketing": ["social promo", "content strategy", "copywriting"],
  "event ops": ["ops", "runner", "load-in"],
  moderator: ["community moderation", "guest lists", "front of house"],
  "guest cosplayer": ["guest hosting", "cosplay", "stage comfort"]
};

export default function StudioLaunchPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as WorkspaceTab | null) ?? "overview";
  const {
    launches,
    users,
    resolveUser,
    publishLaunch,
    completeLaunch,
    addLaunchUpdate,
    acceptLaunchMatch,
    removeLaunchMatch,
    acceptVenuePairing,
    setMode
  } = useAppState();
  const { events, roles, inviteCandidate, confirmRole, passApplicant } = useDemoState();
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

  const linkedEvent = launch.eventId ? events.find((event) => event.id === launch.eventId) : null;
  const eventRoles = launch.eventId ? roles.filter((role) => role.eventId === launch.eventId) : [];
  const openRoles = eventRoles.filter((role) => role.status !== "filled");
  const funding = getLaunchFundingProgress(launch);
  const selectedVenue =
    launch.selectedVenueId
      ? launch.venueCandidates.find((candidate) => candidate.id === launch.selectedVenueId)
      : null;

  const shortlistSource: DemoEvent = linkedEvent ?? {
    id: launch.id,
    title: launch.title,
    subtitle: launch.description,
    description: launch.description,
    fandomTags: launch.fandomTags,
    city: launch.city,
    venue: launch.venue,
    startsAt: launch.startsAt,
    posterUrl: launch.coverImageUrl,
    hostId: launch.hostId,
    attendeesCount: launch.ticketCount,
    mutualsCount: 0,
    communityCount: 0,
    priceLabel: `$${launch.ticketPrice}`
  };

  const nextAction =
    launch.status === "draft"
      ? {
          title: "Launch the interest check",
          body: "The concept is staged. Open it to fans so date votes and early pledges can start rolling in.",
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
                <p className="text-sm font-semibold text-white">Progress</p>
                <div className="mt-4">
                  <ThresholdProgress
                    current={funding.current}
                    label="Pledges to unlock"
                    target={funding.target}
                  />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Watching" value={String(funding.watchers)} />
                  <MetricCard label="Pledged" value={String(funding.pledges)} />
                  <MetricCard label="Status" value={funding.statusLine} />
                </div>
              </section>

              <section className="surface-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Post an update</p>
                    <p className="mt-1 text-sm text-app-muted">Give people a reason to keep sharing.</p>
                  </div>
                  <Link
                    className="text-sm font-semibold text-app-muted transition hover:text-white"
                    href={`/campaigns/${launch.id}`}
                  >
                    Open public page
                  </Link>
                </div>
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
                    placeholder="What changed, what is new, or why this launch is getting closer..."
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
                    <button
                      className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                      onClick={() => {
                        if (typeof navigator !== "undefined") {
                          navigator.clipboard?.writeText(`${window.location.origin}/campaigns/${launch.id}`);
                        }
                      }}
                      type="button"
                    >
                      Copy link
                    </button>
                  </div>
                </div>
              </section>

              <section className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Date preference</p>
                <div className="mt-4 space-y-3">
                  {launch.dateOptions.map((option) => (
                    <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={option.id}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-white">{option.label}</p>
                        <p className="text-sm text-app-muted">{option.votes} picks</p>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-app-purple to-[#5d7dff]"
                          style={{ width: `${Math.min(100, (option.votes / Math.max(funding.current, 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Updates</p>
                <div className="mt-4 space-y-3">
                  {launch.updates.slice(0, 5).map((update) => (
                    <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={update.id}>
                      <p className="font-semibold text-white">{update.title}</p>
                      <p className="mt-2 text-sm leading-6 text-app-muted">{update.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          {tab === "venue" ? (
            <section className="space-y-4">
              <div className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Venue pairing</p>
                <p className="mt-3 text-sm leading-6 text-app-muted">
                  {funding.current >= funding.target
                    ? "This launch cleared threshold. Pick the room that best fits the first run."
                    : "Venue suggestions unlock once the soft launch clears threshold."}
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
                    {launch.selectedVenueId === venue.id ? (
                      <StatusChip status={launch.eventId ? "confirmed" : "paired"} />
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <TagChip label={venue.vibe} subdued />
                    <TagChip label={launch.fandomTags[0] ?? launch.format} subdued />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-app-muted">{venue.note}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={funding.current < funding.target}
                      onClick={() => acceptVenuePairing(launch.id, venue.id)}
                      type="button"
                    >
                      {launch.selectedVenueId === venue.id || launch.eventId ? "Selected" : "Accept pairing"}
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
              {launch.teamRoleNames.map((roleName) => {
                const matchedRole = openRoles.find((role) => role.roleName.toLowerCase() === roleName.toLowerCase());
                const shortlist = buildShortlist(
                  shortlistSource,
                  matchedRole ?? {
                    id: `${launch.id}-${roleName}`,
                    eventId: launch.id,
                    roleName,
                    status: "open",
                    payoutRange: [180, 340],
                    requiredSkills: roleSkillMap[roleName.toLowerCase()] ?? ["community", "ops"],
                    applicants: []
                  },
                  users,
                  roles
                );

                return (
                  <section className="surface-card p-5 sm:p-6" key={roleName}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{roleName}</p>
                        <p className="mt-1 text-sm text-app-muted">
                          {matchedRole ? "Open on the confirmed event page." : "Shortlist before the room locks."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      {shortlist.slice(0, 3).map((match) => (
                        <TeamMatchCard
                          key={`${roleName}-${match.user.id}`}
                          match={match}
                          onPrimary={() => {
                            if (matchedRole && launch.eventId) {
                              inviteCandidate({
                                eventId: launch.eventId,
                                roleId: matchedRole.id,
                                candidateUserId: match.user.id
                              });
                              return;
                            }
                            acceptLaunchMatch(launch.id, roleName, match.user.id);
                          }}
                          onSecondary={() => router.push(`/creators/${match.user.id}`)}
                          primaryLabel={matchedRole ? "Shortlist" : "Add to team"}
                          roleName={roleName}
                          secondaryLabel="View profile"
                        />
                      ))}
                    </div>

                    {matchedRole?.applicants.length ? (
                      <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
                        <p className="text-sm font-semibold text-white">Applicants</p>
                        {matchedRole.applicants.map((applicant) => {
                          const applicantUser = resolveUser(applicant.applicantUserId);
                          return (
                            <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={`${roleName}-${applicant.applicantUserId}`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    name={applicantUser?.name ?? "Applicant"}
                                    size="sm"
                                    src={applicantUser?.avatarUrl}
                                  />
                                  <div>
                                    <p className="font-semibold text-white">{applicantUser?.name ?? "Applicant"}</p>
                                    <p className="text-sm text-app-muted">
                                      {applicantUser?.city ?? "Local"} · {formatCurrency(applicant.quote)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  className="text-sm font-semibold text-app-muted transition hover:text-white"
                                  onClick={() => applicantUser && router.push(`/creators/${applicantUser.id}`)}
                                  type="button"
                                >
                                  View profile
                                </button>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-app-muted">{applicant.note}</p>
                              <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                  className="rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                                  onClick={() => {
                                    if (launch.eventId) {
                                      confirmRole({
                                        eventId: launch.eventId,
                                        roleId: matchedRole.id,
                                        candidateUserId: applicant.applicantUserId
                                      });
                                    }
                                  }}
                                  type="button"
                                >
                                  Accept
                                </button>
                                <button
                                  className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20"
                                  onClick={() => {
                                    if (launch.eventId) {
                                      passApplicant({
                                        eventId: launch.eventId,
                                        roleId: matchedRole.id,
                                        applicantUserId: applicant.applicantUserId
                                      });
                                    }
                                  }}
                                  type="button"
                                >
                                  Pass
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                );
              })}

              <section className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Accepted team</p>
                {launch.acceptedTeam.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {launch.acceptedTeam.map((entry) => {
                      const teammate = resolveUser(entry.userId);
                      return (
                        <div className="flex items-center justify-between gap-4 rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={`${entry.roleName}-${entry.userId}`}>
                          <div className="flex items-center gap-3">
                            <Avatar name={teammate?.name ?? "Teammate"} size="sm" src={teammate?.avatarUrl} />
                            <div>
                              <p className="font-semibold text-white">{teammate?.name ?? "Teammate"}</p>
                              <p className="text-sm text-app-muted">{entry.roleName}</p>
                            </div>
                          </div>
                          <button
                            className="text-sm font-semibold text-app-muted transition hover:text-white"
                            onClick={() => removeLaunchMatch(launch.id, entry.roleName, entry.userId)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-app-muted">No accepted collaborators yet.</p>
                )}
              </section>
            </section>
          ) : null}

          {tab === "run-of-show" ? (
            <section className="surface-card p-5 sm:p-6">
              <p className="text-sm font-semibold text-white">Run of show</p>
              {launch.eventId ? (
                <div className="mt-4 space-y-3">
                  {launch.runOfShow.map((step) => (
                    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={`${step.time}-${step.label}`}>
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
