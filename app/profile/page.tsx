"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange } from "@/src/lib/utils";

export default function ProfilePage() {
  const { currentUser, mode } = useAppState();
  const { events, joinedEventIds, roles, savedEventIds } = useDemoState();

  const upcomingEvents = events.filter((event) => joinedEventIds.includes(event.id)).slice(0, 3);
  const workingRoles = roles.filter((role) =>
    role.applicants.some((entry) => entry.applicantUserId === currentUser.id) ||
    role.filledByUserId === currentUser.id
  );
  const savedItems = events.filter((event) => savedEventIds.includes(event.id)).slice(0, 3);

  const primaryItems =
    mode === "creator"
      ? workingRoles.slice(0, 3).map((role) => ({
          title: role.roleName,
          subtitle: role.filledByUserId === currentUser.id ? "Confirmed" : "In review",
          href: "/my-events"
        }))
      : upcomingEvents.map((event) => ({
          title: event.title,
          subtitle: formatDateRange(event.startsAt, event.endsAt),
          href: `/events/${event.id}`
        }));

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 text-xl" name={currentUser.name} size="lg" src={currentUser.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold text-white">{currentUser.name}</h1>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
                  {mode === "creator" ? "Contributor" : mode === "fan" ? "Ticket buyer" : "Host"}
                </span>
              </div>
              <p className="mt-2 text-sm text-app-muted">{currentUser.city}</p>
              <div className="mt-4 max-w-[54ch]">
                <ExpandableText collapsedLines={2} text={currentUser.bio} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentUser.fandomTags.slice(0, 4).map((tag) => (
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <Link
                  className="inline-flex rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  href={mode === "creator" ? "/profile/setup" : `/profiles/${currentUser.id}`}
                >
                  {mode === "creator" ? "Edit profile" : "Open full profile"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              {mode === "creator" ? "Working now" : "Coming up"}
            </h2>
            <Link className="text-sm font-semibold text-app-muted transition hover:text-white" href="/my-events">
              Open My Events
            </Link>
          </div>

          {primaryItems.length > 0 ? (
            <div className="grid gap-3">
              {primaryItems.map((item) => (
                <Link
                  className="surface-card block p-4 transition hover:border-white/12"
                  href={item.href}
                  key={`${item.title}-${item.subtitle}`}
                >
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-app-muted">{item.subtitle}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="surface-card p-5">
              <p className="text-sm text-app-muted">Nothing here yet.</p>
            </div>
          )}
        </section>

        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">Saved</h2>
            <Link className="text-sm font-semibold text-app-muted transition hover:text-white" href="/explore">
              Find more
            </Link>
          </div>

          {savedItems.length > 0 ? (
            <div className="grid gap-3">
              {savedItems.map((event) => (
                <Link
                  className="surface-card block p-4 transition hover:border-white/12"
                  href={`/events/${event.id}`}
                  key={event.id}
                >
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-sm text-app-muted">{event.city}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="surface-card p-5">
              <p className="text-sm text-app-muted">No saved events.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
