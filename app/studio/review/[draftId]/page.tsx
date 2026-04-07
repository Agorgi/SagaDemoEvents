"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { TagChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import { launchPosterStyleOptions } from "@/src/data/launch-builder";
import { useAppState } from "@/src/lib/app-state";
import {
  getMediaObjectPosition,
  mediaPositionOptions
} from "@/src/lib/media-position";

export default function LaunchDraftReviewPage() {
  const params = useParams<{ draftId: string }>();
  const router = useRouter();
  const {
    currentUser,
    launchDrafts,
    mode,
    publishLaunchDraft,
    saveLaunchDraft,
    setMode,
    updateLaunchDraft
  } = useAppState();

  useEffect(() => {
    if (mode !== "host") {
      setMode("host");
    }
  }, [mode, setMode]);

  const draft = launchDrafts.find((item) => item.id === params.draftId);

  if (!draft) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-[760px] px-4 py-20 text-center text-app-muted">
          Draft not found.
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[540px] px-4 pb-36 pt-5 sm:max-w-[620px] sm:px-6 sm:pb-16 sm:pt-8">
        <section className="space-y-5">
          <div className="mx-auto max-w-[340px] space-y-3">
            <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[#0f1320] shadow-soft">
              <div className="relative">
                <img
                  alt={draft.generatedDraft.title}
                  className="aspect-[4/5] w-full object-cover"
                  src={draft.generatedDraft.posterUrl}
                  style={{ objectPosition: getMediaObjectPosition(draft.posterImagePosition) }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070c]/68 via-transparent to-transparent" />
                <div className="absolute left-4 top-4">
                  <span className="inline-flex rounded-full border border-app-purple/40 bg-app-purple/12 px-3 py-1 text-xs font-semibold text-[#E0DEFF]">
                    {draft.launchMode === "soft" ? "Test demand first" : "Publish now"}
                  </span>
                </div>
              </div>
            </div>
            {draft.posterImage ? (
              <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/8 bg-[#0d1119] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
                  Reposition
                </p>
                <div className="flex items-center gap-2">
                  {mediaPositionOptions.map((option) => (
                    <button
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        draft.posterImagePosition === option.value
                          ? "bg-app-purple text-white shadow-[0_10px_24px_rgba(31,28,184,0.22)]"
                          : "border border-white/10 bg-white/[0.03] text-app-muted hover:border-white/18 hover:text-white"
                      }`}
                      key={option.value}
                      onClick={() => updateLaunchDraft(draft.id, { posterImagePosition: option.value })}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">Title</p>
                <input
                  className="w-full bg-transparent text-[32px] font-semibold leading-tight text-white outline-none placeholder:text-white/50 sm:text-[42px]"
                  onChange={(event) => updateLaunchDraft(draft.id, { customTitle: event.target.value })}
                  placeholder="Draft title"
                  value={draft.customTitle ?? draft.generatedDraft.title}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">Description</p>
                <textarea
                  className="min-h-[84px] w-full bg-transparent text-sm leading-6 text-white/78 outline-none placeholder:text-app-muted"
                  onChange={(event) => updateLaunchDraft(draft.id, { customSummary: event.target.value })}
                  placeholder="Short summary"
                  value={draft.customSummary ?? draft.generatedDraft.summary}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} size="sm" src={currentUser.avatarUrl} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-app-muted">{currentUser.city}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
              <div className="space-y-2 text-sm text-white/86">
                <p>{draft.generatedDraft.dateSummary}</p>
                <p>{draft.generatedDraft.locationSummary}</p>
                <p>{draft.generatedDraft.entrySummary}</p>
              </div>
              <p className="mt-3 text-xs text-app-muted">
                {draft.posterImage
                  ? `Poster image · ${draft.posterImagePosition} focus`
                  : `Poster style · ${launchPosterStyleOptions.find((option) => option.value === draft.posterStyle)?.label ?? "Violet glow"}`}
              </p>
              {draft.generatedDraft.highlightChips.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {draft.generatedDraft.highlightChips.map((tag) => (
                    <TagChip key={tag} label={tag} subdued />
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <button
                className="min-h-[48px] w-full rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() => {
                  const result = publishLaunchDraft(draft.id);
                  if (!result) {
                    return;
                  }
                  router.push(
                    draft.launchMode === "soft"
                      ? `/campaigns/${result.launchId}`
                      : `/events/${result.eventId ?? result.launchId}`
                  );
                }}
                type="button"
              >
                {draft.launchMode === "soft" ? "Publish soft launch" : "Publish event"}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                className="min-h-[46px] flex-1 rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                onClick={() => {
                  saveLaunchDraft(draft.id);
                  router.push("/studio");
                }}
                type="button"
              >
                Save draft
              </button>
              <Link
                className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                href={`/studio/new?draft=${draft.id}`}
              >
                Edit answers
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-8">
          <ReviewSection title="What to expect">
            <ul className="space-y-3">
              {draft.generatedDraft.expectationLines.map((line) => (
                <li className="flex gap-3 text-sm leading-6 text-app-muted" key={line}>
                  <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-app-purple" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </ReviewSection>

          <ReviewSection title="Guest access">
            <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
              <p className="text-sm font-semibold text-white">{draft.generatedDraft.entrySummary}</p>
              {draft.notes ? (
                <div className="mt-3">
                  <ExpandableText collapsedLines={4} text={draft.notes} />
                </div>
              ) : null}
            </div>
          </ReviewSection>

          {draft.launchMode === "soft" ? (
            <ReviewSection title="Launch details">
              <div className="space-y-3">
                {draft.dateOptions.filter((option) => option.iso).map((option) => (
                  <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4" key={option.id}>
                    <p className="font-semibold text-white">{option.label}</p>
                  </div>
                ))}
                <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
                  <p className="text-sm font-semibold text-white">
                    {draft.minimumPeopleNeeded ?? 40} people needed to launch
                  </p>
                </div>
              </div>
            </ReviewSection>
          ) : (
            <ReviewSection title="Confirmed details">
              <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                <p className="text-sm font-semibold text-white">{draft.generatedDraft.dateSummary}</p>
                <p className="mt-2 text-sm text-app-muted">{draft.generatedDraft.locationSummary}</p>
              </div>
            </ReviewSection>
          )}

          {draft.suggestedNeeds.length > 0 ? (
            <ReviewSection title="Open roles & needs">
              <div className="space-y-3">
                {draft.suggestedNeeds.map((need) => (
                  <div className="rounded-[22px] bg-white/[0.04] p-4" key={need.id}>
                    <p className="text-sm font-semibold text-white">
                      {need.label}
                      {need.rateRangeLabel ? (
                        <span className="ml-2 text-app-muted">/ {need.rateRangeLabel}</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-app-muted">{need.why}</p>
                  </div>
                ))}
              </div>
            </ReviewSection>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function ReviewSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">{title}</h2>
      {children}
    </section>
  );
}
