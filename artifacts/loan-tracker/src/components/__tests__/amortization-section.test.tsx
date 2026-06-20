/**
 * @jest-environment jsdom
 *
 * Integration tests for the AmortizationSection — the "Amortization & Savings"
 * tab on the Loan Detail page. The component takes its loan, payments and rate
 * changes as plain props (no API hooks), so these render it directly against a
 * fixture and assert the figures it surfaces match what the amortization engine
 * (calculateAmortization / calculateSavings / calculateBankStyleSchedule)
 * produces for the same inputs — catching a calculation or rendering regression
 * in the schedule rows, total interest, EMI or savings breakdown.
 */
import React from "react";
import { render, screen, within } from "@testing-library/react";

// recharts renders nothing useful in jsdom (zero-size container) and only emits
// unrecognized-tag warnings; the pie charts are purely visual and not under
// test, so stub the whole module.
jest.mock("recharts", () => {
  const Stub = () => null;
  return new Proxy({}, { get: () => Stub });
});

import { AmortizationSection } from "../amortization-section";
import { formatRupees } from "@/lib/loan-utils";
import {
  calculateAmortization,
  calculateSavings,
  calculateBankStyleSchedule,
  type RateChange,
} from "@/lib/amortization";

// Mirrors the `fmt` helper in bank-amortization-table.tsx — the table renders
// each numeric cell with en-IN grouping and exactly two decimals.
function fmt(n: number): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// A loan that spans both the past and future (relative to "today") so the
// bank-style schedule produces past, current and future rows, with one rate
// change and two prepayments inline.
const LOAN = {
  borrowerName: "Asha Kumar",
  principalAmount: 500_000,
  interestRate: 10,
  startDate: "2025-01-01",
  dueDate: "2027-01-01", // 24-month tenure
  totalPaid: 120_000,
  remainingAmount: 400_000,
  payments: [
    { paymentDate: "2025-06-15", amount: 50_000 },
    { paymentDate: "2025-11-20", amount: 70_000 },
  ],
  rateChanges: [{ effectiveDate: "2025-07-01", newRate: 12 }] as RateChange[],
};

function renderSection(overrides: Partial<typeof LOAN> = {}) {
  const props = { ...LOAN, ...overrides };
  return render(<AmortizationSection {...props} />);
}

