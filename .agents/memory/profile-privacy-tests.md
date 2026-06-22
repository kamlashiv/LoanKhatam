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

## Preferences privacy regression test
`src/lib/__tests__/preferences.test.tsx` mirrors the profile test for user
settings (notification choices, WhatsApp number, social handles): same real-
provider + faked-`useAuth`/`global.fetch` shape, same two cases (account switch
non-bleed + late-save non-contamination). Wait for the `isLoading` testid to be
`false` before mutating — the GET seeds defaults and a pre-load click races the
seed effect (which has no pending-patch buffer, unlike ProfileProvider).

A `test` validation command runs `pnpm --filter @workspace/loan-tracker run test`.
As of Task #117 the full suite is GREEN (19 suites / 285 tests); the previously
noted dashboard/planner red suites now pass.
