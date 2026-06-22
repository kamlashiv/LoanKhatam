# Loan Tracker — Loan Khatam

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

## Mobile (Android APK via Capacitor)

`artifacts/loan-tracker` is wrapped with Capacitor to produce a sideloadable Android app. The app is a thin WebView wrapper that loads the **live published HTTPS site** via `server.url`, so backend API + Clerk login work exactly as on web. A bundled offline build would break login/data, so the published-URL approach is required.

> ⚠️ **The APK cannot be compiled inside Replit** — there is no Android SDK / Gradle / JDK here. Do the final build on a machine with Android Studio, or use PWABuilder (no install needed).

### Build & install steps (do these in order)

1. **Publish the app.** Click **Publish** in Replit. You'll get a stable URL like `https://your-app-name.replit.app`. Copy it.
2. **Point the wrapper at that URL.** In `artifacts/loan-tracker/capacitor.config.ts`, replace the `PUBLISHED_APP_URL` value (currently `https://REPLACE-ME.replit.app`) with your real `.replit.app` URL (no trailing slash). _Alternatively_, skip editing the file and `export PUBLISHED_APP_URL="https://your-app-name.replit.app"` before step 3.
3. **Rebuild web + re-sync native** (run from `artifacts/loan-tracker/`):
   ```bash
   BASE_PATH="/" PORT="5000" pnpm --filter @workspace/loan-tracker run build
   npx cap sync android
   ```
   This copies the latest web build, app config (icon/splash/name), and the published URL into `android/`.
4. **Build the APK** (outside Replit, pick one):
   - **Android Studio:** open `artifacts/loan-tracker/android/` → **Build → Build Bundle(s)/APK(s) → Build APK(s)**. The signed/debug APK lands under `android/app/build/outputs/apk/`.
   - **PWABuilder:** go to [pwabuilder.com](https://www.pwabuilder.com), enter your published `.replit.app` URL, choose **Android → Generate Package**, and download the APK. (This route doesn't even need the local Android project.)
5. **Install on phone.** Transfer the `.apk` to an Android device and open it. Enable "Install unknown apps" for your file manager/browser when prompted. The app opens as **Loan Khatam** with the branded icon/splash and full login + data.

### App identity

- App name: **Loan Khatam** (`appName` in `capacitor.config.ts`, `app_name` in `android/.../res/values/strings.xml`).
- App ID: `app.replit.ledger`.
- Icon + splash sources live in `artifacts/loan-tracker/assets/` (`icon-only.png`, `icon-foreground.png`, `icon-background.png`, `splash.png`, `splash-dark.png`). To regenerate all density buckets after changing branding, run from the artifact dir: `npx @capacitor/assets generate --android`.

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
