---
name: Loan-tracker social sharing
description: How "share to social media" is implemented in loan-tracker and why it's share-intents, not OAuth.
---

# Loan-tracker social sharing

"Connect all social media to share" is implemented as **share-intent links + Web Share API**, NOT OAuth account connection / auto-posting.

**Why:** real auto-posting to Facebook/Instagram/X/etc. requires per-platform business accounts, app review, and API keys — disproportionate and inappropriate for a personal loan tracker. Share-intent URLs (wa.me, t.me, twitter.com/intent, facebook sharer, mailto) open the user's chosen app with the message pre-filled and need no credentials. `navigator.share` is feature-detected for the native sheet.

**How to apply:** the message builder is `buildShareMessage` (exported from `components/share-loan.tsx`) — keep it plain-text and short. Facebook's sharer only carries the link (`u=`), not the text — there's an in-menu note saying so. If asked to "really post" to a platform, set expectations: that needs platform OAuth + approvals, not just a button.
