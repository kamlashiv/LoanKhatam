---
name: Profile privacy tests & loan-tracker jest env
description: How cross-account profile isolation is tested, plus jsdom/global-fetch quirks and known pre-existing red suites in loan-tracker.
---

# Profile privacy regression test

`artifacts/loan-tracker/src/lib/__tests__/profile.test.tsx` guards the
cross-account data-bleed fix. It runs the REAL `ProfileProvider`, REAL React
Query client and REAL generated API hooks; only `@clerk/react` `useAuth` and
`global.fetch` are faked (a per-user in-memory backend). Two cases: (1) A fills
profile → switch to B → B sees empty; (2) A's save held in-flight, switch to B,
then resolve → B view + B cache uncontaminated.

**Why this shape:** mocking the hooks would only test the mock, not the actual
per-user query-key + remount + mountedRef guard. Driving real hooks via a faked
network exercises all three protections.

## jsdom env quirk (loan-tracker jest)
testEnvironment is `node` by default; tests opt into jsdom via
`@jest-environment jsdom`. In that env `Headers` and `URL` exist but
`fetch`, `Request`, `Response` do NOT. To fake the network, assign
`global.fetch` and return a minimal Response-like object
(`{ ok, status, statusText, headers: new Headers(...), body: {}, text: async () => json }`) —
`body` must be non-null or `customFetch` treats it as an empty body.

## Pre-existing red suites (NOT caused by privacy work)
`src/pages/__tests__/dashboard.test.tsx` and `planner.test.tsx` fail (~12 tests)
because those pages now consume `useProfile`/`useTheme`/`useDerivedLoans` without
providers in the tests AND assert against the older pre-bento-redesign UI
(e.g. card labels "Overdue Loans"/"Total Loans", `div.relative.overflow-hidden`
selector). Fixing needs provider mocks (jest.requireActual + override
`useProfile`/`useDerivedLoans`, wrap in ThemeProvider) AND rewritten assertions
for the redesigned bento layout. Tracked as a follow-up.

A `test` validation command runs `pnpm --filter @workspace/loan-tracker run test`.
