import type { Platform } from "@prisma/client";

import { instagramAdapter } from "@/src/server/giveaway/metrics/adapters/instagram";
import { sagaAdapter } from "@/src/server/giveaway/metrics/adapters/saga";
import { tiktokAdapter } from "@/src/server/giveaway/metrics/adapters/tiktok";

export const platformAdapters = {
  saga: sagaAdapter,
  instagram: instagramAdapter,
  tiktok: tiktokAdapter
};

export function adapterForPlatform(platform: Platform) {
  return platformAdapters[platform];
}
