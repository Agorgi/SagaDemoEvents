import {
  getBusinessProfileById,
  getStorefrontForUser,
  opportunities as seedOpportunities,
  storefronts,
  type Listing
} from "@/src/data/economy";
import {
  createActivityEntry
} from "@/src/lib/app-state-helpers";
import {
  createPosterDataUri
} from "@/src/lib/demo-media";
import {
  getWorkTabHref,
  WORK_TABS
} from "@/src/lib/routes";
import {
  type AppStateActionRuntime,
  type AppStateActions
} from "@/src/lib/app-state-types";

type EconomyActionKeys =
  | "getApplicationsForOpportunity"
  | "getApplicationForCurrentUser"
  | "applyToOpportunity"
  | "createListing"
  | "toggleListingInterest"
  | "respondToBusinessMatch"
  | "updateBusinessProfile";

export function createEconomyActions(
  runtime: AppStateActionRuntime
): Pick<AppStateActions, EconomyActionKeys> {
  const { creatorProfiles, currentProfile, currentUser, currentUserId, setState, state } =
    runtime;

  return {
    getApplicationsForOpportunity: (opportunityId) =>
      state.opportunityApplications.filter(
        (application) => application.opportunityId === opportunityId
      ),
    getApplicationForCurrentUser: (opportunityId) =>
      state.opportunityApplications.find(
        (application) =>
          application.opportunityId === opportunityId &&
          application.userId === currentUserId
      ),
    applyToOpportunity: (opportunityId, note) => {
      const opportunity = seedOpportunities.find((item) => item.id === opportunityId);
      if (!opportunity) {
        return;
      }

      const trimmedNote = note.trim();

      setState((current) => {
        const existing = current.opportunityApplications.find(
          (application) =>
            application.opportunityId === opportunityId &&
            application.userId === currentUserId
        );

        const nextApplication = existing
          ? {
              ...existing,
              note: trimmedNote || existing.note,
              status: "submitted" as const,
              submittedAt: new Date().toISOString()
            }
          : {
              id: `application-${opportunityId}-${currentUserId}`,
              opportunityId,
              userId: currentUserId,
              status: "submitted" as const,
              note: trimmedNote || "Interested and available for the timing listed.",
              submittedAt: new Date().toISOString()
            };

        return {
          ...current,
          mode: "creator",
          opportunityApplications: existing
            ? current.opportunityApplications.map((application) =>
                application.id === existing.id ? nextApplication : application
              )
            : [nextApplication, ...current.opportunityApplications],
          inbox: [
            {
              id: `inbox-opportunity-${opportunityId}-${Date.now()}`,
              kind: "team",
              title: "Application sent",
              body: `${opportunity.title} is now in your work queue.`,
              href: getWorkTabHref(WORK_TABS.roles),
              createdAt: new Date().toISOString(),
              unread: true
            },
            ...current.inbox
          ],
          activityLog: [
            createActivityEntry({
              kind: "creator",
              actorIds: [currentUserId],
              title: `Applied to ${opportunity.title}`,
              body: opportunity.summary,
              href: `/opportunities/${opportunityId}`
            }),
            ...current.activityLog
          ]
        };
      });
    },
    createListing: (payload) => {
      const slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const id = `listing-${slug || "new"}-${Math.random().toString(36).slice(2, 6)}`;
      const storefront =
        getStorefrontForUser(currentUserId) ??
        storefronts.find((item) => item.ownerUserId === currentUserId);
      const currentCreatorProfile = creatorProfiles.find(
        (profile) => profile.id === currentUserId
      );

      const listing: Listing = {
        id,
        creatorUserId: currentUserId,
        storefrontId: storefront?.id ?? `storefront-${currentUserId}`,
        type: payload.type,
        title: payload.title,
        summary: payload.summary,
        description: payload.description,
        priceLabel: payload.priceLabel,
        city: payload.city ?? currentUser.city,
        imageUrl:
          payload.imageUrl ??
          currentProfile?.coverImageUrl ??
          currentCreatorProfile?.coverImage ??
          currentUser.avatarUrl ??
          createPosterDataUri({
            title: payload.title,
            subtitle: payload.summary,
            eyebrow: payload.type,
            accent: "#1F1CB8",
            accent2: "#6D5EF3"
          }),
        fandomTags: payload.fandomTags,
        sublabel:
          payload.sublabel ??
          (payload.type === "service"
            ? "Service"
            : payload.type === "commission"
              ? "Commission"
              : payload.type === "resale"
                ? "Resale"
                : "Merch"),
        schema: {
          entityType: "listing",
          subtypes: [payload.type],
          location: payload.city ?? currentUser.city,
          summary: payload.summary,
          coreSkills: currentUser.skills.slice(0, 4),
          operationalStrengths: currentUser.skills.slice(0, 3),
          primaryInterests: payload.fandomTags,
          franchiseInterests: payload.fandomTags,
          audienceOrientation: ["fans", "hosts", "creators"],
          eventFormats: ["social", "pop-up"],
          embeddingTags: [...payload.fandomTags, payload.type],
          confidenceNotes: [
            "Created from the demo flow.",
            "Visible on the creator profile and Work hub right away."
          ]
        }
      };

      setState((current) => ({
        ...current,
        mode: "creator",
        listings: [listing, ...current.listings],
        inbox: [
          {
            id: `inbox-listing-${id}`,
            kind: "updates",
            title: "Listing is live",
            body: `${listing.title} now appears on your storefront.`,
            href: `/listings/${id}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "creator",
            actorIds: [currentUserId],
            title: `New listing: ${listing.title}`,
            body: listing.summary,
            href: `/listings/${id}`,
            imageUrl: listing.imageUrl
          }),
          ...current.activityLog
        ]
      }));

      return id;
    },
    toggleListingInterest: (listingId, kind) => {
      const listing = state.listings.find((item) => item.id === listingId);
      if (!listing) {
        return;
      }

      setState((current) => {
        const existing = current.listingInterests.find(
          (interest) => interest.listingId === listingId && interest.userId === currentUserId
        );
        const nextInterest = {
          id: existing?.id ?? `listing-interest-${listingId}-${currentUserId}`,
          listingId,
          userId: currentUserId,
          kind,
          createdAt: new Date().toISOString()
        };

        return {
          ...current,
          listingInterests: existing
            ? current.listingInterests.map((interest) =>
                interest.id === existing.id ? nextInterest : interest
              )
            : [nextInterest, ...current.listingInterests],
          inbox: [
            {
              id: `inbox-listing-interest-${listingId}-${Date.now()}`,
              kind: "updates",
              title:
                kind === "mock_purchased"
                  ? "Order noted"
                  : kind === "requested"
                    ? "Request sent"
                    : "Saved to shop list",
              body:
                kind === "mock_purchased"
                  ? `${listing.title} is now tracked in your activity.`
                  : kind === "requested"
                    ? `Your request for ${listing.title} was saved.`
                    : `${listing.title} is now pinned for later.`,
              href: `/listings/${listingId}`,
              createdAt: new Date().toISOString(),
              unread: true
            },
            ...current.inbox
          ]
        };
      });
    },
    respondToBusinessMatch: (businessId, targetType, targetId, action) => {
      const business = getBusinessProfileById(businessId, state.businessProfiles);
      if (!business) {
        return;
      }

      setState((current) => {
        const existing = current.supportIntents.find(
          (intent) =>
            intent.businessId === businessId &&
            intent.targetType === targetType &&
            intent.targetId === targetId
        );

        const nextIntent = {
          id: existing?.id ?? `support-${businessId}-${targetType}-${targetId}`,
          businessId,
          targetType,
          targetId,
          action,
          createdAt: new Date().toISOString()
        };

        const nextLaunches = current.launches.map((launch) =>
          launch.id === targetId && targetType === "launch"
            ? {
                ...launch,
                updates: [
                  {
                    id: `${launch.id}-business-${Date.now()}`,
                    title:
                      action === "hosting"
                        ? `${business.name} wants to host`
                        : `${business.name} wants to support`,
                    body:
                      action === "hosting"
                        ? "A venue-side partner expressed interest in holding the room if the launch keeps momentum."
                        : "A business-side partner wants to support the launch if it continues building signal.",
                    createdAt: new Date().toISOString()
                  },
                  ...launch.updates
                ]
              }
            : launch
        );

        return {
          ...current,
          supportIntents: existing
            ? current.supportIntents.map((intent) =>
                intent.id === existing.id ? nextIntent : intent
              )
            : [nextIntent, ...current.supportIntents],
          launches: nextLaunches,
          inbox: [
            {
              id: `inbox-business-${businessId}-${targetId}-${Date.now()}`,
              kind: "updates",
              title:
                action === "hosting"
                  ? "Hosting intent sent"
                  : action === "supporting"
                    ? "Support intent sent"
                    : "Saved to contenders",
              body: `${business.name} now has this match on its slate.`,
              href: `/businesses/${businessId}`,
              createdAt: new Date().toISOString(),
              unread: true
            },
            ...current.inbox
          ],
          activityLog: [
            createActivityEntry({
              kind: "creator",
              actorIds: [currentUserId],
              title:
                action === "hosting"
                  ? `${business.name} wants to host this`
                  : action === "supporting"
                    ? `${business.name} wants to support this`
                    : `${business.name} saved a match`,
              body: "Business-side matches stay explainable and lightweight in this prototype.",
              href: `/businesses/${businessId}`
            }),
            ...current.activityLog
          ]
        };
      });
    },
    updateBusinessProfile: (businessId, payload) => {
      setState((current) => ({
        ...current,
        businessProfiles: current.businessProfiles.map((profile) =>
          profile.id === businessId
            ? {
                ...profile,
                hostingPreferences:
                  payload.hostingPreferences ?? profile.hostingPreferences,
                supportInterests:
                  payload.supportInterests ?? profile.supportInterests,
                fandomInterests:
                  payload.fandomInterests ?? profile.fandomInterests
              }
            : profile
        )
      }));
    }
  };
}
