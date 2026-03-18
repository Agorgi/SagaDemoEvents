"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  type DemoEvent,
  type DemoUser,
  events as seedEvents,
  users as seedUsers
} from "@/src/data/demo";
import {
  type CreateLaunchPayload,
  type DemoInboxItem,
  type DemoLaunch,
  type OnboardingState,
  type UserMode,
  buildLaunchPlan,
  createSeedLaunch,
  onboardingDefaults,
  seedInboxItems,
  seedLaunches
} from "@/src/data/launches";
import { useDemoState } from "@/src/lib/demo-state";
import {
  CREATOR_DEMO_USER_ID,
  FAN_DEMO_USER_ID,
  HOST_DEMO_USER_ID
} from "@/src/lib/host-mode";

type ProfileDraft = {
  name?: string;
  city?: string;
  fandoms?: string[];
  roles?: string[];
  rateRange?: string;
  bio?: string;
  portfolioLinks?: string[];
  availability?: string;
  sampleWork?: string[];
};

type CompleteOnboardingPayload = {
  mode: UserMode;
  authMethod: "google" | "discord" | "email";
  city: string;
  fandoms: string[];
  hostFormat?: CreateLaunchPayload["format"];
  budgetRange?: string;
  creatorRoles?: string[];
  portfolioLink?: string;
  availability?: string;
  fanEventTypes?: string[];
  travelDistance?: string;
  budgetComfort?: string;
  usedSampleProfile?: boolean;
};

type PersistedAppState = {
  mode: UserMode;
  onboarding: OnboardingState;
  launches: DemoLaunch[];
  inbox: DemoInboxItem[];
  profileDrafts: Record<string, ProfileDraft>;
  hasStartedLaunch: boolean;
};

type AppStateValue = PersistedAppState & {
  hydrated: boolean;
  currentUserId: string;
  currentUser: DemoUser & { draft?: ProfileDraft };
  users: Array<DemoUser & { draft?: ProfileDraft }>;
  setMode: (mode: UserMode) => void;
  completeOnboarding: (payload: CompleteOnboardingPayload) => void;
  activateSampleProfile: (mode?: UserMode) => void;
  finishProfileSetup: (payload: ProfileDraft) => void;
  createLaunch: (payload: CreateLaunchPayload) => string;
  updateLaunch: (launchId: string, payload: Partial<CreateLaunchPayload>) => void;
  acceptLaunchMatch: (launchId: string, roleName: string, userId: string) => void;
  removeLaunchMatch: (launchId: string, roleName: string, userId: string) => void;
  publishLaunch: (launchId: string) => string | null;
  completeLaunch: (launchId: string) => void;
  bookEvent: (eventId: string, kind: "reserve" | "ticket") => void;
  markInboxRead: (itemId: string) => void;
  resolveUser: (userId?: string) => (DemoUser & { draft?: ProfileDraft }) | undefined;
};

const STORAGE_KEY = "saga-app-state-v1";

const initialState: PersistedAppState = {
  mode: "fan",
  onboarding: onboardingDefaults,
  launches: seedLaunches,
  inbox: seedInboxItems,
  profileDrafts: {},
  hasStartedLaunch: false
};

const AppStateContext = createContext<AppStateValue | null>(null);

function createSyntheticLaunch(event: DemoEvent) {
  const reserveCount = Math.max(12, Math.round(event.attendeesCount * 0.04));
  const ticketCount = Math.max(18, Math.round(event.attendeesCount * 0.06));

  return createSeedLaunch({
    id: `${event.id}-public`,
    eventId: event.id,
    hostId: event.hostId,
    title: event.title,
    format: event.fandomTags.some((tag) => /hunt/i.test(tag))
      ? "scavenger hunt"
      : event.fandomTags.some((tag) => /drawing|showcase/i.test(tag))
        ? "showcase"
        : "social",
    city: event.city,
    venue: event.venue,
    startsAt: event.startsAt,
    description: event.description,
    fandomTags: event.fandomTags,
    budgetRange: "$2k - $5k",
    attendanceGoal: Math.max(80, Math.round(event.attendeesCount * 0.14)),
    reserveCount,
    ticketCount,
    status: reserveCount + ticketCount >= Math.round(event.attendeesCount * 0.08) ? "live" : "recruiting",
    teamRoleNames: ["Photographer", "Host Support", "Social Promo"],
    published: true
  });
}

