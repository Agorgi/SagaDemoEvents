import Link from "next/link";

import { type DemoInboxItem } from "@/src/data/launches";
import { cn } from "@/src/lib/utils";

export function ActivityItem({
  item,
  onRead
}: {
  item: DemoInboxItem;
  onRead?: () => void;
}) {
  return (
    <Link
      className={cn(
        "surface-card block p-4 transition hover:border-white/12",
        item.unread && "border-app-purple/20"
      )}
      href={item.href}
      onClick={onRead}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-app-muted">{item.body}</p>
        </div>
        {item.unread ? (
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-app-purple" />
        ) : null}
      </div>
    </Link>
  );
}
