---
name: Loan-tracker social sharing
description: How "share to social media" is implemented in loan-tracker and why it's share-intents, not OAuth.
---

# Loan-tracker social sharing

"Connect all social media to share" is implemented as **share-intent links + Web Share API**, NOT OAuth account connection / auto-posting.

**Why:** real auto-posting to Facebook/Instagram/X/etc. requires per-platform business accounts, app review, and API keys — disproportionate and inappropriate for a personal loan tracker. Share-intent URLs (wa.me, t.me, twitter.com/intent, facebook sharer, mailto) open the user's chosen app with the message pre-filled and need no credentials. `navigator.share` is feature-detected for the native sheet.

**How to apply:** the share message is plain-text and short; Facebook's sharer only carries the link (`u=`), not text — an in-menu note says so. If asked to "really post"/"connect account", set expectations: real auto-posting needs platform OAuth + approvals, not just a button.

**"Add social media account" = store the user's own handles in Settings** (a `socialAccounts` object on UserSettingsData: whatsapp/facebook/instagram/twitter/linkedin/telegram/youtube, nullable strings). It does NOT post on the user's behalf. New optional fields on UserSettingsData must be backward-compatible: merge stored blob over defaults BOTH client-side (preferences normalizeSettings) AND server-side on GET, or legacy rows return a shape that violates the OpenAPI-required schema.
