import { cn } from "@/src/lib/utils";

export function WelcomePathCard({
  title,
  description,
  accent,
  onClick
}: {
  title: string;
  description: string;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "group rounded-[28px] border border-white/8 bg-[#0d1119] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-[#111726]",
        accent
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/72">
            Start here
          </span>
          <h2 className="text-3xl font-semibold text-white">{title}</h2>
          <p className="max-w-[22ch] text-sm leading-6 text-app-muted">{description}</p>
        </div>
        <span className="text-sm font-semibold text-white/88 transition group-hover:text-white">
          Continue
        </span>
      </div>
    </button>
  );
}

