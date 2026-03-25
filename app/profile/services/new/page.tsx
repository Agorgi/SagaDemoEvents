"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingChoiceCard,
  OnboardingScreenShell,
  StickyFooter
} from "@/src/components/OnboardingScreenShell";
import { TagChip } from "@/src/components/Chips";
import { type ProfileService } from "@/src/data/creator-profiles";
import {
  buildServiceFromDraft,
  createEmptyServiceDraft,
  getServiceDescriptionPlaceholder,
  getServicePricingPlaceholder,
  getServiceTitleSuggestion,
  serviceCategoryOptions,
  SERVICE_FLOW_STORAGE_KEY,
  type ServiceDraft
} from "@/src/data/service-flow";
import { useAppState } from "@/src/lib/app-state";

const steps = [
  { id: "category", title: "What kind of service is this?", subcopy: "Choose what fits best." },
  { id: "title", title: "What should people call it?", subcopy: "Keep it short and clear." },
  { id: "pricing", title: "How should pricing show?", subcopy: "Use the label people will see first." },
  { id: "description", title: "What does it include?", subcopy: "One short line is enough." },
  { id: "visibility", title: "Show it on your public page?", subcopy: "You can change this later." },
  { id: "review", title: "Ready to add it?", subcopy: "You can still edit this later." }
] as const;

type StepId = (typeof steps)[number]["id"];

