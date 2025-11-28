# React Router v7 Supa Vercel Stack

![React Router v7 Supa Vercel Stack](https://raw.githubusercontent.com/oreillyjw/supa-vercel-stack/refs/heads/main/public/built-site-image.png)

A modern full-stack starter template built with React Router v7, Supabase, and Vercel.

```bash
npx create-react-router@latest --template oreillyjw/supa-vercel-stack
```

## What's in the stack

-   [Vercel deployment](https://vercel.com) with zero-config setup
-   Production-ready [Supabase Database](https://supabase.com/)
-   Email/Password Authentication / Magic Link, with cookie-based sessions
-   Database ORM with [Prisma](https://prisma.io)
-   Styling with [Tailwind CSS](https://tailwindcss.com/)
-   End-to-end testing with [Playwright](https://playwright.dev)
-   Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
-   Code formatting with [Prettier](https://prettier.io)
-   Linting with [ESLint](https://eslint.org)
-   Static Types with [TypeScript](https://typescriptlang.org)
-   Internationalization with [remix-i18next](https://github.com/sergiodxa/remix-i18next)

Not a fan of bits of the stack? Fork it, change it, and use `npx create-react-router --template your/repo`! Make it your own.

## Prerequisites

-   **Node.js 22.x** (required by Vercel as of November 2025)
-   [Vercel account](https://vercel.com/signup)
-   [Supabase account](https://supabase.com/) (free tier available)

## Quick Start

### 1. Set Up Supabase

-   Create a [Supabase Database](https://supabase.com/) (free tier gives you 2 databases)

    > **Note:** You can create one database for development/production, or two separate databases for `staging` and `production`

    > **Note:** Used all your free tiers? Also works with [Supabase CLI](https://github.com/supabase/cli) and local self-hosting

    > **Note:** Create a strong database password, but prefer a passphrase - it'll be easier to use in connection strings (no need to escape special characters)
    >
    > _Example: my_strong_passphrase_

-   Go to https://app.supabase.io/project/{PROJECT}/settings/api to find your secrets:

    -   Project URL (`SUPABASE_URL`)
    -   Project API keys:
        -   `anon` `public` key → `SUPABASE_ANON_PUBLIC`
        -   `service_role` `secret` key → `SUPABASE_SERVICE_ROLE`

-   Get your database connection string from Settings → Database → Connection String (URI format)

### 2. Local Development Setup

-   Clone this repository

-   Copy `.env.example` to `.env` and add your Supabase credentials:

```env
POSTGRES_PRISMA_URL="postgres://postgres:{YOUR_PASSWORD}@db.{YOUR_INSTANCE_NAME}.supabase.co:5432/postgres"
SUPABASE_URL="https://{YOUR_INSTANCE_NAME}.supabase.co"
SUPABASE_ANON_KEY="{ANON_PUBLIC}"
SUPABASE_SERVICE_ROLE_KEY="{SERVICE_ROLE}"
SUPABASE_JWT_SECRET="{JWT_SECRET}"
SERVER_URL="http://localhost:3000"
```

> **Note:** For local development, use `POSTGRES_PRISMA_URL` and `SERVER_URL`. On Vercel, `POSTGRES_PRISMA_URL` is provided by Supabase Integration and `VERCEL_URL` is automatically provided. Find your `SUPABASE_JWT_SECRET` in Supabase Dashboard → Project Settings → API → JWT Settings → JWT Secret

-   Initial setup (installs dependencies and sets up database):

    ```sh
    npm run setup
    ```

-   Start dev server:

    ```sh
    npm run dev
    ```

This starts your app in development mode at http://localhost:3000, rebuilding assets on file changes.

The database seed script creates a test user:

-   Email: `hello@supabase.com`
-   Password: `supabase`

### 3. Configure Supabase Authentication URLs

For magic link login and password reset to work, add these redirect URLs in your Supabase project:

Go to Authentication → URL Configuration and add:

**For local development:**

-   `http://localhost:3000/oauth/callback`
-   `http://localhost:3000/reset-password`

**For production:**

-   `https://your-app.vercel.app/oauth/callback`
-   `https://your-app.vercel.app/reset-password`

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oreillyjw/supa-vercel-stack)

### Manual Deployment Steps

1. **Fork or clone this repository**

2. **Create a new Vercel project**

    - Go to [Vercel Dashboard](https://vercel.com/dashboard)
    - Click "Add New Project"
    - Import your Git repository

3. **Configure Environment Variables**

    **Option A: Use Supabase Integration (Recommended)**

    The easiest way to connect Supabase to Vercel:

    - Install the [Supabase Integration](https://vercel.com/marketplace/supabase) from Vercel Marketplace
    - This automatically configures all required environment variables:

        - `SUPABASE_URL`
        - `SUPABASE_ANON_KEY`
        - `SUPABASE_SERVICE_ROLE_KEY`
        - `POSTGRES_PRISMA_URL` (used by Prisma)
        - `SUPABASE_JWT_SECRET`

        > No additional manual configuration needed! Vercel automatically provides `VERCEL_URL` for OAuth callbacks.

    **Option B: Manual Configuration**

    Alternatively, add all environment variables manually in Vercel project settings:

    ```
    POSTGRES_PRISMA_URL=postgres://postgres:{PASSWORD}@db.{INSTANCE}.supabase.co:5432/postgres
    SUPABASE_URL=https://{YOUR_INSTANCE_NAME}.supabase.co
    SUPABASE_ANON_KEY={ANON_PUBLIC_KEY}
    SUPABASE_SERVICE_ROLE_KEY={SERVICE_ROLE_KEY}
    SUPABASE_JWT_SECRET={YOUR_SUPABASE_JWT_SECRET}
    ```

    > **Note:** Find `SUPABASE_JWT_SECRET` in Supabase Dashboard → Project Settings → API → JWT Settings. Prisma uses `POSTGRES_PRISMA_URL` for database connections.

4. **Deploy**

    - Click "Deploy"
    - Vercel will automatically build and deploy your app

5. **Update Supabase redirect URLs**
    - Add your Vercel URL to Supabase Authentication → URL Configuration (see step 3 above)

### Deployment Tips

-   **Automatic Deployments**: Every push to your main branch triggers a production deployment
-   **Preview Deployments**: Pull requests automatically get preview URLs
-   **Environment Variables**: Set different values for Preview vs Production in Vercel settings
-   **Custom Domains**: Add custom domains in Vercel project settings

## Development

### Available Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run db:reset               # Reset database and seed with test data
npm run db:seed                # Seed database with test data
npm run db:prepare-migration   # Create new Prisma migration
npm run db:deploy-migration    # Apply migrations to database

# Testing
npm test                       # Run Vitest unit tests
npm run test:e2e:dev           # Run Playwright tests in UI mode
npm run test:e2e:run           # Run Playwright tests headlessly
npm run validate               # Run all checks (tests, lint, typecheck, e2e)

# Code Quality
npm run typecheck              # TypeScript type checking
npm run lint                   # ESLint
npm run format                 # Format with Prettier
```

### Relevant Code

This is a note-taking app demonstrating React Router v7 + Supabase patterns:

-   **Authentication & Sessions**: [./app/modules/auth](./app/modules/auth)

    -   Email/password and magic link authentication
    -   Cookie-based session management
    -   Automatic token refresh

-   **CRUD Operations**: [./app/modules/note](./app/modules/note)

    -   Creating, reading, updating, and deleting notes
    -   User-scoped data access

-   **User Management**: [./app/modules/user](./app/modules/user)
    -   User service layer

## Working with the Database

This project uses **Supabase migrations** (SQL files) as the source of truth for database schema. Prisma pulls the schema from Supabase and is used only as an ORM for type-safe queries.

### Database Schema Changes

To make changes to your database schema:

1. **Create a new Supabase migration**:

```sh
supabase migration new your_migration_name
```

OR

```sh
npx supabase migration new your_migration_name
```

2. **Write your SQL migration** in the generated file at `supabase/migrations/TIMESTAMP_your_migration_name.sql`

3. **Apply the migration and update Prisma**:

    ```sh
    npm run db:reset
    ```

    This command:

    - Runs `supabase db reset` to apply migrations to your local database
    - Runs `prisma db pull` to sync the Prisma schema from the database
    - Runs `prisma generate` to update the Prisma client
    - Seeds the database with test data

4. **For production**, database change are applied during CI/CD

### Important Notes

-   **Supabase migrations** (SQL files in `supabase/migrations/`) are the source of truth
-   **Prisma schema** (`app/database/schema.prisma`) is auto-generated from the database via `prisma db pull`
-   Don't manually edit the Prisma schema - changes will be overwritten when pulling from Supabase
-   The npm scripts `db:prepare-migration` and `db:deploy-migration` exist but are not used in this workflow

## Testing

### Playwright (E2E Tests)

End-to-end tests are in the `test/e2e` directory using Playwright.

```bash
npm run test:e2e:dev    # Interactive UI mode
npm run test:e2e:run    # Headless mode (CI)
```

Tests use semantic selectors via `page.getByRole()`, `page.getByTestId()`, etc.

### Vitest (Unit Tests)

Unit tests use Vitest and Testing Library:

```bash
npm test              # Watch mode
npm run test:cov      # With coverage
```

### Type Checking

```bash
npm run typecheck
```

### Linting & Formatting

```bash
npm run lint          # ESLint
npm run format        # Prettier
```

## Advanced Configuration

### Token Expiration

If your Supabase JWT expires in less than 1 hour (3600 seconds), adjust `REFRESH_ACCESS_TOKEN_THRESHOLD` in [app/modules/auth/session.server.ts](./app/modules/auth/session.server.ts).

### Row Level Security (RLS)

This stack implements **defense-in-depth security** with both application-layer authorization and database-level RLS policies.

**RLS Policies** ([supabase/migrations/20251126002639_rls.sql](supabase/migrations/20251126002639_rls.sql)):

-   Enabled on all user-facing tables (`User`, `Note`)
-   Users can only access their own data
-   Policies enforce user ownership at the database level

**When to use Supabase SDK vs Prisma**:

-   **Use Prisma** (default): For server-side data operations in loaders/actions
    -   Faster performance (direct PostgreSQL connection)
    -   Type-safe queries with auto-generated types
    -   Still protected by RLS policies
-   **Use Supabase SDK**: For client-side operations or auth-specific functionality
    -   Client-side data fetching without server interaction
    -   Real-time subscriptions
    -   Storage operations (file uploads)
    -   Auth operations (password reset flows, magic links)

See [app/integrations/supabase/client.ts](./app/integrations/supabase/client.ts) for available Supabase clients (`supabaseClient` for public operations, `getSupabaseAdmin()` for server-side admin operations).

### Local Supabase Development

This project supports the [Supabase CLI](https://supabase.com/docs/guides/cli) for local development:

```bash
supabase start        # Start local Supabase
supabase stop         # Stop local Supabase
```

Local services:

-   Studio UI: http://localhost:54323
-   Email testing (Inbucket): http://localhost:54324

See `supabase/config.toml` for configuration.

## Project Structure

```
app/
├── modules/          # Domain modules (auth, note, user)
├── routes/           # React Router v7 routes
├── database/         # Prisma schema and migrations
├── integrations/     # Third-party integrations (Supabase, i18n)
├── components/       # Shared React components
└── styles/           # Global styles

test/
├── e2e/              # Playwright E2E tests
├── unit/             # Vitest unit tests
└── support/          # Test utilities and fixtures
```

## Need Help?

-   [React Router Documentation](https://reactrouter.com/docs)
-   [Supabase Documentation](https://supabase.com/docs)
-   [Prisma Documentation](https://www.prisma.io/docs)
-   [Vercel Documentation](https://vercel.com/docs)

## License

MIT
