"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/src/components/Modal";
import { type ProfileService } from "@/src/data/creator-profiles";

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

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-app-muted">
                  Pricing label
                </span>
                <input
                  className="h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition placeholder:text-app-muted focus:border-white/20"
                  onChange={(event) =>
                    setDraftServices((current) =>
                      current.map((item) =>
                        item.id === service.id
                          ? { ...item, pricingLabel: event.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="$180 starting"
                  type="text"
                  value={service.pricingLabel}
                />
              </label>

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
                (service) => service.title.trim() && service.pricingLabel.trim()
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
