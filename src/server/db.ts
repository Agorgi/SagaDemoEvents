import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

export const db = globalThis.__prisma__ ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma__ = db;
}
