# SEO Strategy

## In scope
- Public marketing landing page (`/`)
- Public authentication entry points (`/sign-in`, `/sign-up`) only where they affect shared crawlability or metadata
- Public trust/support pages if they are intended to be reachable without authentication (`/about`, `/help`, `/privacy-policy`, `/terms`, `/disclaimer`, `/cookie-policy`, `/data-usage`, `/license`)

## Out of scope
- Authenticated product experience (`/dashboard`, `/loans/**`, `/credit-cards`, `/amortization`, `/planner`, `/strategy`, `/profile`, `/settings`)
- User-specific or account-specific content behind Clerk auth

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
- No server-rendered marketing HTML was found in the source; crawlers receive the shared `index.html` shell and rely on JavaScript for page body content.
- About/help/policy pages exist in the app, but the current source places them behind authentication and only links to them from the signed-in settings area.
