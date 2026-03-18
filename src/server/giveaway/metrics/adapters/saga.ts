import type { Prisma } from "@prisma/client";

import type { PlatformMetricsAdapter } from "@/src/server/giveaway/metrics/types";

async function scrapeSagaMetrics(url: string) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

    const bodyText = await page.locator("body").textContent();
    const likesMatch = bodyText?.match(/(\d+)\s+likes?/i);
    const commentsMatch = bodyText?.match(/(\d+)\s+comments?/i);

    if (!likesMatch && !commentsMatch) {
      return null;
    }

    return {
      likeCount: likesMatch ? Number(likesMatch[1]) : null,
      commentCount: commentsMatch ? Number(commentsMatch[1]) : null
    };
  } finally {
    await browser.close();
  }
}

export const sagaAdapter: PlatformMetricsAdapter = {
  platform: "saga",
  async fetchMetrics({ url }) {
    const endpoint = process.env.SAGA_METRICS_API_URL?.trim();
    const apiKey = process.env.SAGA_METRICS_API_KEY?.trim();

    if (endpoint && apiKey) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        return {
          platform: "saga",
          canonicalPostId: null,
          canonicalPostUrl: url,
          likeCount: null,
          commentCount: null,
          uniqueCommenterCount: null,
          shareCount: null,
          fetchStatus: response.status === 404 ? "not_found" : "transient_error",
          fetchMessage: `Saga metrics API returned ${response.status}.`,
          fetchedAt: new Date(),
          sourceType: "internal_api",
          commentCountBasis: "unknown",
          rawPayloadJson: null
        };
      }

      const payload = (await response.json()) as Record<string, unknown>;

      const likeCount =
        typeof payload.like_count === "number"
          ? payload.like_count
          : typeof payload.likes === "number"
            ? payload.likes
            : null;
      const commentCount =
        typeof payload.comment_count === "number"
          ? payload.comment_count
          : typeof payload.comments === "number"
            ? payload.comments
            : null;
      const uniqueCommenterCount =
        typeof payload.unique_commenter_count === "number"
          ? payload.unique_commenter_count
          : null;

      return {
        platform: "saga",
        canonicalPostId:
          typeof payload.post_id === "string"
            ? payload.post_id
            : typeof payload.id === "string"
              ? payload.id
              : null,
        canonicalPostUrl:
          typeof payload.canonical_post_url === "string" ? payload.canonical_post_url : url,
        likeCount,
        commentCount,
        uniqueCommenterCount,
        shareCount:
          typeof payload.share_count === "number"
            ? payload.share_count
            : typeof payload.shares === "number"
              ? payload.shares
              : null,
        fetchStatus:
          likeCount !== null && uniqueCommenterCount !== null ? "success" : "review_required",
        fetchMessage:
          likeCount !== null && uniqueCommenterCount !== null
            ? null
            : "Saga metrics were fetched, but unique commenter verification is incomplete.",
        fetchedAt: new Date(),
        sourceType: "internal_api",
        commentCountBasis: uniqueCommenterCount !== null ? "unique" : "unknown",
        rawPayloadJson: payload as Prisma.InputJsonValue
      };
    }

    if (process.env.ALLOW_SAGA_PUBLIC_SCRAPER === "true") {
      try {
        const scraped = await scrapeSagaMetrics(url);

        if (!scraped) {
          return {
            platform: "saga",
            canonicalPostId: null,
            canonicalPostUrl: url,
            likeCount: null,
            commentCount: null,
            uniqueCommenterCount: null,
            shareCount: null,
            fetchStatus: "parse_error",
          fetchMessage: "Experimental Saga scraper could not locate scoreable metrics on the page.",
          fetchedAt: new Date(),
          sourceType: "experimental_fallback",
          commentCountBasis: "total",
          rawPayloadJson: null
        };
        }

        return {
          platform: "saga",
          canonicalPostId: null,
          canonicalPostUrl: url,
          likeCount: scraped.likeCount,
          commentCount: scraped.commentCount,
          uniqueCommenterCount: null,
          shareCount: null,
          fetchStatus: "review_required",
          fetchMessage:
            "Experimental Saga scraper captured likes/comments but could not verify unique commenters.",
          fetchedAt: new Date(),
          sourceType: "experimental_fallback",
          commentCountBasis: "total",
          rawPayloadJson: null
        };
      } catch (error) {
        return {
          platform: "saga",
          canonicalPostId: null,
          canonicalPostUrl: url,
          likeCount: null,
          commentCount: null,
          uniqueCommenterCount: null,
          shareCount: null,
          fetchStatus: "transient_error",
          fetchMessage: error instanceof Error ? error.message : "Saga fallback scraper failed.",
          fetchedAt: new Date(),
          sourceType: "experimental_fallback",
          commentCountBasis: "unknown",
          rawPayloadJson: null
        };
      }
    }

    return {
      platform: "saga",
      canonicalPostId: null,
      canonicalPostUrl: url,
      likeCount: null,
      commentCount: null,
      uniqueCommenterCount: null,
      shareCount: null,
      fetchStatus: "review_required",
      fetchMessage:
        "No Saga metrics API is configured. Provide SAGA_METRICS_API_URL and SAGA_METRICS_API_KEY or enable the experimental Saga scraper.",
      fetchedAt: new Date(),
      sourceType: "internal_api",
      commentCountBasis: "unknown",
      rawPayloadJson: null
    };
  }
};
