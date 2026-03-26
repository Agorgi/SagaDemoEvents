import {
  labelIntent,
  mockVerifyPhoneCode,
  resolveBranch,
  type OnboardingBranch,
  type OnboardingIntent,
  type OnboardingQuestionConfig,
  type OnboardingState
} from "@/src/data/onboarding";

export type OnboardingAnswerUpdate = {
  payload: Partial<OnboardingState>;
  answerId: string;
  answerValue: unknown;
};

export function buildOnboardingAnswerUpdate(
  questionId: string,
  value: unknown,
  onboarding: OnboardingState
): OnboardingAnswerUpdate {
  switch (questionId) {
    case "phone":
      return {
        payload: {
          authMethod: "phone",
          phoneNumber: typeof value === "string" ? value : onboarding.phoneNumber
        },
        answerId: "phone",
        answerValue: value
      };
    case "verify":
      return {
        payload: {},
        answerId: "verify",
        answerValue: value
      };
    case "displayName":
      return {
        payload: { displayName: typeof value === "string" ? value : onboarding.displayName },
        answerId: "displayName",
        answerValue: value
      };
    case "intentSelection":
      return {
        payload: resolvePrimaryIntentSelection(
          onboarding,
          Array.isArray(value) ? (value as OnboardingIntent[]) : []
        ),
        answerId: "intentSelection",
        answerValue: value
      };
    case "intentPriority": {
      const selected = onboarding.selectedIntents;
      const primaryIntent = value as OnboardingIntent;
      const secondaryIntent = selected.find((item) => item !== primaryIntent) ?? null;
      const primaryBranch = resolveBranch(primaryIntent, onboarding.collaborationRoute);
      return {
        payload: {
          primaryIntent,
          secondaryIntent,
          primaryBranch,
          collaborationIntent: selected.includes("find_collaborators")
        },
        answerId: "intentPriority",
        answerValue: value
      };
    }
    case "location": {
      const nextValue = value as { city: string; neighborhood: string };
      return {
        payload: {
          city: nextValue.city,
          neighborhood: nextValue.neighborhood
        },
        answerId: "location",
        answerValue: nextValue
      };
    }
    case "collaborationRoute": {
      const branch = value as OnboardingBranch;
      return {
        payload: {
          collaborationIntent: true,
          collaborationRoute: branch,
          primaryBranch: branch
        },
        answerId: "collaborationRoute",
        answerValue: value
      };
    }
    case "explorerFandoms":
    case "addonExplorerFandoms":
    case "talentScenes":
    case "organizerScenes":
      return {
        payload: { fandomTags: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "explorerEventTypes":
    case "addonExplorerEventTypes":
      return {
        payload: { eventTypePreferences: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "explorerStyle":
      return {
        payload: { outingStyleTags: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "talentSkills":
    case "addonTalentSkills":
      return {
        payload: { skills: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "talentExperience":
      return {
        payload: { experienceLevel: value as OnboardingState["experienceLevel"] },
        answerId: questionId,
        answerValue: value
      };
    case "talentEventTypes":
      return {
        payload: { workEventTypes: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "talentTravel":
      return {
        payload: { travelRadius: value as OnboardingState["travelRadius"] },
        answerId: questionId,
        answerValue: value
      };
    case "talentOpenness":
      return {
        payload: { workOpenness: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "talentPortfolio":
      return {
        payload: { portfolioLink: typeof value === "string" ? value : "" },
        answerId: questionId,
        answerValue: value
      };
    case "organizerGoal":
      return {
        payload: { organizerGoal: value as OnboardingState["organizerGoal"] },
        answerId: questionId,
        answerValue: value
      };
    case "organizerExperience":
      return {
        payload: { organizerExperience: value as OnboardingState["organizerExperience"] },
        answerId: questionId,
        answerValue: value
      };
    case "organizerEventTypes":
    case "addonOrganizerEventTypes":
      return {
        payload: { organizerEventTypes: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "organizerSupport":
      return {
        payload: { organizerSupportNeeds: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "organizerCollabTargets":
      return {
        payload: { organizerCollabTargets: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "organizerMotion":
      return {
        payload: {
          organizerHasSomethingInMotion:
            value as OnboardingState["organizerHasSomethingInMotion"]
        },
        answerId: questionId,
        answerValue: value
      };
    case "businessType":
    case "addonBusinessType":
      return {
        payload: { businessType: typeof value === "string" ? value : undefined },
        answerId: questionId,
        answerValue: value
      };
    case "businessGoals":
      return {
        payload: { businessGoals: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "businessScenes":
      return {
        payload: { businessSceneTags: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "businessNeeds":
      return {
        payload: { businessTalentNeeds: Array.isArray(value) ? value : [] },
        answerId: questionId,
        answerValue: value
      };
    case "businessSizeFit":
      return {
        payload: { businessSizeFit: value as OnboardingState["businessSizeFit"] },
        answerId: questionId,
        answerValue: value
      };
    case "socials":
      return {
        payload: { socials: (value as OnboardingState["socials"]) ?? [] },
        answerId: questionId,
        answerValue: value
      };
    case "secondaryAddonPrompt":
      return {
        payload: {
          secondaryAddOnStatus: value === "yes" ? "accepted" : "skipped"
        },
        answerId: questionId,
        answerValue: value
      };
    default:
      return {
        payload: {},
        answerId: questionId,
        answerValue: value
      };
  }
}

export function getCanContinue(
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

export function shouldShowFooter(question: OnboardingQuestionConfig) {
  return !["single-card", "secondary-addon"].includes(question.inputType);
}

export function getPrimaryButtonLabel(
  question: OnboardingQuestionConfig,
  onboarding: OnboardingState
) {
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

  return "Continue";
}

export function getShortTextValue(questionId: string, onboarding: OnboardingState) {
  switch (questionId) {
    case "displayName":
      return onboarding.displayName;
    case "talentPortfolio":
      return onboarding.portfolioLink ?? "";
    default:
      return "";
  }
}

export function getShortTextPlaceholder(questionId: string) {
  if (questionId === "displayName") {
    return "Your name";
  }

  if (questionId === "talentPortfolio") {
    return "portfolio link";
  }

  return "Type here";
}

export function getMultiValue(questionId: string, onboarding: OnboardingState) {
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

export function getTagValue(questionId: string, onboarding: OnboardingState) {
  switch (questionId) {
    case "businessScenes":
      return onboarding.businessSceneTags;
    default:
      return onboarding.fandomTags;
  }
}

export function isSingleValueSelected(
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

export function resolveQuestionCopy(
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

export function getCompletionSupportCopy(onboarding: OnboardingState) {
  if (onboarding.primaryBranch === "talent") {
    return "Your work lane is set. We’ll lead with jobs, scenes, and organizers that fit your style.";
  }

  if (onboarding.primaryBranch === "organizer") {
    return "You’re ready to build. The next step will open straight into the launch flow that fits what you want to make.";
  }

  if (onboarding.primaryBranch === "business") {
    return "You’ve got a business-facing setup now. We’ll start with talent and event fits that match your space.";
  }

  return "Your feed is tuned. We’ll start with nights, fandoms, and people that feel closer to your scene.";
}

export function getCompletionHighlights(onboarding: OnboardingState) {
  const items = [
    ...(onboarding.city ? [onboarding.city] : []),
    ...onboarding.fandomTags.slice(0, 2),
    ...(onboarding.skills.length > 0
      ? onboarding.skills.slice(0, 2)
      : onboarding.eventTypePreferences.slice(0, 2))
  ];

  return Array.from(new Set(items)).slice(0, 4);
}

function resolvePrimaryIntentSelection(
  onboarding: OnboardingState,
  selectedIntents: OnboardingIntent[]
) {
  const primaryIntent =
    selectedIntents.length === 1 ? selectedIntents[0] : onboarding.primaryIntent;
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

  return {
    selectedIntents,
    primaryIntent,
    secondaryIntent,
    primaryBranch,
    collaborationIntent: selectedIntents.includes("find_collaborators")
  } satisfies Partial<OnboardingState>;
}
