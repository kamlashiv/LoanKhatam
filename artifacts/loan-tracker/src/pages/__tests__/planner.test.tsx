/**
 * @jest-environment jsdom
 *
 * Integration tests for the Loan Payoff Planner page. These drive the page's
 * real inputs (extra EMI, a yearly lump prepayment, a top-up loan) and assert
 * that the numbers the page renders match what the amortization engine
 * (simulatePlan) produces for the same inputs — so a regression in how the page
 * wires inputs to the engine, or renders the results, is caught here.
 */
import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";

// wouter ships untranspiled ESM and recharts renders nothing useful in jsdom
// (zero-size container) — neither is under test, so stub them out.
jest.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("recharts", () => {
  // Render nothing — charts are purely visual and not under test; rendering
  // their SVG children in jsdom only produces unrecognized-tag warnings.
  const Stub = () => null;
  return new Proxy({}, { get: () => Stub });
});

import { Planner } from "../planner";
import { formatRupees } from "@/lib/loan-utils";
import { simulatePlan, type PlannerInput } from "@/lib/planner-engine";

// The default loan parameters the page initialises with.
const DEFAULTS = {
  principal: 2_500_000,
  rate: 8.5,
  tenureMonths: 240,
};

// Mirrors monthsToStr in planner.tsx — used in the Accelerated Payoff card.
function monthsToStr(m: number): string {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} months`;
  if (mo === 0) return `${y} years`;
  return `${y} years ${mo} months`;
}

// Mirrors payoffDate in planner.tsx — the page formats payoff as a date.
function payoffDate(startMonth: string, months: number): string {
  const [y, m] = startMonth.split("-").map(Number);
  if (!y || !m || months <= 0) return "—";
  const d = new Date(y, m - 1 + (months - 1), 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const DEFAULT_START_MONTH = new Date().toISOString().slice(0, 7);

// The page does not link <label>s to inputs via htmlFor, so locate each control
// by its visible label text and then the input within the same wrapper.
function inputByLabel(labelText: string | RegExp): HTMLInputElement {
  const label = screen.getByText(labelText);
  const wrapper = label.closest("div");
  if (!wrapper) throw new Error(`No wrapper for label: ${labelText}`);
  const input = wrapper.querySelector("input");
  if (!input) throw new Error(`No input near label: ${labelText}`);
  return input as HTMLInputElement;
}

function setNumber(input: HTMLInputElement, value: number) {
  fireEvent.change(input, { target: { value: String(value) } });
}

describe("Planner page", () => {
  it("renders the baseline plan's numbers from the engine", () => {
    render(<Planner />);

    const expected = simulatePlan({ ...DEFAULTS, extraEMI: 0 });

    // Base EMI is surfaced (under the Extra Monthly Payment control and in the
    // Monthly Installment Breakdown card).
    expect(
      screen.getAllByText(formatRupees(expected.baseEMI)).length
    ).toBeGreaterThan(0);

    // With no extra payment there are no savings.
    expect(screen.getByText("0 Months")).toBeInTheDocument();
    expect(
      screen.getByText("Repaying on time as scheduled")
    ).toBeInTheDocument();

    // Payoff is shown as a date; with no extra, standard and savings dates match.
    expect(
      screen.getAllByText(payoffDate(DEFAULT_START_MONTH, expected.payoffMonths))
        .length
    ).toBeGreaterThan(0);

    // Schedule table renders the engine's first-year row.
    const firstRow = screen.getByText("Year 1").closest("tr")!;
    const firstYear = expected.years[0];
    expect(
      within(firstRow).getByText(formatRupees(firstYear.opening))
    ).toBeInTheDocument();
    expect(
      within(firstRow).getByText(formatRupees(firstYear.closing))
    ).toBeInTheDocument();

    // Ledger footer total interest matches the engine.
    expect(
      screen.getAllByText(formatRupees(expected.totalInterest)).length
    ).toBeGreaterThan(0);
  });

  it("reflects an extra monthly EMI in payoff, interest saved and months saved", () => {
    render(<Planner />);

    const extraEMI = 10_000;
    setNumber(inputByLabel(/Extra Monthly Payment/), extraEMI);

    const baseline = simulatePlan({ ...DEFAULTS, extraEMI: 0 });
    const plan = simulatePlan({ ...DEFAULTS, extraEMI });
    const interestSaved = Math.max(0, baseline.totalInterest - plan.totalInterest);
    const monthsSaved = Math.max(0, baseline.payoffMonths - plan.payoffMonths);

    expect(interestSaved).toBeGreaterThan(0);
    expect(monthsSaved).toBeGreaterThan(0);

    // Accelerated payoff card shows the time saved.
    expect(
      screen.getAllByText(monthsToStr(monthsSaved)).length
    ).toBeGreaterThan(0);
    // Earlier payoff date for the savings plan is shown.
    expect(
      screen.getAllByText(payoffDate(DEFAULT_START_MONTH, plan.payoffMonths))
        .length
    ).toBeGreaterThan(0);

    // Interest saved surfaces (summary card and savings banner).
    expect(
      screen.getAllByText(formatRupees(interestSaved)).length
    ).toBeGreaterThan(0);

    // Schedule table footer reflects the accelerated plan's interest.
    expect(
      screen.getAllByText(formatRupees(plan.totalInterest)).length
    ).toBeGreaterThan(0);
  });

  it("applies a yearly lump prepayment entered in the ledger", () => {
    render(<Planner />);

    // The "Extra Prepaid (edit)" input on the Year 1 row.
    const firstRow = screen.getByText("Year 1").closest("tr")!;
    const lumpInput = within(firstRow).getByRole("spinbutton") as HTMLInputElement;

    const lump = 200_000;
    setNumber(lumpInput, lump);

    // The page converts a year-N lump into a month-(N*12) prepayment.
    const plan = simulatePlan({
      ...DEFAULTS,
      extraEMI: 0,
      lumpPrepayments: { 12: lump },
    });
    const baseline = simulatePlan({ ...DEFAULTS, extraEMI: 0 });
    const monthsSaved = baseline.payoffMonths - plan.payoffMonths;

    expect(monthsSaved).toBeGreaterThan(0);
    expect(
      screen.getAllByText(monthsToStr(monthsSaved)).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(formatRupees(plan.totalInterest)).length
    ).toBeGreaterThan(0);
  });

  it("recalculates when a top-up loan is configured", () => {
    render(<Planner />);

    const topUpAmount = 500_000;
    setNumber(inputByLabel(/^Amount \(₹\)$/), topUpAmount);

    // Top-up rate defaults to 9%, disbursed month defaults to 12.
    const plan = simulatePlan({
      ...DEFAULTS,
      extraEMI: 0,
      topUp: { amount: topUpAmount, rate: 9, month: 12 },
    });

    // Net principal card shows principal + top-up, plus the top-up amount itself.
    expect(
      screen.getAllByText(formatRupees(plan.totalPrincipalBorrowed)).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(formatRupees(topUpAmount)).length
    ).toBeGreaterThan(0);
    // Helper note confirms the top-up was registered.
    expect(
      screen.getByText(/will be added in month 12/)
    ).toBeInTheDocument();
  });

  it("combines extra EMI, a yearly lump and a top-up at the UI level", () => {
    render(<Planner />);

    const extraEMI = 8_000;
    const lump = 150_000;
    const topUpAmount = 400_000;

    setNumber(inputByLabel(/Extra Monthly Payment/), extraEMI);
    setNumber(inputByLabel(/^Amount \(₹\)$/), topUpAmount);

    const firstRow = screen.getByText("Year 1").closest("tr")!;
    const lumpInput = within(firstRow).getByRole("spinbutton") as HTMLInputElement;
    setNumber(lumpInput, lump);

    const input: PlannerInput = {
      ...DEFAULTS,
      extraEMI,
      lumpPrepayments: { 12: lump },
      topUp: { amount: topUpAmount, rate: 9, month: 12 },
    };
    const plan = simulatePlan(input);
    const baseline = simulatePlan({ ...DEFAULTS, extraEMI: 0 });
    const interestSaved = Math.max(0, baseline.totalInterest - plan.totalInterest);
    const monthsSaved = Math.max(0, baseline.payoffMonths - plan.payoffMonths);

    // Accelerated payoff and savings reflect the combined inputs.
    expect(monthsSaved).toBeGreaterThan(0);
    expect(
      screen.getAllByText(monthsToStr(monthsSaved)).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(formatRupees(interestSaved)).length
    ).toBeGreaterThan(0);

    // Net principal includes the top-up, and the footer interest matches.
    expect(
      screen.getAllByText(formatRupees(plan.totalPrincipalBorrowed)).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(formatRupees(plan.totalInterest)).length
    ).toBeGreaterThan(0);

    // Schedule table still shows the combined plan's first-year row.
    const planFirstYear = plan.years[0];
    const row = screen.getByText("Year 1").closest("tr")!;
    expect(
      within(row).getByText(formatRupees(planFirstYear.closing))
    ).toBeInTheDocument();
  });
});
