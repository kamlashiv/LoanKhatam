/**
 * @jest-environment jsdom
 *
 * Integration tests for the Dashboard page. The bento summary cards (total
 * lent, outstanding, collected, overdue), the loan status mix and the
 * recent-loans list are the first thing users see, and they are wired straight
 * to the dashboard-summary and recent-loans endpoints. These tests render the
 * page with mocked hook data and assert each card shows the correctly formatted
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

// The dashboard also reads the global financial profile and loan-derived
// figures; both rely on providers we don't mount here, so stub the hooks. The
// real profile helpers (totalIncome/totalExpenses/etc.) are kept so the
// snapshot logic still runs against EMPTY_PROFILE (which keeps the snapshot
// section collapsed and out of the way of the assertions below).
jest.mock("@/lib/profile", () => {
  const actual = jest.requireActual("@/lib/profile");
  return {
    ...actual,
    useProfile: () => ({
      profile: actual.EMPTY_PROFILE,
      update: jest.fn(),
      isLoading: false,
      saveStatus: "idle",
    }),
  };
});
jest.mock("@/lib/loan-derive", () => ({
  useDerivedLoans: () => ({
    debtItems: [],
    aggregateEmi: 0,
    totalOutstanding: 0,
    hasLoans: false,
    isLoading: false,
  }),
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

// Find a bento summary card by a label/heading it contains and return its
// enclosing card element so assertions about its value can be scoped to it.
// Every bento card carries the `bento-shadow` class.
function cardByText(text: string): HTMLElement {
  const el = screen.getByText(text);
  const card = el.closest("div.bento-shadow") as HTMLElement;
  if (!card) throw new Error(`No card found for text: ${text}`);
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

    const totalLent = cardByText("Total Lent");
    expect(
      within(totalLent).getByText(formatRupees(SUMMARY.totalLent)),
    ).toBeInTheDocument();

    const outstanding = cardByText("Outstanding");
    expect(
      within(outstanding).getByText(formatRupees(SUMMARY.totalOutstanding)),
    ).toBeInTheDocument();

    const collected = cardByText("Collected");
    expect(
      within(collected).getByText(formatRupees(SUMMARY.totalCollected)),
    ).toBeInTheDocument();
  });

  it("shows the overdue loan count and urgent caption when loans are overdue", () => {
    loaded();
    render(<Dashboard />);

    const overdue = cardByText("Loans Overdue");
    expect(
      within(overdue).getByText(String(SUMMARY.overdueLoans)),
    ).toBeInTheDocument();
    expect(within(overdue).getByText("Urgent Attention")).toBeInTheDocument();
  });

  it("uses the all-clear caption when there are no overdue loans", () => {
    mockUseGetDashboardSummary.mockReturnValue({
      data: { ...SUMMARY, overdueLoans: 0 },
      isLoading: false,
    });
    mockUseGetRecentLoans.mockReturnValue({ data: [], isLoading: false });
    render(<Dashboard />);

    const overdue = cardByText("All Clear");
    expect(within(overdue).getByText("0")).toBeInTheDocument();
    expect(within(overdue).getByText("Loans Overdue")).toBeInTheDocument();
  });

  it("renders the loan status mix counts from the summary", () => {
    loaded();
    render(<Dashboard />);

    const mix = cardByText("Loan Status Mix");

    const activeRow = within(mix).getByText("Active").closest(
      "div.justify-between",
    )!;
    expect(
      within(activeRow).getByText(String(SUMMARY.activeLoans)),
    ).toBeInTheDocument();

    const paidRow = within(mix).getByText("Paid").closest("div.justify-between")!;
    expect(
      within(paidRow).getByText(String(SUMMARY.paidLoans)),
    ).toBeInTheDocument();

    const overdueRow = within(mix).getByText("Overdue").closest(
      "div.justify-between",
    )!;
    expect(
      within(overdueRow).getByText(String(SUMMARY.overdueLoans)),
    ).toBeInTheDocument();

    // The total loan count is surfaced on the Total Lent card.
    const totalLent = cardByText("Total Lent");
    expect(
      within(totalLent).getByText(`Across ${SUMMARY.totalLoans} total loans`),
    ).toBeInTheDocument();
  });

  it("renders a recent-loans row for each loan with its details", () => {
    loaded();
    render(<Dashboard />);

    for (const loan of RECENT_LOANS) {
      const row = screen
        .getByText(loan.borrowerName)
        .closest("div.p-4") as HTMLElement;
      expect(row).toBeTruthy();

      expect(
        within(row).getByText(
          `Due ${formatDate(loan.dueDate)} • ${loan.interestRate}% rate`,
        ),
      ).toBeInTheDocument();
      expect(
        within(row).getByText(formatRupees(loan.principalAmount)),
      ).toBeInTheDocument();
      expect(
        within(row).getByText(`${formatRupees(loan.remainingAmount)} left`),
      ).toBeInTheDocument();
    }
  });

  it("renders the correct status badge for each recent loan", () => {
    loaded();
    render(<Dashboard />);

    const asha = screen.getByText("Asha Patel").closest("div.p-4") as HTMLElement;
    expect(within(asha).getByText("Active")).toBeInTheDocument();

    const rahul = screen
      .getByText("Rahul Mehta")
      .closest("div.p-4") as HTMLElement;
    expect(within(rahul).getByText("Overdue")).toBeInTheDocument();

    const priya = screen
      .getByText("Priya Singh")
      .closest("div.p-4") as HTMLElement;
    expect(within(priya).getByText("Paid")).toBeInTheDocument();
  });

  it("shows the empty state when there are no recent loans", () => {
    mockUseGetDashboardSummary.mockReturnValue({
      data: SUMMARY,
      isLoading: false,
    });
    mockUseGetRecentLoans.mockReturnValue({ data: [], isLoading: false });
    render(<Dashboard />);

    expect(screen.getByText(/No loans yet/i)).toBeInTheDocument();
  });
});
