"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateAdminCredentials, requireAdminSession } from "@/src/server/admin/auth";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie
} from "@/src/server/admin/session";
import { db } from "@/src/server/db";
import { applyManualOverride, refreshSingleContestEntryMetrics } from "@/src/server/giveaway/refresh-metrics";
import { recomputeLeaderboard } from "@/src/server/giveaway/leaderboard";

function integerOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!validateAdminCredentials(email, password)) {
    redirect(`/admin/login?error=invalid&next=${encodeURIComponent(next)}`);
  }

  await setAdminSessionCookie(email);
  redirect(next || "/admin");
}

export async function logoutAction() {
  await requireAdminSession();
  clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function retryEntryAction(formData: FormData) {
  await requireAdminSession();
  const entryId = String(formData.get("entryId") ?? "");

  if (!entryId) {
    throw new Error("Entry id is required.");
  }

  await refreshSingleContestEntryMetrics(entryId);
  await recomputeLeaderboard();
  revalidatePath("/admin");
  revalidatePath(`/admin/entries/${entryId}`);
  revalidatePath("/giveaway");
}

export async function addManualOverrideAction(formData: FormData) {
  const session = await requireAdminSession();
  const contestEntryId = String(formData.get("contestEntryId") ?? "");
  const platform = String(formData.get("platform") ?? "") as "saga" | "instagram" | "tiktok";
  const reason = String(formData.get("reason") ?? "").trim();

  if (!contestEntryId || !platform || !reason) {
    throw new Error("Contest entry id, platform, and reason are required.");
  }

  await applyManualOverride({
    contestEntryId,
    platform,
    likeCount: integerOrNull(formData.get("likeCount")),
    commentCount: integerOrNull(formData.get("commentCount")),
    uniqueCommenterCount: integerOrNull(formData.get("uniqueCommenterCount")),
    shareCount: integerOrNull(formData.get("shareCount")),
    reason,
    createdBy: session.email
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/entries/${contestEntryId}`);
  revalidatePath("/giveaway");
}

export async function togglePublicVisibilityAction(formData: FormData) {
  await requireAdminSession();
  const contestEntryId = String(formData.get("contestEntryId") ?? "");
  const included = String(formData.get("included") ?? "") === "true";

  if (!contestEntryId) {
    throw new Error("Contest entry id is required.");
  }

  await db.contestEntry.update({
    where: { id: contestEntryId },
    data: {
      hiddenReason: included ? null : "admin:hidden"
    }
  });

  await recomputeLeaderboard();

  revalidatePath("/admin");
  revalidatePath(`/admin/entries/${contestEntryId}`);
  revalidatePath("/giveaway");
}
