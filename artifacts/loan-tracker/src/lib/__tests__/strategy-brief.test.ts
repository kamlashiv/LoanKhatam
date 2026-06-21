import {
  buildPrepaymentBrief,
  buildStrategyBrief,
  type BriefLoan,
} from "../strategy-brief";
import { EMPTY_INPUTS, type StrategyInputs } from "../strategy-engine";

const loan = (over: Partial<BriefLoan> = {}): BriefLoan => ({
  name: "Test",
  principal: 1_000_000,
  outstanding: 1_000_000,
  rate: 12,
  tenureMonths: 60,
  ...over,
});

describe("buildPrepaymentBrief", () => {
  it("returns not-applicable for an empty loan list", () => {
    const r = buildPrepaymentBrief([]);
    expect(r.applicable).toBe(false);
    expect(r.loanCount).toBe(0);
    expect(r.interestSaved).toBe(0);
    expect(r.monthlyExtra).toBe(0);
    expect(r.monthsSaved).toBe(0);
  });

  it("skips open-ended loans (no principal or tenure)", () => {
    const r = buildPrepaymentBrief([
      loan({ tenureMonths: null }),
      loan({ principal: 0 }),
    ]);
    expect(r.applicable).toBe(false);
    expect(r.loanCount).toBe(0);
  });

  it("computes positive savings for a real amortising loan", () => {
    const r = buildPrepaymentBrief([loan()]);
    expect(r.applicable).toBe(true);
    expect(r.loanCount).toBe(1);
    expect(r.monthlyExtra).toBeGreaterThan(0);
    expect(r.interestSaved).toBeGreaterThan(0);
    expect(r.monthsSaved).toBeGreaterThan(0);
  });

  it("uses outstanding balance, not original principal, for partially repaid loans", () => {
    const fresh = buildPrepaymentBrief([loan()]);
    const partlyPaid = buildPrepaymentBrief([loan({ outstanding: 300_000 })]);
    expect(partlyPaid.applicable).toBe(true);
    // Less balance remaining → less interest can be saved than on a fresh loan.
    expect(partlyPaid.interestSaved).toBeGreaterThan(0);
    expect(partlyPaid.interestSaved).toBeLessThan(fresh.interestSaved);
  });

  it("aggregates across multiple loans (sum interest, max months)", () => {
    const one = buildPrepaymentBrief([loan()]);
    const two = buildPrepaymentBrief([loan(), loan({ name: "Second" })]);
    expect(two.loanCount).toBe(2);
    expect(two.interestSaved).toBeGreaterThan(one.interestSaved);
    expect(two.monthlyExtra).toBeGreaterThan(one.monthlyExtra);
    // Identical loans → same per-loan tenure reduction, so max equals the single.
    expect(two.monthsSaved).toBe(one.monthsSaved);
  });
});

describe("buildStrategyBrief", () => {
  it("flags no data when income, expenses and debt are all zero", () => {
    const brief = buildStrategyBrief({ ...EMPTY_INPUTS }, []);
    expect(brief.hasData).toBe(false);
    expect(brief.points).toHaveLength(0);
    expect(brief.headline).toMatch(/upload/i);
  });

  it("produces a headline and talking points once there is data", () => {
    const inputs: StrategyInputs = {
      ...EMPTY_INPUTS,
      monthlyIncome: 100_000,
      rent: 20_000,
      food: 15_000,
      currentSavings: 50_000,
    };
    const brief = buildStrategyBrief(inputs, [loan()]);
    expect(brief.hasData).toBe(true);
    expect(brief.headline).toContain(`${brief.strategy.healthScore}/100`);
    expect(brief.points.length).toBeGreaterThan(0);
  });

  it("includes a prepayment talking point when loans can be accelerated", () => {
    const inputs: StrategyInputs = {
      ...EMPTY_INPUTS,
      monthlyIncome: 150_000,
      rent: 20_000,
    };
    const brief = buildStrategyBrief(inputs, [loan()]);
    expect(brief.prepayment.applicable).toBe(true);
    expect(brief.points.some((p) => /extra.*EMI/i.test(p.text))).toBe(true);
  });

  it("warns when the user is overspending", () => {
    const inputs: StrategyInputs = {
      ...EMPTY_INPUTS,
      monthlyIncome: 30_000,
      rent: 40_000,
    };
    const brief = buildStrategyBrief(inputs, []);
    expect(brief.strategy.freeCashFlow).toBeLessThan(0);
    expect(brief.points.some((p) => p.tone === "warn" && /overspending/i.test(p.text))).toBe(true);
  });
});
