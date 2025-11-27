# Deployment Configuration

This document outlines the required GitHub secrets and configuration for deploying this React Router v7 application to Vercel with Supabase.

## Required GitHub Secrets

### Vercel Deployment Secrets

| Secret              | Description                      | How to obtain                                                        |
| ------------------- | -------------------------------- | -------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel API token for deployment  | [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID`     | Your Vercel organization/team ID | Run `vercel link` locally and check `.vercel/project.json`           |
| `VERCEL_PROJECT_ID` | Your Vercel project ID           | Run `vercel link` locally and check `.vercel/project.json`           |

### Supabase Production Secrets

| Secret                   | Description                   | How to obtain                                                                            |
| ------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN`  | Supabase CLI access token     | [Supabase Dashboard](https://supabase.com/dashboard/account/tokens) → Generate new token |
| `PRODUCTION_DB_PASSWORD` | Production database password  | Set during Supabase project creation                                                     |
| `PRODUCTION_PROJECT_ID`  | Supabase project reference ID | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → General        |

### CI Testing Secrets

These secrets are used for running E2E tests in CI:

| Secret                         | Description                          |
| ------------------------------ | ------------------------------------ |
| `CI_SUPABASE_JWT_SECRET`       | JWT secret for test environment      |
| `CI_SUPABASE_ANON_KEY`         | Supabase anonymous key for tests     |
| `CI_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for tests  |
| `CI_SUPABASE_URL`              | Supabase URL for test environment    |
| `CI_SERVER_URL`                | Server URL for test environment      |
| `CI_DATABASE_URL`              | Database connection string for tests |

## Setup Instructions

### 1. Create Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# This creates .vercel/project.json with orgId and projectId
```

### 2. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add each secret listed above using **New repository secret**

### 3. Configure Vercel Environment Variables

**Option A: Use Supabase Integration (Recommended)**

The easiest way to configure environment variables:

1. Install the [Supabase Integration](https://vercel.com/marketplace/supabase) from Vercel Marketplace
2. This automatically configures: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. Manually add remaining variables in Vercel project settings:
    - `DATABASE_URL` - `postgres://postgres:{PASSWORD}@db.{INSTANCE}.supabase.co:5432/postgres`
    - `SUPABASE_JWT_SECRET` - Generate with `openssl rand -hex 32`
    - `SERVER_URL` - Your production app URL (e.g., `https://your-app.vercel.app`)

**Option B: Manual Configuration**

Alternatively, add all environment variables manually in Vercel project dashboard:

-   `DATABASE_URL` - Production Supabase database connection string
-   `SUPABASE_URL` - Production Supabase project URL
-   `SUPABASE_SERVICE_ROLE_KEY` - Production Supabase service role key
-   `SUPABASE_ANON_KEY` - Production Supabase anonymous key
-   `SUPABASE_JWT_SECRET` - JWT secret for session encryption (generate with `openssl rand -hex 32`)
-   `SERVER_URL` - Your production app URL (e.g., `https://your-app.vercel.app`)

> **Note:** Vercel automatically provides `VERCEL_URL` which is used if `SERVER_URL` is not set. However, it's recommended to set `SERVER_URL` explicitly for production.

## Deployment Flow

1. Push to `main` branch triggers the deploy workflow
2. Quality gates run in parallel: lint, typecheck, vitest, playwright
3. If all gates pass, deployment job runs:
    - Links to Supabase production project
    - Pushes database migrations with `supabase db push`
    - Deploys to Vercel production

## Troubleshooting

### "Context access might be invalid" warnings

These warnings indicate the secrets haven't been configured in GitHub yet. Add all required secrets to resolve.

### Deployment fails at Supabase link

Ensure `SUPABASE_ACCESS_TOKEN` and `PRODUCTION_PROJECT_ID` are correctly set.

### Vercel deployment fails

Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` match your Vercel project configuration.
