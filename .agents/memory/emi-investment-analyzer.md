---
name: EMI vs Investment Analyzer
description: Deterministic EMI-vs-investing comparison in loan-tracker /strategy; engine + UI conventions.
---
The /strategy "Smart Financial Strategy" page hosts an EMI vs Investment Analyzer (engine `analyzeEmiInvestment` in strategy-engine.ts, UI in components/emi-investment-analyzer.tsx). It is a second consumer of SIP/amortization math alongside the planner engine.

**Payoff horizon rule:** if the user supplies remaining tenure it is authoritative; otherwise derive payoff months from amortization of (balance, rate, EMI). When the EMI can't cover the monthly interest the payoff is *unbounded* — surface `payoffUnbounded` and render "Not reachable" instead of a fabricated number. Scenarios/projections fall back to a 120-month (`contributionMonths`) horizon in that case.
**Why:** code review rejected the first cut for using entered tenure blindly and showing 0/garbage debt metrics when tenure was blank but balance/EMI were present.

**Educational invariant:** never promise returns. Investment outputs are framed as "assumed/illustrative"; loan interest saved is "certain". Keep the prominent disclaimer. Never advise skipping an EMI.
