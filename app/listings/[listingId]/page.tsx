"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { TagChip } from "@/src/components/Chips";
import { ListingCard } from "@/src/components/ListingCard";
import { Nav } from "@/src/components/Nav";
import { getListingById, getStorefrontById } from "@/src/data/economy";
import { getUserById } from "@/src/data/demo";
import { useAppState } from "@/src/lib/app-state";

export default function ListingDetailPage() {
  const params = useParams<{ listingId: string }>();
  const { currentUserId, listings, listingInterests, toggleListingInterest } = useAppState();
  const listing = getListingById(params.listingId, listings);

  if (!listing) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center text-app-muted">
          Listing not found.
        </main>
      </div>
    );
  }

  const creator = getUserById(listing.creatorUserId);
  const storefront = getStorefrontById(listing.storefrontId);
  const interest = listingInterests.find(
    (item) => item.listingId === listing.id && item.userId === currentUserId
  );
  const primaryKind = listing.type === "merch" || listing.type === "resale" ? "mock_purchased" : "requested";

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-[940px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <ListingCard
          href={`/listings/${listing.id}`}
          interestKind={interest?.kind}
          listing={listing}
          onPrimaryAction={() => toggleListingInterest(listing.id, primaryKind)}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.88fr)]">
          <section className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">About this listing</p>
              <div className="mt-4">
                <ExpandableText collapsedLines={4} text={listing.description} />
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Tagged for</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.fandomTags.map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
                {listing.schema.embeddingTags.slice(0, 3).map((tag) => (
                  <TagChip key={tag} label={tag} subdued />
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="surface-card p-5">
              <p className="text-lg font-semibold text-white">Take action</p>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  onClick={() => toggleListingInterest(listing.id, primaryKind)}
                  type="button"
                >
                  {primaryKind === "mock_purchased" ? "Mock buy" : "Request"}
                </button>
                <button
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  onClick={() => toggleListingInterest(listing.id, "saved")}
                  type="button"
                >
                  Save
                </button>
              </div>
              <p className="mt-3 text-sm text-app-muted">
                Mock only. This records intent and keeps the listing visible in your activity.
              </p>
            </div>

            <Link
              className="surface-card block p-5 transition hover:border-white/12"
              href={`/profiles/${listing.creatorUserId}`}
            >
              <p className="text-lg font-semibold text-white">Creator</p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar name={creator?.name ?? "Creator"} size="sm" src={creator?.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{creator?.name ?? "Creator"}</p>
                  <p className="truncate text-sm text-app-muted">{creator?.bio}</p>
                </div>
              </div>
            </Link>

            {storefront ? (
              <Link
                className="surface-card block p-5 transition hover:border-white/12"
                href={`/profiles/${listing.creatorUserId}`}
              >
                <p className="text-lg font-semibold text-white">{storefront.title}</p>
                <p className="mt-2 text-sm text-app-muted">{storefront.headline}</p>
              </Link>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
