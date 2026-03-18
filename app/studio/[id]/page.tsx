"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import { NextActionPanel } from "@/src/components/NextActionPanel";
import { PayoutWaterfallCard } from "@/src/components/PayoutWaterfallCard";
import { StatusChip } from "@/src/components/StatusChip";
import { TeamMatchCard } from "@/src/components/TeamMatchCard";
import { ThresholdProgress } from "@/src/components/ThresholdProgress";
import { Avatar } from "@/src/components/Avatar";
import { useAppState } from "@/src/lib/app-state";
import { buildShortlist } from "@/src/lib/matching";
import { useDemoState } from "@/src/lib/demo-state";
import { formatCurrency, formatDateRange } from "@/src/lib/utils";

const tabs = ["overview", "team", "demand", "run-of-show", "payouts"] as const;
type WorkspaceTab = (typeof tabs)[number];

const roleSkillMap: Record<string, string[]> = {
  photographer: ["photography", "editing", "portrait lighting"],
  "social promo": ["social promo", "copywriting", "creator outreach"],
  "guest experience": ["hospitality", "community moderation", "guest lists"],
  "merch table": ["merch ops", "guest lists", "check-in"],
  "check-in": ["check-in", "front of house", "guest lists"],
  "host support": ["run of show", "ops", "hospitality"],
  "creator marketing": ["social promo", "content strategy", "copywriting"],
  "event ops": ["ops", "runner", "load-in"]
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
    acceptLaunchMatch,
    removeLaunchMatch
  } = useAppState();
  const { events, roles, inviteCandidate, confirmRole, passApplicant } = useDemoState();

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
  const filledRoles = eventRoles.filter((role) => role.status === "filled");
  const thresholdCurrent = launch.reserveCount + launch.ticketCount;

  const roleBuckets =
    openRoles.length > 0
      ? openRoles.map((role) => ({
          roleName: role.roleName,
          applicants: role.applicants,
          matches: linkedEvent ? buildShortlist(linkedEvent, role, users, roles) : []
        }))
      : launch.teamRoleNames.map((roleName) => ({
          roleName,
          applicants: [],
          matches: buildShortlist(
            {
              id: launch.id,
              title: launch.title,
              subtitle: launch.description,
              description: launch.description,
              fandomTags: launch.fandomTags,
              city: launch.city,
              venue: launch.venue,
              startsAt: launch.startsAt,
              posterUrl: "/group-88462-v2.png",
              hostId: launch.hostId,
              attendeesCount: launch.ticketCount,
              mutualsCount: 0,
              communityCount: 0,
              priceLabel: "$24+"
            },
            {
              id: `${launch.id}-${roleName}`,
              eventId: launch.id,
              roleName,
              status: "open",
              payoutRange: [160, 320],
              requiredSkills: roleSkillMap[roleName.toLowerCase()] ?? ["community", "ops"],
              applicants: []
            },
            users,
            []
          )
        }));

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[1120px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <StatusChip status={launch.status} />
                <p className="text-sm text-app-muted">{formatDateRange(launch.startsAt)}</p>
              </div>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{launch.title}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              {!launch.published ? (
                <button
                  className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  onClick={() => publishLaunch(launch.id)}
                  type="button"
                >
                  Publish launch
                </button>
              ) : (
                <Link
                  className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  href={launch.eventId ? `/events/${launch.eventId}` : "#"}
                >
                  Open public page
                </Link>
              )}
              <Link
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                href={`${pathname}?tab=team`}
              >
                Recruit team
              </Link>
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
            {tabs.map((item) => (
              <button
                className={`pill ${tab === item ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
                key={item}
                onClick={() => router.replace(`${pathname}?tab=${item}`)}
                type="button"
              >
                {item === "run-of-show" ? "Run of Show" : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 space-y-6">
            {tab === "overview" ? (
              <>
                <NextActionPanel
                  actionLabel={!launch.published ? "Publish launch" : launch.plan.bestNextMove}
                  body={launch.published ? launch.plan.turnoutOutlook : "Review the plan, then publish when it feels ready."}
                  onAction={() => {
                    if (!launch.published) {
                      publishLaunch(launch.id);
                      return;
                    }
                    router.replace(`${pathname}?tab=${launch.plan.bestNextMove === "Recruit team" ? "team" : "demand"}`);
                  }}
                  title={launch.plan.bestNextMove}
                />

                <section className="surface-card p-5 sm:p-6">
                  <p className="text-sm font-semibold text-white">Plan</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Metric label="Venue recommendation" value={launch.plan.venueRecommendation} />
                    <Metric label="Turnout outlook" value={launch.plan.turnoutOutlook} />
                    <Metric label="Threshold target" value={`${launch.plan.thresholdTarget} reserve / ticket actions`} />
                    <Metric label="Team needed" value={`${launch.teamRoleNames.length} roles`} />
                  </div>
                </section>

                <section className="surface-card p-5 sm:p-6">
                  <p className="text-sm font-semibold text-white">Launch copy</p>
                  <div className="mt-4 space-y-3 rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                    <p className="text-lg font-semibold text-white">{launch.plan.launchCopy.headline}</p>
                    <p className="text-sm text-app-muted">{launch.plan.launchCopy.socialBlurb}</p>
                  </div>
                </section>
              </>
            ) : null}

            {tab === "team" ? (
              <section className="space-y-5">
                {roleBuckets.map((bucket) => (
                  <section className="surface-card p-5 sm:p-6" key={bucket.roleName}>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-semibold text-white">{bucket.roleName}</p>
                    </div>
                    <div className="mt-5 space-y-4">
                      {bucket.matches.slice(0, 3).map((match) => (
                        <TeamMatchCard
                          key={`${bucket.roleName}-${match.user.id}`}
                          match={match}
                          onPrimary={() => {
                            if (launch.eventId && openRoles.find((role) => role.roleName === bucket.roleName)) {
                              const role = openRoles.find((item) => item.roleName === bucket.roleName);
                              if (role) {
                                inviteCandidate({
                                  eventId: launch.eventId,
                                  roleId: role.id,
                                  candidateUserId: match.user.id
                                });
                              }
                              return;
                            }
                            acceptLaunchMatch(launch.id, bucket.roleName, match.user.id);
                          }}
                          onSecondary={() => router.push(`/creators/${match.user.id}`)}
                          primaryLabel={launch.eventId ? "Shortlist" : "Accept"}
                          roleName={bucket.roleName}
                          secondaryLabel="View profile"
                        />
                      ))}
                    </div>

                    {launch.eventId
                      ? bucket.applicants.length > 0
                        ? (
                            <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
                              <p className="text-sm font-semibold text-white">Applicants</p>
                              {bucket.applicants.map((applicant) => {
                                const applicantUser = resolveUser(applicant.applicantUserId);
                                const role = openRoles.find((item) => item.roleName === bucket.roleName);

                                return (
                                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={`${bucket.roleName}-${applicant.applicantUserId}`}>
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
                                            {applicantUser?.city ?? "Local"} · {applicant.quote > 0 ? `$${applicant.quote}` : "Flexible"}
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
                                          if (launch.eventId && role) {
                                            confirmRole({
                                              eventId: launch.eventId,
                                              roleId: role.id,
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
                                          if (launch.eventId && role) {
                                            passApplicant({
                                              eventId: launch.eventId,
                                              roleId: role.id,
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
                          )
                        : (
                            <div className="mt-5 border-t border-white/8 pt-5">
                              <p className="text-sm text-app-muted">No applicants yet.</p>
                            </div>
                          )
                      : null}
                  </section>
                ))}

                <section className="surface-card p-5 sm:p-6">
                  <p className="text-sm font-semibold text-white">Current team</p>
                  <div className="mt-4 grid gap-3">
                    {filledRoles.length > 0
                      ? filledRoles.map((role) => {
                          const user = resolveUser(role.filledByUserId);
                          return (
                            <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={role.id}>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <Avatar name={user?.name ?? role.roleName} size="sm" src={user?.avatarUrl} />
                                  <div>
                                    <p className="font-semibold text-white">{user?.name ?? "Confirmed"}</p>
                                    <p className="text-sm text-app-muted">{role.roleName}</p>
                                  </div>
                                </div>
                                <button
                                  className="text-sm font-semibold text-app-muted transition hover:text-white"
                                  onClick={() => user && router.push(`/creators/${user.id}`)}
                                  type="button"
                                >
                                  View profile
                                </button>
                              </div>
                            </div>
                          );
                        })
                      : launch.acceptedTeam.map((entry) => {
                          const user = resolveUser(entry.userId);
                          return (
                            <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={`${entry.roleName}-${entry.userId}`}>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <Avatar name={user?.name ?? entry.roleName} size="sm" src={user?.avatarUrl} />
                                  <div>
                                    <p className="font-semibold text-white">{user?.name ?? "Accepted"}</p>
                                    <p className="text-sm text-app-muted">{entry.roleName}</p>
                                  </div>
                                </div>
                                <button
                                  className="text-sm font-semibold text-app-muted transition hover:text-white"
                                  onClick={() => removeLaunchMatch(launch.id, entry.roleName, entry.userId)}
                                  type="button"
                                >
                                  Pass
                                </button>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </section>
              </section>
            ) : null}

            {tab === "demand" ? (
              <section className="space-y-5">
                <section className="surface-card p-5 sm:p-6">
                  <p className="text-sm font-semibold text-white">Threshold progress</p>
                  <div className="mt-4">
                    <ThresholdProgress current={thresholdCurrent} target={launch.plan.thresholdTarget} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Metric label="Reserve count" value={`${launch.reserveCount}`} />
                    <Metric label="Ticket count" value={`${launch.ticketCount}`} />
                    <Metric label="Attendance goal" value={`${launch.attendanceGoal}`} />
                  </div>
                </section>

                <section className="surface-card p-5 sm:p-6">
                  <p className="text-sm font-semibold text-white">Ticket plan</p>
                  <div className="mt-4 grid gap-3">
                    {launch.plan.ticketPlan.map((tier) => (
                      <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={tier.label}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">{tier.label}</p>
                            <p className="mt-2 text-sm text-app-muted">{tier.description}</p>
                          </div>
                          <span className="text-lg font-semibold text-white">{formatCurrency(tier.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            ) : null}

            {tab === "run-of-show" ? (
              <section className="surface-card p-5 sm:p-6">
                <p className="text-sm font-semibold text-white">Run of show</p>
                <div className="mt-4 space-y-3">
                  {launch.runOfShow.map((step) => (
                    <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={`${step.time}-${step.label}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{step.label}</p>
                          <p className="mt-2 text-sm text-app-muted">{step.owner}</p>
                        </div>
                        <span className="text-sm font-semibold text-white">{step.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover" type="button">
                    Open checklist
                  </button>
                  {launch.status !== "completed" ? (
                    <button
                      className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                      onClick={() => completeLaunch(launch.id)}
                      type="button"
                    >
                      Complete launch
                    </button>
                  ) : null}
                </div>
              </section>
            ) : null}

            {tab === "payouts" ? (
              <section className="space-y-5">
                {launch.status === "completed" ? (
                  <>
                    <PayoutWaterfallCard payouts={launch.payouts} />
                    <div className="flex flex-wrap gap-3">
                      <button className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover" type="button">
                        Review payouts
                      </button>
                      <Link
                        className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                        href={`/studio/new?copy=${launch.id}`}
                      >
                        Copy to next city
                      </Link>
                    </div>
                  </>
                ) : (
                  <section className="surface-card p-5 sm:p-6">
                    <p className="text-sm font-semibold text-white">Payouts will appear after the run closes.</p>
                    <button
                      className="mt-5 rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                      onClick={() => completeLaunch(launch.id)}
                      type="button"
                    >
                      Complete launch
                    </button>
                  </section>
                )}
              </section>
            ) : null}
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
