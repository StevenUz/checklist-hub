<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ChecklistHub Web Instructions

## Scope

`checklist-web` is the primary app. It owns the complete ChecklistHub product: public pages, authentication, official templates, personal checklists, suggestions, admin management, REST APIs for mobile, Server Actions for web flows, and database integration.

ChecklistHub helps users discover official checklist templates, start personal checklist copies, customize their own copies, mark items complete, track progress, and submit suggestions. Admins manage categories, activities, official templates, users, roles, variants, and suggestions.

Do not add AI-powered product features. AI is only a development aid.

## Stack

- Next.js + React + TypeScript.
- Tailwind for Web UI.
- PostgreSQL via Neon.
- Drizzle ORM for schema and database access.
- Drizzle Kit migrations for every schema change.
- JWT sessions: HTTP-only cookies for Web, Bearer tokens for mobile REST clients.

## Architecture Rules

- **Service layer**: Implement app business logic, used by the RESTful API and Server Actions.
- Use **modular design**: split the app into self-contained components, to avoid complex files with too much code.
- **Auth**: JWT tokens + bcrypt.
- **Database**: Neon DB + Drizzle ORM.

- Use Server Components by default unless browser interaction is required.
- Keep business logic in `src/services/` modules such as `authService`, `templateService`, `checklistService`, `suggestionService`, and `adminService`.
- Server Actions should orchestrate validation, authorization, and service calls; do not bury business rules in page components.
- REST route handlers under `src/app/api/` should validate input, authorize, call services, and return DTOs.
- Keep DB schema, connection, seed logic, and migrations in dedicated DB folders.
- Put shared DTOs and validation schemas in `checklist-shared/` when they are consumed by mobile too.

## Folder Structure Conventions

- App Router pages, layouts, route groups, and API routes belong under the app route tree.
- REST endpoints for mobile belong under `app/api/` or `src/app/api/`, depending on the current project layout.
- Server Actions belong in a dedicated actions folder such as `src/actions/`.
- Business logic belongs in a dedicated services folder such as `src/services/`.
- Drizzle schema, database client, seed scripts, and migration-related files belong in dedicated DB folders such as `src/db/` and `src/drizzle/`.
- Reusable UI belongs in a components folder such as `src/components/`.
- Shared DTOs and validation schemas used by mobile belong in `checklist-shared/`.

## Required Rules

- Use Drizzle migrations for every DB schema change.
- Keep business logic in services, not directly in pages, components, Server Actions, or route handlers.
- Protect all private routes, private API endpoints, Server Actions, and admin functionality.
- Implement server-side paging for all large lists.
- Avoid AI functionality inside the product itself.

## Required Web Areas

Implement and preserve routes around this baseline scope:

- `/`: public home page with product purpose and calls to action.
- `/login` and `/register`: authentication.
- `/templates`: official template browsing with search, filters, and paging.
- `/templates/[id]`: template detail with sections/items and start-checklist action.
- `/dashboard`: active and recent personal checklists.
- `/checklists`: user checklist list with paging and filters.
- `/checklists/[id]`: execute/check a personal checklist with progress and editable item state.
- `/checklists/[id]/edit`: edit personal checklist structure, sections/tabs, and items.
- `/suggestions/new`: submit new activity/template/improvement suggestion.
- `/suggestions`: user suggestion history and status.
- `/admin`: admin dashboard.
- `/admin/templates`, `/admin/templates/[id]/edit`: official template management.
- `/admin/suggestions`: suggestion review queue.
- `/admin/users`: user and role management.
- `/admin/categories`: category and activity management.

## API Contract For Mobile

Maintain REST endpoints for mobile clients:

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

All list endpoints should support server-side paging. Template endpoints should support category, activity, keyword, popularity/latest, and status filtering where appropriate.

## Domain And Data Rules

- Official templates are read-only for regular users.
- Users can customize only their own user checklist copies.
- Admins can create, edit, version, variant, publish, archive, or reject official templates and suggestions.
- Suggestions can be accepted, rejected, or returned for clarification.
- Track ownership and authorization carefully for every mutation.
- Recommended indexes: `users.email` unique; template category/activity/status; template section/item parent IDs; user checklist owner; checklist item completion; suggestion status/user/template.

## UI Rules

- Use clean, modern, responsive layouts for desktop and mobile browsers.
- Build reusable cards, forms, buttons, badges, progress bars, tabs, dialogs, pagination controls, loading states, and empty states.
- Show progress clearly on checklist execution screens.
- Split large pages into focused components.
- Protect admin UI visually and server-side; hiding links is not authorization.
- Use server-rendered components in Next.js and App Router.
- Use server-side rendering, only use client components  for browser interaction and forms.