describe("AmortizationSection", () => {
  it("surfaces the scheduled EMI, total interest and total payable from the engine", () => {
    const amort = calculateAmortization(
      LOAN.principalAmount,
      LOAN.interestRate,
      LOAN.startDate,
      LOAN.dueDate,
      LOAN.rateChanges
    );

    renderSection();

    // Sanity-check the engine produced a real schedule for this fixture.
    expect(amort.tenureMonths).toBe(24);
    expect(amort.emi).toBeGreaterThan(0);
    expect(amort.totalInterest).toBeGreaterThan(0);

    // Monthly Installment (EMI) key stat.
    const emiCard = screen.getByText("Monthly Installment (EMI)").closest("div")!;
    expect(
      within(emiCard).getByText(formatRupees(amort.emi))
    ).toBeInTheDocument();

    // Total Interest (Scheduled) key stat.
    const interestCard = screen
      .getByText("Total Interest (Scheduled)")
      .closest("div")!;
    expect(
      within(interestCard).getByText(formatRupees(amort.totalInterest))
    ).toBeInTheDocument();

    // Total Payable in the scheduled-breakdown pie footer.
    expect(
      screen.getAllByText(formatRupees(amort.totalPayment)).length
    ).toBeGreaterThan(0);
  });

  it("surfaces the projected remaining interest and any interest saved from the savings engine", () => {
    const savings = calculateSavings(
      LOAN.principalAmount,
      LOAN.interestRate,
      LOAN.startDate,
      LOAN.dueDate,
      LOAN.totalPaid,
      LOAN.remainingAmount,
      LOAN.rateChanges
    );

    renderSection();

    // Remaining Interest (Projected) key stat.
    const remainingCard = screen
      .getByText("Remaining Interest (Projected)")
      .closest("div")!;
    expect(
      within(remainingCard).getByText(
        formatRupees(savings.projectedRemainingInterest)
      )
    ).toBeInTheDocument();

    // Interest Savings key stat shows the engine's figure, or ₹0 when none.
    const savingsCard = screen.getByText("Interest Savings").closest("div")!;
    const expectedSavings =
      savings.interestSaved > 0 ? formatRupees(savings.interestSaved) : "₹0";
    expect(
      within(savingsCard).getByText(expectedSavings)
    ).toBeInTheDocument();
  });

  it("renders the bank-style header with the engine's initial EMI, ROI and tenure", () => {
    const bank = calculateBankStyleSchedule(
      LOAN.principalAmount,
      LOAN.interestRate,
      LOAN.startDate,
      LOAN.dueDate,
      LOAN.payments,
      LOAN.rateChanges
    );

    renderSection();

    // LOAN AMOUNT, CURRENT EMI (2-decimal) and ORIGINAL SANCTION TERM.
    expect(
      screen.getByText(`₹${LOAN.principalAmount.toLocaleString("en-IN")}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `₹${bank.initialEMI.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${bank.tenureMonths} Months`)
    ).toBeInTheDocument();
  });

  it("renders a schedule row matching the engine's amortization figures", () => {
    const bank = calculateBankStyleSchedule(
      LOAN.principalAmount,
      LOAN.interestRate,
      LOAN.startDate,
      LOAN.dueDate,
      LOAN.payments,
      LOAN.rateChanges
    );

    renderSection();

    // The first scheduled (Amrt) row's interest and principal components are
    // computed by the engine — assert they render in the table verbatim.
    const firstAmrt = bank.rows.find((r) => r.rowType === "amrt")!;
    expect(firstAmrt).toBeDefined();
    expect(
      screen.getAllByText(fmt(firstAmrt.intComp)).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(fmt(firstAmrt.prinComp)).length
    ).toBeGreaterThan(0);
  });

  it("renders the rate-change row at its new ROI and shows prepayments inline", () => {
    const bank = calculateBankStyleSchedule(
      LOAN.principalAmount,
      LOAN.interestRate,
      LOAN.startDate,
      LOAN.dueDate,
      LOAN.payments,
      LOAN.rateChanges
    );

    renderSection();

    // The engine emits a dedicated rate-change row at the new rate.
    const rateRow = bank.rows.find((r) => r.rowType === "rate_change")!;
    expect(rateRow).toBeDefined();
    expect(rateRow.roi).toBe(12);
    expect(screen.getAllByText("Rate Change").length).toBeGreaterThan(0);
    expect(screen.getAllByText("12%").length).toBeGreaterThan(0);

    // Both prepayments surface as their signed adjustment amounts.
    expect(screen.getAllByText("Prepayment").length).toBe(LOAN.payments.length);
    expect(screen.getAllByText(fmt(-50_000)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(fmt(-70_000)).length).toBeGreaterThan(0);

    // The schedule caption reflects the prepayment count.
    expect(
      screen.getByText(/2 prepayments inline/)
    ).toBeInTheDocument();
  });

  it("shows the savings banner only when interest is actually saved", () => {
    const savings = calculateSavings(
      LOAN.principalAmount,
      LOAN.interestRate,
      LOAN.startDate,
      LOAN.dueDate,
      LOAN.totalPaid,
      LOAN.remainingAmount,
      LOAN.rateChanges
    );

    renderSection();

    const banner = screen.queryByText(/interest saved!$/);
    if (savings.interestSaved > 0) {
      expect(banner).toBeInTheDocument();
      expect(
        screen.getByText(`${formatRupees(savings.interestSaved)} interest saved!`)
      ).toBeInTheDocument();
    } else {
      expect(banner).not.toBeInTheDocument();
    }
  });

  it("shows an unavailable message when the date range yields no tenure", () => {
    renderSection({ startDate: "2026-01-01", dueDate: "2026-01-01" });

    expect(
      screen.getByText(/Amortization schedule unavailable/)
    ).toBeInTheDocument();
  });
});
