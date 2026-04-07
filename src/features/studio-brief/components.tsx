"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { FilterChip, TagChip } from "@/src/components/Chips";
import {
  ALL_CREW_DELIVERABLES,
  BRIEF_VISUAL_STYLE_OPTIONS,
  CREW_BUDGET_OPTIONS,
  CREW_PROCESSING_MESSAGES,
  deriveSwipeDeliverables,
  getDeliverableOptionsForFormat,
  getInspirationEventsForBrief,
  type BriefVisualStyle,
  type CrewDeliverable,
  type InspirationEvent
} from "@/src/data/crew-plan";
import {
  launchFormatOptions,
  sizeBucketOptions,
  type LaunchWizardDraft
} from "@/src/data/launch-builder";
import { cn } from "@/src/lib/utils";

export const BRIEF_STEPS = [
  "foundation",
  "inspiration",
  "visual_direction",
  "budget_timeline",
  "deliverables"
] as const;

export type BriefStepKey = (typeof BRIEF_STEPS)[number];

const durationOptions = ["1 day", "2 days", "3 days", "4 days", "5+ days"] as const;
const swipeThreshold = 100;

export function getLaunchModeLabel(mode: LaunchWizardDraft["launchMode"]) {
  return mode === "soft" ? "Test demand first" : "Publish now";
}

