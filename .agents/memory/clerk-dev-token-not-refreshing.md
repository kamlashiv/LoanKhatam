---
name: Clerk web dev 401 — stale session token
description: Diagnosing Clerk web 401s in dev where the session cookie is present but the token is expired and never refreshed (Replit preview iframe third-party cookie block).
---

# Clerk web 401s in dev: stale, un-refreshed session token

Symptom: every authenticated API request returns 401 in the dev preview, while the
frontend still looks "signed in" (ProtectedRoute renders, hooks keep polling).

## How to diagnose (decisive)
Temporarily decode the `__session` JWT inside `requireAuth` and log `iat`, `exp`,
`now`, `ageSec`, `iss`, `sub`. (JWT payload is not secret — only log claims, never
the signature or any secret/key.) Compare against `getAuth(req)` returning
`tokenType: "session_token"` but `userId: null`.

Findings that point here:
- cookie present (`__session` reaches server), `userId` null.
- JWT is well-formed: `sub` (user id) present, `iss` is the dev FAPI
  (`*.clerk.accounts.dev`), `azp` is the app's `*.replit.dev` domain.
- `exp - iat == 60` (Clerk session tokens live ~60s) but `ageSec` is hundreds/
  thousands of seconds → the client is NOT refreshing the token.

## Rule out clock skew first
Confirm the container clock matches the real world: `curl -sI https://www.google.com`
(and clerk.com / cloudflare.com) and compare the `date:` header to `date -u`. If they
match, JWT `exp` failures are NOT skew — the token is genuinely stale.
**Why:** this environment can report a future date (e.g. 2026); external date headers
report the same, so there is no skew and "expired" means un-refreshed, not clock drift.

## Root cause & fix
The Clerk browser SDK can't refresh the session cookie when the app runs **inside the
Replit preview iframe** — the browser treats Clerk's cookie as third-party and freezes
it. After ~60s the token expires and the server correctly rejects it.

Fix is a usage change, not code: **open the app in its own browser tab** (first-party
context) so Clerk can refresh normally. Published apps run at their own top-level
domain, so this never affects production.

**Do NOT** "fix" this by adding `setAuthTokenGetter`/Bearer tokens to web, hand-editing
Clerk secrets, or changing `clerkProxyMiddleware` — the wiring is already canonical; the
token is simply stale. Remove the temporary JWT-decode logging once diagnosed.

## User-facing recovery
Non-technical users read the 401 as "the feature is broken" (e.g. "create loan not working"),
not as a session/iframe issue, and chat instructions to "open in a new tab" often don't land.
Surface the fix *in the UI* rather than only in chat:
- Detect iframe context (`window.self !== window.top`) and show an in-app banner with an
  "Open in new tab" button. Gate on iframe so it never shows top-level or in production.
- Make mutation `onError` 401/403-aware (actionable "session expired" copy, not generic
  validation copy).
- Offer a one-click local reset (clear storage + JS cookies + Clerk `signOut()` + reload)
  for when a session gets wedged.
