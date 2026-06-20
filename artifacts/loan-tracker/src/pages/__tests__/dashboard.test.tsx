/**
 * @jest-environment jsdom
 *
 * Integration tests for the Dashboard page. The summary cards (total lent,
 * outstanding, collected, overdue count), the stats row and the recent-loans
 * list are the first thing users see, and they are wired straight to the
 * dashboard-summary and recent-loans endpoints. These tests render the page
 * with mocked hook data and assert each card shows the correctly formatted
 * value and that the recent-loans list renders the expected rows — so a
 * regression in how the endpoint data is mapped to the UI is caught here.
 */
import React from "react";
import { render, screen, within } from "@testing-library/react";

// wouter ships untranspiled ESM; the page only needs Link/useLocation to render.
jest.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useLocation: () => ["/", () => {}],
}));

// Control the two data hooks the dashboard reads from.
const mockUseGetDashboardSummary = jest.fn();
const mockUseGetRecentLoans = jest.fn();
jest.mock("@workspace/api-client-react", () => ({
  useGetDashboardSummary: () => mockUseGetDashboardSummary(),
  useGetRecentLoans: () => mockUseGetRecentLoans(),
}));

import { Dashboard } from "../dashboard";
import { formatRupees, formatDate } from "@/lib/loan-utils";
import type {
  DashboardSummary,
  Loan,
} from "@workspace/api-client-react/src/generated/api.schemas";

const SUMMARY: DashboardSummary = {
  totalLoans: 7,
  activeLoans: 4,
  overdueLoans: 2,
  paidLoans: 1,
  totalLent: 1_250_000,
  totalCollected: 480_000,
  totalOutstanding: 770_000,
};

const RECENT_LOANS: Loan[] = [
  {
    id: 1,
    userId: "u1",
    borrowerName: "Asha Patel",
    principalAmount: 500_000,
    interestRate: 8.5,
    startDate: "2026-01-15",
    dueDate: "2026-12-15",
    description: null,
    status: "active",
    totalPaid: 100_000,
    remainingAmount: 400_000,
    createdAt: "2026-01-15T00:00:00.000Z",
    rateChanges: [],
  },
  {
    id: 2,
    userId: "u1",
    borrowerName: "Rahul Mehta",
    principalAmount: 300_000,
    interestRate: 10,
    startDate: "2025-06-01",
    dueDate: "2026-05-01",
    description: null,
    status: "overdue",
    totalPaid: 50_000,
    remainingAmount: 250_000,
    createdAt: "2025-06-01T00:00:00.000Z",
    rateChanges: [],
  },
  {
    id: 3,
    userId: "u1",
    borrowerName: "Priya Singh",
    principalAmount: 200_000,
    interestRate: 7,
    startDate: "2025-01-01",
    dueDate: "2025-12-01",
    description: null,
    status: "paid",
    totalPaid: 200_000,
    remainingAmount: 0,
    createdAt: "2025-01-01T00:00:00.000Z",
    rateChanges: [],
  },
];

function loaded() {
  mockUseGetDashboardSummary.mockReturnValue({
    data: SUMMARY,
    isLoading: false,
  });
  mockUseGetRecentLoans.mockReturnValue({
    data: RECENT_LOANS,
    isLoading: false,
  });
}

// Find a summary card by its label and return its enclosing card element so we
// can scope assertions about its value and caption to that card.
function cardByLabel(label: string): HTMLElement {
  const labelEl = screen.getByText(label);
  const card = labelEl.closest("div.relative.overflow-hidden") as HTMLElement;
  if (!card) throw new Error(`No card found for label: ${label}`);
  return card;
}

