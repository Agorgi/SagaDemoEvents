# Deploying to Vercel

## 1. Provision Postgres

Create a PostgreSQL database and set `DATABASE_URL`.

## 2. Import the repo into Vercel

1. Push the repo to GitHub.
2. Import it into Vercel as a `Next.js` project.
3. Keep the repo root as the project root.

## 3. Add environment variables

Copy the variables from [.env.example](/Users/alexgorgi/Documents/Playground/.env.example).

Required backend envs:

- `DATABASE_URL`
- `CRON_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- either:
  - `GOOGLE_SHEET_ID`
  - `GOOGLE_SHEET_RANGE`
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
- or:
  - `GOOGLE_SHEET_CSV_URL`
- optional with CSV fallback:
  - `GOOGLE_SHEET_GID`

Public config:

- `NEXT_PUBLIC_SUBMISSION_FORM_URL`
- `NEXT_PUBLIC_EVENT_DETAILS_URL`
- `NEXT_PUBLIC_BUY_TICKETS_URL`
- `NEXT_PUBLIC_SUPPORT_INSTAGRAM_URL`
- `NEXT_PUBLIC_RULES_URL`
- `NEXT_PUBLIC_PRIVACY_URL`
- `TOP_POOL_SIZE`
- `WINNER_COUNT`

Optional platform automation:

- Saga
  - `SAGA_METRICS_API_URL`
  - `SAGA_METRICS_API_KEY`
  - `ALLOW_SAGA_PUBLIC_SCRAPER=true` only if you intentionally want the experimental fallback
- Meta / Instagram
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_ACCESS_TOKEN`
- TikTok
  - `TIKTOK_CLIENT_KEY`
  - `TIKTOK_CLIENT_SECRET`
  - `TIKTOK_REDIRECT_URI`
  - `TIKTOK_ACCESS_TOKEN`

## 4. Build settings

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave blank

`postinstall` already runs `prisma generate`.

## 5. Push the schema

Before the first live sync:

```bash
npm run db:push
```

## 6. Cron setup

[vercel.json](/Users/alexgorgi/Documents/Playground/vercel.json) configures two daily jobs:

- `/api/cron/sync-entries`
- `/api/cron/refresh-metrics`

Both routes require `CRON_SECRET`.

## 7. First-run checklist

1. Confirm `/giveaway` loads.
2. Confirm `/admin/login` loads.
3. Sign into `/admin`.
4. Run `npm run sync:entries`.
5. Run `npm run refresh:metrics`.
6. Confirm `/api/giveaway` returns `dataSource: "database"`.
7. Confirm verified entries receive numeric ranks.
8. Confirm unresolved eligible entries render in `Awaiting verification`.
9. Confirm review-required items appear in the admin queue.

## 8. Launch checks

1. Confirm no private sheet columns are exposed via `/api/giveaway`.
2. Confirm ineligible or hidden entries do not render publicly.
3. Confirm Top 25 entries are highlighted.
4. Confirm admin routes require login.
5. Confirm manual overrides immediately change public verification state after recompute.
