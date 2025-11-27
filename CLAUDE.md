# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Router v7 full-stack application using Supabase for authentication and database, Prisma as the ORM, and Tailwind CSS for styling. The application is a note-taking app that demonstrates authentication flows (email/password and magic links) and CRUD operations.

**Deployment**: This stack is configured for deployment on [Vercel](https://vercel.com) with zero-config setup. Node.js 22.x is required (Vercel requirement as of November 2025).

## Working with Claude Code

### Scratchpads

When working on complex tasks or planning, **always use the `.scratchpads/` directory** for temporary notes, planning documents, and work-in-progress files. This directory is gitignored and provides a clean space for:

-   Migration plans and strategies
-   Implementation notes and TODOs
-   Research and exploration findings
-   Draft documentation before finalizing

Create files in `.scratchpads/` with descriptive names like `.scratchpads/issue-11-playwright-migration.md`.

## Essential Commands

### Development

```bash
npm run dev                    # Start development server at http://localhost:3000
npm run setup                  # Initial setup: install deps, init Claude, reset DB
npm run build                  # Build production app (runs build:*)
npm run start                  # Start production server
```

### Database

```bash
npm run db:reset               # Reset both Supabase and Prisma databases
npm run db:reset:supabase      # Reset Supabase database using local CLI
npm run db:reset:prisma        # Pull schema from Supabase and regenerate Prisma client
npm run db:seed                # Seed database with test data
npm run db:prepare-migration   # Create new Prisma migration (doesn't apply it)
npm run db:deploy-migration    # Apply migrations to database
```

**Important**: Always run `db:prepare-migration` first to create the migration, review it in `app/database/migrations/`, then run `db:deploy-migration` to apply it.

### Testing

```bash
npm test                       # Run Vitest unit tests in watch mode
npm run test:cov               # Run tests with coverage report
npm run test:e2e:dev           # Open Playwright UI for interactive E2E testing
npm run test:e2e:run           # Run Playwright tests headlessly (runs build first)
npm run validate               # Run all checks: tests, lint, typecheck, e2e
```

### Code Quality

```bash
npm run typecheck              # TypeScript type checking
npm run lint                   # ESLint (with cache)
npm run format                 # Format all files with Prettier
```

## Architecture

### Module-Based Organization

The codebase uses a domain-driven structure in `app/modules/`:

-   **auth**: Authentication logic, session management, and auth components
-   **note**: Note CRUD operations and services
-   **user**: User service layer

Each module typically contains:

-   `service.server.ts`: Server-side business logic
-   `index.ts`: Public API exports
-   `types.ts`: TypeScript type definitions
-   `components/`: Module-specific React components

### Authentication & Session Management

**Session Flow** ([app/modules/auth/session.server.ts](app/modules/auth/session.server.ts)):

-   Cookie-based sessions with 7-day expiration
-   Access tokens automatically refresh 10 minutes before expiration (`REFRESH_ACCESS_TOKEN_THRESHOLD`)
-   `requireAuthSession()`: Primary auth guard for protected routes
    -   Use `verify: true` for critical operations to validate token with Supabase
    -   Use `verify: false` (default) for performance on non-critical routes
-   Session refresh happens automatically on GET requests via redirect
-   For POST/action requests, `refreshAuthSession()` returns new session (must manually commit)

**Supabase Integration** ([app/integrations/supabase/](app/integrations/supabase/)):

-   `getSupabaseAdmin()`: Admin client for server-side operations (uses `SUPABASE_SERVICE_ROLE_KEY`)
-   `supabaseClient`: Anonymous client for public operations (uses `SUPABASE_ANON_KEY`)
-   **Never use admin client in browser context** - check enforced in code

**Auth Methods**:

-   Email/password authentication
-   Magic link (passwordless) login
-   Password reset flow

### Database Architecture

**Dual Database Setup**:

-   **Supabase**: PostgreSQL database for auth and storage (remote or local via CLI)
-   **Prisma**: ORM layer for type-safe database queries

**Schema Management**:

This project uses **Supabase migrations** (SQL files) as the source of truth. Prisma schema is auto-generated from the database.

**Workflow**:

1. Create new migration: `npx supabase migration new <feature_name>`
2. Write SQL migration in `supabase/migrations/TIMESTAMP_feature_name.sql`
3. Run `npm run db:reset` which:
    - Applies migrations via `supabase db reset`
    - Auto-generates Prisma schema via `prisma db pull`
    - Regenerates Prisma client via `prisma generate`
    - Seeds database with test data

**Production Deployment**:

-   Migrations are automatically deployed via GitHub Actions (`.github/workflows/deploy.yml`)
-   The "🗃️ Push Database Migrations" step in the deploy workflow handles this
-   No manual `supabase db push` needed - it's automated in CI/CD

**Important**:

-   Prisma schema is auto-generated - don't manually edit `app/database/schema.prisma`
-   **RLS (Row Level Security)** is enabled on all user-facing tables for defense-in-depth security
    -   RLS policies in [supabase/migrations/20251126002639_rls.sql](supabase/migrations/20251126002639_rls.sql)
    -   Users can only access their own data at the database level
    -   Application code also enforces authorization checks
    -   This dual-layer approach protects against bugs, SQL injection, and direct database access

**When to use Supabase SDK vs Prisma**:

-   **Use Prisma (default)**: For server-side data operations in loaders/actions
    -   Direct PostgreSQL connection for best performance
    -   Type-safe queries with auto-generated types from schema
    -   Still protected by RLS policies
    -   Examples: CRUD operations in [app/modules/note/service.server.ts](app/modules/note/service.server.ts)
-   **Use Supabase SDK**: For client-side operations or auth-specific functionality
    -   Client-side data fetching without server round-trip
    -   Real-time subscriptions (live data updates)
    -   Storage API (file uploads/downloads)
    -   Auth-specific operations (password reset, magic links, OAuth)
    -   Examples: Password reset in [app/routes/reset-password.tsx](app/routes/reset-password.tsx)

Available Supabase clients in [app/integrations/supabase/client.ts](app/integrations/supabase/client.ts):

-   `supabaseClient`: Anonymous client for public/client-side operations
-   `getSupabaseAdmin()`: Admin client for server-side privileged operations (never use in browser)

### Routing & File Conventions

React Router v7 file-based routing in `app/routes/`:

-   `_index.tsx`: Landing page
-   `notes.tsx`: Layout route for notes
-   `notes._index.tsx`: Notes list (nested under notes layout)
-   `notes.$noteId.tsx`: Individual note view (dynamic segment)
-   `notes.new.tsx`: Create new note
-   `oauth.callback.tsx`: OAuth/magic link callback handler

### Internationalization (i18n)

-   Uses `react-router-i18next` and `react-i18next`
-   Configuration in `app/integrations/i18n/`
-   Locale detection and language switching built-in
-   Translation files should be in `public/locales/`

### Environment Variables

Required environment variables (see `.env.example`):

-   `DATABASE_URL`: PostgreSQL connection string
-   `SUPABASE_URL`: Your Supabase project URL
-   `SUPABASE_ANON_KEY`: Anonymous public key
-   `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only)
-   `SUPABASE_JWT_SECRET`: Random secret for session encryption (same as Supabase JWT secret)
-   `SERVER_URL`: Your app's URL (for email callbacks) - optional on Vercel (uses VERCEL_URL)

**Token Lifetime Note**: Default JWT expiry is 3600s (1 hour). If your Supabase project uses shorter token lifetimes, adjust `REFRESH_ACCESS_TOKEN_THRESHOLD` in [app/modules/auth/session.server.ts:19](app/modules/auth/session.server.ts#L19).

### Local Development with Supabase

The project supports Supabase CLI for local development:

-   Supabase runs on ports 54321-54329 (see `supabase/config.toml`)
-   Studio UI: http://localhost:54323
-   Email testing (Inbucket): http://localhost:54324
-   Local auth configured for `http://127.0.0.1:3000`

### Path Aliases

TypeScript path alias `~/*` maps to `app/*` (configured in `tsconfig.json`).

Example: `import { requireAuthSession } from "~/modules/auth"`

### Test Seeded Data

After running `npm run db:seed`, test account is available:

-   Email: `hello@supabase.com`
-   Password: `supabase`

### Testing Setup

**Vitest** (unit tests):

-   Config: `vitest.config.ts`
-   Setup file: `test/unit/setup-test-env.ts`
-   Environment: happy-dom
-   Coverage reports in HTML, JSON, and text

**Playwright** (E2E tests):

-   Test files: `test/e2e/*.spec.ts`
-   Config: `playwright.config.ts`
-   TypeScript config: `test/tsconfig.json`
-   Uses `page.getByTestId()`, `page.getByRole()`, etc. for element selection
-   Custom fixtures in `test/support/fixtures.ts` for user management
-   Test utilities: `test/support/create-user.ts` and `test/support/delete-user.ts`
-   Uses `data-test-id` attribute (configured in playwright.config.ts)
-   Requires `.env` to be configured
-   Run dev server concurrently during development testing

**Test Directory Structure**:

```
test/
├── unit/           # Vitest unit test setup
├── e2e/            # Playwright E2E tests
└── support/        # Shared test utilities and fixtures
```

### CSS/Styling

-   Tailwind CSS with custom configuration
-   Additional plugins: `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwind-scrollbar`
-   Global styles: `app/styles/tailwind.css`
-   Use `tailwind-merge` for conditional class composition

## Deployment

### Vercel Deployment

This stack is optimized for [Vercel](https://vercel.com) deployment with zero configuration required.

**Prerequisites**:

-   Node.js 22.x (Vercel requirement)
-   Vercel account
-   Supabase project with credentials

**Environment Variables for Vercel**:

**Recommended: Use the Supabase Integration** from Vercel Marketplace which automatically configures `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

Then manually add these in Vercel project settings (Settings → Environment Variables):

```
DATABASE_URL=postgres://postgres:{PASSWORD}@db.{INSTANCE}.supabase.co:5432/postgres
SUPABASE_JWT_SECRET={GENERATE_RANDOM_SECRET}
SERVER_URL=https://your-app.vercel.app
```

Or manually configure all variables:

```
DATABASE_URL=postgres://postgres:{PASSWORD}@db.{INSTANCE}.supabase.co:5432/postgres
SUPABASE_URL=https://{YOUR_INSTANCE_NAME}.supabase.co
SUPABASE_ANON_KEY={ANON_PUBLIC_KEY}
SUPABASE_SERVICE_ROLE_KEY={SERVICE_ROLE_KEY}
SUPABASE_JWT_SECRET={GENERATE_RANDOM_SECRET}
SERVER_URL=https://your-app.vercel.app
```

**Important Notes**:

-   `SERVER_URL` must be set to your Vercel deployment URL (not localhost)
-   Update Supabase Authentication → URL Configuration with your Vercel URLs:
    -   `https://your-app.vercel.app/oauth/callback`
    -   `https://your-app.vercel.app/reset-password`
-   Vercel automatically runs `npm run build` on each deployment
-   Database migrations should be run before deploying new code that depends on schema changes

**Deployment Flow**:

1. Push to `main` branch triggers automatic production deployment
2. Pull requests get preview deployments with unique URLs
3. Environment variables can be set differently for Preview vs Production environments
