---
name: SEO domain auto-injection
description: How loan-tracker fills canonical/OG/robots/sitemap/JSON-LD with the real published domain at build time.
---

loan-tracker's public SEO URLs are NOT hardcoded to a domain. The source files
(`index.html`, `public/robots.txt`, `public/sitemap.xml`) all use the literal
placeholder `https://ledger.replit.app`. A post-build step `seo.mjs` (runs in the
`build` script after `prerender.mjs`) string-replaces that placeholder in the
built `dist/public/*` with the real domain from `process.env.REPLIT_DOMAINS`
(first entry), falling back to `REPLIT_DEV_DOMAIN`, then the placeholder. It also
injects a JSON-LD `WebApplication` block into the built index.html.

**Why:** the user is non-technical and repeatedly could not supply their published
`.replit.app` URL (kept pasting the editor `replit.com/@...` link or the literal
`REPLACE-ME.replit.app` placeholder). `REPLIT_DOMAINS` is set to the real
deployment domain at deploy/build time, so this removes any manual URL step —
publishing alone makes every SEO asset point at the live address.

**How to apply:** keep the placeholder token identical across all three source
files and in `seo.mjs`. If you add public routes, add them to `sitemap.xml` with
the same placeholder. `seo.mjs` is intentionally non-fatal (try/catch, never
throws) like `prerender.mjs`, so SEO can't break a deploy. Verify locally with
`BASE_PATH=/ PORT=5000 pnpm --filter @workspace/loan-tracker run build` then grep
`dist/public/{robots.txt,sitemap.xml,index.html}`.
