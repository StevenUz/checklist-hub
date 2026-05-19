# ChecklistHub Agent Instructions

## Product Context

ChecklistHub is a full-stack, multi-platform app for discovering, using, customizing, and managing checklist templates for repeatable real-world workflows such as scuba diving, drone pre-flight preparation, travel, event organization, maintenance, and safety routines.


## Monorepo Structure

- Workspace `checklist-web/`: Next.js web app, backend APIs, Server Actions, admin UI, and full product functionality.
- Workspace `checklist-mobile/`: Expo / React Native client focused on core end-user flows.
- `checklist-shared/`: shared TypeScript types, DTOs, validation schemas, and cross-platform contracts when needed.
- Root `package.json`: npm workspaces and shared scripts.

Folder conventions:

- Web code should be organized into app routes, API handlers, Server Actions, services, DB schema/migrations, reusable components, utilities, and validation.
- Mobile code should be organized into Expo Router screens, reusable components, API/client modules, hooks, constants, and local utilities.
- Shared cross-platform types, DTOs, and validation schemas belong in `checklist-shared/`, not duplicated separately in web and mobile.

## Architecture

- Use a client-server architecture.
- The Next.js app owns the backend, Web UI, REST API endpoints, Server Actions, database access, and admin screens.
- The Expo app communicates with the Next.js backend through RESTful API endpoints.
- Put reusable business logic in service modules, not directly in pages, components, Server Actions, or route handlers.
- Keep validation, DTOs, and shared API contracts reusable between web and mobile when practical.

## Domain Model

Core concepts:

- `Category`: broad group such as Diving, Drone Operations, Travel, Safety, Home Maintenance, Events.
- `Activity`: specific activity within a category, such as Scuba Diving Pre-Dive Check or Drone Pre-Flight Checklist.
- `Checklist Template`: official reusable checklist managed by admins.
- `Template Section / Tab`: logical group of template items.
- `Template Item`: single official task or verification step.
- `User Checklist`: personal checklist instance copied from a template and owned by a user.
- `User Checklist Section / Item`: personal editable copy with completion state.
- `Suggestion`: user proposal for a new activity/template or improvement to an existing template.
- `Template Variant`: official variant for the same activity, such as Beginner, Advanced, or Cold Water.

Recommended database tables include `users`, `categories`, `activities`, `checklist_templates`, `template_sections`, `template_items`, `user_checklists`, `user_checklist_sections`, `user_checklist_items`, `suggestions`, `suggestion_comments`, and optionally `template_versions`.

## Roles And Permissions

- Visitor: can view the public site, see sample categories or public previews if enabled, and register.
- User: can authenticate, manage own profile, browse official templates, create and customize own checklist copies, complete items, and submit suggestions.
- Contributor: optional trusted user role for more structured proposals and suggestion status visibility.
- Admin: can manage users, roles, categories, activities, official templates, versions/variants, suggestions, comments, and moderation.

Protect all private pages, API endpoints, Server Actions, and admin functionality. Regular users may modify only their own checklists and suggestions. Only admins may modify official templates or approve/reject suggestions.

## Implementation Rules

- Use TypeScript throughout.
- Use Drizzle ORM and Drizzle Kit migrations for every database schema change.
- Use Neon serverless PostgreSQL for production database assumptions.
- Use server-side pagination for large lists: templates, checklists, suggestions, comments, users, and admin tables.
- Keep business logic in services, not directly in pages, UI components, route handlers, or API clients.
- Protect all private routes, private API endpoints, Server Actions, and admin functionality with authorization checks.
- Do not add AI functionality inside the product itself.
- Keep large screens split into small components; avoid monolithic pages.
- Prefer reusable UI components for cards, forms, buttons, badges, progress bars, tabs, dialogs, pagination, empty states, and loading states.
- Use modern responsive design for desktop, mobile browsers, smartphones, and tablets.
- Use icons, visual cues, and progress indicators where they improve scanning.
- Optional media such as template images, avatars, photos, or documents should be designed so object storage such as Cloudflare R2 can be used later.

## API Expectations

The mobile app should rely on REST endpoints from the web app. Expected baseline endpoints:

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

Use JWT-based sessions. The web app should use HTTP-only cookies; mobile API calls should use Bearer tokens.
