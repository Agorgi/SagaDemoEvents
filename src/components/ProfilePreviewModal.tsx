"use client";

import Link from "next/link";

import { Avatar } from "@/src/components/Avatar";
import { ExpandableText } from "@/src/components/ExpandableText";
import { Modal } from "@/src/components/Modal";
import { TagChip } from "@/src/components/Chips";
import { type DemoUser } from "@/src/data/demo";
import { formatCompactNumber } from "@/src/lib/utils";

export function ProfilePreviewModal({
  user,
  open,
  onClose
}: {
  user: DemoUser | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!user) {
    return null;
  }

  return (
    <Modal
      description={`${user.city} · ${user.roleType === "host" ? "Host" : "Contributor"}`}
      onClose={onClose}
      open={open}
      panelClassName="max-w-2xl"
      title={user.handle}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <Avatar name={user.name} size="lg" src={user.avatarUrl} />
          <div className="min-w-0">
            <p className="text-xl font-semibold text-white">{user.name}</p>
            <ExpandableText className="mt-2" collapsedLines={2} text={user.bio} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Past events" value={formatCompactNumber(user.pastEventsWorked)} />
          <Stat label="Mutuals" value={formatCompactNumber(user.mutuals)} />
          <Stat label="City" value={user.city.split(",")[0]} />
          <Stat label="Fit" value={user.fandomTags[0] ?? "Fandom"} />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Skills</p>
          <div className="flex flex-wrap gap-2">
            {user.skills.slice(0, 5).map((skill) => (
              <TagChip key={skill} label={skill} subdued />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Fandom fit</p>
          <div className="flex flex-wrap gap-2">
            {user.fandomTags.slice(0, 4).map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            className="rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            href={`/profiles/${user.id}`}
            onClick={onClose}
          >
            View profile
          </Link>
        </div>
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-white/[0.04] p-3">
      <p className="text-xs text-app-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
