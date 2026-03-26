"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    setSelectedDateOptionId(launch.dateOptions[0]?.id ?? "");
  }, [launch.id, launch.dateOptions]);

  return (
    <Modal
      description="Nothing charges now. Choose the date that works best, then submit your reserve."
      onClose={onClose}
      open={open}
      title="Reserve your spot"
    >
      <div className="space-y-5">
        <div className="rounded-[24px] bg-white/[0.04] p-4">
          <p className="text-sm text-app-muted">Pending ticket</p>
          <p className="mt-2 text-3xl font-semibold text-white">${launch.ticketPrice}</p>
          <p className="mt-2 text-sm leading-6 text-app-muted">{launch.softLaunchSummary}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Pick your best date</p>
          {launch.dateOptions.map((option) => (
            <button
              className={`flex w-full items-center justify-between rounded-[22px] px-4 py-3 text-left transition ${
                selectedDateOptionId === option.id
                  ? "bg-app-purple/12 text-white shadow-[0_14px_30px_rgba(31,28,184,0.16)]"
                  : "bg-white/[0.04] text-white hover:bg-white/[0.07]"
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
            className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
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
            Submit
          </button>
        </div>
      </div>
    </Modal>
  );
}
