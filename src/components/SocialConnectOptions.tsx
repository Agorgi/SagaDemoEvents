"use client";

import { useEffect, useMemo, useState } from "react";

import {
  type SocialConnection,
  type SocialPlatform,
  upsertSocialConnection
} from "@/src/data/onboarding";
import { cn } from "@/src/lib/utils";

type SocialConnectOptionsProps = {
  socials: SocialConnection[];
  onChange: (next: SocialConnection[]) => void;
  allowManual?: boolean;
};

const platformMeta: Array<{
  platform: SocialPlatform;
  label: string;
  description: string;
}> = [
  {
    platform: "instagram",
    label: "Instagram",
    description: "Great for photo-forward profiles and vibe checks."
  },
  {
    platform: "tiktok",
    label: "TikTok",
    description: "Best for clips, edits, and fast trust signals."
  }
];

export function SocialConnectOptions({
  socials,
  onChange,
  allowManual = true
}: SocialConnectOptionsProps) {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform | null>(null);
  const [manualPlatform, setManualPlatform] = useState<SocialPlatform | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [justConnectedPlatform, setJustConnectedPlatform] = useState<SocialPlatform | null>(null);

  useEffect(() => {
    if (!justConnectedPlatform) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setJustConnectedPlatform(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [justConnectedPlatform]);

  const byPlatform = useMemo(
    () =>
      platformMeta.reduce<Record<SocialPlatform, Exclude<SocialConnection, null> | undefined>>(
        (accumulator, item) => {
          accumulator[item.platform] =
            (socials.find(
              (entry) => entry?.platform === item.platform
            ) as Exclude<SocialConnection, null> | undefined) ?? undefined;
          return accumulator;
        },
        {
          instagram: undefined,
          tiktok: undefined
        }
      ),
    [socials]
  );

  function connectPlatform(platform: SocialPlatform) {
    onChange(
      upsertSocialConnection(socials, {
        platform,
        mode: "connected",
        value: `@${platform === "instagram" ? "saga.scene" : "saga.scene.edit"}`
      })
    );
    setJustConnectedPlatform(platform);
    setActivePlatform(null);
  }

  function saveManualHandle() {
    if (!manualPlatform || !manualValue.trim()) {
      return;
    }

    onChange(
      upsertSocialConnection(socials, {
        platform: manualPlatform,
        mode: "handle",
        value: manualValue.trim().startsWith("@")
          ? manualValue.trim()
          : `@${manualValue.trim()}`
      })
    );
    setJustConnectedPlatform(manualPlatform);
    setManualPlatform(null);
    setManualValue("");
  }

  return (
    <>
      <div className="space-y-3">
        {platformMeta.map((item) => {
          const connected = byPlatform[item.platform];

          return (
            <div
              className={cn(
                "rounded-[24px] border p-4 transition",
                connected
                  ? "social-connected-badge border-app-purple/30 bg-app-purple/10"
                  : "border-white/8 bg-[#0d1119] hover:border-white/16"
              )}
              key={item.platform}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-app-muted">{item.description}</p>
                </div>
                <button
                  className={cn(
                    "min-h-[44px] rounded-[16px] px-4 py-2 text-sm font-semibold transition",
                    connected
                      ? "bg-white/[0.08] text-white"
                      : "bg-app-purple text-white hover:bg-app-purple-hover"
                  )}
                  onClick={() => setActivePlatform(item.platform)}
                  type="button"
                >
                  {connected ? "Connected" : `Connect ${item.label}`}
                </button>
              </div>
              {connected ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-white/84">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                      justConnectedPlatform === item.platform
                        ? "border-app-purple/35 bg-app-purple/15 text-white"
                        : "border-white/12 bg-white/[0.04] text-white/76"
                    )}
                  >
                    ✓
                  </span>
                  <span>{connected.value}</span>
                </div>
              ) : null}
            </div>
          );
        })}

        {allowManual ? (
          <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
            <div className="flex flex-wrap items-center gap-2">
              {platformMeta.map((item) => (
                <button
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    manualPlatform === item.platform
                      ? "border-app-purple/30 bg-app-purple/12 text-white"
                      : "border-white/10 text-app-muted hover:border-white/20 hover:text-white"
                  )}
                  key={item.platform}
                  onClick={() => setManualPlatform(item.platform)}
                  type="button"
                >
                  Add {item.label} handle
                </button>
              ))}
            </div>

            {manualPlatform ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  className="min-h-[48px] flex-1 rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none placeholder:text-app-muted"
                  onChange={(event) => setManualValue(event.target.value)}
                  placeholder={`Enter your ${manualPlatform === "instagram" ? "Instagram" : "TikTok"} handle`}
                  value={manualValue}
                />
                <button
                  className="min-h-[48px] rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                  onClick={saveManualHandle}
                  type="button"
                >
                  Save handle
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {activePlatform ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 px-4 pb-6 pt-12">
          <div className="onboarding-success-card w-full max-w-[460px] rounded-[30px] border border-white/10 bg-[#0d1119] p-5 shadow-soft">
            <p className="text-sm uppercase tracking-[0.16em] text-app-muted">
              Mock connect
            </p>
            <h2 className="relative z-[1] mt-3 text-2xl font-semibold text-white">
              Connect {activePlatform === "instagram" ? "Instagram" : "TikTok"}
            </h2>
            <p className="relative z-[1] mt-3 text-sm leading-6 text-app-muted">
              This demo will store a connected state so your profile feels more real right away.
            </p>
            <div className="relative z-[1] mt-6 flex gap-3">
              <button
                className="min-h-[48px] flex-1 rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() => connectPlatform(activePlatform)}
                type="button"
              >
                Continue
              </button>
              <button
                className="min-h-[48px] rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
                onClick={() => setActivePlatform(null)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
