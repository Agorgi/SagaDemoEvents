"use client";

import { ProfileServiceCard } from "@/src/components/ProfileServiceCard";
import { type ProfileService } from "@/src/data/creator-profiles";

export function ServicesSection({
  title,
  services,
  publicView = false,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: {
  title: string;
  services: ProfileService[];
  publicView?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
          <div className="flex items-center gap-3">
            {secondaryActionLabel && onSecondaryAction ? (
              <button
                className="text-sm font-medium text-app-muted transition hover:text-white"
                onClick={onSecondaryAction}
                type="button"
              >
                {secondaryActionLabel}
              </button>
            ) : null}
            {actionLabel && onAction ? (
              <button
                className="text-sm font-medium text-white/76 transition hover:text-white"
                onClick={onAction}
                type="button"
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {services.length > 0 ? (
        <div className="space-y-4">
          {services.map((service) => (
            <ProfileServiceCard
              className="p-3"
              key={service.id}
              mode={publicView ? "public" : "private"}
              service={service}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
          <p className="text-sm text-app-muted">
            {publicView ? "No public services yet." : "No services added yet."}
          </p>
        </div>
      )}
    </section>
  );
}
