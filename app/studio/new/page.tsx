"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import { type LaunchDraftStatus, type LaunchWizardDraft } from "@/src/data/launch-builder";
import {
  BRIEF_STEPS,
  BriefBudgetStep,
  BriefCityStep,
  BriefEventTypeStep,
  BriefStepKey,
  BriefTimelineStep,
  BriefVisionStep,
  BriefWizardProgress,
  getLaunchModeLabel,
  getLaunchModeSubtitle,
  ProcessingStage
} from "@/src/features/studio-brief/components";
import {
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

  function patchDraft(payload: Parameters<typeof updateLaunchDraft>[1]) {
    updateLaunchDraft(activeDraft.id, payload);
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

    if (currentStep === BRIEF_STEPS.length - 1) {
      const visualDirectionSelections =
        activeDraft.visualDirectionSelections.length > 0
          ? activeDraft.visualDirectionSelections
          : inferVisualDirectionSelections({
              format: activeDraft.format,
              sizeBucket: activeDraft.sizeBucket,
              city: activeDraft.city,
              fandomTags: activeDraft.fandomTags,
              conceptVision: activeDraft.conceptVision
            });
      const deliverableSelections =
        activeDraft.deliverableSelections.length > 0
          ? activeDraft.deliverableSelections
          : inferDeliverablesFromBrief({
              format: activeDraft.format,
              sizeBucket: activeDraft.sizeBucket,
              city: activeDraft.city,
              fandomTags: activeDraft.fandomTags,
              conceptVision: activeDraft.conceptVision
            });
      const fandomTags =
        activeDraft.fandomTags.length > 0
          ? activeDraft.fandomTags
          : inferFandomTagsFromBrief({
              format: activeDraft.format,
              sizeBucket: activeDraft.sizeBucket,
              city: activeDraft.city,
              fandomTags: activeDraft.fandomTags,
              conceptVision: activeDraft.conceptVision
            });

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
      case "vision":
        return "Describe your event";
      case "event_type":
        return "Pick the event type";
      case "city":
        return "Where is this happening?";
      case "timeline":
        return "What's the timeline?";
      case "budget":
        return "What's the crew budget?";
      default:
        return "Build your brief";
    }
  })();

  const helperText = (() => {
    switch (activeStep) {
      case "vision":
        return "Start with the concept. We’ll use it to infer the crew and creative direction.";
      case "event_type":
        return "Choose the closest event format and expected crowd size.";
      case "city":
        return "A city is enough to start building the right local team.";
      case "timeline":
        return "Give us the date, duration, and whether the timing is still flexible.";
      case "budget":
        return "We’ll balance role coverage and starting rates against this number.";
      default:
        return undefined;
    }
  })();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto flex h-[calc(100vh-88px)] w-full max-w-[760px] flex-col overflow-hidden px-4 pb-24 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
        <header className="space-y-4">
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
          <>
            <section className="flex flex-1 flex-col justify-center py-3">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
                  {getLaunchModeLabel(activeDraft.launchMode)}
                </p>
                <h1 className="max-w-[12ch] text-[30px] font-semibold leading-tight text-white sm:text-[40px]">
                  {title}
                </h1>
                <p className="max-w-[34ch] text-sm leading-6 text-app-muted">{helperText}</p>
                <p className="text-sm text-white/58">{getLaunchModeSubtitle(activeDraft.launchMode)}</p>
              </div>

              <div className="mt-5">
                {activeStep === "vision" ? (
                  <BriefVisionStep draft={activeDraft} updateDraft={patchDraft} />
                ) : null}
                {activeStep === "event_type" ? (
                  <BriefEventTypeStep draft={activeDraft} updateDraft={patchDraft} />
                ) : null}
                {activeStep === "city" ? (
                  <BriefCityStep draft={activeDraft} updateDraft={patchDraft} />
                ) : null}
                {activeStep === "timeline" ? (
                  <BriefTimelineStep draft={activeDraft} updateDraft={patchDraft} />
                ) : null}
                {activeStep === "budget" ? (
                  <BriefBudgetStep draft={activeDraft} updateDraft={patchDraft} />
                ) : null}
              </div>
            </section>

            <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] mt-6">
              <div className="rounded-[28px] border border-white/8 bg-[#0d1119]/94 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <button
                    className="min-h-[48px] flex-1 rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={!canContinue}
                    onClick={goNext}
                    type="button"
                  >
                    {currentStep === BRIEF_STEPS.length - 1 ? "Build crew plan" : "Continue"}
                  </button>
                  <button
                    className="rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                    onClick={() => {
                      updateLaunchDraft(activeDraft.id, {
                        draftStatus: "saved" satisfies LaunchDraftStatus
                      });
                      router.push(APP_ROUTES.launch);
                    }}
                    type="button"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function resolveCurrentStep(draft: LaunchWizardDraft) {
  if (!draft.conceptVision.trim()) {
    return 0;
  }
  if (!draft.format || !draft.sizeBucket) {
    return 1;
  }
  if (!draft.city.trim()) {
    return 2;
  }
  if ((!draft.briefStartDate && !draft.briefDateFlexible) || !draft.briefDurationDays) {
    return 3;
  }
  if (!draft.crewBudgetRange) {
    return 4;
  }

  return 4;
}

function validateStep(step: BriefStepKey, draft: LaunchWizardDraft) {
  switch (step) {
    case "vision":
      return draft.conceptVision.trim().length > 24;
    case "event_type":
      return Boolean(draft.format && draft.sizeBucket);
    case "city":
      return draft.city.trim().length > 1;
    case "timeline":
      return Boolean((draft.briefStartDate || draft.briefDateFlexible) && draft.briefDurationDays);
    case "budget":
      return Boolean(draft.crewBudgetRange);
    default:
      return false;
  }
}
