"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/src/components/Modal";
import {
  formatServicePricing,
  type ProfileService,
  type ServicePricingMode
} from "@/src/data/creator-profiles";
import {
  buildServicePricingLabel,
  inferServicePriceAmount,
  inferServicePricingMode
} from "@/src/data/service-flow";

type EditableService = ProfileService;

export function ManageServicesModal({
  open,
  services,
  onClose,
  onSave
}: {
  open: boolean;
  services: ProfileService[];
  onClose: () => void;
  onSave: (services: ProfileService[]) => void;
}) {
  const [draftServices, setDraftServices] = useState<EditableService[]>(services);

  useEffect(() => {
    if (open) {
      setDraftServices(services);
    }
  }, [open, services]);

  return (
    <Modal
      description="Control what shows up on your public page."
      onClose={onClose}
      open={open}
      panelClassName="max-w-xl"
      title="Manage services"
    >
      <div className="space-y-4">
        {draftServices.map((service, index) => (
          <div className="rounded-[24px] border border-white/8 bg-[#101522] p-4" key={service.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Service {index + 1}</p>
              <button
                className="text-sm text-app-muted transition hover:text-white"
                onClick={() =>
                  setDraftServices((current) => current.filter((item) => item.id !== service.id))
                }
                type="button"
              >
                Remove
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-app-muted">
                  Title
                </span>
                <input
                  className="h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition placeholder:text-app-muted focus:border-white/20"
                  onChange={(event) =>
                    setDraftServices((current) =>
                      current.map((item) =>
                        item.id === service.id ? { ...item, title: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Portrait sessions"
                  type="text"
                  value={service.title}
                />
              </label>

              <div className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-app-muted">
                  Pricing
                </span>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(["hourly", "flat"] as ServicePricingMode[]).map((mode) => {
                      const selectedMode =
                        service.pricingMode ?? inferServicePricingMode(service.pricingLabel);
                      return (
                        <button
                          className={`rounded-[18px] border px-3 py-3 text-sm font-semibold transition ${
                            selectedMode === mode
                              ? "border-app-purple/40 bg-app-purple/12 text-white"
                              : "border-white/10 bg-white/[0.03] text-app-muted hover:border-white/20 hover:text-white"
                          }`}
                          key={mode}
                          onClick={() =>
                            setDraftServices((current) =>
                              current.map((item) => {
                                if (item.id !== service.id) {
                                  return item;
                                }
                                const nextAmount =
                                  item.priceAmount?.toString() || inferServicePriceAmount(item.pricingLabel);
                                return {
                                  ...item,
                                  pricingMode: mode,
                                  pricingLabel:
                                    buildServicePricingLabel(mode, nextAmount) || item.pricingLabel
                                };
                              })
                            )
                          }
                          type="button"
                        >
                          {mode === "hourly" ? "Hourly" : "Flat fee"}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/68">
                      $
                    </span>
                    <input
                      className="h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.03] pl-8 pr-4 text-sm text-white outline-none transition placeholder:text-app-muted focus:border-white/20"
                      inputMode="decimal"
                      onChange={(event) =>
                        setDraftServices((current) =>
                          current.map((item) => {
                            if (item.id !== service.id) {
                              return item;
                            }
                            const cleaned = event.target.value.replace(/[^\d.]/g, "");
                            const mode = item.pricingMode ?? inferServicePricingMode(item.pricingLabel);
                            const parsed = Number(cleaned);
                            return {
                              ...item,
                              priceAmount:
                                Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
                              pricingLabel: buildServicePricingLabel(mode, cleaned) || item.pricingLabel
                            };
                          })
                        )
                      }
                      placeholder="30"
                      type="text"
                      value={
                        service.priceAmount?.toString() || inferServicePriceAmount(service.pricingLabel)
                      }
                    />
                  </div>
                  <p className="text-xs text-app-muted">{formatServicePricing(service)}</p>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-app-muted">
                  Short description
                </span>
                <textarea
                  className="min-h-[96px] w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-app-muted focus:border-white/20"
                  onChange={(event) =>
                    setDraftServices((current) =>
                      current.map((item) =>
                        item.id === service.id
                          ? { ...item, shortDescription: event.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Quick description for your public page."
                  value={service.shortDescription ?? ""}
                />
              </label>

              <label className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-3">
                <span className="text-sm font-medium text-white">Open to volunteering</span>
                <input
                  checked={Boolean(service.openToVolunteering)}
                  className="h-4 w-4 accent-[#7B84FF]"
                  onChange={(event) =>
                    setDraftServices((current) =>
                      current.map((item) =>
                        item.id === service.id
                          ? { ...item, openToVolunteering: event.target.checked }
                          : item
                      )
                    )
                  }
                  type="checkbox"
                />
              </label>

              <label className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-3">
                <span className="text-sm font-medium text-white">Visible on public profile</span>
                <input
                  checked={service.visibleOnPublicProfile}
                  className="h-4 w-4 accent-[#7B84FF]"
                  onChange={(event) =>
                    setDraftServices((current) =>
                      current.map((item) =>
                        item.id === service.id
                          ? { ...item, visibleOnPublicProfile: event.target.checked }
                          : item
                      )
                    )
                  }
                  type="checkbox"
                />
              </label>
            </div>
          </div>
        ))}

        <button
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={() => {
            onSave(
              draftServices.filter(
                (service) =>
                  service.title.trim() &&
                  (service.pricingLabel.trim() || typeof service.priceAmount === "number")
              )
            );
            onClose();
          }}
          type="button"
        >
          Save changes
        </button>
      </div>
    </Modal>
  );
}
