---
name: Strategy Brief (combined Smart + Financial)
description: How the loan-tracker /strategy "Strategy Brief" fuses both engines and why prepayment must run on outstanding balances.
---

# Strategy Brief

A pure module (`lib/strategy-brief.ts`) composes the two existing engines into one
upload-driven summary shown at the top of `/strategy`:
- Financial Strategy via `computeStrategy` (health, cash flow, debt method, emergency fund, allocation).
- Smart Strategy via `simulatePlan`/`calcEMI` — a "10% extra EMI" prepayment what-if.

**Rule:** the prepayment what-if must simulate each loan's **current outstanding
balance over its remaining tenure**, never the original sanctioned principal/full
tenure. `remainingTenure(outstanding, rate, contractualEMI)` derives the months
left; feed `outstanding` + that tenure into `simulatePlan`.

**Why:** filtering loans by `remainingAmount > 0` but simulating original principal
overstates interest saved / required extra EMI for partially repaid loans — this was
an architect code-review rejection. Aggregation: interestSaved and monthlyExtra are
summed across loans; monthsSaved is the **max** single-loan tenure reduction (UI says
"up to X sooner").

**Upload feeding:** reuses `ImportProfileModal` (exported from `pages/profile.tsx`)
with `onApply={update}` — extracts income/expenses from any supported file and patches
the shared profile, which instantly refreshes the brief. Loans for the prepayment side
come from `useListLoans` (real DB loans), not the profile.
