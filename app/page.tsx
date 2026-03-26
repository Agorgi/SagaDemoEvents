"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getOnboardingLandingPath } from "@/src/data/onboarding";
import { useAppState } from "@/src/lib/app-state";
import { APP_ROUTES } from "@/src/lib/routes";

export default function RootPage() {
  const router = useRouter();
  const { hydrated, onboarding } = useAppState();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (onboarding.completed || onboarding.hasCompletedOnboarding) {
      router.replace(getOnboardingLandingPath(onboarding.primaryBranch));
      return;
    }

    router.replace(APP_ROUTES.onboarding);
  }, [hydrated, onboarding.completed, onboarding.hasCompletedOnboarding, onboarding.primaryBranch, router]);

  return <div className="min-h-screen bg-app-bg" />;
}
