---
name: offline.html / localStorage verification
description: How to verify localStorage-dependent static pages (offline.html) — screenshot harness can't read app localStorage.
---

# Verifying offline.html (and any localStorage-dependent page)

The Replit preview iframe partitions/blocks `localStorage` for the screenshot
harness, the same way it blocks the Clerk cookie (see
`clerk-dev-token-not-refreshing.md`). A seed page that does
`localStorage.setItem(...)` then redirects/iframes into `offline.html` renders
the **empty** fallback in screenshots even though the code is correct — the
seeded data isn't visible to the captured context.

**Why:** burned multiple screenshot attempts chasing a "blank cached view" that
was actually a harness storage-partition artifact, not a bug.

**How to apply:** verify localStorage-dependent static pages with a jsdom jest
test instead of screenshots. Read the html file, regex out the inline
`<script>` and the body markup, set `document.body.innerHTML = markup`, seed
`localStorage`, then run the script via `new Function(script)()`. Assert on the
rendered DOM. To inject data without localStorage, string-replace the snapshot
read call (e.g. `var snap = readSnapshot();`) with a literal object. Add
`/** @jest-environment jsdom */` since loan-tracker's jest default env is node.
See `artifacts/loan-tracker/src/lib/__tests__/offline-cache.test.ts`.
