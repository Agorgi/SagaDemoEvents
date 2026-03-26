"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import { PageHeroHeader } from "@/src/components/PageHeroHeader";
import {
  CalendarGrid,
  CalendarMonthHeader,
  NoDatePlansTray
} from "@/src/features/plans/components";
import {
  derivePlansCalendarData,
  formatMonthLabel,
  getCalendarDays,
  getDefaultPlansMonth,
  shiftMonth,
  type CalendarDay,
  type PlanCalendarItem
} from "@/src/features/plans/selectors";
import { useAppState } from "@/src/lib/app-state";
import { useDemoState } from "@/src/lib/demo-state";
import { APP_ROUTES } from "@/src/lib/routes";

export default function MyEventsPage() {
  const router = useRouter();
  const {
    currentUserId,
    goingEventIds,
    homeCity,
    interestedEventIds,
    launches,
    savedEventIds
  } = useAppState();
  const { events } = useDemoState();

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
    () => getCalendarDays(currentMonth, itemsByDate, "all"),
    [currentMonth, itemsByDate]
  );

  const selectedItems = useMemo(
    () => (selectedDateKey ? itemsByDate[selectedDateKey] ?? [] : []),
    [itemsByDate, selectedDateKey]
  );

  const monthHasVisibleItems = days.some((day) => day.inMonth && day.items.length > 0);
  const selectedDateLabel = selectedDateKey ? formatSelectedDateLabel(selectedDateKey) : null;

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
        <PageHeroHeader
          eyebrow={homeCity}
          label="Plans"
          title="Your month at a glance"
        />

        <section className="mt-5 space-y-4">
          <CalendarMonthHeader
            monthLabel={formatMonthLabel(currentMonth)}
            onNext={() => resetSelection(shiftMonth(currentMonth, 1))}
            onPrevious={() => resetSelection(shiftMonth(currentMonth, -1))}
          />
        </section>

        <section className="mt-5 space-y-5">
          <CalendarGrid
            activeIndex={activePreviewIndex}
            days={days}
            onOpenItem={openPlanItem}
            onSelectDay={handleDaySelect}
            onSelectItem={setActivePreviewIndex}
            selectedDateKey={selectedDateKey}
            selectedDateLabel={selectedDateLabel}
            selectedItems={selectedItems}
          />

          {!monthHasVisibleItems && noDateItems.length === 0 ? (
            <section className="rounded-[30px] bg-[linear-gradient(180deg,rgba(18,22,34,0.9),rgba(9,12,19,0.96))] p-5 ring-1 ring-white/6">
              <p className="text-lg font-semibold text-white">Nothing locked in yet</p>
              <p className="mt-1 text-sm text-white/56">A quieter month can still surprise you.</p>
              <Link
                className="mt-4 inline-flex text-sm font-medium text-white/78 transition hover:text-white"
                href={APP_ROUTES.home}
              >
                Explore what&apos;s next
              </Link>
            </section>
          ) : null}

          <NoDatePlansTray items={noDateItems} onOpenItem={openPlanItem} />
        </section>
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
