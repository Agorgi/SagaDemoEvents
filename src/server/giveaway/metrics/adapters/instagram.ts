import type { PlatformMetricsAdapter } from "@/src/server/giveaway/metrics/types";

function extractInstagramShortcode(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\/(?:p|reel|tv)\/([^/?#]+)/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export const instagramAdapter: PlatformMetricsAdapter = {
  platform: "instagram",
  async fetchMetrics({ url }) {
    const shortcode = extractInstagramShortcode(url);
    const accessToken = process.env.META_ACCESS_TOKEN?.trim();

    if (!shortcode) {
      return {
        platform: "instagram",
        canonicalPostId: null,
        canonicalPostUrl: url,
        likeCount: null,
        commentCount: null,
        uniqueCommenterCount: null,
        shareCount: null,
        fetchStatus: "parse_error",
        fetchMessage: "Could not extract an Instagram shortcode from the submitted URL.",
        fetchedAt: new Date(),
        sourceType: "official_api",
        commentCountBasis: "unknown",
        rawPayloadJson: null
      };
    }

    if (!accessToken) {
      return {
        platform: "instagram",
        canonicalPostId: shortcode,
        canonicalPostUrl: url,
        likeCount: null,
        commentCount: null,
        uniqueCommenterCount: null,
        shareCount: null,
        fetchStatus: "auth_required",
        fetchMessage:
          "Meta access is not configured. Instagram scoring requires an approved official integration or manual review.",
        fetchedAt: new Date(),
        sourceType: "official_api",
        commentCountBasis: "unknown",
        rawPayloadJson: null
      };
    }

    const endpoint = new URL("https://graph.facebook.com/v20.0/instagram_oembed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("access_token", accessToken);

    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      return {
        platform: "instagram",
        canonicalPostId: shortcode,
        canonicalPostUrl: url,
        likeCount: null,
        commentCount: null,
        uniqueCommenterCount: null,
        shareCount: null,
        fetchStatus: response.status === 404 ? "not_found" : "review_required",
        fetchMessage:
          response.status === 404
            ? "Instagram oEmbed could not find this post."
            : "Instagram post was verified, but official metric access for third-party entrant posts still needs manual review.",
        fetchedAt: new Date(),
        sourceType: "official_api",
        commentCountBasis: "unknown",
        rawPayloadJson: await response.json().catch(() => null)
      };
    }

    const payload = (await response.json()) as Record<string, unknown>;

    return {
      platform: "instagram",
      canonicalPostId: shortcode,
      canonicalPostUrl:
        typeof payload.author_url === "string" && typeof payload.url === "string" ? payload.url : url,
      likeCount: null,
      commentCount: null,
      uniqueCommenterCount: null,
      shareCount: null,
      fetchStatus: "review_required",
      fetchMessage:
        "Official Meta oEmbed verified the post URL, but audience metrics for entrant-owned content are not available through this configured path.",
      fetchedAt: new Date(),
      sourceType: "official_api",
      commentCountBasis: "unknown",
      rawPayloadJson: payload
    };
  }
};
