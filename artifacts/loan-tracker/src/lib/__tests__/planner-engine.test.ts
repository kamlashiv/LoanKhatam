import {
  calcEMI,
  simulatePlan,
  reverseFromTargetMonths,
  STRATEGY_PRESETS,
  type PlannerInput,
  type PlannerResult,
} from "../planner-engine";

// Every schedule row must satisfy the core accounting identity:
//   emi + extra === interest + principal
// (the planner records the *actual* installment paid each month, including the
// adjusted final / overpay installment, so ledger and export totals reconcile).
function expectRowIdentity(result: PlannerResult): void {
  for (const row of result.months) {
    expect(row.emi + row.extra).toBeCloseTo(row.interest + row.principal, 1);
  }
}

function expectNoNegativeBalances(result: PlannerResult): void {
  for (const row of result.months) {
    expect(row.opening).toBeGreaterThanOrEqual(0);
    expect(row.closing).toBeGreaterThanOrEqual(0);
  }
}

describe("calcEMI", () => {
  it("computes the standard reducing-balance EMI for an interest-bearing loan", () => {
    // ₹10,00,000 at 9% for 120 months → ≈ ₹12,667.58
    expect(calcEMI(1_000_000, 9, 120)).toBeCloseTo(12667.58, 1);
  });

  it("splits the principal evenly when the rate is zero", () => {
    expect(calcEMI(120000, 0, 12)).toBe(10000);
  });

  it("returns 0 for non-positive months or principal", () => {
    expect(calcEMI(0, 9, 120)).toBe(0);
    expect(calcEMI(100000, 9, 0)).toBe(0);
    expect(calcEMI(100000, 9, -5)).toBe(0);
  });
});

describe("simulatePlan — baseline schedule (no extra / no top-up)", () => {
  const input: PlannerInput = {
    principal: 1_000_000,
    rate: 9,
    tenureMonths: 120,
    extraEMI: 0,
  };
  const result = simulatePlan(input);

  it("pays off exactly at the contractual tenure", () => {
    expect(result.payoffMonths).toBe(120);
    expect(result.months).toHaveLength(120);
  });

  it("computes the base EMI", () => {
    expect(result.baseEMI).toBeCloseTo(12667.58, 1);
  });

  it("ends with a zero closing balance", () => {
    expect(result.months[result.months.length - 1].closing).toBe(0);
  });

  it("records no extra payments and no top-up borrowing", () => {
    expect(result.months.every((m) => m.extra === 0)).toBe(true);
    expect(result.months.every((m) => m.topUp === 0)).toBe(true);
    expect(result.totalPrincipalBorrowed).toBe(1_000_000);
  });

  it("keeps the emi+extra === interest+principal identity every month", () => {
    expectRowIdentity(result);
    expectNoNegativeBalances(result);
  });

  it("reconciles totalPaid with principal borrowed plus interest", () => {
    expect(result.totalPaid).toBeCloseTo(
      result.totalPrincipalBorrowed + result.totalInterest,
      1
    );
  });

  it("has monotonically non-increasing balances", () => {
    for (let i = 1; i < result.months.length; i++) {
      expect(result.months[i].opening).toBeLessThanOrEqual(result.months[i - 1].opening);
    }
  });
});

describe("simulatePlan — accelerated with a recurring extra EMI", () => {
  const base: PlannerInput = { principal: 1_000_000, rate: 9, tenureMonths: 120, extraEMI: 0 };
  const accelerated: PlannerInput = { ...base, extraEMI: 5000 };

  const baseline = simulatePlan(base);
  const plan = simulatePlan(accelerated);

  it("pays the loan off earlier than the baseline", () => {
    expect(plan.payoffMonths).toBeLessThan(baseline.payoffMonths);
  });

  it("saves interest versus the baseline", () => {
    expect(plan.totalInterest).toBeLessThan(baseline.totalInterest);
  });

  it("matches the page's interest-saved / months-saved comparison", () => {
    const interestSaved = Math.max(0, baseline.totalInterest - plan.totalInterest);
    const monthsSaved = Math.max(0, baseline.payoffMonths - plan.payoffMonths);
    expect(interestSaved).toBeGreaterThan(0);
    expect(monthsSaved).toBeGreaterThan(0);
    expect(monthsSaved).toBe(baseline.payoffMonths - plan.payoffMonths);
  });

  it("preserves the per-month identity and never goes negative", () => {
    expectRowIdentity(plan);
    expectNoNegativeBalances(plan);
    expect(plan.months[plan.months.length - 1].closing).toBe(0);
  });
});

