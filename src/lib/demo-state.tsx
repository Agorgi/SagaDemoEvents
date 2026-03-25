"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState
} from "react";

import {
  events as seedEvents,
  seedFeedPosts,
  getEventById,
  getUserById,
  messages as seedMessages,
  roles as seedRoles,
  users,
  type DemoEvent,
  type DemoFeedPost,
  type DemoRole,
  type DemoThread,
  type Persona
} from "@/src/data/demo";
import {
  getCommissionById,
  seedCommissions,
  type CommissionType,
  type DemoCommission
} from "@/src/data/commissions";
import { createPosterDataUri, createStoryCardDataUri } from "@/src/lib/demo-media";
import { slugify } from "@/src/lib/utils";
import { buildShortlist, getRoleCounts } from "@/src/lib/matching";

type PersistedDemoState = {
  persona: Persona;
  events: DemoEvent[];
  roles: DemoRole[];
  messages: DemoThread[];
  commissions: DemoCommission[];
  posts: DemoFeedPost[];
  joinedEventIds: string[];
  savedEventIds: string[];
};

type CommitFundsPayload = {
  commissionId: string;
  userId: string;
  amount: number;
  tierId?: string;
  note: string;
};

type CreateCommissionPayload = {
  title: string;
  type: CommissionType;
  city: string;
  goalAmount: number;
  timingLabel: string;
  description: string;
  fandomTags: string[];
  tiers: Array<{
    title: string;
    amount: number;
    description: string;
    perks: string[];
  }>;
  openRoles: Array<{
    roleName: string;
    payoutRange: [number, number];
    requiredSkills: string[];
  }>;
  imageUrl: string;
};

type CreateEventPayload = {
  name: string;
  dateTime: string;
  location: string;
  description: string;
  communities: string;
  eventFormat: string;
  sourceCrew: boolean;
  posterUrl?: string;
};

type CreatePostPayload = {
  caption: string;
  communities: string;
  audience: string;
};

type UpdateEventPayload = {
  eventId: string;
  title: string;
  subtitle: string;
  description: string;
  city: string;
  venue: string;
  startsAt: string;
  fandomTags: string[];
};

type DemoStore = PersistedDemoState & {
  hydrated: boolean;
  activeUserId: string;
  setPersona: (persona: Persona) => void;
  joinEvent: (eventId: string) => void;
  toggleSavedEvent: (eventId: string) => void;
  createEvent: (payload: CreateEventPayload, hostIdOverride?: string) => string;
  createPost: (payload: CreatePostPayload) => string;
  updateEvent: (payload: UpdateEventPayload) => void;
  inviteCandidate: (payload: {
    eventId: string;
    roleId: string;
    candidateUserId: string;
  }) => void;
  confirmRole: (payload: {
    eventId: string;
    roleId: string;
    candidateUserId?: string;
  }) => void;
  autoStaffEvent: (eventId: string) => void;
  applyToRole: (payload: {
    eventId: string;
    roleId: string;
    applicantUserId: string;
    availability: string;
    quote: number;
    note: string;
  }) => void;
  passApplicant: (payload: {
    eventId: string;
    roleId: string;
    applicantUserId: string;
  }) => void;
  commitFunds: (payload: CommitFundsPayload) => void;
  createCommission: (payload: CreateCommissionPayload) => string;
  applyToCommissionRole: (payload: {
    commissionId: string;
    roleId: string;
    applicantUserId: string;
  }) => void;
  resetDemo: () => void;
  getEventCounts: (eventId: string) => { total: number; filled: number; open: number };
};

