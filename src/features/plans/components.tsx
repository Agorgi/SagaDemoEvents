"use client";

import { getMediaObjectPosition } from "@/src/lib/media-position";
import { cn } from "@/src/lib/utils";

import {
  type CalendarDay,
  type PlanCalendarItem,
  type PlanFilter,
  PLAN_FILTER_OPTIONS
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
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Calendar</p>
        <h2 className="mt-1 text-[30px] font-semibold text-white">{monthLabel}</h2>
      </div>
      <MonthControlButton ariaLabel="Next month" direction="right" onClick={onNext} />
    </div>
  );
}

export function CalendarFilterChips({
  value,
  onChange
}: {
  value: PlanFilter;
  onChange: (next: PlanFilter) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 subtle-scrollbar">
      {PLAN_FILTER_OPTIONS.map((option) => (
        <button
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
            value === option.value
              ? "bg-white text-[#0A0E17] shadow-[0_12px_30px_rgba(255,255,255,0.12)]"
              : "bg-white/[0.05] text-white/68 hover:bg-white/[0.08] hover:text-white"
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function CalendarGrid({
  days,
  selectedDateKey,
  onSelectDay
}: {
  days: CalendarDay[];
  selectedDateKey: string | null;
  onSelectDay: (day: CalendarDay) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,rgba(19,24,40,0.98),rgba(9,13,22,1))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.42)] ring-1 ring-white/6">
      <div className="mb-3 grid grid-cols-7 gap-1 px-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            className="pb-1 text-center text-[10px] uppercase tracking-[0.18em] text-white/38"
            key={label}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <CalendarDayCell
            day={day}
            key={day.key}
            selected={selectedDateKey === day.key}
            onClick={() => onSelectDay(day)}
          />
        ))}
      </div>
    </section>
  );
}

