import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { Link, useLocation, useParams } from "wouter";
import {
  useGetLoan,
  useListPayments,
  useAddPayment,
  useDeletePayment,
  useDeleteLoan,
  useUpdateLoan,
  getGetLoanQueryKey,
  getListPaymentsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentLoansQueryKey,
  getListLoansQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, Plus, Calendar, Clock, Calculator, ChevronDown, TrendingUp, Landmark, Loader2 } from "lucide-react";
import { formatRupees, formatDate, getLoanStatusConfig, cleanFloat } from "@/lib/loan-utils";
import { useToast } from "@/hooks/use-toast";
import { AmortizationSection } from "@/components/amortization-section";
import { ShareLoan } from "@/components/share-loan";
import { currentEffectiveRate } from "@/lib/amortization";
import { writeOfflineLoanDetail } from "@/lib/offline-cache";

function computeEmi(principal: number, annualRate: number, months: number): number {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

type Tab = "payments" | "amortization";

export function LoanDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("payments");
  const [showRateHistory, setShowRateHistory] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [prepaymentOption, setPrepaymentOption] = useState<"tenure" | "emi">("tenure");
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState("");
  const [receiptUploading, setReceiptUploading] = useState(false);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      const data = await res.json();
      setPaymentReceiptUrl(data.fileUrl);
    } catch (err) {
      console.error(err);
      alert("Error uploading receipt. Please try again.");
    } finally {
      setReceiptUploading(false);
    }
  };

  const { user } = useUser();
  const userId = user?.id ?? null;

  const { data: loan, isLoading } = useGetLoan(id, { query: { enabled: !!id, queryKey: getGetLoanQueryKey(id) } });
  const { data: payments } = useListPayments(id, { query: { enabled: !!id, queryKey: getListPaymentsQueryKey(id) } });

  // Cache this loan's detail (and its payment history) into the per-user offline
  // snapshot so the bundled offline.html can show it read-only when the device
  // is offline. Scoped to the signed-in Clerk user; cleared on sign-out.
  useEffect(() => {
    if (!userId || !loan) return;
    writeOfflineLoanDetail(userId, loan, payments ?? null);
  }, [userId, loan, payments]);

  const addPayment = useAddPayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentLoansQueryKey() });
        setShowAddPayment(false);
        setPaymentAmount("");
        setPaymentNotes("");
        toast({ title: "Payment recorded successfully" });
      },
    },
  });

  const deletePayment = useDeletePayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Payment removed" });
      },
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ paymentId, amount, paymentDate, notes }: { paymentId: number; amount: number; paymentDate: string; notes?: string }) => {
      const res = await fetch(`/api/loans/${id}/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, paymentDate, notes }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to update payment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentLoansQueryKey() });
      toast({ title: "Payment updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update payment", description: err.message, variant: "destructive" });
    }
  });

  const handleUpdatePayment = async (paymentId: number, amount: number, paymentDate: string, notes?: string) => {
    await updatePayment.mutateAsync({ paymentId, amount, paymentDate, notes });
  };

  const handleAddPaymentDirect = async (amount: number, paymentDate: string, notes?: string) => {
    await addPayment.mutateAsync({ id, data: { amount, paymentDate, notes } });
  };

  const updateLoan = useUpdateLoan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        toast({ title: "Interest rate changes updated" });
      },
    },
  });

  const handleAddRateChange = async (effectiveDate: string, newRate: number, effect?: "tenure" | "emi") => {
    if (!loan) return;
    const currentRateChanges = loan.rateChanges ?? [];
    const updatedRateChanges = [
      ...currentRateChanges,
      { effectiveDate, newRate, effect }
    ].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

    await updateLoan.mutateAsync({
      id,
      data: {
        rateChanges: updatedRateChanges
      }
    });
  };

  const handleDeleteRateChange = async (index: number) => {
    if (!loan) return;
    const currentRateChanges = [...(loan.rateChanges ?? [])];
    currentRateChanges.splice(index, 1);

    await updateLoan.mutateAsync({
      id,
      data: {
        rateChanges: currentRateChanges
      }
    });
  };

  const deleteLoan = useDeleteLoan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentLoansQueryKey() });
        setLocation("/loans");
        toast({ title: "Loan deleted" });
      },
    },
  });

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = cleanFloat(paymentAmount);
    if (!amount || amount <= 0) return;
    const optionText = prepaymentOption === "emi" ? "[Reduce EMI]" : "[Reduce Tenure]";
    let finalNotes = paymentNotes 
      ? `${paymentNotes} ${optionText}`
      : optionText;
    if (paymentReceiptUrl) {
      finalNotes = `${finalNotes} ||| receipt:${paymentReceiptUrl}`;
    }
    addPayment.mutate({ id, data: { amount, paymentDate, notes: finalNotes } });
    setPaymentAmount("");
    setPaymentNotes("");
    setPaymentReceiptUrl("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg mb-4">Loan not found.</p>
        <Link href="/loans">
          <Button variant="outline">Back to all loans</Button>
        </Link>
      </div>
    );
  }

  const statusConfig = getLoanStatusConfig(loan.status);
  const progress = Math.min(100, loan.principalAmount > 0 ? (loan.totalPaid / loan.principalAmount) * 100 : 0);

  const rateChanges = [...(loan.rateChanges ?? [])].sort((a, b) =>
    a.effectiveDate.localeCompare(b.effectiveDate)
  );
  const hasRateChanges = rateChanges.length > 0;
  const currentRate = currentEffectiveRate(loan.interestRate, rateChanges);
  const rateIsCurrent = currentRate !== loan.interestRate;

  const tabs: { id: Tab; label: string }[] = [
    { id: "payments", label: "Payments" },
    { id: "amortization", label: "Amortization & Savings" },
  ];

  const rawDesc = loan.description || "";
  let plainDesc = rawDesc;
  let attachments: Array<{ name: string; url: string }> = [];

  const attachParts = plainDesc.split(" ||| attachments:");
  if (attachParts.length >= 2) {
    plainDesc = attachParts[0];
    try {
      const parsed = JSON.parse(attachParts[1]);
      if (Array.isArray(parsed)) {
        attachments = parsed;
      }
    } catch (e) {
      console.error("Failed to parse attachments", e);
    }
  }

  const descParts = plainDesc.split(" ||| skipped_emis:");
  if (descParts.length >= 2) {
    plainDesc = descParts[0];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to all loans" className="shrink-0">
            <Link href="/loans">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{loan.borrowerName}</h1>
              <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-medium`}>
                {statusConfig.label}
              </Badge>
            </div>
            {plainDesc && (
              <p className="text-muted-foreground mt-0.5 text-sm">{plainDesc}</p>
            )}
            {attachments.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {attachments.map((attach, idx) => (
                  <a
                    key={idx}
                    href={attach.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-100/60 transition-colors"
                  >
                    📎 {attach.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareLoan
            borrowerName={loan.borrowerName}
            principalAmount={loan.principalAmount}
            remainingAmount={loan.remainingAmount}
            dueDate={loan.dueDate}
            bank={loan.bank}
          />
          <Link href={`/loans/${loan.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this loan?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the loan for {loan.borrowerName} and all its payment records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteLoan.mutate({ id })}
                >
                  Delete loan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Loan Summary Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Principal Amount</p>
              <p className="text-xl font-bold mt-1">{formatRupees(loan.principalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-xl font-bold mt-1 text-emerald-700">{formatRupees(loan.totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-xl font-bold mt-1 ${loan.status === "overdue" ? "text-destructive" : ""}`}>
                {formatRupees(loan.remainingAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Rate</p>
              <p className="text-xl font-bold mt-1">
                {currentRate}<span className="text-base font-normal text-muted-foreground">% p.a.</span>
              </p>
              {hasRateChanges && (
                <button
                  onClick={() => setShowRateHistory(!showRateHistory)}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <TrendingUp className="h-3 w-3" />
                  Rate changed {rateChanges.length} time{rateChanges.length > 1 ? "s" : ""}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${showRateHistory ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>

          {hasRateChanges && showRateHistory && (
            <div className="mb-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-semibold mb-3">Rate change history</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Original rate{loan.startDate ? ` · from ${formatDate(loan.startDate)}` : ""}
                  </span>
                  <span className="font-medium">{loan.interestRate}% p.a.</span>
                </div>
                {rateChanges.map((rc, i) => {
                  const isActive = rateIsCurrent && i === rateChanges.length - 1;
                  return (
                    <div
                      key={`${rc.effectiveDate}-${i}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        Effective {formatDate(rc.effectiveDate)}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{rc.newRate}% p.a.</span>
                        {isActive && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 border text-[10px] px-1.5 py-0">
                            Current
                          </Badge>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Repayment progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Start: <span className="font-medium text-foreground">{formatDate(loan.startDate) || "—"}</span></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due: <span className="font-medium text-foreground">{formatDate(loan.dueDate) || "—"}</span></span>
            </div>
            {loan.tenureMonths != null && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Tenure: <span className="font-medium text-foreground">{loan.tenureMonths} months</span></span>
              </div>
            )}
            {loan.tenureMonths != null && loan.tenureMonths > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calculator className="h-4 w-4" />
                <span>EMI: <span className="font-medium text-foreground">{formatRupees(computeEmi(loan.principalAmount, loan.interestRate, loan.tenureMonths))}/mo</span></span>
              </div>
            )}
            {loan.bank && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Landmark className="h-4 w-4" />
                <span>Bank: <span className="font-medium text-foreground">{loan.bank}</span></span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex rounded-lg border border-border overflow-hidden bg-card w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Payments */}
      {activeTab === "payments" && (
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold">Payment History</CardTitle>
            {loan.status !== "paid" && (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setShowAddPayment(!showAddPayment)}
              >
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            )}
          </CardHeader>

          {showAddPayment && (
            <CardContent className="pt-0 pb-4 border-b border-border">
              <form onSubmit={handleAddPayment} className="space-y-4 bg-muted/40 rounded-lg p-4">
                <h3 className="font-semibold text-sm">Record Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      min="1"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date">Payment Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Prepayment Effect (पूर्व-भुगतान का प्रभाव)</Label>
                  <div className="flex flex-col sm:flex-row gap-4 pt-1">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="prepaymentOption"
                        value="tenure"
                        checked={prepaymentOption === "tenure"}
                        onChange={() => setPrepaymentOption("tenure")}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span>Reduce Tenure (कार्यकाल/महीने कम करें)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="prepaymentOption"
                        value="emi"
                        checked={prepaymentOption === "emi"}
                        onChange={() => setPrepaymentOption("emi")}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span>Reduce EMI (मासिक EMI कम करें)</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {prepaymentOption === "tenure" 
                      ? "EMI remains the same, but the loan will end sooner (saves more interest)."
                      : "The loan duration remains the same, but your monthly EMI will decrease."}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Note (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="A note about this payment..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <Label>Receipt or Screenshot (रसीद या स्क्रीनशॉट जोड़ें - Image/PDF)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleReceiptUpload}
                      disabled={receiptUploading}
                      className="rounded-xl cursor-pointer"
                    />
                    {receiptUploading && <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-600 shrink-0" />}
                  </div>
                  {paymentReceiptUrl && (
                    <p className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-950/30 inline-flex items-center gap-1.5 mt-1">
                      ✔ Uploaded successfully
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={addPayment.isPending}>
                    {addPayment.isPending ? "Saving..." : "Save Payment"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddPayment(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}

          <CardContent className="p-0">
            {Array.isArray(payments) && payments.length > 0 ? (
              <div className="divide-y divide-border">
                {payments.map((payment) => (
                  <div key={payment.id} className="px-6 py-4 flex items-center justify-between group">
                    <div>
                      <p className="font-semibold text-emerald-700">{formatRupees(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(payment.paymentDate)}</p>
                      {payment.notes && (() => {
                        const rawNotes = payment.notes || "";
                        let plainNotes = rawNotes;
                        let receiptUrl = "";

                        const receiptParts = plainNotes.split(" ||| receipt:");
                        if (receiptParts.length >= 2) {
                          plainNotes = receiptParts[0];
                          receiptUrl = receiptParts[1];
                        }

                        return (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {plainNotes.includes("[Reduce EMI]") && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-850 dark:bg-indigo-950/40 dark:text-indigo-400">
                                Reduce EMI
                              </span>
                            )}
                            {plainNotes.includes("[Reduce Tenure]") && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-400">
                                Reduce Tenure
                              </span>
                            )}
                            {plainNotes.replace(/\[Reduce (EMI|Tenure)\]/g, "").trim() && (
                              <span className="text-xs text-muted-foreground italic">
                                {plainNotes.replace(/\[Reduce (EMI|Tenure)\]/g, "").trim()}
                              </span>
                            )}
                            {receiptUrl && (
                              <a
                                href={receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-200 transition-colors"
                              >
                                📄 View Receipt
                              </a>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete payment"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            The {formatRupees(payment.amount)} payment from {formatDate(payment.paymentDate)} will be removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deletePayment.mutate({ id, paymentId: payment.id })}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-muted-foreground">No payments recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Amortization */}
      {activeTab === "amortization" && (
        <AmortizationSection
          borrowerName={loan.borrowerName}
          principalAmount={loan.principalAmount}
          interestRate={loan.interestRate}
          startDate={loan.startDate}
          dueDate={loan.dueDate}
          tenureMonths={loan.tenureMonths}
          createdAt={loan.createdAt}
          totalPaid={loan.totalPaid}
          remainingAmount={loan.remainingAmount}
          payments={Array.isArray(payments) ? payments.map((p) => ({ id: p.id, paymentDate: p.paymentDate, amount: p.amount, notes: p.notes })) : []}
          rateChanges={loan.rateChanges ?? []}
          interestType={loan.interestType}
          description={loan.description}
          onAddPayment={handleAddPaymentDirect}
          onEditPayment={handleUpdatePayment}
          onDeletePayment={(paymentId) => deletePayment.mutate({ id, paymentId })}
          onAddRateChange={handleAddRateChange}
          onDeleteRateChange={handleDeleteRateChange}
        />
      )}
    </div>
  );
}
