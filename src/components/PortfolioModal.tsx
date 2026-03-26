"use client";

import { Avatar } from "@/src/components/Avatar";
import { Modal } from "@/src/components/Modal";
import { type DemoEvent, getUserById } from "@/src/data/demo";

export function PortfolioModal({
  event,
  open,
  onClose
}: {
  event: DemoEvent | null;
  open: boolean;
  onClose: () => void;
}) {
  const host = getUserById(event?.hostId);

  if (!event) {
    return null;
  }

  return (
    <Modal
      description="Saga sent your portfolio and availability directly into the creator's staffing thread."
      onClose={onClose}
      open={open}
      title="Portfolio submitted"
    >
      <div className="space-y-5">
        <div className="rounded-[24px] bg-white/[0.04] p-6 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Avatar
              className="h-24 w-24 text-2xl"
              name={host?.name ?? "Creator"}
              src={host?.avatarUrl}
            />
          </div>
          <p className="text-sm text-app-muted">Creator profile</p>
          <p className="mt-2 text-2xl font-semibold text-white">{host?.handle ?? "@creator"}</p>
          <p className="mt-2 text-sm text-app-muted">
            Your portfolio was shared into the staffing thread for {event.title}.
          </p>
        </div>
        <div className="rounded-[22px] border border-app-success/30 bg-app-success/10 p-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-app-success text-2xl text-[#07110d]">
            ✓
          </div>
          <p className="text-2xl font-semibold text-white">Portfolio submitted</p>
          <p className="mt-2 text-sm text-app-muted">
            Sent to {host?.handle ?? "the creator"} for {event.title}.
          </p>
        </div>
        <button
          className="w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onClose}
          type="button"
        >
          Back to feed
        </button>
      </div>
    </Modal>
  );
}
