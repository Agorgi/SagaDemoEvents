"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar } from "@/src/components/Avatar";
import { ContextAwareHeader } from "@/src/components/ContextAwareHeader";
import { useAppState } from "@/src/lib/app-state";
import { type UserMode } from "@/src/data/launches";
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
  const router = useRouter();
  const { currentUser, hasStartedLaunch, mode, setMode } = useAppState();

  const links = [
    { href: "/explore", label: "Explore", mobileLabel: "Explore" },
    { href: "/my-events", label: "My Events", mobileLabel: "Events" },
    ...(mode === "host" || hasStartedLaunch
      ? [{ href: "/studio", label: "Studio", mobileLabel: "Studio" }]
      : []),
    { href: "/inbox", label: "Inbox", mobileLabel: "Inbox" },
    { href: "/profile", label: "Profile", mobileLabel: "Profile" }
  ];

  function handleModeChange(nextMode: UserMode) {
    setMode(nextMode);

    if (nextMode === "host") {
      router.push("/studio");
      return;
    }

    if (nextMode === "creator") {
      router.push("/explore?view=openings");
      return;
    }

    router.push("/explore");
  }

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
            <label className="hidden items-center gap-2 rounded-[16px] border border-white/8 bg-white/[0.03] px-3 py-2 md:flex">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-app-muted">Flow</span>
              <select
                aria-label="Switch flow"
                className="bg-transparent text-sm font-semibold text-white outline-none"
                onChange={(event) => handleModeChange(event.target.value as UserMode)}
                value={mode}
              >
                <option className="bg-[#090b10]" value="host">
                  Host
                </option>
                <option className="bg-[#090b10]" value="fan">
                  Ticket buyer
                </option>
                <option className="bg-[#090b10]" value="creator">
                  Contributor
                </option>
              </select>
            </label>
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
          <div className="flex items-center justify-between rounded-[18px] border border-white/8 bg-[#0f1320]/94 px-3 py-2 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-app-muted">Flow</span>
            <select
              aria-label="Switch flow"
              className="max-w-[160px] bg-transparent text-right text-sm font-semibold text-white outline-none"
              onChange={(event) => handleModeChange(event.target.value as UserMode)}
              value={mode}
            >
              <option className="bg-[#090b10]" value="host">
                Host
              </option>
              <option className="bg-[#090b10]" value="fan">
                Ticket buyer
              </option>
              <option className="bg-[#090b10]" value="creator">
                Contributor
              </option>
            </select>
          </div>
          <div
            className="grid gap-1.5 rounded-[20px] border border-white/8 bg-[#0f1320]/94 p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl"
            style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
          >
            {links.map((link) => (
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
