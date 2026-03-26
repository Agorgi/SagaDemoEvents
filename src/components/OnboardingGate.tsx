"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getOnboardingLandingPath } from "@/src/data/onboarding";
import { useAppState } from "@/src/lib/app-state";
import { APP_ROUTES } from "@/src/lib/routes";

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

    // In the demo, onboarding should be the entry experience from root,
    // not a blocking guard on every route people click through.
    if (!completed && pathname === APP_ROUTES.root) {
      router.replace(APP_ROUTES.onboarding);
      return;
    }

    if (completed && (pathname === APP_ROUTES.root || pathname === APP_ROUTES.onboarding)) {
      router.replace(getOnboardingLandingPath(onboarding.primaryBranch));
    }
  }, [hydrated, onboarding.completed, onboarding.hasCompletedOnboarding, onboarding.primaryBranch, pathname, router]);

  return <>{children}</>;
}
