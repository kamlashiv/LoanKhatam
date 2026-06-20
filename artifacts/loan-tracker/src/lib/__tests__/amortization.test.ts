/**
 * Direct unit tests for the amortization engine. Unlike the
 * amortization-section component test (which only checks the UI faithfully
 * renders whatever the engine returns), these pin the engine's numbers to
 * hand-verified known-good values, so a genuine math regression is caught
 * independently of the UI.
 *
 * Reference figures were derived from the standard reducing-balance EMI
 * formula  EMI = P·r·(1+r)^n / ((1+r)^n − 1)  with r = annualRate/12/100, and
 * a month-by-month interest = balance·r, principal = EMI − interest walk,
 * matching the engine's rounding (two decimals per row).
 */
import {
  calculateAmortization,
  calculateBankStyleSchedule,
  calculateSavings,
  currentEffectiveRate,
} from "../amortization";

describe("calculateAmortization — flat-rate loan", () => {
  // ₹1,00,000 at 12% p.a. over 12 months. Monthly rate 1%.
  const result = calculateAmortization(
    100_000,
    12,
    "2025-01-01",
    "2026-01-01"
  );

  it("derives the standard reducing-balance EMI", () => {
    expect(result.tenureMonths).toBe(12);
    expect(result.emi).toBe(8884.88);
  });

  it("splits the first installment into interest and principal", () => {
    const first = result.schedule[0];
    expect(first.openingBalance).toBe(100_000);
    expect(first.interestComponent).toBe(1000); // 100000 * 1%
    expect(first.principalComponent).toBe(7884.88); // 8884.88 - 1000
    expect(first.closingBalance).toBe(92_115.12);
  });

  it("clears the balance with a final-month principal balloon", () => {
    const last = result.schedule[11];
    expect(last.month).toBe(12);
    // The final principal component absorbs the entire opening balance so the
    // loan ends exactly at zero, even though emi - interest would differ.
    expect(last.openingBalance).toBe(8796.91);
    expect(last.principalComponent).toBe(8796.91);
    expect(last.principalComponent).toBe(last.openingBalance);
    expect(last.closingBalance).toBe(0);
  });

  it("totals interest and payable across the schedule", () => {
    expect(result.totalInterest).toBe(6618.53);
    expect(result.totalPayment).toBe(106_618.56);
  });
});

describe("calculateAmortization — zero-interest loan", () => {
  // ₹1,20,000 at 0% over 12 months → flat ₹10,000/month, no interest.
  const result = calculateAmortization(120_000, 0, "2025-01-01", "2026-01-01");

  it("splits the principal evenly with no interest", () => {
    expect(result.emi).toBe(10_000);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPayment).toBe(120_000);
  });

  it("carries zero interest on every row", () => {
    expect(result.schedule).toHaveLength(12);
    expect(result.schedule[0]).toMatchObject({
      openingBalance: 120_000,
      interestComponent: 0,
      principalComponent: 10_000,
      closingBalance: 110_000,
    });
    expect(result.schedule[11]).toMatchObject({
      openingBalance: 10_000,
      interestComponent: 0,
      principalComponent: 10_000,
      closingBalance: 0,
    });
  });
});

describe("calculateAmortization — loan with a rate change", () => {
  // ₹1,00,000 at 12% for 12 months, rate rises to 18% from 2025-07-01.
  // The change takes effect from the period whose start is on/after the
  // effective date (period 7, starting 2025-07-01), and the EMI is recomputed
  // on the then-outstanding balance for the remaining tenure.
  const result = calculateAmortization(
    100_000,
    12,
    "2025-01-01",
    "2026-01-01",
    [{ effectiveDate: "2025-07-01", newRate: 18 }]
  );

  it("keeps the original EMI before the change", () => {
    expect(result.emi).toBe(8884.88);
    const month6 = result.schedule[5];
    expect(month6.emi).toBe(8884.88);
    expect(month6.openingBalance).toBe(59_779.19);
    expect(month6.interestComponent).toBe(597.79); // at 12%
  });

  it("re-amortizes at the new blended rate from the effective period", () => {
    const month7 = result.schedule[6];
    expect(month7.openingBalance).toBe(51_492.11);
    expect(month7.emi).toBe(9038.16); // recomputed on balance @18% over 6 mo
    expect(month7.interestComponent).toBe(772.38); // 51492.11 * 1.5%
    expect(month7.principalComponent).toBe(8265.78);
  });

  it("pays off to zero with the higher post-change total interest", () => {
    const last = result.schedule[11];
    expect(last.closingBalance).toBe(0);
    expect(last.principalComponent).toBe(last.openingBalance);
    expect(result.totalInterest).toBe(7538.23); // > flat 6618.53
    expect(result.totalPayment).toBe(107_538.24);
  });
});

describe("calculateAmortization — zero tenure (start equals due)", () => {
  it("returns an empty result when there is no time to amortize", () => {
    const result = calculateAmortization(
      100_000,
      12,
      "2026-01-01",
      "2026-01-01"
    );
    expect(result).toEqual({
      emi: 0,
      schedule: [],
      totalInterest: 0,
      totalPayment: 0,
      tenureMonths: 0,
    });
  });
});