type DemoAction =
  | { type: "hydrate"; payload: PersistedDemoState }
  | { type: "set-persona"; payload: Persona }
  | { type: "join-event"; payload: { eventId: string } }
  | { type: "toggle-saved-event"; payload: { eventId: string } }
  | { type: "create-event"; payload: CreateEventPayload & { id: string; hostId: string } }
  | { type: "create-post"; payload: CreatePostPayload & { id: string; authorId: string } }
  | {
      type: "invite-candidate";
      payload: { eventId: string; roleId: string; candidateUserId: string };
    }
  | {
      type: "confirm-role";
      payload: { eventId: string; roleId: string; candidateUserId?: string };
    }
  | { type: "auto-staff"; payload: { eventId: string } }
  | {
      type: "apply";
      payload: {
        eventId: string;
        roleId: string;
        applicantUserId: string;
        availability: string;
        quote: number;
        note: string;
      };
    }
  | { type: "commit-funds"; payload: CommitFundsPayload }
  | { type: "update-event"; payload: UpdateEventPayload }
  | {
      type: "create-commission";
      payload: CreateCommissionPayload & { id: string; hostId: string };
    }
  | {
      type: "apply-commission-role";
      payload: { commissionId: string; roleId: string; applicantUserId: string };
    }
  | {
      type: "pass-applicant";
      payload: { eventId: string; roleId: string; applicantUserId: string };
    }
  | { type: "reset" };

const STORAGE_KEY = "saga-demo-state-v7";
const DEFAULT_ACTIVE_USER_ID = "user-kai";
const seedPersistedState: PersistedDemoState = {
  persona: "fan",
  events: seedEvents,
  roles: seedRoles,
  messages: seedMessages,
  commissions: seedCommissions,
  posts: seedFeedPosts,
  joinedEventIds: ["jujutsu-night-out"],
  savedEventIds: ["court-of-stars", "love-and-deepspace-afterdark"]
};

function buildInitialPersistedState(): PersistedDemoState {
  return structuredClone(seedPersistedState);
}

const initialPersistedState = buildInitialPersistedState();

const DemoStateContext = createContext<DemoStore | null>(null);
const seedEventMap = new Map(seedEvents.map((event) => [event.id, event]));
const seedCommissionMap = new Map(
  seedCommissions.map((commission) => [commission.id, commission])
);

function timestamp() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseCommunities(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function resolveStartDate(dateTime: string) {
  const parsed = Date.parse(dateTime);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 14);
  fallback.setHours(19, 0, 0, 0);
  return fallback;
}

function resolveLocation(location: string, hostCity: string) {
  const trimmed = location.trim();
  if (!trimmed) {
    return { city: hostCity, venue: hostCity };
  }

  const segments = trimmed.split(",").map((segment) => segment.trim()).filter(Boolean);
  if (segments.length >= 3) {
    return {
      venue: segments[0],
      city: segments.slice(1).join(", ")
    };
  }

  if (segments.length === 2) {
    return {
      venue: trimmed,
      city: trimmed
    };
  }

  return {
    venue: trimmed,
    city: trimmed
  };
}

function buildEventTemplateRoles(
  eventId: string,
  eventFormat: string,
  sourceCrew: boolean
): DemoRole[] {
  if (!sourceCrew) {
    return [];
  }

  const templates =
    eventFormat === "Screening"
      ? [
          { roleName: "Projection Ops", requiredSkills: ["audio", "ops", "run of show"], payoutRange: [220, 420] as [number, number] },
          { roleName: "Door / Check-in", requiredSkills: ["check-in", "guest lists", "front of house"], payoutRange: [150, 260] as [number, number] },
          { roleName: "Community Moderator", requiredSkills: ["hosting", "community moderation", "run of show"], payoutRange: [180, 320] as [number, number] }
        ]
      : eventFormat === "Creator collab"
        ? [
            { roleName: "Creator Liaison", requiredSkills: ["creator coordination", "hospitality", "run of show"], payoutRange: [220, 420] as [number, number] },
            { roleName: "Photographer", requiredSkills: ["photography", "portrait lighting", "editing"], payoutRange: [260, 520] as [number, number] },
            { roleName: "Social Promo", requiredSkills: ["social promo", "creator outreach", "copywriting"], payoutRange: [200, 380] as [number, number] }
          ]
        : eventFormat === "Free meetup"
          ? [
              { roleName: "Community Check-in", requiredSkills: ["check-in", "hospitality", "community moderation"], payoutRange: [120, 220] as [number, number] },
              { roleName: "Photo Capture", requiredSkills: ["photography", "reels", "editing"], payoutRange: [180, 320] as [number, number] }
            ]
          : [
              { roleName: "Photographer", requiredSkills: ["photography", "portrait lighting", "editing"], payoutRange: [260, 520] as [number, number] },
              { roleName: "Door / Check-in", requiredSkills: ["check-in", "guest lists", "front of house"], payoutRange: [150, 260] as [number, number] },
              { roleName: "Social Promo", requiredSkills: ["social promo", "creator outreach", "copywriting"], payoutRange: [200, 380] as [number, number] }
            ];

  return templates.map((template) => ({
    id: makeId(`role-${slugify(template.roleName)}`),
    eventId,
    roleName: template.roleName,
    status: "open" as const,
    payoutRange: template.payoutRange,
    requiredSkills: template.requiredSkills,
    applicants: []
  }));
}

