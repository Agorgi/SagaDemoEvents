"use client";

import { type RefObject } from "react";

import { FilterChip } from "@/src/components/Chips";
import { ImagePositionPicker } from "@/src/components/ImagePositionPicker";
import {
  ageGateOptions,
  coordinationOptions,
  fandomSuggestionOptions,
  getDefaultLaunchPosterStyle,
  launchFormatOptions,
  launchPosterStyleOptions,
  lineupStatusOptions,
  otherClosestFormatOptions,
  producedAlreadySetOptions,
  producedCoordinationOptions,
  producedEntryOptions,
  producedExpectOptions,
  producedPriceOptions,
  producedVenueTypes,
  quickDatePresets,
  reservationOptions,
  simpleAlreadySetOptions,
  simpleEntryOptions,
  simpleExpectOptions,
  simplePriceOptions,
  simpleVenueTypes,
  sizeBucketOptions,
  softAlreadySetOptions,
  softEntryOptions,
  softHighlightOptions,
  softMinimumPeopleOptions,
  softVenueTypeOptions,
  timeWindowOptions,
  type LaunchQuestionConfig,
  type LaunchWizardDraft,
  vendorCountOptions
} from "@/src/data/launch-builder";
import { getMediaObjectPosition } from "@/src/lib/media-position";
import { cn } from "@/src/lib/utils";
import {
  formatFriendlyDate,
  isNightlifeOrLarge,
  parseTimeChip,
  toTitle
} from "@/src/features/launch-wizard/utils";

export function WizardProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }, (_, index) => (
          <div
            className={cn("h-2 rounded-full transition", index <= current ? "bg-app-purple" : "bg-white/[0.08]")}
            key={index}
          />
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-app-muted">
        Step {current + 1} of {total}
      </p>
    </div>
  );
}