describe("calculateBankStyleSchedule — prepayment mid-loan", () => {
  // ₹1,00,000 at 12% for 12 months, a ₹20,000 prepayment on 2025-04-15.
  const result = calculateBankStyleSchedule(
    100_000,
    12,
    "2025-01-01",
    "2026-01-01",
    [{ paymentDate: "2025-04-15", amount: 20_000 }]
  );

  it("amortizes normally before the prepayment", () => {
    expect(result.initialEMI).toBe(8884.88);
    const amrt = result.rows.filter((r) => r.rowType === "amrt");
    expect(amrt[0]).toMatchObject({
      openingPrincipal: 100_000,
      intComp: 1000,
      prinComp: 7884.88,
      closingPrincipal: 92_115.12,
    });
  });

  it("records the prepayment as a signed adjustment row", () => {
    const prepay = result.rows.find((r) => r.rowType === "prepayment")!;
    expect(prepay).toBeDefined();
    expect(prepay.prepAdjDisb).toBe(-20_000);
    expect(prepay.openingPrincipal).toBe(76_108.02);
    expect(prepay.closingPrincipal).toBe(56_108.02);
  });

  it("re-amortizes onto a lower EMI after the prepayment", () => {
    // The first amortization row after the prepayment uses the reduced balance
    // and the remaining tenure, producing a smaller EMI.
    const idx = result.rows.findIndex((r) => r.rowType === "prepayment");
    const nextAmrt = result.rows[idx + 1];
    expect(nextAmrt.rowType).toBe("amrt");
    expect(nextAmrt.openingPrincipal).toBe(56_108.02);
    expect(nextAmrt.emi).toBe(6550.07);
    expect(nextAmrt.intComp).toBe(561.08);
  });

  it("clears the loan to zero with a final-month balloon and lower total interest", () => {
    const amrt = result.rows.filter((r) => r.rowType === "amrt");
    const last = amrt[amrt.length - 1];
    expect(last.closingPrincipal).toBe(0);
    expect(last.prinComp).toBe(last.openingPrincipal); // balloon
    // Prepaying ₹20,000 saves interest vs the ₹6,618.53 flat schedule.
    expect(result.totalInterest).toBe(5605.27);
  });
});

describe("calculateBankStyleSchedule — prepayment fully clears the loan early", () => {
  // A ₹2,00,000 prepayment on 2025-03-10 overpays the ₹84,151.39 balance, so
  // the schedule ends right after the prepayment with no further rows.
  const result = calculateBankStyleSchedule(
    100_000,
    12,
    "2025-01-01",
    "2026-01-01",
    [{ paymentDate: "2025-03-10", amount: 200_000 }]
  );

  it("stops amortizing once the balance is cleared", () => {
    // Two amortization rows (Jan, Feb) then the clearing prepayment — nothing after.
    expect(result.rows).toHaveLength(3);
    expect(result.rows.map((r) => r.rowType)).toEqual([
      "amrt",
      "amrt",
      "prepayment",
    ]);
  });

  it("charges interest only for the months before the payoff", () => {
    // Jan ₹1,000 + Feb ₹921.15 only.
    expect(result.totalInterest).toBe(1921.15);
  });

  it("records the overpayment with a negative closing principal", () => {
    const prepay = result.rows[2];
    expect(prepay.rowType).toBe("prepayment");
    expect(prepay.prepAdjDisb).toBe(-200_000);
    expect(prepay.openingPrincipal).toBe(84_151.39);
    expect(prepay.closingPrincipal).toBe(-115_848.61);
  });
});

describe("calculateBankStyleSchedule — zero tenure (start equals due)", () => {
  it("returns an empty result", () => {
    const result = calculateBankStyleSchedule(
      100_000,
      12,
      "2026-01-01",
      "2026-01-01",
      []
    );
    expect(result).toEqual({
      initialEMI: 0,
      tenureMonths: 0,
      rows: [],
      totalInterest: 0,
      totalPrincipal: 0,
    });
  });
});

describe("currentEffectiveRate", () => {
  const changes = [
    { effectiveDate: "2025-03-01", newRate: 12 },
    { effectiveDate: "2025-07-01", newRate: 14 },
  ];

  it("returns the original rate when there are no changes", () => {
    expect(currentEffectiveRate(10, [], "2025-06-01")).toBe(10);
  });

  it("returns the original rate before any change takes effect", () => {
    expect(currentEffectiveRate(10, changes, "2025-02-15")).toBe(10);
  });

  it("applies a change exactly on its effective date", () => {
    expect(currentEffectiveRate(10, changes, "2025-07-01")).toBe(14);
  });

  it("returns the most recent change that has taken effect", () => {
    expect(currentEffectiveRate(10, changes, "2025-05-01")).toBe(12);
    expect(currentEffectiveRate(10, changes, "2025-08-01")).toBe(14);
  });
});

describe("calculateSavings (deterministic 'today')", () => {
  // Pin "today" so the remaining-interest projection is reproducible.
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-07-01T00:00:00Z"));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  const P = 100_000;
  const RATE = 12;
  const START = "2025-01-01";
  const DUE = "2026-01-01";

  it("computes a positive interest-saved when ahead of schedule", () => {
    // ₹50,000 outstanding, ₹51,000 paid → ₹1,000 interest paid so far.
    const savings = calculateSavings(P, RATE, START, DUE, 51_000, 50_000);

    expect(savings.scheduledTotalInterest).toBe(6618.53);
    // Remaining: ₹50,000 @12% over the 6 months from 2025-07-01.
    expect(savings.projectedRemainingInterest).toBe(1764.51);
    expect(savings.principalRepaid).toBe(50_000);
    expect(savings.estimatedInterestPaid).toBe(1000); // 51000 - 50000
    expect(savings.remainingPrincipal).toBe(50_000);
    // 6618.53 - 1000 - 1764.51
    expect(savings.interestSaved).toBe(3854.02);
  });

  it("never reports negative savings when more interest was paid than scheduled", () => {
    // ₹60,000 paid against ₹50,000 principal → ₹10,000 'interest', which
    // already exceeds the scheduled total, so savings floor at zero.
    const savings = calculateSavings(P, RATE, START, DUE, 60_000, 50_000);

    expect(savings.estimatedInterestPaid).toBe(10_000);
    expect(savings.interestSaved).toBe(0);
  });
});
