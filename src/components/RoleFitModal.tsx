"use client";

import { Modal } from "@/src/components/Modal";
import { type DemoEvent, type DemoRole } from "@/src/data/demo";
import { formatCurrencyRange } from "@/src/lib/utils";

export function RoleFitModal({
  event,
  role,
  open,
  onClose,
  onApply
}: {
  event: DemoEvent | null;
  role: DemoRole | null;
  open: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  if (!event || !role) {
    return null;
  }

  return (
    <Modal
      description="Saga found the strongest role match for you based on skills, fandom overlap, and city."
      onClose={onClose}
      open={open}
      title="Looks like a good fit"
    >
      <div className="space-y-5">
        <div className="rounded-[24px] border border-app-purple/30 bg-app-purple/10 p-5">
          <p className="text-sm text-app-muted">Recommended role</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">{role.roleName}</h3>
          <p className="mt-2 text-sm text-app-muted">
            {event.title} · {formatCurrencyRange(role.payoutRange)}
          </p>
        </div>
        <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
          <p className="text-sm text-app-muted">
            This role is the cleanest fit for what you already do inside the fandom network.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {role.requiredSkills.map((skill) => (
              <span
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <button
          className="w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onApply}
          type="button"
        >
          Apply
        </button>
      </div>
    </Modal>
  );
}
