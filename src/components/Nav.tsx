"use client";

import { usePathname } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { useAppState } from "@/src/lib/app-state";
import { APP_ROUTES } from "@/src/lib/routes";
import { cn } from "@/src/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === APP_ROUTES.home) {
    return pathname === APP_ROUTES.root || pathname.startsWith(APP_ROUTES.home) || pathname.startsWith("/discover");
  }

  if (href === APP_ROUTES.work) {
    return (
      pathname.startsWith(APP_ROUTES.work) ||
      pathname.startsWith("/opportunities/") ||
      pathname.startsWith("/listings/") ||
      pathname.startsWith("/businesses/")
    );
  }

  if (href === APP_ROUTES.launch) {
    return pathname.startsWith(APP_ROUTES.launch) || pathname.startsWith("/host");
  }

  if (href === APP_ROUTES.plans) {
    return pathname.startsWith(APP_ROUTES.plans) || pathname.startsWith("/saved");
  }

  if (href === APP_ROUTES.profile) {
    return (
      pathname === APP_ROUTES.profile ||
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
    { href: APP_ROUTES.home, label: "Home", mobileLabel: "Home" },
    { href: APP_ROUTES.work, label: "Work", mobileLabel: "Work" },
    { href: APP_ROUTES.launch, label: "Launch", mobileLabel: "Launch" },
    { href: APP_ROUTES.plans, label: "Plans", mobileLabel: "Plans" },
    { href: APP_ROUTES.profile, label: "Profile", mobileLabel: "Profile" }
  ];
  const mobileLinks = desktopLinks;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#090b10]/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[56px] w-full max-w-[1240px] items-center gap-2.5 px-4 py-1.5 sm:min-h-[64px] sm:px-6">
          <a
            aria-label="Saga home"
            className="flex shrink-0 items-center"
            href={APP_ROUTES.home}
            title="Go to Home"
          >
            <img
              alt="Saga logo"
              className="block h-[34px] w-auto max-w-none object-contain sm:h-[38px]"
              src="/group-88462-v2.png"
            />
          </a>

          <nav className="ml-2 hidden items-center gap-0.5 md:flex">
            {desktopLinks.map((link) => (
              <a
                aria-label={`Open ${link.label}`}
                className={cn(
                  "rounded-[15px] px-2.5 py-1.5 text-sm font-medium transition",
                  isActive(pathname, link.href)
                    ? "bg-white/[0.05] text-white"
                    : "text-app-muted hover:bg-white/[0.03] hover:text-white"
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              aria-label="Open updates"
              className="relative inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/[0.05] text-white transition hover:bg-white/[0.08]"
              href={APP_ROUTES.updates}
            >
              <BellIcon />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 inline-flex min-h-[15px] min-w-[15px] items-center justify-center rounded-full bg-app-purple px-1 text-[9px] font-bold text-white">
                  {Math.min(unreadCount, 9)}
                </span>
              ) : null}
            </a>
            <a
              aria-label={`Open ${currentUser.handle} profile`}
              className="rounded-full transition hover:scale-[1.02]"
              href={APP_ROUTES.profile}
            >
              <Avatar
                className="h-[34px] w-[34px] text-xs"
                name={currentUser.name}
                size="sm"
                src={currentUser.avatarUrl}
              />
            </a>
          </div>
        </div>
      </header>

      <div
        className="fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div className="mx-auto max-w-[430px]">
          <div
            className="grid gap-1 rounded-[20px] border border-white/8 bg-[#0f1320]/94 p-1 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl"
            style={{ gridTemplateColumns: `repeat(${mobileLinks.length}, minmax(0, 1fr))` }}
          >
            {mobileLinks.map((link) => (
              <a
                aria-label={`Open ${link.mobileLabel}`}
                className={cn(
                  "flex min-h-[36px] min-w-0 items-center justify-center rounded-[15px] px-1 py-2 text-center text-[10px] font-semibold leading-none tracking-[-0.01em] whitespace-nowrap transition",
                  isActive(pathname, link.href)
                    ? "bg-app-purple text-white"
                    : "text-app-muted hover:bg-white/[0.03] hover:text-white"
                )}
                href={link.href}
                key={link.href}
              >
                {link.mobileLabel}
              </a>
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
