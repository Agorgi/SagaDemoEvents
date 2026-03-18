"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ApplicantReviewCard } from "@/src/components/ApplicantReviewCard";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Nav } from "@/src/components/Nav";
import { ProfilePreviewModal } from "@/src/components/ProfilePreviewModal";
import { TagChip } from "@/src/components/Chips";
import { getEventById, getUserById } from "@/src/data/demo";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";
import { useDemoState } from "@/src/lib/demo-state";

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const pad = (input: number) => `${input}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function HostEventPage() {
  const params = useParams<{ eventId: string }>();
  const {
    confirmRole,
    events,
    inviteCandidate,
    passApplicant,
    roles,
    updateEvent
  } = useDemoState();
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);

  const event = getEventById(params.eventId, events);
  const eventRoles = roles.filter((role) => role.eventId === params.eventId);

  const [title, setTitle] = useState(event?.title ?? "");
  const [subtitle, setSubtitle] = useState(event?.subtitle ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [city, setCity] = useState(event?.city ?? "");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [startsAt, setStartsAt] = useState(event ? toDateTimeLocal(event.startsAt) : "");
  const [tags, setTags] = useState(event?.fandomTags.join(", ") ?? "");

  const applicantCount = useMemo(
    () => eventRoles.reduce((total, role) => total + role.applicants.length, 0),
    [eventRoles]
  );

  if (!event || event.hostId !== HOST_DEMO_USER_ID) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Host event not found.
        </main>
      </div>
    );
  }

  const handleSave = () => {
    updateEvent({
      eventId: event.id,
      title,
      subtitle,
      description,
      city,
      venue,
      startsAt: new Date(startsAt).toISOString(),
      fandomTags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 4)
    });
  };

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[1080px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        <section className="surface-card-strong overflow-hidden p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <img
              alt={event.title}
              className="h-[260px] w-full rounded-[26px] object-cover"
              src={event.posterUrl}
            />
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Manage event</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">{event.title}</h1>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <MiniStat label="RSVPs" value={`${event.attendeesCount}`} />
                <MiniStat label="Applicants" value={`${applicantCount}`} />
                <MiniStat
                  label="Roles open"
                  value={`${eventRoles.filter((role) => role.status !== "filled").length}`}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-6">
            <div className="surface-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Basic details</p>
                  <p className="mt-1 text-sm text-app-muted">Keep the top of the event crisp.</p>
                </div>
                <button
                  className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  onClick={handleSave}
                  type="button"
                >
                  Save changes
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <Field label="Title" value={title} onChange={setTitle} />
                <Field label="Summary" value={subtitle} onChange={setSubtitle} />
                <label className="block">
                  <span className="mb-2 block text-sm text-app-muted">Description</span>
                  <textarea
                    className="min-h-[130px] w-full rounded-[20px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                    onChange={(event) => setDescription(event.target.value)}
                    value={description}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Venue" value={venue} onChange={setVenue} />
                  <Field label="City" value={city} onChange={setCity} />
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm text-app-muted">Date + time</span>
                  <input
                    className="w-full rounded-[20px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                    onChange={(event) => setStartsAt(event.target.value)}
                    type="datetime-local"
                    value={startsAt}
                  />
                </label>
                <Field label="Fandom tags" value={tags} onChange={setTags} />
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Open roles</p>
              <div className="mt-4 space-y-3">
                {eventRoles.map((role) => (
                  <div
                    className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4"
                    key={role.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{role.roleName}</p>
                        <p className="mt-1 text-sm text-app-muted">
                          {role.status === "filled" ? "Filled" : `${role.applicants.length} applicant${role.applicants.length === 1 ? "" : "s"}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {role.requiredSkills.slice(0, 3).map((skill) => (
                          <TagChip key={skill} label={skill} subdued />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6" id="applicants">
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Applicants by role</p>
              <div className="mt-4 space-y-5">
                {eventRoles.map((role) => (
                  <div key={role.id}>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">{role.roleName}</p>
                        <p className="text-sm text-app-muted">
                          {role.applicants.length} applicant{role.applicants.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    {role.applicants.length > 0 ? (
                      <div className="space-y-3">
                        {role.applicants.map((application) => {
                          const applicant = getUserById(application.applicantUserId);
                          if (!applicant) {
                            return null;
                          }

                          return (
                            <ApplicantReviewCard
                              accepted={role.filledByUserId === applicant.id}
                              applicant={applicant}
                              application={application}
                              key={`${role.id}-${applicant.id}`}
                              onAccept={() =>
                                confirmRole({
                                  eventId: event.id,
                                  roleId: role.id,
                                  candidateUserId: applicant.id
                                })
                              }
                              onPass={() =>
                                passApplicant({
                                  eventId: event.id,
                                  roleId: role.id,
                                  applicantUserId: applicant.id
                                })
                              }
                              onShortlist={() =>
                                inviteCandidate({
                                  eventId: event.id,
                                  roleId: role.id,
                                  candidateUserId: applicant.id
                                })
                              }
                              onViewProfile={() => setPreviewUserId(applicant.id)}
                              payoutRange={role.payoutRange}
                              roleName={role.roleName}
                              shortlisted={role.invitedUserId === applicant.id}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] p-5">
                        <p className="text-sm text-app-muted">No applicants yet for this role.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-white">Live event copy</p>
              <ExpandableText className="mt-4" collapsedLines={3} text={description} />
              <div className="mt-4 flex flex-wrap gap-2">
                {tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((tag) => (
                    <TagChip key={tag} label={tag} />
                  ))}
              </div>
              <div className="mt-5">
                <Link
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                  href={`/events/${event.id}`}
                >
                  Open attendee view
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ProfilePreviewModal
        onClose={() => setPreviewUserId(null)}
        open={Boolean(previewUserId)}
        user={previewUserId ? getUserById(previewUserId) ?? null : null}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-app-muted">{label}</span>
      <input
        className="w-full rounded-[20px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-[#0d1119] p-3">
      <p className="text-xs text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