export function QuestionBody({
  autoAdvance,
  draft,
  onTagInputChange,
  portfolioItems,
  question,
  tagInput,
  updateDraft,
  uploadInputRef
}: {
  draft: LaunchWizardDraft;
  portfolioItems: Array<{ id: string; image: string; title?: string }>;
  question: LaunchQuestionConfig;
  tagInput: string;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
  autoAdvance: (payload: Partial<LaunchWizardDraft>) => void;
  onTagInputChange: (value: string) => void;
  uploadInputRef: RefObject<HTMLInputElement>;
}) {
  switch (question.id) {
    case "format":
      return (
        <div className="space-y-3">
          {launchFormatOptions.map((option) => (
            <LargeChoiceCard
              key={option}
              onClick={() => {
                if (option === "Other") {
                  updateDraft({
                    format: option,
                    otherClosestFormat: undefined,
                    posterStyle: draft.posterImage
                      ? draft.posterStyle
                      : getDefaultLaunchPosterStyle(draft.launchMode, option)
                  });
                  return;
                }
                autoAdvance({
                  format: option,
                  otherClosestFormat: undefined,
                  posterStyle: draft.posterImage
                    ? draft.posterStyle
                    : getDefaultLaunchPosterStyle(draft.launchMode, option)
                });
              }}
              selected={draft.format === option}
              title={option}
            />
          ))}
          {draft.format === "Other" ? (
            <div className="surface-card mt-4 p-4">
              <p className="text-sm font-semibold text-white">Which is it closest to?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {otherClosestFormatOptions.map((option) => (
                  <FilterChip
                    active={draft.otherClosestFormat === option}
                    key={option}
                    label={option}
                    onClick={() => autoAdvance({ otherClosestFormat: option })}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      );
    case "sizeBucket":
      return (
        <div className="space-y-3">
          {sizeBucketOptions.map((option) => (
            <LargeChoiceCard
              key={option}
              onClick={() => autoAdvance({ sizeBucket: option })}
              selected={draft.sizeBucket === option}
              title={option}
            />
          ))}
        </div>
      );
    case "fandomTags":
    case "simpleFandoms":
    case "producedFandoms":
      return (
        <TagSearchInput
          selected={draft.fandomTags}
          suggestions={fandomSuggestionOptions}
          tagInput={tagInput}
          updateDraft={updateDraft}
          onTagInputChange={onTagInputChange}
        />
      );
    case "softCover":
    case "simpleCover":
    case "producedCover":
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {launchPosterStyleOptions.map((option) => (
              <button
                className={`overflow-hidden rounded-[24px] border text-left transition ${
                  draft.posterStyle === option.value && !draft.posterImage
                    ? "border-app-purple/40 bg-white/[0.05] shadow-[0_18px_42px_rgba(31,28,184,0.2)]"
                    : "border-white/8 bg-[#0d1119] hover:border-white/16"
                }`}
                key={option.value}
                onClick={() =>
                  updateDraft({
                    posterStyle: option.value,
                    posterImage: undefined,
                    posterImageSourceTitle: undefined,
                    posterImagePosition: "center"
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
                  Upload one or pull from your portfolio.
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
                      updateDraft({
                        posterImage: reader.result,
                        posterImageSourceTitle: file.name,
                        posterImagePosition: "center"
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

            {draft.posterImage ? (
              <div className="mt-4 overflow-hidden rounded-[24px] border border-white/8">
                <div className="relative h-[220px]">
                  <img
                    alt={draft.generatedDraft.title}
                    className="h-full w-full object-cover"
                    src={draft.posterImage}
                    style={{ objectPosition: getMediaObjectPosition(draft.posterImagePosition) }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070c]/72 via-transparent to-transparent" />
                </div>
              </div>
            ) : null}

            {portfolioItems.length > 0 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1 subtle-scrollbar">
                {portfolioItems.slice(0, 6).map((item) => (
                  <button
                    className={`relative w-[112px] shrink-0 overflow-hidden rounded-[20px] border transition ${
                      draft.posterImage === item.image
                        ? "border-app-purple/40 shadow-[0_16px_36px_rgba(31,28,184,0.18)]"
                        : "border-white/8"
                    }`}
                    key={item.id}
                    onClick={() =>
                      updateDraft({
                        posterImage: item.image,
                        posterImageSourceTitle: item.title,
                        posterImagePosition: "center"
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

            {draft.posterImage ? (
              <div className="mt-4 space-y-4">
                <ImagePositionPicker
                  label="Image focus"
                  onChange={(value) => updateDraft({ posterImagePosition: value })}
                  value={draft.posterImagePosition}
                />
                <button
                  className="text-sm font-medium text-app-muted transition hover:text-white"
                  onClick={() =>
                    updateDraft({
                      posterImage: undefined,
                      posterImageSourceTitle: undefined,
                      posterStyle: getDefaultLaunchPosterStyle(draft.launchMode, draft.format),
                      posterImagePosition: "center"
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
      );
    case "softTiming":
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {draft.dateOptions.map((option, index) => (
              <label className="block" key={option.id}>
                <span className="mb-2 block text-sm font-semibold text-white">Date option {index + 1}</span>
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
                  onChange={(event) => {
                    const nextOptions = draft.dateOptions.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            iso: event.target.value,
                            label: event.target.value ? formatFriendlyDate(event.target.value) : ""
                          }
                        : item
                    );
                    updateDraft({ dateOptions: nextOptions });
                  }}
                  type="date"
                  value={option.iso ? option.iso.slice(0, 10) : ""}
                />
              </label>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Time window</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {timeWindowOptions.map((option) => (
                <FilterChip
                  active={draft.timeWindow === option}
                  key={option}
                  label={toTitle(option)}
                  onClick={() => updateDraft({ timeWindow: option })}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Quick picks</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickDatePresets.map((option) => (
                <FilterChip
                  active={draft.quickDatePresets.includes(option)}
                  key={option}
                  label={toTitle(option)}
                  onClick={() =>
                    updateDraft({
                      quickDatePresets: draft.quickDatePresets.includes(option)
                        ? draft.quickDatePresets.filter((item) => item !== option)
                        : [...draft.quickDatePresets, option].slice(0, 4)
                    })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      );
    case "softLocation":
      return (
        <div className="space-y-4">
          <TextField
            label="City"
            onChange={(value) => updateDraft({ city: value })}
            placeholder="Los Angeles, CA"
            value={draft.city}
          />
          <TextField
            label="Neighborhood"
            onChange={(value) => updateDraft({ neighborhood: value })}
            placeholder="Koreatown"
            value={draft.neighborhood}
          />
          <ChipMultiSelect
            label="Venue type"
            max={3}
            onChange={(values) => updateDraft({ venueTypes: values as LaunchWizardDraft["venueTypes"] })}
            options={softVenueTypeOptions}
            selected={draft.venueTypes}
          />
        </div>
      );
    case "softThreshold":
      return (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-white">Minimum people needed</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {softMinimumPeopleOptions.map((option) => (
                <FilterChip
                  active={String(draft.minimumPeopleNeeded ?? "") === option}
                  key={option}
                  label={option}
                  onClick={() =>
                    updateDraft({
                      minimumPeopleNeeded: Number.parseInt(option.replace("+", ""), 10)
                    })
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">How should entry work?</p>
            <div className="mt-3 space-y-3">
              {softEntryOptions.map((option) => (
                <LargeChoiceCard
                  key={option}
                  onClick={() => updateDraft({ entryStyle: option })}
                  selected={draft.entryStyle === option}
                  title={toTitle(option)}
                />
              ))}
            </div>
          </div>
          {draft.entryStyle === "paid" ? (
            <ChipSingleSelect
              label="Price"
              onChange={(value) => updateDraft({ priceRange: value })}
              options={simplePriceOptions}
              selected={draft.priceRange}
            />
          ) : null}
          {isNightlifeOrLarge(draft) ? (
            <ChipSingleSelect
              label="Age gate"
              onChange={(value) => updateDraft({ ageGate: value as LaunchWizardDraft["ageGate"] })}
              options={ageGateOptions}
              selected={draft.ageGate}
            />
          ) : null}
        </div>
      );
    case "softHighlights":
      return (
        <ChipMultiSelect
          label="Choose up to six"
          max={6}
          onChange={(values) => updateDraft({ guestExperienceSelections: values })}
          options={softHighlightOptions}
          selected={draft.guestExperienceSelections}
        />
      );
    case "softAlreadySet":
      return (
        <AlreadySetQuestion
          draft={draft}
          label="Choose what is already in place"
          options={softAlreadySetOptions}
          updateDraft={updateDraft}
        />
      );
    case "softCoordination":
      return (
        <ChipMultiSelect
          label="Choose what matters most"
          max={5}
          onChange={(values) => updateDraft({ coordinationSelections: values })}
          options={coordinationOptions}
          selected={draft.coordinationSelections}
        />
      );
    case "softNotes":
    case "simpleNotes":
    case "producedNotes":
      return (
        <div className="block">
          <textarea
            aria-label="Additional notes"
            className="min-h-[180px] w-full rounded-[24px] border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-white outline-none placeholder:text-app-muted"
            onChange={(event) => updateDraft({ notes: event.target.value })}
            placeholder="Dress code, accessibility notes, giveaway plans, or anything that makes this night special"
            value={draft.notes}
          />
        </div>
      );
    case "simpleDateTime":
    case "producedDateTime":
      return (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Date</span>
            <input
              className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
              onChange={(event) => updateDraft({ confirmedDate: event.target.value })}
              type="date"
              value={draft.confirmedDate ?? ""}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Start time</span>
              <input
                className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
                onChange={(event) => updateDraft({ startTime: event.target.value })}
                type="time"
                value={draft.startTime ?? ""}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">End time</span>
              <input
                className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
                onChange={(event) => updateDraft({ endTime: event.target.value })}
                type="time"
                value={draft.endTime ?? ""}
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Quick times</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["2 PM", "4 PM", "6 PM", "7 PM", "8 PM"].map((chip) => (
                <FilterChip
                  active={draft.startTime === parseTimeChip(chip)}
                  key={chip}
                  label={chip}
                  onClick={() => updateDraft({ startTime: parseTimeChip(chip) })}
                />
              ))}
            </div>
          </div>
        </div>
      );
    case "simpleLocation":
      return (
        <div className="space-y-4">
          <TextField
            label="Venue name"
            onChange={(value) => updateDraft({ venueName: value })}
            placeholder="The Hideout Café"
            value={draft.venueName}
          />
          <TextField
            label="Neighborhood or city"
            onChange={(value) => updateDraft({ city: value })}
            placeholder="Pasadena, CA"
            value={draft.city}
          />
          {!draft.venueName ? (
            <ChipMultiSelect
              label="Venue type"
              max={2}
              onChange={(values) => updateDraft({ venueTypes: values as LaunchWizardDraft["venueTypes"] })}
              options={simpleVenueTypes}
              selected={draft.venueTypes}
            />
          ) : null}
        </div>
      );
    case "simpleAccess":
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {simpleEntryOptions.map((option) => (
              <LargeChoiceCard
                key={option}
                onClick={() => updateDraft({ entryStyle: option })}
                selected={draft.entryStyle === option}
                title={toTitle(option)}
              />
            ))}
          </div>
          {draft.entryStyle === "paid" ? (
            <ChipSingleSelect
              label="Price"
              onChange={(value) => updateDraft({ priceRange: value })}
              options={simplePriceOptions}
              selected={draft.priceRange}
            />
          ) : null}
          {draft.format === "Cupsleeve / café meetup" ? (
            <ChipSingleSelect
              label="Reservation or minimum spend"
              onChange={(value) => updateDraft({ reservationStyle: value as LaunchWizardDraft["reservationStyle"] })}
              options={reservationOptions}
              selected={draft.reservationStyle}
            />
          ) : null}
        </div>
      );
    case "simpleExpect":
      return (
        <ChipMultiSelect
          label="Choose what will feel most visible"
          max={6}
          onChange={(values) => updateDraft({ guestExperienceSelections: values })}
          options={simpleExpectOptions}
          selected={draft.guestExperienceSelections}
        />
      );
    case "simpleAlreadySet":
      return (
        <AlreadySetQuestion
          draft={draft}
          label="Choose what is already set"
          options={simpleAlreadySetOptions}
          updateDraft={updateDraft}
        />
      );
    case "producedVenue":
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {(["yes, it’s booked", "I’m deciding between places", "I still need one"] as const).map((option) => (
              <LargeChoiceCard
                key={option}
                onClick={() => updateDraft({ venueStatus: option })}
                selected={draft.venueStatus === option}
                title={toTitle(option)}
              />
            ))}
          </div>
          {draft.venueStatus === "yes, it’s booked" ? (
            <>
              <TextField
                label="Venue name"
                onChange={(value) => updateDraft({ venueName: value })}
                placeholder="The Fonda"
                value={draft.venueName}
              />
              <TextField
                label="Neighborhood or city"
                onChange={(value) => updateDraft({ city: value })}
                placeholder="Los Angeles, CA"
                value={draft.city}
              />
            </>
          ) : null}
          {draft.venueStatus && draft.venueStatus !== "yes, it’s booked" ? (
            <>
              <TextField
                label="City"
                onChange={(value) => updateDraft({ city: value })}
                placeholder="Los Angeles, CA"
                value={draft.city}
              />
              <ChipMultiSelect
                label="Preferred venue type"
                max={3}
                onChange={(values) => updateDraft({ venueTypes: values as LaunchWizardDraft["venueTypes"] })}
                options={producedVenueTypes}
                selected={draft.venueTypes}
              />
            </>
          ) : null}
        </div>
      );
    case "producedAccess":
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {producedEntryOptions.map((option) => (
              <LargeChoiceCard
                key={option}
                onClick={() => updateDraft({ entryStyle: option })}
                selected={draft.entryStyle === option}
                title={toTitle(option)}
              />
            ))}
          </div>
          {draft.entryStyle === "ticketed" ? (
            <ChipSingleSelect
              label="Price"
              onChange={(value) => updateDraft({ priceRange: value })}
              options={producedPriceOptions}
              selected={draft.priceRange}
            />
          ) : null}
          {isNightlifeOrLarge(draft) ? (
            <ChipSingleSelect
              label="Age gate"
              onChange={(value) => updateDraft({ ageGate: value as LaunchWizardDraft["ageGate"] })}
              options={ageGateOptions}
              selected={draft.ageGate}
            />
          ) : null}
        </div>
      );
    case "producedExpect":
      return (
        <ChipMultiSelect
          label="Choose the visible pieces"
          max={6}
          onChange={(values) => updateDraft({ guestExperienceSelections: values })}
          options={producedExpectOptions}
          selected={draft.guestExperienceSelections}
        />
      );
    case "producedBooked":
      return (
        <AlreadySetQuestion
          draft={draft}
          label="Choose what is already booked"
          options={producedAlreadySetOptions}
          updateDraft={updateDraft}
        />
      );
    case "producedCoordination":
      return (
        <ChipMultiSelect
          label="Choose the pressure points"
          max={5}
          onChange={(values) => updateDraft({ coordinationSelections: values })}
          options={producedCoordinationOptions}
          selected={draft.coordinationSelections}
        />
      );
    default:
      return null;
  }
}

function LargeChoiceCard({
  onClick,
  selected,
  title
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full rounded-[24px] border px-4 py-5 text-left text-base font-semibold transition",
        selected
          ? "border-app-purple/40 bg-app-purple/12 text-white shadow-[0_18px_48px_rgba(31,28,184,0.18)]"
          : "border-white/10 bg-white/[0.02] text-white hover:border-white/18"
      )}
      onClick={onClick}
      type="button"
    >
      {title}
    </button>
  );
}

function TagSearchInput({
  onTagInputChange,
  selected,
  suggestions,
  tagInput,
  updateDraft
}: {
  selected: string[];
  suggestions: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
}) {
  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || selected.includes(clean) || selected.length >= 3) {
      return;
    }
    updateDraft({ fandomTags: [...selected, clean] });
    onTagInputChange("");
  }

  return (
    <div className="space-y-4">
      <div className="block">
        <input
          aria-label="Add fandom tag"
          className="w-full rounded-[24px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
          onChange={(event) => onTagInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag(tagInput);
            }
          }}
          placeholder="Search or add a tag"
          value={tagInput}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((tag) => (
          <FilterChip
            active={selected.includes(tag)}
            key={tag}
            label={tag}
            onClick={() => addTag(tag)}
          />
        ))}
      </div>
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <button
              className="rounded-full border border-app-purple/35 bg-app-purple/12 px-3 py-1.5 text-sm font-semibold text-white"
              key={tag}
              onClick={() => updateDraft({ fandomTags: selected.filter((item) => item !== tag) })}
              type="button"
            >
              {tag} ×
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  value
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white">{label}</span>
      <input
        className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function ChipMultiSelect({
  label,
  max,
  onChange,
  options,
  selected
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
  max: number;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            active={selected.includes(option)}
            key={option}
            label={option}
            onClick={() =>
              onChange(
                selected.includes(option)
                  ? selected.filter((item) => item !== option)
                  : [...selected, option].slice(0, max)
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function ChipSingleSelect({
  label,
  onChange,
  options,
  selected
}: {
  label: string;
  options: readonly string[];
  selected?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            active={selected === option}
            key={option}
            label={toTitle(option)}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}

function AlreadySetQuestion({
  draft,
  label,
  options,
  updateDraft
}: {
  draft: LaunchWizardDraft;
  options: readonly string[];
  updateDraft: (payload: Partial<LaunchWizardDraft>) => void;
  label: string;
}) {
  return (
    <div className="space-y-5">
      <ChipMultiSelect
        label={label}
        max={8}
        onChange={(values) => updateDraft({ alreadySetSelections: values })}
        options={options}
        selected={draft.alreadySetSelections}
      />

      {draft.alreadySetSelections.includes("venue") ? (
        <TextField
          label="Venue name"
          onChange={(value) => updateDraft({ venueName: value })}
          placeholder="Optional"
          value={draft.venueName}
        />
      ) : null}

      {draft.alreadySetSelections.includes("DJ / performers") || draft.alreadySetSelections.includes("lineup") ? (
        <ChipSingleSelect
          label="Lineup status"
          onChange={(value) => updateDraft({ lineupStatus: value as LaunchWizardDraft["lineupStatus"] })}
          options={lineupStatusOptions}
          selected={draft.lineupStatus}
        />
      ) : null}

      {draft.alreadySetSelections.includes("vendors") ? (
        <ChipSingleSelect
          label="Vendor count"
          onChange={(value) => updateDraft({ vendorCount: value as LaunchWizardDraft["vendorCount"] })}
          options={vendorCountOptions}
          selected={draft.vendorCount}
        />
      ) : null}
    </div>
  );
}
