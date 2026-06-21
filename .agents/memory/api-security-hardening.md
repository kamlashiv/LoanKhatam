---
name: API security hardening (CORS / headers / rate limit)
description: Durable rules for the loan-tracker API server's CORS allowlist, security headers, and per-user rate limiting.
---

# API security hardening

## Credentialed CORS must be exact-origin allowlist
The api-server uses `cors({ credentials: true })`. With credentials, the origin
check MUST be an exact-match allowlist built from `REPLIT_DOMAINS`
(`https://<domain>`), plus localhost gated to non-production. No-Origin requests
(same-origin, curl, server-to-server) are allowed.

**Never** allow a wildcard suffix like `*.replit.dev` / `*.replit.app` for a
credentialed allowlist — any attacker can stand up their own Repl on that suffix
and read a signed-in victim's private API responses. This was an architect
review rejection.

**Why:** the frontend always calls the API same-origin via Replit's path proxy,
so the only browser origin we ever need to trust is this deployment's own domain.
Disallowed origins resolve to `callback(null, false)` (cors omits the ACAO
header → browser blocks the read) rather than throwing, which avoids noisy 500s.

## Security headers
A middleware sets nosniff, X-Frame-Options DENY, Referrer-Policy
strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo off),
X-Permitted-Cross-Domain-Policies none, and HSTS only when
`NODE_ENV === "production"`. Safe because these are JSON API responses, never
framed. NODE_ENV is unset in dev (the dev script exports `development`), set to
`production` in deploys.

## Per-user rate limiting
`lib/rate-limit.ts` is an in-memory fixed-window limiter keyed by
`req.userId:path`. `requireAuth` (defined inline per route) sets `req.userId`
BEFORE the limiter middleware, so keying per-user works — keep that ordering.
In-memory only: resets on restart, per-process; it is cost/abuse throttling, not
a security boundary. Applied to expensive AI/Gmail routes (extract-financials,
extract-loan, gmail/scan). extract-financials also caps input text length (413).

## CSV export = formula-injection guard
Any CSV the user can open in a spreadsheet must prefix a leading `= + - @` tab or
CR with a single quote before quoting, or a malicious borrower-name/field becomes
an executable formula.
