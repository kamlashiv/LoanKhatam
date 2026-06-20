/**
 * @jest-environment jsdom
 *
 * Integration tests for the All Loans page. The page lets users narrow the
 * list with status tabs (active / overdue / paid) and a borrower-name search
 * box. Status filtering is delegated to the list endpoint (the hook is called
 * with a `status` param), while the search box filters client-side on the
 * loaded rows. These tests render the page with a mocked list hook that
 * honours the `status` param and assert that the tabs, the search box and the
 * empty state map to the correct set of rendered rows — so a regression in
 * how the controls are wired to the list is caught here.
 */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// wouter ships untranspiled ESM; the page only needs Link to render.
jest.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Control the list hook. It is called with `{ status }` (or undefined for
// "all"), so the mock filters the dataset by that param to mirror the
// server-side status filtering the page relies on.
const mockUseListLoans = jest.fn();
jest.mock("@workspace/api-client-react", () => ({
  useListLoans: (params?: { status?: string }) => mockUseListLoans(params),
}));

import { LoansList } from "../loans";
import type { Loan } from "@workspace/api-client-react/src/generated/api.schemas";

function makeLoan(partial: Partial<Loan> & Pick<Loan, "id" | "borrowerName" | "status">): Loan {
  return {
    userId: "u1",
    principalAmount: 100_000,
    interestRate: 8,
    startDate: "2026-01-01",
    dueDate: "2026-12-01",
    description: null,
    totalPaid: 0,
    remainingAmount: 100_000,
    createdAt: "2026-01-01T00:00:00.000Z",
    rateChanges: [],
    ...partial,
  };
}

const LOANS: Loan[] = [
  makeLoan({ id: 1, borrowerName: "Asha Patel", status: "active" }),
  makeLoan({ id: 2, borrowerName: "Rahul Mehta", status: "overdue" }),
  makeLoan({ id: 3, borrowerName: "Priya Singh", status: "paid", totalPaid: 100_000, remainingAmount: 0 }),
  makeLoan({ id: 4, borrowerName: "Arjun Patel", status: "active" }),
];

// Mirror the server: when a status param is supplied, only loans of that
// status come back; otherwise the full list is returned.
function wireList() {
  mockUseListLoans.mockImplementation((params?: { status?: string }) => {
    const data = params?.status
      ? LOANS.filter((l) => l.status === params.status)
      : LOANS;
    return { data, isLoading: false };
  });
}

// Click one of the status tabs by its visible label.
async function clickTab(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole("button", { name: label }));
}

describe("All Loans page", () => {
  beforeEach(() => {
    mockUseListLoans.mockReset();
  });

  it("shows every loan when the 'All' tab is selected", () => {
    wireList();
    render(<LoansList />);

    for (const loan of LOANS) {
      expect(screen.getByText(loan.borrowerName)).toBeInTheDocument();
    }
  });

  it("filtering by 'Active' shows only active loans", async () => {
    const user = userEvent.setup();
    wireList();
    render(<LoansList />);

    await clickTab(user, "Active");

    expect(screen.getByText("Asha Patel")).toBeInTheDocument();
    expect(screen.getByText("Arjun Patel")).toBeInTheDocument();
    expect(screen.queryByText("Rahul Mehta")).not.toBeInTheDocument();
    expect(screen.queryByText("Priya Singh")).not.toBeInTheDocument();
  });

  it("filtering by 'Overdue' shows only overdue loans", async () => {
    const user = userEvent.setup();
    wireList();
    render(<LoansList />);

    await clickTab(user, "Overdue");

    expect(screen.getByText("Rahul Mehta")).toBeInTheDocument();
    expect(screen.queryByText("Asha Patel")).not.toBeInTheDocument();
    expect(screen.queryByText("Arjun Patel")).not.toBeInTheDocument();
    expect(screen.queryByText("Priya Singh")).not.toBeInTheDocument();
  });

  it("filtering by 'Paid' shows only paid loans", async () => {
    const user = userEvent.setup();
    wireList();
    render(<LoansList />);

    await clickTab(user, "Paid");

    expect(screen.getByText("Priya Singh")).toBeInTheDocument();
    expect(screen.queryByText("Asha Patel")).not.toBeInTheDocument();
    expect(screen.queryByText("Rahul Mehta")).not.toBeInTheDocument();
    expect(screen.queryByText("Arjun Patel")).not.toBeInTheDocument();
  });

  it("searching by borrower name narrows the list", async () => {
    const user = userEvent.setup();
    wireList();
    render(<LoansList />);

    await user.type(
      screen.getByPlaceholderText("Search by borrower name..."),
      "rahul",
    );

    expect(screen.getByText("Rahul Mehta")).toBeInTheDocument();
    expect(screen.queryByText("Asha Patel")).not.toBeInTheDocument();
    expect(screen.queryByText("Priya Singh")).not.toBeInTheDocument();
    expect(screen.queryByText("Arjun Patel")).not.toBeInTheDocument();
  });

  it("search matches multiple loans sharing a name fragment", async () => {
    const user = userEvent.setup();
    wireList();
    render(<LoansList />);

    await user.type(
      screen.getByPlaceholderText("Search by borrower name..."),
      "patel",
    );

    expect(screen.getByText("Asha Patel")).toBeInTheDocument();
    expect(screen.getByText("Arjun Patel")).toBeInTheDocument();
    expect(screen.queryByText("Rahul Mehta")).not.toBeInTheDocument();
    expect(screen.queryByText("Priya Singh")).not.toBeInTheDocument();
  });

  it("shows the search empty state when no borrower matches", async () => {
    const user = userEvent.setup();
    wireList();
    render(<LoansList />);

    await user.type(
      screen.getByPlaceholderText("Search by borrower name..."),
      "nobody",
    );

    expect(screen.getByText('No loans found for "nobody"')).toBeInTheDocument();
    for (const loan of LOANS) {
      expect(screen.queryByText(loan.borrowerName)).not.toBeInTheDocument();
    }
  });

  it("shows the category empty state when a status filter has no loans", () => {
    mockUseListLoans.mockReturnValue({ data: [], isLoading: false });
    render(<LoansList />);

    expect(screen.getByText("No loans in this category.")).toBeInTheDocument();
  });
});
