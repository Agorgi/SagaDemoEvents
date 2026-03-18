"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/src/components/Modal";
import { type DemoRole } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";

export function RoleApplicationPanel({
  eventId,
  open,
  onClose,
  roles
}: {
  eventId: string;
  open: boolean;
  onClose: () => void;
  roles: DemoRole[];
}) {
  const { currentUserId } = useAppState();
  const { applyToRole } = useDemoState();
  const [submittedRoleId, setSubmittedRoleId] = useState<string | null>(null);

  const openRoles = useMemo(
    () => roles.filter((role) => role.status !== "filled"),
    [roles]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join team"
      description="Choose the role that fits best and apply in one step."
    >
      <div className="space-y-4">
        {openRoles.map((role) => {
          const applied = role.applicants.some(
            (entry) => entry.applicantUserId === currentUserId
          );

          return (
            <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4" key={role.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{role.roleName}</h3>
                  <p className="mt-2 text-sm text-app-muted">
                    ${role.payoutRange[0]} - ${role.payoutRange[1]}
                  </p>
                </div>
                <button
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${applied ? "border border-app-success/20 bg-app-success/10 text-app-success" : "bg-app-purple text-white hover:bg-app-purple-hover"}`}
                  disabled={applied}
                  onClick={() => {
                    applyToRole({
                      eventId,
                      roleId: role.id,
                      applicantUserId: currentUserId,
                      availability: "Weeknights + weekends",
                      quote: role.payoutRange[0],
                      note: "Strong fit for this crowd and ready for a quick turnaround."
                    });
                    setSubmittedRoleId(role.id);
                  }}
                  type="button"
                >
                  {applied ? "Applied" : "Apply"}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {role.requiredSkills.slice(0, 3).map((skill) => (
                  <span
                    className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-app-muted">
                {role.roleName} helps this launch feel polished without adding extra overhead for the host.
              </p>
              {submittedRoleId === role.id ? (
                <p className="mt-3 text-sm font-medium text-app-success">
                  Application submitted.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

