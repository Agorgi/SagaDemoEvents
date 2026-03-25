"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ContextAwareHeader() {
  const pathname = usePathname();
  const isLaunchRoute = pathname.startsWith("/studio");
  const action = isLaunchRoute
    ? { href: "/studio/new", label: "New launch" }
    : { href: "/studio/new", label: "Start launch" };

  return (
    <div className="flex items-center gap-2">
      <Link
        className="inline-flex min-h-[44px] items-center rounded-[18px] bg-app-purple px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
        href={action.href}
      >
        {action.label}
      </Link>
    </div>
  );
}
