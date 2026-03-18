"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Nav } from "@/src/components/Nav";
import { useDemoState } from "@/src/lib/demo-state";

export default function ProfilePage() {
  const router = useRouter();
  const { activeUserId, hydrated } = useDemoState();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    router.replace(`/profiles/${activeUserId}`);
  }, [activeUserId, hydrated, router]);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-20 text-center text-app-muted">
        Loading your profile...
      </main>
    </div>
  );
}
