import { timingSafeEqual } from "node:crypto";

import { redirect } from "next/navigation";

import { getAdminSession } from "@/src/server/admin/session";

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim() ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim() ?? "";

  return safeCompare(email.trim(), expectedEmail) && safeCompare(password, expectedPassword);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
