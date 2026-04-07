"use client";

import { type RefObject } from "react";

import { FilterChip } from "@/src/components/Chips";
import {
  CREW_BUDGET_OPTIONS,
  CREW_PROCESSING_MESSAGES
} from "@/src/data/crew-plan";
import {
  launchFormatOptions,
  sizeBucketOptions,
  type BriefAttachment,
  type BriefMoodBoardImage,
  type LaunchWizardDraft
} from "@/src/data/launch-builder";
import { cn } from "@/src/lib/utils";

export const BRIEF_STEPS = [
  "concept",
  "city",
  "timeline",
  "budget"
] as const;

export type BriefStepKey = (typeof BRIEF_STEPS)[number];

export function getLaunchModeLabel(mode: LaunchWizardDraft["launchMode"]) {
  return mode === "soft" ? "Test demand first" : "Publish now";
}

export function getLaunchModeSubtitle(mode: LaunchWizardDraft["launchMode"]) {
  return mode === "soft"
    ? "See if people want this before you commit."
    : "You've got a date. Let's go live.";
}

export function BriefWizardProgress({ current }: { current: number }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${BRIEF_STEPS.length}, minmax(0, 1fr))` }}>
        {BRIEF_STEPS.map((step, index) => (
          <div
            className={cn(
              "h-2 rounded-full transition",
              index <= current ? "bg-app-purple" : "bg-white/[0.08]"
            )}
            key={step}
          />
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-app-muted">
        Step {current + 1} of {BRIEF_STEPS.length}
      </p>
    </div>
  );
}

export function BriefConceptStep({
  attachments,
  draft,
  moodBoardInputRef,
  onFilesSelected,
  removeAttachment,
  removeMoodImage,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  attachments: BriefAttachment[];
  moodBoardInputRef: RefObject<HTMLInputElement>;
  onFilesSelected: (files: FileList | null) => void;
  removeAttachment: (attachmentId: string) => void;
  removeMoodImage: (imageId: string) => void;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">Production type</p>
        <div className="grid gap-3">
          {launchFormatOptions
            .filter((option) => option !== "Other")
            .map((option) => (
              <ChoiceCard
                key={option}
                onClick={() => updateDraft({ format: option })}
                selected={draft.format === option}
                title={option}
              />
            ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">Expected crowd</p>
        <div className="flex flex-wrap gap-2">
          {sizeBucketOptions.map((option) => (
            <FilterChip
              active={draft.sizeBucket === option}
              key={option}
              label={option}
              onClick={() => updateDraft({ sizeBucket: option })}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">Concept</p>
        <textarea
          className="min-h-[220px] w-full rounded-[28px] border border-white/8 bg-[#0d1119] px-5 py-4 text-base leading-7 text-white outline-none placeholder:text-app-muted"
          onChange={(event) => updateDraft({ conceptVision: event.target.value })}
          placeholder="A 300-person anime cosplay ball in downtown LA with live drawing stations, a photo garden, and DJ sets..."
          value={draft.conceptVision}
        />
      </div>

      <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Mood board</p>
            <p className="mt-1 text-sm text-app-muted">Optional, but helpful for style matching.</p>
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            onClick={() => moodBoardInputRef.current?.click()}
            type="button"
          >
            Upload
          </button>
          <input
            accept=".pdf,.doc,.docx,image/png,image/jpeg,image/jpg"
            className="hidden"
            multiple
            onChange={(event) => {
              onFilesSelected(event.target.files);
              event.currentTarget.value = "";
            }}
            ref={moodBoardInputRef}
            type="file"
          />
        </div>

        {draft.moodBoardImages.length > 0 ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 subtle-scrollbar">
            {draft.moodBoardImages.map((image) => (
              <MoodThumb image={image} key={image.id} onRemove={() => removeMoodImage(image.id)} />
            ))}
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <button
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/82 transition hover:border-white/18"
                key={attachment.id}
                onClick={() => removeAttachment(attachment.id)}
                type="button"
              >
                {attachment.name} ×
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function BriefCityStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <label className="block rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">City</span>
        <input
          className="mt-3 w-full bg-transparent text-base text-white outline-none placeholder:text-app-muted"
          onChange={(event) => updateDraft({ city: event.target.value })}
          placeholder="Los Angeles, CA"
          value={draft.city}
        />
      </label>

      <label className="block rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">Neighborhood</span>
        <input
          className="mt-3 w-full bg-transparent text-base text-white outline-none placeholder:text-app-muted"
          onChange={(event) => updateDraft({ neighborhood: event.target.value })}
          placeholder="Downtown LA"
          value={draft.neighborhood}
        />
      </label>

      <div className="rounded-[24px] bg-white/[0.04] px-4 py-4">
        <p className="text-sm font-semibold text-white">A city is enough for now.</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">
          We’ll use it to weight local crew first and keep venue suggestions grounded.
        </p>
      </div>
    </div>
  );
}

export function BriefTimelineStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">Start date</span>
          <input
            className="mt-3 w-full bg-transparent text-sm text-white outline-none"
            onChange={(event) => updateDraft({ briefStartDate: event.target.value })}
            type="date"
            value={draft.briefStartDate}
          />
        </label>
        <label className="rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">End date</span>
          <input
            className="mt-3 w-full bg-transparent text-sm text-white outline-none"
            onChange={(event) => updateDraft({ briefEndDate: event.target.value })}
            type="date"
            value={draft.briefEndDate}
          />
        </label>
      </div>

      <div className="rounded-[24px] bg-white/[0.04] px-4 py-4">
        <p className="text-sm font-semibold text-white">Give us the window, not the run sheet.</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">
          We’ll use this to scope the crew, estimate the pace, and suggest who fits the timeline.
        </p>
      </div>
    </div>
  );
}

export function BriefBudgetStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {CREW_BUDGET_OPTIONS.map((option) => (
          <ChoiceCard
            description={budgetDescriptions[option]}
            key={option}
            onClick={() => updateDraft({ crewBudgetRange: option })}
            selected={draft.crewBudgetRange === option}
            title={option}
          />
        ))}
      </div>

      <div className="rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(123,132,255,0.12),transparent_42%),rgba(255,255,255,0.04)] px-4 py-4">
        <p className="text-sm font-semibold text-white">What happens next</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">
          We’ll identify the first roles, estimate starting rates, and surface creator fits for your review.
        </p>
      </div>
    </div>
  );
}

export function ProcessingStage({
  title,
  messageIndex
}: {
  title: string;
  messageIndex: number;
}) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-[440px] space-y-5">
        <div className="space-y-2 text-center">
          <p className="text-3xl font-semibold text-white">{title}</p>
          <p className="text-sm text-app-muted transition">{CREW_PROCESSING_MESSAGES[messageIndex]}</p>
        </div>
        <div className="surface-card-strong overflow-hidden p-5">
          <div className="relative h-[220px] overflow-hidden rounded-[24px] bg-white/[0.03]">
            <div className="absolute inset-0 animate-[pulse_2.2s_ease-in-out_infinite] bg-[radial-gradient(circle_at_top,rgba(123,132,255,0.18),transparent_42%),linear-gradient(180deg,rgba(19,24,38,0.98),rgba(10,12,22,1))]" />
            <div className="absolute inset-x-5 top-6 h-3 rounded-full bg-white/[0.08]" />
            <div className="absolute inset-x-5 top-16 h-20 rounded-[20px] bg-white/[0.05]" />
            <div className="absolute inset-x-5 bottom-10 h-3 rounded-full bg-white/[0.08]" />
            <div className="absolute inset-x-5 bottom-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-app-purple" />
              <span className="h-2.5 w-2.5 animate-[pulse_1.1s_ease-in-out_120ms_infinite] rounded-full bg-[#7B84FF]" />
              <span className="h-2.5 w-2.5 animate-[pulse_1.1s_ease-in-out_240ms_infinite] rounded-full bg-white/55" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const budgetDescriptions: Record<string, string> = {
  "Under $500": "Lean support for one or two core needs.",
  "$500-$1,500": "Enough for a small starter team.",
  "$1,500-$3,000": "Balanced coverage for a polished night.",
  "$3,000-$5,000": "Room for specialists and stronger coverage.",
  "$5,000+": "Best for larger or more ambitious productions."
};

function ChoiceCard({
  description,
  title,
  selected,
  onClick
}: {
  description?: string;
  title: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "surface-card-strong w-full rounded-[24px] px-4 py-4 text-left transition",
        selected
          ? "border-app-purple/35 bg-[radial-gradient(circle_at_top,rgba(123,132,255,0.14),transparent_40%),linear-gradient(180deg,rgba(21,25,40,0.98),rgba(12,15,24,1))]"
          : "hover:border-white/12"
      )}
      onClick={onClick}
      type="button"
    >
      <p className="text-base font-semibold text-white">{title}</p>
      {description ? <p className="mt-1 text-sm leading-6 text-app-muted">{description}</p> : null}
    </button>
  );
}

function MoodThumb({
  image,
  onRemove
}: {
  image: BriefMoodBoardImage;
  onRemove: () => void;
}) {
  return (
    <div className="relative w-[108px] shrink-0 overflow-hidden rounded-[20px] border border-white/8">
      <img alt={image.name} className="h-[132px] w-full object-cover" src={image.src} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <span className="absolute bottom-2 left-2 right-8 line-clamp-2 text-[11px] font-medium text-white">
        {image.name}
      </span>
      <button
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-sm text-white transition hover:bg-black/60"
        onClick={onRemove}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
