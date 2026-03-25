"use client";

import { StarRatingValue } from "@/src/components/StarRatingValue";
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
                className="inline-flex min-h-[36px] items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.05]"
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
        <div className="space-y-3">
          {services.map((service) => (
            <div
              className="rounded-[24px] border border-white/8 bg-[#111622] px-4 py-4"
              key={service.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{service.title}</p>
                  <p className="mt-1 text-sm text-app-muted">{service.pricingLabel}</p>
                </div>
                {!publicView ? (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      service.visibleOnPublicProfile
                        ? "bg-app-purple/14 text-[#DDD9FF]"
                        : "bg-white/[0.06] text-app-muted"
                    }`}
                  >
                    {service.visibleOnPublicProfile ? "Public" : "Private"}
                  </span>
                ) : null}
              </div>

              {service.shortDescription ? (
                <p className="mt-3 text-sm leading-6 text-app-muted">
                  {service.shortDescription}
                </p>
              ) : null}

              {publicView && (service.reviewScore || service.reviewCount) ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-app-muted">
                  {service.reviewScore ? (
                    <StarRatingValue rating={service.reviewScore} variant="inline" />
                  ) : null}
                  {service.reviewCount ? (
                    <span>{service.reviewCount} reviews</span>
                  ) : null}
                </div>
              ) : null}
            </div>
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