export function SelectedDayPreview({
  items,
  activeIndex,
  selectedDateLabel,
  onOpenItem,
  onSelectItem
}: {
  items: PlanCalendarItem[];
  activeIndex: number;
  selectedDateLabel: string | null;
  onSelectItem: (index: number) => void;
  onOpenItem: (item: PlanCalendarItem) => void;
}) {
  if (!selectedDateLabel) {
    return (
      <section className="rounded-[30px] bg-[linear-gradient(180deg,rgba(18,22,34,0.9),rgba(9,12,19,0.96))] p-5 ring-1 ring-white/6">
        <p className="text-sm font-medium text-white">Pick a glowing day</p>
        <p className="mt-1 text-sm text-white/56">Your posters will light up here.</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[30px] bg-[linear-gradient(180deg,rgba(18,22,34,0.9),rgba(9,12,19,0.96))] p-5 ring-1 ring-white/6">
        <p className="text-xs uppercase tracking-[0.24em] text-white/38">{selectedDateLabel}</p>
        <p className="mt-3 text-lg font-semibold text-white">Nothing locked in yet</p>
        <p className="mt-1 text-sm text-white/56">Try another day or keep exploring.</p>
      </section>
    );
  }

  const featuredItem = items[Math.min(activeIndex, items.length - 1)];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/38">{selectedDateLabel}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {items.length > 1 ? `${items.length} plans this day` : "Preview"}
          </h3>
        </div>
        <p className="text-xs text-white/46">Tap the card to open</p>
      </div>

      {items.length === 1 ? (
        <PreviewCard item={featuredItem} onClick={() => onOpenItem(featuredItem)} selected />
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 subtle-scrollbar">
          {items.map((item, index) => (
            <PreviewCard
              item={item}
              key={item.id}
              onClick={() => {
                if (activeIndex === index) {
                  onOpenItem(item);
                  return;
                }

                onSelectItem(index);
              }}
              selected={activeIndex === index}
            />
          ))}
        </div>
      )}
    </section>
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
    <section className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-white/38">Still taking shape</p>
        <h3 className="mt-1 text-xl font-semibold text-white">Flexible plans</h3>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 subtle-scrollbar">
        {items.map((item) => (
          <button
            className="group w-[220px] shrink-0 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(19,24,40,0.95),rgba(10,13,21,0.98))] text-left ring-1 ring-white/6 transition hover:ring-white/12"
            key={item.id}
            onClick={() => onOpenItem(item)}
            type="button"
          >
            <div className="relative h-[132px] overflow-hidden">
              <img
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                src={item.imageUrl}
                style={{ objectPosition: getMediaObjectPosition(item.imagePosition) }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/20 to-transparent" />
              <div className="absolute left-3 top-3">
                <MiniStateBadge item={item} />
              </div>
            </div>
            <div className="space-y-1.5 p-3.5">
              <p className="line-clamp-2 text-base font-semibold text-white">{item.title}</p>
              <p className="line-clamp-1 text-sm text-white/58">{item.previewCaption}</p>
            </div>
          </button>
        ))}
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
  onClick: () => void;
}) {
  const tone = getGlowTone(day.glowState, day.isTentative);
  const showCount = day.count > 1;

  return (
    <button
      className={cn(
        "relative aspect-square overflow-hidden rounded-[22px] p-0.5 text-left transition duration-300",
        selected ? "scale-[1.02]" : "hover:scale-[1.01]"
      )}
      onClick={onClick}
      type="button"
    >
      {day.count > 0 ? (
        <>
          <div
            className={cn(
              "absolute inset-[18%] rounded-full blur-2xl opacity-70 transition duration-300 motion-safe:animate-[pulse_5.5s_ease-in-out_infinite]",
              tone.glow,
              selected ? "opacity-95" : "opacity-65"
            )}
          />
          <div
            className={cn(
              "absolute inset-[10%] rounded-[20px] transition duration-300",
              tone.fill,
              day.isTentative ? "ring-1 ring-inset ring-white/10" : "",
              selected ? "opacity-100" : "opacity-88"
            )}
          />
        </>
      ) : null}
      <div
        className={cn(
          "relative flex h-full flex-col rounded-[20px] px-2 py-2 transition",
          day.inMonth ? "bg-white/[0.035]" : "bg-white/[0.02]",
          selected
            ? "ring-1 ring-white/16"
            : day.count > 0
              ? "ring-1 ring-white/8"
              : "ring-1 ring-white/4"
        )}
      >
        <span
          className={cn(
            "text-sm font-semibold transition",
            day.inMonth ? "text-white" : "text-white/28",
            day.count > 0 && day.inMonth ? tone.number : ""
          )}
        >
          {day.date.getDate()}
        </span>

        {day.count > 0 ? (
          <div className="mt-auto flex items-end justify-between">
            <div className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
            {showCount ? (
              <span className="rounded-full bg-black/22 px-1.5 py-0.5 text-[10px] font-medium text-white/72 backdrop-blur-sm">
                +{day.count - 1}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function PreviewCard({
  item,
  selected,
  onClick
}: {
  item: PlanCalendarItem;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "group relative min-h-[320px] w-full overflow-hidden rounded-[32px] text-left transition duration-300",
        selected
          ? "ring-1 ring-white/12 shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
          : "opacity-78 ring-1 ring-white/8 hover:opacity-100",
        "sm:min-h-[360px]",
        selected ? "sm:w-full" : "sm:w-[280px]",
        !selected ? "snap-center shrink-0" : ""
      )}
      onClick={onClick}
      type="button"
    >
      <img
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        src={item.imageUrl}
        style={{ objectPosition: getMediaObjectPosition(item.imagePosition) }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,13,0.14),rgba(6,8,13,0.48),rgba(6,8,13,0.95))]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-app-purple/18 to-transparent" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <MiniStateBadge item={item} />
        {item.progressLabel ? (
          <span className="rounded-full bg-black/24 px-2.5 py-1 text-[11px] font-medium text-white/78 backdrop-blur-sm">
            {item.progressLabel}
          </span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-3 p-4">
        <div className="space-y-1.5">
          <h4 className="line-clamp-2 text-[28px] font-semibold leading-tight text-white">
            {item.title}
          </h4>
          <p className="line-clamp-1 text-sm text-white/72">{item.previewCaption}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-white/66">
          <span>{item.city}</span>
          <span className="text-white/52">{selected ? "Open" : "Preview"}</span>
        </div>
      </div>
    </button>
  );
}

function MiniStateBadge({ item }: { item: PlanCalendarItem }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold shadow-[0_12px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm",
        getBadgeTone(item)
      )}
    >
      {item.previewChip}
    </span>
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

function getGlowTone(state?: CalendarDay["glowState"], tentative = false) {
  if (state === "hosting") {
    return {
      glow: "bg-[radial-gradient(circle,rgba(119,77,255,0.62)_0%,rgba(119,77,255,0.12)_58%,transparent_78%)]",
      fill: tentative
        ? "bg-[linear-gradient(180deg,rgba(82,58,173,0.18),rgba(25,22,42,0.02))]"
        : "bg-[linear-gradient(180deg,rgba(82,58,173,0.3),rgba(25,22,42,0.04))]",
      number: "text-white",
      dot: "bg-[#b8a2ff]"
    };
  }

  if (state === "going") {
    return {
      glow: "bg-[radial-gradient(circle,rgba(88,132,255,0.58)_0%,rgba(88,132,255,0.12)_56%,transparent_76%)]",
      fill: tentative
        ? "bg-[linear-gradient(180deg,rgba(51,83,178,0.18),rgba(15,21,39,0.02))]"
        : "bg-[linear-gradient(180deg,rgba(51,83,178,0.3),rgba(15,21,39,0.04))]",
      number: "text-white",
      dot: "bg-[#90aaff]"
    };
  }

  if (state === "pledged") {
    return {
      glow: "bg-[radial-gradient(circle,rgba(100,193,255,0.54)_0%,rgba(100,193,255,0.12)_56%,transparent_78%)]",
      fill: tentative
        ? "bg-[linear-gradient(180deg,rgba(34,78,112,0.2),rgba(10,20,30,0.02))]"
        : "bg-[linear-gradient(180deg,rgba(34,78,112,0.28),rgba(10,20,30,0.04))]",
      number: "text-white",
      dot: "bg-[#88daff]"
    };
  }

  return {
    glow: "bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0%,rgba(160,174,255,0.08)_56%,transparent_76%)]",
    fill: tentative
      ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]"
      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))]",
    number: "text-white/92",
    dot: "bg-white/80"
  };
}

function getBadgeTone(item: PlanCalendarItem) {
  if (item.previewChip === "Hosting") {
    return "bg-app-purple/22 text-white";
  }

  if (item.previewChip === "Going") {
    return "bg-[#5E8BFF]/20 text-white";
  }

  if (item.previewChip === "Soft launch") {
    return "bg-[#8CD7FF]/18 text-white";
  }

  if (item.previewChip === "Pledged") {
    return "bg-[#8CD7FF]/18 text-white";
  }

  return "bg-white/12 text-white";
}
