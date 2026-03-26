"use client";

import { Nav } from "@/src/components/Nav";
import { useAppState } from "@/src/lib/app-state";
import { APP_ROUTES } from "@/src/lib/routes";

export default function DataSettingsPage() {
  const { importedDataSettings, resetOnboarding, updateImportedDataSettings } = useAppState();

  const toggles = [
    {
      key: "instagramConnected" as const,
      title: "Instagram profile",
      body: "Mock imported profile and post context for public identity cards."
    },
    {
      key: "tiktokConnected" as const,
      title: "TikTok clips",
      body: "Mock clip history that helps hosts and venues read your scene fit."
    },
    {
      key: "portfolioImportEnabled" as const,
      title: "Portfolio import",
      body: "Allow sample portfolio items to surface on profile, storefront, and match cards."
    }
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-[840px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Data settings</p>
          <h1 className="text-4xl font-semibold text-white">Imported profile controls</h1>
          <p className="max-w-[48ch] text-sm text-app-muted">
            This is mock UI representing consent, visibility, and linked-profile integrity.
          </p>
        </section>

        <div className="mt-6 space-y-4">
          {toggles.map((toggle) => (
            <div className="surface-card flex items-center justify-between gap-4 p-5" key={toggle.key}>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-white">{toggle.title}</p>
                <p className="mt-2 text-sm text-app-muted">{toggle.body}</p>
              </div>
              <button
                aria-pressed={importedDataSettings[toggle.key]}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  importedDataSettings[toggle.key]
                    ? "bg-app-purple text-white"
                    : "border border-white/10 text-app-muted hover:border-white/20 hover:text-white"
                }`}
                onClick={() =>
                  updateImportedDataSettings({
                    [toggle.key]: !importedDataSettings[toggle.key]
                  })
                }
                type="button"
              >
                {importedDataSettings[toggle.key] ? "On" : "Off"}
              </button>
            </div>
          ))}

          <div className="surface-card p-5">
            <p className="text-lg font-semibold text-white">Visibility</p>
            <div className="mt-4 flex gap-2">
              {(["public", "followers"] as const).map((option) => (
                <button
                  className={`pill ${importedDataSettings.visibility === option ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
                  key={option}
                  onClick={() => updateImportedDataSettings({ visibility: option })}
                  type="button"
                >
                  {option === "public" ? "Public" : "Followers only"}
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <p className="text-lg font-semibold text-white">Demo replay</p>
            <p className="mt-2 text-sm text-app-muted">
              Reset onboarding if you want to walk the first-run flow again.
            </p>
            <button
              className="mt-4 min-h-[46px] rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20"
              onClick={() => {
                resetOnboarding();
                window.location.assign(APP_ROUTES.onboarding);
              }}
              type="button"
            >
              Replay onboarding
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
