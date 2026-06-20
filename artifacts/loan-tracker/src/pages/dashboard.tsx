import { Link } from "wouter";
import { useGetDashboardSummary, useGetRecentLoans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { formatRupees, formatDate, getLoanStatusConfig } from "@/lib/loan-utils";

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: recentLoans, isLoading: loansLoading } = useGetRecentLoans();

  const summaryCards = summary
    ? [
        {
          label: "Total Lent",
          value: formatRupees(summary.totalLent),
          icon: TrendingUp,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          label: "Outstanding",
          value: formatRupees(summary.totalOutstanding),
          icon: Clock,
          color: "text-amber-700",
          bg: "bg-amber-50",
        },
        {
          label: "Collected",
          value: formatRupees(summary.totalCollected),
          icon: CheckCircle2,
          color: "text-emerald-700",
          bg: "bg-emerald-50",
        },
        {
          label: "Overdue Loans",
          value: summary.overdueLoans.toString(),
          icon: AlertCircle,
          color: summary.overdueLoans > 0 ? "text-destructive" : "text-muted-foreground",
          bg: summary.overdueLoans > 0 ? "bg-destructive/10" : "bg-muted",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your loan portfolio at a glance</p>
        </div>
        <Link href="/loans/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Loan
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border shadow-sm">
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))
          : summaryCards.map((card) => (
              <Card key={card.label} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <div className={`h-8 w-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Stats Row */}
      {summary && (
        <div className="flex gap-4 flex-wrap">
          <div className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">{summary.totalLoans}</span>
            <span className="text-sm text-muted-foreground">Total Loans</span>
          </div>
          <div className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">{summary.activeLoans}</span>
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <div className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-emerald-700">{summary.paidLoans}</span>
            <span className="text-sm text-muted-foreground">Fully Paid</span>
          </div>
        </div>
      )}

      {/* Recent Loans */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-bold">Recent Loans</CardTitle>
          <Link href="/loans">
            <Button variant="ghost" size="sm" className="text-primary font-medium">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loansLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : recentLoans && recentLoans.length > 0 ? (
            <div className="divide-y divide-border">
              {recentLoans.map((loan) => {
                const statusConfig = getLoanStatusConfig(loan.status);
                return (
                  <Link key={loan.id} href={`/loans/${loan.id}`}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer">
                      <div>
                        <p className="font-semibold text-foreground">{loan.borrowerName}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Due {formatDate(loan.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-foreground">{formatRupees(loan.principalAmount)}</p>
                          <p className="text-xs text-muted-foreground">{formatRupees(loan.remainingAmount)} remaining</p>
                        </div>
                        <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-medium text-xs`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground mb-4">No loans yet. Add your first loan to get started.</p>
              <Link href="/loans/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add your first loan
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
