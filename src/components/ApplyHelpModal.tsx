"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Modal } from "@/src/components/Modal";
import { TagChip } from "@/src/components/Chips";
import { type DemoEvent, type DemoRole, getUserById } from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";
import { formatCurrencyRange } from "@/src/lib/utils";

function getRoleSummary(roleName: string) {
  if (/dj|performer/i.test(roleName)) {
    return "Own the room's energy and anchor the live set.";
  }
  if (/photo/i.test(roleName)) {
    return "Capture the hero moments and deliver polished coverage.";
  }
  if (/promo|marketing|social/i.test(roleName)) {
    return "Drive awareness before doors and keep momentum moving.";
  }
  if (/moderator|check-in|door/i.test(roleName)) {
    return "Keep arrivals smooth, clear, and welcoming.";
  }
  if (/guest|cosplayer/i.test(roleName)) {
    return "Help make the event feel special on the floor and on camera.";
  }

  return "Support the event with a focused, visible contribution.";
}

export function ApplyHelpModal({
  event,
  roles,
  open,
  onClose
}: {
  event: DemoEvent;
  roles: DemoRole[];
  open: boolean;
  onClose: () => void;
}) {
  const { activeUserId, applyToRole } = useDemoState();
  const [recentRoleId, setRecentRoleId] = useState<string | null>(null);
  const activeUser = getUserById(activeUserId);

  const openRoles = useMemo(
    () => roles.filter((role) => role.status !== "filled"),
    [roles]
  );

  const handleApply = (role: DemoRole) => {
    applyToRole({
      eventId: event.id,
      roleId: role.id,
      applicantUserId: activeUserId,
      availability: "Available for prep + event day",
      quote: role.payoutRange[0],
      note: `${activeUser?.handle ?? "I"} would love to help on ${event.title}.`
    });
    setRecentRoleId(role.id);
  };

  return (
    <Modal
      description="Pick the role that best fits your skill."
      onClose={() => {
        setRecentRoleId(null);
        onClose();
      }}
      open={open}
      panelClassName="max-w-3xl"
      title="Apply to help"
    >
      <div className="space-y-4">
        {openRoles.length > 0 ? (
          openRoles.map((role) => {
            const applied = role.applicants.some(
              (entry) => entry.applicantUserId === activeUserId
            );
            const justApplied = recentRoleId === role.id;

            return (
              <div
                className="rounded-[24px] bg-white/[0.04] p-4"
                key={role.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-white">{role.roleName}</p>
                    <p className="mt-1 text-sm text-app-muted">
                      {formatCurrencyRange(role.payoutRange)}
                    </p>
                  </div>
                  <button
                    className={
                      applied
                        ? "rounded-2xl border border-app-success/30 bg-app-success/10 px-4 py-2.5 text-sm font-semibold text-app-success"
                        : "rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                    }
                    disabled={applied}
                    onClick={() => handleApply(role)}
                    type="button"
                  >
                    {applied ? "Applied" : "Apply"}
                  </button>
                </div>
                <p className="mt-3 text-sm text-white/80">
                  {getRoleSummary(role.roleName)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {role.requiredSkills.slice(0, 3).map((skill) => (
                    <TagChip key={skill} label={skill} subdued />
                  ))}
                </div>
                {justApplied ? (
                  <p className="mt-3 text-sm font-medium text-app-success">
                    Application sent. This event is now unlocked in My Events.
                  </p>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] bg-white/[0.04] p-5">
            <p className="font-semibold text-white">No open roles right now</p>
            <p className="mt-2 text-sm text-app-muted">
              This event is already staffed. You can still RSVP and follow it in the room after joining.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Link
            className="rounded-2xl bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            href="/my-events"
            onClick={onClose}
          >
            Open My Events
          </Link>
        </div>
      </div>
    </Modal>
  );
}
