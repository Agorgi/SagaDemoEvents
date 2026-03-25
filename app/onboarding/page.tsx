"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { OnboardingStepper } from "@/src/components/OnboardingStepper";
import {
  creatorRoleOptions,
  fanEventTypeOptions,
  hostFormatOptions,
  type UserMode
} from "@/src/data/launches";
import { getModeForIntent, type UserIntent } from "@/src/data/social";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

const cities = ["Los Angeles, CA", "Pasadena, CA", "New York, NY", "San Diego, CA"];
const fandomChoices = [
  "Cosplay",
  "Love and Deepspace",
  "Genshin Impact",
  "Marvel Rivals",
  "Jujutsu Kaisen",
  "Uma Musume",
  "One Piece",
  "Avengers"
];
const intentChoices: Array<{
  intent: UserIntent;
  title: string;
  description: string;
}> = [
  { intent: "attend events", title: "Attend events", description: "Build a live plans list." },
  { intent: "discover people", title: "Discover people", description: "See who is shaping your scene." },
  { intent: "create", title: "Create", description: "Share work and build a public identity." },
  { intent: "perform", title: "Perform", description: "Find rooms that need your craft." },
  { intent: "vend", title: "Vend", description: "Show up with tables, merch, or services." },
  { intent: "host", title: "Host", description: "Start building fandom nights." }
];

