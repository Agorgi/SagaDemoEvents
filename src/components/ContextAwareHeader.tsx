"use client";

import Link from "next/link";

import { useAppState } from "@/src/lib/app-state";

export function ContextAwareHeader() {
  const { hasStartedLaunch, mode } = useAppState();

  const action =
    mode === "host"
      ? { href: hasStartedLaunch ? "/studio" : "/studio/new", label: hasStartedLaunch ? "Open studio" : "Start soft launch" }
      : mode === "business"
        ? { href: "/work?tab=business", label: "Open matches" }
      : mode === "creator"
        ? { href: "/work", label: "Open work" }
        : { href: "/discover", label: "Discover" };

  const hostLink = !hasStartedLaunch && mode !== "host"
    ? { href: "/studio/new", label: "Start soft launch" }
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