export function BriefWizardProgress({ current }: { current: number }) {
  return (
    <div className="space-y-2.5">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${BRIEF_STEPS.length}, minmax(0, 1fr))` }}>
        {BRIEF_STEPS.map((step, index) => (
          <div
            className={cn(
              "h-1.5 rounded-full transition",
              index <= current ? "bg-app-purple" : "bg-white/[0.08]"
            )}
            key={step}
          />
        ))}
      </div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-app-muted">
        Step {current + 1} of {BRIEF_STEPS.length}
      </p>
    </div>
  );
}

export function BriefFoundationStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <FieldLabel label="Event type" />
        <div className="rounded-[24px] bg-white/[0.04] px-4 py-1.5">
          <select
            className="h-12 w-full bg-transparent text-[15px] text-white outline-none"
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
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <FieldLabel label="Expected crowd" />
        <div className="flex flex-wrap gap-2">
          {sizeBucketOptions.map((option) => (
            <FilterChip
              active={draft.sizeBucket === option}
              className="border-white/6 bg-white/[0.03] px-3.5 py-2 text-[12px]"
              key={option}
              label={option}
              onClick={() => updateDraft({ sizeBucket: option })}
            />
          ))}
        </div>
      </div>

      <label className="block space-y-2.5">
        <FieldLabel label="Concept" />
        <textarea
          className="min-h-[172px] w-full rounded-[28px] bg-white/[0.04] px-5 py-5 text-[15px] leading-7 text-white outline-none placeholder:text-app-muted"
          onChange={(event) => updateDraft({ conceptVision: event.target.value })}
          placeholder="An anime cosplay ball in downtown LA — think dark glamour, live art stations, a photo garden with cosplay-ready backdrops, and DJ sets blending anime OSTs with house music."
          value={draft.conceptVision}
        />
      </label>
    </div>
  );
}

export function BriefInspirationSwipeStep({
  draft,
  onSkip,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
  onSkip: () => void;
}) {
  const cards = getInspirationEventsForBrief({
    format: draft.format,
    sizeBucket: draft.sizeBucket,
    conceptVision: draft.conceptVision,
    city: draft.city
  });
  const swipedIds = new Set([...draft.likedInspirationIds, ...draft.passedInspirationIds]);
  const remainingCards = cards.filter((card) => !swipedIds.has(card.id));
  const currentCard = remainingCards[0] ?? null;
  const nextCard = remainingCards[1] ?? null;
  const swipeCount = draft.likedInspirationIds.length + draft.passedInspirationIds.length;
  const canContinue = swipeCount >= 4 || draft.inspirationStepSkipped;

  const pointerStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  function resetDrag() {
    pointerStartX.current = null;
    setDragOffset(0);
  }

  function commitSwipe(direction: "left" | "right") {
    if (!currentCard || exitDirection) {
      return;
    }

    setExitDirection(direction);

    window.setTimeout(() => {
      if (direction === "right") {
        updateDraft({
          likedInspirationIds: uniqueIds([...draft.likedInspirationIds, currentCard.id]),
          passedInspirationIds: draft.passedInspirationIds.filter((id) => id !== currentCard.id),
          inspirationStepSkipped: false
        });
      } else {
        updateDraft({
          passedInspirationIds: uniqueIds([...draft.passedInspirationIds, currentCard.id]),
          likedInspirationIds: draft.likedInspirationIds.filter((id) => id !== currentCard.id),
          inspirationStepSkipped: false
        });
      }

      setExitDirection(null);
      resetDrag();
    }, 220);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!currentCard || exitDirection) {
      return;
    }

    pointerStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerStartX.current === null || exitDirection) {
      return;
    }

    setDragOffset(event.clientX - pointerStartX.current);
  }

  function handlePointerUp() {
    if (pointerStartX.current === null) {
      return;
    }

    if (dragOffset >= swipeThreshold) {
      commitSwipe("right");
      return;
    }

    if (dragOffset <= -swipeThreshold) {
      commitSwipe("left");
      return;
    }

    resetDrag();
  }

  const overlayDirection = exitDirection ?? (dragOffset > 18 ? "right" : dragOffset < -18 ? "left" : null);
  const overlayOpacity = Math.min(1, Math.abs(dragOffset) / swipeThreshold);

  return (
    <div className="space-y-5">
      <div className="relative h-[430px]">
        {nextCard ? <InspirationPeekCard card={nextCard} /> : null}

        {currentCard ? (
          <div
            className={cn(
              "absolute inset-0 overflow-hidden rounded-[32px] bg-[#0d1119] shadow-[0_30px_80px_rgba(0,0,0,0.34)] transition-transform duration-200 ease-out",
              exitDirection ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              transform: exitDirection
                ? `translateX(${exitDirection === "right" ? "128%" : "-128%"}) rotate(${exitDirection === "right" ? 14 : -14}deg)`
                : `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`
            }}
          >
            <InspirationCardBody
              card={currentCard}
              overlayDirection={overlayDirection}
              overlayOpacity={overlayOpacity}
            />
          </div>
        ) : (
          <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(123,132,255,0.18),transparent_40%),linear-gradient(180deg,rgba(21,25,40,0.98),rgba(11,14,24,1))] p-6">
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">Swipe complete</p>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-white">Nice taste.</h3>
                  <p className="text-sm leading-6 text-app-muted">
                    We&apos;ll match creators who&apos;ve worked on events like the ones you loved.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.likedInspirationIds.length > 0 ? (
                  cards
                    .filter((card) => draft.likedInspirationIds.includes(card.id))
                    .slice(0, 3)
                    .map((card) => <TagChip key={card.id} label={card.vibe} subdued />)
                ) : (
                  <TagChip label="Skipping is okay" subdued />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <SwipeActionButton label="Pass" onClick={() => commitSwipe("left")} tone="pass" />
        <SwipeActionButton label="Love it" onClick={() => commitSwipe("right")} tone="love" />
      </div>

      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {cards.map((card) => {
            const isDone = swipedIds.has(card.id);
            const isCurrent = currentCard?.id === card.id;
            return (
              <span
                className={cn(
                  "h-2 rounded-full transition",
                  isDone ? "w-2 bg-white/55" : isCurrent ? "w-6 bg-app-purple" : "w-2 bg-white/[0.14]"
                )}
                key={card.id}
              />
            );
          })}
        </div>

        {canContinue ? (
          <p className="text-sm font-medium text-[#D7D6FF]">
            Got it — we&apos;ll match creators who&apos;ve worked on events like the ones you loved.
          </p>
        ) : (
          <p className="text-sm text-app-muted">Swipe on at least 4 events to unlock continue.</p>
        )}

        <button
          className="text-sm font-semibold text-app-muted transition hover:text-white"
          onClick={() => {
            updateDraft({ inspirationStepSkipped: true });
            onSkip();
          }}
          type="button"
        >
          Skip this step →
        </button>
      </div>
    </div>
  );
}

export function BriefVisualDirectionStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  const selected = (draft.visualDirectionSelections ?? []) as BriefVisualStyle[];

  function toggleStyle(style: BriefVisualStyle) {
    if (selected.includes(style)) {
      updateDraft({
        visualDirectionSelections: selected.filter((item) => item !== style)
      });
      return;
    }

    if (selected.length >= 3) {
      return;
    }

    updateDraft({
      visualDirectionSelections: [...selected, style]
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-app-muted">Pick 2–3 styles that match your vision.</p>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
          {selected.length}/3
        </p>
      </div>

      {draft.likedInspirationIds.length > 0 ? (
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#D7D6FF]">
          Pre-selected from the events you loved
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        {BRIEF_VISUAL_STYLE_OPTIONS.map((option) => {
          const isActive = selected.includes(option.value);
          return (
            <button
              className={cn(
                "relative min-h-[108px] overflow-hidden rounded-[24px] px-4 py-4 text-left transition",
                isActive
                  ? "ring-1 ring-app-purple/28 shadow-[0_20px_60px_rgba(109,94,243,0.18)]"
                  : "opacity-90 hover:opacity-100"
              )}
              key={option.value}
              onClick={() => toggleStyle(option.value)}
              style={{
                background: option.background
              }}
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#070a12]/84 via-transparent to-transparent" />
              <div className="relative space-y-1">
                <p className="text-sm font-semibold text-white">{option.value}</p>
                <p className="text-xs leading-5 text-white/70">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BriefBudgetTimelineStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <label className="block space-y-2.5">
        <FieldLabel label="City" />
        <input
          className="w-full rounded-[24px] bg-white/[0.04] px-4 py-4 text-[15px] text-white outline-none placeholder:text-app-muted"
          onChange={(event) => updateDraft({ city: event.target.value })}
          placeholder="Los Angeles, CA"
          value={draft.city}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-2.5">
          <FieldLabel label="Event date" />
          <input
            className="w-full rounded-[24px] bg-white/[0.04] px-4 py-4 text-[15px] text-white outline-none"
            onChange={(event) => updateDraft({ briefStartDate: event.target.value })}
            type="date"
            value={draft.briefStartDate}
          />
        </label>

        <label className="block space-y-2.5">
          <FieldLabel label="How many days?" />
          <div className="rounded-[24px] bg-white/[0.04] px-4 py-1.5">
            <select
              className="h-12 w-full bg-transparent text-[15px] text-white outline-none"
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
      </div>

      <button
        className={cn(
          "flex min-h-[56px] w-full items-center gap-3 rounded-[24px] px-4 py-4 text-left transition",
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
          <p className="mt-1 text-sm leading-5 text-app-muted">We can optimize around the best crew availability.</p>
        </div>
      </button>

      <label className="block space-y-2.5">
        <FieldLabel label="Total crew budget" />
        <div className="rounded-[24px] bg-white/[0.04] px-4 py-1.5">
          <select
            className="h-12 w-full bg-transparent text-[15px] text-white outline-none"
            onChange={(event) => updateDraft({ crewBudgetRange: event.target.value })}
            value={draft.crewBudgetRange}
          >
            <option disabled value="">
              Select a budget range
            </option>
            {CREW_BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </label>
    </div>
  );
}

export function BriefDeliverablesStep({
  draft,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  const options = getDeliverableOptionsForFormat(draft.format);
  const selected = (draft.deliverableSelections ?? []) as CrewDeliverable[];

  function toggleDeliverable(deliverable: CrewDeliverable) {
    if (selected.includes(deliverable)) {
      updateDraft({
        deliverableSelections: selected.filter((item) => item !== deliverable)
      });
      return;
    }

    updateDraft({
      deliverableSelections: [...selected, deliverable]
    });
  }

  const previewSelection =
    draft.likedInspirationIds.length > 0
      ? deriveSwipeDeliverables(draft.likedInspirationIds, {
          format: draft.format,
          sizeBucket: draft.sizeBucket,
          conceptVision: draft.conceptVision
        })
      : [];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm text-app-muted">Select everything you want Saga to cover.</p>
        {previewSelection.length > 0 ? (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#D7D6FF]">
            Pre-checked from swipe signals
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {(options.length > 0 ? options : ALL_CREW_DELIVERABLES).map((option) => (
          <FilterChip
            active={selected.includes(option)}
            className="border-white/6 bg-white/[0.03] px-3.5 py-2 text-[12px]"
            key={option}
            label={option}
            onClick={() => toggleDeliverable(option)}
          />
        ))}
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

function InspirationPeekCard({ card }: { card: InspirationEvent }) {
  return (
    <div className="absolute inset-x-4 bottom-0 top-4 scale-[0.96] overflow-hidden rounded-[30px] bg-[#0d1119]/70">
      <div
        className="h-full w-full bg-cover bg-center opacity-75"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(7,10,18,0.04), rgba(7,10,18,0.82)), url(${card.heroImage})`
        }}
      />
    </div>
  );
}

