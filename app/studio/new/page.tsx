"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import {
  getLaunchQuestions,
  type LaunchDraftStatus,
  type LaunchModeType,
  type LaunchWizardDraft
} from "@/src/data/launch-builder";
import { QuestionBody, WizardProgress } from "@/src/features/launch-wizard/components";
import { shouldShowContinue, validateQuestion } from "@/src/features/launch-wizard/utils";
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
  const {
    currentCreatorProfile,
    launchDrafts,
    mode,
    setMode,
    startLaunchDraft,
    updateLaunchDraft
  } = useAppState();
  const draftId = searchParams.get("draft");
  const modeParam = searchParams.get("mode") as LaunchModeType | null;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [building, setBuilding] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [bootDraftId, setBootDraftId] = useState<string | null>(draftId);
  const initializedDraftId = useRef<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const resolvedDraftId = draftId ?? bootDraftId;
  const draft = launchDrafts.find((item) => item.id === resolvedDraftId);
  const questions = useMemo(() => (draft ? getLaunchQuestions(draft) : []), [draft]);
  const question = questions[currentIndex];

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
      router.push(APP_ROUTES.launch);
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
              onClick={() => router.push(APP_ROUTES.launch)}
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
                  portfolioItems={currentCreatorProfile?.portfolio ?? []}
                  question={activeQuestion}
                  tagInput={tagInput}
                  uploadInputRef={uploadInputRef}
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
                        router.push(APP_ROUTES.launch);
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