describe("simulatePlan — deferred recurring extra (extraStartMonth)", () => {
  const base: PlannerInput = { principal: 1_000_000, rate: 9, tenureMonths: 120, extraEMI: 5000 };
  const fromStart = simulatePlan(base);
  const deferred = simulatePlan({ ...base, extraStartMonth: 13 });

  it("treats a missing or 1 extraStartMonth as starting immediately", () => {
    const explicitOne = simulatePlan({ ...base, extraStartMonth: 1 });
    expect(explicitOne.payoffMonths).toBe(fromStart.payoffMonths);
    expect(explicitOne.totalInterest).toBeCloseTo(fromStart.totalInterest, 1);
  });

  it("applies no recurring extra before the start month", () => {
    for (let i = 0; i < 12; i++) {
      expect(deferred.months[i].extra).toBe(0);
    }
    expect(deferred.months[12].extra).toBeGreaterThan(0);
  });

  it("saves less than starting the extra immediately, but more than no extra", () => {
    const noExtra = simulatePlan({ ...base, extraEMI: 0 });
    expect(deferred.totalInterest).toBeGreaterThan(fromStart.totalInterest);
    expect(deferred.totalInterest).toBeLessThan(noExtra.totalInterest);
    expect(deferred.payoffMonths).toBeGreaterThanOrEqual(fromStart.payoffMonths);
  });

  it("preserves the per-month identity and never goes negative", () => {
    expectRowIdentity(deferred);
    expectNoNegativeBalances(deferred);
    expect(deferred.months[deferred.months.length - 1].closing).toBe(0);
  });
});

describe("simulatePlan — one-time lump prepayments", () => {
  const input: PlannerInput = {
    principal: 1_000_000,
    rate: 9,
    tenureMonths: 120,
    extraEMI: 0,
    lumpPrepayments: { 12: 100000, 24: 100000 },
  };
  const result = simulatePlan(input);
  const baseline = simulatePlan({ ...input, lumpPrepayments: {} });

  it("applies the lump as extra in the specified months", () => {
    expect(result.months[11].extra).toBeCloseTo(100000, 1); // month 12 (1-based)
    expect(result.months[23].extra).toBeCloseTo(100000, 1); // month 24
  });

  it("shortens the tenure and cuts interest relative to baseline", () => {
    expect(result.payoffMonths).toBeLessThan(baseline.payoffMonths);
    expect(result.totalInterest).toBeLessThan(baseline.totalInterest);
  });

  it("keeps the accounting identity intact", () => {
    expectRowIdentity(result);
    expectNoNegativeBalances(result);
  });
});

describe("simulatePlan — top-up loan disbursed mid-tenure", () => {
  const input: PlannerInput = {
    principal: 1_000_000,
    rate: 9,
    tenureMonths: 120,
    extraEMI: 0,
    topUp: { amount: 500000, rate: 11, month: 13 },
  };
  const result = simulatePlan(input);

  it("disburses the top-up in the configured month", () => {
    expect(result.months[12].topUp).toBeCloseTo(500000, 1); // month 13 (1-based)
    // The disbursal raises the opening balance that month.
    expect(result.months[12].opening).toBeGreaterThan(result.months[11].closing);
  });

  it("counts the top-up in total principal borrowed", () => {
    expect(result.totalPrincipalBorrowed).toBe(1_500_000);
  });

  it("still finishes within the padded original tenure", () => {
    expect(result.payoffMonths).toBeLessThanOrEqual(input.tenureMonths + 2);
    expect(result.months[result.months.length - 1].closing).toBe(0);
  });

  it("keeps the accounting identity intact", () => {
    expectRowIdentity(result);
    expectNoNegativeBalances(result);
  });
});

