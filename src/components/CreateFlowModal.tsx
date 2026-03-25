"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { FilterChip } from "@/src/components/Chips";
import { Modal } from "@/src/components/Modal";
import { getUserById } from "@/src/data/demo";
import { useDemoState } from "@/src/lib/demo-state";
import { createPosterDataUri } from "@/src/lib/demo-media";
import {
  buildPostingAssistFallback,
  type PostingAssistResult,
  type PostingIntent
} from "@/src/lib/posting-assistant";
import { cn } from "@/src/lib/utils";

type CreateType = PostingIntent;
type CreateStage = "chooser" | CreateType;

const createOptions: Array<{
  type: CreateType;
  title: string;
}> = [
  {
    type: "event",
    title: "Event"
  },
  {
    type: "post",
    title: "Post"
  },
  {
    type: "crowd commission",
    title: "Comission"
  }
];

type FlowTheme = {
  panelClassName: string;
  chooserCardClassName: string;
  glowClassName: string;
  accentPanelClassName: string;
  activeSwitchClassName: string;
  stepActiveClassName: string;
  stepCompleteClassName: string;
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  toggleOnClassName: string;
  inputFocusClassName: string;
};

const flowThemes: Record<CreateType, FlowTheme> = {
  event: {
    panelClassName:
      "border border-[#4B47EB]/18 shadow-[0_28px_70px_rgba(31,28,184,0.18)]",
    chooserCardClassName:
      "border-[#4B47EB]/20 bg-[linear-gradient(145deg,rgba(31,28,184,0.42)_0%,rgba(90,119,255,0.18)_34%,rgba(7,11,20,0.96)_100%)] shadow-[0_24px_50px_rgba(31,28,184,0.22)] hover:border-[#7773FF]/35",
    glowClassName: "bg-[#1F1CB8]/42",
    accentPanelClassName:
      "border-[#4B47EB]/18 bg-[linear-gradient(160deg,rgba(31,28,184,0.18)_0%,rgba(7,11,20,0.98)_65%)]",
    activeSwitchClassName: "border-[#605CFF]/30 bg-[#1F1CB8]/16 text-white",
    stepActiveClassName:
      "border-transparent bg-[linear-gradient(135deg,#1F1CB8_0%,#5A55FF_100%)] text-white shadow-[0_14px_26px_rgba(31,28,184,0.26)]",
    stepCompleteClassName: "border-[#605CFF]/20 bg-[#1F1CB8]/12 text-[#E0DEFF]",
    primaryButtonClassName:
      "bg-[linear-gradient(135deg,#1F1CB8_0%,#5A55FF_100%)] text-white shadow-[0_14px_26px_rgba(31,28,184,0.24)] hover:brightness-110",
    secondaryButtonClassName: "border-[#605CFF]/25 text-[#E0DEFF] hover:bg-[#1F1CB8]/10",
    toggleOnClassName: "border-[#605CFF]/32 bg-[#1F1CB8]/14 text-white",
    inputFocusClassName: "focus:border-[#605CFF]/55"
  },
  post: {
    panelClassName:
      "border border-[#B970FF]/14 shadow-[0_28px_70px_rgba(186,112,255,0.12)]",
    chooserCardClassName:
      "border-[#B970FF]/18 bg-[linear-gradient(145deg,rgba(255,103,150,0.26)_0%,rgba(150,109,255,0.18)_34%,rgba(7,11,20,0.96)_100%)] shadow-[0_24px_50px_rgba(185,112,255,0.16)] hover:border-[#D192FF]/32",
    glowClassName: "bg-[#FF6B96]/36",
    accentPanelClassName:
      "border-[#B970FF]/18 bg-[linear-gradient(160deg,rgba(255,103,150,0.12)_0%,rgba(11,8,20,0.98)_65%)]",
    activeSwitchClassName: "border-[#C981FF]/28 bg-[#FF6B96]/14 text-white",
    stepActiveClassName:
      "border-transparent bg-[linear-gradient(135deg,#FF6B96_0%,#9A70FF_100%)] text-white shadow-[0_14px_26px_rgba(185,112,255,0.22)]",
    stepCompleteClassName: "border-[#C981FF]/20 bg-[#FF6B96]/10 text-[#F3D2FF]",
    primaryButtonClassName:
      "bg-[linear-gradient(135deg,#FF6B96_0%,#9A70FF_100%)] text-white shadow-[0_14px_26px_rgba(185,112,255,0.2)] hover:brightness-110",
    secondaryButtonClassName: "border-[#C981FF]/24 text-[#F1D7FF] hover:bg-[#FF6B96]/10",
    toggleOnClassName: "border-[#C981FF]/30 bg-[#FF6B96]/12 text-white",
    inputFocusClassName: "focus:border-[#C981FF]/55"
  },
  "crowd commission": {
    panelClassName:
      "border border-[#7ACBFF]/16 shadow-[0_28px_70px_rgba(84,179,255,0.12)]",
    chooserCardClassName:
      "border-[#7ACBFF]/18 bg-[linear-gradient(145deg,rgba(84,179,255,0.2)_0%,rgba(31,28,184,0.22)_34%,rgba(7,11,20,0.96)_100%)] shadow-[0_24px_50px_rgba(84,179,255,0.14)] hover:border-[#97D8FF]/30",
    glowClassName: "bg-[#53B3FF]/34",
    accentPanelClassName:
      "border-[#7ACBFF]/18 bg-[linear-gradient(160deg,rgba(84,179,255,0.12)_0%,rgba(7,11,20,0.98)_68%)]",
    activeSwitchClassName: "border-[#7ACBFF]/28 bg-[#53B3FF]/12 text-white",
    stepActiveClassName:
      "border-transparent bg-[linear-gradient(135deg,#53B3FF_0%,#1F1CB8_100%)] text-white shadow-[0_14px_26px_rgba(84,179,255,0.2)]",
    stepCompleteClassName: "border-[#7ACBFF]/20 bg-[#53B3FF]/10 text-[#D0F1FF]",
    primaryButtonClassName:
      "bg-[linear-gradient(135deg,#53B3FF_0%,#1F1CB8_100%)] text-white shadow-[0_14px_26px_rgba(84,179,255,0.18)] hover:brightness-110",
    secondaryButtonClassName: "border-[#7ACBFF]/24 text-[#D4F2FF] hover:bg-[#53B3FF]/10",
    toggleOnClassName: "border-[#7ACBFF]/28 bg-[#53B3FF]/12 text-white",
    inputFocusClassName: "focus:border-[#7ACBFF]/55"
  }
};

