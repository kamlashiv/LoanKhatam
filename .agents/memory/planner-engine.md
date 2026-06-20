---
name: Loan Payoff Planner engine
description: Design decisions for the standalone Planner's amortization simulation (loan-tracker web).
---

# Loan Payoff Planner engine

The standalone `/planner` page runs its own in-browser amortization simulation (separate from the per-loan bank-style schedule). Key decisions:

- **Baseline vs plan.** Baseline = same loan context as plan (principal/rate/tenure **and** the configured top-up) but with NO acceleration (extraEMI=0, no lumps). Plan adds recurring extra EMI + per-year lumps + strategy presets. `interestSaved`/`monthsSaved` are `Math.max(0, baseline - plan)`.
  **Why:** if baseline excluded the top-up while plan included it, the deltas would compare two different loan definitions and overstate/distort savings (caught in code review). Baseline must isolate the *prepayment* effect for whatever loan is configured.
  **How to apply:** strategy-card savings sims must also pass the same `topUp` so each card compares against the same baseline. The "Net Principal" headline must read `plan.totalPrincipalBorrowed` (engine truth), not `principal + topUp.amount` — a top-up only counts once its disbursal month is actually reached.

- **Per-month accounting invariant.** Each month records `emi` as the *actual installment paid* (`interest + scheduled principal`), not the nominal EMI. In the final/overpay month the installment is reduced to clear the exact balance and extra is zeroed. This keeps `sum(emi) + sum(extra) === sum(interest) + sum(principal)` and year/CSV/PDF totals consistent.
  **Why:** a prior version recorded the full nominal EMI in the payoff month, inflating ledger/export totals (caught in code review).
  **How to apply:** if you change the simulation loop, re-verify the reconciliation holds (emi+extra == interest+principal) and that the final closing balance is 0.

- **Top-up modeling.** At its disbursement month the top-up amount is added to the balance, the rate is blended weighted by outstanding balance, and the EMI is recomputed over the remaining tenure (so payoff still targets the original tenure). The top-up month is clamped to `[1, tenureMonths]` in the UI/export/simulation so they never disagree.

- **Editable ledger.** The year-by-year ledger's "Extra Prepaid" input edits a `yearLumps` map applied as a one-time lump at each year's last month; strategy presets populate it uniformly. This (plus the editable AI-extraction review card) is how the page satisfies "permission to edit the data".