describe("simulatePlan — extra EMI + lump prepayments + top-up combined", () => {
  // A single simulation that exercises all three accelerators at once: a
  // recurring extra EMI, two one-time lump prepayments, AND a mid-tenure top-up
  // that recomputes the EMI. This guards the interaction between them.
  const input: PlannerInput = {
    principal: 1_000_000,
    rate: 9,
    tenureMonths: 120,
    extraEMI: 5000,
    lumpPrepayments: { 6: 75000, 30: 125000 },
    topUp: { amount: 300000, rate: 11, month: 18 },
  };
  const result = simulatePlan(input);

  it("disburses the top-up in the configured month", () => {
    expect(result.months[17].topUp).toBeCloseTo(300000, 1); // month 18 (1-based)
  });

  it("applies the lump prepayments in their configured months", () => {
    // Extra each lump month = recurring extra EMI + the lump amount.
    expect(result.months[5].extra).toBeCloseTo(5000 + 75000, 1); // month 6
    expect(result.months[29].extra).toBeCloseTo(5000 + 125000, 1); // month 30
  });

  it("includes the top-up in total principal borrowed", () => {
    expect(result.totalPrincipalBorrowed).toBe(1_300_000);
  });

  it("keeps emi+extra === interest+principal on every row, including top-up and final months", () => {
    expectRowIdentity(result);
    // Explicitly assert the identity on the top-up month and the final installment.
    const topUpRow = result.months[17];
    expect(topUpRow.emi + topUpRow.extra).toBeCloseTo(
      topUpRow.interest + topUpRow.principal,
      1
    );
    const last = result.months[result.months.length - 1];
    expect(last.emi + last.extra).toBeCloseTo(last.interest + last.principal, 1);
  });

  it("pays off with a zero closing balance within the padded tenure and never goes negative", () => {
    expect(result.payoffMonths).toBeLessThanOrEqual(input.tenureMonths + 2);
    expect(result.months[result.months.length - 1].closing).toBe(0);
    expectNoNegativeBalances(result);
  });
});

describe("simulatePlan — final payoff month installment", () => {
  it("records the adjusted final installment so emi+extra === interest+principal", () => {
    const result = simulatePlan({ principal: 500000, rate: 10, tenureMonths: 36, extraEMI: 2000 });
    const last = result.months[result.months.length - 1];
    expect(last.closing).toBe(0);
    expect(last.emi + last.extra).toBeCloseTo(last.interest + last.principal, 1);
  });
});

describe("simulatePlan — edge cases", () => {
  it("handles a zero interest rate (no interest, even principal split)", () => {
    const result = simulatePlan({ principal: 120000, rate: 0, tenureMonths: 12, extraEMI: 0 });
    expect(result.baseEMI).toBe(10000);
    expect(result.totalInterest).toBe(0);
    expect(result.months.every((m) => m.interest === 0)).toBe(true);
    expect(result.payoffMonths).toBe(12);
    expect(result.months[11].closing).toBe(0);
    expectRowIdentity(result);
  });

  it("clears the loan in one month when the extra exceeds the balance", () => {
    const result = simulatePlan({ principal: 100000, rate: 12, tenureMonths: 12, extraEMI: 500000 });
    expect(result.payoffMonths).toBe(1);
    expect(result.months[0].closing).toBe(0);
    // Extra is capped at what was needed — never overpays the balance.
    expect(result.months[0].principal).toBeCloseTo(100000, 1);
    expectNoNegativeBalances(result);
    expectRowIdentity(result);
  });

  it("returns an empty result for an already paid-off (zero principal) loan", () => {
    const result = simulatePlan({ principal: 0, rate: 9, tenureMonths: 120, extraEMI: 0 });
    expect(result.months).toHaveLength(0);
    expect(result.payoffMonths).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPrincipalBorrowed).toBe(0);
    expect(result.totalPaid).toBe(0);
  });

  it("returns an empty result for a non-positive tenure", () => {
    const result = simulatePlan({ principal: 100000, rate: 9, tenureMonths: 0, extraEMI: 0 });
    expect(result.months).toHaveLength(0);
    expect(result.payoffMonths).toBe(0);
  });
});

