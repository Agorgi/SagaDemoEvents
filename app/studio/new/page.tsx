"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import { type LaunchDraftStatus, type LaunchWizardDraft } from "@/src/data/launch-builder";
import {
  BRIEF_STEPS,
  BriefBudgetTimelineStep,
  BriefDeliverablesStep,
  BriefFoundationStep,
  BriefInspirationSwipeStep,
  BriefStepKey,
  BriefVisualDirectionStep,
  BriefWizardProgress,
  getLaunchModeLabel,
  ProcessingStage
} from "@/src/features/studio-brief/components";
import {
  deriveSwipeDeliverables,
  deriveSwipeVisualDirectionSelections,
  inferDeliverablesFromBrief,
  inferFandomTagsFromBrief,
  inferVisualDirectionSelections
} from "@/src/data/crew-plan";
import { useAppState } from "@/src/lib/app-state";
import { APP_ROUTES } from "@/src/lib/routes";

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
  const { homeCity, launchDrafts, mode, setMode, startLaunchDraft, updateLaunchDraft } = useAppState();
  const draftId = searchParams.get("draft");
  const modeParam = searchParams.get("mode") as "soft" | "happening" | null;
  const [bootDraftId, setBootDraftId] = useState<string | null>(draftId);
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processingMessageIndex, setProcessingMessageIndex] = useState(0);
  const initializedDraftId = useRef<string | null>(null);

  const resolvedDraftId = draftId ?? bootDraftId;
  const draft = launchDrafts.find((item) => item.id === resolvedDraftId);

  useEffect(() => {
    if (mode !== "host") {
      setMode("host");
    }
  }, [mode, setMode]);

  useEffect(() => {
    if (draftId) {
      setBootDraftId(draftId);
      return;
    }

    if (!modeParam || bootDraftId) {
      return;
    }

    const nextDraftId = startLaunchDraft(modeParam);
    setBootDraftId(nextDraftId);
    router.replace(`${APP_ROUTES.launch}/new?draft=${nextDraftId}`);
  }, [bootDraftId, draftId, modeParam, router, startLaunchDraft]);

  useEffect(() => {
    if (!resolvedDraftId && !modeParam) {
      router.replace(APP_ROUTES.launch);
    }
  }, [modeParam, resolvedDraftId, router]);

  useEffect(() => {
    if (!draft) {
      return;
    }

    if (initializedDraftId.current !== draft.id) {
      initializedDraftId.current = draft.id;
      setCurrentStep(resolveCurrentStep(draft));
    }
  }, [draft]);

  useEffect(() => {
    if (!draft || draft.city || !homeCity) {
      return;
    }

    updateLaunchDraft(draft.id, {
      city: homeCity
    });
  }, [draft, homeCity, updateLaunchDraft]);

  useEffect(() => {
    if (!processing || !draft) {
      return;
    }

    const interval = window.setInterval(() => {
      setProcessingMessageIndex((current) => (current + 1) % 4);
    }, 620);
    const timeout = window.setTimeout(() => {
      router.push(`/studio/crew-plan/${draft.id}`);
    }, 2600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [draft, processing, router]);

  if (!draft) {
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
  const activeStep = BRIEF_STEPS[currentStep];
  const canContinue = validateStep(activeStep, activeDraft);

  function getBriefInferenceSource(draft: LaunchWizardDraft) {
    return {
      format: draft.format,
      sizeBucket: draft.sizeBucket,
      city: draft.city,
      fandomTags: draft.fandomTags,
      conceptVision: draft.conceptVision,
      likedInspirationIds: draft.likedInspirationIds
    };
  }

  function patchDraft(payload: Parameters<typeof updateLaunchDraft>[1]) {
    updateLaunchDraft(activeDraft.id, payload);
  }

  function seedSwipeDrivenSelections(
    draft: LaunchWizardDraft,
    options?: {
      forceSkip?: boolean;
    }
  ) {
    const inferenceSource = getBriefInferenceSource(draft);
    const preselectedStyles =
      draft.likedInspirationIds.length > 0
        ? deriveSwipeVisualDirectionSelections(draft.likedInspirationIds, inferenceSource).slice(0, 2)
        : inferVisualDirectionSelections(inferenceSource).slice(0, 2);
    const preselectedDeliverables =
      draft.likedInspirationIds.length > 0
        ? deriveSwipeDeliverables(draft.likedInspirationIds, inferenceSource).slice(0, 5)
        : inferDeliverablesFromBrief(inferenceSource).slice(0, 5);

    patchDraft({
      inspirationStepSkipped: options?.forceSkip ? true : draft.inspirationStepSkipped,
      visualDirectionSelections:
        draft.visualDirectionSelections.length >= 2 ? draft.visualDirectionSelections : preselectedStyles,
      deliverableSelections:
        draft.deliverableSelections.length > 0 ? draft.deliverableSelections : preselectedDeliverables
    });
  }

  function goBack() {
    if (processing) {
      return;
    }

    if (currentStep === 0) {
      router.push(APP_ROUTES.launch);
      return;
    }

    setCurrentStep((step) => Math.max(0, step - 1));
  }

  function goNext() {
    if (!canContinue || processing) {
      return;
    }

    if (activeStep === "inspiration") {
      seedSwipeDrivenSelections(activeDraft);
      setCurrentStep((step) => Math.min(BRIEF_STEPS.length - 1, step + 1));
      return;
    }

    if (currentStep === BRIEF_STEPS.length - 1) {
      const inferenceSource = getBriefInferenceSource(activeDraft);
      const visualDirectionSelections =
        activeDraft.visualDirectionSelections.length > 0
          ? activeDraft.visualDirectionSelections
          : inferVisualDirectionSelections(inferenceSource);
      const deliverableSelections =
        activeDraft.deliverableSelections.length > 0
          ? activeDraft.deliverableSelections
          : inferDeliverablesFromBrief(inferenceSource);
      const fandomTags =
        activeDraft.fandomTags.length > 0
          ? activeDraft.fandomTags
          : inferFandomTagsFromBrief(inferenceSource);

      patchDraft({
        fandomTags,
        visualDirectionSelections,
        deliverableSelections,
        draftStatus: "review" satisfies LaunchDraftStatus
      });
      setProcessingMessageIndex(0);
      setProcessing(true);
      return;
    }

    setCurrentStep((step) => Math.min(BRIEF_STEPS.length - 1, step + 1));
  }

  const title = (() => {
    switch (activeStep) {
      case "foundation":
        return "Describe your event";
      case "inspiration":
        return "Events like yours";
      case "visual_direction":
        return "What's the vibe?";
      case "budget_timeline":
        return "Budget and dates";
      case "deliverables":
        return "What do you need covered?";
      default:
        return "Build your brief";
    }
  })();

  const helperText = (() => {
    switch (activeStep) {
      case "foundation":
        return "Pick the format, expected crowd, and the core idea. We’ll use it to shape the crew plan.";
      case "inspiration":
        return "Swipe right on the examples that feel closest to what you want to make.";
      case "visual_direction":
        return "Pick 2–3 styles that match the taste you’re aiming for.";
      case "budget_timeline":
        return "Tell us where it’s happening, when it’s happening, and the budget we’re balancing against.";
      case "deliverables":
        return "We’ll use this to identify the right roles and creator fits.";
      default:
        return undefined;
    }
  })();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="onboarding-shell mx-auto h-[calc(100dvh-88px)] overflow-hidden px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="onboarding-stage mx-auto flex h-full w-full max-w-[640px] flex-col">
          <header className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-white transition hover:bg-white/[0.07]"
                onClick={goBack}
                type="button"
              >
                ←
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-white transition hover:bg-white/[0.07]"
                onClick={() => router.push(APP_ROUTES.launch)}
                type="button"
              >
                ✕
              </button>
            </div>

            <BriefWizardProgress current={currentStep} />
          </header>

          {processing ? (
            <ProcessingStage
              messageIndex={processingMessageIndex}
              title="Building your crew plan..."
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <section className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pb-28 pt-5 md:pb-8">
                <div className="space-y-3 pb-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-muted">
                    {getLaunchModeLabel(activeDraft.launchMode)}
                  </p>
                  <h1 className="max-w-[12ch] text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-[44px]">
                    {title}
                  </h1>
                  <p className="max-w-[36ch] text-[15px] leading-7 text-app-muted sm:text-base">
                    {helperText}
                  </p>
                </div>

                <div className="pb-8">
                  {activeStep === "foundation" ? (
                    <BriefFoundationStep draft={activeDraft} updateDraft={patchDraft} />
                  ) : null}
                  {activeStep === "inspiration" ? (
                    <BriefInspirationSwipeStep
                      draft={activeDraft}
                      onSkip={() => {
                        seedSwipeDrivenSelections(activeDraft, { forceSkip: true });
                        setCurrentStep((step) => Math.min(BRIEF_STEPS.length - 1, step + 1));
                      }}
                      updateDraft={patchDraft}
                    />
                  ) : null}
                  {activeStep === "visual_direction" ? (
                    <BriefVisualDirectionStep draft={activeDraft} updateDraft={patchDraft} />
                  ) : null}
                  {activeStep === "budget_timeline" ? (
                    <BriefBudgetTimelineStep draft={activeDraft} updateDraft={patchDraft} />
                  ) : null}
                  {activeStep === "deliverables" ? (
                    <BriefDeliverablesStep draft={activeDraft} updateDraft={patchDraft} />
                  ) : null}
                </div>
              </section>

              <div className="hidden shrink-0 bg-[linear-gradient(180deg,rgba(9,11,16,0),rgba(9,11,16,0.82)_26%,rgba(9,11,16,0.98))] pb-6 pt-4 md:block">
                <div>
                  <button
                    className="min-h-[52px] w-full rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(31,28,184,0.26)] transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={!canContinue}
                    onClick={goNext}
                    type="button"
                  >
                    {currentStep === BRIEF_STEPS.length - 1 ? "Build crew plan" : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {!processing ? (
          <button
            aria-label={currentStep === BRIEF_STEPS.length - 1 ? "Build crew plan" : "Continue"}
            className="fixed bottom-[calc(4.9rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-app-purple text-xl text-white shadow-[0_18px_42px_rgba(31,28,184,0.32)] transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-45 md:hidden"
            disabled={!canContinue}
            onClick={goNext}
            type="button"
          >
            →
          </button>
        ) : null}
      </main>
    </div>
  );
}

function resolveCurrentStep(draft: LaunchWizardDraft) {
  if (!draft.conceptVision.trim() || !draft.format || !draft.sizeBucket) {
    return 0;
  }

  const swipeCount = draft.likedInspirationIds.length + draft.passedInspirationIds.length;
  if (!draft.inspirationStepSkipped && swipeCount < 4) {
    return 1;
  }

  if (draft.visualDirectionSelections.length < 2) {
    return 2;
  }

  if (!draft.city.trim() || (!draft.briefStartDate && !draft.briefDateFlexible) || !draft.briefDurationDays || !draft.crewBudgetRange) {
    return 3;
  }

  if (!draft.deliverableSelections.length) {
    return 4;
  }

  return 4;
}

function validateStep(step: BriefStepKey, draft: LaunchWizardDraft) {
  switch (step) {
    case "foundation":
      return Boolean(draft.format && draft.sizeBucket && draft.conceptVision.trim().length > 24);
    case "inspiration":
      return draft.inspirationStepSkipped || draft.likedInspirationIds.length + draft.passedInspirationIds.length >= 4;
    case "visual_direction":
      return draft.visualDirectionSelections.length >= 2;
    case "budget_timeline":
      return Boolean(draft.city.trim() && (draft.briefStartDate || draft.briefDateFlexible) && draft.briefDurationDays && draft.crewBudgetRange);
    case "deliverables":
      return draft.deliverableSelections.length > 0;
    default:
      return false;
  }
}