function buildEventPayload(
  payload: CreateEventPayload & { id: string; hostId: string }
): { event: DemoEvent; roles: DemoRole[] } {
  const host = getUserById(payload.hostId);
  const start = resolveStartDate(payload.dateTime);
  const end = new Date(start);
  end.setHours(end.getHours() + 4);

  const communities = parseCommunities(payload.communities);
  const location = resolveLocation(payload.location, host?.city ?? "Pasadena, CA");
  const event: DemoEvent = {
    id: payload.id,
    title: payload.name.trim(),
    subtitle:
      payload.description.trim().slice(0, 88) ||
      `${payload.eventFormat} planned with Saga crew sourcing`,
    description:
      payload.description.trim() ||
      "New Saga event drafted from the feed composer and ready for crew matching.",
    fandomTags: communities.length > 0 ? communities : ["Community Event"],
    city: location.city,
    venue: location.venue,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    posterUrl:
      payload.posterUrl ??
      createPosterDataUri({
        title: payload.name.trim(),
        subtitle: payload.description.trim().slice(0, 54) || payload.eventFormat,
        eyebrow: communities[0] ?? payload.eventFormat,
        accent: "#1F1CB8",
        accent2: "#5E8BFF"
      }),
    hostId: payload.hostId,
    attendeesCount: 84,
    mutualsCount: 6,
    communityCount: 128,
    priceLabel: payload.eventFormat === "Free meetup" ? "Free" : "$18+",
    isFree: payload.eventFormat === "Free meetup",
    recommended: true
  };

  return {
    event,
    roles: buildEventTemplateRoles(payload.id, payload.eventFormat, payload.sourceCrew)
  };
}

function buildPostPayload(
  payload: CreatePostPayload & { id: string; authorId: string }
): DemoFeedPost {
  const caption = payload.caption.trim();
  const fandomTags = parseCommunities(payload.communities);
  const format = caption.length > 220 || caption.includes("\n\n") ? "story" : "image";
  const title =
    caption.split(/[.!?\n]/)[0]?.trim().slice(0, 72) ||
    toTitleCase(fandomTags[0] ?? "Saga post");

  return {
    id: payload.id,
    authorId: payload.authorId,
    format,
    title,
    caption,
    body: format === "story" ? caption : undefined,
    imageUrl:
      format === "story"
        ? createStoryCardDataUri({
            title,
            excerpt: caption.slice(0, 180)
          })
        : createPosterDataUri({
            title,
            subtitle: payload.audience.trim() || "New feed post",
            eyebrow: fandomTags[0] ?? "post",
            accent: "#FF6B96",
            accent2: "#1F1CB8"
          }),
    fandomTags: fandomTags.length > 0 ? fandomTags : ["Community Post"],
    createdAt: timestamp(),
    likes: 0,
    comments: 0
  };
}

function buildInviteDraft(
  eventList: DemoEvent[],
  roleList: DemoRole[],
  eventId: string,
  roleId: string,
  candidateUserId: string
) {
  const event = getEventById(eventId, eventList);
  const role = roleList.find((item) => item.id === roleId);
  const candidate = getUserById(candidateUserId);
  const host = getUserById(event?.hostId);

  if (!event || !role || !candidate || !host) {
    return "";
  }

  const cityLead = candidate.city === event.city ? "local" : "willing to travel";
  return `Hey ${candidate.name.split(" ")[0]}, Saga shortlisted you for ${role.roleName} on ${event.title}. You are ${cityLead}, have worked ${candidate.pastEventsWorked} fandom events, and match ${event.fandomTags[0]}. Want to lock this in around $${role.payoutRange[1]}?`;
}