describe("Dashboard page", () => {
  beforeEach(() => {
    mockUseGetDashboardSummary.mockReset();
    mockUseGetRecentLoans.mockReset();
  });

  it("shows each summary card's formatted amount from the endpoint", () => {
    loaded();
    render(<Dashboard />);

    const totalLent = cardByLabel("Total Lent");
    expect(
      within(totalLent).getByText(formatRupees(SUMMARY.totalLent)),
    ).toBeInTheDocument();

    const outstanding = cardByLabel("Outstanding");
    expect(
      within(outstanding).getByText(formatRupees(SUMMARY.totalOutstanding)),
    ).toBeInTheDocument();

    const collected = cardByLabel("Collected");
    expect(
      within(collected).getByText(formatRupees(SUMMARY.totalCollected)),
    ).toBeInTheDocument();
  });

  it("shows the overdue loan count and the past-due caption", () => {
    loaded();
    render(<Dashboard />);

    const overdue = cardByLabel("Overdue Loans");
    expect(
      within(overdue).getByText(String(SUMMARY.overdueLoans)),
    ).toBeInTheDocument();
    expect(
      within(overdue).getByText("Past their due date"),
    ).toBeInTheDocument();
  });

  it("uses the all-on-track caption when there are no overdue loans", () => {
    mockUseGetDashboardSummary.mockReturnValue({
      data: { ...SUMMARY, overdueLoans: 0 },
      isLoading: false,
    });
    mockUseGetRecentLoans.mockReturnValue({ data: [], isLoading: false });
    render(<Dashboard />);

    const overdue = cardByLabel("Overdue Loans");
    expect(within(overdue).getByText("0")).toBeInTheDocument();
    expect(within(overdue).getByText("All on track")).toBeInTheDocument();
  });

  it("renders the stats row counts from the summary", () => {
    loaded();
    render(<Dashboard />);

    // "Active" also appears as a status badge in the recent-loans list, so scope
    // the stats-row assertions to the stats-row container (the parent of the
    // individual stat boxes).
    const statsRow = screen
      .getByText("Total Loans")
      .closest("div.flex.gap-3")!.parentElement as HTMLElement;

    const totalLoans = within(statsRow).getByText("Total Loans").closest("div")!;
    expect(
      within(totalLoans).getByText(String(SUMMARY.totalLoans)),
    ).toBeInTheDocument();

    const active = within(statsRow).getByText("Active").closest("div")!;
    expect(
      within(active).getByText(String(SUMMARY.activeLoans)),
    ).toBeInTheDocument();

    const paid = within(statsRow).getByText("Fully Paid").closest("div")!;
    expect(
      within(paid).getByText(String(SUMMARY.paidLoans)),
    ).toBeInTheDocument();
  });

  it("renders a recent-loans row for each loan with its details", () => {
    loaded();
    render(<Dashboard />);

    for (const loan of RECENT_LOANS) {
      const name = screen.getByText(loan.borrowerName);
      const row = name.closest("div.px-6") as HTMLElement;
      expect(row).toBeTruthy();

      expect(
        within(row).getByText(`Due ${formatDate(loan.dueDate)}`),
      ).toBeInTheDocument();
      expect(
        within(row).getByText(formatRupees(loan.principalAmount)),
      ).toBeInTheDocument();
      expect(
        within(row).getByText(`${formatRupees(loan.remainingAmount)} remaining`),
      ).toBeInTheDocument();
    }
  });

  it("renders the correct status badge for each recent loan", () => {
    loaded();
    render(<Dashboard />);

    const asha = screen.getByText("Asha Patel").closest("div.px-6") as HTMLElement;
    expect(within(asha).getByText("Active")).toBeInTheDocument();

    const rahul = screen.getByText("Rahul Mehta").closest("div.px-6") as HTMLElement;
    expect(within(rahul).getByText("Overdue")).toBeInTheDocument();

    const priya = screen.getByText("Priya Singh").closest("div.px-6") as HTMLElement;
    expect(within(priya).getByText("Paid")).toBeInTheDocument();
  });

  it("shows the empty state when there are no recent loans", () => {
    mockUseGetDashboardSummary.mockReturnValue({
      data: SUMMARY,
      isLoading: false,
    });
    mockUseGetRecentLoans.mockReturnValue({ data: [], isLoading: false });
    render(<Dashboard />);

    expect(
      screen.getByText(/No loans yet/i),
    ).toBeInTheDocument();
  });
});
