"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/explore") {
    return pathname === "/" || pathname.startsWith("/explore") || pathname.startsWith("/discover");
  }

  if (href === "/work") {
    return (
      pathname.startsWith("/work") ||
      pathname.startsWith("/opportunities/") ||
      pathname.startsWith("/listings/") ||
      pathname.startsWith("/businesses/")
    );
  }

  if (href === "/studio") {
    return pathname.startsWith("/studio") || pathname.startsWith("/host");
  }

  if (href === "/my-events") {
    return pathname.startsWith("/my-events") || pathname.startsWith("/saved");
  }

  if (href === "/profile") {
    return (
      pathname === "/profile" ||
      pathname.startsWith("/profiles/") ||
      pathname.startsWith("/creators/") ||
      pathname.startsWith("/settings/")
    );
  }

  return pathname === href;
}

export function Nav() {
  const pathname = usePathname();
  const { currentUser, inbox } = useAppState();
  const unreadCount = inbox.filter((item) => item.unread).length;

  const desktopLinks = [
    { href: "/explore", label: "Home", mobileLabel: "Home" },
    { href: "/work", label: "Work", mobileLabel: "Work" },
    { href: "/studio", label: "Launch", mobileLabel: "Launch" },
    { href: "/my-events", label: "Plans", mobileLabel: "Plans" },
    { href: "/profile", label: "Profile", mobileLabel: "Profile" }
  ];
  const mobileLinks = desktopLinks;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#090b10]/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[60px] w-full max-w-[1240px] items-center gap-3 px-4 py-2 sm:min-h-[68px] sm:px-6">
          <Link
            aria-label="Saga home"
            className="flex shrink-0 items-center"
            href="/explore"
            title="Go to Home"
          >
            <img
              alt="Saga logo"
              className="block h-[38px] w-auto max-w-none object-contain sm:h-[42px]"
              src="/group-88462-v2.png"
            />
          </Link>

          <nav className="ml-3 hidden items-center gap-1 md:flex">
            {desktopLinks.map((link) => (
              <Link
                aria-label={`Open ${link.label}`}
                className={cn(
                  "rounded-[16px] px-3 py-2 text-sm font-medium transition",
                  isActive(pathname, link.href)
                    ? "bg-white/[0.05] text-white"
                    : "text-app-muted hover:bg-white/[0.03] hover:text-white"
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <Link
              aria-label="Open updates"
              className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white transition hover:border-white/16 hover:bg-white/[0.05]"
              href="/inbox"
            >
              <BellIcon />
              {unreadCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 inline-flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-app-purple px-1 text-[10px] font-bold text-white">
                  {Math.min(unreadCount, 9)}
                </span>
              ) : null}
            </Link>
            <Link
              aria-label={`Open ${currentUser.handle} profile`}
              className="rounded-full transition hover:scale-[1.02]"
              href="/profile"
            >
              <Avatar
                className="h-[36px] w-[36px] text-xs"
                name={currentUser.name}
                size="sm"
                src={currentUser.avatarUrl}
              />
            </Link>
          </div>
        </div>
      </header>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
      >
        <div className="pointer-events-auto mx-auto max-w-[430px] space-y-2">
          <div
            className="grid gap-1.5 rounded-[20px] border border-white/8 bg-[#0f1320]/94 p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl"
            style={{ gridTemplateColumns: `repeat(${mobileLinks.length}, minmax(0, 1fr))` }}
          >
            {mobileLinks.map((link) => (
              <Link
                aria-label={`Open ${link.mobileLabel}`}
                className={cn(
                  "min-w-0 rounded-[16px] px-1.5 py-2.5 text-center text-[10px] font-semibold leading-none tracking-[-0.01em] whitespace-nowrap transition",
                  isActive(pathname, link.href)
                    ? "bg-app-purple text-white"
                    : "text-app-muted hover:bg-white/[0.03] hover:text-white"
                )}
                href={link.href}
                key={link.href}
              >
                {link.mobileLabel}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="M12 4.75a4.25 4.25 0 0 0-4.25 4.25v2.06c0 .77-.2 1.53-.58 2.21l-1.07 1.92a1 1 0 0 0 .87 1.49h10.16a1 1 0 0 0 .87-1.49l-1.07-1.92a4.54 4.54 0 0 1-.58-2.21V9A4.25 4.25 0 0 0 12 4.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M9.75 18.25a2.25 2.25 0 0 0 4.5 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
