import { useCallback, useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useListLoans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatRupees, formatDate, getLoanStatusConfig } from "@/lib/loan-utils";
import { ShareLoan } from "@/components/share-loan";

type StatusFilter = "all" | "active" | "overdue" | "paid";

const STATUS_VALUES: StatusFilter[] = ["all", "active", "overdue", "paid"];

export function LoansList() {
  const queryString = useSearch();
  const [, navigate] = useLocation();
  const statusParam = new URLSearchParams(queryString).get("status");
  const initialStatus: StatusFilter =
    statusParam && STATUS_VALUES.includes(statusParam as StatusFilter)
      ? (statusParam as StatusFilter)
      : "all";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [search, setSearch] = useState("");

  const { data: loans, isLoading, isFetching, refetch } = useListLoans(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const filtered = loans?.filter((l) =>
    l.borrowerName.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Overdue", value: "overdue" },
    { label: "Paid", value: "paid" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Loans</h1>
          <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <span>
              {loans ? `${loans.length} loan${loans.length !== 1 ? "s" : ""}` : "Loading..."}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              aria-label="Refresh loans list"
              title="Refresh now"
              className="inline-flex items-center justify-center rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        <Button asChild className="gap-2 shadow-sm">
          <Link href="/loans/new">
            <Plus className="h-4 w-4" />
            Add Loan
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search loans by borrower name"
            placeholder="Search by borrower name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden bg-card">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loans List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((loan) => {
            const statusConfig = getLoanStatusConfig(loan.status);
            const progress = Math.min(
              100,
              loan.principalAmount > 0
                ? (loan.totalPaid / loan.principalAmount) * 100
                : 0
            );

            return (
              <div
                key={loan.id}
                onClick={() => navigate(`/loans/${loan.id}`)}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link
                        href={`/loans/${loan.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-lg text-foreground group-hover:text-primary transition-colors rounded hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {loan.borrowerName}
                      </Link>
                      {loan.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {loan.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-medium`}>
                        {statusConfig.label}
                      </Badge>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <ShareLoan
                          borrowerName={loan.borrowerName}
                          principalAmount={loan.principalAmount}
                          remainingAmount={loan.remainingAmount}
                          dueDate={loan.dueDate}
                          bank={loan.bank}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Principal</p>
                      <p className="font-semibold text-foreground">{formatRupees(loan.principalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Collected</p>
                      <p className="font-semibold text-emerald-700">{formatRupees(loan.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className={`font-semibold ${loan.status === "overdue" ? "text-destructive" : "text-foreground"}`}>
                        {formatRupees(loan.remainingAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress.toFixed(0)}% paid</span>
                      {loan.dueDate && <span>Due {formatDate(loan.dueDate)}</span>}
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground text-lg mb-4">
            {search ? `No loans found for "${search}"` : "No loans in this category."}
          </p>
          {!search && (
            <Button asChild className="gap-2">
              <Link href="/loans/new">
                <Plus className="h-4 w-4" />
                Add a loan
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
