import {
  BUSINESS_DEMO_USER_ID,
  CREATOR_DEMO_USER_ID,
  FAN_DEMO_USER_ID,
  HOST_DEMO_USER_ID
} from "@/src/lib/host-mode";
import {
  businessProfiles as seedBusinessProfiles
} from "@/src/data/economy";
import {
  ONBOARDING_VERSION,
  deriveOnboardingGraphs,
  getModeForBranch,
  onboardingDefaults,
  resolveBranch
} from "@/src/data/onboarding";
import {
  getDefaultPersonaIdForMode
} from "@/src/data/social";
import {
  buildFallbackCreatorProfile,
  buildProfileDraftFromOnboarding,
  mergeUsers,
  resolveCurrentUserId,
  toBusinessType
} from "@/src/lib/app-state-helpers";
import {
  type AppStateActionRuntime,
  type AppStateActions
} from "@/src/lib/app-state-types";

type ProfileActionKeys =
  | "saveCreatorServices"
  | "setMode"
  | "updateOnboarding"
  | "completeOnboarding"
  | "resetOnboarding"
  | "finishProfileSetup"
  | "updateImportedDataSettings";

export function createProfileActions(
  runtime: AppStateActionRuntime
): Pick<AppStateActions, ProfileActionKeys> {
  const { currentUserId, setState } = runtime;

  return {
    saveCreatorServices: (userId, services) => {
      setState((current) => {
        const existing = current.creatorProfiles.find((profile) => profile.id === userId);

        if (existing) {
          return {
            ...current,
            creatorProfiles: current.creatorProfiles.map((profile) =>
              profile.id === userId
                ? {
                    ...profile,
                    services,
                    stats: {
                      ...profile.stats,
                      privateServices: services.length
                    }
                  }
                : profile
            )
          };
        }

        const fallbackProfile = buildFallbackCreatorProfile(
          userId,
          mergeUsers(current.profileDrafts)
        );
        if (!fallbackProfile) {
          return current;
        }

        return {
          ...current,
          creatorProfiles: [
            {
              ...fallbackProfile,
              services,
              stats: {
                ...fallbackProfile.stats,
                privateServices: services.length
              }
            },
            ...current.creatorProfiles
          ]
        };
      });
    },
    setMode: (mode) =>
      setState((current) => ({
        ...current,
        mode,
        activePersonaId: getDefaultPersonaIdForMode(mode)
      })),
    updateOnboarding: (payload) => {
      setState((current) => {
        const merged = {
          ...current.onboarding,
          ...payload
        };
        const primaryBranch =
          merged.primaryBranch ??
          resolveBranch(merged.primaryIntent, merged.collaborationRoute);
        const mode = merged.mode ?? getModeForBranch(primaryBranch);

        return {
          ...current,
          onboarding: {
            ...merged,
            primaryBranch,
            mode,
            onboardingVersion: ONBOARDING_VERSION,
            ...deriveOnboardingGraphs(merged)
          }
        };
      });
    },
    completeOnboarding: (payload) => {
      setState((current) => {
        const merged = {
          ...current.onboarding,
          ...payload
        };
        const primaryBranch =
          merged.primaryBranch ??
          resolveBranch(merged.primaryIntent, merged.collaborationRoute);
        const mode = merged.mode ?? getModeForBranch(primaryBranch);
        const nextPersonaId = getDefaultPersonaIdForMode(mode);
        const nextUserId = resolveCurrentUserId(nextPersonaId, mode);
        const completedOnboarding = {
          ...merged,
          primaryBranch,
          mode,
          authMethod: "phone" as const,
          completed: true,
          hasCompletedOnboarding: true,
          profileSetupCompleted: true,
          usedSampleProfile: merged.usedSampleProfile ?? false,
          onboardingVersion: ONBOARDING_VERSION,
          secondaryAddOnStatus:
            merged.secondaryIntent && merged.secondaryAddOnStatus === "accepted"
              ? ("completed" as const)
              : merged.secondaryAddOnStatus ?? null,
          ...deriveOnboardingGraphs(merged)
        };

        return {
          ...current,
          mode,
          activePersonaId: nextPersonaId,
          onboarding: completedOnboarding,
          profileDrafts: {
            ...current.profileDrafts,
            [nextUserId]: buildProfileDraftFromOnboarding(
              completedOnboarding,
              current.profileDrafts[nextUserId]
            )
          },
          businessProfiles:
            mode === "business"
              ? current.businessProfiles.map((profile) =>
                  profile.ownerUserId === nextUserId
                    ? {
                        ...profile,
                        city: completedOnboarding.city || profile.city,
                        area: completedOnboarding.neighborhood || profile.area,
                        businessType:
                          toBusinessType(completedOnboarding.businessType) ??
                          profile.businessType,
                        fandomInterests:
                          completedOnboarding.businessSceneTags.length > 0
                            ? completedOnboarding.businessSceneTags
                            : profile.fandomInterests,
                        supportInterests:
                          completedOnboarding.businessGoals.length > 0
                            ? completedOnboarding.businessGoals
                            : profile.supportInterests,
                        hostingPreferences:
                          completedOnboarding.businessTalentNeeds.length > 0
                            ? completedOnboarding.businessTalentNeeds
                            : profile.hostingPreferences,
                        summary:
                          completedOnboarding.businessGoals.length > 0
                            ? `Looking for ${completedOnboarding.businessGoals.slice(0, 2).join(" and ")} in ${completedOnboarding.city || profile.city}.`
                            : profile.summary
                      }
                    : profile
                )
              : current.businessProfiles
        };
      });
    },
    resetOnboarding: () => {
      setState((current) => {
        const demoUserIds = [
          FAN_DEMO_USER_ID,
          CREATOR_DEMO_USER_ID,
          HOST_DEMO_USER_ID,
          BUSINESS_DEMO_USER_ID
        ];

        const nextProfileDrafts = Object.fromEntries(
          Object.entries(current.profileDrafts).filter(
            ([userId]) => !demoUserIds.includes(userId)
          )
        );

        return {
          ...current,
          mode: "fan",
          activePersonaId: "persona-fan",
          onboarding: onboardingDefaults,
          profileDrafts: nextProfileDrafts,
          businessProfiles: seedBusinessProfiles
        };
      });
    },
    finishProfileSetup: (payload) => {
      setState((current) => ({
        ...current,
        onboarding: {
          ...current.onboarding,
          profileSetupCompleted: true
        },
        profileDrafts: {
          ...current.profileDrafts,
          [currentUserId]: {
            ...current.profileDrafts[currentUserId],
            ...payload
          }
        }
      }));
    },
    updateImportedDataSettings: (payload) => {
      setState((current) => ({
        ...current,
        importedDataSettings: {
          ...current.importedDataSettings,
          ...payload
        }
      }));
    }
  };
}
