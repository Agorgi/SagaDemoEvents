import Link from "next/link";

import { Nav } from "@/src/components/Nav";
import { PageHeroHeader } from "@/src/components/PageHeroHeader";

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
    <div className="min-h-screen bg-app-grid">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <PageHeroHeader eyebrow={eyebrow} label="Saga" subtitle={description} title={title} />
        <div className="mt-6 flex flex-wrap gap-3 rounded-[30px] bg-white/[0.04] p-5 shadow-soft">
          <Link
            className="inline-flex min-h-[48px] items-center rounded-2xl bg-app-purple px-5 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            href="/explore"
          >
            Back to Explore
          </Link>
          <Link
            className="inline-flex min-h-[48px] items-center rounded-2xl bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            href="/events/court-of-stars"
          >
            Open demo event
          </Link>
        </div>
      </main>
    </div>
  );
}
