"use client";

import { FilterChip } from "@/src/components/Chips";
import { CREW_BUDGET_OPTIONS, CREW_PROCESSING_MESSAGES } from "@/src/data/crew-plan";
import {
  launchFormatOptions,
  sizeBucketOptions,
  type LaunchWizardDraft
} from "@/src/data/launch-builder";
import { cn } from "@/src/lib/utils";

export const BRIEF_STEPS = [
  "vision",
  "event_type",
  "city",
  "timeline",
  "budget"
] as const;

export type BriefStepKey = (typeof BRIEF_STEPS)[number];

const durationOptions = ["1 day", "2 days", "3 days", "4 days", "5+ days"] as const;

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

export function BriefVisionStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  return (
    <div className="space-y-4">
      <textarea
        className="min-h-[176px] w-full rounded-[26px] border border-white/8 bg-[#0d1119] px-5 py-4 text-base leading-7 text-white outline-none placeholder:text-app-muted"
        onChange={(event) => updateDraft({ conceptVision: event.target.value })}
        placeholder="A 300-person anime cosplay ball in downtown LA with live drawing stations, a photo garden, and DJ sets..."
        value={draft.conceptVision}
      />
      <div className="rounded-[22px] bg-white/[0.04] px-4 py-4">
        <p className="text-sm font-semibold text-white">Write it like you’d pitch it to a collaborator.</p>
        <p className="mt-1 text-sm leading-6 text-app-muted">
          We’ll use this to infer the crew, style, and first budget recommendations automatically.
        </p>
      </div>
    </div>
  );
}

export function BriefEventTypeStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="block rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">Event type</span>
        <div className="mt-3 rounded-[18px] bg-white/[0.03] px-3">
          <select
            className="h-11 w-full bg-transparent text-sm text-white outline-none"
            onChange={(event) =>
              updateDraft({
                format: event.target.value as LaunchWizardDraft["format"]
              })
            }
            value={draft.format ?? ""}
          >
            <option disabled value="">
              Select an event type
            </option>
            {launchFormatOptions.filter((option) => option !== "Other").map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </label>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-white">Expected crowd</p>
        <div className="flex flex-wrap gap-2">
          {sizeBucketOptions.map((option) => (
            <FilterChip
              active={draft.sizeBucket === option}
              className="text-[12px]"
              key={option}
              label={option}
              onClick={() => updateDraft({ sizeBucket: option })}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {launchFormatOptions
          .filter((option) => option !== "Other")
          .map((option) => (
            <div
              className={cn(
                "rounded-[18px] px-3 py-3 text-center text-[11px] font-medium leading-5 transition",
                draft.format === option
                  ? "bg-app-purple/12 text-white ring-1 ring-app-purple/26"
                  : "bg-white/[0.04] text-app-muted"
              )}
              key={option}
            >
              {compactTypeLabel(option)}
            </div>
          ))}
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
    <div className="space-y-4">
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
    <div className="space-y-4">
      <label className="block rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">Event date</span>
        <input
          className="mt-3 w-full bg-transparent text-sm text-white outline-none"
          onChange={(event) => updateDraft({ briefStartDate: event.target.value })}
          type="date"
          value={draft.briefStartDate}
        />
      </label>

      <label className="block rounded-[24px] border border-white/8 bg-[#0d1119] px-4 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">How many days?</span>
        <div className="mt-3 rounded-[18px] bg-white/[0.03] px-3">
          <select
            className="h-11 w-full bg-transparent text-sm text-white outline-none"
            onChange={(event) => updateDraft({ briefDurationDays: event.target.value })}
            value={draft.briefDurationDays}
          >
            <option disabled value="">
              Select duration
            </option>
            {durationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </label>

      <button
        className={cn(
          "flex min-h-[52px] w-full items-center gap-3 rounded-[24px] px-4 py-4 text-left transition",
          draft.briefDateFlexible
            ? "bg-app-purple/12 text-white ring-1 ring-app-purple/26"
            : "bg-white/[0.04] text-app-muted hover:bg-white/[0.06]"
        )}
        onClick={() =>
          updateDraft({
            briefDateFlexible: !draft.briefDateFlexible
          })
        }
        type="button"
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border text-xs font-semibold transition",
            draft.briefDateFlexible
              ? "border-app-purple/40 bg-app-purple text-white"
              : "border-white/14 bg-transparent text-transparent"
          )}
        >
          ✓
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Date is flexible</p>
          <p className="mt-1 text-sm leading-5 text-app-muted">We can optimize around crew and venue availability.</p>
        </div>
      </button>
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
    <div className="space-y-4">
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

      <div className="rounded-[22px] bg-[radial-gradient(circle_at_top,rgba(123,132,255,0.12),transparent_42%),rgba(255,255,255,0.04)] px-4 py-4">
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
        "surface-card-strong w-full rounded-[22px] px-4 py-4 text-left transition",
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

function compactTypeLabel(label: string) {
  return label
    .replace(" / café meetup", "")
    .replace(" / hangout", "")
    .replace(" / performance", "")
    .replace(" / vendor night", "")
    .replace(" / competition", "")
    .replace(" / ball", "");
}
