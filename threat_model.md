# Threat Model

## Project Overview

Ledger is a public, production-deployed personal loan management application. The production surface is a React + Vite web client in `artifacts/loan-tracker`, an Express API in `artifacts/api-server`, and shared libraries for generated API contracts, database access, and AI integrations in `lib/api-*`, `lib/db`, and `lib/integrations-anthropic-ai`.

Users authenticate with Clerk and then manage loans, payments, profile data, settings, and credit-card records. The application also offers AI-assisted extraction from pasted text, uploaded files, and a Repl-scoped Gmail connector. Production deployment is public on Replit autoscale; mockup sandbox artifacts are not production-reachable and should be treated as out of scope unless future evidence shows otherwise.

## Assets

- **User financial records** — loans, payment histories, balances, credit-card metadata, profile data, and settings. Exposure reveals sensitive personal financial information.
- **User sessions and identity bindings** — Clerk sessions, authenticated request context, and user-to-record ownership relationships. Compromise enables cross-account access or unauthorized writes.
- **Repl-scoped integration data** — Gmail connector credentials and any financial data derived from connected mailboxes. This is especially sensitive because the connector can be shared by deployment configuration rather than by end-user consent.
- **Application secrets and upstream credentials** — database connection string, Clerk secret key, AI integration keys, and connector proxy credentials. Compromise would allow backend impersonation or bulk data access.
- **AI extraction inputs** — pasted statement text, uploaded files, and email bodies. These often contain account numbers, balances, and payment schedules and must not leak across users or into unintended logs/responses.

## Trust Boundaries

- **Browser to API** — all client input is untrusted. The API must authenticate, validate, and authorize every state-changing and data-returning request.
- **API to PostgreSQL** — the API has direct read/write access to all persisted financial records. Any broken authorization or unsafe query at this boundary can expose or modify another user’s data.
- **API to Clerk** — request identity comes from Clerk middleware and proxy behavior. Protected routes must not trust client-side routing alone.
- **Authenticated user to browser-local state** — React state and legacy `localStorage` buckets can outlive a session on shared devices. Client-side caches, migration flags, and persisted drafts must be scoped to the current authenticated user before they are displayed or written back to the server.
- **API to AI providers** — uploaded/pasted financial content crosses to upstream AI services. Expensive endpoints also create abuse and cost risk.
- **API to Gmail/connector proxy** — Gmail access tokens are fetched from a Replit connector attached to the Repl, not inherently to the currently signed-in end user. This is a critical ownership boundary.
- **Public vs authenticated routes** — marketing/legal pages and health checks are public; financial, profile, extraction, and Gmail routes are authenticated. This distinction must be enforced server-side.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/loan-tracker/src/main.tsx`, `artifacts/loan-tracker/src/App.tsx`
- **Highest-risk code areas:** `artifacts/api-server/src/routes/`, `artifacts/api-server/src/lib/gmail.ts`, `artifacts/api-server/src/lib/ai-extract.ts`, `artifacts/api-server/src/routes/extract-loan.ts`, `artifacts/loan-tracker/src/lib/preferences.tsx`, `artifacts/loan-tracker/src/lib/profile.tsx`, `lib/db/src/schema/`
- **Public surfaces:** `/`, sign-in/up, legal/help pages, `/api/healthz`
- **Authenticated surfaces:** `/api/loans*`, `/api/credit-cards*`, `/api/profile`, `/api/settings`, `/api/feedback`, `/api/extract-*`, `/api/gmail/*`
- **Usually dev-only / ignore unless proven reachable:** `artifacts/mockup-sandbox`, built `dist/` outputs, test files, local-only workflow code

## Threat Categories

### Spoofing

The application relies on Clerk-authenticated requests to bind financial records to a user. Every protected API route must derive identity from verified Clerk context on the server, not from client state, request body fields, or UI route guards. Any integration endpoint that returns data tied to a single external account must also verify that the current user is authorized to act for that account.

### Tampering

Loan records, payments, credit-card data, settings, and derived financial calculations must be validated server-side before persistence. The server must ignore or override any client-controlled ownership fields and must prevent users from modifying records they do not own. AI-assisted import flows must not let extracted data bypass normal validation rules.

### Information Disclosure

The main confidentiality risk is cross-account exposure of financial data: loan/payment endpoints, profile/settings reads, Gmail-derived results, and browser-retained state must only surface data belonging to the current authorized user. Error responses and logs must avoid leaking raw secrets, access tokens, or highly sensitive document contents. Repl-scoped integrations must not accidentally become shared data sources in a multi-user public deployment, and client-side state must not render one user’s saved preferences or imported financial profile to the next signed-in account on a shared device.

### Denial of Service

The public deployment includes expensive AI-backed and file-processing endpoints. These routes must enforce bounded request sizes, per-user throttling, and practical limits on upstream work so one user cannot drive excessive compute cost or degrade service for others. Rate limiting here is abuse mitigation, not the sole security boundary.

### Elevation of Privilege

There is no explicit admin role, so the main privilege-escalation risks are broken object-level authorization, shared integration ownership bugs, and injection flaws that bypass per-user row scoping. All persistence and lookup paths must preserve user ownership checks through reads, updates, and deletes, and no route should expose another user’s connector-backed data merely because both users are authenticated.
