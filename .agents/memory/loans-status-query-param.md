---
name: Loans list status query param
description: LoansList honors ?status= — a contract the sidebar overdue CTA depends on
---

The All Loans page (`/loans`) seeds its active status-filter tab from a `?status=`
query param (`all|active|overdue|paid`, validated against an allowlist; bad values
fall back to `all`).

**Why:** The sidebar "Stay on top" card links "Review Now" → `/loans?status=overdue`.
Without query-param seeding the link lands on an unfiltered list and the deep-link
is silently broken. This was a real regression caught in review.

**How to apply:** If you change the loans filter UI or the sidebar/dashboard CTAs,
keep the param names in sync. Seeding is mount-only (`useState(initialStatus)`); if
in-place query changes ever need to update the tab, add a `useEffect` on the search
string.
