import type { Metadata } from "next";

import { loginAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Court of Stars Admin Login"
};

export default function AdminLoginPage({
  searchParams
}: {
  searchParams: {
    error?: string;
    next?: string;
  };
}) {
  return (
    <main className="min-h-screen bg-[#06070d] px-4 py-16 text-white">
      <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-[rgba(8,11,20,0.9)] p-8 shadow-2xl">
        <div className="text-[0.7rem] uppercase tracking-[0.28em] text-[#f0d89f]">
          Court of Stars
        </div>
        <h1 className="mt-4 text-3xl font-semibold">Admin login</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Use the internal operator credentials to manage entries, refresh metrics, and apply manual
          score overrides.
        </p>

        <form action={loginAction} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={searchParams.next ?? "/admin"} />
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500"
            />
          </label>

          {searchParams.error === "invalid" ? (
            <div className="rounded-2xl border border-[rgba(255,92,122,0.3)] bg-[rgba(255,92,122,0.08)] px-4 py-3 text-sm text-rose-200">
              The email/password combination was not accepted.
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-[linear-gradient(135deg,#f6d589,#c09040)] px-5 py-3 text-sm font-semibold text-[#1a1205]"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
