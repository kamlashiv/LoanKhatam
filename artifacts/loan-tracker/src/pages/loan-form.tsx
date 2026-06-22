import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearch } from "wouter";
import { Capacitor } from "@capacitor/core";
import {
  useCreateLoan,
  useGetLoan,
  useUpdateLoan,
  getListLoansQueryKey,
  getGetLoanQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentLoansQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Calculator, Plus, Receipt, Sparkles, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupees, formatDate } from "@/lib/loan-utils";
import { registerBackInterceptor } from "@/lib/mobile-back-guard";

interface RateChangeEntry {
  effectiveDate: string;
  newRate: string;
}

const BANK_OPTIONS = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "IndusInd Bank",
  "Yes Bank",
  "IDFC First Bank",
  "Indian Bank",
  "Central Bank of India",
  "Bajaj Finserv",
  "Other",
];

export function LoanForm() {
  const params = useParams<{ id: string }>();
  const id = params.id ? parseInt(params.id) : undefined;
  const isEditing = !!id;
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Read pre-filled values from URL query params. The "Auto-filled by AI" banner
  // only shows when source=ai; other prefills (planner, quick-add) still fill fields.
  const urlParams = new URLSearchParams(search);
  const fromImport = urlParams.get("source") === "ai";

  const [form, setForm] = useState({
    borrowerName: urlParams.get("borrowerName") ?? "",
    principalAmount: urlParams.get("principalAmount") ?? "",
    interestRate: urlParams.get("interestRate") ?? "",
    tenureMonths: urlParams.get("tenureMonths") ?? "",
    startDate: urlParams.get("startDate") ?? new Date().toISOString().split("T")[0],
    dueDate: urlParams.get("dueDate") ?? "",
    bank: urlParams.get("bank") ?? "",
    description: urlParams.get("description") ?? "",
  });

  const [rateChanges, setRateChanges] = useState<RateChangeEntry[]>([]);

  // Snapshot of the form's pristine state used to detect unsaved edits. Starts
  // from the initial (possibly URL-prefilled) values and is reset to the loaded
  // values once an existing loan is fetched in edit mode.
  const baselineRef = useRef<string>(
    JSON.stringify({ form, rateChanges: [] as RateChangeEntry[] }),
  );
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const { data: existingLoan } = useGetLoan(id ?? 0, {
    query: { enabled: isEditing, queryKey: getGetLoanQueryKey(id ?? 0) },
  });

  useEffect(() => {
    if (existingLoan && isEditing) {
      const loadedForm = {
        borrowerName: existingLoan.borrowerName,
        principalAmount: existingLoan.principalAmount.toString(),
        interestRate: existingLoan.interestRate.toString(),
        tenureMonths: existingLoan.tenureMonths?.toString() ?? "",
        startDate: existingLoan.startDate,
        dueDate: existingLoan.dueDate,
        bank: existingLoan.bank ?? "",
        description: existingLoan.description ?? "",
      };
      const loadedRateChanges =
        existingLoan.rateChanges && existingLoan.rateChanges.length > 0
          ? existingLoan.rateChanges.map((rc) => ({
              effectiveDate: rc.effectiveDate,
              newRate: rc.newRate.toString(),
            }))
          : [];
      setForm(loadedForm);
      setRateChanges(loadedRateChanges);
      baselineRef.current = JSON.stringify({
        form: loadedForm,
        rateChanges: loadedRateChanges,
      });
    }
  }, [existingLoan, isEditing]);

  const isDirty =
    JSON.stringify({ form, rateChanges }) !== baselineRef.current;

  // On Android, warn before the hardware back button discards unsaved edits.
  // No-op on web (the interceptor is never registered).
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isDirty) return;
    return registerBackInterceptor(() => {
      setShowDiscardDialog(true);
      return true;
    });
  }, [isDirty]);

  const createLoan = useCreateLoan({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentLoansQueryKey() });
        toast({ title: "Loan created successfully" });
        setLocation(`/loans/${data.id}`);
      },
      onError: (error) => {
        const status = (error as { status?: number } | undefined)?.status;
        toast(
          status === 401 || status === 403
            ? {
                title: "Session expired",
                description:
                  "Please open the app in its own browser tab and sign in again, then retry.",
                variant: "destructive",
              }
            : {
                title: "Could not create loan",
                description: "Please review the details and try again.",
                variant: "destructive",
              },
        );
      },
    },
  });

  const updateLoan = useUpdateLoan({
    mutation: {
      onSuccess: () => {
        if (id) {
          queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
        toast({ title: "Loan updated successfully" });
        setLocation(`/loans/${id}`);
      },
      onError: (error) => {
        const status = (error as { status?: number } | undefined)?.status;
        toast(
          status === 401 || status === 403
            ? {
                title: "Session expired",
                description:
                  "Please open the app in its own browser tab and sign in again, then retry.",
                variant: "destructive",
              }
            : {
                title: "Could not update loan",
                description: "Please review the details and try again.",
                variant: "destructive",
              },
        );
      },
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addRateChange = () => {
    setRateChanges((prev) => [
      ...prev,
      { effectiveDate: new Date().toISOString().split("T")[0], newRate: "" },
    ]);
  };

  const removeRateChange = (index: number) => {
    setRateChanges((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRateChange = (index: number, field: keyof RateChangeEntry, value: string) => {
    setRateChanges((prev) =>
      prev.map((rc, i) => (i === index ? { ...rc, [field]: value } : rc))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validRateChanges = rateChanges
      .filter((rc) => rc.effectiveDate && rc.newRate !== "")
      .map((rc) => ({
        effectiveDate: rc.effectiveDate,
        newRate: parseFloat(rc.newRate),
      }))
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

    const data = {
      borrowerName: form.borrowerName,
      principalAmount: parseFloat(form.principalAmount),
      interestRate: parseFloat(form.interestRate),
      tenureMonths: form.tenureMonths ? parseInt(form.tenureMonths) : undefined,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
      bank: form.bank || undefined,
      description: form.description || undefined,
      rateChanges: validRateChanges,
    };

    if (isEditing && id) {
      updateLoan.mutate({ id, data });
    } else {
      createLoan.mutate({ data });
    }
  };

  const isPending = createLoan.isPending || updateLoan.isPending;
  const cancelHref = isEditing ? `/loans/${id}` : "/loans";

  // Calculated EMI (Equated Monthly Installment) from principal, rate and tenure
  const principalNum = parseFloat(form.principalAmount);
  const rateNum = parseFloat(form.interestRate);
  const tenureNum = parseInt(form.tenureMonths);
  const emiInputsValid =
    principalNum > 0 && tenureNum > 0 && !isNaN(rateNum) && rateNum >= 0;
  let emi = 0;
  if (emiInputsValid) {
    const r = rateNum / 12 / 100;
    emi =
      r === 0
        ? principalNum / tenureNum
        : (principalNum * r * Math.pow(1 + r, tenureNum)) /
          (Math.pow(1 + r, tenureNum) - 1);
  }
  const totalPayable = emi * tenureNum;
  const totalInterest = totalPayable - principalNum;

  // Live "Loan summary" recap shown in the receipt panel.
  const recapRows: { label: string; value: string }[] = [
    { label: "Borrower", value: form.borrowerName || "—" },
    { label: "Bank", value: form.bank || "—" },
    {
      label: "Principal",
      value: principalNum > 0 ? formatRupees(principalNum) : "—",
    },
    {
      label: "Interest rate",
      value: !isNaN(rateNum) ? `${form.interestRate}% p.a.` : "—",
    },
    { label: "Tenure", value: tenureNum > 0 ? `${tenureNum} months` : "—" },
    { label: "Start date", value: form.startDate ? formatDate(form.startDate) : "—" },
    { label: "Due date", value: form.dueDate ? formatDate(form.dueDate) : "—" },
  ];

  return (
    <div className="max-w-[1180px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Go back">
          <Link href={isEditing ? `/loans/${id}` : "/loans"}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Loan" : "Add New Loan"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEditing ? "Update loan details" : "Record a new loan in Loan Khatam"}
          </p>
        </div>
      </div>

      {/* AI pre-fill banner */}
      {fromImport && (
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary">Auto-filled by AI</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Loan data was extracted from the file — verify the details and Save
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Split master / detail */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(360px,420px)] gap-6 items-start">
          {/* LEFT — input fields */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Borrower &amp; Bank
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="borrowerName">Borrower Name</Label>
                  <Input
                    id="borrowerName"
                    name="borrowerName"
                    placeholder="e.g. Ramesh Kumar"
                    value={form.borrowerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="bank">Bank (optional)</Label>
                  <Select
                    value={form.bank}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, bank: value }))
                    }
                  >
                    <SelectTrigger id="bank" aria-label="Select bank">
                      <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANK_OPTIONS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Loan Terms
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="principalAmount">Principal Amount (₹)</Label>
                  <Input
                    id="principalAmount"
                    name="principalAmount"
                    type="number"
                    placeholder="0"
                    min="1"
                    step="any"
                    value={form.principalAmount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                  <Input
                    id="interestRate"
                    name="interestRate"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="any"
                    value={form.interestRate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tenureMonths">Tenure (months)</Label>
                  <Input
                    id="tenureMonths"
                    name="tenureMonths"
                    type="number"
                    placeholder="e.g. 24"
                    min="1"
                    step="1"
                    value={form.tenureMonths}
                    onChange={handleChange}
                  />
                </div>
                <div className="hidden sm:block" />
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="What is this loan for? e.g. Emergency medical expenses"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* Rate Change Events */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Rate Change Events</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add dates when the interest rate changed (e.g. due to RBI rate revision)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={addRateChange}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>

              {rateChanges.length > 0 && (
                <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                  {rateChanges.map((rc, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`rate-change-date-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Effective Date
                        </Label>
                        <Input
                          id={`rate-change-date-${index}`}
                          type="date"
                          value={rc.effectiveDate}
                          onChange={(e) => updateRateChange(index, "effectiveDate", e.target.value)}
                          className="h-8 text-sm"
                          required
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`rate-change-rate-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          New Rate (% p.a.)
                        </Label>
                        <Input
                          id={`rate-change-rate-${index}`}
                          type="number"
                          placeholder="0"
                          min="0"
                          step="any"
                          value={rc.newRate}
                          onChange={(e) => updateRateChange(index, "newRate", e.target.value)}
                          className="h-8 text-sm"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove rate change"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeRateChange(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT — sticky live summary / receipt panel */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-primary/20 bg-card shadow-sm overflow-hidden flex flex-col">
              {/* Hero EMI */}
              <div className="bg-primary/5 border-b border-primary/20 p-6">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Live Loan Receipt
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calculator className="h-3.5 w-3.5 text-primary" />
                    Calculated EMI
                  </div>
                  {emiInputsValid ? (
                    <>
                      <p className="mt-1.5 text-4xl font-bold tracking-tight text-foreground leading-none">
                        {formatRupees(emi)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">per month</p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-background/60 border border-primary/10 p-3">
                          <p className="text-[11px] text-muted-foreground">
                            Total interest
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {formatRupees(totalInterest)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-background/60 border border-primary/10 p-3">
                          <p className="text-[11px] text-muted-foreground">
                            Total payable
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {formatRupees(totalPayable)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Enter principal, interest rate and tenure to see the monthly
                      installment.
                    </p>
                  )}
                </div>
              </div>

              {/* Recap */}
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Loan summary
                </p>
                <dl className="mt-3 space-y-0">
                  {recapRows.map((row, i) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between gap-3 py-2.5 text-sm ${
                        i !== recapRows.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <dt className="text-muted-foreground">{row.label}</dt>
                      <dd className="font-medium text-foreground text-right truncate max-w-[55%]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                  {rateChanges.length > 0 && (
                    <div className="flex items-center justify-between gap-3 py-2.5 text-sm border-t border-border">
                      <dt className="text-muted-foreground">Rate changes</dt>
                      <dd className="font-medium text-foreground text-right">
                        {rateChanges.length} scheduled
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Pinned actions */}
              <div className="mt-auto border-t border-border bg-muted/20 p-5 flex flex-col gap-2.5">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Saving..." : isEditing ? "Update Loan" : "Create Loan"}
                </Button>
                <Button asChild type="button" variant="outline" className="w-full">
                  <Link href={cancelHref}>Cancel</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </form>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this loan. If you go back now, your
              changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.history.back()}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
