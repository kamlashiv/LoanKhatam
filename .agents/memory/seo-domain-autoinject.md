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

**Critical — never fall back to REPLIT_DEV_DOMAIN.** At the autoscale *build
phase* `REPLIT_DOMAINS` is NOT set but `REPLIT_DEV_DOMAIN` IS. An earlier
`resolveBaseUrl` fell back to the dev domain, so production canonical/sitemap/
robots/OG all pointed at the ephemeral `*.sisko.replit.dev` build-container URL —
Google would index the wrong domain. Fix: fall back to the production placeholder
only. Because the placeholder now equals the real prod URL, an empty
`REPLIT_DOMAINS` at build still yields correct prod SEO URLs.

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
