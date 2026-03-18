import { Avatar } from "@/src/components/Avatar";
import { type CandidateMatch } from "@/src/lib/matching";

export function TeamMatchCard({
  match,
  roleName,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel
}: {
  match: CandidateMatch;
  roleName: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <article className="surface-card p-4">
      <div className="flex items-start gap-3">
        <Avatar name={match.user.name} size="md" src={match.user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{match.user.name}</p>
              <p className="truncate text-sm text-app-muted">
                {roleName} · {match.user.city}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-app-muted">
              {match.user.pastEventsWorked} events
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-app-muted">{match.why}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {match.user.skills.slice(0, 3).map((skill) => (
              <span
                className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-app-muted"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              onClick={onPrimary}
              type="button"
            >
              {primaryLabel}
            </button>
            <button
              className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={onSecondary}
              type="button"
            >
              {secondaryLabel}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

