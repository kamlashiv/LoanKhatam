---
name: Smart Financial Strategy engine
description: Debt payoff baseline semantics and persisted-input hardening for the loan-tracker /strategy tab.
---

# Smart Financial Strategy engine (loan-tracker `/strategy`)

Deterministic, no-AI engine in `strategy-engine.ts` consumed by `pages/strategy.tsx` and `lib/export.ts` (PDF). Inputs persist to localStorage key `loan-tracker:strategy-inputs`.

## Debt payoff baseline must NOT roll over freed minimums
`simulatePayoff` takes a `rollover` flag (default true). Snowball/avalanche use `rollover=true` (fixed budget floor; freed minimums cascade to the next-priority debt). The **baseline** must use `rollover=false` so it pays only each *active* debt's own minimum with no redirection.

**Why:** the UI/PDF label the baseline "minimum payments only" / "versus paying only the minimums". With rollover on, the baseline silently cascaded freed minimums, understating baseline months/interest and corrupting `interestSavedVsBaseline` (= baseline.totalInterest − avalanche.totalInterest). This was a code-review rejection.

**How to apply:** any new payoff scenario that claims "minimums only" must pass `rollover=false`. If you add a scenario with a fixed total budget, keep `rollover=true`.

## Unbounded payoffs render "Not reachable"
When payments don't outpace interest, `DebtPayoffResult.unbounded` is true. Every surface that shows a payoff duration (StrategyBox, the two narrative blocks in strategy.tsx, and the PDF debt table) must gate on `unbounded` and show "Not reachable" instead of a month count — otherwise it prints a misleading capped number (MONTH_CAP = 600).

## Persisted inputs must be sanitized, never blind-merged
`loadInputs()` runs parsed JSON through `sanitizeInputs()`: coerce every numeric field, rebuild `loans[]` into well-formed `DebtItem[]` (string id w/ uuid fallback, finite numbers), filter `goals` to `string[]`, validate `riskProfile` against the enum. **Why:** a blind `{...EMPTY_INPUTS, ...JSON.parse(raw)}` let a malformed `loans` value (non-array) reach `.map()` and crash the page.
