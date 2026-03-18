"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { Nav } from "@/src/components/Nav";
import { getUserById } from "@/src/data/demo";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";
import { useDemoState } from "@/src/lib/demo-state";
import { formatCompactNumber, formatDateRange } from "@/src/lib/utils";

export default function HostHomePage() {
  const { events, roles } = useDemoState();
  const host = getUserById(HOST_DEMO_USER_ID);
  const hostedEvents = events.filter((event) => event.hostId === HOST_DEMO_USER_ID);

  const applicantQueue = hostedEvents.flatMap((event) =>
    roles
      .filter(
        (role) =>
          role.eventId === event.id &&
          role.status !== "filled" &&
          role.applicants.length > 0
      )
      .map((role) => ({
        event,
        roleName: role.roleName,
        count: role.applicants.length
      }))
  );

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[980px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <div className="flex items-start gap-4">
            {host ? <Avatar name={host.name} size="lg" src={host.avatarUrl} /> : null}
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Host view</p>
              <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
                Your events
              </h1>
              <p className="mt-2 text-sm text-app-muted">
                Create events, review applicants, and manage the live build.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Applicants</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Needs review</h2>
            </div>
            <Link
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              href="/host/applicants"
            >
              Review applicants
            </Link>
          </div>

          <div className="grid gap-3">
            {applicantQueue.length > 0 ? (
              applicantQueue.slice(0, 4).map((item) => (
                <Link
                  className="surface-card flex items-center justify-between gap-4 p-4 transition hover:border-white/12"
                  href={`/host/events/${item.event.id}`}
                  key={`${item.event.id}-${item.roleName}`}
                >
                  <div>
                    <p className="font-semibold text-white">{item.event.title}</p>
                    <p className="mt-1 text-sm text-app-muted">
                      {item.roleName} · {item.count} applicant{item.count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-sm text-app-muted">Review</span>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5">
                <p className="text-sm text-app-muted">No applicants waiting right now.</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Events</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Manage your lineup</h2>
          </div>

          <div className="grid gap-4">
            {hostedEvents.map((event) => {
              const eventRoles = roles.filter((role) => role.eventId === event.id);
              const applicantCount = eventRoles.reduce(
                (total, role) => total + role.applicants.length,
                0
              );
              const openRoles = eventRoles.filter((role) => role.status !== "filled").length;

              return (
                <div className="surface-card p-4 sm:p-5" key={event.id}>
                  <div className="grid gap-4 sm:grid-cols-[132px_minmax(0,1fr)]">
                    <img
                      alt={event.title}
                      className="h-[160px] w-full rounded-[24px] object-cover"
                      src={event.posterUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-app-muted">
                        {formatDateRange(event.startsAt, event.endsAt)}
                      </p>
                      <h3 className="mt-2 text-3xl font-semibold text-white">{event.title}</h3>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <HostStat label="RSVPs" value={formatCompactNumber(event.attendeesCount)} />
                        <HostStat label="Applicants" value={formatCompactNumber(applicantCount)} />
                        <HostStat label="Roles open" value={formatCompactNumber(openRoles)} />
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <Link
                          className="rounded-2xl bg-app-purple px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                          href={`/host/events/${event.id}`}
                        >
                          Manage event
                        </Link>
                        <Link
                          className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-white/20"
                          href={`/host/events/${event.id}#applicants`}
                        >
                          Review applicants
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function HostStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-[#0d1119] p-3">
      <p className="text-xs text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
