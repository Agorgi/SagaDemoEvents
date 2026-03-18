"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { WelcomePathCard } from "@/src/components/WelcomePathCard";
import { useAppState } from "@/src/lib/app-state";

export default function Home() {
  const router = useRouter();
  const { hydrated, onboarding } = useAppState();

  useEffect(() => {
    if (!hydrated || !onboarding.completed || !onboarding.mode) {
      return;
    }

    if (onboarding.mode === "creator" && !onboarding.profileSetupCompleted) {
      router.replace("/profile/setup");
      return;
    }

    router.replace(onboarding.mode === "host" ? "/studio" : "/explore");
  }, [hydrated, onboarding.completed, onboarding.mode, onboarding.profileSetupCompleted, router]);

  if (!hydrated) {
    return <div className="min-h-screen bg-app-bg" />;
  }

  if (onboarding.completed && onboarding.mode) {
    return <div className="min-h-screen bg-app-bg" />;
  }

  return (
    <main className="min-h-screen bg-app-grid px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1120px]">
        <img
          alt="Saga"
          className="h-[46px] w-auto object-contain"
          src="/group-88462-v2.png"
        />

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.18em] text-app-muted">
              Creator-led live experiences
            </p>
            <h1 className="max-w-[12ch] text-5xl font-semibold text-white sm:text-6xl">
              What do you want to do first?
            </h1>
            <p className="max-w-[44ch] text-base leading-7 text-app-muted">
              Saga helps hosts turn event ideas into real launches, helps creators find trusted roles, and helps fans discover what is worth showing up for.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                href="/explore"
              >
                Browse live events
              </Link>
              <Link
                className="text-sm font-semibold text-app-muted transition hover:text-white"
                href="/onboarding?sample=1"
              >
                Use a sample profile
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <WelcomePathCard
              accent="bg-gradient-to-br from-app-purple/18 via-[#10172a] to-[#10141d]"
              description="Turn one event idea into a launch plan, team, ticket plan, and repeatable series."
              onClick={() => router.push("/onboarding?mode=host")}
              title="Host something"
            />
            <WelcomePathCard
              accent="bg-gradient-to-br from-[#1f4fff]/16 via-[#10172a] to-[#0f1219]"
              description="Find open roles, show fit fast, and build trust with hosts who run great events."
              onClick={() => router.push("/onboarding?mode=creator")}
              title="Join a team"
            />
            <WelcomePathCard
              accent="bg-gradient-to-br from-[#7b57ff]/14 via-[#10172a] to-[#0f1219]"
              description="Discover launches that feel worth leaving the house for and keep your plans in one place."
              onClick={() => router.push("/onboarding?mode=fan")}
              title="Go to events"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
