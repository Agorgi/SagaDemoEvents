# Saga Demo

Saga is a mobile-first demo for creator-led fandom events.

The product is organized around three clear paths:

- `Host something`
- `Join a team`
- `Go to events`

The demo uses local mock data, React state, and `localStorage` so the product feels stateful without a backend.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS

## Primary routes

- `/`
  - Welcome screen for first-time users
  - Redirects returning users based on their saved mode
- `/onboarding`
  - Short, mode-aware onboarding flow
- `/explore`
  - Mode-aware event discovery
- `/events/[eventId]`
  - Public event page with mode-aware CTA hierarchy
- `/my-events`
  - Going, Working, Saved, Tickets
- `/studio`
  - Host home for launches in progress
- `/studio/new`
  - Structured launch builder
- `/studio/[id]`
  - Launch workspace with `Overview`, `Team`, `Demand`, `Run of Show`, and `Payouts`
- `/profile/setup`
  - First-time creator profile setup
- `/creators/[slug]`
  - Creator trust profile for host review
- `/inbox`
  - Updates, Team, Tickets, Payments
- `/profile`
  - User hub for identity, upcoming events, working roles, and saved items

## Product model

### Visitor modes

- `fan`
  - discover events
  - get tickets or reserve spots
- `creator`
  - find openings
  - join teams
- `host`
  - start and manage launches

### Core demo behaviors

- onboarding choices persist in `localStorage`
- mode persists across sessions
- starting a launch adds it to Studio
- publishing a launch makes it discoverable in Explore
- joining a team updates role/application state
- booking an event updates ticket state and threshold progress
- completing a launch reveals payout views
- copying a launch to another city prefills the builder

## Suggested demo flow

### Fan flow

1. Open `/`
2. Choose `Go to events`
3. Complete onboarding
4. Browse `/explore`
5. Open an event
6. `Get ticket` or `Reserve spot`
7. Check status in `/my-events`

### Creator flow

1. Open `/`
2. Choose `Join a team`
3. Complete onboarding
4. Finish `/profile/setup`
5. Open `/explore?view=openings`
6. Open an event
7. `Join team`
8. Track status in `/my-events` and `/inbox`

### Host flow

1. Open `/`
2. Choose `Host something`
3. Complete onboarding
4. Land in `/studio`
5. Click `Start a launch`
6. Build a launch in `/studio/new`
7. Open the workspace in `/studio/[id]`
8. Publish, recruit a team, review payouts, or copy to another city

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
npm run build
```

## Notes

- This repo still contains some legacy routes for earlier demos, but the current product story is driven by `/`, `/onboarding`, `/explore`, `/events/[eventId]`, `/my-events`, and the `/studio` flow.
- All core demo media used by the event experience is bundled locally.
