"use client";

import { useEffect, useMemo, useState } from "react";

import { FilterChip } from "@/src/components/Chips";
import { Modal } from "@/src/components/Modal";
import { type CommissionType } from "@/src/data/commissions";
import { useDemoState } from "@/src/lib/demo-state";

type TierDraft = {
  title: string;
  amount: string;
  description: string;
};

type RoleDraft = {
  roleName: string;
  min: string;
  max: string;
  skills: string;
};

const initialTierDrafts: TierDraft[] = [
  { title: "", amount: "", description: "" },
  { title: "", amount: "", description: "" }
];

const initialRoleDrafts: RoleDraft[] = [
  { roleName: "", min: "", max: "", skills: "" }
];

export function StartCommissionModal({
  open,
  onClose,
  onPublished
}: {
  open: boolean;
  onClose: () => void;
  onPublished?: (commissionId: string) => void;
}) {
  const { createCommission, events } = useDemoState();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CommissionType>("event");
  const [location, setLocation] = useState("");
  const [goal, setGoal] = useState("");
  const [timing, setTiming] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [tierDrafts, setTierDrafts] = useState<TierDraft[]>(initialTierDrafts);
  const [roleDrafts, setRoleDrafts] = useState<RoleDraft[]>(initialRoleDrafts);
  const [selectedCover, setSelectedCover] = useState(events[0]?.posterUrl ?? "");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setType("event");
      setLocation("");
      setGoal("");
      setTiming("");
      setDescription("");
      setTags("");
      setTierDrafts(initialTierDrafts);
      setRoleDrafts(initialRoleDrafts);
      setSelectedCover(events[0]?.posterUrl ?? "");
    }
  }, [events, open]);

  const coverOptions = useMemo(
    () =>
      events.slice(0, 4).map((event) => ({
        id: event.id,
        title: event.title,
        imageUrl: event.posterUrl
      })),
    [events]
  );

  const handlePublish = () => {
    const parsedGoal = Number(goal);
    if (!title.trim() || !location.trim() || !timing.trim() || !description.trim()) {
      return;
    }

    const id = createCommission({
      title: title.trim(),
      type,
      city: location.trim(),
      goalAmount: Number.isNaN(parsedGoal) ? 0 : parsedGoal,
      timingLabel: timing.trim(),
      description: description.trim(),
      fandomTags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      tiers: tierDrafts
        .filter((tier) => tier.title.trim() && Number(tier.amount) > 0)
        .map((tier) => ({
          title: tier.title.trim(),
          amount: Number(tier.amount),
          description: tier.description.trim() || "Back this tier to move the boost forward.",
          perks: [
            tier.title.trim(),
            type === "event" ? "Production updates" : "Creator updates"
          ]
        })),
      openRoles: roleDrafts
        .filter((role) => role.roleName.trim())
        .map((role) => ({
          roleName: role.roleName.trim(),
          payoutRange: [Math.max(0, Number(role.min) || 0), Math.max(0, Number(role.max) || Number(role.min) || 0)] as [number, number],
          requiredSkills: role.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        })),
      imageUrl: selectedCover
    });

    onClose();
    onPublished?.(id);
  };

  return (
    <Modal
      description="Launch an event-linked boost with a clear funding goal, reward tiers, and optional helper roles."
      onClose={onClose}
      open={open}
      panelClassName="max-w-4xl"
      title="Start an Event Boost"
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Title</span>
            <input
              className="w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Cosplay Live Drawing upgrade"
              value={title}
            />
          </label>
          <div>
            <p className="mb-2 text-sm font-semibold text-white">Type</p>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={type === "event"}
                label="Event"
                onClick={() => setType("event")}
              />
              <FilterChip
                active={type === "creator project"}
                label="Creator Projects"
                onClick={() => setType("creator project")}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Location</span>
              <input
                className="w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Pasadena, CA"
                value={location}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Funding goal</span>
              <input
                className="w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                inputMode="numeric"
                onChange={(event) => setGoal(event.target.value)}
                placeholder="5000"
                value={goal}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Timing</span>
            <input
              className="w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
              onChange={(event) => setTiming(event.target.value)}
              placeholder="Boost closes in 14 days"
              value={timing}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Description</span>
            <textarea
              className="min-h-[150px] w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What should this funding unlock for the event?"
              value={description}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Fandom tags</span>
            <input
              className="w-full rounded-[18px] border border-white/8 bg-[#0d1119] px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
              onChange={(event) => setTags(event.target.value)}
              placeholder="Cosplay, workshop, live drawing"
              value={tags}
            />
          </label>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
            <p className="text-sm font-semibold text-white">Cover image</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {coverOptions.map((option) => (
                <button
                  className={`overflow-hidden rounded-[20px] border transition ${
                    selectedCover === option.imageUrl
                      ? "border-app-purple/40 shadow-[0_18px_30px_rgba(31,28,184,0.18)]"
                      : "border-white/8 hover:border-white/15"
                  }`}
                  key={option.id}
                  onClick={() => setSelectedCover(option.imageUrl)}
                  type="button"
                >
                  <img
                    alt={option.title}
                    className="h-24 w-full object-cover"
                    src={option.imageUrl}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Reward tiers</p>
              <button
                className="text-sm font-semibold text-[#DEDCFF]"
                onClick={() =>
                  setTierDrafts((current) => [
                    ...current,
                    { title: "", amount: "", description: "" }
                  ])
                }
                type="button"
              >
                Add tier
              </button>
            </div>
            <div className="space-y-3">
              {tierDrafts.map((tier, index) => (
                <div className="grid gap-3 sm:grid-cols-[1fr_110px] sm:items-start" key={`tier-${index}`}>
                  <div className="space-y-3">
                    <input
                      className="w-full rounded-[16px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                      onChange={(event) =>
                        setTierDrafts((current) =>
                          current.map((entry, tierIndex) =>
                            tierIndex === index
                      ? { ...entry, title: event.target.value }
                              : entry
                          )
                        )
                      }
                      placeholder="Tier title"
                      value={tier.title}
                    />
                    <textarea
                      className="min-h-[86px] w-full rounded-[16px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                      onChange={(event) =>
                        setTierDrafts((current) =>
                          current.map((entry, tierIndex) =>
                            tierIndex === index
                              ? { ...entry, description: event.target.value }
                              : entry
                          )
                        )
                      }
                      placeholder="What does this unlock?"
                      value={tier.description}
                    />
                  </div>
                  <input
                    className="w-full rounded-[16px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                    inputMode="numeric"
                    onChange={(event) =>
                      setTierDrafts((current) =>
                        current.map((entry, tierIndex) =>
                          tierIndex === index
                            ? { ...entry, amount: event.target.value }
                            : entry
                        )
                      )
                    }
                    placeholder="$"
                    value={tier.amount}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Open roles</p>
              <button
                className="text-sm font-semibold text-[#DEDCFF]"
                onClick={() =>
                  setRoleDrafts((current) => [
                    ...current,
                    { roleName: "", min: "", max: "", skills: "" }
                  ])
                }
                type="button"
              >
                Add role
              </button>
            </div>
            <div className="space-y-3">
              {roleDrafts.map((role, index) => (
                <div className="grid gap-3" key={`role-${index}`}>
                  <input
                    className="w-full rounded-[16px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                    onChange={(event) =>
                      setRoleDrafts((current) =>
                        current.map((entry, roleIndex) =>
                          roleIndex === index
                            ? { ...entry, roleName: event.target.value }
                            : entry
                        )
                      )
                    }
                    placeholder="Role name"
                    value={role.roleName}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="w-full rounded-[16px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                      inputMode="numeric"
                      onChange={(event) =>
                        setRoleDrafts((current) =>
                          current.map((entry, roleIndex) =>
                            roleIndex === index
                              ? { ...entry, min: event.target.value }
                              : entry
                          )
                        )
                      }
                      placeholder="Min payout"
                      value={role.min}
                    />
                    <input
                      className="w-full rounded-[16px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                      inputMode="numeric"
                      onChange={(event) =>
                        setRoleDrafts((current) =>
                          current.map((entry, roleIndex) =>
                            roleIndex === index
                              ? { ...entry, max: event.target.value }
                              : entry
                          )
                        )
                      }
                      placeholder="Max payout"
                      value={role.max}
                    />
                  </div>
                  <input
                    className="w-full rounded-[16px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                    onChange={(event) =>
                      setRoleDrafts((current) =>
                        current.map((entry, roleIndex) =>
                          roleIndex === index
                            ? { ...entry, skills: event.target.value }
                            : entry
                        )
                      )
                    }
                    placeholder="Skills, comma separated"
                    value={role.skills}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
          onClick={onClose}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
          disabled={
            !title.trim() ||
            !location.trim() ||
            !timing.trim() ||
            !description.trim() ||
            Number(goal) <= 0
          }
          onClick={handlePublish}
          type="button"
        >
          Publish boost
        </button>
      </div>
    </Modal>
  );
}
