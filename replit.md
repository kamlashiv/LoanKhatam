# Loan Tracker — Ledger

A personal loan management app for tracking money lent to friends and family. Users can log loans, record payments, and monitor outstanding balances.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/loan-tracker run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — Clerk auth

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + Tailwind CSS v4 + shadcn/ui
- API: Express 5
- Auth: Clerk (Replit-managed)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/loans.ts` — loans table schema
- `lib/db/src/schema/payments.ts` — payments table schema
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas for server
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/loan-tracker/src/pages/` — React page components

## Architecture decisions

- Contract-first: OpenAPI spec drives both client hooks (Orval) and server Zod schemas
- Clerk auth via Replit-managed tenant; cookie-based for web, proxy middleware on Express
- `remainingAmount` and loan status auto-computed server-side from payments
- Loans auto-transition to "overdue" when dueDate has passed and balance > 0
- Dashboard summary and recent loans are dedicated "wow" endpoints for instant UX

## Product

- Landing page with sign in / sign up CTAs
- Dashboard with summary stats (total lent, outstanding, collected, overdue count)
- All loans list with filter by status and search by borrower name
- Loan detail with repayment progress bar and payment history
- Add/edit loan forms with principal, interest rate, dates, description
- Record and delete individual payments
- Amounts displayed in Indian Rupees (₹), dates in DD/MM/YYYY

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change
- `@layer theme, base, clerk, components, utilities;` must come before `@import 'tailwindcss'` in index.css for Clerk themes
- Vite config needs `tailwindcss({ optimize: false })` to prevent Clerk CSS layer issues in prod builds
- Clerk sign-in/sign-up routes MUST use exact path="/sign-in/*?" pattern (not /sign-in/*)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for auth setup and customization
