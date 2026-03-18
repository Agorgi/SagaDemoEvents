"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  panelClassName
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:py-6"
      role="dialog"
    >
      <div className="absolute inset-0" />
      <div
        className={`surface-card-strong relative z-10 my-auto flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden p-5 sm:max-h-[calc(100dvh-3rem)] sm:p-6 ${panelClassName ?? "max-w-lg"}`}
      >
        <div className="mb-5 flex shrink-0 items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            {description ? (
              <p className="mt-2 max-w-md text-sm text-app-muted">{description}</p>
            ) : null}
          </div>
          <button
            aria-label="Close modal"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-base text-app-muted transition hover:border-white/20 hover:text-white"
            onClick={onClose}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
              }
            }}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