export default function NewProfileServicePage() {
  const router = useRouter();
  const { currentCreatorProfile, currentUserId, saveCreatorServices } = useAppState();
  const [draft, setDraft] = useState<ServiceDraft>(createEmptyServiceDraft);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hydratedDraft, setHydratedDraft] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SERVICE_FLOW_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{
          draft: ServiceDraft;
          currentIndex: number;
        }>;
        if (parsed.draft) {
          setDraft({
            ...createEmptyServiceDraft(),
            ...parsed.draft
          });
        }
        if (typeof parsed.currentIndex === "number") {
          setCurrentIndex(Math.max(0, Math.min(parsed.currentIndex, steps.length - 1)));
        }
      }
    } catch {
      localStorage.removeItem(SERVICE_FLOW_STORAGE_KEY);
    } finally {
      setHydratedDraft(true);
    }
  }, []);

  useEffect(() => {
    if (!hydratedDraft) {
      return;
    }

    localStorage.setItem(
      SERVICE_FLOW_STORAGE_KEY,
      JSON.stringify({
        draft,
        currentIndex
      })
    );
  }, [currentIndex, draft, hydratedDraft]);

  const currentStep = steps[currentIndex];
  const titlePlaceholder = useMemo(
    () => getServiceTitleSuggestion(draft.category),
    [draft.category]
  );

  if (!currentCreatorProfile) {
    return <div className="min-h-screen bg-app-bg" />;
  }

  const existingServices = currentCreatorProfile.services;

  function patchDraft(payload: Partial<ServiceDraft>) {
    setDraft((current) => ({
      ...current,
      ...payload
    }));
  }

  function handleClose() {
    router.push("/profile");
  }

  function handleBack() {
    if (currentIndex === 0) {
      router.push("/profile");
      return;
    }
    setCurrentIndex((current) => Math.max(0, current - 1));
  }

  function handleNext() {
    if (currentIndex >= steps.length - 1) {
      const nextService = buildServiceFromDraft(draft);
      saveCreatorServices(currentUserId, [...existingServices, nextService]);
      localStorage.removeItem(SERVICE_FLOW_STORAGE_KEY);
      router.push("/profile");
      return;
    }
    setCurrentIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function isStepValid(stepId: StepId) {
    switch (stepId) {
      case "category":
        return draft.category.trim().length > 0;
      case "title":
        return draft.title.trim().length > 0;
      case "pricing":
        return draft.pricingLabel.trim().length > 0;
      case "description":
        return draft.shortDescription.trim().length > 0;
      case "visibility":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  }

  return (
    <OnboardingScreenShell
      current={currentIndex}
      onBack={handleBack}
      onClose={handleClose}
      subcopy={currentStep.subcopy}
      title={currentStep.title}
      total={steps.length}
      footer={
        currentStep.id === "category" || currentStep.id === "visibility"
          ? undefined
          : (
              <StickyFooter
                onPrimary={handleNext}
                primaryDisabled={!isStepValid(currentStep.id)}
                primaryLabel={currentStep.id === "review" ? "Add service" : "Continue"}
              />
            )
      }
    >
      <div className="onboarding-question-enter">
        {currentStep.id === "category" ? (
          <div className="space-y-3">
            {serviceCategoryOptions.map((option) => (
              <OnboardingChoiceCard
                compact
                description={option.description}
                key={option.value}
                onClick={() => {
                  patchDraft({
                    category: option.value,
                    title: draft.title.trim() ? draft.title : getServiceTitleSuggestion(option.value),
                    pricingLabel:
                      draft.pricingLabel.trim() ? draft.pricingLabel : getServicePricingPlaceholder(option.value)
                  });
                  setCurrentIndex((current) => current + 1);
                }}
                selected={draft.category === option.value}
                title={option.label}
              />
            ))}
          </div>
        ) : null}

        {currentStep.id === "title" ? (
          <QuestionField
            helper={`Suggested: ${titlePlaceholder}`}
            onChange={(value) => patchDraft({ title: value })}
            placeholder={titlePlaceholder}
            value={draft.title}
          />
        ) : null}

        {currentStep.id === "pricing" ? (
          <QuestionField
            helper={`Try something like ${getServicePricingPlaceholder(draft.category)}`}
            onChange={(value) => patchDraft({ pricingLabel: value })}
            placeholder={getServicePricingPlaceholder(draft.category)}
            value={draft.pricingLabel}
          />
        ) : null}

        {currentStep.id === "description" ? (
          <QuestionTextarea
            onChange={(value) => patchDraft({ shortDescription: value })}
            placeholder={getServiceDescriptionPlaceholder(draft.category)}
            value={draft.shortDescription}
          />
        ) : null}

        {currentStep.id === "visibility" ? (
          <div className="space-y-3">
            <OnboardingChoiceCard
              compact
              description="Show it on your public creator page right away."
              onClick={() => {
                patchDraft({ visibleOnPublicProfile: true });
                setCurrentIndex((current) => current + 1);
              }}
              selected={draft.visibleOnPublicProfile}
              title="Yes, make it public"
            />
            <OnboardingChoiceCard
              compact
              description="Keep it private for now and turn it on later."
              onClick={() => {
                patchDraft({ visibleOnPublicProfile: false });
                setCurrentIndex((current) => current + 1);
              }}
              selected={!draft.visibleOnPublicProfile}
              title="Keep it private"
            />
          </div>
        ) : null}

        {currentStep.id === "review" ? (
          <div className="space-y-5">
            <div className="surface-card-strong overflow-hidden p-5">
              <div className="rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(123,132,255,0.18),transparent_55%),linear-gradient(180deg,rgba(16,21,34,0.98),rgba(9,12,20,1))] p-5">
                <div className="flex items-center justify-between gap-3">
                  <TagChip
                    label={draft.visibleOnPublicProfile ? "Public service" : "Private service"}
                    subdued={!draft.visibleOnPublicProfile}
                  />
                  {draft.category ? (
                    <span className="text-xs uppercase tracking-[0.14em] text-app-muted">
                      {serviceCategoryOptions.find((option) => option.value === draft.category)?.label}
                    </span>
                  ) : null}
                </div>

                <div className="mt-5">
                  <p className="text-xl font-semibold text-white">
                    {draft.title.trim() || titlePlaceholder}
                  </p>
                  <p className="mt-2 text-sm text-app-muted">
                    {draft.pricingLabel.trim() || getServicePricingPlaceholder(draft.category)}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#D5D9E8]">
                  {draft.shortDescription.trim() || getServiceDescriptionPlaceholder(draft.category)}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </OnboardingScreenShell>
  );
}

function QuestionField({
  value,
  onChange,
  placeholder,
  helper
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  helper?: string;
}) {
  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-[26px] border border-white/10 bg-[#0d1119] px-5 py-4 text-base text-white outline-none transition placeholder:text-app-muted focus:border-white/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      {helper ? <p className="text-sm text-app-muted">{helper}</p> : null}
    </div>
  );
}

function QuestionTextarea({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <textarea
      className="min-h-[180px] w-full rounded-[26px] border border-white/10 bg-[#0d1119] px-5 py-4 text-base text-white outline-none transition placeholder:text-app-muted focus:border-white/20"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}
