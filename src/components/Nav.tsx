"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { ContextAwareHeader } from "@/src/components/ContextAwareHeader";
import { useAppState } from "@/src/lib/app-state";
import { cn } from "@/src/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/explore") {
    return pathname === "/" || pathname.startsWith("/explore") || pathname === "/events";
  }

  if (href === "/studio") {
    return pathname.startsWith("/studio");
  }

  if (href === "/profile") {
    return pathname === "/profile" || pathname.startsWith("/profiles/") || pathname.startsWith("/creators/");
  }

  return pathname === href;
}

export function Nav() {
  const pathname = usePathname();
  const { currentUser, hasStartedLaunch, mode } = useAppState();

  const links = [
    { href: "/explore", label: "Explore" },
    { href: "/my-events", label: "My Events" },
    ...(mode === "host" || hasStartedLaunch ? [{ href: "/studio", label: "Studio" }] : []),
    { href: "/inbox", label: "Inbox" },
    { href: "/profile", label: "Profile" }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#090b10]/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[60px] w-full max-w-[1240px] items-center gap-3 px-4 py-2 sm:min-h-[68px] sm:px-6">
          <Link
            aria-label="Saga home"
            className="flex shrink-0 items-center"
            href={mode === "host" && pathname.startsWith("/studio") ? "/studio" : "/"}
          >
            <img
              alt="Saga logo"
              className="block h-[38px] w-auto max-w-none object-contain sm:h-[42px]"
              src="/group-88462-v2.png"
            />
          </Link>

          <nav className="ml-3 hidden items-center gap-1 md:flex">
            {links.map((link) => (
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

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 md:hidden">
        <div className="pointer-events-auto mx-auto grid max-w-[620px] gap-2 rounded-[24px] border border-white/8 bg-[#0f1320]/94 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl" style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}>
          {links.map((link) => (
            <Link
              className={cn(
                "rounded-[18px] px-2 py-3 text-center text-sm font-semibold transition",
                isActive(pathname, link.href)
                  ? "bg-app-purple text-white"
                  : "text-app-muted hover:bg-white/[0.03] hover:text-white"
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

