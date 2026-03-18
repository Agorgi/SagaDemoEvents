"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { TagChip } from "@/src/components/Chips";
import { type CandidateMatch } from "@/src/lib/matching";
import { cn, formatCurrencyRange } from "@/src/lib/utils";

export function CandidateCard({
  candidate,
  selected = false,
  invited = false,
  filled = false,
  onSelect,
  onInvite
}: {
  candidate: CandidateMatch;
  selected?: boolean;
  invited?: boolean;
  filled?: boolean;
  onSelect: () => void;
  onInvite: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/8 bg-white/[0.02] p-4 transition hover:border-white/15",
        selected && "border-app-purple/40 bg-app-purple/10 shadow-[0_20px_38px_rgba(31,28,184,0.2)]"
      )}
    >
      <div className="flex items-start gap-4">
        <Link className="shrink-0" href={`/profiles/${candidate.user.id}`}>
          <Avatar
            name={candidate.user.name}
            size="lg"
            src={candidate.user.avatarUrl}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                className="text-base font-semibold text-white transition hover:text-[#E5E3FF]"
                href={`/profiles/${candidate.user.id}`}
              >
                {candidate.user.handle}
              </Link>
              <p className="text-sm text-app-muted">{candidate.user.city}</p>
            </div>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted">
              {formatCurrencyRange(candidate.user.pricing)}
            </span>
          </div>
          <p className="mt-3 text-sm text-[#E2E0FF]">Why this match: {candidate.why}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.user.fandomTags.slice(0, 3).map((tag) => (
              <TagChip key={tag} label={tag} subdued />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-app-muted">
              {candidate.user.pastEventsWorked} events worked · {candidate.user.mutuals} mutuals
            </p>
            <div className="flex items-center gap-2">
              <Link
                className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                href={`/profiles/${candidate.user.id}`}
              >
                Profile
              </Link>
              <button
                className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/20"
                onClick={onSelect}
                type="button"
              >
                Message
              </button>
              <button
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm font-semibold transition",
                  filled
                    ? "bg-app-success/15 text-app-success"
                    : invited
                      ? "border border-[#FFD166]/30 bg-[#FFD166]/10 text-[#FFD166]"
                      : "bg-app-purple text-white hover:bg-app-purple-hover"
                )}
                onClick={onInvite}
                type="button"
              >
                {filled ? "Confirmed" : invited ? "Invited" : "Invite"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