function buildMockResponse(roleName: string, candidateName: string) {
  if (roleName.toLowerCase().includes("photo")) {
    return `${candidateName.split(" ")[0]} can cover hero moments plus candids if there is a small lighting corner.`;
  }
  if (roleName.toLowerCase().includes("decor")) {
    return `${candidateName.split(" ")[0]} is in if load-in starts by 4 PM and they can bring one assistant.`;
  }
  if (roleName.toLowerCase().includes("promo")) {
    return `${candidateName.split(" ")[0]} can push teaser edits this week and creator outreach tonight.`;
  }
  if (roleName.toLowerCase().includes("dj")) {
    return `${candidateName.split(" ")[0]} is good for a 90-minute set and can bring a fandom-first playlist.`;
  }
  return `${candidateName.split(" ")[0]} is available and interested in the role details.`;
}

function syncSeedEvents(eventList: DemoEvent[]) {
  const seen = new Set<string>();

  const mergedEvents = eventList.map((event) => {
    const seededEvent = seedEventMap.get(event.id);
    if (!seededEvent) {
      return event;
    }

    seen.add(event.id);
    return {
      ...seededEvent,
      ...event,
      posterUrl: seededEvent.posterUrl
    };
  });

  return [
    ...mergedEvents,
    ...seedEvents.filter((event) => !seen.has(event.id))
  ];
}

function syncSeedCommissions(commissionList: DemoCommission[]) {
  const seen = new Set<string>();

  const mergedCommissions = commissionList.map((commission) => {
    const seededCommission = seedCommissionMap.get(commission.id);
    if (!seededCommission) {
      return commission;
    }

    seen.add(commission.id);
    return {
      ...seededCommission,
      raisedAmount: commission.raisedAmount,
      backerCount: commission.backerCount,
      status: commission.status,
      openRoles: commission.openRoles,
      activity: commission.activity,
      backedByUserIds: commission.backedByUserIds
    };
  });

  return [
    ...mergedCommissions,
    ...seedCommissions.filter((commission) => !seen.has(commission.id))
  ];
}

function upsertThread(
  threadList: DemoThread[],
  payload: {
    eventId: string;
    roleId: string;
    participantIds: string[];
    draft: string;
    outgoing?: { senderId: string; text: string };
    incoming?: { senderId: string; text: string };
  }
) {
  const existingIndex = threadList.findIndex(
    (thread) =>
      thread.eventId === payload.eventId &&
      thread.roleId === payload.roleId &&
      payload.participantIds.every((participant) =>
        thread.participants.includes(participant)
      )
  );

  const nextMessages: DemoThread["messages"] = [];
  if (payload.outgoing) {
    nextMessages.push({
      id: `msg-${payload.roleId}-${Math.random().toString(36).slice(2, 8)}`,
      senderId: payload.outgoing.senderId,
      text: payload.outgoing.text,
      createdAt: timestamp()
    });
  }
  if (payload.incoming) {
    nextMessages.push({
      id: `msg-${payload.roleId}-${Math.random().toString(36).slice(2, 8)}`,
      senderId: payload.incoming.senderId,
      text: payload.incoming.text,
      createdAt: timestamp()
    });
  }

  if (existingIndex === -1) {
    return [
      ...threadList,
      {
        id: `thread-${payload.roleId}-${payload.participantIds.at(-1) ?? "new"}`,
        eventId: payload.eventId,
        roleId: payload.roleId,
        participants: payload.participantIds,
        draft: payload.draft,
        messages: nextMessages
      }
    ];
  }

  return threadList.map((thread, index) =>
    index === existingIndex
      ? {
          ...thread,
          participants: Array.from(
            new Set([...thread.participants, ...payload.participantIds])
          ),
          draft: payload.draft,
          messages: [...thread.messages, ...nextMessages]
        }
      : thread
  );
}

