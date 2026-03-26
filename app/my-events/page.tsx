"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import {
  CalendarFilterChips,
  CalendarGrid,
  CalendarMonthHeader,
  NoDatePlansTray,
  SelectedDayPreview
} from "@/src/features/plans/components";
import {
  derivePlansCalendarData,
  filterPlanItems,
  formatMonthLabel,
  formatMonthDay,
  getCalendarDays,
  getDefaultPlansMonth,
  shiftMonth,
  type CalendarDay,
  type PlanCalendarItem,
  type PlanFilter
} from "@/src/features/plans/selectors";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { APP_ROUTES } from "@/src/lib/routes";

export default function MyEventsPage() {
  const router = useRouter();
  const {
    currentUserId,
    goingEventIds,
    interestedEventIds,
    launches,
    savedEventIds
  } = useAppState();
  const { events } = useDemoState();

  const [activeFilter, setActiveFilter] = useState<PlanFilter>("all");
  const [currentMonth, setCurrentMonth] = useState(() => getDefaultPlansMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const { itemsByDate, noDateItems } = useMemo(
    () =>
      derivePlansCalendarData({
        currentUserId,
        events,
        launches,
        savedEventIds,
        goingEventIds,
        interestedEventIds
      }),
    [currentUserId, events, goingEventIds, interestedEventIds, launches, savedEventIds]
  );

  const days = useMemo(
    () => getCalendarDays(currentMonth, itemsByDate, activeFilter),
    [activeFilter, currentMonth, itemsByDate]
  );

  const selectedItems = useMemo(
    () => filterPlanItems(selectedDateKey ? itemsByDate[selectedDateKey] ?? [] : [], activeFilter),
    [activeFilter, itemsByDate, selectedDateKey]
  );

  const filteredNoDateItems = useMemo(
    () => filterPlanItems(noDateItems, activeFilter),
    [activeFilter, noDateItems]
  );

  const monthHasVisibleItems = days.some((day) => day.inMonth && day.items.length > 0);
  const selectedDateLabel = selectedDateKey ? formatSelectedDateLabel(selectedDateKey) : null;
  const featuredItem = selectedItems[Math.min(activePreviewIndex, selectedItems.length - 1)];

  function resetSelection(nextMonth: Date) {
    setCurrentMonth(nextMonth);
    setSelectedDateKey(null);
    setActivePreviewIndex(0);
  }

  function openPlanItem(item: PlanCalendarItem) {
    router.push(item.href);
  }

  function handleDaySelect(day: CalendarDay) {
    if (day.items.length === 0) {
      setSelectedDateKey(day.key);
      setActivePreviewIndex(0);
      return;
    }

    if (selectedDateKey === day.key) {
      const nextFeatured = day.items[Math.min(activePreviewIndex, day.items.length - 1)];
      if (nextFeatured) {
        openPlanItem(nextFeatured);
      }
      return;
    }

    setSelectedDateKey(day.key);
    setActivePreviewIndex(0);
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pb-14 sm:pt-8">
        <section className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(180deg,rgba(24,29,47,0.98),rgba(10,13,21,0.98))] px-5 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.42)] ring-1 ring-white/6 sm:px-6">
          <div className="absolute -left-10 top-0 h-36 w-36 rounded-full bg-app-purple/22 blur-3xl" />
          <div className="absolute right-0 top-2 h-28 w-28 rounded-full bg-[#7ED4FF]/10 blur-3xl" />
          <div className="relative space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Plans</p>
            <h1 className="text-[40px] font-semibold leading-none text-white sm:text-[48px]">Plans</h1>
            <p className="text-sm text-white/60">Your month at a glance</p>
          </div>
        </section>

        <section className="mt-5 space-y-4">
          <CalendarMonthHeader
            monthLabel={formatMonthLabel(currentMonth)}
            onNext={() => resetSelection(shiftMonth(currentMonth, 1))}
            onPrevious={() => resetSelection(shiftMonth(currentMonth, -1))}
          />
          <CalendarFilterChips
            onChange={(next) => {
              setActiveFilter(next);
              setActivePreviewIndex(0);
            }}
            value={activeFilter}
          />
        </section>

        <section className="mt-5 space-y-5">
          <CalendarGrid days={days} onSelectDay={handleDaySelect} selectedDateKey={selectedDateKey} />

          {!monthHasVisibleItems && filteredNoDateItems.length === 0 ? (
            <section className="rounded-[30px] bg-[linear-gradient(180deg,rgba(18,22,34,0.9),rgba(9,12,19,0.96))] p-5 ring-1 ring-white/6">
              <p className="text-lg font-semibold text-white">Nothing locked in yet</p>
              <p className="mt-1 text-sm text-white/56">A quieter month can still surprise you.</p>
              <Link className="mt-4 inline-flex text-sm font-medium text-white/78 transition hover:text-white" href={APP_ROUTES.home}>
                Explore what&apos;s next
              </Link>
            </section>
          ) : (
            <SelectedDayPreview
              activeIndex={activePreviewIndex}
              items={selectedItems}
              onOpenItem={openPlanItem}
              onSelectItem={setActivePreviewIndex}
              selectedDateLabel={selectedDateLabel}
            />
          )}

          <NoDatePlansTray items={filteredNoDateItems} onOpenItem={openPlanItem} />
        </section>

        {featuredItem && selectedDateKey ? (
          <div className="mt-4 text-center text-xs text-white/34">
            Tap <span className="text-white/52">{formatMonthDay(new Date(selectedDateKey))}</span> again to jump in.
          </div>
        ) : null}
      </main>
    </div>
  );
}

function formatSelectedDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(date);
}
