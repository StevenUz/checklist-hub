# ChecklistHub Project Documentation

## Project Description

ChecklistHub is a full-stack checklist template platform for repeatable real-world workflows such as diving, drone operations, travel, safety routines, home maintenance, events, QA, and other procedure-heavy activities.

The product has three main user experiences:

- Visitors can view the public site, register, and log in.
- Authenticated users can browse official checklist templates, start personal checklist copies from templates, complete checklist items, edit their own checklist structure, export a checklist to PDF, and submit suggestions.
- Admins can manage users, categories, official templates, template sections/items, suggestions, and moderation workflows.

The main product idea is separation between official templates and user-owned checklist copies. Templates are reusable source material; user checklists are editable personal instances with their own completion state.

## Architecture

ChecklistHub is a monorepo with a Next.js web/backend app, an Expo mobile app, and a small shared TypeScript contract package.

```text
checklist-hub/
|-- checklist-web/       Next.js app, backend APIs, server actions, database access
|-- checklist-mobile/    Expo / React Native client
|-- checklist-shared/    Shared TypeScript DTOs and API contracts
|-- package.json         npm workspace root
`-- README.md
```

### Front End

The web front end is built with:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS utility classes
- Server Components for page data loading where appropriate
- Client Components for interactive checklist execution, editing, and PDF export

The mobile front end is built with:

- Expo
- React Native
- Expo Router
- TypeScript
- NativeWind / Tailwind-style classes
- REST API calls to the Next.js backend

### Back End

The backend lives inside `checklist-web`.

It uses:

- Next.js API Routes under `checklist-web/src/app/api`
- Server Actions under `checklist-web/src/actions`
- Service modules under `checklist-web/src/services`
- JWT-based authentication
- HTTP-only cookie sessions for web users
- Bearer tokens for mobile API clients
- bcrypt password hashing

Business logic is intentionally kept in service files so pages, API route handlers, and Server Actions stay thin.

### Database

The database layer uses:

- PostgreSQL
- Neon serverless PostgreSQL for production assumptions
- Drizzle ORM
- Drizzle Kit migrations

The schema is defined in:

```text
checklist-web/src/db/schema.ts
```

Database connection setup is in:

```text
checklist-web/src/db/index.ts
```

Required environment variables include:

```text
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

Do not commit real production secrets.

### API Model

