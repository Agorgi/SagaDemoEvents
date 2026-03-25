import {
  type DemoEvent,
  type DemoRole,
  type DemoUser,
  type Persona,
  type RoleStatus,
  getUserById
} from "@/src/data/demo";

export type CandidateMatch = {
  user: DemoUser;
  score: number;
  why: string;
};

export function getRoleCounts(
  roleList: DemoRole[],
  eventId: string
): {
  total: number;
  filled: number;
  open: number;
} {
  const eventRoles = roleList.filter((role) => role.eventId === eventId);
  return {
    total: eventRoles.length,
    filled: eventRoles.filter((role) => role.status === "filled").length,
    open: eventRoles.filter((role) => role.status !== "filled").length
  };
}

export function candidateStatusTone(status: RoleStatus) {
  switch (status) {
    case "filled":
      return "text-app-success";
    case "invited":
      return "text-[#FFD166]";
    default:
      return "text-app-purple";
  }
}

export function getPersonaPrimaryAction(persona: Persona) {
  if (persona === "host") {
    return "Open workspace";
  }
  if (persona === "creator") {
    return "Join team";
  }
  return "Get ticket";
}

export function buildShortlist(
  event: DemoEvent,
  role: DemoRole,
  users: DemoUser[],
  roleList: DemoRole[]
): CandidateMatch[] {
  const unavailable = new Set(
    roleList
      .filter((item) => item.eventId === event.id)
      .flatMap((item) => [item.filledByUserId, item.invitedUserId])
      .filter(Boolean)
  );

  return users
    .filter((user) => user.roleType === "creator" || user.roleType === "crew" || user.roleType === "host")
    .filter((user) => user.id !== event.hostId)
    .filter((user) => !unavailable.has(user.id))
    .map((user) => {
      const skillOverlap = user.skills.filter((skill) =>
        role.requiredSkills.includes(skill)
      );
      const fandomOverlap = user.fandomTags.filter((tag) =>
        event.fandomTags.includes(tag)
      );
      const cityMatch = user.city === event.city ? 1 : 0;
      const score =
        skillOverlap.length * 5 +
        fandomOverlap.length * 3 +
        cityMatch * 2 +
        Math.min(user.pastEventsWorked, 6) +
        Math.min(user.mutuals, 10) * 0.15;

      const reasons: string[] = [];
      if (cityMatch) {
        reasons.push("Local");
      }
      if (user.pastEventsWorked > 0) {
        reasons.push(`worked ${user.pastEventsWorked} fandom events`);
      }
      if (fandomOverlap.length > 0) {
        reasons.push(`${fandomOverlap[0]} overlap`);
      }
      if (user.mutuals > 0) {
        reasons.push(`${user.mutuals} mutuals in orbit`);
      }

      return {
        user,
        score,
        why:
          reasons.length > 0
            ? reasons.slice(0, 3).join(" + ")
            : "Reliable generalist with relevant event experience"
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);
}

export function getFilledUsersForEvent(
  event: DemoEvent,
  roleList: DemoRole[]
) {
  return roleList
    .filter((role) => role.eventId === event.id && role.status === "filled")
    .map((role) => getUserById(role.filledByUserId))
    .filter(Boolean) as DemoUser[];
}
