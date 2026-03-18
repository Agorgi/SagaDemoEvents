# Google Sheet Schema

The app reads the sheet server-side, maps only public-safe fields, validates the mapped rows, and aggregates them into participant-level leaderboard entries.

## Supported source shapes

- One row per participant
- One row per submission

If a participant has multiple approved submissions in the current campaign, the app rolls them up into a single creator row and sums their engagement metrics.

## Identity priority

1. `participant_id`
2. `saga_profile_url` or `saga_user_id`
3. Normalized `display_name` + social handles

## Public-safe fields

These are the only fields that are mapped into the public API response:

- `campaign_slug`
- `participant_id`
- `display_name` / `public_display_name`
- `profile_image_url`
- `saga_profile_url`
- `instagram_url`
- `tiktok_url`
- `submission_title`
- `submission_url`
- `content_type`
- `thumbnail_url`
- `submitted_at`
- `eligibility_status`
- `bonus_points`
- `manual_adjustment`
- `engagement_score`
- `last_synced_at`
- Platform metrics for Saga / Instagram / TikTok:
  - likes
  - comments
  - shares
  - saves
  - views
- Optional combined metrics:
  - `likes`
  - `comments`
  - `shares`
  - `saves`
  - `views`

## Private fields that are intentionally ignored

Do not rely on the browser receiving these fields. They are not exposed even if they exist in the source sheet.

- email
- phone
- address
- notes
- internal comments
- moderation notes
- reviewer names
- payout information
- follower count
- any other unmapped columns

## Common header aliases

The mapper accepts common variations such as:

- `participant_id`, `participant id`, `creator_id`
- `public_display_name`, `display_name`, `name`
- `profile_image_url`, `avatar_url`, `profile picture url`
- `submission_title`, `title`
- `submission_url`, `post url`, `post link`
- `thumbnail_url`, `instagram_thumbnail_url`, `post_thumbnail_url`
- `eligibility_status`, `approval_status`, `status`
- `engagement_score`, `score`, `final score`
- `last_synced_at`, `updated_at`, `last updated`
- `instagram_handle`, `tiktok_handle`, `saga_user_id`
- `saga_likes`, `instagram_comments`, `tiktok_views`, etc.

## Eligibility handling

- `eligible` and `approved` count as raffle-eligible
- `pending_review` does not count toward the Top 25 raffle pool
- `ineligible` and `disqualified` are excluded from the Top 25 raffle pool

## Scoring logic

- If `engagement_score` is present, it is used as the source of truth for public points.
- Otherwise the app computes points from the configured values:
  - Saga post = 500
  - Saga likes = 200
  - Saga comments = 300
  - Social post = 200
  - Social likes = 2
  - Social comments = 25
  - Social reposts/shares = 15
- `bonus_points` and `manual_adjustment` are added on top.
- Follower count is never used.
- If only combined social metrics are present, the app uses the Instagram/TikTok fallback weights for those combined fields instead of double-counting platform-specific metrics.

## Social hashtag rule

- All Instagram and TikTok entries should include `#SagaCoSLA`.
- The public page surfaces this requirement as part of the contest rules.
