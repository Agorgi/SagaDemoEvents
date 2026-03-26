import { type DemoEvent } from "@/src/data/demo";
import {
  getLaunchFundingProgress,
  type DemoLaunch
} from "@/src/data/launches";
import { type MediaVerticalPosition } from "@/src/lib/media-position";

export type PlanFilter = "all" | "going" | "saved" | "hosting" | "pledged";
export type PlanState = Exclude<PlanFilter, "all">;
export type PlanItemKind = "event" | "launch";

export type PlanCalendarItem = {
  id: string;
  baseKey: string;
  kind: PlanItemKind;
  state: PlanState;
  tentative: boolean;
  title: string;
  href: string;
  imageUrl: string;
  imagePosition?: MediaVerticalPosition;
  city: string;
  startsAt?: string;
  dateKey?: string;
  previewChip: string;
  previewCaption: string;
  progressLabel?: string;
  sortTime: number;
};

export type CalendarDay = {
  key: string;
  date: Date;
  inMonth: boolean;
  items: PlanCalendarItem[];
  glowState?: PlanState;
  isTentative: boolean;
  count: number;
};

export const PLAN_FILTER_OPTIONS: Array<{ label: string; value: PlanFilter }> = [
  { label: "All", value: "all" },
  { label: "Going", value: "going" },
  { label: "Saved", value: "saved" },
  { label: "Hosting", value: "hosting" },
  { label: "Pledged", value: "pledged" }
];

const PLAN_STATE_PRIORITY: Record<PlanState, number> = {
  hosting: 4,
  going: 3,
  pledged: 2,
  saved: 1
};

type DerivePlansCalendarInput = {
  currentUserId: string;
  events: DemoEvent[];
  launches: DemoLaunch[];
  savedEventIds: string[];
  goingEventIds: string[];
  interestedEventIds?: string[];
};

export function getDefaultPlansMonth(baseDate = new Date()) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
}

