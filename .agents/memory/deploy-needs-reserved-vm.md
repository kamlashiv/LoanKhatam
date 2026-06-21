---
name: Loan-tracker Autoscale publish + live-stats removal
description: Why publish failed on Autoscale and how it was resolved (live-stats/WS feature removed)
---

# Autoscale publish: live-stats/WebSocket feature removed

The loan-tracker publish failed at the **promote step** — build fully succeeded
(image pushed), then `Creating Autoscale service` retried 3× and gave up, with
no startup-probe logs and no runtime logs captured. App-level checks all passed
(prod build starts, `/api/healthz`→200, binds 0.0.0.0:8080, all secrets present).

**Root cause:** the api-server was Autoscale-hostile — a persistent WebSocket
server (`/api/ws`) for live site-stats, live state held in process memory
(presence/activity/rate-limit Maps + counters), and always-on background timers
(30s WS heartbeat + 5-min sweep). Autoscale = stateless Cloud Run that scales to
zero and is request-scoped, so that design cannot work there.

**Resolution chosen by user:** keep Autoscale (cheaper), remove the live-stats /
WebSocket feature entirely rather than switch to Reserved VM. The whole feature
was deleted end-to-end: backend WS wiring in `index.ts` (now plain
`app.listen` + error handler), `lib/site-stats.ts`, `routes/site.ts` and its
mount; frontend `components/live-stats.tsx`, `lib/site-stats.ts`, and the
`<LiveStats/>` landing section; OpenAPI `site` tag/paths/schemas (then codegen);
unused `ws`/`@types/ws` deps. The `site_visits`/`site_likes` tables were left in
the DB schema (unused but harmless, no migration).

**Why:** the app is now a clean stateless service that fits Autoscale.
**How to apply:** if a future feature needs persistent WebSockets, in-memory
shared state, or always-on background work, it will not work on Autoscale —
either move that state to the DB/an external store or switch the deployment to
Reserved VM. If a re-publish still fails at `Creating Autoscale service` with no
app logs now that the app is stateless, treat it as a platform/deploy-layer
issue (retry or contact support), not an app bug.
