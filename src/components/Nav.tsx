"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { ContextAwareHeader } from "@/src/components/ContextAwareHeader";
import { PersonaSwitcher } from "@/src/components/PersonaSwitcher";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/explore") {
    return pathname === "/" || pathname.startsWith("/explore");
  }

  if (href === "/discover") {
    return pathname.startsWith("/discover");
  }

  if (href === "/work") {
    return (
      pathname.startsWith("/work") ||
      pathname.startsWith("/opportunities/") ||
      pathname.startsWith("/listings/") ||
      pathname.startsWith("/businesses/")
    );
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
  const { currentUser } = useAppState();

  const desktopLinks = [
    { href: "/explore", label: "Home", mobileLabel: "Home" },
    { href: "/discover", label: "Discover", mobileLabel: "Discover" },
    { href: "/work", label: "Work", mobileLabel: "Work" },
    { href: "/my-events", label: "Plans", mobileLabel: "Plans" },
    { href: "/inbox", label: "Activity", mobileLabel: "Activity" },
    { href: "/profile", label: "Profile", mobileLabel: "Profile" }
  ];
  const mobileLinks = [
    { href: "/explore", label: "Home", mobileLabel: "Home" },
    { href: "/discover", label: "Discover", mobileLabel: "Discover" },
    { href: "/work", label: "Work", mobileLabel: "Work" },
    { href: "/my-events", label: "Plans", mobileLabel: "Plans" },
    { href: "/profile", label: "Profile", mobileLabel: "Profile" }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#090b10]/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[60px] w-full max-w-[1240px] items-center gap-3 px-4 py-2 sm:min-h-[68px] sm:px-6">
          <Link
            aria-label="Saga home"
            className="flex shrink-0 items-center"
            href={pathname.startsWith("/studio") ? "/studio" : "/explore"}
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
            <PersonaSwitcher className="hidden md:flex" />
            <ContextAwareHeader />
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
          <PersonaSwitcher compact className="justify-between" />
          <div
            className="grid gap-1.5 rounded-[20px] border border-white/8 bg-[#0f1320]/94 p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl"
            style={{ gridTemplateColumns: `repeat(${mobileLinks.length}, minmax(0, 1fr))` }}
          >
            {mobileLinks.map((link) => (
              <Link
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
