"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

export default function CreatorProfilePage() {
  const params = useParams<{ slug: string }>();
  const { resolveUser } = useAppState();
  const { events, roles } = useDemoState();
  const user = resolveUser(params.slug);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Creator not found.
        </main>
      </div>
    );
  }

  const pastWork = roles
    .filter((role) => role.filledByUserId === user.id)
    .map((role) => ({
      role,
      event: events.find((event) => event.id === role.eventId)
    }))
    .filter((entry) => entry.event);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[920px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 text-xl" name={user.name} size="lg" src={user.avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold text-white">{user.name}</h1>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
                  creator
                </span>
              </div>
              <p className="mt-2 text-sm text-app-muted">{user.city}</p>
              <p className="mt-4 max-w-[56ch] text-sm leading-6 text-app-muted">{user.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.fandomTags.map((tag) => (
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <section className="surface-card p-5">
            <p className="text-sm font-semibold text-white">Best fit</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted" key={skill}>
                  {skill}
                </span>
              ))}
            </div>

            <p className="mt-6 text-sm font-semibold text-white">Past events</p>
            <div className="mt-4 space-y-3">
              {pastWork.slice(0, 4).map(({ role, event }) => (
                <Link className="block rounded-[22px] border border-white/8 bg-[#0d1119] p-4 transition hover:border-white/12" href={`/events/${event!.id}`} key={role.id}>
                  <p className="font-semibold text-white">{event!.title}</p>
                  <p className="mt-2 text-sm text-app-muted">{role.roleName}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <p className="text-sm font-semibold text-white">Trust signals</p>
            <div className="mt-4 space-y-3 text-sm text-app-muted">
              <p>{user.pastEventsWorked} past events</p>
              <p>{user.mutuals} repeat collaborators nearby</p>
              <p>Rates: ${user.pricing[0]} - ${user.pricing[1]}</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

