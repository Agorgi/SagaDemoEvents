"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { StatusChip } from "@/src/components/Chips";
import { type DemoRole, type DemoThread, getUserById } from "@/src/data/demo";

export function ChatPanel({
  role,
  threads,
  onConfirm
}: {
  role: DemoRole;
  threads: DemoThread[];
  onConfirm: (candidateUserId?: string) => void;
}) {
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(
    threads[0]?.id
  );
  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0];
  const [draft, setDraft] = useState(activeThread?.draft ?? "");
  const activeCandidate = getUserById(activeThread?.participants.at(-1));

  useEffect(() => {
    if (!activeThread && !threads[0]) {
      setActiveThreadId(undefined);
      setDraft("");
      return;
    }

    const next = activeThread ?? threads[0];
    setActiveThreadId(next?.id);
    setDraft(next?.draft ?? "");
  }, [activeThread, threads]);

  return (
    <div className="surface-card-strong flex h-[560px] max-h-[72vh] flex-col p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-app-muted">
            Outreach & Responses
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-white">{role.roleName}</h3>
        </div>
        <StatusChip
          label={role.status === "filled" ? "Filled" : role.status === "invited" ? "Invited" : "Open"}
          tone={role.status === "filled" ? "filled" : role.status === "invited" ? "invited" : "open"}
        />
      </div>

      <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
        {threads.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-6 text-sm text-app-muted">
            Invite a candidate to spin up Saga outreach.
          </div>
        ) : (
          threads.map((thread) => {
            const person = getUserById(thread.participants.at(-1));
            return (
              <button
                className={`min-w-[180px] rounded-[20px] border px-4 py-3 text-left transition ${
                  activeThreadId === thread.id
                    ? "border-app-purple/45 bg-app-purple/10"
                    : "border-white/8 bg-white/[0.02] hover:border-white/15"
                }`}
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={person?.name ?? "Candidate"} size="sm" src={person?.avatarUrl} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {person?.handle ?? "Pending"}
                    </p>
                    <p className="truncate text-xs text-app-muted">
                      {thread.messages.at(-1)?.text ?? "No response yet"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="grid flex-1 grid-rows-[auto_1fr_auto] gap-4">
        <div className="rounded-[22px] border border-white/8 bg-white/[0.02] p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-app-muted">
            Draft Outreach
          </p>
          <textarea
            className="min-h-[96px] w-full resize-none rounded-[18px] border border-white/8 bg-[#0d1119] p-4 text-sm text-white outline-none transition focus:border-app-purple/45"
            onChange={(event) => setDraft(event.target.value)}
            value={draft}
          />
        </div>

        <div className="subtle-scrollbar overflow-y-auto rounded-[22px] border border-white/8 bg-white/[0.02] p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.14em] text-app-muted">
            Thread
          </p>
          <div className="space-y-3">
            {activeThread?.messages.map((message) => {
              const sender = getUserById(message.senderId);
              const ownMessage = message.senderId !== activeCandidate?.id;
              return (
                <div
                  className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm ${
                    ownMessage
                      ? "ml-auto bg-app-purple text-white"
                      : "bg-[#0d1119] text-app-muted"
                  }`}
                  key={message.id}
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                    {sender?.handle ?? "Saga"}
                  </p>
                  <p>{message.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-[#0d1119] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {activeCandidate?.handle ?? "Select a candidate"}
              </p>
              <p className="text-xs text-app-muted">
                Confirming this role updates staffing everywhere.
              </p>
            </div>
            <button
              className="rounded-2xl bg-app-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!activeCandidate || role.status === "filled"}
              onClick={() => onConfirm(activeCandidate?.id)}
              type="button"
            >
              Confirm role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
