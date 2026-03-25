"use client";

import { cn } from "@/src/lib/utils";

export function OnboardingScreenShell({
  title,
  subcopy,
  current,
  total,
  onBack,
  onClose,
  children,
  footer,
  skippable,
  onSkip
}: {
  title: string;
  subcopy?: string;
  current: number;
  total: number;
  onBack: () => void;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  skippable?: boolean;
  onSkip?: () => void;
}) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <main className="min-h-screen bg-app-grid px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[720px] flex-col">
        <header className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white transition hover:border-white/20"
              onClick={onBack}
              type="button"
            >
              ←
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white transition hover:border-white/20"
              onClick={onClose}
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-app-purple transition-[width] duration-300"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.16em] text-app-muted">
              <span>
                Step {Math.min(current + 1, total)} of {total}
              </span>
              {skippable && onSkip ? (
                <button
                  className="font-semibold text-app-muted transition hover:text-white"
                  onClick={onSkip}
                  type="button"
                >
                  Skip
                </button>
              ) : (
                <span />
              )}
            </div>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-8">
          <div className="space-y-3">
            <h1 className="max-w-[14ch] text-[34px] font-semibold leading-tight text-white sm:text-[46px]">
              {title}
            </h1>
            {subcopy ? (
              <p className="max-w-[34ch] text-sm leading-6 text-app-muted sm:text-base">
                {subcopy}
              </p>
            ) : null}
          </div>

          <div className="mt-8">{children}</div>
        </section>

        {footer ? (
          <div className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] mt-6">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}

export function OnboardingChoiceCard({
  title,
  description,
  selected,
  onClick,
  compact
}: {
  title: string;
  description?: string;
  selected?: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-full rounded-[28px] border bg-[#0d1119] text-left transition hover:-translate-y-0.5",
        selected
          ? "border-app-purple/40 bg-app-purple/10 shadow-[0_18px_42px_rgba(31,28,184,0.2)]"
          : "border-white/8 hover:border-white/16 hover:bg-[#101522]",
        compact ? "px-4 py-4" : "px-5 py-5"
      )}
      onClick={onClick}
      type="button"
    >
      <div className="space-y-2">
        <p className={cn("font-semibold text-white", compact ? "text-base" : "text-xl")}>{title}</p>
        {description ? (
          <p className="max-w-[34ch] text-sm leading-6 text-app-muted">{description}</p>
        ) : null}
      </div>
    </button>
  );
}

export function StickyFooter({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondaryLabel,
  onSecondary
}: {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-[#0d1119]/94 p-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          className="min-h-[48px] flex-1 rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-45"
          disabled={primaryDisabled}
          onClick={onPrimary}
          type="button"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary ? (
          <button
            className="min-h-[48px] rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
            onClick={onSecondary}
            type="button"
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
