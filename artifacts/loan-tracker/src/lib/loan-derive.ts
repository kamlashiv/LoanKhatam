import { useMemo } from "react";
import { useListLoans, type Loan } from "@workspace/api-client-react";
import { type DebtItem } from "./strategy-engine";

/**
 * Standard amortizing monthly payment (EMI) for a loan. Returns 0 when the
 * principal or tenure is missing, since an open-ended loan has no fixed EMI.
 */
export function computeLoanEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number | null | undefined,
): number {
  if (!(principal > 0) || !tenureMonths || tenureMonths <= 0) return 0;
  const r = annualRate / 1200;
  if (r === 0) return principal / tenureMonths;
  const f = Math.pow(1 + r, tenureMonths);
  return (principal * r * f) / (f - 1);
}

export interface DerivedLoans {
  /** Open loans mapped to the strategy engine's debt shape. */
  debtItems: DebtItem[];
  /** Sum of per-loan EMI across open loans. */
  aggregateEmi: number;
  /** Sum of remaining balances across open loans. */
  totalOutstanding: number;
  hasLoans: boolean;
  isLoading: boolean;
}

/** Pure derivation so it can be unit-tested without React Query. */
export function deriveFromLoans(loans: Loan[]): Omit<DerivedLoans, "isLoading"> {
  const open = loans.filter((l) => l.status !== "paid" && l.remainingAmount > 0);
  const debtItems: DebtItem[] = open.map((l) => ({
    id: String(l.id),
    name: l.borrowerName || l.description || `Loan #${l.id}`,
    balance: Math.max(0, l.remainingAmount),
    rate: Math.max(0, l.interestRate),
    minPayment: Math.round(
      computeLoanEmi(l.principalAmount, l.interestRate, l.tenureMonths),
    ),
  }));
  const aggregateEmi = debtItems.reduce((s, d) => s + d.minPayment, 0);
  const totalOutstanding = debtItems.reduce((s, d) => s + d.balance, 0);
  return { debtItems, aggregateEmi, totalOutstanding, hasLoans: debtItems.length > 0 };
}

/**
 * Loan-derived figures read live from the database. Every screen that needs
 * loan balances or aggregate EMI consumes this so the profile/strategy can
 * never drift from the real loan list.
 */
export function useDerivedLoans(): DerivedLoans {
  const { data, isLoading } = useListLoans();
  return useMemo(() => {
    const loans = (data ?? []) as Loan[];
    return { ...deriveFromLoans(loans), isLoading };
  }, [data, isLoading]);
}
