"use client";

import { Avatar } from "@/src/components/Avatar";
import { type CommissionActivity } from "@/src/data/commissions";
import { getUserById } from "@/src/data/demo";
import { formatCurrency, formatDateLabel } from "@/src/lib/utils";

function getActivityLabel(activity: CommissionActivity) {
  if (activity.type === "commitment") {
    return activity.amount ? `Committed ${formatCurrency(activity.amount)}` : "Committed funds";
  }

  if (activity.type === "role") {
    return "Crew activity";
  }

  if (activity.type === "comment") {
    return "Community note";
  }

  return "Update";
}

export function CommissionActivityFeed({
  activity
}: {
  activity: CommissionActivity[];
}) {
  return (
    <div className="space-y-3">
      {activity.map((item) => {
        const user = getUserById(item.authorId);
        return (
          <div className="rounded-[24px] bg-white/[0.04] p-4" key={item.id}>
            <div className="flex items-start gap-3">
              <Avatar
                name={user?.name ?? "Saga user"}
                size="md"
                src={user?.avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">
                    {user?.handle ?? "@saga"}
                  </p>
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-app-muted">
                    {getActivityLabel(item)}
                  </span>
                  <span className="text-xs text-app-muted">
                    {formatDateLabel(item.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-app-muted">{item.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
