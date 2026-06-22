---
name: SEO domain auto-injection
description: How loan-tracker fills canonical/OG/robots/sitemap/JSON-LD with the real published domain at build time.
---

loan-tracker's public SEO URLs are NOT hardcoded inline. The source files
(`index.html`, `public/robots.txt`, `public/sitemap.xml`) all use the literal
placeholder, which MUST equal the real production domain
`https://loan-khatam.replit.app` (the published autoscale URL). A post-build step
`seo.mjs` (runs in the `build` script after `prerender.mjs`) string-replaces that
placeholder in built `dist/public/*` with `process.env.REPLIT_DOMAINS` (first
entry) when set; otherwise it KEEPS the placeholder. It also injects a JSON-LD
`WebApplication` block into the built index.html.

**Critical — at the autoscale BUILD phase, `REPLIT_DOMAINS` itself holds the
ephemeral dev domain, NOT the published `*.replit.app`.** Verified on the live
deploy: canonical/og/robots/sitemap all came out as
`https://<id>.sisko.replit.dev` even though `resolveBaseUrl` uses
`REPLIT_DOMAINS` first — because that var is populated with the build
container's `*.replit.dev` host during the deploy build. (Removing only the
`REPLIT_DEV_DOMAIN` fallback was NOT enough.) Fix: `resolveBaseUrl` must FILTER
OUT any host matching `/\.replit\.dev$|\.repl\.co$/i` from `REPLIT_DOMAINS`, then
fall back to the production placeholder. At runtime the real `*.replit.app`
domain survives the filter; at build the dev host is dropped and the placeholder
(which equals the real prod URL) wins. Verify by building with
`REPLIT_DOMAINS="<anything>.sisko.replit.dev"` set and grepping dist for the
prod URL.

**Why:** the user is non-technical and repeatedly could not supply their published
`.replit.app` URL (kept pasting the editor `replit.com/@...` link or the literal
`REPLACE-ME.replit.app` placeholder). `REPLIT_DOMAINS` is set to the real
deployment domain at deploy/build time, so this removes any manual URL step —
publishing alone makes every SEO asset point at the live address.

**WebApplication injection guard:** `seo.mjs` injects the WebApplication JSON-LD
only if the built HTML lacks one. Guard on the `"WebApplication"` type string
specifically, NOT a generic `application/ld+json` check — the prerendered landing
page already emits its own FAQPage JSON-LD, so a generic check would silently
suppress the WebApplication block. Both schemas must coexist (WebApplication in
`<head>`, FAQPage inside the prerendered `#root`).

**How to apply:** keep the placeholder token identical across all three source
files and in `seo.mjs`. If you add public routes, add them to `sitemap.xml` with
the same placeholder. `seo.mjs` is intentionally non-fatal (try/catch, never
throws) like `prerender.mjs`, so SEO can't break a deploy. Verify locally with
`BASE_PATH=/ PORT=5000 pnpm --filter @workspace/loan-tracker run build` then grep
`dist/public/{robots.txt,sitemap.xml,index.html}`.
