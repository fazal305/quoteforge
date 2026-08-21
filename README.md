# QuoteForge

A smart quotation and proposal platform: businesses create professional quotes,
send a secure public link to customers (no account required), customers
approve / reject / request changes, and approved quotes convert into invoices
with payment tracking.

**Live demo:** [quoteforge-604.netlify.app](https://quoteforge-604.netlify.app)
— log in with the [demo credentials](#4-demo-login-credentials-development-only) below. This is a working development deployment seeded with dummy data, not a real business.

**Status:** Phases 1–4 complete (foundation, core business features,
public customer quote/approval workflow, invoice conversion and payment
tracking). See Roadmap below.

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

- **Frontend:** React + Vite + JavaScript (JSX), React Router, TanStack
  Query, Zustand, Tailwind CSS, React Hook Form + Zod.
- **Backend:** Netlify Functions (JavaScript), using the Supabase
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
| Backend | Netlify Functions (JS) | Single deploy target with Netlify hosting |
| Database | Supabase Postgres | Managed Postgres + RLS + Auth in one provider |

## Project structure

```
quoteforge/
├─ frontend/               Vite React app
│  └─ src/
│     ├─ pages/            Route-level screens
│     ├─ components/       ui/ (primitives), layout/, quote-builder/
│     ├─ lib/               money.js (calculation utils), supabase.js
│     ├─ api/               React Query hooks per resource (customers, quotes, ...)
│     └─ store/             Zustand stores (auth, ...)
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

### 4. Demo login credentials (development only)

Running `node supabase/seed/seed-dev-users.mjs` (with root `.env` filled in)
creates one demo organization and one user per role:

| Role | Email | Password |
|---|---|---|
| `BUSINESS_OWNER` | `owner@quoteforge.dev` | `QuoteForge-Owner-123!` |
| `STAFF` | `staff@quoteforge.dev` | `QuoteForge-Staff-123!` |

**[DEMO CREDENTIALS — development/staging only.]** These are not real
business accounts. Before any production deploy: delete these users (or
rotate their passwords) in Supabase Auth, and delete the seeded
`FORK Software Agency` organization along with them.

### 5. Run locally

Frontend only (customers, catalog, quote builder, dashboard — anything
that doesn't call `/api/*`):

```bash
cd frontend && npm run dev
```

Frontend **and** functions (needed for the public quote page, which calls
`/api/public-quote` and `/api/quote-response`): run these two in separate
terminals from the repo root.

```bash
npm install                 # installs netlify-cli (dev dependency)
npm run functions:serve     # Netlify Functions on :9999
cd frontend && npm run dev  # Vite on :5173, proxies /api/* to :9999
```

Note: this repo does **not** use `netlify dev` for local testing. With
this repo's nested `frontend/` + root-level `netlify/functions/` layout,
`netlify dev`'s redirect proxy ends up intercepting asset requests (e.g.
`/src/main.jsx`) meant for Vite. The `functions:serve` + Vite-proxy
combination above avoids that entirely and is what's actually used
day-to-day. `netlify.toml`'s `[[redirects]]` are what production uses,
and are unaffected by this.

## Development commands

| Command | Location | Purpose |
|---|---|---|
| `npm run dev` | `frontend/` | Start Vite dev server |
| `npm run build` | `frontend/` | Production build |
| `npm run lint` | `frontend/` | Lint with oxlint |
| `npm run functions:serve` | root | Serve Netlify Functions on :9999 |

## Deployment

**Two separate steps — pushing to GitHub does not deploy the app.**

1. Push to the GitHub repository (see Git workflow below).
2. Connect the repo in Netlify, or run `netlify deploy --prod`. Netlify
   reads `netlify.toml` for the build command (`npm --prefix frontend
   run build`), publish directory (`frontend/dist`), and functions
   directory (`netlify/functions`). No `base` directory is set — earlier
   attempts using `base = "frontend"` broke Netlify's functions-directory
   path validation (`../netlify/functions` was rejected as outside the
   repo root) — root-relative paths avoid that entirely.
3. In Netlify Site settings → Environment variables, set the same keys as
   `.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`)
   plus `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` for the frontend
   build. **Do not mark `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` as
   "Contains secret values"** — Netlify redacts secret-flagged variables
   (replaces characters with `•`) when a *function* reads them at runtime,
   which breaks any Supabase call from `netlify/functions/*`. The two
   `VITE_*` build-time-only vars are unaffected and can stay secret-flagged.
   (If a variable was already created as secret, Netlify won't let you
   un-check that in place — delete it and re-add it without the checkbox.)
4. Verify the production build: load the site, confirm client-side routing
   works on a hard refresh of a nested route (SPA fallback), hit
   `/api/health` to confirm functions + env vars are wired, and load a
   real `/quote/:token` link end-to-end (exercises the Supabase
   service-role path specifically, which the health check alone doesn't).

## Git workflow

The repository is **public** . Because of
that:

- `.env`, `.env.local`, and anything matching `.env.*` are gitignored —
  double-check `git status` before every commit.
- No real business data, API keys, or credentials are ever committed —
  only `.env.example` placeholders.
- Development data is either clearly marked `[PLACEHOLDER]` or Supabase
  seed data, never real customer/business information.

## Roadmap

- **Phase 1 (done):** Project foundation, design system, routing, auth
  shell, database schema.
- **Phase 2 (done):** Customers, catalog, quote builder (autosave, local
  draft recovery, catalog-item prefill, atomic save + numbering via RPC),
  quote lifecycle transitions, activity timeline, dashboard.
- **Phase 3 (done):** Public quote page (`/quote/:token`) served through
  dedicated Netlify Functions (no Supabase session for customers), view
  tracking, approve/reject/request-changes with server-validated status
  transitions and minimal approval metadata (name, IP, user agent —
  approval only).
- **Phase 4 (done):** Atomic quote-to-invoice conversion (line items
  snapshotted, quote marked converted), invoice lifecycle
  (ISSUED/PARTIALLY_PAID/PAID), payment recording with server-computed
  status (never client-trusted) and overpayment guard, dashboard
  outstanding/paid totals.
- **Phase 5 (built, awaiting a real API key to verify live):** AI Quote
  Assistant — a Netlify Function proxies OpenRouter (key never reaches
  the browser), validates the model's JSON output against a Zod schema
  before it's trusted, and the suggestion only pre-fills the quote
  builder for human review — nothing is ever saved automatically.
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
