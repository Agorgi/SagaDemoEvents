"use client";

import Link from "next/link";
import { useState } from "react";

import { ApplicantReviewCard } from "@/src/components/ApplicantReviewCard";
import { Nav } from "@/src/components/Nav";
import { ProfilePreviewModal } from "@/src/components/ProfilePreviewModal";
import { getUserById } from "@/src/data/demo";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";
import { useDemoState } from "@/src/lib/demo-state";

export default function HostApplicantsPage() {
  const { confirmRole, events, inviteCandidate, passApplicant, roles } = useDemoState();
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);

  const hostedEvents = events.filter((event) => event.hostId === HOST_DEMO_USER_ID);
  const pendingRoles = hostedEvents.flatMap((event) =>
    roles
      .filter(
        (role) =>
          role.eventId === event.id &&
          role.status !== "filled" &&
          role.applicants.length > 0
      )
      .map((role) => ({ event, role }))
  );

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto w-full max-w-[980px] px-4 pb-28 pt-5 sm:px-6 sm:pb-10 sm:pt-8">
        <section className="surface-card-strong p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Host view</p>
          <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
            Applicants
          </h1>
        </section>

        <section className="mt-6 space-y-6">
          {pendingRoles.length > 0 ? (
            pendingRoles.map(({ event, role }) => (
              <div className="surface-card p-5" key={role.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-app-muted">{event.title}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">{role.roleName}</h2>
                  </div>
                  <Link
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                    href={`/host/events/${event.id}`}
                  >
                    Manage event
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
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
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm text-app-muted">No applicants need review right now.</p>
            </div>
          )}
        </section>
      </main>

      <ProfilePreviewModal
        onClose={() => setPreviewUserId(null)}
        open={Boolean(previewUserId)}
        user={previewUserId ? getUserById(previewUserId) ?? null : null}
      />
    </div>
  );
}
