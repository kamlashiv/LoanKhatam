---
name: Live presence + public counter hardening
description: How to make "real" public live counters trustworthy and abuse-resistant (WS presence, in-memory maps).
---

# Live presence + public counter hardening

The loan-tracker landing has a public, unauthenticated live-stats surface
(WebSocket at `/api/ws`, REST `/api/stats|track/visit|activity|likes`). Counters
must be REAL (DB-backed), never placeholder.

## Presence must dedupe by client visitorId, not socket count
**Rule:** "Active visitors online" = unique `visitorId`s currently connected, NOT
`wss.clients.size`. The client sends its persistent `visitorId` as a WS query
param; the server keys presence by it (multiple tabs collapse to one) and caps
connections per visitor.
**Why:** raw socket count is trivially inflated by opening many tabs/sockets — it
makes the "real" counter fake. (architect review rejection)
**How to apply:** any new live-presence metric — track a `Map<visitorId, count>`,
add on connect / remove on close, recompute on change. Anonymous sockets (no id)
count individually under a reserved key.

## In-memory maps on public endpoints need TTL sweep + hard caps
**Rule:** visit-dedupe and per-IP rate-limit `Map`s must have a periodic sweep
(drop expired) AND a size ceiling (clear if exceeded). Use
`setInterval(...).unref()` so cleanup never blocks shutdown.
**Why:** a flood of unique visitorIds/IPs grows unbounded maps → memory DoS on an
unauthenticated endpoint.

## Other notes
- IP from `x-forwarded-for` is spoofable behind a proxy; the rate limiter is a
  soft control (returns current stats, no error). Real like/visit integrity comes
  from the DB unique constraint (one like per visitorId) + time-window dedupe.
- Keep query-param validation (minLength/maxLength) in the OpenAPI spec in lockstep
  with the body schemas and the server check, or valid-by-spec inputs 400.