function syncLaunches(launches: DemoLaunch[], events: DemoEvent[]) {
  const byEventId = new Set(
    launches.map((launch) => launch.eventId).filter((value): value is string => Boolean(value))
  );
  const syntheticLaunches = events
    .filter((event) => !byEventId.has(event.id))
    .map((event) => createSyntheticLaunch(event));

  if (syntheticLaunches.length === 0) {
    return launches;
  }

  return [...launches, ...syntheticLaunches];
}

function resolveCurrentUserId(mode: UserMode) {
  if (mode === "host") {
    return HOST_DEMO_USER_ID;
  }
  if (mode === "creator") {
    return CREATOR_DEMO_USER_ID;
  }
  return FAN_DEMO_USER_ID;
}

function mergeUsers(profileDrafts: Record<string, ProfileDraft>) {
  return seedUsers.map((user) => {
    const draft = profileDrafts[user.id];
    if (!draft) {
      return user;
    }

    return {
      ...user,
      name: draft.name ?? user.name,
      city: draft.city ?? user.city,
      fandomTags: draft.fandoms ?? user.fandomTags,
      skills: draft.roles ?? user.skills,
      bio: draft.bio ?? user.bio,
      draft
    };
  });
}

export function AppStateProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const demo = useDemoState();
  const [state, setState] = useState<PersistedAppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (didHydrate.current) {
      return;
    }
    didHydrate.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
        setState({
          mode: parsed.mode ?? initialState.mode,
          onboarding: {
            ...onboardingDefaults,
            ...parsed.onboarding
          },
          launches: syncLaunches(parsed.launches ?? initialState.launches, demo.events),
          inbox: parsed.inbox ?? initialState.inbox,
          profileDrafts: parsed.profileDrafts ?? initialState.profileDrafts,
          hasStartedLaunch: parsed.hasStartedLaunch ?? initialState.hasStartedLaunch
        });
      } else {
        setState((current) => ({
          ...current,
          launches: syncLaunches(current.launches, demo.events)
        }));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setState(initialState);
    } finally {
      setHydrated(true);
    }
  }, [demo.events]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setState((current) => {
      const nextLaunches = syncLaunches(current.launches, demo.events);
      return nextLaunches === current.launches
        ? current
        : {
            ...current,
            launches: nextLaunches
          };
    });
  }, [demo.events, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("[app-state] Unable to persist app state", error);
    }
  }, [hydrated, state]);

  const users = useMemo(() => mergeUsers(state.profileDrafts), [state.profileDrafts]);
  const currentUserId = resolveCurrentUserId(state.mode);
  const currentUser =
    users.find((user) => user.id === currentUserId) ?? mergeUsers({})[0];

  const value: AppStateValue = {
    ...state,
    hydrated,
    currentUserId,
    currentUser,
    users,
    setMode: (mode) => setState((current) => ({ ...current, mode })),
    completeOnboarding: (payload) => {
      setState((current) => ({
        ...current,
        mode: payload.mode,
        onboarding: {
          completed: true,
          mode: payload.mode,
          authMethod: payload.authMethod,
          city: payload.city,
          fandoms: payload.fandoms,
          hostFormat: payload.hostFormat,
          budgetRange: payload.budgetRange,
          creatorRoles: payload.creatorRoles ?? [],
          portfolioLink: payload.portfolioLink ?? "",
          availability: payload.availability ?? "",
          fanEventTypes: payload.fanEventTypes ?? [],
          travelDistance: payload.travelDistance ?? "",
          budgetComfort: payload.budgetComfort ?? "",
          profileSetupCompleted: payload.mode === "creator" ? false : true,
          usedSampleProfile: payload.usedSampleProfile ?? false
        }
      }));
    },
    activateSampleProfile: (mode = "fan") => {
      setState((current) => ({
        ...current,
        mode,
        onboarding: {
          ...current.onboarding,
          completed: true,
          mode,
          city: mode === "host" ? "Pasadena, CA" : mode === "creator" ? "New York, NY" : "Los Angeles, CA",
          fandoms:
            mode === "host"
              ? ["Cosplay", "Fan Mixers"]
              : mode === "creator"
                ? ["Marvel Rivals", "Creator Collabs"]
                : ["Jujutsu Kaisen", "Cosplay"],
          creatorRoles: mode === "creator" ? ["social promo", "photographer"] : [],
          portfolioLink: mode === "creator" ? "portfolio.example/saga" : "",
          availability: mode === "creator" ? "Weeknights + weekends" : "",
          fanEventTypes: mode === "fan" ? ["mixers", "creator showcases"] : [],
          travelDistance: mode === "fan" ? "Up to 45 minutes" : "",
          budgetComfort: mode === "fan" ? "$20 - $40" : "",
          profileSetupCompleted: mode !== "creator",
          usedSampleProfile: true
        }
      }));
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
    createLaunch: (payload) => {
      const id = `launch-${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new"}-${Math.random().toString(36).slice(2, 6)}`;
      const plan = buildLaunchPlan(payload);

      setState((current) => ({
        ...current,
        mode: "host",
        hasStartedLaunch: true,
        launches: [
          {
            id,
            hostId: HOST_DEMO_USER_ID,
            title: payload.title,
            format: payload.format,
            city: payload.city,
            venue: payload.venue,
            startsAt: payload.startsAt,
            description: payload.description,
            fandomTags: payload.fandomTags,
            budgetRange: payload.budgetRange,
            attendanceGoal: payload.attendanceGoal,
            reserveCount: 0,
            ticketCount: 0,
            published: false,
            status: "planning",
            teamRoleNames: payload.teamRoleNames,
            acceptedTeam: [],
            plan,
            payouts: {
              ticketSales: 0,
              merchSales: 0,
              costs: [
                { label: "Venue hold", amount: 420 },
                { label: "Decor reserve", amount: 180 }
              ],
              contributorPayouts: payload.teamRoleNames.map((roleName, index) => ({
                roleName,
                amount: 160 + index * 40
              })),
              hostNet: 0,
              repeatNote: "Once this run closes, copy it to the next city with the same team core."
            },
            runOfShow: [
              { time: "4:00 PM", label: "Venue load-in", owner: "Host" },
              { time: "5:30 PM", label: "Team check", owner: "Ops" },
              { time: "7:00 PM", label: "Doors", owner: "Check-in" },
              { time: "9:00 PM", label: "Hero beat", owner: "Photo" }
            ]
          },
          ...current.launches
        ]
      }));

      return id;
    },
    updateLaunch: (launchId, payload) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) => {
          if (launch.id !== launchId) {
            return launch;
          }

          const nextLaunch = {
            ...launch,
            title: payload.title ?? launch.title,
            format: payload.format ?? launch.format,
            city: payload.city ?? launch.city,
            venue: payload.venue ?? launch.venue,
            startsAt: payload.startsAt ?? launch.startsAt,
            description: payload.description ?? launch.description,
            fandomTags: payload.fandomTags ?? launch.fandomTags,
            budgetRange: payload.budgetRange ?? launch.budgetRange,
            attendanceGoal: payload.attendanceGoal ?? launch.attendanceGoal,
            teamRoleNames: payload.teamRoleNames ?? launch.teamRoleNames
          };

          return {
            ...nextLaunch,
            plan: buildLaunchPlan({
              title: nextLaunch.title,
              format: nextLaunch.format,
              city: nextLaunch.city,
              venue: nextLaunch.venue,
              startsAt: nextLaunch.startsAt,
              description: nextLaunch.description,
              fandomTags: nextLaunch.fandomTags,
              budgetRange: nextLaunch.budgetRange,
              attendanceGoal: nextLaunch.attendanceGoal,
              teamRoleNames: nextLaunch.teamRoleNames
            })
          };
        })
      }));
    },
    acceptLaunchMatch: (launchId, roleName, userId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) =>
          launch.id === launchId
            ? {
                ...launch,
                acceptedTeam: launch.acceptedTeam.some(
                  (entry) => entry.roleName === roleName && entry.userId === userId
                )
                  ? launch.acceptedTeam
                  : [...launch.acceptedTeam, { roleName, userId }]
              }
            : launch
        )
      }));
    },
    removeLaunchMatch: (launchId, roleName, userId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) =>
          launch.id === launchId
            ? {
                ...launch,
                acceptedTeam: launch.acceptedTeam.filter(
                  (entry) => !(entry.roleName === roleName && entry.userId === userId)
                )
              }
            : launch
        )
      }));
    },
    publishLaunch: (launchId) => {
      const launch = state.launches.find((item) => item.id === launchId);
      if (!launch) {
        return null;
      }

      if (launch.published && launch.eventId) {
        return launch.eventId;
      }

      const eventId = demo.createEvent(
        {
          name: launch.title,
          dateTime: launch.startsAt,
          location: `${launch.venue}, ${launch.city}`,
          description: launch.description,
          communities: launch.fandomTags.join(", "),
          eventFormat: launch.format,
          sourceCrew: launch.teamRoleNames.length > 0
        },
        HOST_DEMO_USER_ID
      );

      setState((current) => ({
        ...current,
        launches: current.launches.map((item) =>
          item.id === launchId
            ? {
                ...item,
                published: true,
                eventId,
                status: item.teamRoleNames.length > 0 ? "recruiting" : "validating"
              }
            : item
        ),
        inbox: [
          {
            id: `inbox-publish-${launchId}`,
            kind: "updates",
            title: "Launch published",
            body: `${launch.title} is now live in Explore.`,
            href: `/studio/${launchId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        hasStartedLaunch: true
      }));

      return eventId;
    },
    completeLaunch: (launchId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) =>
          launch.id === launchId
            ? {
                ...launch,
                status: "completed",
                payouts: {
                  ...launch.payouts,
                  hostNet: Math.max(
                    320,
                    launch.payouts.ticketSales +
                      launch.payouts.merchSales -
                      launch.payouts.costs.reduce((sum, item) => sum + item.amount, 0) -
                      launch.payouts.contributorPayouts.reduce((sum, item) => sum + item.amount, 0)
                  )
                }
              }
            : launch
        ),
        inbox: [
          {
            id: `inbox-payouts-${launchId}`,
            kind: "payments",
            title: "Payouts ready",
            body: "Launch closed. Review the payout summary next.",
            href: `/studio/${launchId}?tab=payouts`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ]
      }));
    },
    bookEvent: (eventId, kind) => {
      demo.joinEvent(eventId);
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) =>
          launch.eventId === eventId
            ? {
                ...launch,
                reserveCount: kind === "reserve" ? launch.reserveCount + 1 : launch.reserveCount,
                ticketCount: kind === "ticket" ? launch.ticketCount + 1 : launch.ticketCount
              }
            : launch
        ),
        inbox: [
          {
            id: `inbox-ticket-${eventId}-${kind}`,
            kind: "tickets",
            title: kind === "ticket" ? "Ticket confirmed" : "Reserve spot confirmed",
            body:
              kind === "ticket"
                ? "Your ticket is saved in My Events."
                : "You will get the first update when this unlocks.",
            href: "/my-events",
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ]
      }));
    },
    markInboxRead: (itemId) => {
      setState((current) => ({
        ...current,
        inbox: current.inbox.map((item) =>
          item.id === itemId ? { ...item, unread: false } : item
        )
      }));
    },
    resolveUser: (userId) => users.find((user) => user.id === userId)
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
