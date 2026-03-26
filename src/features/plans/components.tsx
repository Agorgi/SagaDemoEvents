"use client";

import { type CSSProperties } from "react";
import { useState } from "react";

import { getMediaObjectPosition } from "@/src/lib/media-position";
import { cn } from "@/src/lib/utils";

import {
  type CalendarDay,
  type PlanCalendarItem
} from "@/src/features/plans/selectors";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthHeader({
  monthLabel,
  onNext,
  onPrevious
}: {
  monthLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <MonthControlButton ariaLabel="Previous month" direction="left" onClick={onPrevious} />
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">Calendar</p>
        <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.04em] text-white sm:text-[30px]">{monthLabel}</h2>
      </div>
      <MonthControlButton ariaLabel="Next month" direction="right" onClick={onNext} />
    </div>
  );
}

export function CalendarGrid({
  days,
  selectedDateKey,
  selectedDateLabel,
  selectedItems,
  activeIndex,
  overlayAnimationKey,
  overlayOrigin,
  onSelectDay,
  onSelectItem,
  onOpenItem
}: {
  days: CalendarDay[];
  selectedDateKey: string | null;
  selectedDateLabel: string | null;
  selectedItems: PlanCalendarItem[];
  activeIndex: number;
  overlayAnimationKey: string;
  overlayOrigin: { dx: number; dy: number } | null;
  onSelectDay: (day: CalendarDay, anchor: { x: number; y: number }) => void;
  onSelectItem: (index: number) => void;
  onOpenItem: (item: PlanCalendarItem) => void;
}) {
  const [legendOpen, setLegendOpen] = useState(false);

  const featuredItem = selectedItems[Math.min(activeIndex, selectedItems.length - 1)];
  const tone = featuredItem ? getPlanTone(featuredItem.state, featuredItem.tentative) : null;

  return (
    <>
      <section className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(19,24,40,0.98),rgba(9,13,22,1))] px-3.5 pb-3.5 pt-3.5 shadow-[0_28px_90px_rgba(0,0,0,0.42)] ring-1 ring-white/6 sm:rounded-[34px] sm:px-4 sm:pb-4 sm:pt-4">
      <button
        aria-label="Plan color guide"
        className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        onClick={() => setLegendOpen((current) => !current)}
        type="button"
      >
        i
      </button>

      {legendOpen ? (
        <div className="absolute right-4 top-14 z-20 w-[220px] rounded-[24px] bg-[linear-gradient(180deg,rgba(20,25,40,0.96),rgba(11,14,22,0.98))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.38)] ring-1 ring-white/8 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Color guide</p>
          <div className="mt-3 space-y-2.5">
            {PLAN_LEGEND_ITEMS.map((item) => (
              <div className="flex items-start gap-3" key={item.label}>
                <span className={cn("mt-0.5 h-3.5 w-3.5 rounded-full plans-shimmer", item.swatchClass)} />
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-white/54">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-2.5 grid grid-cols-7 gap-1.5 px-0.5 pr-10 sm:mb-3 sm:gap-2 sm:px-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            className="pb-1 text-center text-[10px] uppercase tracking-[0.18em] text-white/34"
            key={label}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((day) => (
            <CalendarDayCell
              day={day}
              key={day.key}
              selected={selectedDateKey === day.key}
              onClick={(anchor) => onSelectDay(day, anchor)}
            />
          ))}
        </div>
      </div>
      </section>

      {featuredItem && tone && overlayOrigin ? (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-4">
          <SelectedDayOverlay
            activeIndex={activeIndex}
            animationKey={overlayAnimationKey}
            item={featuredItem}
            itemCount={selectedItems.length}
            onOpen={() => onOpenItem(featuredItem)}
            onSelectItem={onSelectItem}
            overlayOrigin={overlayOrigin}
            selectedDateLabel={selectedDateLabel}
            tone={tone}
          />
        </div>
      ) : null}
    </>
  );
}

export function NoDatePlansTray({
  items,
  onOpenItem
}: {
  items: PlanCalendarItem[];
  onOpenItem: (item: PlanCalendarItem) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2.5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-white/38">Still taking shape</p>
        <h3 className="mt-1 text-base font-semibold text-white sm:text-xl">Flexible plans</h3>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 subtle-scrollbar">
        {items.map((item) => {
          const tone = getPlanTone(item.state, item.tentative) ?? getPlanTone("saved", false)!;

          return (
            <button
              className="group flex w-[164px] shrink-0 overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,rgba(19,24,40,0.95),rgba(10,13,21,0.98))] text-left ring-1 ring-white/6 transition hover:ring-white/12 sm:w-[220px] sm:rounded-[28px] sm:block"
              key={item.id}
              onClick={() => onOpenItem(item)}
              type="button"
            >
              <div className="relative h-[86px] w-[72px] shrink-0 overflow-hidden sm:h-[132px] sm:w-auto">
                <img
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  src={item.imageUrl}
                  style={{ objectPosition: getMediaObjectPosition(item.imagePosition) }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/20 to-transparent" />
                <div className="absolute left-3 top-3">
                  <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-sm", tone.badgeClass)}>
                    {item.previewChip}
                  </span>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center space-y-1.5 p-3 sm:block sm:space-y-1.5 sm:p-3.5">
                <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">{item.title}</p>
                <p className="line-clamp-2 text-xs text-white/58 sm:line-clamp-1 sm:text-sm">{item.previewCaption}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CalendarDayCell({
  day,
  selected,
  onClick
}: {
  day: CalendarDay;
  selected: boolean;
  onClick: (anchor: { x: number; y: number }) => void;
}) {
  const tone = getPlanTone(day.glowState, day.isTentative) ?? getPlanTone("saved", false)!;

  return (
    <button
      className={cn(
        "relative aspect-square overflow-hidden rounded-[18px] text-left transition duration-300 sm:rounded-[22px]",
        selected ? "scale-[1.02]" : "hover:scale-[1.01]"
      )}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onClick({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }}
      type="button"
    >
      {day.count > 0 && tone ? (
        <>
          <div className={cn("absolute inset-0 plans-shimmer", tone.dayFillClass, selected ? "opacity-100" : "opacity-88")} />
          <div className={cn("absolute inset-[12%] rounded-[18px] blur-xl", tone.dayGlowClass)} />
        </>
      ) : null}
      <div
        className={cn(
          "relative flex h-full flex-col rounded-[18px] px-2 py-1.5 sm:rounded-[22px] sm:px-2.5 sm:py-2",
          day.inMonth ? "bg-white/[0.04]" : "bg-white/[0.02]",
          selected
            ? "ring-1 ring-white/18"
            : day.count > 0
              ? "ring-1 ring-white/8"
              : "ring-1 ring-white/4"
        )}
      >
        <span className={cn("text-[13px] font-semibold sm:text-sm", day.inMonth ? "text-white" : "text-white/24")}>
          {day.date.getDate()}
        </span>
        {day.count > 0 ? (
          <div className="mt-auto flex items-end justify-between">
            <span className={cn("h-1.5 w-1.5 rounded-full", tone.dotClass)} />
            {day.count > 1 ? (
              <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-medium text-white/72 backdrop-blur-sm">
                {day.count}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function SelectedDayOverlay({
  item,
  selectedDateLabel,
  activeIndex,
  itemCount,
  tone,
  onOpen,
  onSelectItem,
  overlayOrigin,
  animationKey
}: {
  item: PlanCalendarItem;
  selectedDateLabel: string | null;
  activeIndex: number;
  itemCount: number;
  tone: PlanTone;
  onOpen: () => void;
  onSelectItem: (index: number) => void;
  overlayOrigin: { dx: number; dy: number };
  animationKey: string;
}) {
  return (
    <div
      key={animationKey}
      className={cn(
        "plans-overlay-enter pointer-events-auto group relative w-[min(82vw,336px)] overflow-hidden rounded-[24px] p-3 text-left shadow-[0_30px_70px_rgba(0,0,0,0.42)] ring-1 backdrop-blur-xl transition hover:scale-[1.01] sm:w-[min(86vw,360px)] sm:rounded-[26px]",
        tone.overlayShellClass
      )}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      style={
        {
          "--plans-origin-dx": `${overlayOrigin.dx}px`,
          "--plans-origin-dy": `${overlayOrigin.dy}px`
        } as CSSProperties
      }
      tabIndex={0}
    >
      {itemCount > 1 ? (
        <>
          <OverlayArrow
            ariaLabel="Previous event"
            direction="left"
            onClick={() => onSelectItem(activeIndex === 0 ? itemCount - 1 : activeIndex - 1)}
          />
          <OverlayArrow
            ariaLabel="Next event"
            direction="right"
            onClick={() => onSelectItem(activeIndex === itemCount - 1 ? 0 : activeIndex + 1)}
          />
        </>
      ) : null}

      <div className="relative h-[176px] overflow-hidden rounded-[20px] sm:h-[190px] sm:rounded-[22px]">
        <img
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          src={item.imageUrl}
          style={{ objectPosition: getMediaObjectPosition(item.imagePosition) }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,16,0.15),rgba(8,10,16,0.34),rgba(8,10,16,0.92))]" />
        <div className="absolute left-3 top-3">
          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm", tone.badgeClass)}>
            {item.previewChip}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">{selectedDateLabel}</p>
          <h4 className="line-clamp-2 text-[17px] font-semibold leading-tight text-white sm:text-lg">{item.title}</h4>
          <p className="line-clamp-1 text-sm text-white/70">{item.previewCaption}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {itemCount > 1 ? (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: itemCount }).map((_, index) => (
              <button
                aria-label={`Show plan ${index + 1}`}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition",
                  index === activeIndex ? "bg-white" : "bg-white/30"
                )}
                key={index}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectItem(index);
                }}
                type="button"
              />
            ))}
          </div>
        ) : (
          <span className="text-xs text-white/46">Preview</span>
        )}
        <span className="text-xs font-medium text-white/64">Tap again to open</span>
      </div>
    </div>
  );
}

function OverlayArrow({
  ariaLabel,
  direction,
  onClick
}: {
  ariaLabel: string;
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/24 text-white/82 backdrop-blur-md transition hover:bg-black/36 hover:text-white",
        direction === "left" ? "left-3" : "right-3"
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      type="button"
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d={direction === "left" ? "M15 18 9 12l6-6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </button>
  );
}

function MonthControlButton({
  ariaLabel,
  direction,
  onClick
}: {
  ariaLabel: string;
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d={direction === "left" ? "M15 18 9 12l6-6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </button>
  );
}

type PlanTone = {
  dayFillClass: string;
  dayGlowClass: string;
  dotClass: string;
  badgeClass: string;
  overlayShellClass: string;
};

function getPlanTone(
  state?: CalendarDay["glowState"],
  tentative = false
): PlanTone | null {
  if (!state) {
    return null;
  }

  if (state === "hosting") {
    return {
      dayFillClass: tentative
        ? "bg-[linear-gradient(120deg,rgba(93,66,204,0.32),rgba(133,103,255,0.18),rgba(93,66,204,0.28))] bg-[length:200%_100%]"
        : "bg-[linear-gradient(120deg,rgba(83,52,215,0.72),rgba(155,127,255,0.4),rgba(83,52,215,0.62))] bg-[length:200%_100%]",
      dayGlowClass: "bg-[radial-gradient(circle,rgba(135,96,255,0.65)_0%,rgba(135,96,255,0.12)_68%,transparent_88%)]",
      dotClass: "bg-[#d2c2ff]",
      badgeClass: "bg-app-purple/26 text-white",
      overlayShellClass:
        "bg-[linear-gradient(180deg,rgba(39,29,81,0.94),rgba(18,16,36,0.98))] ring-white/14"
    };
  }

  if (state === "going") {
    return {
      dayFillClass: tentative
        ? "bg-[linear-gradient(120deg,rgba(71,112,216,0.3),rgba(106,155,255,0.16),rgba(71,112,216,0.26))] bg-[length:200%_100%]"
        : "bg-[linear-gradient(120deg,rgba(59,108,236,0.7),rgba(122,166,255,0.34),rgba(59,108,236,0.56))] bg-[length:200%_100%]",
      dayGlowClass: "bg-[radial-gradient(circle,rgba(98,151,255,0.6)_0%,rgba(98,151,255,0.14)_68%,transparent_88%)]",
      dotClass: "bg-[#bad1ff]",
      badgeClass: "bg-[#5E8BFF]/24 text-white",
      overlayShellClass:
        "bg-[linear-gradient(180deg,rgba(21,39,86,0.94),rgba(11,19,42,0.98))] ring-white/14"
    };
  }

  if (state === "pledged") {
    return {
      dayFillClass:
        "bg-[linear-gradient(120deg,rgba(54,133,176,0.42),rgba(109,217,255,0.22),rgba(54,133,176,0.3))] bg-[length:200%_100%]",
      dayGlowClass: "bg-[radial-gradient(circle,rgba(116,220,255,0.52)_0%,rgba(116,220,255,0.14)_68%,transparent_88%)]",
      dotClass: "bg-[#a8e7ff]",
      badgeClass: "bg-[#8CD7FF]/18 text-white",
      overlayShellClass:
        "bg-[linear-gradient(180deg,rgba(16,53,72,0.94),rgba(8,24,34,0.98))] ring-white/14"
    };
  }

  return {
    dayFillClass:
      "bg-[linear-gradient(120deg,rgba(110,118,147,0.3),rgba(188,194,215,0.16),rgba(110,118,147,0.24))] bg-[length:200%_100%]",
    dayGlowClass: "bg-[radial-gradient(circle,rgba(255,255,255,0.22)_0%,rgba(174,184,221,0.08)_68%,transparent_88%)]",
    dotClass: "bg-white/78",
    badgeClass: "bg-white/12 text-white",
    overlayShellClass:
      "bg-[linear-gradient(180deg,rgba(34,38,51,0.94),rgba(16,18,27,0.98))] ring-white/12"
  };
}

const PLAN_LEGEND_ITEMS = [
  {
    label: "Hosting",
    description: "Your own nights and launches.",
    swatchClass: "bg-[linear-gradient(120deg,rgba(83,52,215,0.82),rgba(155,127,255,0.48),rgba(83,52,215,0.68))]"
  },
  {
    label: "Going",
    description: "Locked-in plans you’re attending.",
    swatchClass: "bg-[linear-gradient(120deg,rgba(59,108,236,0.82),rgba(122,166,255,0.44),rgba(59,108,236,0.7))]"
  },
  {
    label: "Pledged",
    description: "Soft launches still taking shape.",
    swatchClass: "bg-[linear-gradient(120deg,rgba(54,133,176,0.62),rgba(109,217,255,0.34),rgba(54,133,176,0.52))]"
  },
  {
    label: "Saved",
    description: "Ideas you don’t want to lose.",
    swatchClass: "bg-[linear-gradient(120deg,rgba(110,118,147,0.5),rgba(188,194,215,0.28),rgba(110,118,147,0.4))]"
  }
];
