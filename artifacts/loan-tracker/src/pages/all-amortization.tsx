import { useState } from "react";
import { Link } from "wouter";
import { useListLoans, useListPayments } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { formatRupees, formatDate, getLoanStatusConfig } from "@/lib/loan-utils";
import { calculateBankStyleSchedule } from "@/lib/amortization";
import { BankAmortizationTable } from "@/components/bank-amortization-table";

function LoanAmortizationBody({ loan }: { loan: any }) {
  const { data: payments, isLoading: paymentsLoading } = useListPayments(loan.id);

  const bankResult = payments
    ? calculateBankStyleSchedule(
        loan.principalAmount,
        loan.interestRate,
        loan.startDate,
        loan.dueDate,
        payments.map((p) => ({ paymentDate: p.paymentDate, amount: p.amount }))
      )
    : null;

  if (paymentsLoading || !bankResult) {
    return (
      <div className="space-y-2 py-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  return (
    <BankAmortizationTable
      borrowerName={loan.borrowerName}
      principalAmount={loan.principalAmount}
      interestRate={loan.interestRate}
      startDate={loan.startDate}
      dueDate={loan.dueDate}
      result={bankResult}
    />
  );
}

function LoanAmortizationAccordion({ loan }: { loan: any }) {
  const [open, setOpen] = useState(false);
  const statusConfig = getLoanStatusConfig(loan.status);

  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/40 transition-colors text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base truncate">{loan.borrowerName}</span>
              <Badge
                className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border text-xs font-medium shrink-0`}
              >
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{formatRupees(loan.principalAmount)}</span>
                {" "}@{" "}
                <span className="font-medium text-foreground">{loan.interestRate}%</span> p.a.
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(loan.startDate)} — {formatDate(loan.dueDate)}
              </span>
              {loan.remainingAmount > 0 && (
                <span className="text-xs text-muted-foreground">
                  बाकी:{" "}
                  <span className={`font-medium ${loan.status === "overdue" ? "text-destructive" : "text-foreground"}`}>
                    {formatRupees(loan.remainingAmount)}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="ml-4 shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {/* Accordion Body — only mount when open so payments are fetched on demand */}
      {open && (
        <div className="border-t border-border bg-background p-4">
          <LoanAmortizationBody loan={loan} />
        </div>
      )}
    </div>
  );
}

export function AllAmortization() {
  const { data: loans, isLoading } = useListLoans();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Amortization Schedules</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          सभी loans के bank statement format में repayment schedule — किसी पर click करें expand करने के लिए
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && loans && loans.length === 0 && (
        <Card className="border-border shadow-sm">
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium mb-2">कोई loan नहीं मिला</p>
            <p className="text-sm text-muted-foreground mb-4">
              पहले एक loan जोड़ें फिर amortization schedule देखें।
            </p>
            <Link href="/loans/new">
              <span className="text-primary text-sm font-medium hover:underline cursor-pointer">
                Loan जोड़ें →
              </span>
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && loans && loans.length > 0 && (
        <div className="space-y-3">
          {loans.map((loan: any) => (
            <LoanAmortizationAccordion key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}
