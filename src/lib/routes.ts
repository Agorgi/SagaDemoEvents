export const APP_ROUTES = {
  root: "/",
  onboarding: "/onboarding",
  home: "/explore",
  work: "/work",
  launch: "/studio",
  plans: "/my-events",
  profile: "/profile",
  updates: "/inbox",
  settings: "/settings/data",
  profileSetup: "/profile/setup"
} as const;

export const WORK_TABS = {
  roles: "roles",
  venues: "venues"
} as const;

export type WorkTabKey = (typeof WORK_TABS)[keyof typeof WORK_TABS];

export function getWorkTabHref(tab: WorkTabKey = WORK_TABS.roles) {
  if (tab === WORK_TABS.roles) {
    return APP_ROUTES.work;
  }

  return `${APP_ROUTES.work}?tab=${tab}`;
}

export function normalizeWorkTab(value?: string | null): WorkTabKey {
  if (
    value === "venue" ||
    value === "venues" ||
    value === "business" ||
    value === "businesses"
  ) {
    return WORK_TABS.venues;
  }

  return WORK_TABS.roles;
}
