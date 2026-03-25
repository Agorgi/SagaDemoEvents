"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";

const listingTypes = ["service", "commission", "merch", "resale"] as const;
const tagOptions = [
  "Cosplay",
  "Love and Deepspace",
  "Genshin Impact",
  "Marvel Rivals",
  "Photography",
  "Portraits",
  "Creator Collabs",
  "One Piece"
];

export default function NewListingPage() {
  const router = useRouter();
  const { createListing, currentUser, preferredFandoms } = useAppState();
  const [type, setType] = useState<(typeof listingTypes)[number]>("service");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [tags, setTags] = useState<string[]>(preferredFandoms.slice(0, 2));

  function handleSubmit() {
    if (!title.trim() || !summary.trim() || !priceLabel.trim()) {
      return;
    }

    const id = createListing({
      type,
      title: title.trim(),
      summary: summary.trim(),
      description: description.trim() || summary.trim(),
      priceLabel: priceLabel.trim(),
      fandomTags: tags.length > 0 ? tags : preferredFandoms.slice(0, 2),
      city: currentUser.city
    });

    router.push(`/listings/${id}`);
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">New listing</p>
          <h1 className="text-4xl font-semibold text-white">Add something to your storefront</h1>
          <p className="text-sm text-app-muted">Services, merch, resale, or commissions. Lightweight and fast.</p>
        </section>

        <div className="mt-6 space-y-6">
          <section className="surface-card p-5">
            <p className="text-lg font-semibold text-white">Type</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {listingTypes.map((option) => (
                <button
                  className={`pill ${type === option ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
                  key={option}
                  onClick={() => setType(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </section>

          <section className="surface-card space-y-4 p-5">
            <Field label="Title" onChange={setTitle} placeholder="Launch promo kit" value={title} />
            <Field
              label="Summary"
              onChange={setSummary}
              placeholder="Moodboard, teaser copy, and early-post assets for fandom event drops."
              value={summary}
            />
            <Field
              label="Price"
              onChange={setPriceLabel}
              placeholder="$220 package"
              value={priceLabel}
            />
            <label className="block">
              <span className="text-sm font-semibold text-white">Description</span>
              <textarea
                className="mt-2 h-28 w-full rounded-[22px] border border-white/10 bg-[#0d1119] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a little more context if you want."
                value={description}
              />
            </label>
          </section>

          <section className="surface-card p-5">
            <p className="text-lg font-semibold text-white">Fandom tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tagOptions.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    className={`pill ${active ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
                    key={tag}
                    onClick={() =>
                      setTags((current) =>
                        current.includes(tag)
                          ? current.filter((item) => item !== tag)
                          : [...current, tag]
                      )
                    }
                    type="button"
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          <button
            className="w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={handleSubmit}
            type="button"
          >
            Publish listing
          </button>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white">{label}</span>
      <input
        className="mt-2 w-full rounded-[22px] border border-white/10 bg-[#0d1119] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
