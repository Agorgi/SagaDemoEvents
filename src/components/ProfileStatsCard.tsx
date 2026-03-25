"use client";

type StatItem = {
  label: string;
  value: string | number;
};

export function ProfileStatsCard({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-[26px] border border-white/8 bg-[#101522] shadow-soft">
      {items.map((item, index) => (
        <div
          className={`px-4 py-4 text-center ${index > 0 ? "border-l border-white/8" : ""}`}
          key={item.label}
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-app-muted">{item.label}</p>
          <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
