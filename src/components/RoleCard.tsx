"use client";

import { type DemoRole } from "@/src/data/demo";
import { StatusChip, TagChip } from "@/src/components/Chips";
import { formatCurrencyRange, cn } from "@/src/lib/utils";

export function RoleCard({
  role,
  selected = false,
  actionLabel,
  onAction,
  extra,
  className
}: {
  role: DemoRole;
  selected?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  extra?: React.ReactNode;
  className?: string;
}) {
  const tone =
    role.status === "filled" ? "filled" : role.status === "invited" ? "invited" : "open";

  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/8 bg-white/[0.02] p-4 transition",
        selected && "border-app-purple/45 bg-app-purple/10 shadow-[0_18px_34px_rgba(31,28,184,0.2)]",
        onAction && !actionLabel && "cursor-pointer hover:border-white/15",
        className
      )}
      onClick={actionLabel ? undefined : onAction}
      onKeyDown={
        onAction && !actionLabel
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onAction();
              }
            }
          : undefined
      }
      role={onAction && !actionLabel ? "button" : undefined}
      tabIndex={onAction && !actionLabel ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusChip
              label={role.status === "filled" ? "Filled" : role.status === "invited" ? "Invited" : "Open"}
              tone={tone}
            />
            <span className="text-xs text-app-muted">
              {formatCurrencyRange(role.payoutRange)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{role.roleName}</h3>
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
      {extra ? <div className="mt-4">{extra}</div> : null}
    </div>
  );
}