The mobile app consumes REST endpoints exposed by `checklist-web`, including:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/templates`
- `GET /api/templates/[id]`
- `GET /api/checklists`
- `POST /api/checklists`
- `GET /api/checklists/[id]`
- `POST /api/checklists/[id]/items`
- `POST /api/checklists/[id]/items/[itemId]/toggle`
- `POST /api/suggestions`
- `GET /api/docs`

Shared DTOs live in:

```text
checklist-shared/src/index.ts
```

## Database Schema Design

The main schema is organized around official templates, personal user checklist copies, and user suggestions.

### Relationship Overview

```mermaid
erDiagram
  users ||--o{ checklist_templates : creates
  users ||--o{ user_checklists : owns
  users ||--o{ suggestions : submits
  users ||--o{ suggestion_comments : writes
  users ||--o{ template_ratings : rates
  users ||--o{ audit_logs : triggers

  categories ||--o{ activities : contains
  categories ||--o{ checklist_templates : groups
  activities ||--o{ checklist_templates : describes

  checklist_templates ||--o{ template_sections : has
  template_sections ||--o{ template_items : has

  checklist_templates ||--o{ checklist_templates : variants_or_versions
  checklist_templates ||--o{ user_checklists : copied_into
  checklist_templates ||--o{ suggestions : targeted_by
  checklist_templates ||--o{ template_ratings : receives

  user_checklists ||--o{ user_checklist_sections : has
  user_checklist_sections ||--o{ user_checklist_items : has

  template_sections ||--o{ user_checklist_sections : source_for
  template_items ||--o{ user_checklist_items : source_for

  suggestions ||--o{ suggestion_comments : has
```

### Main Tables

`users`

- Stores registered users.
- Important fields: `email`, `password_hash`, `name`, `avatar_url`, `role`.
- Roles currently include `user` and `admin`.

`categories`

- Broad topic groups such as Diving, Travel, Safety, Events, and Maintenance.
- Used to organize templates and activities.

`activities`

- Specific workflows inside a category.
- Examples: scuba pre-dive check, drone pre-flight check, trip preparation.

`checklist_templates`

- Official reusable checklist templates.
- Connected to a category, optionally to an activity, and to creator/updater users.
- Supports `draft`, `published`, and `archived` statuses.
- `parent_template_id` supports variants or version-like relationships.

`template_sections`

- Ordered sections/tabs inside an official template.
- Cascades when a template is deleted.

`template_items`

- Ordered official checklist items inside template sections.
- Stores text, optional description, required flag, and sort order.

`user_checklists`

- Personal checklist instances owned by users.
- Usually created from an official template.
- Stores personal title, description, status, start date, completion date, and progress source.

`user_checklist_sections`

- User-owned section copies.
- Can reference the source template section, but remains independently editable.

`user_checklist_items`

- User-owned item copies.
- Stores completion state in `is_completed` and `completed_at`.
- Can reference the source template item, but remains independently editable.

`suggestions`

- User proposals for new activities, new templates, template edits, or variants.
- Admins can review and mark suggestions as `pending`, `accepted`, `rejected`, or `implemented`.

`suggestion_comments`

- Discussion/comments attached to suggestions.

`template_ratings`

- One rating per user per template.
- Enforces rating values between 1 and 5.

`audit_logs`

- Generic event log table for actions taken by users.
- Stores action name, entity type/id, metadata, and timestamp.

## Local Development Setup

### Prerequisites

- Node.js compatible with the installed Next.js/Expo versions
- npm
- A PostgreSQL database connection string, preferably Neon for parity with the production assumption

### Install Dependencies

From the repo root:

```bash
npm install
```

This installs workspace dependencies for `checklist-web` and `checklist-mobile`.

### Configure Environment Variables

Create or update `checklist-web/.env`:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
JWT_SECRET=your-long-random-secret
```

Create or update `checklist-mobile/.env`:

```text
EXPO_PUBLIC_CHECKLISTHUB_API_URL=http://localhost:3000/api
```

The mobile config also checks Expo `extra.CHECKLISTHUB_API_URL`.

### Database Setup

Generate migrations after schema changes:

```bash
cd checklist-web
npm run db:generate
```

Apply migrations:

```bash
cd checklist-web
npm run db:migrate
```

Seed local data:

```bash
cd checklist-web
npm run db:seed
```

### Run The Web App

```bash
cd checklist-web
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

### Run The Mobile App

```bash
cd checklist-mobile
npm run dev
```

For web preview:

```bash
cd checklist-mobile
npm run web
```

### Build

Build the web app:

```bash
cd checklist-web
npm run build
```

Build the mobile web export:

```bash
cd checklist-mobile
npm run build
```

Build from the root workspace:

```bash
npm run build
```

## Key Folders And Files

### Root

`package.json`

- Defines the npm workspaces and root scripts.

`README.md`

- Short product overview and initial project notes.

`AGENTS.md`

- Repository-specific engineering instructions for coding agents.

`PROJECT_DOCUMENTATION.md`

- This documentation file.

### `checklist-web`

`checklist-web/src/app`

- Next.js App Router pages, layouts, and route handlers.
- Contains public pages, authenticated pages, admin pages, and API routes.

`checklist-web/src/app/api`

- REST API route handlers used by mobile and external clients.

`checklist-web/src/app/checklists`

- Web checklist list and checklist execution screens.
- `checklist-web/src/app/checklists/[id]/ChecklistClient.tsx` handles checklist detail interactions.
- `checklist-web/src/app/checklists/[id]/ChecklistSection.tsx` renders collapsible checklist sections and item toggles.

`checklist-web/src/app/admin`

- Admin UI for users, categories, templates, and suggestions.

`checklist-web/src/actions`

- Server Actions for web forms and mutations.
- Includes auth, checklist, suggestion, and admin actions.

`checklist-web/src/services`

- Business logic layer used by pages, API routes, and Server Actions.
- Important files include `checklistService.ts`, `templateService.ts`, `suggestionService.ts`, `authService.ts`, and `adminService.ts`.

`checklist-web/src/db`

- Database connection, schema, and seed data.
- `schema.ts` is the source of truth for Drizzle tables and relations.
- `seed.ts` populates initial categories/templates/items/users.

`checklist-web/src/lib`

- Auth/session helpers and API auth utilities.

`checklist-web/drizzle`

- Generated Drizzle migration files and metadata.

`checklist-web/drizzle.config.ts`

- Drizzle Kit configuration.

### `checklist-mobile`

`checklist-mobile/src/app`

- Expo Router screens.
- Includes home, auth, templates, checklists, and suggestions flows.

`checklist-mobile/src/app/checklists`

- Mobile checklist list/detail screens and mobile checklist section rendering.

`checklist-mobile/src/lib/api.ts`

- Mobile REST API client.

`checklist-mobile/src/lib/config.ts`

- Resolves the backend API base URL.

`checklist-mobile/src/lib/tokenStorage.ts`

- Stores and retrieves mobile auth tokens.

`checklist-mobile/src/auth/AuthContext.tsx`

- Mobile auth state provider.

`checklist-mobile/src/global.css`

- NativeWind/global styling entry point.

### `checklist-shared`

`checklist-shared/src/index.ts`

- Shared TypeScript DTOs for auth, templates, checklists, suggestions, pagination, and API responses.

## Authorization And Permissions

- Visitors can access public pages and register/login.
- Users can access their own checklists and suggestions.
- Users may only mutate their own user checklist records.
- Admin-only pages and actions are protected by role checks.
- Official templates and moderation flows are admin-owned.
- Web authentication uses HTTP-only cookies.
- Mobile authentication uses Bearer tokens.

## Development Guidelines

- Keep TypeScript throughout the codebase.
- Keep business logic in `services`, not directly inside UI pages or API handlers.
- Use Drizzle migrations for every schema change.
- Keep shared DTOs in `checklist-shared` when used by both web and mobile.
- Protect private pages, API routes, and Server Actions with auth checks.
- Use server-side pagination for large lists.
- Do not add AI functionality inside the product.