export function formatMonthDay(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export function formatShortWeekday(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}

export function derivePlansCalendarData({
  currentUserId,
  events,
  launches,
  savedEventIds,
  goingEventIds,
  interestedEventIds = []
}: DerivePlansCalendarInput) {
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const datedItems = new Map<string, PlanCalendarItem>();
  const noDateItems = new Map<string, PlanCalendarItem>();

  function upsertDatedItem(item: PlanCalendarItem) {
    if (!item.dateKey) {
      upsertNoDateItem(item);
      return;
    }

    const lookupKey = `${item.baseKey}:${item.dateKey}`;
    const current = datedItems.get(lookupKey);
    if (!current || PLAN_STATE_PRIORITY[item.state] > PLAN_STATE_PRIORITY[current.state]) {
      datedItems.set(lookupKey, item);
      return;
    }

    if (
      PLAN_STATE_PRIORITY[item.state] === PLAN_STATE_PRIORITY[current.state] &&
      current.tentative &&
      !item.tentative
    ) {
      datedItems.set(lookupKey, item);
    }
  }

  function upsertNoDateItem(item: PlanCalendarItem) {
    const current = noDateItems.get(item.baseKey);
    if (!current || PLAN_STATE_PRIORITY[item.state] > PLAN_STATE_PRIORITY[current.state]) {
      noDateItems.set(item.baseKey, item);
    }
  }

  function buildEventItem(event: DemoEvent, state: PlanState): PlanCalendarItem {
    const stateLabel = getStateLabel(state);
    const dateKey = getDateKey(event.startsAt);
    return {
      id: `${event.id}-${state}`,
      baseKey: `event:${event.id}`,
      kind: "event",
      state,
      tentative: false,
      title: event.title,
      href: `/events/${event.id}`,
      imageUrl: event.posterUrl,
      imagePosition: event.posterPosition,
      city: event.city,
      startsAt: event.startsAt,
      dateKey,
      previewChip: stateLabel,
      previewCaption: `${stateLabel} · ${formatMonthDay(event.startsAt)} · ${event.city}`,
      sortTime: new Date(event.startsAt).getTime()
    };
  }

  function buildLaunchItem(
    launch: DemoLaunch,
    state: PlanState,
    options?: {
      dateIso?: string;
      tentative?: boolean;
    }
  ): PlanCalendarItem {
    const progress = getLaunchFundingProgress(launch);
    const tentative = options?.tentative ?? false;
    const dateIso = options?.dateIso;
    const dateKey = dateIso ? getDateKey(dateIso) : undefined;
    const previewChip = tentative ? "Soft launch" : getStateLabel(state);
    const captionPrefix =
      state === "hosting"
        ? tentative
          ? "Hosting soft launch"
          : "Hosting"
        : tentative
          ? "Soft launch"
          : getStateLabel(state);

    return {
      id: `${launch.id}-${state}-${dateKey ?? "nodate"}`,
      baseKey: `${launch.eventId ? `event:${launch.eventId}` : `launch:${launch.id}`}${
        tentative && dateKey ? `:${dateKey}` : ""
      }`,
      kind: "launch",
      state,
      tentative,
      title: launch.title,
      href: launch.eventId ? `/events/${launch.eventId}` : `/campaigns/${launch.id}`,
      imageUrl: launch.coverImageUrl,
      imagePosition: launch.coverImagePosition,
      city: launch.city,
      startsAt: dateIso ?? launch.startsAt,
      dateKey,
      previewChip,
      previewCaption: dateIso
        ? `${captionPrefix} · ${formatMonthDay(dateIso)} · ${launch.city}`
        : `${captionPrefix} · ${progress.current} reserved`,
      progressLabel: `${progress.current} reserved`,
      sortTime: new Date(dateIso ?? launch.startsAt).getTime()
    };
  }

  for (const eventId of savedEventIds) {
    const event = eventsById.get(eventId);
    if (event) {
      upsertDatedItem(buildEventItem(event, "saved"));
    }
  }

  for (const eventId of interestedEventIds) {
    const event = eventsById.get(eventId);
    if (event) {
      upsertDatedItem(buildEventItem(event, "saved"));
    }
  }

  for (const eventId of goingEventIds) {
    const event = eventsById.get(eventId);
    if (event) {
      upsertDatedItem(buildEventItem(event, "going"));
    }
  }

  for (const event of events) {
    if (event.hostId === currentUserId) {
      upsertDatedItem(buildEventItem(event, "hosting"));
    }
  }

  for (const launch of launches) {
    const userPledge = launch.pledges.find((pledge) => pledge.userId === currentUserId);
    const isHost = launch.hostId === currentUserId;
    const state: PlanState | null = isHost ? "hosting" : userPledge ? "pledged" : null;

    if (!state) {
      continue;
    }

    if (launch.eventId) {
      const event = eventsById.get(launch.eventId);
      if (event) {
        upsertDatedItem(buildEventItem(event, state));
        continue;
      }

      upsertDatedItem(buildLaunchItem(launch, state));
      continue;
    }

    if (launch.dateOptions.length > 0) {
      for (const option of launch.dateOptions) {
        upsertDatedItem(
          buildLaunchItem(launch, state, {
            dateIso: option.iso,
            tentative: true
          })
        );
      }
      continue;
    }

    if (launch.startsAt && launch.status === "confirmed") {
      upsertDatedItem(buildLaunchItem(launch, state));
      continue;
    }

    upsertNoDateItem(buildLaunchItem(launch, state));
  }

  const sortedDatedItems = Array.from(datedItems.values()).sort((left, right) => {
    if (left.sortTime !== right.sortTime) {
      return left.sortTime - right.sortTime;
    }

    return PLAN_STATE_PRIORITY[right.state] - PLAN_STATE_PRIORITY[left.state];
  });

  const itemsByDate = sortedDatedItems.reduce<Record<string, PlanCalendarItem[]>>((accumulator, item) => {
    if (!item.dateKey) {
      return accumulator;
    }

    accumulator[item.dateKey] = [...(accumulator[item.dateKey] ?? []), item].sort((left, right) => {
      if (PLAN_STATE_PRIORITY[left.state] !== PLAN_STATE_PRIORITY[right.state]) {
        return PLAN_STATE_PRIORITY[right.state] - PLAN_STATE_PRIORITY[left.state];
      }

      return left.sortTime - right.sortTime;
    });
    return accumulator;
  }, {});

  return {
    itemsByDate,
    noDateItems: Array.from(noDateItems.values()).sort((left, right) => {
      if (PLAN_STATE_PRIORITY[left.state] !== PLAN_STATE_PRIORITY[right.state]) {
        return PLAN_STATE_PRIORITY[right.state] - PLAN_STATE_PRIORITY[left.state];
      }

      return left.title.localeCompare(right.title);
    })
  };
}

export function getCalendarDays(
  monthDate: Date,
  itemsByDate: Record<string, PlanCalendarItem[]>,
  filter: PlanFilter
) {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());

  const days: CalendarDay[] = [];
  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    const key = formatDateKey(cursor);
    const filteredItems = filterPlanItems(itemsByDate[key] ?? [], filter);
    days.push({
      key,
      date: new Date(cursor),
      inMonth: cursor.getMonth() === monthDate.getMonth(),
      items: filteredItems,
      glowState: getGlowState(filteredItems),
      isTentative: filteredItems.length > 0 && filteredItems.every((item) => item.tentative),
      count: filteredItems.length
    });
  }

  return days;
}

export function filterPlanItems(items: PlanCalendarItem[], filter: PlanFilter) {
  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.state === filter);
}

export function shiftMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getGlowState(items: PlanCalendarItem[]) {
  if (items.length === 0) {
    return undefined;
  }

  return [...items].sort((left, right) => PLAN_STATE_PRIORITY[right.state] - PLAN_STATE_PRIORITY[left.state])[0]
    ?.state;
}

function getStateLabel(state: PlanState) {
  if (state === "hosting") {
    return "Hosting";
  }

  if (state === "going") {
    return "Going";
  }

  if (state === "pledged") {
    return "Pledged";
  }

  return "Saved";
}

function getDateKey(value: string) {
  return formatDateKey(new Date(value));
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}
