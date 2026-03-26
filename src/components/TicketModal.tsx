"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AvatarStack } from "@/src/components/Avatar";
import { Modal } from "@/src/components/Modal";
import { type DemoEvent, users } from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";
import { formatDateRange } from "@/src/lib/utils";

export function TicketModal({
  event,
  open,
  onClose
}: {
  event: DemoEvent | null;
  open: boolean;
  onClose: () => void;
}) {
  const { joinEvent, joinedEventIds } = useDemoState();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setSuccess(false);
    }
  }, [open]);

  if (!event) {
    return null;
  }

  const isJoined = joinedEventIds.includes(event.id);

  const handleConfirm = () => {
    joinEvent(event.id);
    setSuccess(true);
  };

  return (
    <Modal
      description="Simple checkout, Partiful style. One ticket, one clear CTA."
      onClose={onClose}
      open={open}
      title={isJoined || success ? "You're going" : "Get ticket"}
    >
      {success || isJoined ? (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[24px]">
            <img
              alt={event.title}
              className="h-48 w-full object-cover"
              src={event.posterUrl}
            />
          </div>
          <div className="rounded-[22px] bg-white/[0.04] p-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-app-success/10 text-2xl text-app-success">
              ✓
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-white">
              You&apos;re in for {event.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-app-muted">
              Your spot is saved. Next step: enter the room for updates, timing changes, and day-of coordination.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              className="rounded-2xl bg-app-purple px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              href={`/communities/${event.id}`}
              onClick={onClose}
            >
              Join event room
            </Link>
            <button
              className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[24px]">
            <img
              alt={event.title}
              className="h-48 w-full object-cover"
              src={event.posterUrl}
            />
          </div>
          <div className="rounded-[22px] bg-white/[0.04] p-4">
            <p className="text-sm text-app-muted">{formatDateRange(event.startsAt, event.endsAt)}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{event.title}</h3>
            <p className="mt-2 text-sm text-app-muted">{event.city}</p>
            <div className="mt-4 flex items-center gap-3">
              <AvatarStack people={users.slice(0, 4)} />
              <p className="text-sm text-app-muted">Friends already going</p>
            </div>
          </div>
          <div className="rounded-[22px] bg-white/[0.04] p-4">
            <div className="flex items-center justify-between text-sm text-app-muted">
              <span>{event.isFree ? "RSVP" : "Event ticket"}</span>
              <span>{event.isFree ? "Free" : "$10"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-base font-semibold text-white">
              <span>Total</span>
              <span>{event.isFree ? "Free" : "$10"}</span>
            </div>
          </div>
          <button
            className="w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={handleConfirm}
            type="button"
          >
            {event.isFree ? "Confirm RSVP" : "Pay $10"}
          </button>
        </div>
      )}
    </Modal>
  );
}
