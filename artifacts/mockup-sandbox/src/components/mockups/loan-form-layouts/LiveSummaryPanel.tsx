import "./_group.css";
import { useState } from "react";
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
import { ArrowLeft, Calculator, Plus, Receipt, Trash2 } from "lucide-react";

// ── Stubs (real app uses wouter, react-query, Clerk, /lib/loan-utils) ──
function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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

interface RateChangeEntry {
  effectiveDate: string;
  newRate: string;
}

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function LiveSummaryPanel() {
  const [form, setForm] = useState({
    borrowerName: "Ramesh Kumar",
    principalAmount: "500000",
    interestRate: "9.5",
    tenureMonths: "24",
    startDate: "2026-06-20",
    dueDate: "2028-06-20",
    bank: "HDFC Bank",
    description: "Home renovation advance",
  });
  const [rateChanges, setRateChanges] = useState<RateChangeEntry[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addRateChange = () =>
    setRateChanges((prev) => [
      ...prev,
      { effectiveDate: "2026-06-20", newRate: "" },
    ]);
  const removeRateChange = (index: number) =>
    setRateChanges((prev) => prev.filter((_, i) => i !== index));
  const updateRateChange = (
    index: number,
    field: keyof RateChangeEntry,
    value: string
  ) =>
    setRateChanges((prev) =>
      prev.map((rc, i) => (i === index ? { ...rc, [field]: value } : rc))
    );

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
    {
      label: "Tenure",
      value: tenureNum > 0 ? `${tenureNum} months` : "—",
    },
    { label: "Start date", value: formatDate(form.startDate) },
    { label: "Due date", value: formatDate(form.dueDate) },
  ];

  return (
    <div className="loan-form-scope min-h-screen bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-[1180px] space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Add New Loan
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Record a new loan in your ledger
            </p>
          </div>
        </div>

        {/* Split master/detail */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(360px,420px)] gap-6 items-start">
          {/* LEFT — input fields */}
          <form
            className="space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
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
                  <Label className="text-sm font-semibold">
                    Rate Change Events
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add dates when the interest rate changed (e.g. due to RBI
                    rate revision)
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
                          onChange={(e) =>
                            updateRateChange(index, "effectiveDate", e.target.value)
                          }
                          className="h-8 text-sm"
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
                          value={rc.newRate}
                          onChange={(e) =>
                            updateRateChange(index, "newRate", e.target.value)
                          }
                          className="h-8 text-sm"
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
          </form>

          {/* RIGHT — sticky live summary / receipt panel */}
          <aside className="lg:sticky lg:top-8">
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        per month
                      </p>
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
                      Enter principal, interest rate and tenure to see the
                      monthly installment.
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
                        i !== recapRows.length - 1
                          ? "border-b border-border"
                          : ""
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
                <Button type="submit" className="w-full" onClick={(e) => e.preventDefault()}>
                  Create Loan
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
