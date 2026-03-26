# Saga Demo

Saga is a mobile-first demo for fandom discovery, creator work, demand-first launches, and creator profiles.

The app is intentionally frontend-only. Product behavior is driven by seeded mock data, shared React state, and `localStorage` persistence so flows feel real without a backend.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Local mock state via `src/lib/app-state.tsx`

## Product shell

The main product shell is intentionally small:

- `Home` -> `/explore`
- `Work` -> `/work`
- `Launch` -> `/studio`
- `Plans` -> `/my-events`
- `Profile` -> `/profile`

Top-level route helpers live in `src/lib/routes.ts` so shared navigation, onboarding routing, and redirects stay aligned.

## Primary routes

- `/`
  - Entry redirect
  - Sends first-run users to onboarding
  - Sends returning users to the right part of the app
- `/onboarding`
  - Phone-first onboarding gate
  - Config-driven adaptive wizard with Explorer / Talent / Organizer / Business branches
- `/explore`
  - Main nights feed
  - Supports `All`, `Happening`, and `Soft launch` filtering
- `/events/[eventId]`
  - Confirmed event detail
  - Poster-first consumer layout
- `/campaigns/[id]`
  - Soft launch detail
  - Reserve-first flow with date selection
- `/studio`
  - Launch home
  - New event entry point plus launch management
- `/studio/new`
  - Adaptive launch wizard
- `/studio/[id]`
  - Launch workspace / management
- `/studio/review/[draftId]`
  - Draft review page before publish
- `/work`
  - `Roles` and `Venues` browsing
- `/opportunities/[opportunityId]`
  - Role detail page
- `/businesses/[businessId]`
  - Venue / business detail page
- `/my-events`
  - Plans hub for `Going`, `Pledged`, `Saved`, and `Applied`
- `/inbox`
  - Updates feed
- `/profile`
  - Private self-profile
  - Earnings, portfolio, saved items, and service management
- `/profiles/[userId]`
  - Public creator profile
- `/profile/services/new`
  - Guided service creation flow

## State and data model

### Shared app state

- `src/lib/app-state.tsx`
  - central client state for onboarding, launches, plans, profile services, work applications, and business support actions
  - persists demo state to `localStorage`
  - intentionally owns cross-surface behavior so the rest of the app can stay route-focused

### Seed data

- `src/data/demo.ts`
  - confirmed events, users, event roles
- `src/data/launches.ts`
  - launches, campaign lifecycles, inbox items
- `src/data/launch-builder.ts`
  - adaptive launch-wizard questions and draft helpers
- `src/data/onboarding.ts`
  - onboarding schema, branching, landing logic
- `src/data/economy.ts`
  - work opportunities, businesses, listings, support intents
- `src/data/creator-profiles.ts`
  - private/public profile content and shared services

## Key UI patterns

- Image-first cards
  - `EventCard`, `CampaignCard`, `OpportunityCard`, and `VenueCard` share the same overall hierarchy: artwork, status, title, one metadata line, one context line, one primary action.
- Guided creation flows
  - onboarding, launch creation, and service creation are all one-question-per-screen flows using the same visual system.
- Shared route ownership
  - Home = browse
  - Work = roles and venue fits
  - Launch = create/manage
  - Plans = commitments
  - Profile = identity

## Engineering notes

- Use `src/lib/routes.ts` for shell-level destinations instead of scattering new route strings.
- Add new demo behavior through `app-state` selectors/actions first, then wire pages/components to that shared behavior.
- Keep heavy detail off feed cards. Put full explanations on detail routes.
- Preserve backward compatibility where possible:
  - `/discover` redirects to `/explore`
  - `/saved` redirects to `/my-events?tab=saved`
  - legacy host routes redirect into `/studio`

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes

- The repo still contains a few legacy demo routes outside the main Saga shell, but the current product story is driven by `/onboarding`, `/explore`, `/work`, `/studio`, `/my-events`, `/profile`, and the matching public detail routes.
- Core demo media is bundled locally under `public/` and shared through the seeded data files above.
