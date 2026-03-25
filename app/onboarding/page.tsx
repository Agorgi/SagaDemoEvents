"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingChoiceCard,
  OnboardingScreenShell,
  StickyFooter
} from "@/src/components/OnboardingScreenShell";
import { SocialConnectOptions } from "@/src/components/SocialConnectOptions";
import {
  citySuggestions,
  getOnboardingLandingPath,
  getOnboardingQuestions,
  labelIntent,
  mockVerifyPhoneCode,
  primaryIntentOptions,
  resolveBranch,
  sharedTagSuggestions,
  type OnboardingBranch,
  type OnboardingIntent,
  type OnboardingQuestionConfig,
  type OnboardingState
} from "@/src/data/onboarding";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

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

  function resolvePrimaryIntentSelection(selectedIntents: OnboardingIntent[]) {
    const primaryIntent = selectedIntents.length === 1 ? selectedIntents[0] : onboarding.primaryIntent;
    const secondaryIntent =
      selectedIntents.length === 2
        ? onboarding.secondaryIntent
        : selectedIntents.length === 1
          ? null
          : onboarding.secondaryIntent;
    const primaryBranch =
      selectedIntents.length === 1
        ? resolveBranch(primaryIntent, onboarding.collaborationRoute)
        : onboarding.primaryBranch;

    patchOnboarding(
      {
        selectedIntents,
        primaryIntent,
        secondaryIntent,
        primaryBranch,
        collaborationIntent: selectedIntents.includes("find_collaborators")
      },
      "intentSelection",
      selectedIntents
    );
  }

  function applyAnswer(questionId: string, value: unknown) {
    switch (questionId) {
      case "phone":
        patchOnboarding(
          {
            authMethod: "phone",
            phoneNumber: typeof value === "string" ? value : onboarding.phoneNumber
          },
          "phone",
          value
        );
        return;
      case "verify":
        patchOnboarding({}, "verify", value);
        return;
      case "displayName":
        patchOnboarding(
          { displayName: typeof value === "string" ? value : onboarding.displayName },
          "displayName",
          value
        );
        return;
      case "intentSelection":
        resolvePrimaryIntentSelection(Array.isArray(value) ? (value as OnboardingIntent[]) : []);
        return;
      case "intentPriority": {
        const selected = onboarding.selectedIntents;
        const primaryIntent = value as OnboardingIntent;
        const secondaryIntent =
          selected.find((item) => item !== primaryIntent) ?? null;
        const primaryBranch = resolveBranch(primaryIntent, onboarding.collaborationRoute);
        patchOnboarding(
          {
            primaryIntent,
            secondaryIntent,
            primaryBranch,
            collaborationIntent: selected.includes("find_collaborators")
          },
          "intentPriority",
          value
        );
        return;
      }
      case "location": {
        const nextValue = value as { city: string; neighborhood: string };
        patchOnboarding(
          {
            city: nextValue.city,
            neighborhood: nextValue.neighborhood
          },
          "location",
          nextValue
        );
        return;
      }
      case "collaborationRoute": {
        const branch = value as OnboardingBranch;
        patchOnboarding(
          {
            collaborationIntent: true,
            collaborationRoute: branch,
            primaryBranch: branch
          },
          "collaborationRoute",
          value
        );
        return;
      }
      case "explorerFandoms":
      case "addonExplorerFandoms":
      case "talentScenes":
      case "organizerScenes":
        patchOnboarding(
          { fandomTags: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "explorerEventTypes":
      case "addonExplorerEventTypes":
        patchOnboarding(
          { eventTypePreferences: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "explorerStyle":
        patchOnboarding(
          { outingStyleTags: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "talentSkills":
      case "addonTalentSkills":
        patchOnboarding(
          { skills: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "talentExperience":
        patchOnboarding(
          { experienceLevel: value as OnboardingState["experienceLevel"] },
          questionId,
          value
        );
        return;
      case "talentEventTypes":
        patchOnboarding(
          { workEventTypes: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "talentTravel":
        patchOnboarding(
          { travelRadius: value as OnboardingState["travelRadius"] },
          questionId,
          value
        );
        return;
      case "talentOpenness":
        patchOnboarding(
          { workOpenness: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "talentPortfolio":
        patchOnboarding(
          { portfolioLink: typeof value === "string" ? value : "" },
          questionId,
          value
        );
        return;
      case "organizerGoal":
        patchOnboarding(
          { organizerGoal: value as OnboardingState["organizerGoal"] },
          questionId,
          value
        );
        return;
      case "organizerExperience":
        patchOnboarding(
          { organizerExperience: value as OnboardingState["organizerExperience"] },
          questionId,
          value
        );
        return;
      case "organizerEventTypes":
      case "addonOrganizerEventTypes":
        patchOnboarding(
          { organizerEventTypes: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "organizerSupport":
        patchOnboarding(
          { organizerSupportNeeds: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "organizerCollabTargets":
        patchOnboarding(
          { organizerCollabTargets: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "organizerMotion":
        patchOnboarding(
          {
            organizerHasSomethingInMotion:
              value as OnboardingState["organizerHasSomethingInMotion"]
          },
          questionId,
          value
        );
        return;
      case "businessType":
      case "addonBusinessType":
        patchOnboarding(
          { businessType: typeof value === "string" ? value : undefined },
          questionId,
          value
        );
        return;
      case "businessGoals":
        patchOnboarding(
          { businessGoals: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "businessScenes":
        patchOnboarding(
          { businessSceneTags: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "businessNeeds":
        patchOnboarding(
          { businessTalentNeeds: Array.isArray(value) ? value : [] },
          questionId,
          value
        );
        return;
      case "businessSizeFit":
        patchOnboarding(
          { businessSizeFit: value as OnboardingState["businessSizeFit"] },
          questionId,
          value
        );
        return;
      case "socials":
        patchOnboarding(
          { socials: (value as OnboardingState["socials"]) ?? [] },
          questionId,
          value
        );
        return;
      case "secondaryAddonPrompt":
        patchOnboarding(
          {
            secondaryAddOnStatus: value === "yes" ? "accepted" : "skipped"
          },
          questionId,
          value
        );
        return;
      default:
        patchOnboarding({}, questionId, value);
    }
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
    setCurrentIndex(0);
    updateOnboarding({ lastStepId: questions[0]?.id });
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
        <div className="surface-card-strong mx-auto w-full max-w-[460px] p-5">
          <div className="h-[220px] animate-pulse rounded-[26px] bg-white/[0.05]" />
          <div className="mt-4 h-7 w-2/3 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-white/[0.05]" />
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
      <QuestionRenderer
        codeValue={codeValue}
        onboarding={onboarding}
        onAutoAdvance={goNext}
        question={question}
        setCodeValue={setCodeValue}
        onAnswer={applyAnswer}
      />
    </OnboardingScreenShell>
  );
}

function QuestionRenderer({
  question,
  onboarding,
  codeValue,
  setCodeValue,
  onAutoAdvance,
  onAnswer
}: {
  question: OnboardingQuestionConfig;
  onboarding: OnboardingState;
  codeValue: string;
  setCodeValue: (value: string) => void;
  onAutoAdvance: () => void;
  onAnswer: (questionId: string, value: unknown) => void;
}) {
  switch (question.inputType) {
    case "phone":
      return (
        <PhoneField
          value={onboarding.phoneNumber}
          onChange={(value) => onAnswer("phone", value)}
        />
      );
    case "code":
      return (
        <CodeField
          value={codeValue}
          onChange={(value) => {
            setCodeValue(value);
            onAnswer("verify", value);
          }}
        />
      );
    case "short-text":
      return (
        <ShortTextField
          placeholder={getShortTextPlaceholder(question.id)}
          value={getShortTextValue(question.id, onboarding)}
          onChange={(value) => onAnswer(question.id, value)}
        />
      );
    case "intent-multi":
      return (
        <IntentSelectionField onboarding={onboarding} onAnswer={onAnswer} />
      );
    case "intent-priority":
      return (
        <div className="space-y-3">
          {onboarding.selectedIntents.map((intent) => (
            <OnboardingChoiceCard
              description={undefined}
              key={intent}
              onClick={() => {
                onAnswer("intentPriority", intent);
                window.setTimeout(() => onAutoAdvance(), 120);
              }}
              title={primaryIntentOptions.find((option) => option.value === intent)?.label ?? intent}
            />
          ))}
        </div>
      );
    case "city-search":
      return (
        <LocationField onboarding={onboarding} onAnswer={onAnswer} />
      );
    case "single-card":
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <OnboardingChoiceCard
              description={option.description}
              key={option.value}
              onClick={() => {
                onAnswer(question.id, option.value);
                window.setTimeout(() => onAutoAdvance(), 120);
              }}
              selected={isSingleValueSelected(question.id, option.value, onboarding)}
              title={option.label}
            />
          ))}
        </div>
      );
    case "multi-chip":
      return (
        <ChipSelectionField
          maxSelections={question.maxSelections}
          options={question.options ?? []}
          selected={getMultiValue(question.id, onboarding)}
          onChange={(value) => onAnswer(question.id, value)}
        />
      );
    case "tag-search":
      return (
        <TagSearchField
          maxSelections={question.maxSelections ?? 5}
          placeholder="Search or add your own"
          selected={getTagValue(question.id, onboarding)}
          suggestions={sharedTagSuggestions}
          onChange={(value) => onAnswer(question.id, value)}
        />
      );
    case "social-connect":
      return (
        <SocialConnectOptions
          onChange={(next) => onAnswer("socials", next)}
          socials={onboarding.socials}
        />
      );
    case "secondary-addon":
      return (
        <div className="space-y-3">
          <OnboardingChoiceCard
            onClick={() => {
              onAnswer(question.id, "yes");
              window.setTimeout(() => onAutoAdvance(), 120);
            }}
            title={`Yes, set up ${labelIntent(onboarding.secondaryIntent)} too`}
          />
          <OnboardingChoiceCard
            compact
            onClick={() => {
              onAnswer(question.id, "later");
              window.setTimeout(() => onAutoAdvance(), 120);
            }}
            title="Maybe later"
          />
        </div>
      );
    case "completion":
      return (
        <div className="surface-card-strong overflow-hidden p-5">
          <div className="relative h-[220px] overflow-hidden rounded-[24px] bg-[#111627]">
            <img
              alt="Saga"
              className="h-full w-full object-cover opacity-70"
              src="/group-88462-v2.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/25 to-transparent" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

function IntentSelectionField({
  onboarding,
  onAnswer
}: {
  onboarding: OnboardingState;
  onAnswer: (questionId: string, value: string | string[]) => void;
}) {
  const selected = onboarding.selectedIntents;

  function toggleIntent(intent: OnboardingIntent) {
    const next = selected.includes(intent)
      ? selected.filter((item) => item !== intent)
      : selected.length >= 2
        ? [...selected.slice(1), intent]
        : [...selected, intent];
    onAnswer("intentSelection", next);
  }

  return (
    <div className="space-y-3">
      {primaryIntentOptions.map((option) => (
        <OnboardingChoiceCard
          description={selected.includes(option.value as OnboardingIntent) ? "Selected" : undefined}
          key={option.value}
          onClick={() => toggleIntent(option.value as OnboardingIntent)}
          selected={selected.includes(option.value as OnboardingIntent)}
          title={option.label}
        />
      ))}
      <p className="text-sm text-app-muted">Choose up to 2.</p>
    </div>
  );
}

function PhoneField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white">Phone number</span>
      <div className="flex min-h-[56px] items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.02] px-4 py-3">
        <span className="text-sm font-semibold text-white/78">+1</span>
        <input
          autoComplete="tel"
          className="w-full bg-transparent text-base text-white outline-none placeholder:text-app-muted"
          inputMode="tel"
          onChange={(event) => onChange(event.target.value)}
          placeholder="(555) 555-5555"
          value={value}
        />
      </div>
    </label>
  );
}

function CodeField({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white">6-digit code</span>
      <input
        autoComplete="one-time-code"
        className="w-full rounded-[22px] border border-white/10 bg-white/[0.02] px-4 py-4 text-center text-2xl tracking-[0.38em] text-white outline-none placeholder:text-app-muted"
        inputMode="numeric"
        maxLength={6}
        onChange={(event) =>
          onChange(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))
        }
        placeholder="000000"
        value={value}
      />
    </label>
  );
}

function ShortTextField({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      className="w-full rounded-[22px] border border-white/10 bg-white/[0.02] px-4 py-4 text-base text-white outline-none placeholder:text-app-muted"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}

function LocationField({
  onboarding,
  onAnswer
}: {
  onboarding: OnboardingState;
  onAnswer: (
    questionId: string,
    value: { city: string; neighborhood: string }
  ) => void;
}) {
  const [cityInput, setCityInput] = useState(onboarding.city);
  const [neighborhoodInput, setNeighborhoodInput] = useState(onboarding.neighborhood ?? "");
  const matchingCities = citySuggestions.filter((option) =>
    option.toLowerCase().includes(cityInput.trim().toLowerCase())
  );

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white">City</span>
        <input
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.02] px-4 py-4 text-base text-white outline-none placeholder:text-app-muted"
          onChange={(event) => {
            const nextCity = event.target.value;
            setCityInput(nextCity);
            onAnswer("location", {
              city: nextCity,
              neighborhood: neighborhoodInput
            });
          }}
          placeholder="Los Angeles, CA"
          value={cityInput}
        />
      </label>

      {cityInput.trim().length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {matchingCities.slice(0, 5).map((city) => (
            <button
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-app-muted transition hover:border-white/20 hover:text-white"
              key={city}
              onClick={() => {
                setCityInput(city);
                onAnswer("location", {
                  city,
                  neighborhood: neighborhoodInput
                });
              }}
              type="button"
            >
              {city}
            </button>
          ))}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white">Neighborhood</span>
        <input
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.02] px-4 py-4 text-base text-white outline-none placeholder:text-app-muted"
          onChange={(event) => {
            const nextNeighborhood = event.target.value;
            setNeighborhoodInput(nextNeighborhood);
            onAnswer("location", {
              city: cityInput,
              neighborhood: nextNeighborhood
            });
          }}
          placeholder="Optional"
          value={neighborhoodInput}
        />
      </label>
    </div>
  );
}

function ChipSelectionField({
  options,
  selected,
  onChange,
  maxSelections
}: {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }

    if (maxSelections && selected.length >= maxSelections) {
      onChange([...selected.slice(1), value]);
      return;
    }

    onChange([...selected, value]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          className={cn(
            "min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition",
            selected.includes(option.value)
              ? "border-app-purple/30 bg-app-purple/12 text-white"
              : "border-white/10 bg-white/[0.02] text-app-muted hover:border-white/20 hover:text-white"
          )}
          key={option.value}
          onClick={() => toggle(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function TagSearchField({
  selected,
  onChange,
  suggestions,
  maxSelections,
  placeholder
}: {
  selected: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  maxSelections: number;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const matches = suggestions.filter(
    (item) =>
      item.toLowerCase().includes(input.trim().toLowerCase()) &&
      !selected.includes(item)
  );

  function addTag(tag: string) {
    if (!tag.trim()) {
      return;
    }

    const next = selected.includes(tag)
      ? selected
      : selected.length >= maxSelections
        ? [...selected.slice(1), tag.trim()]
        : [...selected, tag.trim()];
    onChange(next);
    setInput("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <button
              className="rounded-full border border-app-purple/30 bg-app-purple/12 px-3 py-1.5 text-sm text-white"
              key={tag}
              onClick={() => onChange(selected.filter((item) => item !== tag))}
              type="button"
            >
              {tag} ×
            </button>
          ))}
          <input
            className="min-w-[180px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-app-muted"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag(input);
              }
            }}
            placeholder={placeholder}
            value={input}
          />
        </div>
      </div>

      {matches.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {matches.slice(0, 8).map((tag) => (
            <button
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-app-muted transition hover:border-white/20 hover:text-white"
              key={tag}
              onClick={() => addTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getCanContinue(
  question: OnboardingQuestionConfig,
  onboarding: OnboardingState,
  codeValue: string
) {
  switch (question.id) {
    case "phone":
      return onboarding.phoneNumber.trim().length >= 10;
    case "verify":
      return mockVerifyPhoneCode(codeValue);
    case "displayName":
      return onboarding.displayName.trim().length >= 2;
    case "intentSelection":
      return onboarding.selectedIntents.length > 0 && onboarding.selectedIntents.length <= 2;
    case "intentPriority":
      return Boolean(onboarding.primaryIntent);
    case "location":
      return onboarding.city.trim().length > 0;
    case "explorerFandoms":
    case "explorerEventTypes":
    case "explorerStyle":
    case "explorerSocials":
      return true;
    case "talentSkills":
      return onboarding.skills.length > 0;
    case "talentExperience":
      return Boolean(onboarding.experienceLevel);
    case "talentEventTypes":
      return onboarding.workEventTypes.length > 0;
    case "talentScenes":
      return onboarding.fandomTags.length > 0;
    case "talentTravel":
      return Boolean(onboarding.travelRadius);
    case "talentOpenness":
      return onboarding.workOpenness.length > 0;
    case "talentPortfolio":
      return true;
    case "organizerGoal":
      return Boolean(onboarding.organizerGoal);
    case "organizerExperience":
      return Boolean(onboarding.organizerExperience);
    case "organizerEventTypes":
      return onboarding.organizerEventTypes.length > 0;
    case "organizerScenes":
      return onboarding.fandomTags.length > 0;
    case "organizerSupport":
      return onboarding.organizerSupportNeeds.length > 0;
    case "organizerCollabTargets":
      return onboarding.organizerCollabTargets.length > 0;
    case "organizerMotion":
      return Boolean(onboarding.organizerHasSomethingInMotion);
    case "businessType":
      return Boolean(onboarding.businessType);
    case "businessGoals":
      return onboarding.businessGoals.length > 0;
    case "businessScenes":
      return onboarding.businessSceneTags.length > 0;
    case "businessNeeds":
      return onboarding.businessTalentNeeds.length > 0;
    case "businessSizeFit":
      return Boolean(onboarding.businessSizeFit);
    case "secondaryAddonPrompt":
      return true;
    case "addonTalentSkills":
      return onboarding.skills.length > 0;
    case "addonOrganizerEventTypes":
      return onboarding.organizerEventTypes.length > 0;
    case "addonBusinessType":
      return Boolean(onboarding.businessType);
    case "addonExplorerFandoms":
      return onboarding.fandomTags.length > 0;
    case "addonExplorerEventTypes":
      return onboarding.eventTypePreferences.length > 0;
    case "completion":
      return true;
    default:
      return true;
  }
}

function shouldShowFooter(question: OnboardingQuestionConfig) {
  return !["single-card", "secondary-addon"].includes(question.inputType);
}

function getPrimaryButtonLabel(question: OnboardingQuestionConfig, onboarding: OnboardingState) {
  if (question.inputType === "completion") {
    if (onboarding.primaryBranch === "talent") {
      return "See opportunities";
    }
    if (onboarding.primaryBranch === "organizer") {
      return onboarding.organizerHasSomethingInMotion === "planning"
        ? "See what’s possible"
        : "Start a launch";
    }
    if (onboarding.primaryBranch === "business") {
      return "See matches";
    }
    return "Start exploring";
  }

  if (question.id === "verify") {
    return "Continue";
  }

  return "Continue";
}

function getShortTextValue(questionId: string, onboarding: OnboardingState) {
  switch (questionId) {
    case "displayName":
      return onboarding.displayName;
    case "talentPortfolio":
      return onboarding.portfolioLink ?? "";
    default:
      return "";
  }
}

function getShortTextPlaceholder(questionId: string) {
  if (questionId === "displayName") {
    return "Your name";
  }

  if (questionId === "talentPortfolio") {
    return "portfolio link";
  }

  return "Type here";
}

function getMultiValue(questionId: string, onboarding: OnboardingState) {
  switch (questionId) {
    case "explorerEventTypes":
    case "addonExplorerEventTypes":
      return onboarding.eventTypePreferences;
    case "explorerStyle":
      return onboarding.outingStyleTags;
    case "talentSkills":
    case "addonTalentSkills":
      return onboarding.skills;
    case "talentEventTypes":
      return onboarding.workEventTypes;
    case "talentOpenness":
      return onboarding.workOpenness;
    case "organizerEventTypes":
    case "addonOrganizerEventTypes":
      return onboarding.organizerEventTypes;
    case "organizerSupport":
      return onboarding.organizerSupportNeeds;
    case "organizerCollabTargets":
      return onboarding.organizerCollabTargets;
    case "businessGoals":
      return onboarding.businessGoals;
    case "businessNeeds":
      return onboarding.businessTalentNeeds;
    default:
      return [];
  }
}

function getTagValue(questionId: string, onboarding: OnboardingState) {
  switch (questionId) {
    case "businessScenes":
      return onboarding.businessSceneTags;
    default:
      return onboarding.fandomTags;
  }
}

function isSingleValueSelected(
  questionId: string,
  optionValue: string,
  onboarding: OnboardingState
) {
  switch (questionId) {
    case "intentPriority":
      return onboarding.primaryIntent === optionValue;
    case "collaborationRoute":
      return onboarding.collaborationRoute === optionValue;
    case "talentExperience":
      return onboarding.experienceLevel === optionValue;
    case "talentTravel":
      return onboarding.travelRadius === optionValue;
    case "organizerGoal":
      return onboarding.organizerGoal === optionValue;
    case "organizerExperience":
      return onboarding.organizerExperience === optionValue;
    case "organizerMotion":
      return onboarding.organizerHasSomethingInMotion === optionValue;
    case "businessType":
    case "addonBusinessType":
      return onboarding.businessType === optionValue;
    case "businessSizeFit":
      return onboarding.businessSizeFit === optionValue;
    default:
      return false;
  }
}

function resolveQuestionCopy(
  question: OnboardingQuestionConfig,
  onboarding: OnboardingState
) {
  if (question.id === "secondaryAddonPrompt") {
    return {
      title: `Want to set up your ${labelIntent(onboarding.secondaryIntent)} side too?`,
      subcopy: question.subcopy
    };
  }

  if (question.id === "finishOrganizer") {
    return {
      title: "You’re set",
      subcopy:
        onboarding.organizerHasSomethingInMotion === "planning"
          ? "We’ll show you the best ways to get started."
          : "You can start building right away."
    };
  }

  return {
    title: question.title,
    subcopy: question.subcopy
  };
}
