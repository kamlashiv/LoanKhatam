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
Users often read the 401 as "the form/button is broken" (e.g. "create loan not working").
Two mitigations already shipped in loan-tracker:
- Mutation `onError` handlers are status-aware: 401/403 show a "Session expired — open the
  app in its own tab and sign in again" toast, not a generic "review the details" message.
- Settings → Data Management has a "Clear cookies & saved data" control (AlertDialog →
  clears local/session storage + JS cookies + Clerk `signOut()` + reload to BASE_URL) as a
  one-click reset when a session gets stuck.
