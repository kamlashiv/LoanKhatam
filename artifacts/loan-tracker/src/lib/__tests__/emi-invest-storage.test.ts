/**
 * @jest-environment jsdom
 *
 * Storage payload for the EMI vs Investment Analyzer.
 *
 * The analyzer persists ONLY the non-sensitive scenario knobs it still owns
 * (interest rate, tenure, return %, invest %). Loan figures (total lent,
 * outstanding, monthly EMI) are connected live from the dashboard data, and
 * monthly income/expenses are owned by the global financial profile.
 *
 * Earlier versions kept income/expenses (financial PII) in this same
 * browser-global localStorage entry so the old profile migration could read
 * them. That migration has been removed, so the analyzer must write owned-only
 * and NOT carry over those legacy PII keys — this guards against a regression
 * that would let one user's income/expenses linger for the next account on a
 * shared device.
 */
import { ownedInputs } from "../../components/emi-investment-analyzer";
import { EMPTY_EMI_INVEST, type EmiInvestInputs } from "../strategy-engine";

function make(overrides: Partial<EmiInvestInputs> = {}): EmiInvestInputs {
  return { ...EMPTY_EMI_INVEST, ...overrides };
}

describe("ownedInputs", () => {
  it("persists the scenario knobs this component owns", () => {
    const out = ownedInputs(
      make({ annualRate: 11, remainingTenureMonths: 24, assumedReturnPct: 14, investPct: 20, customPct: 30 }),
    );
    expect(out.annualRate).toBe(11);
    expect(out.remainingTenureMonths).toBe(24);
    expect(out.assumedReturnPct).toBe(14);
    expect(out.investPct).toBe(20);
    expect(out.customPct).toBe(30);
  });

  it("does NOT carry over legacy financial PII (monthlyIncome/monthlyExpenses)", () => {
    const out = ownedInputs(make({ annualRate: 9 }));
    expect("monthlyIncome" in out).toBe(false);
    expect("monthlyExpenses" in out).toBe(false);
  });

  it("does NOT carry over loan-owned figures (they are connected live)", () => {
    const out = ownedInputs(make());
    expect("totalLoanAmount" in out).toBe(false);
    expect("remainingBalance" in out).toBe(false);
    expect("currentEmi" in out).toBe(false);
  });
});
