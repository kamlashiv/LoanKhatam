// Combined "Strategy Brief" — fuses the two strategy engines into a single,
// plain-language summary the user can read at a glance:
//   • Financial Strategy  → `computeStrategy` (health, cash flow, debt method,
//     emergency fund, investing allocation)
//   • Smart Strategy      → `simulatePlan` prepayment what-if across real loans
//
// This module is pure (no React, no I/O) so it stays easy to unit test and can
// be reused by any screen or export.
import {
  computeStrategy,
  monthsToLabel,
  compactRupees,
  type StrategyInputs,
  type StrategyResult,
} from "./strategy-engine";
import { calcEMI, simulatePlan } from "./planner-engine";

/** A loan reduced to just the fields a prepayment simulation needs. */
export interface BriefLoan {
  name: string;
  /** Original sanctioned amount — used to derive the contractual EMI. */
  principal: number;
  /** Current outstanding balance — what the prepayment what-if runs against. */
  outstanding: number;
  /** Annual interest rate as a percentage, e.g. 12 for 12%. */
  rate: number;
  tenureMonths: number | null;
}

/** Result of the "pay a little extra EMI" what-if, aggregated across loans. */
export interface PrepaymentBrief {
  /** True when at least one loan could be simulated (principal + tenure known). */
  applicable: boolean;
  loanCount: number;
  /** Total extra EMI/month across all simulated loans. */
  monthlyExtra: number;
  /** Total interest saved vs. paying only the base EMI. */
  interestSaved: number;
  /** Largest tenure reduction among the loans (months). */
  monthsSaved: number;
}

export type BriefTone = "good" | "warn" | "tip";
export interface BriefPoint {
  tone: BriefTone;
  text: string;
}

export interface StrategyBriefData {
  hasData: boolean;
  strategy: StrategyResult;
  prepayment: PrepaymentBrief;
  headline: string;
  points: BriefPoint[];
}

// Matches the planner's "10% Monthly Boost" preset so the brief and the Smart
// Strategy page tell a consistent story.
const EXTRA_PCT = 0.1;

/**
 * Given the outstanding balance, annual rate and contractual EMI, return the
 * number of months left to clear the loan. Returns null when the loan can't be
 * amortised (EMI doesn't cover the first month's interest) or the balance is
 * already cleared.
 */
export function remainingTenure(
  outstanding: number,
  annualRatePct: number,
  emi: number,
): number | null {
  if (!(outstanding > 0) || !(emi > 0)) return null;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return Math.ceil(outstanding / emi);
  const interestFirstMonth = outstanding * r;
  if (emi <= interestFirstMonth) return null; // payment never outpaces interest
  const n = -Math.log(1 - (outstanding * r) / emi) / Math.log(1 + r);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.ceil(n);
}

/**
 * Simulate paying ~10% extra EMI on every loan and aggregate the savings. The
 * what-if runs against each loan's *current outstanding balance* over its
 * *remaining* tenure (derived from the contractual EMI), so partially repaid
 * loans aren't overstated. Loans without a principal or fixed tenure are
 * skipped (open-ended loans have no fixed schedule to accelerate).
 */
export function buildPrepaymentBrief(loans: BriefLoan[]): PrepaymentBrief {
  let loanCount = 0;
  let monthlyExtra = 0;
  let interestSaved = 0;
  let monthsSaved = 0;

  for (const l of loans) {
    if (!(l.principal > 0) || !l.tenureMonths || l.tenureMonths <= 0) continue;
    const outstanding = l.outstanding > 0 ? l.outstanding : l.principal;
    const baseEMI = calcEMI(l.principal, l.rate, l.tenureMonths);
    if (!(baseEMI > 0)) continue;
    const remMonths = remainingTenure(outstanding, l.rate, baseEMI);
    if (!remMonths || remMonths <= 0) continue;
    const extraEMI = Math.round(baseEMI * EXTRA_PCT);
    if (extraEMI <= 0) continue;

    const base = simulatePlan({
      principal: outstanding,
      rate: l.rate,
      tenureMonths: remMonths,
      extraEMI: 0,
    });
    const accelerated = simulatePlan({
      principal: outstanding,
      rate: l.rate,
      tenureMonths: remMonths,
      extraEMI,
    });

    loanCount += 1;
    monthlyExtra += extraEMI;
    interestSaved += Math.max(0, base.totalInterest - accelerated.totalInterest);
    monthsSaved = Math.max(monthsSaved, base.payoffMonths - accelerated.payoffMonths);
  }

  return {
    applicable: loanCount > 0,
    loanCount,
    monthlyExtra: Math.round(monthlyExtra),
    interestSaved: Math.round(interestSaved),
    monthsSaved: Math.max(0, monthsSaved),
  };
}

