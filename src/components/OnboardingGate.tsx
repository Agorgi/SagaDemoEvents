"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getOnboardingLandingPath } from "@/src/data/onboarding";
import { useAppState } from "@/src/lib/app-state";

const UNGATED_PREFIXES = ["/onboarding", "/admin", "/giveaway"];

function isUngatedPath(pathname: string) {
  return UNGATED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function OnboardingGate({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, onboarding } = useAppState();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const completed = onboarding.completed || onboarding.hasCompletedOnboarding;

    if (!completed && !isUngatedPath(pathname)) {
      router.replace("/onboarding");
      return;
    }

    if (completed && (pathname === "/" || pathname === "/onboarding")) {
      router.replace(getOnboardingLandingPath(onboarding.primaryBranch));
    }
  }, [hydrated, onboarding.completed, onboarding.hasCompletedOnboarding, onboarding.primaryBranch, pathname, router]);

  return <>{children}</>;
}
