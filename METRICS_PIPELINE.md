# Metrics Pipeline

## Overview

The pipeline has two cron-safe jobs:

1. `sync_entries`
2. `refresh_metrics`

Each run writes a `FetchRun` row for auditability.

## 1. Sync entries

Route:

- `/api/cron/sync-entries`

CLI:

```bash
npm run sync:entries
```

Behavior:

- reads the configured Google Sheet server-side
- validates and normalizes rows with Zod
- upserts one `ContestEntry` per row
- stores `source_row_number`
- flags rows that still need direct URLs
- recomputes public verification state and ranking after sync

## 2. Refresh metrics

Route:

- `/api/cron/refresh-metrics`

CLI:

```bash
npm run refresh:metrics
```

Behavior:

- iterates eligible entries
- fetches metrics per platform via adapters
- appends every fetch attempt to `MetricSnapshotHistory`
- updates `PlatformMetricsLatest` only when there is a new authoritative snapshot
- preserves the last verified platform snapshot when a fresh fetch fails
- recomputes verified scores, public ranks, and Top 25 flags

## Verification model

Public states:

- `ranked`
- `awaiting_verification`
- `hidden`

An entry becomes `ranked` only when:

- Saga metrics are verified, and
- every non-empty Instagram or TikTok URL has:
  - verified scoreable metrics, or
  - a manual admin override

If a platform URL is blank, that platform contributes `0` and does not block verification.

## Score formula

```text
leaderboard_score =
  (saga_likes * 20) +
  (saga_unique_comments * 20) +
  (instagram_likes) +
  (instagram_unique_comments) +
  (instagram_shares * 3) +
  (tiktok_likes) +
  (tiktok_unique_comments) +
  (tiktok_shares * 3)
```

## Platform automation

Files:

- [src/server/giveaway/metrics/adapters/saga.ts](/Users/alexgorgi/Documents/Playground/src/server/giveaway/metrics/adapters/saga.ts)
- [src/server/giveaway/metrics/adapters/instagram.ts](/Users/alexgorgi/Documents/Playground/src/server/giveaway/metrics/adapters/instagram.ts)
- [src/server/giveaway/metrics/adapters/tiktok.ts](/Users/alexgorgi/Documents/Playground/src/server/giveaway/metrics/adapters/tiktok.ts)

Rules:

- Saga is fully automated when the private Saga metrics API is configured.
- Instagram is official/API-first and best-effort.
- TikTok is official/API-first and best-effort.
- Unsupported or ambiguous social cases route to admin review.
- No guessed posts from handles.
- No brittle public scraping for Instagram or TikTok.

## Manual overrides

Manual overrides:

- supersede fetched values for the platform
- are stored in `AdminOverride`
- update the authoritative `PlatformMetricsLatest` row with `source_type = manual_override`
- immediately trigger a leaderboard recompute

## Public leaderboard behavior

- all eligible public entries are visible
- ranked entries show a numeric score and rank
- unresolved eligible entries render under `Awaiting verification`
- fetch errors and admin notes never appear publicly
- previously verified entries keep their last verified score if a fresh fetch fails
