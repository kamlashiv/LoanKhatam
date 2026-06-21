---
name: "Smart Strategy" nav label maps to /planner
description: Which loan-tracker page the user means by "smart strategy", and the planner→create-loan prefill convention.
---

In loan-tracker's sidebar (`components/layout.tsx`), the nav labels do NOT match the route names:
- `/planner` (planner.tsx, h1 "Smart Strategy") is labeled **"Smart Strategy"**.
- `/strategy` (strategy.tsx, h1 "Smart Financial Strategy") is labeled **"Financial Strategy"**.

So when the user says "smart strategy", they mean the **Planner** page, not strategy.tsx.

**Prefill convention:** any "Add Loan" / "Save as Loan" CTA that sends the user to `/loans/new`
must carry the configured plan as query params (`borrowerName, principalAmount, interestRate,
tenureMonths, startDate`), because the LoanForm reads those URL params to pre-fill. A bare
`/loans/new` link opens a blank form and makes "create loan from the planner" feel broken.

**Why:** a report of "create loan button not working" from the Smart Strategy page was actually
the planner CTAs linking to a blank form (losing the user's configured loan). The fix mirrors the
existing file-extract `saveQuery` prefill. Keep all planner→create-loan links carrying the params.
