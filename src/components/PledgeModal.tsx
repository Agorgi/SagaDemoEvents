"use client";

import { useState } from "react";

import { Modal } from "@/src/components/Modal";
import { type DemoLaunch } from "@/src/data/launches";

export function PledgeModal({
  launch,
  open,
  onClose,
  onWatch,
  onPledge
}: {
  launch: DemoLaunch;
  open: boolean;
  onClose: () => void;
  onWatch: (dateOptionId?: string) => void;
  onPledge: (dateOptionId: string) => void;
}) {
  const [selectedDateOptionId, setSelectedDateOptionId] = useState<string>(
    launch.dateOptions[0]?.id ?? ""
  );

  return (
    <Modal
      description="Nothing charges now. You lock your price, pick the date that works best, and we confirm once the launch clears its threshold."
      onClose={onClose}
      open={open}
      title="Back this launch"
    >
      <div className="space-y-5">
        <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
          <p className="text-sm text-app-muted">Locked ticket</p>
          <p className="mt-2 text-3xl font-semibold text-white">${launch.ticketPrice}</p>
          <p className="mt-2 text-sm leading-6 text-app-muted">{launch.softLaunchSummary}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Pick your best date</p>
          {launch.dateOptions.map((option) => (
            <button
              className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-left transition ${
                selectedDateOptionId === option.id
                  ? "border-app-purple/30 bg-app-purple/12 text-white"
                  : "border-white/10 bg-white/[0.02] text-white hover:border-white/20"
              }`}
              key={option.id}
              onClick={() => setSelectedDateOptionId(option.id)}
              type="button"
            >
              <span className="font-semibold">{option.label}</span>
              <span className="text-sm text-app-muted">{option.votes} picks</span>
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
            onClick={() => {
              onWatch(selectedDateOptionId || undefined);
              onClose();
            }}
            type="button"
          >
            Just watch
          </button>
          <button
            className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={() => {
              if (!selectedDateOptionId) {
                return;
              }
              onPledge(selectedDateOptionId);
              onClose();
            }}
            type="button"
          >
            Pledge spot
          </button>
        </div>
      </div>
    </Modal>
  );
}
