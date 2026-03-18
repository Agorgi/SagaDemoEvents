"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { getEventById, getUserById } from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";
import { formatCompactNumber, formatDateRange } from "@/src/lib/utils";

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const { activeUserId, events, roles } = useDemoState();
  const user = getUserById(params.userId);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Profile not found.
        </main>
      </div>
    );
  }

  const hostedEvents = events.filter((event) => event.hostId === user.id);
  const roleEvents = roles
    .filter((role) => role.filledByUserId === user.id)
    .map((role) => {
      const event = getEventById(role.eventId, events);
      return event ? { role, event } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const upcomingEvents = [...hostedEvents, ...roleEvents.map((entry) => entry.event)]
    .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))
    .filter((event, index, list) => list.findIndex((entry) => entry.id === event.id) === index)
    .slice(0, 3);

  const collaborators = Array.from(
    new Set(
      [
        ...hostedEvents.flatMap((event) =>
          roles
            .filter((role) => role.eventId === event.id)
            .map((role) => role.filledByUserId)
            .filter(Boolean)
        ),
        ...roleEvents.map(({ event }) => event.hostId)
      ].filter((userId) => userId && userId !== user.id)
    )
  )
    .map((userId) => getUserById(userId))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 4);

  const portfolio = [
    ...hostedEvents.map((event) => ({
      id: `host-${event.id}`,
      title: event.title,
      imageUrl: event.posterUrl,
      meta: "Hosted",
      href: `/events/${event.id}`
    })),
    ...roleEvents.map(({ role, event }) => ({
      id: `role-${role.id}`,
      title: event.title,
      imageUrl: event.posterUrl,
      meta: role.roleName,
      href: `/events/${event.id}`
    }))
  ].slice(0, 6);

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-[960px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar
              className="h-24 w-24 text-2xl sm:h-28 sm:w-28"
              name={user.name}
              src={user.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                    {user.name}
                  </h1>
                  <p className="mt-1 text-sm text-app-muted">
                    {user.handle} · {user.city}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                    type="button"
                  >
                    {user.id === activeUserId ? "Edit profile" : "Message"}
                  </button>
                  {user.id !== activeUserId ? (
                    <button
                      className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                      type="button"
                    >
                      Invite
                    </button>
                  ) : null}
                </div>
              </div>

              <ExpandableText className="mt-4" collapsedLines={2} text={user.bio} />

              <div className="mt-4 flex flex-wrap gap-2">
                {user.fandomTags.slice(0, 4).map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="City" value={user.city.split(",")[0]} />
                <Stat label="Past events" value={formatCompactNumber(user.pastEventsWorked)} />
                <Stat label="Hosted" value={formatCompactNumber(hostedEvents.length)} />
                <Stat label="Repeat collabs" value={formatCompactNumber(collaborators.length)} />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <section className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Skills</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.skills.slice(0, 6).map((skill) => (
                  <TagChip key={skill} label={skill} subdued />
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Upcoming events</p>
              <div className="mt-4 space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <Link
                      className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                      href={`/events/${event.id}`}
                      key={event.id}
                    >
                      <img alt={event.title} className="h-20 w-20 rounded-[20px] object-cover" src={event.posterUrl} />
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{event.title}</p>
                        <p className="mt-1 text-sm text-app-muted">
                          {formatDateRange(event.startsAt, event.endsAt)} · {event.city}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState text="No upcoming events linked yet." />
                )}
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Past work</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {portfolio.length > 0 ? (
                  portfolio.map((item) => (
                    <Link
                      className="overflow-hidden rounded-[24px] border border-white/8 bg-[#0d1119] transition hover:-translate-y-1 hover:border-white/15"
                      href={item.href}
                      key={item.id}
                    >
                      <img
                        alt={item.title}
                        className="h-40 w-full object-cover"
                        src={item.imageUrl}
                      />
                      <div className="p-4">
                        <p className="text-sm text-app-muted">{item.meta}</p>
                        <p className="mt-1 font-semibold text-white">{item.title}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <EmptyState text="Portfolio items will appear here after hosted or contributed events." />
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Trusted with</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.fandomTags.slice(0, 4).map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Collaborators</p>
              <div className="mt-4 space-y-3">
                {collaborators.length > 0 ? (
                  collaborators.map((collaborator) => (
                    <Link
                      className="flex items-center justify-between rounded-[22px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/15"
                      href={`/profiles/${collaborator.id}`}
                      key={collaborator.id}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={collaborator.name} size="md" src={collaborator.avatarUrl} />
                        <div>
                          <p className="font-semibold text-white">{collaborator.name}</p>
                          <p className="text-sm text-app-muted">{collaborator.city}</p>
                        </div>
                      </div>
                      <span className="text-sm text-app-muted">Profile</span>
                    </Link>
                  ))
                ) : (
                  <EmptyState text="Collaborator history will appear here after more events." />
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
      <p className="text-xs text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] p-5">
      <p className="text-sm text-app-muted">{text}</p>
    </div>
  );
}
