import { Prisma } from "@prisma/client";

import { db } from "@/src/server/db";

export async function writeAuditLog(input: {
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  metadataJson?: Prisma.JsonValue | null;
}) {
  await db.adminAuditLog.create({
    data: {
      actor: input.actor,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadataJson: input.metadataJson ?? Prisma.DbNull
    }
  });
}
