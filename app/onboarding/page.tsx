"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { OnboardingScreenShell, StickyFooter } from "@/src/components/OnboardingScreenShell";
import {
  getOnboardingLandingPath,
  getOnboardingQuestions,
  resolveBranch,
  type OnboardingState
} from "@/src/data/onboarding";
import { QuestionRenderer } from "@/src/features/onboarding/QuestionRenderer";
import {
  buildOnboardingAnswerUpdate,
  getCanContinue,
  getPrimaryButtonLabel,
  resolveQuestionCopy,
  shouldShowFooter
} from "@/src/features/onboarding/utils";
import { useAppState } from "@/src/lib/app-state";
import { APP_ROUTES } from "@/src/lib/routes";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <OnboardingPageContent />
    </Suspense>
  );
}

function OnboardingPageContent() {
  const router = useRouter();
  const {
    hydrated,
    onboarding,
    completeOnboarding,
    updateOnboarding
  } = useAppState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [codeValue, setCodeValue] = useState(
    typeof onboarding.answers.verify === "string" ? onboarding.answers.verify : ""
  );
  const [building, setBuilding] = useState(false);
  const initializedStepId = useRef<string | null>(null);

  const questions = useMemo(() => getOnboardingQuestions(onboarding), [onboarding]);
  const question = questions[currentIndex];

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (onboarding.completed || onboarding.hasCompletedOnboarding) {
      router.replace(getOnboardingLandingPath(onboarding.primaryBranch));
    }
  }, [
    hydrated,
    onboarding.completed,
    onboarding.hasCompletedOnboarding,
    onboarding.primaryBranch,
    router
  ]);

  useEffect(() => {
    if (!questions.length) {
      return;
    }

    if (initializedStepId.current !== onboarding.lastStepId) {
      initializedStepId.current = onboarding.lastStepId ?? questions[0]?.id ?? null;
      const index =
        onboarding.lastStepId != null
          ? questions.findIndex((item) => item.id === onboarding.lastStepId)
          : 0;
      setCurrentIndex(index >= 0 ? index : 0);
      return;
    }

    setCurrentIndex((current) => Math.min(current, Math.max(questions.length - 1, 0)));
  }, [onboarding.lastStepId, questions]);

  if (!hydrated || !question) {
    return <div className="min-h-screen bg-app-bg" />;
  }

  function patchOnboarding(
    payload: Partial<OnboardingState>,
    answerId?: string,
    answerValue?: unknown
  ) {
    updateOnboarding({
      ...payload,
      lastStepId: question.id,
      answers:
        answerId != null
          ? {
              ...onboarding.answers,
              [answerId]: answerValue
            }
          : onboarding.answers
    });
  }

  function applyAnswer(questionId: string, value: unknown) {
    const next = buildOnboardingAnswerUpdate(questionId, value, onboarding);
    patchOnboarding(next.payload, next.answerId, next.answerValue);
  }

  function goNext() {
    if (currentIndex >= questions.length - 1) {
      handleCompletion();
      return;
    }

    const nextQuestion = questions[currentIndex + 1];
    updateOnboarding({ lastStepId: nextQuestion.id });
    setCurrentIndex((current) => current + 1);
  }

  function goBack() {
    if (currentIndex === 0) {
      setCodeValue("");
      updateOnboarding({
        lastStepId: questions[0]?.id,
        answers: onboarding.answers
      });
      return;
    }
    const previousQuestion = questions[currentIndex - 1];
    updateOnboarding({ lastStepId: previousQuestion.id });
    setCurrentIndex((current) => Math.max(0, current - 1));
  }

  function handleClose() {
    const primaryBranch =
      onboarding.primaryBranch ??
      resolveBranch(onboarding.primaryIntent, onboarding.collaborationRoute) ??
      "explorer";

    completeOnboarding({
      ...onboarding,
      phoneNumber: onboarding.phoneNumber || "+1 310 555 0199",
      displayName: onboarding.displayName || "Kai",
      city: onboarding.city || "Los Angeles, CA",
      selectedIntents:
        onboarding.selectedIntents.length > 0 ? onboarding.selectedIntents : ["explore"],
      primaryIntent: onboarding.primaryIntent ?? "explore",
      primaryBranch,
      usedSampleProfile: true,
      lastStepId: question.id
    });

    router.replace(APP_ROUTES.home);
  }

  function handleCompletion() {
    setBuilding(true);
    const primaryBranch =
      onboarding.primaryBranch ??
      resolveBranch(onboarding.primaryIntent, onboarding.collaborationRoute) ??
      "explorer";

    completeOnboarding({
      ...onboarding,
      primaryBranch,
      lastStepId: question.id
    });

    window.setTimeout(() => {
      router.replace(getOnboardingLandingPath(primaryBranch));
    }, 520);
  }

  function handleSkip() {
    if (question.inputType === "social-connect") {
      goNext();
      return;
    }

    if (question.inputType === "short-text" && question.id === "talentPortfolio") {
      applyAnswer(question.id, "");
      goNext();
      return;
    }

    goNext();
  }

  const canContinue = getCanContinue(question, onboarding, codeValue);
  const resolvedQuestion = resolveQuestionCopy(question, onboarding);

  if (building) {
    return (
      <OnboardingScreenShell
        current={questions.length - 1}
        onBack={() => {}}
        onClose={() => {}}
        title="You’re in"
        total={questions.length}
      >
        <div className="onboarding-success-card surface-card-strong mx-auto w-full max-w-[460px] p-5">
          <div className="relative z-[1] h-[220px] animate-pulse overflow-hidden rounded-[26px] bg-[linear-gradient(180deg,rgba(31,28,184,0.2),rgba(13,17,25,0.96))]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_42%)]" />
          </div>
          <div className="relative z-[1] mt-4 h-7 w-2/3 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="relative z-[1] mt-3 h-4 w-1/2 animate-pulse rounded-full bg-white/[0.05]" />
        </div>
      </OnboardingScreenShell>
    );
  }

  return (
    <OnboardingScreenShell
      current={currentIndex}
      onBack={goBack}
      onClose={handleClose}
      onSkip={question.skippable ? handleSkip : undefined}
      skippable={Boolean(question.skippable)}
      subcopy={resolvedQuestion.subcopy}
      title={resolvedQuestion.title}
      total={questions.length}
      footer={
        shouldShowFooter(question) ? (
          <StickyFooter
            onPrimary={goNext}
            primaryDisabled={!canContinue}
            primaryLabel={getPrimaryButtonLabel(question, onboarding)}
          />
        ) : undefined
      }
    >
      <div className="onboarding-question-enter">
        <QuestionRenderer
          codeValue={codeValue}
          onboarding={onboarding}
          onAutoAdvance={goNext}
          question={question}
          setCodeValue={setCodeValue}
          onAnswer={applyAnswer}
        />
      </div>
    </OnboardingScreenShell>
  );
}
