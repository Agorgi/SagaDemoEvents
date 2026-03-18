# Admin Guide

## Routes

- `/admin/login`
- `/admin`
- `/admin/entries/[id]`

## Login

Use:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Admin routes are protected by middleware and a signed session cookie.

## Dashboard

The dashboard shows:

- total entries
- eligible entries
- ranked entries
- awaiting-verification entries
- entries with fetch failures
- stale verified entries
- last successful sync
- last cron run
- current Top 25 count
- review queue items

## Review queue

Use the review queue when:

- a direct post URL is missing
- a platform requires authorization
- a post is private or unsupported
- a platform returns partial data that still needs operator review
- a platform fetch failed transiently and should be retried

Recommended flow:

1. Open the entry.
2. Check the normalized URLs and eligibility.
3. Retry the fetch if the issue looks temporary.
4. Add a manual override if the official integration cannot provide verified scoring fields.

## Entry detail page

Each entry detail page shows:

- normalized entry data
- all provided post URLs
- latest platform metrics
- fetch status by platform
- recent metric history
- final score breakdown
- manual override form

## Manual overrides

Manual overrides are entered per platform.

Rules:

- the override supersedes fetched platform values
- the override is stored in `AdminOverride`
- `PlatformMetricsLatest` is updated with `source_type = manual_override`
- an audit log row is written
- the entry is recomputed immediately after the override

If an override is partial, the entry can still remain in `awaiting_verification` until all required verified fields are present.

## Public visibility

The entry detail page lets operators hide or restore an entry publicly.

This is useful for:

- moderation holds
- eligibility disputes
- entries that should not appear yet even though they were synced
