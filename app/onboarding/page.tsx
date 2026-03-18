"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { OnboardingStepper } from "@/src/components/OnboardingStepper";
import { WelcomePathCard } from "@/src/components/WelcomePathCard";
import {
  creatorRoleOptions,
  fanEventTypeOptions,
  hostFormatOptions,
  type UserMode
} from "@/src/data/launches";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

const cities = ["Los Angeles, CA", "Pasadena, CA", "New York, NY", "San Diego, CA"];
const fandomChoices = [
  "Cosplay",
  "Love and Deepspace",
  "Genshin Impact",
  "Marvel Rivals",
  "Jujutsu Kaisen",
  "Uma Musume"
];

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
  const [mode, setMode] = useState<UserMode | null>(initialMode);
  const [step, setStep] = useState(initialMode ? 0 : -1);
  const { activateSampleProfile, completeOnboarding } = useAppState();

  const [authMethod, setAuthMethod] = useState<"google" | "discord" | "email" | null>(
    sample ? "google" : null
  );
  const [city, setCity] = useState(sample ? "Los Angeles, CA" : cities[0]);
  const [fandoms, setFandoms] = useState<string[]>(sample ? ["Cosplay", "Jujutsu Kaisen"] : []);
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

  const labels = useMemo(() => {
    const base = ["Account", "City", "Fandoms", "Setup"];
    return initialMode ? base : ["Path", ...base];
  }, [initialMode]);

  function handleComplete() {
    if (sample && mode) {
      activateSampleProfile(mode);
      router.push(mode === "host" ? "/studio" : mode === "creator" ? "/profile/setup" : "/explore");
      return;
    }

    if (!mode || !authMethod) {
      return;
    }

    completeOnboarding({
      mode,
      authMethod,
      city,
      fandoms,
      hostFormat,
      budgetRange,
      creatorRoles,
      portfolioLink,
      availability,
      fanEventTypes,
      travelDistance,
      budgetComfort,
      usedSampleProfile: sample
    });

    router.push(mode === "host" ? "/studio" : mode === "creator" ? "/profile/setup" : "/explore");
  }

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
          <OnboardingStepper current={Math.max(step, 0)} labels={labels} />

          {step === -1 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <WelcomePathCard
                accent="bg-gradient-to-br from-app-purple/18 via-[#10172a] to-[#10141d]"
                description="Build and launch your first live experience."
                onClick={() => {
                  setMode("host");
                  setStep(0);
                }}
                title="Host something"
              />
              <WelcomePathCard
                accent="bg-gradient-to-br from-[#1f4fff]/16 via-[#10172a] to-[#0f1219]"
                description="Set up a creator profile and find your next role."
                onClick={() => {
                  setMode("creator");
                  setStep(0);
                }}
                title="Join a team"
              />
              <WelcomePathCard
                accent="bg-gradient-to-br from-[#7b57ff]/14 via-[#10172a] to-[#0f1219]"
                description="Track tickets and discover what is happening nearby."
                onClick={() => {
                  setMode("fan");
                  setStep(0);
                }}
                title="Go to events"
              />
            </div>
          ) : null}

          {step === 0 ? (
            <StepBlock
              description="Mock sign-in is enough for the demo. Pick the path you want to continue with."
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
            <StepBlock description="Set where you want Saga to look first." title="Choose city">
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

          {step === 2 ? (
            <StepBlock description="Pick the scenes you want the product to prioritize." title="Choose fandoms">
              <ChipPicker
                options={fandomChoices}
                selected={fandoms}
                onToggle={(value) =>
                  setFandoms((current) =>
                    current.includes(value)
                      ? current.filter((item) => item !== value)
                      : [...current, value]
                  )
                }
              />
            </StepBlock>
          ) : null}

          {step === 3 && mode === "host" ? (
            <StepBlock description="Tell Saga what you want to run first." title="Your first launch">
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

          {step === 3 && mode === "creator" ? (
            <StepBlock description="Set up the basics so hosts can understand your fit fast." title="Your creator setup">
              <div className="space-y-4">
                <ChipPicker
                  options={[...creatorRoleOptions]}
                  selected={creatorRoles}
                  onToggle={(value) =>
                    setCreatorRoles((current) =>
                      current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value]
                    )
                  }
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

          {step === 3 && mode === "fan" ? (
            <StepBlock description="Tune what Saga surfaces first." title="Your event preferences">
              <div className="space-y-4">
                <ChipPicker
                  options={[...fanEventTypeOptions]}
                  selected={fanEventTypes}
                  onToggle={(value) =>
                    setFanEventTypes((current) =>
                      current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value]
                    )
                  }
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

          {step >= 0 ? (
            <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-6">
              <button
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                onClick={() => setStep((current) => Math.max(initialMode ? 0 : -1, current - 1))}
                type="button"
              >
                Back
              </button>
              <button
                className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() => {
                  if (step < 3) {
                    setStep((current) => current + 1);
                    return;
                  }
                  handleComplete();
                }}
                type="button"
              >
                {step < 3 ? "Continue" : "Finish"}
              </button>
            </div>
          ) : null}
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
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-app-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ChipPicker({
  options,
  selected,
  onToggle
}: {
  options: readonly string[] | string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            className={cn(
              "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
              active
                ? "border-app-purple/30 bg-app-purple/12 text-white"
                : "border-white/10 bg-white/[0.02] text-app-muted hover:border-white/20 hover:text-white"
            )}
            key={option}
            onClick={() => onToggle(option)}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