function reducer(state: PersistedDemoState, action: DemoAction): PersistedDemoState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "set-persona":
      return { ...state, persona: action.payload };
    case "join-event":
      return {
        ...state,
        joinedEventIds: Array.from(
          new Set([...state.joinedEventIds, action.payload.eventId])
        )
      };
    case "toggle-saved-event": {
      const exists = state.savedEventIds.includes(action.payload.eventId);
      return {
        ...state,
        savedEventIds: exists
          ? state.savedEventIds.filter((eventId) => eventId !== action.payload.eventId)
          : [...state.savedEventIds, action.payload.eventId]
      };
    }
    case "create-event": {
      const { event, roles } = buildEventPayload(action.payload);
      return {
        ...state,
        events: [event, ...state.events],
        roles: [...roles, ...state.roles],
        joinedEventIds: Array.from(new Set([event.id, ...state.joinedEventIds]))
      };
    }
    case "create-post": {
      const nextPost = buildPostPayload(action.payload);
      return {
        ...state,
        posts: [nextPost, ...state.posts]
      };
    }
    case "update-event": {
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.eventId
            ? {
                ...event,
                title: action.payload.title.trim(),
                subtitle: action.payload.subtitle.trim(),
                description: action.payload.description.trim(),
                city: action.payload.city.trim(),
                venue: action.payload.venue.trim(),
                startsAt: action.payload.startsAt,
                fandomTags: action.payload.fandomTags
              }
            : event
        )
      };
    }
    case "invite-candidate": {
      const event = getEventById(action.payload.eventId, state.events);
      const candidate = getUserById(action.payload.candidateUserId);
      if (!event || !candidate) {
        return state;
      }

      const nextRoles = state.roles.map((role) =>
        role.id === action.payload.roleId && role.status !== "filled"
          ? {
              ...role,
              status: "invited" as const,
              invitedUserId: candidate.id
            }
          : role
      );

      const draft = buildInviteDraft(
        state.events,
        nextRoles,
        action.payload.eventId,
        action.payload.roleId,
        candidate.id
      );

      const nextMessages = upsertThread(state.messages, {
        eventId: action.payload.eventId,
        roleId: action.payload.roleId,
        participantIds: [event.hostId, candidate.id],
        draft,
        outgoing: {
          senderId: event.hostId,
          text: draft
        },
        incoming: {
          senderId: candidate.id,
          text: buildMockResponse(
            nextRoles.find((role) => role.id === action.payload.roleId)?.roleName ??
              "role",
            candidate.name
          )
        }
      });

      return {
        ...state,
        roles: nextRoles,
        messages: nextMessages
      };
    }
    case "confirm-role": {
      const role = state.roles.find((item) => item.id === action.payload.roleId);
      const candidateId =
        action.payload.candidateUserId ?? role?.invitedUserId ?? role?.filledByUserId;
      const event = getEventById(action.payload.eventId, state.events);
      const candidate = getUserById(candidateId);
      if (!role || !candidateId || !event || !candidate) {
        return state;
      }

      const nextRoles = state.roles.map((item) =>
        item.id === action.payload.roleId
          ? {
              ...item,
              status: "filled" as const,
              filledByUserId: candidateId,
              invitedUserId: undefined
            }
          : item
      );

      const nextMessages = upsertThread(state.messages, {
        eventId: action.payload.eventId,
        roleId: action.payload.roleId,
        participantIds: [event.hostId, candidateId],
        draft: `${candidate.name.split(" ")[0]} confirmed for ${role.roleName}.`,
        outgoing: {
          senderId: event.hostId,
          text: `Locked. You are confirmed as ${role.roleName} for ${event.title}.`
        }
      });

      return {
        ...state,
        roles: nextRoles,
        messages: nextMessages
      };
    }
    case "auto-staff": {
      const event = getEventById(action.payload.eventId, state.events);
      if (!event) {
        return state;
      }

      let nextRoles = [...state.roles];
      let nextMessages = [...state.messages];

      const openRoles = nextRoles
        .filter((role) => role.eventId === event.id && role.status !== "filled")
        .slice(0, 3);

      openRoles.forEach((role) => {
        const candidateId =
          role.invitedUserId ??
          buildShortlist(event, role, users, nextRoles)[0]?.user.id;
        const candidate = getUserById(candidateId);
        if (!candidateId || !candidate) {
          return;
        }

        nextRoles = nextRoles.map((item) =>
          item.id === role.id
            ? {
                ...item,
                status: "filled" as const,
                filledByUserId: candidateId,
                invitedUserId: undefined
              }
            : item
        );

        nextMessages = upsertThread(nextMessages, {
          eventId: event.id,
          roleId: role.id,
          participantIds: [event.hostId, candidateId],
          draft: `${candidate.name.split(" ")[0]} confirmed through Saga auto-staff.`,
          outgoing: {
            senderId: event.hostId,
            text: `Saga auto-staffed ${role.roleName} with ${candidate.handle}.`
          },
          incoming: {
            senderId: candidateId,
            text: `Confirmed. I will take ${role.roleName.toLowerCase()} for ${event.title}.`
          }
        });
      });

      return {
        ...state,
        roles: nextRoles,
        messages: nextMessages
      };
    }
    case "apply": {
      const event = getEventById(action.payload.eventId, state.events);
      const applicant = getUserById(action.payload.applicantUserId);
      if (!event || !applicant) {
        return state;
      }

      const nextRoles = state.roles.map((role) => {
        if (role.id !== action.payload.roleId) {
          return role;
        }

        const alreadyApplied = role.applicants.some(
          (entry) => entry.applicantUserId === applicant.id
        );
        if (alreadyApplied) {
          return role;
        }

        return {
          ...role,
          applicants: [
            ...role.applicants,
            {
              applicantUserId: applicant.id,
              availability: action.payload.availability,
              quote: action.payload.quote,
              note: action.payload.note,
              createdAt: timestamp()
            }
          ]
        };
      });

      const role = nextRoles.find((item) => item.id === action.payload.roleId);
      const nextMessages = upsertThread(state.messages, {
        eventId: action.payload.eventId,
        roleId: action.payload.roleId,
        participantIds: [event.hostId, applicant.id],
        draft: `${applicant.handle} submitted an application for ${role?.roleName ?? "this role"}.`,
        incoming: {
          senderId: applicant.id,
          text: `New applicant: ${action.payload.availability}, quote $${action.payload.quote}. ${action.payload.note}`
        }
      });

      return {
        ...state,
        roles: nextRoles,
        messages: nextMessages
      };
    }
    case "pass-applicant": {
      return {
        ...state,
        roles: state.roles.map((role) =>
          role.id === action.payload.roleId && role.eventId === action.payload.eventId
            ? {
                ...role,
                applicants: role.applicants.filter(
                  (entry) => entry.applicantUserId !== action.payload.applicantUserId
                ),
                invitedUserId:
                  role.invitedUserId === action.payload.applicantUserId
                    ? undefined
                    : role.invitedUserId,
                status:
                  role.invitedUserId === action.payload.applicantUserId &&
                  role.status === "invited"
                    ? ("open" as const)
                    : role.status
              }
            : role
        )
      };
    }
    case "commit-funds": {
      const commission = getCommissionById(action.payload.commissionId, state.commissions);
      const backer = getUserById(action.payload.userId);
      if (!commission || !backer || action.payload.amount <= 0) {
        return state;
      }

      const nextRaisedAmount = commission.raisedAmount + action.payload.amount;
      const becameFunded =
        commission.raisedAmount < commission.goalAmount &&
        nextRaisedAmount >= commission.goalAmount;

      const nextCommissions = state.commissions.map((item) => {
        if (item.id !== commission.id) {
          return item;
        }

        const selectedTier = item.tiers.find((tier) => tier.id === action.payload.tierId);
        const nextActivity = [
          {
            id: makeId("commission-activity"),
            authorId: backer.id,
            type: "commitment" as const,
            text: action.payload.note.trim()
              ? action.payload.note.trim()
              : selectedTier
                ? `Backed ${selectedTier.title} to help move this into production.`
                : `Committed funds to help this commission happen.`,
            createdAt: timestamp(),
            amount: action.payload.amount
          },
          ...(becameFunded
            ? [
                {
                  id: makeId("commission-activity"),
                  authorId: item.hostId,
                  type: "update" as const,
                  text: "Backed — production unlocked. Saga can move this from idea to execution.",
                  createdAt: timestamp()
                }
              ]
            : []),
          ...item.activity
        ];

        return {
          ...item,
          raisedAmount: nextRaisedAmount,
          backerCount: item.backerCount + 1,
          status: becameFunded ? ("funded" as const) : item.status,
          backedByUserIds: Array.from(new Set([...item.backedByUserIds, backer.id])),
          activity: nextActivity
        };
      });

      return {
        ...state,
        commissions: nextCommissions
      };
    }
    case "create-commission": {
      const daysLeftMatch = action.payload.timingLabel.match(/(\d+)/);
      const daysLeft = daysLeftMatch ? Math.max(3, Number(daysLeftMatch[1])) : 14;
      const fandomTags =
        action.payload.fandomTags.length > 0
          ? action.payload.fandomTags
          : action.payload.type === "event"
            ? ["Community Event"]
            : ["Creator Project"];

      const nextCommission: DemoCommission = {
        id: action.payload.id,
        title: action.payload.title,
        shortDescription: action.payload.description,
        description: action.payload.description,
        type: action.payload.type,
        fandomTags,
        city: action.payload.city,
        timingLabel: action.payload.timingLabel,
        hostId: action.payload.hostId,
        goalAmount: action.payload.goalAmount,
        raisedAmount: 0,
        backerCount: 0,
        daysLeft,
        status: "live",
        imageUrl: action.payload.imageUrl,
        whatThisUnlocks: [
          action.payload.type === "event"
            ? "A cleaner, more production-ready version of the event concept."
            : "A stronger creator-facing launch with clearer scope and better packaging.",
          "Visibility inside the fandom network so backers and crew can rally around it.",
          "A repeatable playbook if the first commission lands well."
        ],
        trustNotes: [
          "The scope, budget, and timing are visible before anyone backs it.",
          "Backers can see who is leading the commission and what the money unlocks.",
          "Crew needs are attached directly to the project instead of hidden later."
        ],
        tiers: action.payload.tiers.map((tier, index) => ({
          id: `${action.payload.id}-tier-${index + 1}`,
          title: tier.title,
          amount: tier.amount,
          description: tier.description,
          perks: tier.perks
        })),
        openRoles: action.payload.openRoles.map((role, index) => ({
          id: `${action.payload.id}-role-${index + 1}`,
          roleName: role.roleName,
          payoutRange: role.payoutRange,
          requiredSkills: role.requiredSkills,
          status: "open" as const,
          applicantUserIds: []
        })),
        activity: [
          {
            id: makeId("commission-activity"),
            authorId: action.payload.hostId,
            type: "update" as const,
            text:
              action.payload.type === "event"
                ? "New event commission published. Funding now determines how far this build can go."
                : "New creator project commission published. Backers can now help bring it to life.",
            createdAt: timestamp()
          }
        ],
        backedByUserIds: []
      };

      return {
        ...state,
        commissions: [nextCommission, ...state.commissions]
      };
    }
    case "apply-commission-role": {
      const commission = getCommissionById(action.payload.commissionId, state.commissions);
      const applicant = getUserById(action.payload.applicantUserId);
      if (!commission || !applicant) {
        return state;
      }

      const role = commission.openRoles.find((item) => item.id === action.payload.roleId);
      if (!role || role.status === "filled" || role.applicantUserIds.includes(applicant.id)) {
        return state;
      }

      const nextCommissions = state.commissions.map((item) => {
        if (item.id !== commission.id) {
          return item;
        }

        return {
          ...item,
          openRoles: item.openRoles.map((openRole) =>
            openRole.id === action.payload.roleId
              ? {
                  ...openRole,
                  applicantUserIds: [...openRole.applicantUserIds, applicant.id]
                }
              : openRole
          ),
          activity: [
            {
              id: makeId("commission-activity"),
              authorId: applicant.id,
              type: "role" as const,
              text: `Applied for ${role.roleName}. Available to help if this commission moves into production.`,
              createdAt: timestamp()
            },
            ...item.activity
          ]
        };
      });

      return {
        ...state,
        commissions: nextCommissions
      };
    }
    case "reset":
      return buildInitialPersistedState();
    default:
      return state;
  }
}

