# QuoteForge

A smart quotation and proposal platform: businesses create professional quotes,
send a secure public link to customers (no account required), customers
approve / reject / request changes, and approved quotes convert into invoices
with payment tracking.

**Status:** Phase 1 — Foundation (project scaffold, design system, routing,
auth foundation, database schema). Core business features (customers,
catalog, quote builder, dashboard) land in Phase 2.

## Product overview

The core workflow:

```
Customer → Create Quote → Add Products/Services → Automatic Pricing
  → Send → Customer Views (no account) → Approve / Reject / Request Changes
  → Convert Approved Quote to Invoice → Payment Tracking
```

Every status transition is recorded as a human-readable activity event
(e.g. "Ahmed Traders approved quotation #Q-1048").

## Architecture

- **Frontend:** React + Vite + TypeScript, React Router, TanStack Query,
  Zustand, Tailwind CSS, React Hook Form + Zod.
- **Backend:** Netlify Functions (TypeScript), using the Supabase
  service-role key for operations that need to bypass RLS (public quote
  access, AI assistant proxy, PDF generation).
- **Database/Auth:** Supabase (Postgres + Row Level Security for tenant
  isolation, Supabase Auth for login).
- **Deployment:** Netlify (static frontend + serverless functions).

### Why Netlify Functions instead of a separate backend server

The MVP uses Netlify Functions only (no separate Express/Fastify host) to
keep a single deploy target. Supabase RLS — not the API layer — is the
primary tenant-isolation boundary, so this doesn't weaken security; it just
means there's no long-running server process. If background jobs or cron
work are needed later, that's a deliberate architecture change, not a
default.

### Multi-tenancy

Every business-owned table (`customers`, `catalog_items`, `quotes`,
`invoices`, ...) carries `organization_id` and is protected by a Postgres
RLS policy scoped to the calling user's organization (see
`supabase/migrations/0001_init.sql`). The Supabase anon key is intentionally
public — RLS is the actual security boundary, not key secrecy.

### Public quote access

Customers view/approve quotes without an account via `/quote/:token`. The
token comes from a dedicated `quote_public_tokens` table with a random
value — never the quote's database ID — so links can be rotated or expired
independently of the quote record, and no RLS policy grants direct anon
access to the `quotes` table. The public page is served through a Netlify
Function using the service-role key, which validates the token and returns
only customer-safe fields.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React + Vite | Fast dev loop, standard for this scale of SPA |
| Routing | React Router | Public (`/quote/:token`) + authenticated app routes in one SPA |
| Server state | TanStack Query | Caching, retries, optimistic updates for CRUD-heavy screens |
| Client state | Zustand | Minimal auth/session store; avoids Redux boilerplate |
| Forms | React Hook Form + Zod | Schema-validated forms, shared validation with backend |
| Styling | Tailwind CSS v4 | Design tokens via `@theme`, no scattered inline styles |
| Money math | decimal.js | Avoids float rounding errors in quote/invoice totals |
| Backend | Netlify Functions (TS) | Single deploy target with Netlify hosting |
| Database | Supabase Postgres | Managed Postgres + RLS + Auth in one provider |

## Project structure

```
quoteforge/
├─ frontend/               Vite React app
│  └─ src/
│     ├─ pages/            Route-level screens
│     ├─ components/       ui/ (primitives), layout/, quote-builder/
│     ├─ lib/               money.ts (calculation utils), supabase.ts
│     ├─ store/             Zustand stores (auth, ...)
│     └─ types/             Shared domain types
├─ netlify/functions/       Backend API (Netlify Functions)
├─ supabase/migrations/     SQL schema + RLS policies
└─ netlify.toml             Build, redirects, SPA fallback, security headers
```

## Setup

### Prerequisites

- Node.js 20+
- A Supabase project (free tier is enough for development)
- (Phase 5+) An OpenRouter API key, for the AI Quote Assistant

### 1. Install dependencies

```bash
cd frontend && npm install
cd .. && npm install
```

### 2. Environment variables

```bash
cp frontend/.env.example frontend/.env
cp .env.example .env
```

Fill in:

- `frontend/.env` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Supabase
  project → Settings → API). These are safe to expose to the client.
- `.env` — `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (**secret**, never
  commit or expose to the frontend), and later `OPENROUTER_API_KEY`.

### 3. Database setup

In the Supabase SQL editor (or via the Supabase CLI), run the migrations in
`supabase/migrations/` in order, starting with `0001_init.sql`.

### 4. Run locally

```bash
cd frontend && npm run dev
```

To run Netlify Functions locally alongside the frontend, install the
Netlify CLI and run `netlify dev` from the project root instead (reads
`netlify.toml`, proxies `/api/*` to the functions).

## Development commands

| Command | Location | Purpose |
|---|---|---|
| `npm run dev` | `frontend/` | Start Vite dev server |
| `npm run build` | `frontend/` | Type-check + production build |
| `npx tsc -b --noEmit` | `frontend/` | Type-check only |
| `npm run typecheck` | root | Type-check Netlify Functions |

## Deployment

**Two separate steps — pushing to GitHub does not deploy the app.**

1. Push to the GitHub repository (see Git workflow below).
2. Connect the repo in Netlify, or run `netlify deploy --prod`. Netlify
   reads `netlify.toml` for the build command (`npm run build` from
   `frontend/`), publish directory (`frontend/dist`), and functions
   directory (`netlify/functions`).
3. In Netlify Site settings → Environment variables, set the same keys as
   `.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`)
   plus `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` for the frontend
   build.
4. Verify the production build: load the site, confirm client-side routing
   works on a hard refresh of a nested route (SPA fallback), and hit
   `/api/health` to confirm functions + env vars are wired.

## Git workflow

The repository is **public** (per project owner's instruction). Because of
that:

- `.env`, `.env.local`, and anything matching `.env.*` are gitignored —
  double-check `git status` before every commit.
- No real business data, API keys, or credentials are ever committed —
  only `.env.example` placeholders.
- Development data is either clearly marked `[PLACEHOLDER]` or Supabase
  seed data, never real customer/business information.

## Roadmap

- **Phase 1 (current):** Project foundation, design system, routing, auth
  shell, database schema.
- **Phase 2:** Customers, catalog, quote builder, calculations, quote
  lifecycle, dashboard.
- **Phase 3:** Public quote page, view tracking, approve/reject/request
  changes.
- **Phase 4:** Invoice conversion, payment tracking, activity history.
- **Phase 5:** AI Quote Assistant (OpenRouter, structured + validated
  output, human-in-the-loop).
- **Phase 6:** Responsive/accessibility polish, PDF generation, loading
  and error states.
- **Phase 7:** Testing, linting, security review.
- **Phase 8:** GitHub push + Netlify deployment verification.

## Security notes

- Tenant isolation is enforced by Postgres RLS, not client-side filtering.
- The OpenRouter API key is used only inside Netlify Functions and is
  never sent to or readable from the frontend.
- Public quote tokens are random values in a dedicated table, not the
  quote's database ID.
- File uploads (logo, attachments) will be validated for type and size
  before storage (Phase 2/6) — not yet implemented.
