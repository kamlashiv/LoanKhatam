---
name: Per-user context + cache scoping
description: How to prevent one user's data bleeding into the next account in app-wide React contexts that hold sensitive server state.
---

# Per-user context + query cache scoping

When an app-wide React context (wrapping the whole app, never remounted on its own)
holds per-user server data (e.g. a financial profile), three things must be scoped
to the signed-in user or data bleeds across account switches:

1. **Component state** — key the inner provider by the auth user id so it fully
   remounts on user change: `<Inner key={userId ?? "anon"}>`. This resets all
   useState/useRef (draft, save status, debounce timer, migration flags).
2. **Query cache key** — make the React Query key user-scoped
   (`[...getXQueryKey(), userId ?? "anon"]`) AND write back with the same scoped
   key in any `setQueryData`. A global key lets a late save from user A repopulate
   the key user B reads.
3. **In-flight async writes** — a `mountedRef` set false in cleanup; after any
   `await`, bail before applying results if unmounted, so a save that resolves
   after an account switch can't contaminate the next session.

**Why:** code review on the loan-tracker Global Financial Profile caught exactly
this — keying the provider alone was not enough; the global query key still leaked
via a late `setQueryData` race.

**How to apply:** any future app-wide context resource that is per-user and
sensitive should follow all three. Clerk `useAuth()` exposes `userId`.

**Do NOT auto-migrate browser-global localStorage into a signed-in account.**
Browser-global storage (and a browser-global "migrated" flag) cannot be attributed
to a Clerk user, so on a shared device it replays the first user's legacy data into
whichever account signs in next — a cross-account PII leak. The secure fix is to
*remove* the migration and proactively *purge* leftover legacy keys (and strip
known PII fields from still-in-use keys) on provider mount. This supersedes an
earlier note here that called the global migration flag "correct".
