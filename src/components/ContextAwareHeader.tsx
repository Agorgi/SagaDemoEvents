"use client";

import Link from "next/link";

import { useAppState } from "@/src/lib/app-state";

export function ContextAwareHeader() {
  const { hasStartedLaunch, mode } = useAppState();

  const action =
    mode === "host"
      ? { href: "/studio/new", label: "Start a launch" }
      : mode === "creator"
        ? { href: "/explore?view=openings", label: "Find openings" }
        : { href: "/explore", label: "Find events" };

  const hostLink = !hasStartedLaunch && mode !== "host"
    ? { href: "/onboarding?mode=host", label: "Host something" }
    : null;

  return (
    <div className="flex items-center gap-3">
      {hostLink ? (
        <Link
          className="hidden text-sm font-semibold text-app-muted transition hover:text-white md:inline-flex"
          href={hostLink.href}
        >
          {hostLink.label}
        </Link>
      ) : null}
      <Link
        className="inline-flex items-center rounded-[18px] bg-app-purple px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
        href={action.href}
      >
        {action.label}
      </Link>
    </div>
  );
}
