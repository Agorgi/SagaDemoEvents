"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import { OnboardingStepper } from "@/src/components/OnboardingStepper";
import { hostFormatOptions } from "@/src/data/launches";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

const builderSteps = [
  "Basics",
  "Vibe and media",
  "Ticket and threshold",
  "Date options",
  "Preview"
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
  const { createLaunch, launches, publishLaunch } = useAppState();
  const copyId = searchParams.get("copy");
  const copySource = launches.find((launch) => launch.id === copyId);
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(copySource?.title ?? "");
  const [format, setFormat] = useState(copySource?.format ?? "social");
  const [city, setCity] = useState(copySource?.city ?? "Los Angeles, CA");
  const [description, setDescription] = useState(copySource?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(copySource?.coverImageUrl ?? "");
  const [vibeNote, setVibeNote] = useState(copySource?.vibeNote ?? "");
  const [guestLine, setGuestLine] = useState(copySource?.guestLine ?? "");
  const [inspirationInput, setInspirationInput] = useState(
    copySource?.inspiration.join(", ") ?? ""
  );
  const [ticketPrice, setTicketPrice] = useState(copySource?.ticketPrice ?? 28);
  const [thresholdTarget, setThresholdTarget] = useState(
    copySource?.plan.thresholdTarget ?? 72
  );
  const [budgetRange, setBudgetRange] = useState(copySource?.budgetRange ?? "$2k - $5k");
  const [dateOptions, setDateOptions] = useState([
    copySource?.dateOptions[0]?.label ?? "Fri Jul 17",
    copySource?.dateOptions[1]?.label ?? "Sat Jul 18",
    copySource?.dateOptions[2]?.label ?? "Sun Jul 19"
  ]);
  const [dateOptionValues, setDateOptionValues] = useState([
    copySource?.dateOptions[0]?.iso.slice(0, 16) ?? "2026-07-17T19:00",
    copySource?.dateOptions[1]?.iso.slice(0, 16) ?? "2026-07-18T19:00",
    copySource?.dateOptions[2]?.iso.slice(0, 16) ?? "2026-07-19T19:00"
  ]);
  const [teamRoleNames, setTeamRoleNames] = useState<string[]>(
    copySource?.teamRoleNames ?? ["Photographer", "Social Promo", "Event Ops"]
  );
  const [fandomTags, setFandomTags] = useState<string[]>(
    copySource?.fandomTags ?? ["Cosplay"]
  );

  const inspiration = inspirationInput
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  const review = useMemo(
    () => ({
      title,
      city,
      thresholdTarget,
      ticketPrice,
      fandoms: fandomTags.join(", "),
      dates: dateOptions.join(" · "),
      inspiration: inspiration.join(", "),
      team: teamRoleNames.join(", ")
    }),
    [city, dateOptions, fandomTags, inspiration, teamRoleNames, thresholdTarget, ticketPrice, title]
  );

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[920px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Create</p>
          <div className="mt-3">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Launch an idea</h1>
            <p className="mt-3 max-w-[56ch] text-sm leading-6 text-app-muted">
              Start with the concept. Fans can lock interest, pick the best date, and help push it into a real event.
            </p>
          </div>
        </section>

        <section className="mt-6 surface-card p-5 sm:p-6">
          <OnboardingStepper current={step} labels={builderSteps} />

          <div className="mt-6">
            {step === 0 ? (
              <Step title="Basics">
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Event idea title"
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
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <input
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="City or area"
                    value={city}
                  />
                  <input
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setBudgetRange(event.target.value)}
                    placeholder="Budget range"
                    value={budgetRange}
                  />
                </div>
                <textarea
                  className="mt-4 min-h-[140px] w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="One short description"
                  value={description}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Cosplay", "Genshin Impact", "Love and Deepspace", "Marvel Rivals", "Jujutsu Kaisen", "Rhythm Games"].map((tag) => (
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
                            : [...current, tag].slice(0, 3)
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

            {step === 1 ? (
              <Step title="Vibe and media">
                <input
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  placeholder="Optional hero image URL"
                  value={coverImageUrl}
                />
                <textarea
                  className="mt-4 min-h-[120px] w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setVibeNote(event.target.value)}
                  placeholder="What should it feel like?"
                  value={vibeNote}
                />
                <input
                  className="mt-4 w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setGuestLine(event.target.value)}
                  placeholder="Host or guest line"
                  value={guestLine}
                />
                <input
                  className="mt-4 w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setInspirationInput(event.target.value)}
                  placeholder="Inspiration tags, separated by commas"
                  value={inspirationInput}
                />
              </Step>
            ) : null}

            {step === 2 ? (
              <Step title="Ticket and threshold">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setTicketPrice(Number(event.target.value))}
                    placeholder="Tentative ticket price"
                    type="number"
                    value={ticketPrice}
                  />
                  <input
                    className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                    onChange={(event) => setThresholdTarget(Number(event.target.value))}
                    placeholder="Minimum sales / threshold"
                    type="number"
                    value={thresholdTarget}
                  />
                </div>
                <p className="mt-4 rounded-[20px] border border-white/8 bg-[#0d1119] px-4 py-4 text-sm leading-6 text-app-muted">
                  Fans are only locking a pending spot here. The actual event confirms after the threshold clears and the venue is paired.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Photographer", "Social Promo", "Moderator", "Merch Table", "Check-in", "Guest Cosplayer", "Event Ops"].map((role) => (
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
                            : [...current, role].slice(0, 4)
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

            {step === 3 ? (
              <Step title="Date options">
                <div className="space-y-4">
                  {dateOptions.map((label, index) => (
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]" key={index}>
                      <input
                        className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                        onChange={(event) =>
                          setDateOptions((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? event.target.value : item
                            )
                          )
                        }
                        placeholder={`Date option ${index + 1}`}
                        value={label}
                      />
                      <input
                        className="rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none"
                        onChange={(event) =>
                          setDateOptionValues((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? event.target.value : item
                            )
                          )
                        }
                        type="datetime-local"
                        value={dateOptionValues[index]}
                      />
                    </div>
                  ))}
                </div>
              </Step>
            ) : null}

            {step === 4 ? (
              <Step title="Preview">
                <div className="space-y-3 rounded-[24px] border border-white/8 bg-[#0d1119] p-5">
                  <ReviewRow label="Title" value={review.title || "Untitled soft launch"} />
                  <ReviewRow label="City" value={review.city} />
                  <ReviewRow label="Ticket" value={`$${review.ticketPrice}`} />
                  <ReviewRow label="Threshold" value={`${review.thresholdTarget} spots`} />
                  <ReviewRow label="Fandoms" value={review.fandoms || "None selected"} />
                  <ReviewRow label="Dates" value={review.dates} />
                  <ReviewRow label="Inspiration" value={review.inspiration || "None added"} />
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
                  title: title || "Untitled soft launch",
                  format,
                  city,
                  venue: `${city.split(",")[0]} shortlist`,
                  startsAt: dateOptionValues[0],
                  description,
                  fandomTags,
                  budgetRange,
                  attendanceGoal: Math.max(thresholdTarget + 30, thresholdTarget),
                  thresholdTarget,
                  teamRoleNames,
                  ticketPrice,
                  vibeNote,
                  inspiration,
                  guestLine,
                  dateOptions: dateOptions.map((label, index) => ({
                    label,
                    iso: toIsoOrFallback(dateOptionValues[index], index)
                  })),
                  coverImageUrl
                });
                publishLaunch(launchId);
                router.push(`/studio/${launchId}`);
              }}
              type="button"
            >
              {step < builderSteps.length - 1 ? "Continue" : "Launch soft launch"}
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
    <div>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/6 pb-3 last:border-b-0 last:pb-0">
      <p className="text-sm text-app-muted">{label}</p>
      <p className="max-w-[60%] text-right text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function toIsoOrFallback(value: string, index: number) {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 14 + index * 7);
  fallback.setHours(19, 0, 0, 0);
  return fallback.toISOString();
}
