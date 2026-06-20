// Planner amortization engine — drives the standalone Loan Payoff Planner.
// Supports a recurring extra EMI, one-time yearly lump prepayments (editable
// in the ledger), and an optional top-up loan disbursed mid-tenure.

export interface TopUp {
  amount: number;
  rate: number;
  month: number; // 1-based month offset from loan start when the top-up is disbursed
}

export interface PlannerInput {
  principal: number;
  rate: number; // annual %
  tenureMonths: number;
  extraEMI: number; // recurring extra paid every month
  /** 1-based month from which the recurring extra EMI starts (default 1). */
  extraStartMonth?: number;
  /** One-time lump prepayments keyed by 1-based month index. */
  lumpPrepayments?: Record<number, number>;
  topUp?: TopUp | null;
}

export interface PlannerMonthRow {
  month: number; // 1-based
  opening: number;
  emi: number;
  extra: number; // recurring extra + any lump applied this month
  interest: number;
  principal: number; // principal component including extra
  closing: number;
  topUp: number; // amount disbursed this month (0 if none)
}

export interface PlannerYearRow {
  year: number; // 1-based
  monthsInYear: number;
  opening: number;
  emiPaid: number;
  extraPaid: number;
  interest: number;
  principal: number;
  closing: number;
}

export interface PlannerResult {
  baseEMI: number;
  months: PlannerMonthRow[];
  years: PlannerYearRow[];
  payoffMonths: number;
  totalInterest: number;
  totalPrincipalBorrowed: number; // principal + top-up amount
  totalPaid: number; // principal borrowed + total interest
}

