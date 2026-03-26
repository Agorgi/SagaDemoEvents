import {
  buildLaunchPlan,
  createSeedLaunch
} from "@/src/data/launches";
import {
  createEmptyLaunchDraft,
  mapDraftToCreateLaunchPayload,
  syncLaunchDraft
} from "@/src/data/launch-builder";
import {
  HOST_DEMO_USER_ID
} from "@/src/lib/host-mode";
import {
  buildLaunchDraftGuestLine,
  createActivityEntry,
  syncLaunchShape
} from "@/src/lib/app-state-helpers";
import {
  type AppStateActionRuntime,
  type AppStateActions
} from "@/src/lib/app-state-types";

type LaunchActionKeys =
  | "startLaunchDraft"
  | "updateLaunchDraft"
  | "saveLaunchDraft"
  | "publishLaunchDraft"
  | "createLaunch"
  | "updateLaunch"
  | "addLaunchUpdate"
  | "watchLaunch"
  | "pledgeLaunch"
  | "acceptVenuePairing"
  | "acceptLaunchMatch"
  | "removeLaunchMatch"
  | "publishLaunch"
  | "completeLaunch";

function buildLaunchId(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `launch-${slug || "new"}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createLaunchActions(
  runtime: AppStateActionRuntime
): Pick<AppStateActions, LaunchActionKeys> {
  const { currentUserId, demo, setState, state } = runtime;

  return {
    startLaunchDraft: (mode) => {
      const draft = createEmptyLaunchDraft(mode, currentUserId);

      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        launchDrafts: [draft, ...current.launchDrafts.filter((item) => item.id !== draft.id)]
      }));

      return draft.id;
    },
    updateLaunchDraft: (draftId, payload) => {
      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        launchDrafts: current.launchDrafts.map((draft) =>
          draft.id === draftId
            ? syncLaunchDraft({
                ...draft,
                ...payload,
                draftStatus:
                  payload.draftStatus ??
                  (draft.draftStatus === "published" ? "published" : draft.draftStatus)
              })
            : draft
        )
      }));
    },
    saveLaunchDraft: (draftId) => {
      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        launchDrafts: current.launchDrafts.map((draft) =>
          draft.id === draftId
            ? syncLaunchDraft({
                ...draft,
                draftStatus: "saved"
              })
            : draft
        )
      }));
    },
    publishLaunchDraft: (draftId) => {
      const draft = state.launchDrafts.find((item) => item.id === draftId);
      if (!draft) {
        return null;
      }

      const syncedDraft = syncLaunchDraft(draft);
      const payload = mapDraftToCreateLaunchPayload(syncedDraft);
      const launchId = buildLaunchId(payload.title);

      const eventId =
        syncedDraft.launchMode === "happening"
          ? demo.createEvent(
              {
                name: payload.title,
                dateTime: payload.startsAt,
                location: payload.venue,
                description: payload.description,
                communities: payload.fandomTags.join(", "),
                eventFormat: payload.format,
                sourceCrew: payload.teamRoleNames.length > 0,
                posterUrl: payload.coverImageUrl,
                posterPosition: payload.coverImagePosition
              },
              HOST_DEMO_USER_ID
            )
          : undefined;

      const nextLaunch = createSeedLaunch({
        id: launchId,
        eventId,
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
        thresholdTarget: payload.thresholdTarget,
        reserveCount:
          syncedDraft.launchMode === "soft"
            ? 0
            : Math.max(8, Math.round(payload.attendanceGoal * 0.08)),
        ticketCount:
          syncedDraft.launchMode === "happening"
            ? Math.max(18, Math.round(payload.attendanceGoal * 0.14))
            : 0,
        status: syncedDraft.launchMode === "soft" ? "live_soft_launch" : "confirmed",
        teamRoleNames: payload.teamRoleNames,
        published: true,
        coverImageUrl: payload.coverImageUrl,
        coverImagePosition: payload.coverImagePosition,
        softLaunchSummary: syncedDraft.generatedDraft.summary,
        vibeNote: syncedDraft.generatedDraft.summary,
        inspiration: syncedDraft.guestExperienceSelections.slice(0, 4),
        guestLine: buildLaunchDraftGuestLine(syncedDraft),
        ticketPrice: payload.ticketPrice,
        dateOptions: payload.dateOptions,
        updates: [
          {
            title:
              syncedDraft.launchMode === "soft" ? "Soft launch is live" : "Event is live",
            body:
              syncedDraft.launchMode === "soft"
                ? "Fans can now back the idea, pick a date, and help turn it into a confirmed night."
                : "The event is now published and ready to share.",
            createdAt: new Date().toISOString()
          }
        ]
      });

      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
        hasStartedLaunch: true,
        launches: [nextLaunch, ...current.launches],
        launchDrafts: current.launchDrafts.map((item) =>
          item.id === draftId
            ? syncLaunchDraft({
                ...item,
                draftStatus: "published"
              })
            : item
        ),
        inbox: [
          {
            id: `inbox-draft-publish-${launchId}`,
            kind: "updates",
            title:
              syncedDraft.launchMode === "soft"
                ? "Soft launch published"
                : "Event published",
            body:
              syncedDraft.launchMode === "soft"
                ? `${payload.title} is now live for early support.`
                : `${payload.title} is now live as a confirmed event.`,
            href:
              syncedDraft.launchMode === "soft"
                ? `/campaigns/${launchId}`
                : `/events/${eventId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [HOST_DEMO_USER_ID],
            title:
              syncedDraft.launchMode === "soft"
                ? `${payload.title} soft launch is live`
                : `${payload.title} is live`,
            body: syncedDraft.generatedDraft.summary,
            href:
              syncedDraft.launchMode === "soft"
                ? `/campaigns/${launchId}`
                : `/events/${eventId}`,
            imageUrl: payload.coverImageUrl
          }),
          ...current.activityLog
        ]
      }));

      return { launchId, eventId };
    },
    createLaunch: (payload) => {
      const id = buildLaunchId(payload.title);
      const plan = buildLaunchPlan(payload);

      setState((current) => ({
        ...current,
        mode: "host",
        activePersonaId: "persona-host",
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
            coverImageUrl:
              payload.coverImageUrl ||
              createSeedLaunch({
                id: `${id}-cover`,
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
                thresholdTarget: payload.thresholdTarget,
                reserveCount: 0,
                ticketCount: 0,
                status: "draft",
                teamRoleNames: payload.teamRoleNames,
                published: false
              }).coverImageUrl,
            coverImagePosition: payload.coverImagePosition,
            reserveCount: 0,
            ticketCount: 0,
            published: false,
            status: "draft",
            teamRoleNames: payload.teamRoleNames,
            acceptedTeam: [],
            plan,
            softLaunchSummary: `${payload.title} is still gathering signal. Fans can lock interest, choose a date, and help push it into venue pairing.`,
            vibeNote: payload.vibeNote,
            inspiration: payload.inspiration,
            guestLine: payload.guestLine,
            ticketPrice: payload.ticketPrice,
            dateOptions: payload.dateOptions.map((option, index) => ({
              id: `${id}-date-${index + 1}`,
              label: option.label,
              iso: option.iso,
              votes: 0
            })),
            pledges: [],
            updates: [
              {
                id: `${id}-update-1`,
                title: "Draft ready",
                body: "The concept is staged. Launch it when the copy, dates, and vibe feel right.",
                createdAt: new Date().toISOString()
              }
            ],
            venueCandidates: [],
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
              repeatNote:
                "Once this run closes, copy it to the next city with the same team core."
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
            coverImagePosition: payload.coverImagePosition ?? launch.coverImagePosition,
            teamRoleNames: payload.teamRoleNames ?? launch.teamRoleNames,
            ticketPrice: payload.ticketPrice ?? launch.ticketPrice,
            vibeNote: payload.vibeNote ?? launch.vibeNote,
            inspiration: payload.inspiration ?? launch.inspiration,
            guestLine: payload.guestLine ?? launch.guestLine
          };

          return syncLaunchShape({
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
              thresholdTarget: payload.thresholdTarget ?? launch.plan.thresholdTarget,
              teamRoleNames: nextLaunch.teamRoleNames,
              ticketPrice: nextLaunch.ticketPrice,
              vibeNote: nextLaunch.vibeNote,
              inspiration: nextLaunch.inspiration,
              guestLine: nextLaunch.guestLine,
              dateOptions: nextLaunch.dateOptions.map((option) => ({
                label: option.label,
                iso: option.iso
              })),
              coverImageUrl: nextLaunch.coverImageUrl
            })
          });
        })
      }));
    },
    addLaunchUpdate: (launchId, payload) => {
      const cleanTitle = payload.title.trim();
      const cleanBody = payload.body.trim();
      if (!cleanTitle || !cleanBody) {
        return;
      }

      setState((current) => {
        const launch = current.launches.find((item) => item.id === launchId);
        if (!launch) {
          return current;
        }

        return {
          ...current,
          launches: current.launches.map((item) =>
            item.id === launchId
              ? {
                  ...item,
                  updates: [
                    {
                      id: `${launchId}-host-update-${Date.now()}`,
                      title: cleanTitle,
                      body: cleanBody,
                      createdAt: new Date().toISOString()
                    },
                    ...item.updates
                  ]
                }
              : item
          ),
          inbox: [
            {
              id: `inbox-launch-update-${launchId}-${Date.now()}`,
              kind: "updates",
              title: cleanTitle,
              body: cleanBody,
              href: `/campaigns/${launchId}`,
              createdAt: new Date().toISOString(),
              unread: true
            },
            ...current.inbox
          ],
          activityLog: [
            createActivityEntry({
              kind: "event",
              actorIds: [currentUserId],
              title: cleanTitle,
              body: cleanBody,
              href: `/campaigns/${launchId}`
            }),
            ...current.activityLog
          ]
        };
      });
    },
    watchLaunch: (launchId, dateOptionId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) => {
          if (launch.id !== launchId || launch.eventId) {
            return launch;
          }

          const existingPledge = launch.pledges.find(
            (pledge) => pledge.userId === currentUserId
          );
          if (
            existingPledge?.kind === "watching" &&
            existingPledge.dateOptionId === dateOptionId
          ) {
            return launch;
          }

          const nextPledges = existingPledge
            ? launch.pledges.map((pledge) =>
                pledge.userId === currentUserId
                  ? {
                      ...pledge,
                      kind: "watching" as const,
                      dateOptionId: dateOptionId ?? pledge.dateOptionId,
                      amount: 0
                    }
                  : pledge
              )
            : [
                ...launch.pledges,
                {
                  userId: currentUserId,
                  kind: "watching" as const,
                  dateOptionId,
                  amount: 0,
                  createdAt: new Date().toISOString()
                }
              ];

          return syncLaunchShape({
            ...launch,
            reserveCount:
              existingPledge?.kind === "watching"
                ? launch.reserveCount
                : launch.reserveCount + 1,
            ticketCount:
              existingPledge?.kind === "pledged"
                ? Math.max(0, launch.ticketCount - 1)
                : launch.ticketCount,
            pledges: nextPledges,
            updates: [
              {
                id: `${launch.id}-watch-${Date.now()}`,
                title: "New watcher joined",
                body: "A fan saved the concept and chose a preferred date.",
                createdAt: new Date().toISOString()
              },
              ...launch.updates
            ]
          });
        }),
        inbox: [
          {
            id: `inbox-watch-${launchId}-${Date.now()}`,
            kind: "updates",
            title: "Watching soft launch",
            body: "We’ll keep you posted as this idea gains momentum.",
            href: `/campaigns/${launchId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [currentUserId],
            title: "Watching a soft launch",
            body: "You’ll see updates when the date picture or momentum changes.",
            href: `/campaigns/${launchId}`
          }),
          ...current.activityLog
        ]
      }));
    },
    pledgeLaunch: (launchId, dateOptionId) => {
      setState((current) => ({
        ...current,
        launches: current.launches.map((launch) => {
          if (launch.id !== launchId || launch.eventId) {
            return launch;
          }

          const existingPledge = launch.pledges.find(
            (pledge) => pledge.userId === currentUserId
          );
          if (
            existingPledge?.kind === "pledged" &&
            existingPledge.dateOptionId === dateOptionId
          ) {
            return launch;
          }

          const nextPledges = existingPledge
            ? launch.pledges.map((pledge) =>
                pledge.userId === currentUserId
                  ? {
                      ...pledge,
                      kind: "pledged" as const,
                      dateOptionId,
                      amount: launch.ticketPrice
                    }
                  : pledge
              )
            : [
                ...launch.pledges,
                {
                  userId: currentUserId,
                  kind: "pledged" as const,
                  dateOptionId,
                  amount: launch.ticketPrice,
                  createdAt: new Date().toISOString()
                }
              ];

          return syncLaunchShape({
            ...launch,
            reserveCount:
              existingPledge?.kind === "watching"
                ? Math.max(0, launch.reserveCount - 1)
                : launch.reserveCount,
            ticketCount:
              existingPledge?.kind === "pledged"
                ? launch.ticketCount
                : launch.ticketCount + 1,
            pledges: nextPledges,
            updates: [
              {
                id: `${launch.id}-pledge-${Date.now()}`,
                title: "New reserve came in",
                body: "A supporter reserved a spot and helped push the event toward confirmation.",
                createdAt: new Date().toISOString()
              },
              ...launch.updates
            ]
          });
        }),
        inbox: [
          {
            id: `inbox-pledge-${launchId}-${Date.now()}`,
            kind: "tickets",
            title: "Reserve saved",
            body: "Your spot is pending until the launch clears threshold and confirms.",
            href: `/campaigns/${launchId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [currentUserId],
            title: "Reserved a soft launch",
            body: "You picked a date and helped move the event toward venue pairing.",
            href: `/campaigns/${launchId}`
          }),
          ...current.activityLog
        ]
      }));
    },
    acceptVenuePairing: (launchId, venueId) => {
      const launch = state.launches.find((item) => item.id === launchId);
      if (!launch) {
        return null;
      }

      const venue = launch.venueCandidates.find((candidate) => candidate.id === venueId);
      if (!venue) {
        return null;
      }

      const eventId =
        launch.eventId ??
        demo.createEvent(
          {
            name: launch.title,
            dateTime:
              launch.dateOptions.find(
                (option) =>
                  option.id ===
                  launch.pledges.find((pledge) => pledge.kind === "pledged")?.dateOptionId
              )?.iso ?? launch.startsAt,
            location: `${venue.name}, ${launch.city}`,
            description: launch.description,
            communities: launch.fandomTags.join(", "),
            eventFormat: launch.format,
            sourceCrew: launch.teamRoleNames.length > 0,
            posterUrl: launch.coverImageUrl,
            posterPosition: launch.coverImagePosition
          },
          HOST_DEMO_USER_ID
        );

      setState((current) => ({
        ...current,
        launches: current.launches.map((item) => {
          if (item.id !== launchId) {
            return item;
          }

          return syncLaunchShape({
            ...item,
            selectedVenueId: venueId,
            venue: `${venue.name}, ${venue.area}`,
            eventId,
            published: true,
            status: "confirmed",
            updates: [
              {
                id: `${item.id}-venue-${Date.now()}`,
                title: "Venue paired",
                body: `${venue.name} was selected and the event is now confirmed.`,
                createdAt: new Date().toISOString()
              },
              ...item.updates
            ]
          });
        }),
        inbox: [
          {
            id: `inbox-confirm-${launchId}`,
            kind: "updates",
            title: "Event confirmed",
            body: `${launch.title} now has a venue and a locked public page.`,
            href: `/events/${eventId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [HOST_DEMO_USER_ID],
            title: `${launch.title} is confirmed`,
            body: `${venue.name} is locked and the public event page is live.`,
            href: `/events/${eventId}`,
            eventId
          }),
          ...current.activityLog
        ],
        hasStartedLaunch: true
      }));

      return eventId;
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

      if (launch.published) {
        return launch.eventId ?? launch.id;
      }

      setState((current) => ({
        ...current,
        launches: current.launches.map((item) =>
          item.id === launchId
            ? syncLaunchShape({
                ...item,
                published: true,
                status: "live_soft_launch",
                updates: [
                  {
                    id: `${item.id}-launch-${Date.now()}`,
                    title: "Soft launch is live",
                    body: "Fans can now watch it, reserve early, and vote on the best date.",
                    createdAt: new Date().toISOString()
                  },
                  ...item.updates
                ]
              })
            : item
        ),
        inbox: [
          {
            id: `inbox-publish-${launchId}`,
            kind: "updates",
            title: "Soft launch published",
            body: `${launch.title} is now live as an interest check.`,
            href: `/studio/${launchId}`,
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [HOST_DEMO_USER_ID],
            title: `${launch.title} soft launch is live`,
            body: "The campaign is now visible in Home and Discover.",
            href: `/campaigns/${launchId}`,
            imageUrl: launch.coverImageUrl
          }),
          ...current.activityLog
        ],
        hasStartedLaunch: true
      }));

      return launch.id;
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
                      launch.payouts.contributorPayouts.reduce(
                        (sum, item) => sum + item.amount,
                        0
                      )
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
    }
  };
}
