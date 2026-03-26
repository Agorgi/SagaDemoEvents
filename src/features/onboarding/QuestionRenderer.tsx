"use client";

import { useState } from "react";

import { OnboardingChoiceCard } from "@/src/components/OnboardingScreenShell";
import { SocialConnectOptions } from "@/src/components/SocialConnectOptions";
import {
  citySuggestions,
  labelIntent,
  primaryIntentOptions,
  sharedTagSuggestions,
  type OnboardingIntent,
  type OnboardingQuestionConfig,
  type OnboardingState
} from "@/src/data/onboarding";
import {
  getCompletionHighlights,
  getCompletionSupportCopy,
  getMultiValue,
  getShortTextPlaceholder,
  getShortTextValue,
  getTagValue,
  isSingleValueSelected
} from "@/src/features/onboarding/utils";
import { cn } from "@/src/lib/utils";

export function QuestionRenderer({
  codeValue,
  onboarding,
  onAnswer,
  onAutoAdvance,
  question,
  setCodeValue
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
      return <IntentSelectionField onboarding={onboarding} onAnswer={onAnswer} />;
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
      return <LocationField onboarding={onboarding} onAnswer={onAnswer} />;
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
        <div className="onboarding-success-card surface-card-strong overflow-hidden p-5">
          <div className="relative z-[1] h-[240px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,rgba(31,28,184,0.22),rgba(13,17,25,0.94))]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_38%)]" />
            <img
              alt="Saga"
              className="absolute inset-0 h-full w-full object-cover opacity-[0.18] mix-blend-screen"
              src="/group-88462-v2.png"
            />
            <div className="absolute inset-x-0 top-5 flex justify-center">
              <span className="onboarding-success-pill rounded-full border border-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/78">
                Ready to go
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 space-y-4 p-5">
              <div className="space-y-2">
                <p className="text-3xl font-semibold text-white">
                  {onboarding.displayName || "You’re in"}
                </p>
                <p className="max-w-[28ch] text-sm leading-6 text-white/72">
                  {getCompletionSupportCopy(onboarding)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {getCompletionHighlights(onboarding).map((item) => (
                  <span
                    className="onboarding-success-pill rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/88"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
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
  onChange,
  value
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
  onChange,
  value
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
  onChange,
  placeholder,
  value
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
  maxSelections,
  onChange,
  options,
  selected
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
  maxSelections,
  onChange,
  placeholder,
  selected,
  suggestions
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
