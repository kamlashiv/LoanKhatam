---
name: Loan-tracker must deploy as Reserved VM, not Autoscale
description: Why the api-server's publish fails on Autoscale and which deployment target is correct
---

# Deployment target: Reserved VM (not Autoscale)

The loan-tracker publish fails at the **promote step** — build phase fully
succeeds (image pushed), then `Creating Autoscale service` retries 3× and gives
up, with **no startup-probe logs and no runtime logs** captured.

App-level diagnostics all PASS, so the app is not the proximate bug:
- prod run command (`node dist/index.mjs`, PORT=8080, NODE_ENV=production)
  starts cleanly locally and returns 200 on the configured probe path
  `/api/healthz`; binds 0.0.0.0:8080.
- all required secrets are present as global secrets (Clerk, DATABASE_URL,
  SESSION_SECRET, AI_INTEGRATIONS_*). Nothing throws eagerly at boot
  (Clerk middleware is per-request lazy).

**Why:** the api-server is architecturally Autoscale-hostile. It runs a
persistent WebSocket server (`/api/ws`) for live site-stats, keeps live state
in process memory (presence/activity/rate-limit Maps + counters in
`lib/site-stats.ts`), and runs always-on background timers (30s WS heartbeat in
`index.ts`, 5-min sweep in site-stats). Autoscale = stateless Cloud Run that
scales to zero and is request-scoped, so even if it published the live feature
would be broken across instances.

**How to apply:** recommend the user switch the deployment type to **Reserved
VM** in the Deployments pane (deployment type is NOT programmatically
changeable — `.replit` shows `deploymentTarget = "autoscale"` but the user must
change it in the pane). Alternative only if they insist on Autoscale: remove the
WS/live-stats feature and move any shared state to the DB, and drop the
background timers. Reserved VM is the honest fit for this app.
