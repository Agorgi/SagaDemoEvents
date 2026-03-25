"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { type DemoEvent, getUserById } from "@/src/data/demo";
import { formatDateRange, formatTimeLabel } from "@/src/lib/utils";

export function QuickInterestDeck({
  events,
  interestedEventIds,
  savedEventIds,
  goingEventIds,
  onInterested,
  onSaved,
  onGoing
}: {
  events: DemoEvent[];
  interestedEventIds: string[];
  savedEventIds: string[];
  goingEventIds: string[];
  onInterested: (eventId: string) => void;
  onSaved: (eventId: string) => void;
  onGoing: (eventId: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const visibleEvents = useMemo(
    () => events.filter((event) => !goingEventIds.includes(event.id)).slice(0, 6),
    [events, goingEventIds]
  );
  const current = visibleEvents[index] ?? visibleEvents[0];

  if (!current) {
    return (
      <div className="surface-card p-5">
        <p className="text-sm font-semibold text-white">You’re caught up.</p>
        <p className="mt-2 text-sm text-app-muted">Everything in this set is already on your radar.</p>
      </div>
    );
  }

  const host = getUserById(current.hostId);

  function advance() {
    setIndex((value) => (value + 1) % visibleEvents.length);
  }

  return (
    <div className="surface-card overflow-hidden p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-muted">Quick interest</p>
          <p className="mt-1 text-sm text-white/68">Fast yes, save for later, or keep going.</p>
        </div>
        <div className="flex gap-1.5">
          {visibleEvents.slice(0, 5).map((event, eventIndex) => (
            <span
              className={`h-1.5 rounded-full transition ${
                eventIndex === index ? "w-6 bg-white" : "w-2 bg-white/25"
              }`}
              key={event.id}
            />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[30px]">
        <img alt={current.title} className="h-[420px] w-full object-cover" src={current.posterUrl} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090f] via-[#06090f]/18 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex flex-wrap gap-2">
            {current.fandomTags.slice(0, 2).map((tag) => (
              <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs font-semibold text-white" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">{current.title}</p>
          <p className="mt-2 max-w-[28ch] line-clamp-2 text-sm text-white/80">{current.subtitle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Avatar name={host?.name ?? "Host"} size="sm" src={host?.avatarUrl} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{host?.name ?? "Host"}</p>
          <p className="truncate text-xs text-app-muted">
            {formatDateRange(current.startsAt, current.endsAt)} · {formatTimeLabel(current.startsAt)} · {current.city}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <TagChip label={`${current.attendeesCount.toLocaleString()} in scene`} subdued />
        <TagChip label={`${current.mutualsCount} mutuals`} subdued />
        <TagChip label={current.venue} subdued />
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr_1fr] gap-2">
        <button
          className="rounded-2xl border border-white/10 px-3 py-3 text-sm font-semibold text-white transition hover:border-white/20"
          onClick={() => {
            onSaved(current.id);
            advance();
          }}
          type="button"
        >
          {savedEventIds.includes(current.id) ? "Saved" : "Save"}
        </button>
        <button
          className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 text-sm font-semibold text-white transition hover:border-white/20"
          onClick={() => {
            onInterested(current.id);
            advance();
          }}
          type="button"
        >
          {interestedEventIds.includes(current.id) ? "Interested" : "Interested"}
        </button>
        <button
          className="rounded-2xl bg-app-purple px-3 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={() => {
            onGoing(current.id);
            advance();
          }}
          type="button"
        >
          Going
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.16em] text-app-muted">Quick picks</span>
        <Link className="text-sm font-semibold text-app-muted transition hover:text-white" href={`/events/${current.id}`}>
          Open event
        </Link>
      </div>
    </div>
  );
}
