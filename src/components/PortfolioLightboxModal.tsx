"use client";

import { Modal } from "@/src/components/Modal";
import { type CreatorPortfolioItem } from "@/src/data/creator-profiles";

export function PortfolioLightboxModal({
  item,
  open,
  onClose
}: {
  item: CreatorPortfolioItem | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !item) {
    return null;
  }

  return (
    <Modal
      description={item.kind ? item.kind[0].toUpperCase() + item.kind.slice(1) : undefined}
      onClose={onClose}
      open={open}
      panelClassName="max-w-3xl p-4 sm:p-5"
      title={item.title ?? "Portfolio"}
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[28px] bg-[#0d1119]">
          <img
            alt={item.title ?? "Portfolio item"}
            className="max-h-[70dvh] w-full object-cover"
            src={item.image}
          />
        </div>
      </div>
    </Modal>
  );
}