export function calcEMI(principal: number, annualRate: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function simulatePlan(input: PlannerInput): PlannerResult {
  const { principal, rate, tenureMonths, extraEMI } = input;
  const extraStartMonth = Math.max(1, Math.round(input.extraStartMonth ?? 1));
  const lumps = input.lumpPrepayments ?? {};
  const topUp = input.topUp && input.topUp.amount > 0 ? input.topUp : null;

  const baseEMI = r2(calcEMI(principal, rate, tenureMonths));

  if (tenureMonths <= 0 || principal <= 0) {
    return {
      baseEMI: 0,
      months: [],
      years: [],
      payoffMonths: 0,
      totalInterest: 0,
      totalPrincipalBorrowed: 0,
      totalPaid: 0,
    };
  }

  const months: PlannerMonthRow[] = [];
  let balance = principal;
  let activeRate = rate;
  let emi = baseEMI;
  let totalInterest = 0;
  let topUpBorrowed = 0;

  // A generous cap: recomputing EMI on top-up keeps payoff within the original
  // tenure, and extra payments only shorten it, but pad a little for rounding.
  const cap = tenureMonths + 2;

  for (let m = 1; m <= cap; m++) {
    if (balance <= 0) break;

    let topUpThisMonth = 0;
    if (topUp && m === topUp.month) {
      // Blend the rate by outstanding balance and recompute the EMI so the
      // (now larger) loan still targets the original payoff month.
      const combined = balance + topUp.amount;
      activeRate =
        combined > 0
          ? (balance * activeRate + topUp.amount * topUp.rate) / combined
          : activeRate;
      balance = combined;
      topUpBorrowed += topUp.amount;
      topUpThisMonth = topUp.amount;
      const remaining = Math.max(1, tenureMonths - m + 1);
      emi = r2(calcEMI(balance, activeRate, remaining));
    }

    const opening = balance;
    const monthlyRate = activeRate / 12 / 100;
    const interest = r2(opening * monthlyRate);

    const lump = lumps[m] ?? 0;
    const recurringExtra = m >= extraStartMonth ? extraEMI : 0;
    const desiredExtra = recurringExtra + lump;

    // Scheduled principal from the regular installment.
    let schedPrincipal = emi - interest;
    if (schedPrincipal < 0) schedPrincipal = 0;

    let extraApplied = desiredExtra;
    const isLastScheduled = m === tenureMonths;

    if (isLastScheduled || schedPrincipal >= opening) {
      // Final installment (or one large enough on its own) clears the balance;
      // no extra prepayment is needed this month.
      schedPrincipal = opening;
      extraApplied = 0;
    } else if (schedPrincipal + extraApplied >= opening) {
      // Installment plus part of the extra clears the balance.
      extraApplied = opening - schedPrincipal;
    }

    const principalPaid = schedPrincipal + extraApplied;
    // Record the EMI actually paid (interest + scheduled principal). In the
    // final/overpay month this is the real adjusted installment, so the ledger
    // and export totals stay consistent (emi + extra === interest + principal).
    const emiPaidThisMonth = interest + schedPrincipal;
    const closing = r2(Math.max(0, opening - principalPaid));

    months.push({
      month: m,
      opening: r2(opening),
      emi: r2(emiPaidThisMonth),
      extra: r2(extraApplied),
      interest,
      principal: r2(principalPaid),
      closing,
      topUp: r2(topUpThisMonth),
    });

    totalInterest += interest;
    balance = closing;
  }

  const payoffMonths = months.length;

  // Aggregate into calendar-style years of 12 months.
  const years: PlannerYearRow[] = [];
  for (let i = 0; i < months.length; i += 12) {
    const slice = months.slice(i, i + 12);
    const opening = slice[0].opening;
    const closing = slice[slice.length - 1].closing;
    years.push({
      year: Math.floor(i / 12) + 1,
      monthsInYear: slice.length,
      opening: r2(opening),
      emiPaid: r2(slice.reduce((s, r) => s + r.emi, 0)),
      extraPaid: r2(slice.reduce((s, r) => s + r.extra, 0)),
      interest: r2(slice.reduce((s, r) => s + r.interest, 0)),
      principal: r2(slice.reduce((s, r) => s + r.principal, 0)),
      closing: r2(closing),
    });
  }

  const totalPrincipalBorrowed = r2(principal + topUpBorrowed);

  return {
    baseEMI,
    months,
    years,
    payoffMonths,
    totalInterest: r2(totalInterest),
    totalPrincipalBorrowed,
    totalPaid: r2(totalPrincipalBorrowed + totalInterest),
  };
}

/**
 * Smart payoff strategy presets. Each returns the recurring extra EMI and the
 * uniform yearly lump prepayment to apply, given the current loan parameters.
 */
export interface StrategyResult {
  extraEMI: number;
  yearlyLump: number;
}

export interface StrategyPreset {
  id: string;
  title: string;
  description: string;
  compute: (baseEMI: number, principal: number) => StrategyResult;
}

export const STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: "one-extra-emi",
    title: "1 Extra EMI / Year",
    description: "Prepay one full EMI once a year — without straining your budget.",
    compute: (baseEMI) => ({ extraEMI: 0, yearlyLump: r2(baseEMI) }),
  },
  {
    id: "round-up",
    title: "Micro-Savings (5% Monthly)",
    description: "An extra 5% of the EMI every month — small step, big savings.",
    compute: (baseEMI) => ({ extraEMI: r2(baseEMI * 0.05), yearlyLump: 0 }),
  },
  {
    id: "ten-percent",
    title: "10% Monthly Boost",
    description: "Pay an extra 10% of the EMI each month to cut your tenure faster.",
    compute: (baseEMI) => ({ extraEMI: r2(baseEMI * 0.1), yearlyLump: 0 }),
  },
  {
    id: "super-saver",
    title: "Super-Saver Combo",
    description: "10% extra monthly + 1 extra EMI a year — maximum savings.",
    compute: (baseEMI) => ({ extraEMI: r2(baseEMI * 0.1), yearlyLump: r2(baseEMI) }),
  },
];

/**
 * Reverse calculator: given a target payoff in `targetMonths`, return the total
 * monthly payment required and the extra over the base EMI.
 */
export function reverseFromTargetMonths(
  principal: number,
  rate: number,
  baseEMI: number,
  targetMonths: number
): { requiredPayment: number; requiredExtra: number } {
  if (targetMonths <= 0 || principal <= 0) {
    return { requiredPayment: 0, requiredExtra: 0 };
  }
  const requiredPayment = r2(calcEMI(principal, rate, targetMonths));
  return {
    requiredPayment,
    requiredExtra: r2(Math.max(0, requiredPayment - baseEMI)),
  };
}
