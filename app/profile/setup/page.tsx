"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { currentUser, finishProfileSetup } = useAppState();
  const [name, setName] = useState(currentUser.name);
  const [city, setCity] = useState(currentUser.city);
  const [fandoms, setFandoms] = useState(currentUser.fandomTags.join(", "));
  const [roles, setRoles] = useState(currentUser.skills.join(", "));
  const [rateRange, setRateRange] = useState("$250 - $500");
  const [bio, setBio] = useState(currentUser.bio);
  const [portfolioLinks, setPortfolioLinks] = useState("portfolio.example/saga");
  const [availability, setAvailability] = useState("Weeknights + weekends");

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Profile setup</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Finish your profile</h1>
          <p className="mt-3 text-sm leading-6 text-app-muted">
            Add enough signal for people to understand your taste, your role, and your fit.
          </p>
        </section>

        <section className="mt-6 surface-card p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={name} onChange={setName} />
            <Field label="City" value={city} onChange={setCity} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Fandoms" value={fandoms} onChange={setFandoms} />
            <Field label="Roles" value={roles} onChange={setRoles} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Rate range" value={rateRange} onChange={setRateRange} />
            <Field label="Availability" value={availability} onChange={setAvailability} />
          </div>
          <Field className="mt-4" label="Portfolio links" value={portfolioLinks} onChange={setPortfolioLinks} />
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-white">Short bio</span>
            <textarea
              className="min-h-[140px] w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
              onChange={(event) => setBio(event.target.value)}
              value={bio}
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
              onClick={() => {
                finishProfileSetup({
                  name,
                  city,
                  fandoms: fandoms.split(",").map((item) => item.trim()).filter(Boolean),
                  roles: roles.split(",").map((item) => item.trim()).filter(Boolean),
                  rateRange,
                  bio,
                  portfolioLinks: portfolioLinks.split(",").map((item) => item.trim()).filter(Boolean),
                  availability
                });
                router.push("/profile");
              }}
              type="button"
            >
              Finish profile
            </button>
            <button
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={() => router.push("/profile")}
              type="button"
            >
              Skip for now
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-white">{label}</span>
      <input
        className="w-full rounded-[20px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}
