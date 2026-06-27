/**
 * @jest-environment jsdom
 *
 * Integration tests for the Loan Detail page. They render the page with a
 * sample loan + payments fixture (API hooks mocked, so no live backend is
 * needed) and assert that it surfaces the right figures: principal, collected,
 * remaining balance, repayment progress, and each payment-history row — so a
 * regression in how those amounts or the progress bar render is caught here.
 */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import type { Loan, Payment } from "@workspace/api-client-react";
import { formatRupees, formatDate } from "@/lib/loan-utils";

// wouter ships untranspiled ESM; none of its routing is under test, so stub the
// pieces the page imports.
jest.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useLocation: () => ["/loans/1", jest.fn()],
  useParams: () => ({ id: "1" }),
}));

// The page only reads useQueryClient to invalidate caches on mutation; a stub
// is enough since no mutations fire in these read-focused tests.
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  useMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/hooks/useTranslation", () => {
  const actual = jest.requireActual("@/hooks/useTranslation");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => (actual.translations.en as any)[key] || key,
      language: "en",
      setLanguage: jest.fn(),
    }),
  };
});

jest.mock("@/hooks/usePremium", () => ({
  usePremium: () => ({
    isPremium: true,
    setShowPaywall: jest.fn(),
    lockFeature: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

// The page reads the Clerk user id to scope the offline snapshot cache; a stub
// is enough since offline caching is exercised in offline-cache.test.ts.
jest.mock("@clerk/react", () => ({
  useUser: () => ({ user: { id: "user_1" } }),
}));

// Offline caching is a best-effort side effect; stub it out so these
// read-focused tests don't touch localStorage.
jest.mock("@/lib/offline-cache", () => ({
  writeOfflineLoanDetail: jest.fn(),
}));

// Mock the generated API hooks so the page renders against fixture data. Query
// hooks return our fixtures; mutation hooks return inert stubs; query-key
// helpers are unused values referenced only inside mutation callbacks.
let mockLoan: Loan | undefined;
let mockPayments: Payment[] | undefined;
let mockLoading = false;

const inertMutation = { mutate: jest.fn(), isPending: false };

jest.mock("@workspace/api-client-react", () => ({
  useGetLoan: () => ({ data: mockLoan, isLoading: mockLoading }),
  useListPayments: () => ({ data: mockPayments }),
  useAddPayment: () => inertMutation,
  useDeletePayment: () => inertMutation,
  useDeleteLoan: () => inertMutation,
  useUpdateLoan: () => inertMutation,
  getGetLoanQueryKey: () => ["loan", 1],
  getListPaymentsQueryKey: () => ["payments", 1],
  getGetDashboardSummaryQueryKey: () => ["dashboard"],
  getGetRecentLoansQueryKey: () => ["recent"],
  getListLoansQueryKey: () => ["loans"],
}));

import { LoanDetail } from "../loan-detail";

function makeLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    id: 1,
    userId: "user_1",
    borrowerName: "Asha Kumar",
    principalAmount: 100_000,
    interestRate: 10,
    startDate: "2026-01-01",
    dueDate: "2026-12-31",
    description: "Home renovation help",
    status: "active",
    totalPaid: 40_000,
    remainingAmount: 60_000,
    createdAt: "2026-01-01T00:00:00.000Z",
    rateChanges: [],
    ...overrides,
  };
}

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    loanId: 1,
    amount: 25_000,
    paymentDate: "2026-02-15",
    notes: null,
    createdAt: "2026-02-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("Loan Detail page", () => {
  beforeEach(() => {
    mockLoading = false;
    mockLoan = makeLoan();
    mockPayments = [];
  });

  it("surfaces principal, collected and remaining figures from the loan", () => {
    render(<LoanDetail />);

    // Borrower name + description header.
    expect(screen.getByText("Asha Kumar")).toBeInTheDocument();
    expect(screen.getByText("Home renovation help")).toBeInTheDocument();

    // Each labelled figure shows the value next to its label.
    const principalLabel = screen.getByText("Principal Amount").closest("div")!;
    expect(
      within(principalLabel).getByText(formatRupees(100_000))
    ).toBeInTheDocument();

    const collectedLabel = screen.getByText("Collected").closest("div")!;
    expect(
      within(collectedLabel).getByText(formatRupees(40_000))
    ).toBeInTheDocument();

    const remainingLabel = screen.getByText("Remaining").closest("div")!;
    expect(
      within(remainingLabel).getByText(formatRupees(60_000))
    ).toBeInTheDocument();
  });

  it("renders the repayment progress as totalPaid / principal", () => {
    mockLoan = makeLoan({ principalAmount: 100_000, totalPaid: 40_000 });
    render(<LoanDetail />);

    // 40,000 of 100,000 == 40.0%.
    expect(screen.getByText("40.0%")).toBeInTheDocument();
  });

  it("caps the progress bar at 100% when overpaid", () => {
    mockLoan = makeLoan({
      principalAmount: 100_000,
      totalPaid: 120_000,
      remainingAmount: 0,
      status: "paid",
    });
    render(<LoanDetail />);

    expect(screen.getByText("100.0%")).toBeInTheDocument();
  });

  it("lists each payment with its amount, date and note", () => {
    mockPayments = [
      makePayment({ id: 1, amount: 25_000, paymentDate: "2026-02-15", notes: "First installment" }),
      makePayment({ id: 2, amount: 15_000, paymentDate: "2026-03-20", notes: null }),
    ];
    render(<LoanDetail />);

    expect(screen.getByText("Payment History")).toBeInTheDocument();

    // Payment one: amount, date and note all render.
    expect(screen.getByText(formatRupees(25_000))).toBeInTheDocument();
    expect(screen.getByText(formatDate("2026-02-15"))).toBeInTheDocument();
    expect(screen.getByText("First installment")).toBeInTheDocument();

    // Payment two: amount and date render.
    expect(screen.getByText(formatRupees(15_000))).toBeInTheDocument();
    expect(screen.getByText(formatDate("2026-03-20"))).toBeInTheDocument();
  });

  it("shows an empty state when there are no payments", () => {
    mockPayments = [];
    render(<LoanDetail />);

    expect(screen.getByText("No payments recorded yet.")).toBeInTheDocument();
  });

  it("shows a not-found message when the loan is missing", () => {
    mockLoan = undefined;
    mockLoading = false;
    render(<LoanDetail />);

    expect(screen.getByText("Loan not found.")).toBeInTheDocument();
  });
});
