/**
 * @jest-environment jsdom
 *
 * Integration tests for the add/edit loan form. The form is the main way users
 * create and update loans, mapping its fields (borrower, principal, interest
 * rate, start/due dates, description, rate-change events) to the payload sent to
 * the create/update mutation. These tests render the form with mocked mutation
 * hooks and assert that filling fields and submitting calls the right mutation
 * with the correctly-typed payload — so a regression in how a field is wired to
 * the submitted data is caught here. Both "new loan" and pre-filled "edit"
 * modes are covered.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// wouter ships untranspiled ESM; the form only needs these to render.
const mockSetLocation = jest.fn();
const mockUseParams = jest.fn();
const mockUseSearch = jest.fn();
jest.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useLocation: () => ["/", mockSetLocation],
  useParams: () => mockUseParams(),
  useSearch: () => mockUseSearch(),
}));

// Capture the payloads handed to the create/update mutations.
const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();
const mockUseGetLoan = jest.fn();
jest.mock("@workspace/api-client-react", () => ({
  useCreateLoan: () => ({ mutate: mockCreateMutate, isPending: false }),
  useUpdateLoan: () => ({ mutate: mockUpdateMutate, isPending: false }),
  useGetLoan: (...args: unknown[]) => mockUseGetLoan(...args),
  getListLoansQueryKey: () => ["loans"],
  getGetLoanQueryKey: (id: number) => ["loan", id],
  getGetDashboardSummaryQueryKey: () => ["dashboard-summary"],
  getGetRecentLoansQueryKey: () => ["recent-loans"],
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

import { LoanForm } from "../loan-form";
import type { Loan } from "@workspace/api-client-react/src/generated/api.schemas";

const EXISTING_LOAN: Loan = {
  id: 5,
  userId: "u1",
  borrowerName: "Asha Patel",
  principalAmount: 500_000,
  interestRate: 8.5,
  startDate: "2026-01-15",
  dueDate: "2026-12-15",
  description: "Home renovation",
  status: "active",
  totalPaid: 0,
  remainingAmount: 500_000,
  createdAt: "2026-01-15T00:00:00.000Z",
  rateChanges: [],
};

// date inputs are finicky with userEvent; set them directly.
function setDate(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("Loan form", () => {
  beforeEach(() => {
    mockCreateMutate.mockReset();
    mockUpdateMutate.mockReset();
    mockUseGetLoan.mockReset();
    mockSetLocation.mockReset();
    // default: new-loan mode, no URL pre-fill, no existing loan
    mockUseParams.mockReturnValue({});
    mockUseSearch.mockReturnValue("");
    mockUseGetLoan.mockReturnValue({ data: undefined });
  });

  it("creates a new loan with the values entered in the form", async () => {
    const user = userEvent.setup();
    render(<LoanForm />);

    expect(screen.getByRole("button", { name: "Create Loan" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Borrower Name"), "Ramesh Kumar");
    await user.type(screen.getByLabelText("Principal Amount (₹)"), "250000");
    await user.type(screen.getByLabelText("Interest Rate (% p.a.)"), "9.5");
    setDate("Start Date", "2026-02-01");
    setDate("Due Date", "2026-11-01");
    await user.type(screen.getByLabelText("Description (optional)"), "Car loan");

    await user.click(screen.getByRole("button", { name: "Create Loan" }));

    expect(mockCreateMutate).toHaveBeenCalledTimes(1);
    expect(mockUpdateMutate).not.toHaveBeenCalled();
    expect(mockCreateMutate).toHaveBeenCalledWith({
      data: {
        borrowerName: "Ramesh Kumar",
        principalAmount: 250000,
        interestRate: 9.5,
        startDate: "2026-02-01",
        dueDate: "2026-11-01",
        description: "Car loan",
        rateChanges: [],
      },
    });
  });

  it("submits numeric values as numbers, not strings", async () => {
    const user = userEvent.setup();
    render(<LoanForm />);

    await user.type(screen.getByLabelText("Borrower Name"), "Sita Devi");
    await user.type(screen.getByLabelText("Principal Amount (₹)"), "100000");
    await user.type(screen.getByLabelText("Interest Rate (% p.a.)"), "7");
    setDate("Start Date", "2026-03-01");
    setDate("Due Date", "2026-09-01");

    await user.click(screen.getByRole("button", { name: "Create Loan" }));

    const payload = mockCreateMutate.mock.calls[0][0].data;
    expect(payload.principalAmount).toBe(100000);
    expect(payload.interestRate).toBe(7);
    expect(typeof payload.principalAmount).toBe("number");
    expect(typeof payload.interestRate).toBe("number");
  });

  it("omits an empty description (sends undefined)", async () => {
    const user = userEvent.setup();
    render(<LoanForm />);

    await user.type(screen.getByLabelText("Borrower Name"), "Mohan Lal");
    await user.type(screen.getByLabelText("Principal Amount (₹)"), "50000");
    await user.type(screen.getByLabelText("Interest Rate (% p.a.)"), "6");
    setDate("Start Date", "2026-04-01");
    setDate("Due Date", "2026-10-01");

    await user.click(screen.getByRole("button", { name: "Create Loan" }));

    expect(mockCreateMutate.mock.calls[0][0].data.description).toBeUndefined();
  });

  it("includes a valid rate-change event in the payload", async () => {
    const user = userEvent.setup();
    const { container } = render(<LoanForm />);

    await user.type(screen.getByLabelText("Borrower Name"), "Geeta Rao");
    await user.type(screen.getByLabelText("Principal Amount (₹)"), "300000");
    await user.type(screen.getByLabelText("Interest Rate (% p.a.)"), "8");
    setDate("Start Date", "2026-01-01");
    setDate("Due Date", "2026-12-01");

    await user.click(screen.getByRole("button", { name: "Add" }));
    // Rate-change row inputs have no associated label; target them by their
    // unique compact (.h-8) class within the rate-change panel.
    const rcDate = container.querySelector('input[type="date"].h-8') as HTMLInputElement;
    const rcRate = container.querySelector('input[type="number"].h-8') as HTMLInputElement;
    fireEvent.change(rcDate, { target: { value: "2026-06-01" } });
    fireEvent.change(rcRate, { target: { value: "9.25" } });

    await user.click(screen.getByRole("button", { name: "Create Loan" }));

    expect(mockCreateMutate.mock.calls[0][0].data.rateChanges).toEqual([
      { effectiveDate: "2026-06-01", newRate: 9.25 },
    ]);
  });

  it("pre-fills the form when editing an existing loan", () => {
    mockUseParams.mockReturnValue({ id: "5" });
    mockUseGetLoan.mockReturnValue({ data: EXISTING_LOAN });
    render(<LoanForm />);

    expect(screen.getByRole("button", { name: "Update Loan" })).toBeInTheDocument();
    expect(screen.getByLabelText("Borrower Name")).toHaveValue("Asha Patel");
    expect(screen.getByLabelText("Principal Amount (₹)")).toHaveValue(500_000);
    expect(screen.getByLabelText("Interest Rate (% p.a.)")).toHaveValue(8.5);
    expect(screen.getByLabelText("Start Date")).toHaveValue("2026-01-15");
    expect(screen.getByLabelText("Due Date")).toHaveValue("2026-12-15");
    expect(screen.getByLabelText("Description (optional)")).toHaveValue("Home renovation");
  });

  it("updates an existing loan with the edited values and its id", async () => {
    mockUseParams.mockReturnValue({ id: "5" });
    mockUseGetLoan.mockReturnValue({ data: EXISTING_LOAN });
    const user = userEvent.setup();
    render(<LoanForm />);

    const principal = screen.getByLabelText("Principal Amount (₹)");
    await user.clear(principal);
    await user.type(principal, "450000");

    await user.click(screen.getByRole("button", { name: "Update Loan" }));

    expect(mockUpdateMutate).toHaveBeenCalledTimes(1);
    expect(mockCreateMutate).not.toHaveBeenCalled();
    const call = mockUpdateMutate.mock.calls[0][0];
    expect(call.id).toBe(5);
    expect(call.data.principalAmount).toBe(450000);
    expect(call.data.borrowerName).toBe("Asha Patel");
  });
});
