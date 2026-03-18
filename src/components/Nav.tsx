"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/src/components/Avatar";
import { CreateFlowModal } from "@/src/components/CreateFlowModal";
import { getUserById } from "@/src/data/demo";
import { HOST_DEMO_USER_ID } from "@/src/lib/host-mode";
import { useDemoState } from "@/src/lib/demo-state";
import { cn } from "@/src/lib/utils";

const visitorLinks = [
  { href: "/explore", label: "Discover" },
  { href: "/my-events", label: "My Events" },
  { href: "/profile", label: "Profile" }
];

const hostLinks = [
  { href: "/host", label: "Events" },
  { href: "/host/applicants", label: "Applicants" },
  { href: `/profiles/${HOST_DEMO_USER_ID}`, label: "Profile" }
];

function isActive(pathname: string, href: string) {
  if (href === "/explore") {
    return pathname === "/" || pathname === "/explore" || pathname === "/events";
  }

  if (href === "/host") {
    return pathname === "/host" || pathname.startsWith("/host/events/");
  }

  if (href === "/host/applicants") {
    return pathname === "/host/applicants";
  }

  if (href === "/profile") {
    return pathname === "/profile" || pathname.startsWith("/profiles/");
  }

  return pathname === href;
}

export function Nav() {
  const pathname = usePathname();
  const { activeUserId } = useDemoState();
  const isHostMode = pathname.startsWith("/host");
  const activeUser = getUserById(isHostMode ? HOST_DEMO_USER_ID : activeUserId);
  const links = isHostMode ? hostLinks : visitorLinks;
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#090b10]/92 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[60px] w-full max-w-[1240px] items-center gap-3 px-4 py-2 sm:min-h-[68px] sm:px-6">
          <Link
            aria-label="Saga home"
            className="flex shrink-0 items-center"
            href="/explore"
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
            {isHostMode ? (
              <button
                className="inline-flex items-center rounded-[18px] bg-app-purple px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                onClick={() => setCreateOpen(true)}
                type="button"
              >
                Create event
              </button>
            ) : (
              <Link
                className="inline-flex items-center rounded-[18px] bg-app-purple px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
                href="/host"
              >
                + Host
              </Link>
            )}
            {activeUser ? (
              <Link
                aria-label={`Open ${activeUser.handle} profile`}
                className="rounded-full transition hover:scale-[1.02]"
                href={isHostMode ? `/profiles/${HOST_DEMO_USER_ID}` : "/profile"}
              >
                <Avatar
                  className="h-[36px] w-[36px] text-xs"
                  name={activeUser.name}
                  size="sm"
                  src={activeUser.avatarUrl}
                />
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 md:hidden">
        <div className="pointer-events-auto mx-auto grid max-w-[520px] grid-cols-3 gap-2 rounded-[24px] border border-white/8 bg-[#0f1320]/94 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          {links.map((link) => (
            <Link
              className={cn(
                "rounded-[18px] px-3 py-3 text-center text-sm font-semibold transition",
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

      <CreateFlowModal
        hostUserId={HOST_DEMO_USER_ID}
        mode="host"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
