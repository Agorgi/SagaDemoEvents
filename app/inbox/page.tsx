"use client";

import { useMemo, useState } from "react";

import { ActivityItem } from "@/src/components/ActivityItem";
import { Nav } from "@/src/components/Nav";
import { type InboxKind } from "@/src/data/launches";
import { useAppState } from "@/src/lib/app-state";

const tabs: Array<{ label: string; value: InboxKind }> = [
  { label: "Updates", value: "updates" },
  { label: "Team", value: "team" },
  { label: "Tickets", value: "tickets" },
  { label: "Payments", value: "payments" }
];

export default function InboxPage() {
  const { inbox, markInboxRead } = useAppState();
  const [activeTab, setActiveTab] = useState<InboxKind>("updates");

  const filtered = useMemo(
    () => inbox.filter((item) => item.kind === activeTab),
    [activeTab, inbox]
  );

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[860px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-app-muted">Inbox</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Inbox</h1>
        </section>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
          {tabs.map((tab) => (
            <button
              className={`pill ${activeTab === tab.value ? "pill-active" : "text-app-muted hover:border-white/15 hover:text-white"}`}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <ActivityItem item={item} key={item.id} onRead={() => markInboxRead(item.id)} />
            ))
          ) : (
            <div className="surface-card p-5">
              <p className="text-sm text-app-muted">Nothing here.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
