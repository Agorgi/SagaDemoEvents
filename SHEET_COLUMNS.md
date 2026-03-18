# Google Sheet Columns

The sync job expects one row per contest entry.

## Required columns

- `entry_id`
- `creator_name`
- `public_display_name`
- `eligibility_status`
- `created_at`

## Scoreable URL columns

- `saga_post_url`
- `instagram_post_url`
- `tiktok_post_url`

These are the direct post URLs used for scoring. Handles alone are never used to guess a scoreable post.

## Recommended columns

- `entry_title`
- `content_type`
- `saga_handle`
- `instagram_handle`
- `tiktok_handle`
- `profile_image_url`
- `thumbnail_url`

## Supported aliases

Column names are matched case-insensitively and punctuation-insensitively.

- `entry_id`: `entry id`, `id`, `submission_id`, `external_entry_id`
- `creator_name`: `creator name`, `name`
- `public_display_name`: `public display name`, `display_name`, `display name`
- `profile_image_url`: `profile image url`, `avatar_url`, `avatar url`
- `thumbnail_url`: `thumbnail url`, `entry_thumbnail_url`, `entry thumbnail url`
- `saga_handle`: `saga handle`
- `instagram_handle`: `instagram handle`, `ig_handle`
- `tiktok_handle`: `tiktok handle`
- `saga_post_url`: `saga post url`, `saga_url`, `saga url`
- `instagram_post_url`: `instagram post url`, `instagram_url`, `instagram url`
- `tiktok_post_url`: `tiktok post url`, `tiktok_url`, `tiktok url`
- `entry_title`: `entry title`, `title`
- `content_type`: `content type`, `category`, `format`
- `eligibility_status`: `eligibility status`, `status`
- `created_at`: `created at`, `timestamp`, `submitted_at`, `submitted at`

## Important rules

- Direct post URLs are required for scoring.
- If a row contains handles but no direct post URL, the entry is synced, marked for review, and remains publicly unranked.
- A creator can appear multiple times if they submitted multiple entries.
- The raw sheet is never sent to the browser.
