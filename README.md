# Court of Stars Giveaway

Launchable Court of Stars giveaway microsite with:

- a polished public `/giveaway` page
- an entry-level leaderboard backed by PostgreSQL
- Google Sheets ingestion for Google Form responses
- public CSV fallback for shared Google Drive sheets
- hybrid platform verification for scoring
- a private admin portal for retries, review, and manual overrides

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Google Sheets API
- Vercel cron

## Core model

- One Google Sheet row maps to one `ContestEntry`.
- One contest entry can include up to three direct post URLs:
  - `saga_post_url`
  - `instagram_post_url`
  - `tiktok_post_url`
- The leaderboard ranks entries, not creators.
- All eligible entries are visible publicly.
- Only entries with a verified score receive a numeric rank.
- Eligible unresolved entries render in an `Awaiting verification` section.

## Verification model

Public entry states:

- `ranked`
- `awaiting_verification`
- `hidden`

An entry is fully verified when:

- Saga metrics are fetched successfully, and
- every non-empty social URL has either:
  - verified metrics from an approved integration, or
  - a manual admin override

If a previously verified entry has a fresh fetch failure, the site keeps the last verified score live and only surfaces the issue in admin.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run db:generate
```

3. Fill `.env.local` using [.env.example](/Users/alexgorgi/Documents/Playground/.env.example).

4. Push the schema to your database:

```bash
npm run db:push
```

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000/giveaway](http://localhost:3000/giveaway).

## Operations

Sync sheet rows into Postgres:

```bash
npm run sync:entries
```

Refresh metrics and recompute ranking:

```bash
npm run refresh:metrics
```

Seed the review dataset into the database:

```bash
npm run seed:giveaway
```

Run the deterministic raffle utility after the contest closes:

```bash
npm run raffle -- --seed="COS-YYYY-MM" --winners=6
```

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Docs

- [DEPLOY.md](/Users/alexgorgi/Documents/Playground/DEPLOY.md)
- [SHEET_COLUMNS.md](/Users/alexgorgi/Documents/Playground/SHEET_COLUMNS.md)
- [METRICS_PIPELINE.md](/Users/alexgorgi/Documents/Playground/METRICS_PIPELINE.md)
- [ADMIN_GUIDE.md](/Users/alexgorgi/Documents/Playground/ADMIN_GUIDE.md)
