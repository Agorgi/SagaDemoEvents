import {
  type LaunchQuestionConfig,
  type LaunchWizardDraft
} from "@/src/data/launch-builder";

export function validateQuestion(question: LaunchQuestionConfig, draft: LaunchWizardDraft) {
  switch (question.id) {
    case "format":
      return Boolean(draft.format && (draft.format !== "Other" || draft.otherClosestFormat));
    case "sizeBucket":
      return Boolean(draft.sizeBucket);
    case "fandomTags":
    case "simpleFandoms":
    case "producedFandoms":
      return draft.fandomTags.length > 0;
    case "softTiming":
      return draft.dateOptions.some((option) => option.iso) && Boolean(draft.timeWindow);
    case "softLocation":
      return Boolean(draft.city) && draft.venueTypes.length > 0;
    case "softThreshold":
      return Boolean(draft.minimumPeopleNeeded) &&
        Boolean(draft.entryStyle) &&
        (draft.entryStyle !== "paid" || Boolean(draft.priceRange)) &&
        (!isNightlifeOrLarge(draft) || Boolean(draft.ageGate));
    case "softHighlights":
    case "simpleExpect":
    case "producedExpect":
    case "softCoordination":
    case "producedCoordination":
      return draft.guestExperienceSelections.length > 0 || draft.coordinationSelections.length > 0;
    case "softAlreadySet":
    case "simpleAlreadySet":
    case "producedBooked":
      return draft.alreadySetSelections.length > 0;
    case "simpleDateTime":
    case "producedDateTime":
      return Boolean(draft.confirmedDate && draft.startTime);
    case "simpleLocation":
      return Boolean(draft.city || draft.venueName);
    case "simpleAccess":
      return Boolean(draft.entryStyle) &&
        (draft.entryStyle !== "paid" || Boolean(draft.priceRange)) &&
        (draft.format !== "Cupsleeve / café meetup" || Boolean(draft.reservationStyle));
    case "producedVenue":
      if (!draft.venueStatus) {
        return false;
      }
      if (draft.venueStatus === "yes, it’s booked") {
        return Boolean(draft.venueName && draft.city);
      }
      return Boolean(draft.city && draft.venueTypes.length > 0);
    case "producedAccess":
      return Boolean(draft.entryStyle) &&
        (draft.entryStyle !== "ticketed" || Boolean(draft.priceRange)) &&
        (!isNightlifeOrLarge(draft) || Boolean(draft.ageGate));
    default:
      return true;
  }
}

export function shouldShowContinue(question: LaunchQuestionConfig) {
  return question.id !== "format" && question.id !== "sizeBucket";
}

export function isNightlifeOrLarge(draft: LaunchWizardDraft) {
  return (
    draft.format === "Party / rave" ||
    draft.format === "Live show / performance" ||
    draft.sizeBucket === "101–250" ||
    draft.sizeBucket === "250+"
  );
}

export function parseTimeChip(value: string) {
  const [hour, meridian] = value.split(" ");
  const numericHour = Number.parseInt(hour, 10);
  const normalized =
    meridian === "PM" && numericHour !== 12
      ? numericHour + 12
      : meridian === "AM" && numericHour === 12
        ? 0
        : numericHour;
  return `${String(normalized).padStart(2, "0")}:00`;
}

export function formatFriendlyDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short"
  });
}

export function toTitle(value: string) {
  return value
    .split(/[\s/-]+/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}