describe("simulatePlan — yearly aggregation", () => {
  const result = simulatePlan({ principal: 1_000_000, rate: 9, tenureMonths: 120, extraEMI: 0 });

  it("groups months into calendar years of 12", () => {
    expect(result.years).toHaveLength(Math.ceil(result.payoffMonths / 12));
    expect(result.years[0].monthsInYear).toBe(12);
  });

  it("sums each year's interest to the overall total interest", () => {
    const summed = result.years.reduce((s, y) => s + y.interest, 0);
    expect(summed).toBeCloseTo(result.totalInterest, 0);
  });

  it("ends the final year at a zero closing balance", () => {
    expect(result.years[result.years.length - 1].closing).toBe(0);
  });
});

describe("reverseFromTargetMonths", () => {
  it("returns the payment and extra needed to hit a shorter target", () => {
    const principal = 1_000_000;
    const rate = 9;
    const tenure = 120;
    const baseEMI = simulatePlan({ principal, rate, tenureMonths: tenure, extraEMI: 0 }).baseEMI;
    const { requiredPayment, requiredExtra } = reverseFromTargetMonths(
      principal,
      rate,
      baseEMI,
      84
    );
    expect(requiredPayment).toBeCloseTo(calcEMI(principal, rate, 84), 1);
    expect(requiredExtra).toBeCloseTo(requiredPayment - baseEMI, 1);
    expect(requiredExtra).toBeGreaterThan(0);
  });

  it("never reports negative extra when the target is at or beyond the base tenure", () => {
    const baseEMI = calcEMI(1_000_000, 9, 120);
    const { requiredExtra } = reverseFromTargetMonths(1_000_000, 9, baseEMI, 120);
    expect(requiredExtra).toBe(0);
  });

  it("returns zeros for invalid inputs", () => {
    expect(reverseFromTargetMonths(1_000_000, 9, 12000, 0)).toEqual({
      requiredPayment: 0,
      requiredExtra: 0,
    });
    expect(reverseFromTargetMonths(0, 9, 12000, 60)).toEqual({
      requiredPayment: 0,
      requiredExtra: 0,
    });
  });
});

describe("STRATEGY_PRESETS", () => {
  const baseEMI = 20000;
  const principal = 1_000_000;
  const byId = Object.fromEntries(STRATEGY_PRESETS.map((p) => [p.id, p]));

  it('"1 Extra EMI / Year" prepays one EMI per year as a lump', () => {
    expect(byId["one-extra-emi"].compute(baseEMI, principal)).toEqual({
      extraEMI: 0,
      yearlyLump: 20000,
    });
  });

  it('"Micro-Savings (5% Monthly)" adds 5% of the EMI monthly', () => {
    expect(byId["round-up"].compute(baseEMI, principal)).toEqual({
      extraEMI: 1000,
      yearlyLump: 0,
    });
  });

  it('"10% Monthly Boost" adds 10% of the EMI monthly', () => {
    expect(byId["ten-percent"].compute(baseEMI, principal)).toEqual({
      extraEMI: 2000,
      yearlyLump: 0,
    });
  });

  it('"Super-Saver Combo" combines a 10% monthly extra with a yearly EMI lump', () => {
    expect(byId["super-saver"].compute(baseEMI, principal)).toEqual({
      extraEMI: 2000,
      yearlyLump: 20000,
    });
  });
});
