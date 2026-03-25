"use client";

import { ActivityItem } from "@/src/components/ActivityItem";
import { Avatar } from "@/src/components/Avatar";
import { Nav } from "@/src/components/Nav";
import { getUserById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";

export default function InboxPage() {
  const { inbox, markInboxRead, socialActivity } = useAppState();
  const combined = [...inbox, ...socialActivity]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 16);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Updates</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Updates</h1>
          <p className="text-sm text-app-muted">What changed.</p>
        </section>

        <section className="mt-6 space-y-3">
          {combined.length > 0 ? (
            combined.map((item) =>
              "kind" in item && "unread" in item ? (
                <ActivityItem item={item} key={item.id} onRead={() => markInboxRead(item.id)} />
              ) : (
                <a
                  className="surface-card block p-4 transition hover:border-white/12"
                  href={item.href}
                  key={item.id}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={getUserById(item.actorIds[0])?.name ?? "Saga"}
                      size="sm"
                      src={getUserById(item.actorIds[0])?.avatarUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-app-muted">{item.body}</p>
                    </div>
                  </div>
                </a>
              )
            )
          ) : (
            <div className="surface-card p-5">
              <p className="text-sm text-app-muted">Nothing new yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
