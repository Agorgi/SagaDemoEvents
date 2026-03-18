"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import { OnboardingStepper } from "@/src/components/OnboardingStepper";
import { creatorRoleOptions, hostFormatOptions } from "@/src/data/launches";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

const builderSteps = [
  "What are you hosting",
  "Where and when",
  "Budget and turnout",
  "What help do you need",
  "Review"
];

export default function NewStudioLaunchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <NewStudioLaunchPageContent />
    </Suspense>
  );
}

function NewStudioLaunchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createLaunch, launches } = useAppState();
  const copyId = searchParams.get("copy");
  const copySource = launches.find((launch) => launch.id === copyId);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(copySource?.title ?? "");
  const [format, setFormat] = useState(copySource?.format ?? "social");
  const [city, setCity] = useState(copySource?.city ?? "Los Angeles, CA");
  const [venue, setVenue] = useState(copySource?.venue ?? "");
  const [startsAt, setStartsAt] = useState(copySource?.startsAt ?? "2026-07-18T19:00");
  const [description, setDescription] = useState(copySource?.description ?? "");
  const [budgetRange, setBudgetRange] = useState(copySource?.budgetRange ?? "$2k - $5k");
  const [attendanceGoal, setAttendanceGoal] = useState(copySource?.attendanceGoal ?? 150);
  const [fandomTags, setFandomTags] = useState<string[]>(
    copySource?.fandomTags ?? ["Cosplay"]
  );
  const [teamRoleNames, setTeamRoleNames] = useState<string[]>(
    copySource?.teamRoleNames ?? ["photographer", "social promo"]
  );

  const review = useMemo(
    () => ({
      title,
      city,
      startsAt: startsAt.replace("T", " · "),
      team: teamRoleNames.join(", "),
      fandoms: fandomTags.join(", ")
    }),
    [city, fandomTags, startsAt, teamRoleNames, title]
  );

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[920px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Studio</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">Start a launch</h1>
              <p className="mt-3 max-w-[56ch] text-sm leading-6 text-app-muted">
                Move fast. Fill in the basics, define the help you need, and build the workspace from your brief.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 surface-card p-5 sm:p-6">
          <OnboardingStepper current={step} labels={builderSteps} />

          <div className="mt-6">
            {step === 0 ? (
              <Step title="What are you hosting">
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Launch title"
                  value={title}
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {hostFormatOptions.map((option) => (
                    <button
                      className={cn(
                        "rounded-[22px] border px-4 py-4 text-left text-sm font-semibold capitalize transition",
                        format === option
                          ? "border-app-purple/30 bg-app-purple/12 text-white"
                          : "border-white/10 bg-white/[0.02] text-white hover:border-white/20"
                      )}
                      key={option}
                      onClick={() => setFormat(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <textarea
                  className="mt-4 min-h-[140px] w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="One concise description"
                  value={description}
                />
              </Step>
            ) : null}

            {step === 1 ? (
              <Step title="Where and when">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="City"
                    value={city}
                  />
                  <input
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setVenue(event.target.value)}
                    placeholder="Venue"
                    value={venue}
                  />
                </div>
                <input
                  className="mt-4 w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
                  onChange={(event) => setStartsAt(event.target.value)}
                  type="datetime-local"
                  value={startsAt}
                />
              </Step>
            ) : null}

            {step === 2 ? (
              <Step title="Budget and turnout">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setBudgetRange(event.target.value)}
                    placeholder="Budget range"
                    value={budgetRange}
                  />
                  <input
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setAttendanceGoal(Number(event.target.value))}
                    placeholder="Attendance goal"
                    type="number"
                    value={attendanceGoal}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Cosplay", "Genshin Impact", "Love and Deepspace", "Marvel Rivals", "Jujutsu Kaisen"].map((tag) => (
                    <button
                      className={cn(
                        "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                        fandomTags.includes(tag)
                          ? "border-app-purple/30 bg-app-purple/12 text-white"
                          : "border-white/10 bg-white/[0.02] text-app-muted hover:border-white/20 hover:text-white"
                      )}
                      key={tag}
                      onClick={() =>
                        setFandomTags((current) =>
                          current.includes(tag)
                            ? current.filter((item) => item !== tag)
                            : [...current, tag]
                        )
                      }
                      type="button"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </Step>
            ) : null}

            {step === 3 ? (
              <Step title="What help do you need">
                <div className="flex flex-wrap gap-2">
                  {[...creatorRoleOptions, "creator marketing", "event ops"].map((role) => (
                    <button
                      className={cn(
                        "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                        teamRoleNames.includes(role)
                          ? "border-app-purple/30 bg-app-purple/12 text-white"
                          : "border-white/10 bg-white/[0.02] text-app-muted hover:border-white/20 hover:text-white"
                      )}
                      key={role}
                      onClick={() =>
                        setTeamRoleNames((current) =>
                          current.includes(role)
                            ? current.filter((item) => item !== role)
                            : [...current, role]
                        )
                      }
                      type="button"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </Step>
            ) : null}

            {step === 4 ? (
              <Step title="Review and build">
                <div className="space-y-3 rounded-[24px] border border-white/8 bg-[#0d1119] p-5">
                  <ReviewRow label="Title" value={review.title || "Untitled launch"} />
                  <ReviewRow label="City" value={review.city} />
                  <ReviewRow label="When" value={review.startsAt} />
                  <ReviewRow label="Fandoms" value={review.fandoms || "None selected"} />
                  <ReviewRow label="Team" value={review.team || "No roles requested"} />
                </div>
              </Step>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/8 pt-6">
            <button
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              type="button"
            >
              Back
            </button>
            <button
              className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              onClick={() => {
                if (step < builderSteps.length - 1) {
                  setStep((current) => current + 1);
                  return;
                }

                const launchId = createLaunch({
                  title: title || "Untitled launch",
                  format,
                  city,
                  venue,
                  startsAt,
                  description,
                  fandomTags,
                  budgetRange,
                  attendanceGoal,
                  teamRoleNames
                });
                router.push(`/studio/${launchId}`);
              }}
              type="button"
            >
              {step < builderSteps.length - 1 ? "Continue" : "Build launch plan"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Step({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-app-muted">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
