import "./_group.css";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft, Calculator, Plus, Trash2 } from "lucide-react";

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

export function TwoColumnWorksheet() {
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
  const [rateChanges, setRateChanges] = useState<RateChangeEntry[]>([
    { effectiveDate: "2027-01-15", newRate: "8.75" },
  ]);

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

  return (
    <div className="loan-form-scope min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto w-full max-w-[900px] space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Loan</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Record a new loan in your ledger
            </p>
          </div>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* Worksheet grid — paired fields side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
                {/* Borrower | Bank */}
                <div className="space-y-1">
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
                <div className="space-y-1">
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

                {/* Principal | Rate */}
                <div className="space-y-1">
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
                <div className="space-y-1">
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

                {/* Tenure | Start Date */}
                <div className="space-y-1">
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
                <div className="space-y-1">
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                {/* Due Date | Description */}
                <div className="space-y-1">
                  <Label htmlFor="dueDate">Due Date (optional)</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="What is this loan for? e.g. Emergency medical expenses"
                    value={form.description}
                    onChange={handleChange}
                    rows={1}
                    className="min-h-[38px] resize-none"
                  />
                </div>
              </div>

              {/* Calculated EMI — compact horizontal strip spanning both columns */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                {emiInputsValid ? (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <Calculator className="h-4 w-4 text-primary shrink-0" />
                      <div className="leading-tight">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-primary">
                          Calculated EMI
                        </span>
                        <span className="text-xl font-bold tracking-tight">
                          {formatRupees(emi)}
                          <span className="text-xs font-normal text-muted-foreground">
                            {" "}
                            / month
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs">
                      <div className="leading-tight">
                        <p className="text-muted-foreground">Total interest</p>
                        <p className="font-semibold text-foreground">
                          {formatRupees(totalInterest)}
                        </p>
                      </div>
                      <div className="leading-tight">
                        <p className="text-muted-foreground">Total payable</p>
                        <p className="font-semibold text-foreground">
                          {formatRupees(totalPayable)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <Calculator className="h-4 w-4 text-primary shrink-0" />
                    <div className="leading-tight">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-primary">
                        Calculated EMI
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Enter principal, interest rate and tenure to see the
                        monthly installment.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rate Change Events — compact inline table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">
                      Rate Change Events
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Dates when the interest rate changed (e.g. RBI rate
                      revision)
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
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 bg-muted/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <span>Effective Date</span>
                      <span>New Rate (% p.a.)</span>
                      <span className="w-8 text-right">—</span>
                    </div>
                    <div className="divide-y divide-border">
                      {rateChanges.map((rc, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-3 py-2"
                        >
                          <div className="space-y-0.5">
                            <Label
                              htmlFor={`rate-change-date-${index}`}
                              className="sr-only"
                            >
                              Effective Date
                            </Label>
                            <Input
                              id={`rate-change-date-${index}`}
                              type="date"
                              value={rc.effectiveDate}
                              onChange={(e) =>
                                updateRateChange(
                                  index,
                                  "effectiveDate",
                                  e.target.value
                                )
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <Label
                              htmlFor={`rate-change-rate-${index}`}
                              className="sr-only"
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
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit" className="px-8">
                  Create Loan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
