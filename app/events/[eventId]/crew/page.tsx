"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { CandidateCard } from "@/src/components/CandidateCard";
import { ChatPanel } from "@/src/components/ChatPanel";
import { FilterChip, OpenRolesPill, TagChip } from "@/src/components/Chips";
import { Modal } from "@/src/components/Modal";
import { Nav } from "@/src/components/Nav";
import { RoleCard } from "@/src/components/RoleCard";
import {
  getEventById,
  getRolesForEvent,
  getUserById,
  users
} from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";
import { buildShortlist } from "@/src/lib/matching";
import { formatCurrencyRange } from "@/src/lib/utils";

type CrewViewMode = "host" | "crew";

export default function CrewMatchingPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const {
    activeUserId,
    applyToRole,
    autoStaffEvent,
    commissions,
    confirmRole,
    events,
    getEventCounts,
    inviteCandidate,
    messages,
    roles
  } = useDemoState();
  const event = getEventById(params.eventId, events);
  const [viewMode, setViewMode] = useState<CrewViewMode>("host");
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();
  const [isAutoStaffing, setIsAutoStaffing] = useState(false);
  const [applicationRoleId, setApplicationRoleId] = useState<string | undefined>();
  const [availability, setAvailability] = useState("Friday + event day");
  const [quote, setQuote] = useState("260");
  const [note, setNote] = useState(
    "Local, already active in this fandom, and I can stay through load-out."
  );

  if (!event) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
          Crew board not found.
        </main>
      </div>
    );
  }

  const eventRoles = getRolesForEvent(roles, event.id);
  const selectedRole =
    eventRoles.find((role) => role.id === selectedRoleId) ??
    eventRoles.find((role) => role.status !== "filled") ??
    eventRoles[0];
  const shortlist = selectedRole
    ? buildShortlist(event, selectedRole, users, roles)
    : [];
  const selectedThreads = selectedRole
    ? messages.filter(
        (thread) => thread.eventId === event.id && thread.roleId === selectedRole.id
      )
    : [];
  const roleCounts = getEventCounts(event.id);
  const crewUser = getUserById(activeUserId) ?? users[0];
  const linkedBoost = commissions.find((commission) => commission.linkedEventId === event.id);
  const sameStateRoles = roles.filter((role) => {
    if (role.status === "filled") {
      return false;
    }

    const roleEvent = getEventById(role.eventId, events);
    const roleState = roleEvent?.city.split(", ")[1];
    const crewState = crewUser?.city.split(", ")[1];
    return roleState && crewState && roleState === crewState;
  });

  const nearbyOpenRoles = sameStateRoles
    .map((role) => {
      const roleEvent = getEventById(role.eventId, events);
      return roleEvent ? { role, event: roleEvent } : undefined;
    })
    .filter(Boolean);

  const handleAutoStaff = () => {
    setIsAutoStaffing(true);
    window.setTimeout(() => {
      autoStaffEvent(event.id);
      setIsAutoStaffing(false);
    }, 1200);
  };

  const handleApply = () => {
    if (!applicationRoleId || !crewUser) {
      return;
    }

    const parsedQuote = Number.parseInt(quote, 10);
    applyToRole({
      eventId: params.eventId,
      roleId: applicationRoleId,
      applicantUserId: crewUser.id,
      availability,
      quote: Number.isNaN(parsedQuote) ? 0 : parsedQuote,
      note
    });
    setApplicationRoleId(undefined);
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-[1700px] px-4 py-6 sm:px-6">
        <div className="surface-card-strong mb-6 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-app-muted">
                Crew board
              </p>
              <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
                {event.title}
              </h1>
              <p className="mt-2 max-w-2xl text-base text-app-muted">
                Shortlist trusted collaborators, send outreach, and confirm roles without leaving the event.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-[22px] border border-white/8 bg-white/[0.03] p-2">
                <span className="px-3 text-sm font-medium text-app-muted">View as:</span>
                <FilterChip
                  active={viewMode === "host"}
                  label="Host"
                  onClick={() => setViewMode("host")}
                />
                <FilterChip
                  active={viewMode === "crew"}
                  label="Crew Member"
                  onClick={() => setViewMode("crew")}
                />
              </div>
              {linkedBoost ? (
                <Link
                  className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white/20"
                  href={`/commissions/${linkedBoost.id}`}
                >
                  View event boost
                </Link>
              ) : null}
              <button
                className="rounded-2xl bg-app-purple px-5 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isAutoStaffing}
                onClick={handleAutoStaff}
                type="button"
              >
                {isAutoStaffing ? "Auto-staffing..." : "Auto-Staff This Event"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-app-muted">Staffing progress</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    Staffed {roleCounts.filled}/{roleCounts.total} roles
                  </p>
                </div>
                <OpenRolesPill count={roleCounts.open} emphasized />
              </div>
              <div className="h-3 rounded-full bg-white/6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-app-purple to-[#6661FF]"
                  style={{
                    width: `${(roleCounts.filled / Math.max(roleCounts.total, 1)) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                <p className="text-sm text-app-muted">Attendees</p>
                <p className="mt-2 text-3xl font-semibold text-white">{event.attendeesCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
                <p className="text-sm text-app-muted">Mutuals</p>
                <p className="mt-2 text-3xl font-semibold text-white">{event.mutualsCount}</p>
              </div>
              <div className="col-span-2 rounded-[24px] border border-white/8 bg-[#0d1119] p-4 sm:col-span-1">
                <p className="text-sm text-app-muted">Open roles</p>
                <p className="mt-2 text-3xl font-semibold text-white">{roleCounts.open}</p>
              </div>
            </div>
          </div>
        </div>

        {viewMode === "host" ? (
          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
            <section className="min-w-0 space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  Roles Needed
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Open roles</h2>
              </div>

              {eventRoles.map((role) => (
                <RoleCard
                  extra={
                    role.status === "filled" ? (
                      <div className="flex items-center gap-3 text-sm text-app-muted">
                        <Avatar
                          name={getUserById(role.filledByUserId)?.name ?? "Crew"}
                          size="sm"
                          src={getUserById(role.filledByUserId)?.avatarUrl}
                        />
                        <span>
                          {getUserById(role.filledByUserId)?.handle ?? "Confirmed"}
                        </span>
                      </div>
                    ) : role.applicants.length > 0 ? (
                      <p className="text-sm text-[#D9D4FF]">
                        {role.applicants.length} new applicant
                        {role.applicants.length > 1 ? "s" : ""}
                      </p>
                    ) : (
                      <p className="text-sm text-app-muted">
                        Ready for Saga to source from fandom mutuals.
                      </p>
                    )
                  }
                  key={role.id}
                  onAction={() => setSelectedRoleId(role.id)}
                  role={role}
                  selected={selectedRole?.id === role.id}
                />
              ))}
            </section>

            <section className="min-w-0 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                    Shortlist
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">
                    {selectedRole?.roleName ?? "Select a role"}
                  </h2>
                </div>
                {selectedRole ? (
                  <span className="text-sm text-app-muted">
                    {shortlist.length} candidates
                  </span>
                ) : null}
              </div>

              <div className="grid gap-4">
                {selectedRole && shortlist.length > 0 ? (
                  shortlist.map((candidate) => (
                    <CandidateCard
                      candidate={candidate}
                      filled={selectedRole.filledByUserId === candidate.user.id}
                      invited={selectedRole.invitedUserId === candidate.user.id}
                      key={candidate.user.id}
                      onInvite={() =>
                        selectedRole.status === "filled"
                          ? undefined
                          : inviteCandidate({
                              eventId: event.id,
                              roleId: selectedRole.id,
                              candidateUserId: candidate.user.id
                            })
                      }
                      onSelect={() => setSelectedRoleId(selectedRole.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-center text-app-muted">
                    No shortlist available for this role yet.
                  </div>
                )}
              </div>
            </section>

            <div className="min-w-0">
              {selectedRole ? (
                <ChatPanel
                  onConfirm={(candidateUserId) =>
                    confirmRole({
                      eventId: event.id,
                      roleId: selectedRole.id,
                      candidateUserId
                    })
                  }
                  role={selectedRole}
                  threads={selectedThreads}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="min-w-0 space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  Open Roles Near You
                </p>
                <h2 className="mt-2 text-4xl font-semibold text-white">
                  {crewUser?.city.split(", ")[0]} crew demand
                </h2>
              </div>

              <div className="grid gap-4">
                {nearbyOpenRoles.map((entry) => {
                  if (!entry) {
                    return null;
                  }

                  return (
                    <div
                      className="surface-card p-5"
                      key={entry.role.id}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-app-muted">{entry.event.title}</p>
                          <h3 className="mt-1 text-2xl font-semibold text-white">
                            {entry.role.roleName}
                          </h3>
                          <p className="mt-2 text-sm text-app-muted">
                            Estimated payout {formatCurrencyRange(entry.role.payoutRange)}
                          </p>
                        </div>
                        <OpenRolesPill count={getEventCounts(entry.event.id).open} />
                      </div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {entry.role.requiredSkills.map((skill) => (
                          <TagChip key={skill} label={skill} subdued />
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-app-muted">{entry.event.city}</p>
                        <button
                          className="rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                          onClick={() => setApplicationRoleId(entry.role.id)}
                          type="button"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="min-w-0 space-y-6">
              <div className="surface-card p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  Crew profile
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Avatar name={crewUser?.name ?? "Crew"} size="lg" src={crewUser?.avatarUrl} />
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{crewUser?.handle}</h3>
                    <p className="text-sm text-app-muted">{crewUser?.bio}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {crewUser?.skills.map((skill) => (
                    <TagChip key={skill} label={skill} subdued />
                  ))}
                </div>
              </div>

              <div className="surface-card p-6">
                <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
                  How this stays lightweight
                </p>
                <ul className="mt-4 space-y-3 text-sm text-app-muted">
                  <li>Open roles stay tied to a real event, not a generic marketplace board.</li>
                  <li>You can raise your hand quickly and the host sees it immediately.</li>
                  <li>Once confirmed, your work history reinforces trust for the next event.</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Modal
        description="Send a real crew application that will appear in the host board instantly."
        onClose={() => setApplicationRoleId(undefined)}
        open={Boolean(applicationRoleId)}
        title="Apply to this role"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-app-muted">Availability</span>
            <input
              className="w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
              onChange={(event) => setAvailability(event.target.value)}
              value={availability}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-app-muted">Quote</span>
            <input
              className="w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
              onChange={(event) => setQuote(event.target.value)}
              type="number"
              value={quote}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-app-muted">Short note</span>
            <textarea
              className="min-h-[120px] w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
              onChange={(event) => setNote(event.target.value)}
              value={note}
            />
          </label>
          <button
            className="w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={handleApply}
            type="button"
          >
            Submit application
          </button>
        </div>
      </Modal>
    </div>
  );
}
