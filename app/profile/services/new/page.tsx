"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OnboardingChoiceCard,
  OnboardingScreenShell,
  StickyFooter
} from "@/src/components/OnboardingScreenShell";
import { ProfileServiceCard } from "@/src/components/ProfileServiceCard";
import { ImagePositionPicker } from "@/src/components/ImagePositionPicker";
import { TagChip } from "@/src/components/Chips";
import {
  buildServiceFromDraft,
  buildServicePricingLabel,
  createEmptyServiceDraft,
  getDefaultServiceCoverStyle,
  getServiceCategoryOption,
  getServiceDescriptionPlaceholder,
  getServicePricingPlaceholder,
  getServiceTitleSuggestion,
  normalizeServiceDraft,
  serviceCoverStyleOptions,
  serviceCategoryOptions,
  SERVICE_FLOW_STORAGE_KEY,
  type ServiceDraft
} from "@/src/data/service-flow";
import { mediaPositionOptions } from "@/src/lib/media-position";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

const steps = [
  { id: "category", title: "What kind of service is this?", subcopy: "Choose what fits best." },
  { id: "title", title: "What should people call it?", subcopy: "Keep it short and clear." },
  { id: "pricing", title: "How should pricing show?", subcopy: "Use the label people will see first." },
  { id: "description", title: "What does it include?", subcopy: "One short line is enough." },
  { id: "cover", title: "Give it a look", subcopy: "Pick a style or use one of your images." },
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
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SERVICE_FLOW_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{
          draft: ServiceDraft;
          currentIndex: number;
        }>;
        if (parsed.draft) {
          setDraft(normalizeServiceDraft(parsed.draft));
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
  const categoryLabel = getServiceCategoryOption(draft.category)?.label ?? "Service";

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
        return draft.priceAmount.trim().length > 0;
      case "description":
        return draft.shortDescription.trim().length > 0;
      case "cover":
        return true;
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
                      draft.pricingLabel.trim()
                        ? draft.pricingLabel
                        : buildServicePricingLabel("hourly", getServicePricingPlaceholder(option.value)),
                    pricingMode: draft.priceAmount.trim() ? draft.pricingMode : "hourly",
                    priceAmount:
                      draft.priceAmount.trim() ? draft.priceAmount : getServicePricingPlaceholder(option.value),
                    coverStyle: draft.coverImage
                      ? draft.coverStyle
                      : getDefaultServiceCoverStyle(option.value)
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <PricingModeCard
                accent="violet"
                description="Best for ongoing coverage or flexible asks."
                onClick={() =>
                  patchDraft({
                    pricingMode: "hourly",
                    pricingLabel: buildServicePricingLabel("hourly", draft.priceAmount)
                  })
                }
                sampleLabel={
                  buildServicePricingLabel(
                    "hourly",
                    draft.priceAmount || getServicePricingPlaceholder(draft.category)
                  ) || "$30/hr"
                }
                selected={draft.pricingMode === "hourly"}
                title="Hourly"
              />
              <PricingModeCard
                accent="gold"
                description="Great for packaged work or a single deliverable."
                onClick={() =>
                  patchDraft({
                    pricingMode: "flat",
                    pricingLabel: buildServicePricingLabel("flat", draft.priceAmount)
                  })
                }
                sampleLabel={
                  buildServicePricingLabel(
                    "flat",
                    draft.priceAmount || getServicePricingPlaceholder(draft.category)
                  ) || "$180 rate"
                }
                selected={draft.pricingMode === "flat"}
                title="Flat fee"
              />
            </div>
            <QuestionField
              helper={`Shows as ${buildServicePricingLabel(draft.pricingMode, draft.priceAmount || getServicePricingPlaceholder(draft.category)) || (draft.pricingMode === "hourly" ? "$30/hr" : "$180 rate")}`}
              inputMode="decimal"
              onChange={(value) =>
                patchDraft({
                  priceAmount: value.replace(/[^\d.]/g, ""),
                  pricingLabel: buildServicePricingLabel(
                    draft.pricingMode,
                    value.replace(/[^\d.]/g, "")
                  )
                })
              }
              prefix="$"
              placeholder={getServicePricingPlaceholder(draft.category)}
              value={draft.priceAmount}
            />
            <button
              className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                draft.openToVolunteering
                  ? "border-app-purple/40 bg-app-purple/12 shadow-[0_18px_42px_rgba(31,28,184,0.16)]"
                  : "border-white/10 bg-[#0d1119] hover:border-white/18"
              }`}
              onClick={() =>
                patchDraft({ openToVolunteering: !draft.openToVolunteering })
              }
              type="button"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Open to volunteering</p>
                  <p className="mt-1 text-xs leading-5 text-app-muted">
                    Let people know you are open to unpaid community asks too.
                  </p>
                </div>
                <span
                  className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                    draft.openToVolunteering
                      ? "border-app-purple/50 bg-app-purple/20 text-white"
                      : "border-white/10 bg-white/[0.03] text-app-muted"
                  }`}
                >
                  {draft.openToVolunteering ? "✓" : ""}
                </span>
              </div>
            </button>
          </div>
        ) : null}

        {currentStep.id === "description" ? (
          <QuestionTextarea
            onChange={(value) => patchDraft({ shortDescription: value })}
            placeholder={getServiceDescriptionPlaceholder(draft.category)}
            value={draft.shortDescription}
          />
        ) : null}

        {currentStep.id === "cover" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {serviceCoverStyleOptions.map((option) => (
                <button
                  className={`overflow-hidden rounded-[24px] border text-left transition ${
                    draft.coverStyle === option.value && !draft.coverImage
                      ? "border-app-purple/40 bg-white/[0.05] shadow-[0_18px_42px_rgba(31,28,184,0.2)]"
                      : "border-white/8 bg-[#0d1119] hover:border-white/16"
                  }`}
                  key={option.value}
                  onClick={() =>
                    patchDraft({
                      coverStyle: option.value,
                      coverImage: undefined,
                      coverImageSourceTitle: undefined
                    })
                  }
                  type="button"
                >
                  <div
                    className="h-24 w-full"
                    style={{
                      background:
                        option.value === "gold"
                          ? "radial-gradient(circle at top right, rgba(240,196,83,0.24), transparent 36%), linear-gradient(180deg, rgba(28,20,38,0.98), rgba(13,13,22,1))"
                          : option.value === "emerald"
                            ? "radial-gradient(circle at 22% 18%, rgba(80,212,168,0.24), transparent 30%), linear-gradient(180deg, rgba(15,28,30,0.98), rgba(10,16,20,1))"
                            : option.value === "midnight"
                              ? "radial-gradient(circle at 80% 8%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(180deg, rgba(16,18,28,0.98), rgba(8,10,18,1))"
                              : "radial-gradient(circle at top left, rgba(123,132,255,0.28), transparent 34%), linear-gradient(180deg, rgba(19,25,44,0.98), rgba(12,16,28,1))"
                    }}
                  />
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white">{option.label}</p>
                    <p className="mt-1 text-xs leading-5 text-app-muted">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Use an image instead</p>
                  <p className="mt-1 text-xs leading-5 text-app-muted">
                    Upload one or pick from your portfolio.
                  </p>
                </div>
                <button
                  className="inline-flex min-h-[40px] items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
                  onClick={() => uploadInputRef.current?.click()}
                  type="button"
                >
                  Upload
                </button>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        patchDraft({
                          coverImage: reader.result,
                          coverImageSourceTitle: file.name,
                          coverImagePosition: "center"
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                    event.currentTarget.value = "";
                  }}
                  ref={uploadInputRef}
                  type="file"
                />
              </div>

              {currentCreatorProfile.portfolio.length > 0 ? (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1 subtle-scrollbar">
                  {currentCreatorProfile.portfolio.slice(0, 6).map((item) => (
                    <button
                      className={`relative w-[112px] shrink-0 overflow-hidden rounded-[20px] border transition ${
                        draft.coverImage === item.image
                          ? "border-app-purple/40 shadow-[0_16px_36px_rgba(31,28,184,0.18)]"
                          : "border-white/8"
                      }`}
                      key={item.id}
                      onClick={() =>
                        patchDraft({
                          coverImage: item.image,
                          coverImageSourceTitle: item.title,
                          coverImagePosition: "center"
                        })
                      }
                      type="button"
                    >
                      <img
                        alt={item.title ?? "Portfolio image"}
                        className="h-[132px] w-full object-cover"
                        src={item.image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      {item.title ? (
                        <span className="absolute bottom-2 left-2 right-2 line-clamp-2 text-left text-[11px] font-medium text-white">
                          {item.title}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}

              {draft.coverImage ? (
                <div className="mt-4 space-y-4">
                  <ImagePositionPicker
                    label="Image focus"
                    onChange={(value) => patchDraft({ coverImagePosition: value })}
                    value={draft.coverImagePosition}
                  />
                  <button
                    className="text-sm font-medium text-app-muted transition hover:text-white"
                    onClick={() =>
                      patchDraft({
                        coverImage: undefined,
                        coverImageSourceTitle: undefined,
                        coverImagePosition: "center"
                      })
                    }
                    type="button"
                  >
                    Use style instead
                  </button>
                </div>
              ) : null}
            </div>
          </div>
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
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-app-muted">
                    Preview
                  </p>
                  <p className="mt-1 text-sm text-app-muted">
                    This is how it will look on your services section.
                  </p>
                </div>

                <ProfileServiceCard
                  categoryLabel={categoryLabel}
                  creatorHandle={currentCreatorProfile.handle}
                  mode="preview"
                  service={buildServiceFromDraft(draft)}
                />

                {draft.coverImage ? (
                  <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/8 bg-[#0d1119] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
                      Reposition
                    </p>
                    <div className="flex items-center gap-2">
                      {mediaPositionOptions.map((option) => (
                        <button
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            draft.coverImagePosition === option.value
                              ? "bg-app-purple text-white shadow-[0_10px_24px_rgba(31,28,184,0.22)]"
                              : "border border-white/10 bg-white/[0.03] text-app-muted hover:border-white/18 hover:text-white"
                          }`}
                          key={option.value}
                          onClick={() => patchDraft({ coverImagePosition: option.value })}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-app-muted">
                        Showing as
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {draft.visibleOnPublicProfile ? "Public service" : "Private service"}
                      </p>
                    </div>
                    <TagChip
                      label={draft.visibleOnPublicProfile ? "Visible" : "Private"}
                      subdued={!draft.visibleOnPublicProfile}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-app-muted">
                    {draft.visibleOnPublicProfile
                      ? "People will see it on your public profile right away."
                      : "It will stay on your private profile until you turn it on."}
                  </p>
                  <p className="mt-2 text-xs text-app-muted">
                    {draft.coverImage
                      ? `Cover image: ${draft.coverImageSourceTitle || "Custom upload"} · ${draft.coverImagePosition} focus`
                      : `Cover style: ${serviceCoverStyleOptions.find((option) => option.value === draft.coverStyle)?.label ?? "Violet glow"}`}
                  </p>
                </div>
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
  helper,
  inputMode = "text",
  prefix
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  helper?: string;
  inputMode?: "text" | "search" | "email" | "tel" | "url" | "none" | "numeric" | "decimal";
  prefix?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base font-semibold text-white/68">
            {prefix}
          </span>
        ) : null}
        <input
          className={`w-full rounded-[26px] border border-white/10 bg-[#0d1119] px-5 py-4 text-base text-white outline-none transition placeholder:text-app-muted focus:border-white/20 ${
            prefix ? "pl-10" : ""
          }`}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </div>
      {helper ? <p className="text-sm text-app-muted">{helper}</p> : null}
    </div>
  );
}

function PricingModeCard({
  title,
  description,
  sampleLabel,
  selected,
  onClick,
  accent
}: {
  title: string;
  description: string;
  sampleLabel: string;
  selected?: boolean;
  onClick: () => void;
  accent: "violet" | "gold";
}) {
  return (
    <button
      className={cn(
        "launch-choice-card relative overflow-hidden rounded-[28px] border text-left transition hover:-translate-y-0.5",
        selected
          ? "border-app-purple/40 shadow-[0_18px_42px_rgba(31,28,184,0.22)]"
          : "border-white/8 hover:border-white/16",
        accent === "gold"
          ? "bg-[linear-gradient(180deg,rgba(32,24,38,0.98),rgba(13,17,25,0.98))]"
          : "bg-[linear-gradient(180deg,rgba(23,28,48,0.98),rgba(13,17,25,0.98))]"
      )}
      onClick={onClick}
      type="button"
    >
      <div
        className={cn(
          "absolute inset-0 opacity-90",
          accent === "gold"
            ? "bg-[radial-gradient(circle_at_top_right,rgba(240,196,83,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_44%)]"
            : "bg-[radial-gradient(circle_at_top_left,rgba(123,132,255,0.22),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_44%)]"
        )}
      />
      <div className="relative z-[1] flex min-h-[164px] flex-col justify-between p-4">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="text-sm leading-6 text-app-muted">{description}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/52">Shows as</p>
          <p className="text-base font-semibold text-white">{sampleLabel}</p>
        </div>
      </div>
    </button>
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