function StepPill({
  active,
  complete,
  index,
  label,
  activeClassName,
  completeClassName
}: {
  active: boolean;
  complete: boolean;
  index: number;
  label: string;
  activeClassName?: string;
  completeClassName?: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-3">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold",
          active
            ? activeClassName ?? "border-transparent bg-app-purple text-white"
            : complete
              ? completeClassName ?? "border-app-purple/30 bg-app-purple/10 text-[#E0DEFF]"
              : "border-white/10 bg-white/[0.03] text-app-muted"
        )}
      >
        {index}
      </div>
      <div className="min-w-0">
        <p className={`text-base font-semibold ${active ? "text-white" : "text-app-muted"}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

function getTitle(stage: CreateStage) {
  if (stage === "chooser") {
    return "Create from the feed";
  }

  if (stage === "event") {
    return "Create event";
  }

  if (stage === "post") {
    return "Create post";
  }

  return "Create comission";
}

function getDescription(stage: CreateStage) {
  if (stage === "chooser") {
    return "Choose the format that best matches what you want to publish.";
  }

  if (stage === "event") {
    return "Add the details for your event and let Saga prep it for the network.";
  }

  if (stage === "post") {
    return "Post this like a social update: visual first, caption clear, communities tagged.";
  }

  return "Shape this like a campaign page with a clear goal, deadline, and ask.";
}

export function CreateFlowModal({
  open,
  onClose,
  initialDraft = "",
  initialAssist,
  onComplete,
  mode = "all",
  hostUserId
}: {
  open: boolean;
  onClose: () => void;
  initialDraft?: string;
  initialAssist?: PostingAssistResult | null;
  onComplete?: () => void;
  mode?: "all" | "host";
  hostUserId?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeUserId, createCommission, createEvent, createPost } = useDemoState();
  const activeUser = getUserById(activeUserId);
  const [stage, setStage] = useState<CreateStage>("chooser");
  const [eventStep, setEventStep] = useState<1 | 2>(1);
  const [sourceCrew, setSourceCrew] = useState(true);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventCommunities, setEventCommunities] = useState("");
  const [eventFormat, setEventFormat] = useState("Ticketed social");
  const [postCaption, setPostCaption] = useState("");
  const [postTags, setPostTags] = useState("");
  const [postAudience, setPostAudience] = useState("Followers + tagged communities");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [campaignDeadline, setCampaignDeadline] = useState("");
  const [campaignStory, setCampaignStory] = useState("");
  const [campaignPerks, setCampaignPerks] = useState("");

  const assist = useMemo(() => {
    if (initialAssist) {
      return initialAssist;
    }

    if (initialDraft.trim()) {
      return buildPostingAssistFallback(initialDraft);
    }

    return null;
  }, [initialAssist, initialDraft]);
  const availableOptions = useMemo(
    () =>
      mode === "host"
        ? createOptions.filter((option) => option.type === "event")
        : createOptions,
    [mode]
  );

  useEffect(() => {
    if (!open) {
      setStage(mode === "host" ? "event" : "chooser");
      setEventStep(1);
      setSourceCrew(true);
      setEventName("");
      setEventDate("");
      setEventLocation("");
      setEventDescription("");
      setEventCommunities("");
      setEventFormat("Ticketed social");
      setPostCaption("");
      setPostTags("");
      setPostAudience("Followers + tagged communities");
      setCampaignTitle("");
      setCampaignGoal("");
      setCampaignDeadline("");
      setCampaignStory("");
      setCampaignPerks("");
      return;
    }

    const nextStage = assist ? assist.intent : mode === "host" ? "event" : "chooser";
    setStage(nextStage);
    setEventStep(1);
    setSourceCrew(assist?.prefill.event.sourceCrew ?? true);
    setEventName(assist?.prefill.event.name ?? "");
    setEventDate(assist?.prefill.event.dateTime ?? "");
    setEventLocation(assist?.prefill.event.location ?? "");
    setEventDescription(assist?.prefill.event.description ?? initialDraft);
    setEventCommunities(assist?.prefill.event.communities ?? "");
    setEventFormat(assist?.prefill.event.eventFormat ?? "Ticketed social");
    setPostCaption(assist?.prefill.post.caption ?? initialDraft);
    setPostTags(assist?.prefill.post.communities ?? "");
    setPostAudience(assist?.prefill.post.audience ?? "Followers + tagged communities");
    setCampaignTitle(assist?.prefill.crowdCommission.title ?? "");
    setCampaignGoal(assist?.prefill.crowdCommission.fundingGoal ?? "");
    setCampaignDeadline(assist?.prefill.crowdCommission.deadline ?? "");
    setCampaignStory(assist?.prefill.crowdCommission.story ?? initialDraft);
    setCampaignPerks(assist?.prefill.crowdCommission.perks ?? "");
  }, [assist, initialDraft, mode, open]);

  const title = getTitle(stage);
  const description = getDescription(stage);
  const activeTheme = stage === "chooser" ? null : flowThemes[stage];
  const modalPanelClassName = cn(
    stage === "chooser" && mode === "all" ? "max-w-[1120px]" : "max-w-3xl",
    activeTheme?.panelClassName
  );
  const inputClassName = cn(
    "w-full rounded-[20px] border border-white/8 bg-[#0d1119] px-5 py-4 text-white outline-none transition",
    activeTheme?.inputFocusClassName ?? "focus:border-app-purple/45"
  );
  const textAreaClassName = cn(
    "w-full rounded-[20px] border border-white/8 bg-[#0d1119] px-5 py-4 text-white outline-none transition",
    activeTheme?.inputFocusClassName ?? "focus:border-app-purple/45"
  );
  const primaryButtonClassName = cn(
    "rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
    activeTheme?.primaryButtonClassName ?? "bg-app-purple text-white hover:bg-app-purple-hover"
  );
  const secondaryButtonClassName = cn(
    "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
    activeTheme?.secondaryButtonClassName ?? "border-white/10 text-white hover:border-white/20"
  );

  const finishFlow = (targetHref?: string) => {
    onComplete?.();
    onClose();
    if (targetHref) {
      router.push(targetHref);
      return;
    }

    if (pathname !== "/explore") {
      router.push("/explore");
    }
  };

  const handleCreateEvent = () => {
    if (!eventName.trim() || !eventDate.trim()) {
      return;
    }

    const eventId = createEvent(
      {
        name: eventName,
        dateTime: eventDate,
        location: eventLocation,
        description: eventDescription,
        communities: eventCommunities,
        eventFormat,
        sourceCrew
      },
      hostUserId
    );

    finishFlow(mode === "host" ? `/host/events/${eventId}` : `/events/${eventId}`);
  };

  const handlePublishPost = () => {
    if (!postCaption.trim()) {
      return;
    }

    createPost({
      caption: postCaption,
      communities: postTags,
      audience: postAudience
    });

    finishFlow(pathname === "/explore" ? undefined : "/explore");
  };

  const handleLaunchCommission = () => {
    if (!campaignTitle.trim() || !campaignStory.trim()) {
      return;
    }

    const goalValue = Number.parseInt(campaignGoal.replace(/[^0-9]/g, ""), 10);
    const perkList = campaignPerks
      .split(/[\n,]+/)
      .map((perk) => perk.trim())
      .filter(Boolean);
    const commissionId = createCommission({
      title: campaignTitle.trim(),
      type: "event",
      city: activeUser?.city ?? "Pasadena, CA",
      goalAmount: Number.isNaN(goalValue) ? 1800 : goalValue,
      timingLabel: campaignDeadline.trim() || "Funding closes soon",
      description: campaignStory.trim(),
      fandomTags: [campaignTitle.trim().split(/\s+/).slice(0, 2).join(" ")],
      tiers: [
        {
          title: perkList[0] ?? "Backer Access",
          amount: Math.max(10, Math.round((Number.isNaN(goalValue) ? 1800 : goalValue) * 0.01)),
          description: "Early support tier for the first wave of backers.",
          perks: perkList.length > 0 ? perkList.slice(0, 2) : ["Supporter badge", "Progress updates"]
        },
        {
          title: perkList[1] ?? "Production Circle",
          amount: Math.max(35, Math.round((Number.isNaN(goalValue) ? 1800 : goalValue) * 0.03)),
          description: "Higher-commitment tier with stronger access once funding clears.",
          perks: perkList.length > 1 ? perkList.slice(1, 3) : ["Priority updates", "Name on thank-you wall"]
        }
      ],
      openRoles: [],
      imageUrl: createPosterDataUri({
        title: campaignTitle.trim(),
        subtitle: campaignStory.trim().slice(0, 56) || "Community-backed commission",
        eyebrow: "crowd commission",
        accent: "#53B3FF",
        accent2: "#1F1CB8"
      })
    });

    finishFlow(`/commissions/${commissionId}`);
  };

  return (
    <Modal
      description={description}
      onClose={onClose}
      open={open}
      panelClassName={modalPanelClassName}
      title={title}
    >
      {assist && stage !== "chooser" ? (
        <div
          className={cn(
            "mb-6 rounded-[24px] border p-4",
            activeTheme?.accentPanelClassName ?? "border-app-purple/25 bg-app-purple/10"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Saga read this as {availableOptions.find((option) => option.type === stage)?.title ?? assist.intent}
              </p>
              <p className="mt-1 text-sm text-app-muted">{assist.rationale}</p>
            </div>
            <button
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                activeTheme?.secondaryButtonClassName ?? "border-white/10 text-white hover:border-white/20"
              )}
              onClick={() => setStage(mode === "host" ? "event" : "chooser")}
              type="button"
            >
              {mode === "host" ? "Reset form" : "Change type"}
            </button>
          </div>
        </div>
      ) : null}

      {stage !== "chooser" && availableOptions.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {availableOptions.map((option) => (
            <button
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                stage === option.type
                  ? flowThemes[option.type].activeSwitchClassName
                  : "border-white/10 text-app-muted hover:border-white/20 hover:text-white"
              )}
              key={option.type}
              onClick={() => setStage(option.type)}
              type="button"
            >
              {option.title}
            </button>
          ))}
        </div>
      ) : null}

      {stage === "chooser" ? (
        <div className="space-y-4">
          {initialDraft.trim() ? (
            <div className="rounded-[24px] border border-white/8 bg-[#0d1119] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                Draft preview
              </p>
              <p className="mt-3 text-base text-white">{initialDraft}</p>
            </div>
          ) : null}
          <div className="grid items-stretch gap-4 sm:grid-cols-3">
            {availableOptions.map((option) => (
              <button
                className={cn(
                  "group relative min-h-[180px] overflow-hidden rounded-[28px] border p-5 text-left transition duration-200 hover:-translate-y-1 sm:min-h-[220px] sm:p-6 lg:min-h-[280px]",
                  flowThemes[option.type].chooserCardClassName
                )}
                key={option.type}
                onClick={() => setStage(option.type)}
                type="button"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition duration-200 group-hover:scale-110 lg:h-36 lg:w-36",
                    flowThemes[option.type].glowClassName
                  )}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="relative flex h-full min-w-0 items-end">
                  <p className="max-w-full text-[clamp(2rem,2.3vw,3rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-white [overflow-wrap:anywhere]">
                    {option.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {stage === "event" ? (
        <div
          className={cn(
            "space-y-6 rounded-[30px] border p-4 sm:p-5",
            activeTheme?.accentPanelClassName
          )}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <StepPill
              active={eventStep === 1}
              activeClassName={activeTheme?.stepActiveClassName}
              complete={eventStep > 1}
              completeClassName={activeTheme?.stepCompleteClassName}
              index={1}
              label="Event details"
            />
            <StepPill
              active={eventStep === 2}
              activeClassName={activeTheme?.stepActiveClassName}
              complete={false}
              completeClassName={activeTheme?.stepCompleteClassName}
              index={2}
              label="Tag communities"
            />
          </div>

          {eventStep === 1 ? (
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Event name</span>
                <input
                  className={inputClassName}
                  onChange={(event) => setEventName(event.target.value)}
                  placeholder="e.g. Cosplay live drawing night"
                  value={eventName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Event date & time</span>
                <input
                  className={inputClassName}
                  onChange={(event) => setEventDate(event.target.value)}
                  placeholder="Set a date..."
                  value={eventDate}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Location (optional)</span>
                <input
                  className={inputClassName}
                  onChange={(event) => setEventLocation(event.target.value)}
                  placeholder="Search for an address"
                  value={eventLocation}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">
                  Description (optional) — {eventDescription.length}/500
                </span>
                <textarea
                  className={cn("min-h-[160px]", textAreaClassName)}
                  maxLength={500}
                  onChange={(event) => setEventDescription(event.target.value)}
                  placeholder="What's this event about?"
                  value={eventDescription}
                />
              </label>
              <button
                className={primaryButtonClassName}
                disabled={!eventName.trim() || !eventDate.trim()}
                onClick={() => setEventStep(2)}
                type="button"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Tag communities</span>
                <input
                  className={inputClassName}
                  onChange={(event) => setEventCommunities(event.target.value)}
                  placeholder="Love and Deepspace, Pasadena cosplayers"
                  value={eventCommunities}
                />
              </label>
              <div>
                <p className="mb-2 text-sm font-semibold text-white">Event format</p>
                <div className="flex flex-wrap gap-2">
                  {["Ticketed social", "Free meetup", "Screening", "Creator collab"].map((option) => (
                    <FilterChip
                      active={eventFormat === option}
                      key={option}
                      label={option}
                      onClick={() => setEventFormat(option)}
                    />
                  ))}
                </div>
              </div>
              <button
                className={cn(`flex w-full items-center justify-between rounded-[24px] border px-5 py-5 text-left transition ${
                  sourceCrew
                    ? activeTheme?.toggleOnClassName
                    : "border-white/10 bg-[#0d1119] text-app-muted"
                }`)}
                onClick={() => setSourceCrew((current) => !current)}
                type="button"
              >
                <div>
                  <p className="font-semibold">Source crew</p>
                  <p className="mt-1 text-sm text-app-muted">
                    Let Saga pull likely photographers, DJs, and ops leads into the draft.
                  </p>
                </div>
                <span className="text-sm font-semibold">{sourceCrew ? "On" : "Off"}</span>
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className={secondaryButtonClassName}
                  onClick={() => setEventStep(1)}
                  type="button"
                >
                  Back
                </button>
                <button
                  className={primaryButtonClassName}
                  onClick={handleCreateEvent}
                  type="button"
                >
                  Create event
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {stage === "post" ? (
        <div
          className={cn(
            "grid gap-4 rounded-[30px] border p-4 sm:p-5",
            activeTheme?.accentPanelClassName
          )}
        >
          <div className="rounded-[24px] border border-dashed border-white/10 bg-[#0d1119] p-5">
            <p className="text-sm font-semibold text-white">Media</p>
            <p className="mt-2 text-sm text-app-muted">
              Drag in an image, clip, or sketch board. This demo keeps media mocked, but the flow is structured like a simple visual post composer.
            </p>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Caption</span>
            <textarea
              className={cn("min-h-[180px]", textAreaClassName)}
              onChange={(event) => setPostCaption(event.target.value)}
              placeholder="Write your update..."
              value={postCaption}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Tag communities</span>
              <input
                className={inputClassName}
                onChange={(event) => setPostTags(event.target.value)}
                placeholder="WIPs, cosplay, Love and Deepspace"
                value={postTags}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Audience</span>
              <input
                className={inputClassName}
                onChange={(event) => setPostAudience(event.target.value)}
                value={postAudience}
              />
            </label>
          </div>
          <button
            className={primaryButtonClassName}
            disabled={!postCaption.trim()}
            onClick={handlePublishPost}
            type="button"
          >
            Publish post
          </button>
        </div>
      ) : null}

      {stage === "crowd commission" ? (
        <div
          className={cn(
            "grid gap-4 rounded-[30px] border p-4 sm:p-5",
            activeTheme?.accentPanelClassName
          )}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Campaign title</span>
            <input
              className={inputClassName}
              onChange={(event) => setCampaignTitle(event.target.value)}
              placeholder="Fund the next Cosplay Live Drawing build"
              value={campaignTitle}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Funding goal</span>
              <input
                className={inputClassName}
                onChange={(event) => setCampaignGoal(event.target.value)}
                placeholder="$1,800"
                value={campaignGoal}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Deadline</span>
              <input
                className={inputClassName}
                onChange={(event) => setCampaignDeadline(event.target.value)}
                placeholder="June 4"
                value={campaignDeadline}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Campaign story</span>
            <textarea
              className={cn("min-h-[160px]", textAreaClassName)}
              onChange={(event) => setCampaignStory(event.target.value)}
              placeholder="What are you funding, why now, and what happens when it succeeds?"
              value={campaignStory}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">Backer perks</span>
            <textarea
              className={cn("min-h-[120px]", textAreaClassName)}
              onChange={(event) => setCampaignPerks(event.target.value)}
              placeholder="Early access, name on the wall, photo pack, aftermovie credit..."
              value={campaignPerks}
            />
          </label>
          <button
            className={primaryButtonClassName}
            disabled={!campaignTitle.trim() || !campaignStory.trim()}
            onClick={handleLaunchCommission}
            type="button"
          >
            Launch campaign
          </button>
        </div>
      ) : null}
    </Modal>
  );
}