export function DemoStateProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialPersistedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedDemoState>;
        dispatch({
          type: "hydrate",
          payload: {
            persona: parsed.persona ?? initialPersistedState.persona,
            events: syncSeedEvents(parsed.events ?? initialPersistedState.events),
            roles: parsed.roles ?? initialPersistedState.roles,
            messages: parsed.messages ?? initialPersistedState.messages,
            commissions: syncSeedCommissions(
              parsed.commissions ?? initialPersistedState.commissions
            ),
            posts: parsed.posts ?? initialPersistedState.posts,
            joinedEventIds: parsed.joinedEventIds ?? initialPersistedState.joinedEventIds,
            savedEventIds: parsed.savedEventIds ?? initialPersistedState.savedEventIds
          }
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          persona: state.persona,
          events: state.events,
          roles: state.roles,
          messages: state.messages,
          commissions: state.commissions,
          posts: state.posts,
          joinedEventIds: state.joinedEventIds,
          savedEventIds: state.savedEventIds
        })
      );
    } catch (error) {
      console.error("[demo-state] Unable to persist demo state", error);
    }
  }, [
    hydrated,
    state.commissions,
    state.events,
    state.joinedEventIds,
    state.messages,
    state.persona,
    state.posts,
    state.roles,
    state.savedEventIds
  ]);

  const activeUserId = DEFAULT_ACTIVE_USER_ID;
  const value: DemoStore = {
    ...state,
    hydrated,
    activeUserId,
    setPersona: (persona) => dispatch({ type: "set-persona", payload: persona }),
    joinEvent: (eventId) => dispatch({ type: "join-event", payload: { eventId } }),
    toggleSavedEvent: (eventId) =>
      dispatch({ type: "toggle-saved-event", payload: { eventId } }),
    createEvent: (payload, hostIdOverride) => {
      const baseId = slugify(payload.name) || "event";
      const id = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
      dispatch({
        type: "create-event",
        payload: {
          ...payload,
          id,
          hostId: hostIdOverride ?? activeUserId
        }
      });
      return id;
    },
    createPost: (payload) => {
      const baseId = slugify(payload.caption.slice(0, 32)) || "post";
      const id = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
      dispatch({
        type: "create-post",
        payload: {
          ...payload,
          id,
          authorId: activeUserId
        }
      });
      return id;
    },
    updateEvent: (payload) => dispatch({ type: "update-event", payload }),
    inviteCandidate: (payload) => dispatch({ type: "invite-candidate", payload }),
    confirmRole: (payload) => dispatch({ type: "confirm-role", payload }),
    autoStaffEvent: (eventId) => dispatch({ type: "auto-staff", payload: { eventId } }),
    applyToRole: (payload) => dispatch({ type: "apply", payload }),
    passApplicant: (payload) => dispatch({ type: "pass-applicant", payload }),
    commitFunds: (payload) => dispatch({ type: "commit-funds", payload }),
    createCommission: (payload) => {
      const baseId = slugify(payload.title) || "commission";
      const id = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
      dispatch({
        type: "create-commission",
        payload: {
          ...payload,
          id,
          hostId: activeUserId
        }
      });
      return id;
    },
    applyToCommissionRole: (payload) =>
      dispatch({ type: "apply-commission-role", payload }),
    resetDemo: () => dispatch({ type: "reset" }),
    getEventCounts: (eventId) => getRoleCounts(state.roles, eventId)
  };

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoStateContext);
  if (!context) {
    throw new Error("useDemoState must be used within DemoStateProvider");
  }

  return context;
}
