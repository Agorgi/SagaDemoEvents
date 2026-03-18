"use client";

import { initials, cn } from "@/src/lib/utils";

type AvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base"
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-app-purple/35 font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]",
        sizeClasses[size],
        className
      )}
      aria-label={name}
    >
      {src ? (
        <img
          alt={name}
          className="h-full w-full object-cover"
          src={src}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}

export function AvatarStack({
  people
}: {
  people: Array<{ id: string; name: string; avatarUrl?: string }>;
}) {
  return (
    <div className="flex items-center">
      {people.map((person, index) => (
        <Avatar
          key={person.id}
          className={cn("-ml-2 first:ml-0", index > 0 && "ring-2 ring-[#0b0d12]")}
          name={person.name}
          size="sm"
          src={person.avatarUrl}
        />
      ))}
    </div>
  );
}
