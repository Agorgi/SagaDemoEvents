"use client";

import { useEffect, useMemo, useState } from "react";

import { ContributionTierCard } from "@/src/components/ContributionTierCard";
import { Modal } from "@/src/components/Modal";
import { type DemoCommission } from "@/src/data/commissions";
import { useDemoState } from "@/src/lib/demo-state";
import { formatCurrency } from "@/src/lib/utils";

export function CommitFundsModal({
  commission,
  open,
  onClose
}: {
  commission: DemoCommission | null;
  open: boolean;
  onClose: () => void;
}) {
  const { activeUserId, commitFunds } = useDemoState();
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open || !commission) {
      setSelectedTierId(null);
      setCustomAmount("");
      setNote("");
      setSuccess(false);
      return;
    }

    setSelectedTierId(commission.tiers[0]?.id ?? null);
  }, [commission, open]);

  const selectedTier = useMemo(
    () => commission?.tiers.find((tier) => tier.id === selectedTierId),
    [commission, selectedTierId]
  );

  if (!commission) {
    return null;
  }

  const parsedCustomAmount = Number(customAmount);
  const amount =
    customAmount.trim().length > 0 && !Number.isNaN(parsedCustomAmount)
      ? parsedCustomAmount
      : selectedTier?.amount ?? 0;
  const fundedNow =
    commission.raisedAmount < commission.goalAmount &&
    commission.raisedAmount + amount >= commission.goalAmount;

  const handleConfirm = () => {
    if (amount <= 0) {
      return;
    }

    commitFunds({
      commissionId: commission.id,
      userId: activeUserId,
      amount,
      tierId: selectedTier?.id,
      note
    });
    setSuccess(true);
  };

  return (
    <Modal
      description="Choose a tier or set a custom amount to help this upgrade clear production."
      onClose={onClose}
      open={open}
      panelClassName="max-w-3xl"
      title={success ? "Boost confirmed" : "Commit funds"}
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-app-success/10 text-3xl text-app-success animate-[pulse_1.1s_ease-in-out]">
            ✓
          </div>
          <h3 className="mt-6 text-3xl font-semibold text-white">
            {fundedNow ? "Backed — production unlocked" : "Funds committed"}
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-app-muted">
            {fundedNow
              ? "This boost just crossed its funding goal. Saga can now move it into production planning."
              : `Your ${formatCurrency(amount)} commitment has been added to the live total and the activity feed.`}
          </p>
          <button
            className="mt-8 rounded-2xl bg-app-purple px-5 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
            onClick={onClose}
            type="button"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {commission.tiers.map((tier) => (
                <ContributionTierCard
                  key={tier.id}
                  onSelect={() => {
                    setSelectedTierId(tier.id);
                    setCustomAmount("");
                  }}
                  selected={selectedTierId === tier.id && customAmount.trim().length === 0}
                  tier={tier}
                />
              ))}
            </div>

            <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-5">
              <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Summary</p>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white">
                    Custom amount (optional)
                  </span>
                  <input
                    className="w-full rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                    inputMode="numeric"
                    onChange={(event) => setCustomAmount(event.target.value)}
                    placeholder="25"
                    value={customAmount}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white">
                    Note (optional)
                  </span>
                  <textarea
                    className="min-h-[130px] w-full rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-app-purple/45"
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Why you want this to happen..."
                    value={note}
                  />
                </label>
              </div>
              <div className="mt-6 rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-sm text-app-muted">Commitment total</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {formatCurrency(amount)}
                </p>
                {selectedTier ? (
                  <p className="mt-2 text-sm text-app-muted">
                    Tier selected: {selectedTier.title}
                  </p>
                ) : null}
              </div>
              <button
                className="mt-6 w-full rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
                disabled={amount <= 0}
                onClick={handleConfirm}
                type="button"
              >
                Confirm commitment
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