function InspirationCardBody({
  card,
  overlayDirection,
  overlayOpacity
}: {
  card: InspirationEvent;
  overlayDirection: "left" | "right" | null;
  overlayOpacity: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[240px] overflow-hidden">
        <img alt={card.name} className="h-full w-full object-cover" src={card.heroImage} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/28 to-transparent" />
        {overlayDirection ? (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition",
              overlayDirection === "right" ? "bg-[#17b26a]/18" : "bg-[#ff6b6b]/18"
            )}
            style={{ opacity: overlayOpacity }}
          >
            <span
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em]",
                overlayDirection === "right"
                  ? "border-[#7CE2B6]/40 bg-[#17b26a]/16 text-[#8CE2B9]"
                  : "border-[#ff7e7e]/40 bg-[#ff6b6b]/16 text-[#ff9a9a]"
              )}
            >
              {overlayDirection === "right" ? "♥ Love it" : "✕ Pass"}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div className="space-y-2">
            <h3 className="text-[1.15rem] font-semibold leading-tight text-white">{card.name}</h3>
            <p className="text-sm leading-6 text-app-muted">{card.description}</p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-white/76">
            <span>📍 {card.city}</span>
            <span>👥 {card.sizeLabel}</span>
            <span>🎨 {card.vibe}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <TagChip key={tag} label={`#${tag}`} subdued />
          ))}
        </div>
      </div>
    </div>
  );
}

function SwipeActionButton({
  label,
  onClick,
  tone
}: {
  label: string;
  onClick: () => void;
  tone: "pass" | "love";
}) {
  return (
    <button
      className={cn(
        "flex min-h-[52px] min-w-[128px] items-center justify-center rounded-full px-5 text-sm font-semibold transition",
        tone === "love"
          ? "bg-app-purple text-white shadow-[0_14px_34px_rgba(31,28,184,0.22)] hover:bg-app-purple-hover"
          : "bg-white/[0.05] text-white hover:bg-white/[0.08]"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

function FieldLabel({ label }: { label: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-app-muted">{label}</p>;
}
