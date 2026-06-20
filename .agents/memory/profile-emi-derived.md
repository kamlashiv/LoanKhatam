---
name: Loan EMI derived from real loans (global profile)
description: In loan-tracker, profile loan-EMI and the strategy debt list are derived live from DB loans, not stored on the profile; shared expense/surplus helpers take an EMI override.
---

The web **loan-tracker** has one Global Financial Profile as the single source of truth, but **loan EMI and the debts/outstanding figures are NOT stored on the profile** — they are derived live from real DB loans via `useDerivedLoans()` (`src/lib/loan-derive.ts` → `aggregateEmi`, `debtItems`, `totalOutstanding`, `hasLoans`, `isLoading`). The EMI/Outstanding/Your-Debts UIs are read-only with a "Manage" link to `/loans`.

**Why:** the product requires loan figures to derive from real loans and the EMI analyzer to READ/WRITE profile income/expenses rather than own them, so no screen can drift from the actual loan ledger.

**How to apply:**
- Shared helpers `totalFixedExpenses` / `totalExpenses` / `monthlySurplus` in `lib/profile.tsx` take an **optional `emi` override** (defaults to `p.emi` only for pre-migration legacy data). Any screen computing surplus/expenses must pass `derived.aggregateEmi` from `useDerivedLoans()` — dashboard, profile, planner, and the EMI analyzer all do. Forgetting the override silently falls back to stale `profile.emi`.
- The EMI analyzer (`emi-investment-analyzer.tsx`) connects its **Total Loan Amount / Remaining Balance / Current EMI** boxes live to the dashboard figures (total lent, outstanding, monthly EMI) via `useGetDashboardSummary()` + `useDerivedLoans()`; those three are read-only and overridden in `analyzeInputs`, NOT edited locally.
- The analyzer persists its `loan-tracker:emi-invest` localStorage by writing back **only the keys it still owns** (the scenario knobs in `NUMERIC_KEYS`), via `mergeOwnedInputs(existing, inputs)`. Spreading the full `inputs` clobbers externally-owned keys with zeros — `monthlyIncome`/`monthlyExpenses` (profile migration still reads them) and the loan figures (live). This was a review-rejected regression; guarded by `__tests__/emi-invest-storage.test.ts`.
- Domain tension: DB loans are money *lent out*, but the Global Financial Profile treats them as the user's debts for the planner/strategy. Follow the product behavior, not intuition.
