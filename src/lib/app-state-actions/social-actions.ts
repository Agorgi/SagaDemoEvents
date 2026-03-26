import {
  createActivityEntry
} from "@/src/lib/app-state-helpers";
import {
  type AppStateActionRuntime,
  type AppStateActions
} from "@/src/lib/app-state-types";

type SocialActionKeys =
  | "bookEvent"
  | "toggleSavedEvent"
  | "toggleInterestedEvent"
  | "markGoing"
  | "toggleFollow"
  | "markInboxRead";

export function createSocialActions(
  runtime: AppStateActionRuntime
): Pick<AppStateActions, SocialActionKeys> {
  const { currentUserId, demo, setState, users } = runtime;

  function commitBooking(eventId: string, kind: "reserve" | "ticket") {
    const event = demo.events.find((item) => item.id === eventId);
    if (!event) {
      return;
    }

    setState((current) => {
      const personaState = current.socialStateByPersona[current.activePersonaId];
      const nextPersonaState = {
        ...personaState,
        goingEventIds: personaState.goingEventIds.includes(eventId)
          ? personaState.goingEventIds
          : [eventId, ...personaState.goingEventIds],
        interestedEventIds: personaState.interestedEventIds.filter((id) => id !== eventId)
      };

      return {
        ...current,
        socialStateByPersona: {
          ...current.socialStateByPersona,
          [current.activePersonaId]: nextPersonaState
        },
        launches: current.launches.map((launch) =>
          launch.eventId === eventId
            ? {
                ...launch,
                reserveCount:
                  kind === "reserve" ? launch.reserveCount + 1 : launch.reserveCount,
                ticketCount:
                  kind === "ticket" ? launch.ticketCount + 1 : launch.ticketCount
              }
            : launch
        ),
        inbox: [
          {
            id: `inbox-ticket-${eventId}-${kind}-${Date.now()}`,
            kind: "tickets",
            title: kind === "ticket" ? "Ticket confirmed" : "Reserve saved",
            body:
              kind === "ticket"
                ? "Your ticket is now in Plans."
                : "You will see this event in your Plans.",
            href: "/my-events",
            createdAt: new Date().toISOString(),
            unread: true
          },
          ...current.inbox
        ],
        activityLog: [
          createActivityEntry({
            kind: "event",
            actorIds: [currentUserId],
            title:
              kind === "ticket"
                ? `You are going to ${event.title}`
                : `You reserved ${event.title}`,
            body:
              kind === "ticket"
                ? "The event is now pinned in your Plans."
                : "You will be first to know when tickets finalize.",
            href: `/events/${eventId}`,
            eventId,
            imageUrl: event.posterUrl
          }),
          ...current.activityLog
        ]
      };
    });
  }

  return {
    bookEvent: (eventId, kind) => commitBooking(eventId, kind),
    toggleSavedEvent: (eventId) => {
      const event = demo.events.find((item) => item.id === eventId);
      if (!event) {
        return;
      }

      setState((current) => {
        const personaState = current.socialStateByPersona[current.activePersonaId];
        const isSaved = personaState.savedEventIds.includes(eventId);
        return {
          ...current,
          socialStateByPersona: {
            ...current.socialStateByPersona,
            [current.activePersonaId]: {
              ...personaState,
              savedEventIds: isSaved
                ? personaState.savedEventIds.filter((id) => id !== eventId)
                : [eventId, ...personaState.savedEventIds]
            }
          },
          activityLog: isSaved
            ? current.activityLog
            : [
                createActivityEntry({
                  kind: "event",
                  actorIds: [currentUserId],
                  title: `Saved ${event.title}`,
                  body: "It is now waiting in Plans.",
                  href: `/events/${eventId}`,
                  eventId,
                  imageUrl: event.posterUrl
                }),
                ...current.activityLog
              ]
        };
      });
    },
    toggleInterestedEvent: (eventId) => {
      const event = demo.events.find((item) => item.id === eventId);
      if (!event) {
        return;
      }

      setState((current) => {
        const personaState = current.socialStateByPersona[current.activePersonaId];
        const isInterested = personaState.interestedEventIds.includes(eventId);
        return {
          ...current,
          socialStateByPersona: {
            ...current.socialStateByPersona,
            [current.activePersonaId]: {
              ...personaState,
              interestedEventIds: isInterested
                ? personaState.interestedEventIds.filter((id) => id !== eventId)
                : [eventId, ...personaState.interestedEventIds],
              goingEventIds: personaState.goingEventIds.filter((id) => id !== eventId)
            }
          },
          activityLog: isInterested
            ? current.activityLog
            : [
                createActivityEntry({
                  kind: "event",
                  actorIds: [currentUserId],
                  title: `Interested in ${event.title}`,
                  body: "We will keep it high in your feed and Plans.",
                  href: `/events/${eventId}`,
                  eventId,
                  imageUrl: event.posterUrl
                }),
                ...current.activityLog
              ]
        };
      });
    },
    markGoing: (eventId) => commitBooking(eventId, "ticket"),
    toggleFollow: (userId) => {
      const target = users.find((user) => user.id === userId);
      if (!target || userId === currentUserId) {
        return;
      }

      setState((current) => {
        const personaState = current.socialStateByPersona[current.activePersonaId];
        const isFollowing = personaState.followingIds.includes(userId);
        return {
          ...current,
          socialStateByPersona: {
            ...current.socialStateByPersona,
            [current.activePersonaId]: {
              ...personaState,
              followingIds: isFollowing
                ? personaState.followingIds.filter((id) => id !== userId)
                : [userId, ...personaState.followingIds]
            }
          },
          activityLog: isFollowing
            ? current.activityLog
            : [
                createActivityEntry({
                  kind: "follow",
                  actorIds: [currentUserId],
                  title: `Following ${target.name}`,
                  body: "Their events, posts, and updates will show up higher in Home.",
                  href: `/profiles/${userId}`
                }),
                ...current.activityLog
              ]
        };
      });
    },
    markInboxRead: (itemId) => {
      setState((current) => ({
        ...current,
        inbox: current.inbox.map((item) =>
          item.id === itemId ? { ...item, unread: false } : item
        )
      }));
    }
  };
}
