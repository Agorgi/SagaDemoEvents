import type { PlatformMetricsAdapter } from "@/src/server/giveaway/metrics/types";

function extractTikTokVideoId(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\/video\/(\d+)/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export const tiktokAdapter: PlatformMetricsAdapter = {
  platform: "tiktok",
  async fetchMetrics({ url }) {
    const videoId = extractTikTokVideoId(url);
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN?.trim();

    if (!videoId) {
      return {
        platform: "tiktok",
        canonicalPostId: null,
        canonicalPostUrl: url,
        likeCount: null,
        commentCount: null,
        uniqueCommenterCount: null,
        shareCount: null,
        fetchStatus: "parse_error",
        fetchMessage: "Could not extract a TikTok video id from the submitted URL.",
        fetchedAt: new Date(),
        sourceType: "official_api",
        commentCountBasis: "unknown",
        rawPayloadJson: null
      };
    }

    if (!accessToken) {
      return {
        platform: "tiktok",
        canonicalPostId: videoId,
        canonicalPostUrl: url,
        likeCount: null,
        commentCount: null,
        uniqueCommenterCount: null,
        shareCount: null,
        fetchStatus: "auth_required",
        fetchMessage:
          "TikTok official access is not configured. This entry needs manual review or an authorized token.",
        fetchedAt: new Date(),
        sourceType: "official_api",
        commentCountBasis: "unknown",
        rawPayloadJson: null
      };
    }

    const response = await fetch("https://open.tiktokapis.com/v2/video/query/?fields=id,title,video_description,share_count,comment_count,like_count", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filters: {
          video_ids: [videoId]
        }
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        platform: "tiktok",
        canonicalPostId: videoId,
        canonicalPostUrl: url,
        likeCount: null,
        commentCount: null,
        uniqueCommenterCount: null,
        shareCount: null,
        fetchStatus: response.status === 401 ? "auth_required" : "review_required",
        fetchMessage: `TikTok API returned ${response.status}.`,
        fetchedAt: new Date(),
        sourceType: "official_api",
        commentCountBasis: "unknown",
        rawPayloadJson: await response.json().catch(() => null)
      };
    }

    const payload = (await response.json()) as {
      data?: {
        videos?: Array<{
          id?: string;
          share_count?: number;
          comment_count?: number;
          like_count?: number;
        }>;
      };
    };
    const video = payload.data?.videos?.[0];

    if (!video) {
      return {
        platform: "tiktok",
        canonicalPostId: videoId,
        canonicalPostUrl: url,
        likeCount: null,
        commentCount: null,
        uniqueCommenterCount: null,
        shareCount: null,
        fetchStatus: "not_found",
        fetchMessage: "TikTok API did not return a video for this URL.",
        fetchedAt: new Date(),
        sourceType: "official_api",
        commentCountBasis: "unknown",
        rawPayloadJson: payload
      };
    }

    return {
      platform: "tiktok",
      canonicalPostId: typeof video.id === "string" ? video.id : videoId,
      canonicalPostUrl: url,
      likeCount: typeof video.like_count === "number" ? video.like_count : null,
      commentCount: typeof video.comment_count === "number" ? video.comment_count : null,
      uniqueCommenterCount: null,
      shareCount: typeof video.share_count === "number" ? video.share_count : null,
      fetchStatus: "review_required",
      fetchMessage:
        "TikTok official metrics were fetched, but unique commenter identity is not available through this configured path.",
      fetchedAt: new Date(),
      sourceType: "official_api",
      commentCountBasis: "total",
      rawPayloadJson: payload
    };
  }
};
