"use client";

import { StatusChip, TagChip } from "@/src/components/Chips";
import { type CommissionOpenRole } from "@/src/data/commissions";
import { formatCurrencyRange, cn } from "@/src/lib/utils";

export function CommissionRoleCard({
  role,
  applied = false,
  actionLabel,
  onAction
}: {
  role: CommissionOpenRole;
  applied?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const statusTone = role.status === "filled" ? "filled" : "open";

  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/8 bg-white/[0.02] p-4 transition",
        applied && "border-app-purple/40 bg-app-purple/10 shadow-[0_18px_32px_rgba(31,28,184,0.16)]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusChip
              label={role.status === "filled" ? "Filled" : "Open"}
              tone={statusTone}
            />
            <span className="text-xs text-app-muted">
              {formatCurrencyRange(role.payoutRange)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{role.roleName}</h3>
          <p className="mt-2 text-sm text-app-muted">
            {role.applicantUserIds.length > 0
              ? `${role.applicantUserIds.length} applicants in the queue`
              : "No applicants yet"}
          </p>
        </div>
        {actionLabel && onAction ? (
          <button
            className="rounded-2xl border border-app-purple/35 px-3 py-2 text-sm font-semibold text-[#DEDCFF] transition hover:bg-app-purple/10"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {role.requiredSkills.map((skill) => (
          <TagChip key={skill} label={skill} subdued />
        ))}
      </div>
    </div>
  );
}
