---
name: Auth UI is Clerk-owned
description: Sign-in/sign-up screens are Clerk's <SignIn>/<SignUp> components; design redesigns are non-functional mockups unless done via Clerk appearance.
---

The loan-tracker sign-in and sign-up screens are rendered by Clerk's `<SignIn>` / `<SignUp>`
components (App.tsx), styled via `appearance={clerkAppearance}` and `localization` props — they are
NOT custom React forms.

**Why:** matters for any "redesign the login screen" request. You cannot just edit a page file;
the visible card is Clerk-rendered.

**How to apply:**
- Canvas/design-exploration variants of the login are standalone mockups in the mockup-sandbox
  (non-functional, for visual exploration only).
- To actually ship a login redesign, customize Clerk's `appearance` (elements/variables/layout) or
  Clerk Elements — not by replacing the component. See the clerk-auth skill + existing memory notes
  on Clerk card padding and CSS layer ordering.
