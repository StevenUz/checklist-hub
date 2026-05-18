# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code.

# ChecklistHub Mobile Instructions

## Scope

`checklist-mobile` is the Expo / React Native client for the most important end-user ChecklistHub flows. Keep it focused and ergonomic rather than trying to reproduce the full admin-heavy web app.

The mobile app should support login/register, browsing official templates, viewing template details, starting personal checklists, checking items, tracking progress, optionally adding personal checklist items, and submitting suggestions.

Do not add AI-powered product features. AI is only a development aid.

## Stack

- Expo SDK 55 + React Native + TypeScript.
- Expo Router for navigation.
- REST API calls to the Next.js backend in `checklist-web`.
- Bearer-token authentication for API calls.
- Shared DTOs and validation schemas should come from `checklist-shared/` when practical.

## Folder Structure Conventions

- Expo Router screens and layouts belong under `src/app/`.
- Reusable mobile UI belongs under `src/components/`.
- API client code should live in a dedicated API/client module folder when added.
- Reusable hooks belong under `src/hooks/`.
- Theme tokens, constants, and app configuration helpers belong under `src/constants/`.
- Shared DTOs and validation schemas used by both clients belong in `checklist-shared/`, not duplicated in mobile.

## Mobile Screens

Keep at least these focused screens available as the product evolves:

- Home: welcome screen and navigation to login/register.
- Login / Register: authenticate with the REST API.
- Templates: browse official templates with paging.
- Template Details: view template sections/items and start a personal checklist.
- My Checklists: list active personal checklists.
- Checklist Details: check items, view progress, and optionally add personal items.
- New Suggestion: submit a suggestion to admins.

## API Contract

Use the web app REST API as the source of truth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/templates`
- `GET /api/templates/[id]`
- `GET /api/checklists`
- `POST /api/checklists`
- `GET /api/checklists/[id]`
- `POST /api/checklists/[id]/items/[itemId]/toggle`
- `POST /api/checklists/[id]/items`
- `POST /api/suggestions`
- `GET /api/docs`

Store and send auth tokens as Bearer tokens. Do not assume web HTTP-only cookies are available in the mobile client.

## Mobile Implementation Rules

- Keep mobile business logic thin; backend services in `checklist-web` own the rules.
- API modules should map server DTOs into mobile state without duplicating backend logic.
- Handle loading, empty, offline/error, and unauthorized states on every API-backed screen.
- Use pagination for template, checklist, and suggestion lists.
- For any DB schema change required by mobile work, update the backend Drizzle schema and create a Drizzle migration in `checklist-web`; never invent a mobile-only schema.
- Keep business logic in backend services, not directly in mobile screens or API route handlers.
- Protect private mobile screens with auth checks and rely on protected backend endpoints for authorization.
- Users may modify only their own personal checklist instances and suggestions.
- Official templates are read-only in mobile.
- Admin-only functionality belongs in the web app unless explicitly requested.
- Avoid AI functionality inside the product itself.

## UI Rules

- Optimize for smartphones first, then tablets.
- Use clear progress indicators on checklist execution screens.
- Use reusable mobile components for buttons, cards, status badges, forms, tabs, progress bars, and empty states.
- Keep navigation shallow and predictable.
- Prefer platform-friendly controls and Expo/React Native conventions over web-only patterns.
