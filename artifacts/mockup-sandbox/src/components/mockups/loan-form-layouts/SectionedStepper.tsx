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

function SectionShell({
  step,
  title,
  hint,
  last,
  children,
}: {
  step: number;
  title: string;
  hint: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="relative pl-12">
      {/* Number badge + connector rail */}
      <div className="absolute left-0 top-0 flex flex-col items-center">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary"
          aria-hidden="true"
        >
          {step}
        </div>
        {!last && (
          <div className="mt-1 w-px flex-1 bg-border" style={{ minHeight: "100%" }} />
        )}
      </div>

      <div className="pb-10">
        <div className="mb-1">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>
        <div className="mt-4 border-t border-border pt-5">{children}</div>
      </div>
    </section>
  );
}

export function SectionedStepper() {
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

  return (
    <div className="loan-form-scope min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
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

        <form onSubmit={(e) => e.preventDefault()}>
          {/* ── Section 1: Borrower & Bank ── */}
          <SectionShell
            step={1}
            title="Borrower & Bank"
            hint="Who is this loan for, and where is it held?"
          >
            <div className="space-y-5">
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
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
          </SectionShell>

          {/* ── Section 2: Loan Terms (with EMI payoff) ── */}
          <SectionShell
            step={2}
            title="Loan Terms"
            hint="Principal, rate and tenure drive the monthly installment."
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
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

              {/* EMI readout — anchored as the payoff of this section */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Calculated EMI
                  </span>
                </div>
                {emiInputsValid ? (
                  <>
                    <p className="mt-3 text-3xl font-bold tracking-tight">
                      {formatRupees(emi)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / month
                      </span>
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-background/60 p-3">
                        <p className="text-muted-foreground">Total interest</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {formatRupees(totalInterest)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-background/60 p-3">
                        <p className="text-muted-foreground">Total payable</p>
                        <p className="font-semibold text-foreground mt-0.5">
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
          </SectionShell>

          {/* ── Section 3: Schedule ── */}
          <SectionShell
            step={3}
            title="Schedule"
            hint="When does repayment begin and end?"
          >
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </SectionShell>

          {/* ── Section 4: Notes & Rate Changes ── */}
          <SectionShell
            step={4}
            title="Notes & Rate Changes"
            hint="Add context and any mid-term interest rate revisions."
            last
          >
            <div className="space-y-6">
              <div className="space-y-1.5">
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

              <div className="space-y-3">
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
                  <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
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
                              updateRateChange(
                                index,
                                "effectiveDate",
                                e.target.value
                              )
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
              </div>
            </div>
          </SectionShell>

          {/* Footer */}
          <div className="flex gap-3 border-t border-border pt-6">
            <Button type="submit" className="flex-1">
              Create Loan
            </Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
