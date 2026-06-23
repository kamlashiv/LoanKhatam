# SEO Strategy

## In scope
- Public marketing landing page (`/`)
- Public authentication entry points (`/sign-in`, `/sign-up`) only where they affect shared crawlability or metadata
- Public trust/support pages if they are intended to be reachable without authentication (`/about`, `/help`, `/privacy-policy`, `/terms`, `/disclaimer`, `/cookie-policy`, `/data-usage`, `/license`)

## Out of scope
- Authenticated product experience (`/dashboard`, `/loans/**`, `/credit-cards`, `/amortization`, `/planner`, `/strategy`, `/profile`, `/settings`)
- User-specific or account-specific content behind Clerk auth
- Mockup, sandbox, and internal development artifacts

## Target audience
- Individuals tracking money lent to friends and family
- Users searching for a personal loan tracker or private loan ledger

## Primary keywords
- personal loan tracker
- loan tracker app
- loan ledger
- track money lent to friends and family

## Dismissed categories
- (None yet)

## Notes
- Current frontend stack is React + Vite + Wouter SPA.
- `artifacts/loan-tracker` now prerenders the `/` landing page at build time, but its other public routes still rely on the shared SPA shell.
- The production frontend artifact serves `artifacts/loan-tracker/dist/public` as a static site and rewrites `/*` to `/index.html`, so route-specific SEO requires explicit prerendering or SSR for each public path.
