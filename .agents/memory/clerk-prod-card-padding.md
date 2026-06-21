---
name: Clerk sign-in card layout breaks only in production
description: Why the Clerk card loses padding (full-width buttons bleed to edges) in prod builds but looks fine in dev, and the robust fix.
---

# Clerk card padding/layout breaks in production only

Symptom: the Clerk `<SignIn>`/`<SignUp>` card renders fine in dev, but in the
**published** build the card content (full-width Continue button, social
buttons, the "Last used" badge) bleeds to the card edges — the card's internal
horizontal padding is gone.

Root cause: Clerk injects its component CSS (incl. the card's default padding)
at **runtime** into the `clerk` cascade layer. Tailwind v4 prod builds emit a
**second, duplicate `@layer` declaration that omits `clerk`** (e.g.
`@layer theme,base,components,utilities;`). That resets the cascade so
Tailwind's preflight reset beats Clerk's clerk-layer padding, zeroing it.
Confirm by grepping the built CSS in `dist/public/assets/*.css` for
`@layer` declarations and for `cl-card` rules (the latter are absent — they're
runtime-injected, not static).

**Why the documented gotchas are NOT enough on their own:** the
`@layer theme, base, clerk, components, utilities;` line in index.css and
`tailwindcss({ optimize: false })` in vite.config help but do not stop the
duplicate layer declaration from dropping Clerk out of the cascade.

**Robust fix:** stop depending on Clerk's layer surviving. Set the critical
layout (padding etc.) explicitly on the Clerk `appearance.elements` with
`!important` Tailwind utilities, which always ship in the `utilities` layer.
E.g. in `artifacts/loan-tracker/src/App.tsx` `clerkAppearance.elements.card`:
`"... !px-8 !py-8"`.

**How to verify a Clerk styling fix for prod:** dev screenshots are useless
here — reproduce the prod build with
`PORT=5000 BASE_PATH=/ NODE_ENV=production pnpm --filter @workspace/loan-tracker run build`
(both PORT and BASE_PATH are required or vite.config throws), then grep the
emitted CSS to confirm your override is present and `!important`. Clean up
`dist/` afterward.
