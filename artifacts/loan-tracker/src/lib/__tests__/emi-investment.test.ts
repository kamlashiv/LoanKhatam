import {
  analyzeEmiInvestment,
  EMPTY_EMI_INVEST,
  type EmiInvestInputs,
} from "../strategy-engine";

function make(overrides: Partial<EmiInvestInputs> = {}): EmiInvestInputs {
  return { ...EMPTY_EMI_INVEST, ...overrides };
}

describe("analyzeEmiInvestment", () => {
  it("is dormant until an EMI and a balance/tenure are provided", () => {
    expect(analyzeEmiInvestment(make()).hasData).toBe(false);
    expect(analyzeEmiInvestment(make({ currentEmi: 20000 })).hasData).toBe(false);
    expect(analyzeEmiInvestment(make({ currentEmi: 20000, remainingBalance: 500000 })).hasData).toBe(true);
    expect(analyzeEmiInvestment(make({ currentEmi: 20000, remainingTenureMonths: 36 })).hasData).toBe(true);
  });

  it("uses the supplied tenure as the authoritative payoff horizon", () => {
    const r = analyzeEmiInvestment(make({
      currentEmi: 20000,
      remainingBalance: 500000,
      annualRate: 9,
      remainingTenureMonths: 36,
    }));
    expect(r.payoffUnbounded).toBe(false);
    expect(r.debtFreeMonths).toBe(36);
    expect(r.totalEmiRemaining).toBe(20000 * 36);
    expect(r.totalInterestRemaining).toBe(20000 * 36 - 500000);
    expect(r.contributionMonths).toBe(36);
  });

  it("derives the payoff from amortization when tenure is missing", () => {
    const r = analyzeEmiInvestment(make({
      currentEmi: 12667.58,
      remainingBalance: 1_000_000,
      annualRate: 9,
      remainingTenureMonths: 0,
    }));
    expect(r.payoffUnbounded).toBe(false);
    // ₹10L at 9% with a ~₹12,667 EMI clears in ~120 months.
    expect(r.debtFreeMonths).toBeGreaterThanOrEqual(118);
    expect(r.debtFreeMonths).toBeLessThanOrEqual(121);
    expect(r.contributionMonths).toBe(r.debtFreeMonths);
    expect(r.totalEmiRemaining).toBeGreaterThan(0);
  });

  it("flags an unbounded payoff when the EMI cannot cover the interest", () => {
    const r = analyzeEmiInvestment(make({
      currentEmi: 1000, // far below the ~₹7,500 monthly interest on ₹10L @9%
      remainingBalance: 1_000_000,
      annualRate: 9,
      remainingTenureMonths: 0,
    }));
    expect(r.payoffUnbounded).toBe(true);
    expect(r.debtFreeMonths).toBe(0);
    expect(r.totalEmiRemaining).toBe(0);
    expect(r.totalInterestRemaining).toBe(0);
    // Scenarios/projections still render against the 10-year fallback horizon.
    expect(r.contributionMonths).toBe(120);
  });

  it("builds A–E scenarios where the custom scenario tracks customPct", () => {
    const r = analyzeEmiInvestment(make({
      currentEmi: 20000,
      remainingBalance: 500000,
      remainingTenureMonths: 60,
      investPct: 10,
      customPct: 35,
    }));
    expect(r.scenarios.map((s) => s.key)).toEqual(["A", "B", "C", "D", "E"]);
    const custom = r.scenarios.find((s) => s.key === "E")!;
    expect(custom.pct).toBe(35);
    expect(custom.monthlyInvestment).toBe(Math.round((20000 * 35) / 100));
    expect(custom.label).toContain("35%");
    // The current-strategy scenario invests nothing.
    expect(r.scenarios.find((s) => s.key === "A")!.monthlyInvestment).toBe(0);
  });

  it("produces compound projections for 1/3/5/10/15/20 years with growing portfolios", () => {
    const r = analyzeEmiInvestment(make({
      currentEmi: 20000,
      remainingBalance: 500000,
      remainingTenureMonths: 60,
      assumedReturnPct: 12,
      investPct: 20,
    }));
    expect(r.projections.map((p) => p.years)).toEqual([1, 3, 5, 10, 15, 20]);
    for (const p of r.projections) {
      expect(p.contributions).toBe(r.selectedMonthlyInvestment * p.years * 12);
      expect(p.portfolio).toBeGreaterThanOrEqual(p.contributions);
      expect(p.profit).toBeCloseTo(p.portfolio - p.contributions, 1);
    }
    const last = r.projections[r.projections.length - 1];
    expect(last.portfolio).toBeGreaterThan(r.projections[0].portfolio);
  });

  it("clamps the custom percentage into the 0–100 range", () => {
    const r = analyzeEmiInvestment(make({
      currentEmi: 20000,
      remainingBalance: 500000,
      remainingTenureMonths: 60,
      customPct: 250,
    }));
    expect(r.scenarios.find((s) => s.key === "E")!.pct).toBe(100);
  });
});
