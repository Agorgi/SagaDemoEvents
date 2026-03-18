"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange } from "@/src/lib/utils";

export default function ProfilePage() {
  const { currentUser, mode, onboarding } = useAppState();
  const { events, joinedEventIds, roles, savedEventIds } = useDemoState();
  const upcomingEvents = events.filter((event) => joinedEventIds.includes(event.id)).slice(0, 3);
  const workingRoles = roles.filter((role) =>
    role.applicants.some((entry) => entry.applicantUserId === currentUser.id) ||
    role.filledByUserId === currentUser.id
  );
  const savedItems = events.filter((event) => savedEventIds.includes(event.id)).slice(0, 3);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[980px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 text-xl" name={currentUser.name} size="lg" src={currentUser.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold text-white">{currentUser.name}</h1>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
                  {mode}
                </span>
              </div>
              <p className="mt-2 text-sm text-app-muted">{currentUser.city}</p>
              <p className="mt-4 max-w-[56ch] text-sm leading-6 text-app-muted">{currentUser.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentUser.fandomTags.slice(0, 4).map((tag) => (
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  href={mode === "creator" ? "/profile/setup" : `/profiles/${currentUser.id}`}
                >
                  {mode === "creator" ? "Edit profile" : "Open full profile"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <div className="space-y-6">
            <Panel title="Upcoming events">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <Link className="block rounded-[22px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12" href={`/events/${event.id}`} key={event.id}>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="mt-2 text-sm text-app-muted">{formatDateRange(event.startsAt, event.endsAt)}</p>
                  </Link>
                ))
              ) : (
                <Empty text="Tickets and RSVPs will show up here." />
              )}
            </Panel>

            <Panel title="Working roles">
              {workingRoles.length > 0 ? (
                workingRoles.map((role) => (
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={role.id}>
                    <p className="font-semibold text-white">{role.roleName}</p>
                    <p className="mt-2 text-sm text-app-muted">
                      {role.filledByUserId === currentUser.id ? "Confirmed" : "Application in review"}
                    </p>
                  </div>
                ))
              ) : (
                <Empty text="Team applications and accepted roles will show up here." />
              )}
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Saved">
              {savedItems.length > 0 ? (
                savedItems.map((event) => (
                  <Link className="block rounded-[22px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12" href={`/events/${event.id}`} key={event.id}>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="mt-2 text-sm text-app-muted">{event.city}</p>
                  </Link>
                ))
              ) : (
                <Empty text="Saved launches will show up here." />
              )}
            </Panel>

            <Panel title="Preferences">
              <div className="space-y-3 text-sm text-app-muted">
                <p>City: {onboarding.city || currentUser.city}</p>
                <p>Fandoms: {(onboarding.fandoms.length > 0 ? onboarding.fandoms : currentUser.fandomTags).join(", ")}</p>
                <p>Payment placeholder: ready when the launch is done.</p>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}

function Panel({
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

function Empty({ text }: { text: string }) {
  return <p className="text-sm leading-6 text-app-muted">{text}</p>;
}

