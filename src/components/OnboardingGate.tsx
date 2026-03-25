"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getOnboardingLandingPath } from "@/src/data/onboarding";
import { useAppState } from "@/src/lib/app-state";

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
    if (!completed && pathname === "/") {
      router.replace("/onboarding");
      return;
    }

    if (completed && (pathname === "/" || pathname === "/onboarding")) {
      router.replace(getOnboardingLandingPath(onboarding.primaryBranch));
    }
  }, [hydrated, onboarding.completed, onboarding.hasCompletedOnboarding, onboarding.primaryBranch, pathname, router]);

  return <>{children}</>;
}
