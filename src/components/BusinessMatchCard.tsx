"use client";

import Link from "next/link";

import { TagChip } from "@/src/components/Chips";
import { type MatchExplanation, type SupportAction } from "@/src/data/economy";
import { cn } from "@/src/lib/utils";

export function BusinessMatchCard({
  match,
  href,
  actionState,
  onRespond
}: {
  match: MatchExplanation;
  href: string;
  actionState?: SupportAction;
  onRespond?: (action: SupportAction) => void;
}) {
  return (
    <article className="rounded-[28px] bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
            {match.targetType}
          </p>
          <Link href={href}>
            <h3 className="mt-2 text-xl font-semibold text-white">{match.title}</h3>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-white/72">{match.summary}</p>
        </div>
        {actionState ? (
          <span className="rounded-full bg-app-purple/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            {actionState}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {match.chips.map((chip) => (
          <TagChip key={chip} label={chip} subdued />
        ))}
      </div>

      <div className="mt-5 border-t border-white/6 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
          Why this match
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {match.confidenceNotes.map((note) => (
            <TagChip key={note} label={note} />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["saved", "supporting", "hosting"] as const).map((action) => (
          <button
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
              action === "hosting"
                ? actionState === action
                  ? "bg-app-purple text-white"
                  : "bg-app-purple text-white hover:bg-app-purple-hover"
                : actionState === action
                  ? "bg-white/[0.08] text-white"
                  : "bg-white/[0.06] text-app-muted hover:bg-white/[0.1] hover:text-white"
            )}
            key={action}
            onClick={() => onRespond?.(action)}
            type="button"
          >
            {action === "saved" ? "Save" : action === "supporting" ? "Support" : "Host"}
          </button>
        ))}
      </div>
    </article>
  );
}
