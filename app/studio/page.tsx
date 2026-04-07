"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { LaunchChoiceCard } from "@/src/components/LaunchChoiceCard";
import { LaunchSummaryCard } from "@/src/components/LaunchSummaryCard";
import { Modal } from "@/src/components/Modal";
import { Nav } from "@/src/components/Nav";
import { PageHeroHeader } from "@/src/components/PageHeroHeader";
import { buildUploadSeed } from "@/src/data/crew-plan";
import { type LaunchWizardDraft } from "@/src/data/launch-builder";
import { useAppState } from "@/src/lib/app-state";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";
import { formatDateLabel } from "@/src/lib/utils";

export default function StudioPage() {
  const router = useRouter();
  const {
    homeCity,
    launchDrafts,
    launches,
    mode,
    setMode,
    startLaunchDraft,
    updateLaunchDraft
  } = useAppState();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [uploadFiles, setUploadFiles] = useState<Array<{ id: string; name: string; src?: string; kind: "image" | "document" }>>([]);
  const [processingUploadDraftId, setProcessingUploadDraftId] = useState<string | null>(null);
  const [processingMessageIndex, setProcessingMessageIndex] = useState(0);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "host") {
      setMode("host");
    }
  }, [mode, setMode]);

  useEffect(() => {
    if (!processingUploadDraftId) {
      return;
    }

    const interval = window.setInterval(() => {
      setProcessingMessageIndex((current) => (current + 1) % 4);
    }, 620);
    const timeout = window.setTimeout(() => {
      router.push(`/studio/crew-plan/${processingUploadDraftId}`);
    }, 2600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [processingUploadDraftId, router]);

  const hostLaunches = launches
    .filter((launch) => launch.hostId === HOST_DEMO_USER_ID)
    .sort((left, right) => Number(left.status === "completed") - Number(right.status === "completed"));

  const continueDrafts = launchDrafts
    .filter((draft) => draft.hostId === HOST_DEMO_USER_ID && draft.draftStatus !== "published")
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));

  const latestDraftHref = useMemo(() => {
    const latest = continueDrafts[0];
    return latest ? resolveDraftHref(latest) : "/studio";
  }, [continueDrafts]);

  function beginDraft(mode: "soft" | "happening") {
    const draftId = startLaunchDraft(mode);
    router.push(`/studio/new?draft=${draftId}`);
  }

  function handleUploadSelection(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const fileList = Array.from(files);
    const nextFiles = fileList.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      kind: (file.type.startsWith("image/") ? "image" : "document") as "image" | "document"
    }));

    setUploadFiles((current) => [...current, ...nextFiles]);

    fileList.forEach((file, index) => {
      if (!file.type.startsWith("image/")) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          return;
        }

        const result = reader.result;

        setUploadFiles((current) =>
          current.map((item) =>
            item.id === nextFiles[index].id
              ? { ...item, src: result }
              : item
          )
        );
      };
      reader.readAsDataURL(file);
    });
  }

  function submitUploadedBrief() {
    const draftId = startLaunchDraft("happening");
    const seed = buildUploadSeed({
      text: uploadText,
      city: homeCity,
      launchMode: "happening"
    });

    updateLaunchDraft(draftId, {
      ...seed,
      format: seed.format as LaunchWizardDraft["format"],
      sizeBucket: seed.sizeBucket as LaunchWizardDraft["sizeBucket"],
      briefSource: "upload",
      briefAttachments: uploadFiles.map((file) => ({
        id: file.id,
        name: file.name,
        kind: file.kind
      })),
      moodBoardImages: uploadFiles
        .filter((file) => file.kind === "image" && file.src)
        .map((file) => ({
          id: file.id,
          name: file.name,
          src: file.src as string
        })),
      posterImage: uploadFiles.find((file) => file.kind === "image" && file.src)?.src,
      posterImageSourceTitle: uploadFiles.find((file) => file.kind === "image" && file.src)?.name,
      draftStatus: "review"
    });

    setUploadOpen(false);
    setUploadText("");
    setUploadFiles([]);
    setProcessingMessageIndex(0);
    setProcessingUploadDraftId(draftId);
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <section className="space-y-4">
          <PageHeroHeader
            eyebrow={homeCity}
            label="Launch"
            title="Build your crew"
            subtitle="Start with a brief. We’ll return a production-ready plan."
          />

          <div className="space-y-4">
            <LaunchChoiceCard
              accentClassName="bg-[radial-gradient(circle_at_top,rgba(31,28,184,0.3),transparent_58%),linear-gradient(180deg,rgba(18,23,40,0.96),rgba(11,14,24,0.98))]"
              onClick={() => beginDraft("soft")}
              subtitle="See if people want this before you commit."
              title="Test demand first"
            />
            <LaunchChoiceCard
              accentClassName="bg-[radial-gradient(circle_at_top,rgba(102,84,255,0.24),transparent_56%),linear-gradient(180deg,rgba(18,23,40,0.96),rgba(11,14,24,0.98))]"
              onClick={() => beginDraft("happening")}
              subtitle="You've got a date. Let's go live."
              title="Publish now"
            />
            <LaunchChoiceCard
              accentClassName="bg-[radial-gradient(circle_at_top,rgba(77,214,177,0.22),transparent_56%),linear-gradient(180deg,rgba(17,23,36,0.96),rgba(10,13,22,0.98))]"
              badge="Upload"
              onClick={() => setUploadOpen(true)}
              subtitle="Already have a concept doc, mood board, or outline? Drop it here and we'll build your plan."
              title="Upload a brief"
            />
          </div>
        </section>

        {continueDrafts.length > 0 ? (
          <section className="mt-10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Continue draft</h2>
              <Link
                className="text-sm font-semibold text-app-muted transition hover:text-white"
                href={latestDraftHref}
              >
                Open latest
              </Link>
            </div>
            <div className="space-y-3">
              {continueDrafts.slice(0, 3).map((draft) => (
                <button
                  className="surface-card w-full p-4 text-left transition hover:border-white/12"
                  key={draft.id}
                  onClick={() => router.push(resolveDraftHref(draft))}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white">{draft.generatedDraft.title}</p>
                      <p className="mt-1 text-sm text-app-muted">{draft.generatedDraft.metadataLine}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-app-muted">
                      {draft.draftStatus === "saved" ? "Saved" : "In progress"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/76">{draft.generatedDraft.summary}</p>
                  <p className="mt-3 text-xs text-app-muted">
                    Updated {formatDateLabel(draft.updatedAt)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {hostLaunches.length > 0 ? (
          <section className="mt-10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">My launches</h2>
              <Link
                className="text-sm font-semibold text-app-muted transition hover:text-white"
                href={hostLaunches[0]?.id ? `/studio/${hostLaunches[0].id}` : "/studio"}
              >
                Open latest
              </Link>
            </div>
            <div className="grid gap-4">
              {hostLaunches.map((launch) => (
                <LaunchSummaryCard
                  actionLabel="Manage"
                  key={launch.id}
                  launch={launch}
                  onAction={() => router.push(`/studio/${launch.id}`)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Modal
        description="Drop a doc, mood board, or a few notes and we'll turn it into a crew plan."
        onClose={() => {
          setUploadOpen(false);
          setUploadText("");
          setUploadFiles([]);
        }}
        open={uploadOpen}
        panelClassName="max-w-xl"
        title="Upload a brief"
      >
        <div className="space-y-5">
          <button
            className="w-full rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] px-5 py-6 text-left transition hover:border-white/18 hover:bg-white/[0.04]"
            onClick={() => uploadInputRef.current?.click()}
            type="button"
          >
            <p className="text-base font-semibold text-white">Drop files here</p>
            <p className="mt-1 text-sm text-app-muted">PDF, DOC, mood boards, or reference images.</p>
          </button>
          <input
            accept=".pdf,.doc,.docx,image/png,image/jpeg,image/jpg"
            className="hidden"
            multiple
            onChange={(event) => {
              handleUploadSelection(event.target.files);
              event.currentTarget.value = "";
            }}
            ref={uploadInputRef}
            type="file"
          />

          {uploadFiles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {uploadFiles.map((file) => (
                <span
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/82"
                  key={file.id}
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Or paste your brief</p>
            <textarea
              className="min-h-[180px] w-full rounded-[28px] border border-white/8 bg-[#0d1119] px-5 py-4 text-base leading-7 text-white outline-none placeholder:text-app-muted"
              onChange={(event) => setUploadText(event.target.value)}
              placeholder="Paste your concept, target city, deliverables, references, and anything else the crew should know..."
              value={uploadText}
            />
          </div>

          <button
            className="min-h-[48px] w-full rounded-[18px] bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!uploadText.trim() && uploadFiles.length === 0}
            onClick={submitUploadedBrief}
            type="button"
          >
            Build my crew plan
          </button>
        </div>
      </Modal>

      {processingUploadDraftId ? (
        <div className="fixed inset-0 z-[70] bg-black/82 px-4 py-6 backdrop-blur-md">
          <div className="mx-auto flex min-h-full max-w-[540px]">
            <div className="w-full">
              <UploadProcessingScreen messageIndex={processingMessageIndex} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function resolveDraftHref(draft: { id: string; deliverableSelections?: string[] }) {
  if (draft.deliverableSelections?.length) {
    return `/studio/crew-plan/${draft.id}`;
  }

  return `/studio/new?draft=${draft.id}`;
}

function UploadProcessingScreen({ messageIndex }: { messageIndex: number }) {
  const messages = [
    "Analyzing your brief...",
    "Identifying roles...",
    "Matching portfolios...",
    "Estimating rates..."
  ];

  return (
    <section className="flex min-h-full flex-col items-center justify-center">
      <div className="w-full max-w-[440px] space-y-5">
        <div className="space-y-2 text-center">
          <p className="text-3xl font-semibold text-white">Building your crew plan...</p>
          <p className="text-sm text-app-muted">{messages[messageIndex]}</p>
        </div>
        <div className="surface-card-strong overflow-hidden p-5">
          <div className="relative h-[220px] overflow-hidden rounded-[24px] bg-white/[0.03]">
            <div className="absolute inset-0 animate-[pulse_2.2s_ease-in-out_infinite] bg-[radial-gradient(circle_at_top,rgba(123,132,255,0.18),transparent_42%),linear-gradient(180deg,rgba(19,24,38,0.98),rgba(10,12,22,1))]" />
            <div className="absolute inset-x-5 top-6 h-3 rounded-full bg-white/[0.08]" />
            <div className="absolute inset-x-5 top-16 h-20 rounded-[20px] bg-white/[0.05]" />
            <div className="absolute inset-x-5 bottom-10 h-3 rounded-full bg-white/[0.08]" />
            <div className="absolute inset-x-5 bottom-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-app-purple" />
              <span className="h-2.5 w-2.5 animate-[pulse_1.1s_ease-in-out_120ms_infinite] rounded-full bg-[#7B84FF]" />
              <span className="h-2.5 w-2.5 animate-[pulse_1.1s_ease-in-out_240ms_infinite] rounded-full bg-white/55" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
