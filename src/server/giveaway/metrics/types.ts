import type {
  CommentCountBasis,
  FetchStatus,
  MetricSourceType,
  Prisma,
  Platform
} from "@prisma/client";

export interface NormalizedPlatformMetrics {
  platform: Platform;
  canonicalPostId: string | null;
  canonicalPostUrl: string;
  likeCount: number | null;
  commentCount: number | null;
  uniqueCommenterCount: number | null;
  shareCount: number | null;
  fetchStatus: FetchStatus;
  fetchMessage: string | null;
  fetchedAt: Date;
  sourceType: MetricSourceType;
  commentCountBasis: CommentCountBasis;
  rawPayloadJson: Prisma.InputJsonValue | null;
}

export interface PlatformAdapterContext {
  url: string;
}

export interface PlatformMetricsAdapter {
  platform: Platform;
  fetchMetrics(context: PlatformAdapterContext): Promise<NormalizedPlatformMetrics>;
}
