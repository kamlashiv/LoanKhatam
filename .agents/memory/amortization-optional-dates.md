---
name: Amortization optional/empty dates
description: Why monthsBetween must short-circuit invalid/empty dates to 0 before any amortization math runs.
---

# Amortization helpers must guard empty/invalid dates

`monthsBetween(from, to)` must return `0` when either date is empty or invalid
(`isNaN(new Date(x).getTime())`).

**Why:** `Math.max(0, NaN)` returns `NaN`, not `0`. With optional start/due dates,
an empty `dueDate` ("") flows into `monthsBetween` → `NaN` tenure. The
`tenureMonths <= 0` guards in `calculateAmortization` / `calculateBankStyleSchedule`
do NOT trip on `NaN` (`NaN <= 0` is false), so EMI math runs and renders `NaN` in
the UI. The "schedule unavailable" guard in `amortization-section.tsx` checks
`tenureMonths === 0`, which `NaN` also fails.

**How to apply:** Keep the `isNaN` short-circuit at the top of `monthsBetween` so
missing-date loans resolve to `tenureMonths: 0` (empty schedule, ₹0), which trips
the existing "schedule unavailable" state cleanly. The amortization engine is
copied into both `loan-tracker` and `bento-planner` — apply the same guard to any
copy. `resolveScheduleDates` may legitimately return `dueDate: ""` when neither a
due date nor a tenure is known; that empty string is expected and must be handled
downstream, not patched away there.