function intentForMode(mode: UserMode | null) {
  if (mode === "host") {
    return "host" as const;
  }
  if (mode === "creator") {
    return "perform" as const;
  }
  if (mode === "fan") {
    return "attend events" as const;
  }
  return null;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <OnboardingPageContent />
    </Suspense>
  );
}

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sample = searchParams.get("sample") === "1";
  const initialMode = searchParams.get("mode") as UserMode | null;
  const seededIntent = intentForMode(initialMode);
  const [step, setStep] = useState(0);
  const { activateSampleProfile, completeOnboarding } = useAppState();

  const [authMethod, setAuthMethod] = useState<"google" | "discord" | "email" | null>(
    sample ? "google" : null
  );
  const [primaryIntent, setPrimaryIntent] = useState<UserIntent | null>(
    seededIntent ?? (sample ? "attend events" : null)
  );
  const [city, setCity] = useState(sample ? "Los Angeles, CA" : cities[0]);
  const [fandoms, setFandoms] = useState<string[]>(
    sample ? ["Cosplay", "One Piece", "Jujutsu Kaisen"] : []
  );
  const [hostFormat, setHostFormat] = useState<(typeof hostFormatOptions)[number]>("social");
  const [budgetRange, setBudgetRange] = useState("$2k - $5k");
  const [creatorRoles, setCreatorRoles] = useState<string[]>(
    sample ? ["social promo", "photographer"] : []
  );
  const [portfolioLink, setPortfolioLink] = useState(sample ? "portfolio.example/saga" : "");
  const [availability, setAvailability] = useState(sample ? "Weeknights + weekends" : "");
  const [fanEventTypes, setFanEventTypes] = useState<string[]>(
    sample ? ["mixers", "creator showcases"] : []
  );
  const [travelDistance, setTravelDistance] = useState(sample ? "Up to 45 minutes" : "");
  const [budgetComfort, setBudgetComfort] = useState(sample ? "$20 - $40" : "");

  const mode = primaryIntent ? getModeForIntent(primaryIntent) : null;
  const labels = useMemo(
    () => ["Account", "Intent", "City", "Fandoms", "Setup"],
    []
  );

  function handleComplete() {
    if (sample) {
      activateSampleProfile(mode ?? "fan");
      router.push("/explore");
      return;
    }

    if (!authMethod || !primaryIntent) {
      return;
    }

    completeOnboarding({
      authMethod,
      city,
      fandoms,
      primaryIntent,
      mode: getModeForIntent(primaryIntent),
      hostFormat,
      budgetRange,
      creatorRoles,
      portfolioLink,
      availability,
      fanEventTypes,
      travelDistance,
      budgetComfort,
      usedSampleProfile: false
    });

    router.push("/explore");
  }

  const canContinue = [
    Boolean(authMethod),
    Boolean(primaryIntent),
    Boolean(city),
    fandoms.length > 0,
    true
  ][step];

  return (
    <main className="min-h-screen bg-app-grid px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[760px] rounded-[36px] border border-white/8 bg-[#0e121a] p-6 shadow-soft sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <img alt="Saga" className="h-[42px] w-auto object-contain" src="/group-88462-v2.png" />
          <Link className="text-sm font-semibold text-app-muted transition hover:text-white" href="/">
            Back
          </Link>
        </div>

        <section className="mt-8 space-y-6">
          <OnboardingStepper current={step} labels={labels} />

          {step === 0 ? (
            <StepBlock
              description="Mock sign-in is enough for the demo."
              title="Create account"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {(["google", "discord", "email"] as const).map((option) => (
                  <button
                    className={cn(
                      "rounded-[22px] border px-4 py-4 text-left text-sm font-semibold transition",
                      authMethod === option
                        ? "border-app-purple/30 bg-app-purple/12 text-white"
                        : "border-white/10 bg-white/[0.02] text-white hover:border-white/20"
                    )}
                    key={option}
                    onClick={() => setAuthMethod(option)}
                    type="button"
                  >
                    Continue with {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </StepBlock>
          ) : null}

          {step === 1 ? (
            <StepBlock
              description="Pick the main thing you want Saga to help with first."
              title="What are you here to do?"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {intentChoices.map((option) => (
                  <button
                    className={cn(
                      "rounded-[24px] border px-4 py-4 text-left transition",
                      primaryIntent === option.intent
                        ? "border-app-purple/30 bg-app-purple/12 text-white"
                        : "border-white/10 bg-white/[0.02] text-white hover:border-white/20"
                    )}
                    key={option.intent}
                    onClick={() => setPrimaryIntent(option.intent)}
                    type="button"
                  >
                    <p className="font-semibold">{option.title}</p>
                    <p className="mt-2 text-sm text-app-muted">{option.description}</p>
                  </button>
                ))}
              </div>
            </StepBlock>
          ) : null}

          {step === 2 ? (
            <StepBlock description="Set the area Saga should start from." title="Choose city">
              <div className="grid gap-3 sm:grid-cols-2">
                {cities.map((option) => (
                  <button
                    className={cn(
                      "rounded-[22px] border px-4 py-4 text-left text-sm font-semibold transition",
                      city === option
                        ? "border-app-purple/30 bg-app-purple/12 text-white"
                        : "border-white/10 bg-white/[0.02] text-white hover:border-white/20"
                    )}
                    key={option}
                    onClick={() => setCity(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </StepBlock>
          ) : null}

          {step === 3 ? (
            <StepBlock
              description="Pick the fandoms and scenes that should shape Home first."
              title="Choose fandoms"
            >
              <ChipPicker
                onToggle={(value) =>
                  setFandoms((current) =>
                    current.includes(value)
                      ? current.filter((item) => item !== value)
                      : [...current, value]
                  )
                }
                options={fandomChoices}
                selected={fandoms}
              />
            </StepBlock>
          ) : null}

          {step === 4 && mode === "host" ? (
            <StepBlock description="Enough signal to tune your first host surface." title="Host setup">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {hostFormatOptions.map((option) => (
                    <button
                      className={cn(
                        "rounded-[22px] border px-4 py-4 text-left text-sm font-semibold capitalize transition",
                        hostFormat === option
                          ? "border-app-purple/30 bg-app-purple/12 text-white"
                          : "border-white/10 bg-white/[0.02] text-white hover:border-white/20"
                      )}
                      key={option}
                      onClick={() => setHostFormat(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setBudgetRange(event.target.value)}
                  placeholder="Budget range"
                  value={budgetRange}
                />
              </div>
            </StepBlock>
          ) : null}

          {step === 4 && mode === "creator" ? (
            <StepBlock description="Give your creator identity enough shape to feel real." title="Creator setup">
              <div className="space-y-4">
                <ChipPicker
                  onToggle={(value) =>
                    setCreatorRoles((current) =>
                      current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value]
                    )
                  }
                  options={[...creatorRoleOptions]}
                  selected={creatorRoles}
                />
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setPortfolioLink(event.target.value)}
                  placeholder="Portfolio link"
                  value={portfolioLink}
                />
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setAvailability(event.target.value)}
                  placeholder="Availability"
                  value={availability}
                />
              </div>
            </StepBlock>
          ) : null}

          {step === 4 && mode === "fan" ? (
            <StepBlock description="Pick the rhythms that make a night feel worth leaving the house for." title="Fan setup">
              <div className="space-y-4">
                <ChipPicker
                  onToggle={(value) =>
                    setFanEventTypes((current) =>
                      current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value]
                    )
                  }
                  options={[...fanEventTypeOptions]}
                  selected={fanEventTypes}
                />
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setTravelDistance(event.target.value)}
                  placeholder="How far will you travel?"
                  value={travelDistance}
                />
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setBudgetComfort(event.target.value)}
                  placeholder="Budget comfort"
                  value={budgetComfort}
                />
              </div>
            </StepBlock>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              type="button"
            >
              Back
            </button>

            <div className="flex gap-3">
              {step < labels.length - 1 ? (
                <button
                  className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canContinue}
                  onClick={() => setStep((current) => Math.min(labels.length - 1, current + 1))}
                  type="button"
                >
                  Continue
                </button>
              ) : (
                <button
                  className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  onClick={handleComplete}
                  type="button"
                >
                  Open your feed
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StepBlock({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-app-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ChipPicker({
  options,
  selected,
  onToggle
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition",
            selected.includes(option)
              ? "border-app-purple/30 bg-app-purple/12 text-white"
              : "border-white/10 bg-white/[0.02] text-app-muted hover:border-white/20 hover:text-white"
          )}
          key={option}
          onClick={() => onToggle(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
