"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { FilterChip } from "@/src/components/Chips";
import { Nav } from "@/src/components/Nav";
import {
  fandomSuggestionOptions,
  getLaunchQuestions,
  launchFormatOptions,
  otherClosestFormatOptions,
  type LaunchDraftStatus,
  type LaunchModeType,
  type LaunchQuestionConfig,
  type LaunchWizardDraft,
  lineupStatusOptions,
  producedEntryOptions,
  producedPriceOptions,
  producedVenueTypes,
  quickDatePresets,
  reservationOptions,
  simpleEntryOptions,
  simplePriceOptions,
  simpleVenueTypes,
  sizeBucketOptions,
  softEntryOptions,
  softHighlightOptions,
  softMinimumPeopleOptions,
  softVenueTypeOptions,
  timeWindowOptions,
  vendorCountOptions,
  ageGateOptions,
  coordinationOptions,
  producedAlreadySetOptions,
  producedCoordinationOptions,
  producedExpectOptions,
  simpleAlreadySetOptions,
  simpleExpectOptions,
  softAlreadySetOptions
} from "@/src/data/launch-builder";
import { useAppState } from "@/src/lib/app-state";
import { cn, slugify } from "@/src/lib/utils";

export default function NewStudioLaunchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <NewStudioLaunchPageContent />
    </Suspense>
  );
}

function NewStudioLaunchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    launchDrafts,
    setMode,
    startLaunchDraft,
    updateLaunchDraft
  } = useAppState();
  const draftId = searchParams.get("draft");
  const modeParam = searchParams.get("mode") as LaunchModeType | null;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [building, setBuilding] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const initializedDraftId = useRef<string | null>(null);

  const draft = launchDrafts.find((item) => item.id === draftId);
  const questions = useMemo(() => (draft ? getLaunchQuestions(draft) : []), [draft]);
  const question = questions[currentIndex];

  useEffect(() => {
    setMode("host");
  }, [setMode]);

  useEffect(() => {
    if (draftId || !modeParam) {
      return;
    }

    const nextDraftId = startLaunchDraft(modeParam);
    router.replace(`/studio/new?draft=${nextDraftId}`);
  }, [draftId, modeParam, router, startLaunchDraft]);

  useEffect(() => {
    if (!draftId && !modeParam) {
      router.replace("/studio");
    }
  }, [draftId, modeParam, router]);

  useEffect(() => {
    if (!draft) {
      return;
    }

    if (initializedDraftId.current !== draft.id) {
      initializedDraftId.current = draft.id;
      const indexFromDraft = draft.lastQuestionId
        ? questions.findIndex((item) => item.id === draft.lastQuestionId)
        : 0;
      setCurrentIndex(indexFromDraft >= 0 ? indexFromDraft : 0);
      return;
    }

    setCurrentIndex((current) => Math.min(current, Math.max(questions.length - 1, 0)));
  }, [draft, questions]);

  if (!draft || !question) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-[760px] px-4 py-20 text-center text-app-muted">
          Loading draft…
        </main>
      </div>
    );
  }

  const activeDraft = draft;
  const activeQuestion = question;

  function patchDraft(payload: Partial<LaunchWizardDraft>) {
    updateLaunchDraft(activeDraft.id, {
      ...payload,
      lastQuestionId: activeQuestion.id
    });
  }

  function autoAdvance(payload: Partial<LaunchWizardDraft>) {
    patchDraft(payload);
    window.setTimeout(() => {
      goNext();
    }, 120);
  }

  function goNext() {
    if (currentIndex >= questions.length - 1) {
      setBuilding(true);
      updateLaunchDraft(activeDraft.id, {
        draftStatus: "review",
        lastQuestionId: activeQuestion.id
      });
      window.setTimeout(() => {
        router.push(`/studio/review/${activeDraft.id}`);
      }, 720);
      return;
    }

    const nextQuestion = questions[currentIndex + 1];
    updateLaunchDraft(activeDraft.id, { lastQuestionId: nextQuestion.id });
    setCurrentIndex((current) => current + 1);
  }

  function goBack() {
    if (currentIndex === 0) {
      router.push("/studio");
      return;
    }
    const previousQuestion = questions[currentIndex - 1];
    updateLaunchDraft(activeDraft.id, { lastQuestionId: previousQuestion.id });
    setCurrentIndex((current) => Math.max(0, current - 1));
  }

  const canContinue = validateQuestion(activeQuestion, activeDraft);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[760px] flex-col px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <header className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white transition hover:border-white/20"
              onClick={goBack}
              type="button"
            >
              ←
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white transition hover:border-white/20"
              onClick={() => router.push("/studio")}
              type="button"
            >
              ✕
            </button>
          </div>

          <WizardProgress current={currentIndex} total={questions.length} />
        </header>

        {building ? (
          <section className="flex flex-1 flex-col items-center justify-center">
            <div className="w-full max-w-[420px] space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-3xl font-semibold text-white">Building your draft…</p>
                <p className="text-sm text-app-muted">You can edit this in a second.</p>
              </div>
              <div className="surface-card-strong p-5">
                <div className="h-[220px] animate-pulse rounded-[24px] bg-white/[0.05]" />
                <div className="mt-4 h-8 w-2/3 animate-pulse rounded-full bg-white/[0.05]" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-white/[0.05]" />
                <div className="mt-6 h-12 w-full animate-pulse rounded-[18px] bg-white/[0.05]" />
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-1 flex-col justify-center py-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
                  {activeDraft.launchMode === "soft" ? "Soft launch" : "Happening"}
                </p>
                <h1 className="max-w-[12ch] text-[34px] font-semibold leading-tight text-white sm:text-[44px]">
                  {activeQuestion.title}
                </h1>
                {activeQuestion.helperText ? (
                  <p className="max-w-[34ch] text-sm leading-6 text-app-muted">{activeQuestion.helperText}</p>
                ) : null}
              </div>

              <div className="mt-8">
                <QuestionBody
                  autoAdvance={autoAdvance}
                  draft={activeDraft}
                  onTagInputChange={setTagInput}
                  question={activeQuestion}
                  tagInput={tagInput}
                  updateDraft={patchDraft}
                />
              </div>
            </section>

            {shouldShowContinue(activeQuestion) ? (
              <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] mt-6">
                <div className="rounded-[28px] border border-white/8 bg-[#0d1119]/94 p-3 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <button
                      className="min-h-[48px] flex-1 rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={!canContinue}
                      onClick={goNext}
                      type="button"
                    >
                      {currentIndex === questions.length - 1 ? "Review draft" : "Continue"}
                    </button>
                    <button
                      className="rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                      onClick={() => {
                        updateLaunchDraft(activeDraft.id, {
                          draftStatus: "saved" satisfies LaunchDraftStatus
                        });
                        router.push("/studio");
                      }}
                      type="button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

function QuestionBody({
  draft,
  question,
  tagInput,
  updateDraft,
  autoAdvance,
  onTagInputChange
}: {
  draft: LaunchWizardDraft;
  question: LaunchQuestionConfig;
  tagInput: string;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
  autoAdvance: (payload: Partial<LaunchWizardDraft>) => void;
  onTagInputChange: (value: string) => void;
}) {
  switch (question.id) {
    case "format":
      return (
        <div className="space-y-3">
          {launchFormatOptions.map((option) => (
            <LargeChoiceCard
              key={option}
              onClick={() => {
                if (option === "Other") {
                  updateDraft({ format: option, otherClosestFormat: undefined });
                  return;
                }
                autoAdvance({ format: option, otherClosestFormat: undefined });
              }}
              selected={draft.format === option}
              title={option}
            />
          ))}
          {draft.format === "Other" ? (
            <div className="surface-card mt-4 p-4">
              <p className="text-sm font-semibold text-white">Which is it closest to?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {otherClosestFormatOptions.map((option) => (
                  <FilterChip
                    active={draft.otherClosestFormat === option}
                    key={option}
                    label={option}
                    onClick={() => autoAdvance({ otherClosestFormat: option })}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      );
    case "sizeBucket":
      return (
        <div className="space-y-3">
          {sizeBucketOptions.map((option) => (
            <LargeChoiceCard
              key={option}
              onClick={() => autoAdvance({ sizeBucket: option })}
              selected={draft.sizeBucket === option}
              title={option}
            />
          ))}
        </div>
      );
    case "fandomTags":
    case "simpleFandoms":
    case "producedFandoms":
      return (
        <TagSearchInput
          selected={draft.fandomTags}
          suggestions={fandomSuggestionOptions}
          tagInput={tagInput}
          updateDraft={updateDraft}
          onTagInputChange={onTagInputChange}
        />
      );
    case "softTiming":
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {draft.dateOptions.map((option, index) => (
              <label className="block" key={option.id}>
                <span className="mb-2 block text-sm font-semibold text-white">Date option {index + 1}</span>
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
                  onChange={(event) => {
                    const nextOptions = draft.dateOptions.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            iso: event.target.value,
                            label: event.target.value ? formatFriendlyDate(event.target.value) : ""
                          }
                        : item
                    );
                    updateDraft({ dateOptions: nextOptions });
                  }}
                  type="date"
                  value={option.iso ? option.iso.slice(0, 10) : ""}
                />
              </label>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Time window</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {timeWindowOptions.map((option) => (
                <FilterChip
                  active={draft.timeWindow === option}
                  key={option}
                  label={toTitle(option)}
                  onClick={() => updateDraft({ timeWindow: option })}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Quick picks</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickDatePresets.map((option) => (
                <FilterChip
                  active={draft.quickDatePresets.includes(option)}
                  key={option}
                  label={toTitle(option)}
                  onClick={() =>
                    updateDraft({
                      quickDatePresets: draft.quickDatePresets.includes(option)
                        ? draft.quickDatePresets.filter((item) => item !== option)
                        : [...draft.quickDatePresets, option].slice(0, 4)
                    })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      );
    case "softLocation":
      return (
        <div className="space-y-4">
          <TextField
            label="City"
            onChange={(value) => updateDraft({ city: value })}
            placeholder="Los Angeles, CA"
            value={draft.city}
          />
          <TextField
            label="Neighborhood"
            onChange={(value) => updateDraft({ neighborhood: value })}
            placeholder="Koreatown"
            value={draft.neighborhood}
          />
          <ChipMultiSelect
            label="Venue type"
            max={3}
            onChange={(values) => updateDraft({ venueTypes: values as LaunchWizardDraft["venueTypes"] })}
            options={softVenueTypeOptions}
            selected={draft.venueTypes}
          />
        </div>
      );
    case "softThreshold":
      return (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-white">Minimum people needed</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {softMinimumPeopleOptions.map((option) => (
                <FilterChip
                  active={String(draft.minimumPeopleNeeded ?? "") === option}
                  key={option}
                  label={option}
                  onClick={() =>
                    updateDraft({
                      minimumPeopleNeeded: Number.parseInt(option.replace("+", ""), 10)
                    })
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">How should entry work?</p>
            <div className="mt-3 space-y-3">
              {softEntryOptions.map((option) => (
                <LargeChoiceCard
                  key={option}
                  onClick={() => updateDraft({ entryStyle: option })}
                  selected={draft.entryStyle === option}
                  title={toTitle(option)}
                />
              ))}
            </div>
          </div>
          {draft.entryStyle === "paid" ? (
            <ChipSingleSelect
              label="Price"
              onChange={(value) => updateDraft({ priceRange: value })}
              options={simplePriceOptions}
              selected={draft.priceRange}
            />
          ) : null}
          {isNightlifeOrLarge(draft) ? (
            <ChipSingleSelect
              label="Age gate"
              onChange={(value) => updateDraft({ ageGate: value as LaunchWizardDraft["ageGate"] })}
              options={ageGateOptions}
              selected={draft.ageGate}
            />
          ) : null}
        </div>
      );
    case "softHighlights":
      return (
        <ChipMultiSelect
          label="Choose up to six"
          max={6}
          onChange={(values) => updateDraft({ guestExperienceSelections: values })}
          options={softHighlightOptions}
          selected={draft.guestExperienceSelections}
        />
      );
    case "softAlreadySet":
      return (
        <AlreadySetQuestion
          draft={draft}
          label="Choose what is already in place"
          options={softAlreadySetOptions}
          updateDraft={updateDraft}
        />
      );
    case "softCoordination":
      return (
        <ChipMultiSelect
          label="Choose what matters most"
          max={5}
          onChange={(values) => updateDraft({ coordinationSelections: values })}
          options={coordinationOptions}
          selected={draft.coordinationSelections}
        />
      );
    case "softNotes":
    case "simpleNotes":
    case "producedNotes":
      return (
        <div className="block">
          <textarea
            aria-label="Additional notes"
            className="min-h-[180px] w-full rounded-[24px] border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-white outline-none placeholder:text-app-muted"
            onChange={(event) => updateDraft({ notes: event.target.value })}
            placeholder="Dress code, accessibility notes, giveaway plans, or anything that makes this night special"
            value={draft.notes}
          />
        </div>
      );
    case "simpleDateTime":
    case "producedDateTime":
      return (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Date</span>
            <input
              className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
              onChange={(event) => updateDraft({ confirmedDate: event.target.value })}
              type="date"
              value={draft.confirmedDate ?? ""}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Start time</span>
              <input
                className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
                onChange={(event) => updateDraft({ startTime: event.target.value })}
                type="time"
                value={draft.startTime ?? ""}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">End time</span>
              <input
                className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
                onChange={(event) => updateDraft({ endTime: event.target.value })}
                type="time"
                value={draft.endTime ?? ""}
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Quick times</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["2 PM", "4 PM", "6 PM", "7 PM", "8 PM"].map((chip) => (
                <FilterChip
                  active={draft.startTime === parseTimeChip(chip)}
                  key={chip}
                  label={chip}
                  onClick={() => updateDraft({ startTime: parseTimeChip(chip) })}
                />
              ))}
            </div>
          </div>
        </div>
      );
    case "simpleLocation":
      return (
        <div className="space-y-4">
          <TextField
            label="Venue name"
            onChange={(value) => updateDraft({ venueName: value })}
            placeholder="The Hideout Café"
            value={draft.venueName}
          />
          <TextField
            label="Neighborhood or city"
            onChange={(value) => updateDraft({ city: value })}
            placeholder="Pasadena, CA"
            value={draft.city}
          />
          {!draft.venueName ? (
            <ChipMultiSelect
              label="Venue type"
              max={2}
              onChange={(values) => updateDraft({ venueTypes: values as LaunchWizardDraft["venueTypes"] })}
              options={simpleVenueTypes}
              selected={draft.venueTypes}
            />
          ) : null}
        </div>
      );
    case "simpleAccess":
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {simpleEntryOptions.map((option) => (
              <LargeChoiceCard
                key={option}
                onClick={() => updateDraft({ entryStyle: option })}
                selected={draft.entryStyle === option}
                title={toTitle(option)}
              />
            ))}
          </div>
          {draft.entryStyle === "paid" ? (
            <ChipSingleSelect
              label="Price"
              onChange={(value) => updateDraft({ priceRange: value })}
              options={simplePriceOptions}
              selected={draft.priceRange}
            />
          ) : null}
          {draft.format === "Cupsleeve / café meetup" ? (
            <ChipSingleSelect
              label="Reservation or minimum spend"
              onChange={(value) => updateDraft({ reservationStyle: value as LaunchWizardDraft["reservationStyle"] })}
              options={reservationOptions}
              selected={draft.reservationStyle}
            />
          ) : null}
        </div>
      );
    case "simpleExpect":
      return (
        <ChipMultiSelect
          label="Choose what will feel most visible"
          max={6}
          onChange={(values) => updateDraft({ guestExperienceSelections: values })}
          options={simpleExpectOptions}
          selected={draft.guestExperienceSelections}
        />
      );
    case "simpleAlreadySet":
      return (
        <AlreadySetQuestion
          draft={draft}
          label="Choose what is already set"
          options={simpleAlreadySetOptions}
          updateDraft={updateDraft}
        />
      );
    case "producedVenue":
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {(["yes, it’s booked", "I’m deciding between places", "I still need one"] as const).map((option) => (
              <LargeChoiceCard
                key={option}
                onClick={() => updateDraft({ venueStatus: option })}
                selected={draft.venueStatus === option}
                title={toTitle(option)}
              />
            ))}
          </div>
          {draft.venueStatus === "yes, it’s booked" ? (
            <>
              <TextField
                label="Venue name"
                onChange={(value) => updateDraft({ venueName: value })}
                placeholder="The Fonda"
                value={draft.venueName}
              />
              <TextField
                label="Neighborhood or city"
                onChange={(value) => updateDraft({ city: value })}
                placeholder="Los Angeles, CA"
                value={draft.city}
              />
            </>
          ) : null}
          {draft.venueStatus && draft.venueStatus !== "yes, it’s booked" ? (
            <>
              <TextField
                label="City"
                onChange={(value) => updateDraft({ city: value })}
                placeholder="Los Angeles, CA"
                value={draft.city}
              />
              <ChipMultiSelect
                label="Preferred venue type"
                max={3}
                onChange={(values) => updateDraft({ venueTypes: values as LaunchWizardDraft["venueTypes"] })}
                options={producedVenueTypes}
                selected={draft.venueTypes}
              />
            </>
          ) : null}
        </div>
      );
    case "producedAccess":
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {producedEntryOptions.map((option) => (
              <LargeChoiceCard
                key={option}
                onClick={() => updateDraft({ entryStyle: option })}
                selected={draft.entryStyle === option}
                title={toTitle(option)}
              />
            ))}
          </div>
          {draft.entryStyle === "ticketed" ? (
            <ChipSingleSelect
              label="Price"
              onChange={(value) => updateDraft({ priceRange: value })}
              options={producedPriceOptions}
              selected={draft.priceRange}
            />
          ) : null}
          {isNightlifeOrLarge(draft) ? (
            <ChipSingleSelect
              label="Age gate"
              onChange={(value) => updateDraft({ ageGate: value as LaunchWizardDraft["ageGate"] })}
              options={ageGateOptions}
              selected={draft.ageGate}
            />
          ) : null}
        </div>
      );
    case "producedExpect":
      return (
        <ChipMultiSelect
          label="Choose the visible pieces"
          max={6}
          onChange={(values) => updateDraft({ guestExperienceSelections: values })}
          options={producedExpectOptions}
          selected={draft.guestExperienceSelections}
        />
      );
    case "producedBooked":
      return (
        <AlreadySetQuestion
          draft={draft}
          label="Choose what is already booked"
          options={producedAlreadySetOptions}
          updateDraft={updateDraft}
        />
      );
    case "producedCoordination":
      return (
        <ChipMultiSelect
          label="Choose the pressure points"
          max={5}
          onChange={(values) => updateDraft({ coordinationSelections: values })}
          options={producedCoordinationOptions}
          selected={draft.coordinationSelections}
        />
      );
    default:
      return null;
  }
}

function WizardProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }, (_, index) => (
          <div
            className={cn("h-2 rounded-full transition", index <= current ? "bg-app-purple" : "bg-white/[0.08]")}
            key={index}
          />
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-app-muted">
        Step {current + 1} of {total}
      </p>
    </div>
  );
}

function LargeChoiceCard({
  title,
  selected,
  onClick
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full rounded-[24px] border px-4 py-5 text-left text-base font-semibold transition",
        selected
          ? "border-app-purple/40 bg-app-purple/12 text-white shadow-[0_18px_48px_rgba(31,28,184,0.18)]"
          : "border-white/10 bg-white/[0.02] text-white hover:border-white/18"
      )}
      onClick={onClick}
      type="button"
    >
      {title}
    </button>
  );
}

function TagSearchInput({
  selected,
  suggestions,
  tagInput,
  onTagInputChange,
  updateDraft
}: {
  selected: string[];
  suggestions: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || selected.includes(clean) || selected.length >= 3) {
      return;
    }
    updateDraft({ fandomTags: [...selected, clean] });
    onTagInputChange("");
  }

  return (
    <div className="space-y-4">
      <div className="block">
        <input
          aria-label="Add fandom tag"
          className="w-full rounded-[24px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
          onChange={(event) => onTagInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag(tagInput);
            }
          }}
          placeholder="Search or add a tag"
          value={tagInput}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((tag) => (
          <FilterChip
            active={selected.includes(tag)}
            key={tag}
            label={tag}
            onClick={() => addTag(tag)}
          />
        ))}
      </div>
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <button
              className="rounded-full border border-app-purple/35 bg-app-purple/12 px-3 py-1.5 text-sm font-semibold text-white"
              key={tag}
              onClick={() => updateDraft({ fandomTags: selected.filter((item) => item !== tag) })}
              type="button"
            >
              {tag} ×
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TextField({
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
      <span className="mb-2 block text-sm font-semibold text-white">{label}</span>
      <input
        className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function ChipMultiSelect({
  label,
  options,
  selected,
  onChange,
  max
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
  max: number;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            active={selected.includes(option)}
            key={option}
            label={option}
            onClick={() =>
              onChange(
                selected.includes(option)
                  ? selected.filter((item) => item !== option)
                  : [...selected, option].slice(0, max)
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function ChipSingleSelect({
  label,
  options,
  selected,
  onChange
}: {
  label: string;
  options: readonly string[];
  selected?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            active={selected === option}
            key={option}
            label={toTitle(option)}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}

function AlreadySetQuestion({
  draft,
  options,
  updateDraft,
  label
}: {
  draft: LaunchWizardDraft;
  options: readonly string[];
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
  label: string;
}) {
  return (
    <div className="space-y-5">
      <ChipMultiSelect
        label={label}
        max={8}
        onChange={(values) => updateDraft({ alreadySetSelections: values })}
        options={options}
        selected={draft.alreadySetSelections}
      />

      {draft.alreadySetSelections.includes("venue") ? (
        <TextField
          label="Venue name"
          onChange={(value) => updateDraft({ venueName: value })}
          placeholder="Optional"
          value={draft.venueName}
        />
      ) : null}

      {draft.alreadySetSelections.includes("DJ / performers") || draft.alreadySetSelections.includes("lineup") ? (
        <ChipSingleSelect
          label="Lineup status"
          onChange={(value) => updateDraft({ lineupStatus: value as LaunchWizardDraft["lineupStatus"] })}
          options={lineupStatusOptions}
          selected={draft.lineupStatus}
        />
      ) : null}

      {draft.alreadySetSelections.includes("vendors") ? (
        <ChipSingleSelect
          label="Vendor count"
          onChange={(value) => updateDraft({ vendorCount: value as LaunchWizardDraft["vendorCount"] })}
          options={vendorCountOptions}
          selected={draft.vendorCount}
        />
      ) : null}
    </div>
  );
}

function validateQuestion(question: LaunchQuestionConfig, draft: LaunchWizardDraft) {
  switch (question.id) {
    case "format":
      return Boolean(draft.format && (draft.format !== "Other" || draft.otherClosestFormat));
    case "sizeBucket":
      return Boolean(draft.sizeBucket);
    case "fandomTags":
    case "simpleFandoms":
    case "producedFandoms":
      return draft.fandomTags.length > 0;
    case "softTiming":
      return draft.dateOptions.some((option) => option.iso) && Boolean(draft.timeWindow);
    case "softLocation":
      return Boolean(draft.city) && draft.venueTypes.length > 0;
    case "softThreshold":
      return Boolean(draft.minimumPeopleNeeded) &&
        Boolean(draft.entryStyle) &&
        (draft.entryStyle !== "paid" || Boolean(draft.priceRange)) &&
        (!isNightlifeOrLarge(draft) || Boolean(draft.ageGate));
    case "softHighlights":
    case "simpleExpect":
    case "producedExpect":
    case "softCoordination":
    case "producedCoordination":
      return draft.guestExperienceSelections.length > 0 || draft.coordinationSelections.length > 0;
    case "softAlreadySet":
    case "simpleAlreadySet":
    case "producedBooked":
      return draft.alreadySetSelections.length > 0;
    case "simpleDateTime":
    case "producedDateTime":
      return Boolean(draft.confirmedDate && draft.startTime);
    case "simpleLocation":
      return Boolean(draft.city || draft.venueName);
    case "simpleAccess":
      return Boolean(draft.entryStyle) &&
        (draft.entryStyle !== "paid" || Boolean(draft.priceRange)) &&
        (draft.format !== "Cupsleeve / café meetup" || Boolean(draft.reservationStyle));
    case "producedVenue":
      if (!draft.venueStatus) {
        return false;
      }
      if (draft.venueStatus === "yes, it’s booked") {
        return Boolean(draft.venueName && draft.city);
      }
      return Boolean(draft.city && draft.venueTypes.length > 0);
    case "producedAccess":
      return Boolean(draft.entryStyle) &&
        (draft.entryStyle !== "ticketed" || Boolean(draft.priceRange)) &&
        (!isNightlifeOrLarge(draft) || Boolean(draft.ageGate));
    default:
      return true;
  }
}

function shouldShowContinue(question: LaunchQuestionConfig) {
  return question.id !== "format" && question.id !== "sizeBucket";
}

function isNightlifeOrLarge(draft: LaunchWizardDraft) {
  return (
    draft.format === "Party / rave" ||
    draft.format === "Live show / performance" ||
    draft.sizeBucket === "101–250" ||
    draft.sizeBucket === "250+"
  );
}

function parseTimeChip(value: string) {
  const [hour, meridian] = value.split(" ");
  const numericHour = Number.parseInt(hour, 10);
  const normalized =
    meridian === "PM" && numericHour !== 12 ? numericHour + 12 : meridian === "AM" && numericHour === 12 ? 0 : numericHour;
  return `${String(normalized).padStart(2, "0")}:00`;
}

function formatFriendlyDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short"
  });
}

function toTitle(value: string) {
  return value
    .split(/[\s/-]+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}