/**
 * Build the combined brief from the user's financial profile inputs and their
 * real loans. Returns both the raw engine results (for charts/numbers) and a
 * prioritised list of plain-language talking points.
 */
export function buildStrategyBrief(
  inputs: StrategyInputs,
  loans: BriefLoan[],
): StrategyBriefData {
  const strategy = computeStrategy(inputs);
  const prepayment = buildPrepaymentBrief(loans);
  const hasData =
    strategy.totalIncome > 0 || strategy.totalExpenses > 0 || strategy.totalDebt > 0;

  const headline = hasData
    ? `Your financial health is ${strategy.healthCategory} — ${strategy.healthScore}/100.`
    : "Upload a statement or add your income & expenses to generate your brief.";

  const points: BriefPoint[] = [];
  if (hasData) {
    // ── Financial Strategy: cash flow ──
    if (strategy.freeCashFlow >= 0) {
      points.push({
        tone: "good",
        text: `You keep ${compactRupees(strategy.freeCashFlow)}/month free after expenses — a ${Math.round(strategy.savingsRate * 100)}% savings rate.`,
      });
    } else {
      points.push({
        tone: "warn",
        text: `You're overspending by ${compactRupees(Math.abs(strategy.freeCashFlow))}/month — trim expenses before investing.`,
      });
    }

    // ── Financial Strategy: debt elimination ──
    if (strategy.hasDebt) {
      const rec = strategy.recommendedStrategy === "avalanche" ? "Avalanche" : "Snowball";
      if (strategy[strategy.recommendedStrategy].unbounded) {
        points.push({
          tone: "warn",
          text: `Your payments don't yet outpace interest on ${compactRupees(strategy.totalDebt)} of debt — raise your monthly payment to start clearing it.`,
        });
      } else {
        points.push({
          tone: "tip",
          text: `Clear ${compactRupees(strategy.totalDebt)} of debt in ${monthsToLabel(strategy[strategy.recommendedStrategy].months)} with the ${rec} method, saving ~${compactRupees(strategy.interestSavedVsBaseline)} in interest.`,
        });
      }
    } else {
      points.push({
        tone: "good",
        text: "No active debt — direct your free cash flow at savings and investing.",
      });
    }

    // ── Smart Strategy: prepayment what-if ──
    if (prepayment.applicable && prepayment.interestSaved > 0) {
      const sooner =
        prepayment.monthsSaved > 0
          ? `, clearing them up to ${monthsToLabel(prepayment.monthsSaved)} sooner`
          : "";
      points.push({
        tone: "tip",
        text: `Smart move: an extra ~${compactRupees(prepayment.monthlyExtra)}/month on your EMIs saves ~${compactRupees(prepayment.interestSaved)} in interest${sooner}.`,
      });
    }

    // ── Financial Strategy: emergency fund ──
    if (strategy.emergencyMonthsToGoal === 0) {
      points.push({
        tone: "good",
        text: `Emergency fund is in place — ${compactRupees(strategy.emergencyFundRequirement)} covered.`,
      });
    } else if (strategy.emergencyMonthsToGoal === null) {
      points.push({
        tone: "warn",
        text: `Build an emergency fund of ${compactRupees(strategy.emergencyFundRequirement)} — free up some cash flow to begin.`,
      });
    } else {
      points.push({
        tone: "tip",
        text: `Reach a ${compactRupees(strategy.emergencyFundRequirement)} emergency fund in about ${strategy.emergencyMonthsToGoal} months at your saving rate.`,
      });
    }

    // ── Financial Strategy: investing allocation ──
    if (strategy.monthlySavingTarget > 0 && strategy.allocation.length > 0) {
      const mix = strategy.allocation
        .map((a) => `${a.pct}% ${a.name.replace(" Funds", "")}`)
        .join(", ");
      points.push({
        tone: "tip",
        text: `Invest ${compactRupees(strategy.monthlySavingTarget)}/month in a ${inputs.riskProfile} mix: ${mix}.`,
      });
    }
  }

  return { hasData, strategy, prepayment, headline, points };
}
