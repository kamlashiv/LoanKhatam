/**
 * @jest-environment jsdom
 *
 * Storage merge semantics for the EMI vs Investment Analyzer.
 *
 * The analyzer persists only the scenario knobs it still owns. Loan figures
 * (total lent, outstanding, monthly EMI) are connected live from the dashboard
 * data, and monthly income/expenses are owned by the global financial profile.
 * Writing back the analyzer's local state must NOT clobber those externally
 * owned keys — the profile migration still reads legacy income/expenses out of
 * this same localStorage entry. This guards against a regression where the full
 * input object was spread on write, zeroing out keys owned elsewhere.
 */
import { mergeOwnedInputs } from "../../components/emi-investment-analyzer";
import { EMPTY_EMI_INVEST, type EmiInvestInputs } from "../strategy-engine";

function make(overrides: Partial<EmiInvestInputs> = {}): EmiInvestInputs {
  return { ...EMPTY_EMI_INVEST, ...overrides };
}

describe("mergeOwnedInputs", () => {
  it("persists the scenario knobs this component owns", () => {
    const out = mergeOwnedInputs(
      {},
      make({ annualRate: 11, remainingTenureMonths: 24, assumedReturnPct: 14, investPct: 20, customPct: 30 }),
    );
    expect(out.annualRate).toBe(11);
    expect(out.remainingTenureMonths).toBe(24);
    expect(out.assumedReturnPct).toBe(14);
    expect(out.investPct).toBe(20);
    expect(out.customPct).toBe(30);
  });

  it("preserves profile-owned legacy keys (monthlyIncome/monthlyExpenses)", () => {
    const existing = { monthlyIncome: 80000, monthlyExpenses: 30000 };
    const out = mergeOwnedInputs(existing, make({ annualRate: 9 }));
    expect(out.monthlyIncome).toBe(80000);
    expect(out.monthlyExpenses).toBe(30000);
  });

  it("never overwrites loan-owned figures with the local zero defaults", () => {
    const existing = { totalLoanAmount: 500000, remainingBalance: 320000, currentEmi: 18000 };
    // Local inputs carry these as 0 (they are connected live, not edited here).
    const out = mergeOwnedInputs(existing, make());
    expect(out.totalLoanAmount).toBe(500000);
    expect(out.remainingBalance).toBe(320000);
    expect(out.currentEmi).toBe(18000);
  });
});
