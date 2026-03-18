"use client";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { type DemoUser, type RoleApplication } from "@/src/data/demo";
import { formatCompactNumber, formatCurrencyRange } from "@/src/lib/utils";

export function ApplicantReviewCard({
  applicant,
  application,
  roleName,
  payoutRange,
  onViewProfile,
  onShortlist,
  onAccept,
  onPass,
  shortlisted = false,
  accepted = false
}: {
  applicant: DemoUser;
  application: RoleApplication;
  roleName: string;
  payoutRange: [number, number];
  onViewProfile: () => void;
  onShortlist: () => void;
  onAccept: () => void;
  onPass: () => void;
  shortlisted?: boolean;
  accepted?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
      <div className="flex items-start gap-4">
        <Avatar name={applicant.name} size="md" src={applicant.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{applicant.name}</p>
              <p className="truncate text-sm text-app-muted">
                {applicant.city} · {roleName}
              </p>
            </div>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted">
              {formatCurrencyRange(payoutRange)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {applicant.skills.slice(0, 3).map((skill) => (
              <TagChip key={skill} label={skill} subdued />
            ))}
          </div>

          <p className="mt-3 text-sm text-app-muted">
            {applicant.fandomTags.slice(0, 2).join(" · ")} · {formatCompactNumber(applicant.pastEventsWorked)} past events
          </p>
          <p className="mt-2 text-sm text-white/82">
            {application.note}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={onViewProfile}
              type="button"
            >
              View profile
            </button>
            <button
              className="rounded-2xl border border-app-purple/25 px-3 py-2 text-sm font-semibold text-[#E0DEFF] transition hover:bg-app-purple/10"
              onClick={onShortlist}
              type="button"
            >
              {shortlisted ? "Shortlisted" : "Shortlist"}
            </button>
            <button
              className="rounded-2xl bg-app-purple px-3 py-2 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              onClick={onAccept}
              type="button"
            >
              {accepted ? "Accepted" : "Accept"}
            </button>
            {!accepted ? (
              <button
                className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-app-muted transition hover:border-white/20 hover:text-white"
                onClick={onPass}
                type="button"
              >
                Pass
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
