import Link from "next/link";

export function PlaceholderPage({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-app-grid px-4 py-20">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/8 bg-[#0e121a] p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-app-muted">{eyebrow}</p>
        <h1 className="mt-4 text-5xl font-semibold text-white">{title}</h1>
        <p className="mt-4 text-lg text-app-muted">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-2xl bg-app-purple px-5 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            href="/explore"
          >
            Back to Explore
          </Link>
          <Link
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20"
            href="/events/court-of-stars"
          >
            Open demo event
          </Link>
        </div>
      </div>
    </div>
  );
}
