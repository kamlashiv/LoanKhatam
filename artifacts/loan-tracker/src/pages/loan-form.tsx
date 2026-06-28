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
import { ArrowLeft, Calculator, Plus, Receipt, Sparkles, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupees, formatDate, cleanFloat } from "@/lib/loan-utils";
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
    interestType: urlParams.get("interestType") ?? "standard_emi",
    tenureMonths: urlParams.get("tenureMonths") ?? "",
    startDate: urlParams.get("startDate") ?? new Date().toISOString().split("T")[0],
    dueDate: urlParams.get("dueDate") ?? "",
    bank: urlParams.get("bank") ?? "",
    description: urlParams.get("description") ?? "",
  });

  const [rateChanges, setRateChanges] = useState<RateChangeEntry[]>([]);
  const [isFixedEmi, setIsFixedEmi] = useState(false);
  const [fixedEmiValue, setFixedEmiValue] = useState("");
  const [isSkipped, setIsSkipped] = useState(false);
  const [skippedEmis, setSkippedEmis] = useState<Array<{ date: string; amountPaid: string }>>([]);
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      const data = await res.json();
      setAttachments((prev) => [
        ...prev,
        { name: file.name, url: data.fileUrl },
      ]);
    } catch (err) {
      console.error(err);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Snapshot of the form's pristine state used to detect unsaved edits. Starts
  // from the initial (possibly URL-prefilled) values and is reset to the loaded
  // values once an existing loan is fetched in edit mode.
  const baselineRef = useRef<string>(
    JSON.stringify({ form, rateChanges: [] as RateChangeEntry[], isFixedEmi: false, fixedEmiValue: "", isSkipped: false, skippedEmis: [] as any[], attachments: [] as any[] }),
  );
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const { data: existingLoan } = useGetLoan(id ?? 0, {
    query: { enabled: isEditing, queryKey: getGetLoanQueryKey(id ?? 0) },
  });

  useEffect(() => {
    if (existingLoan && isEditing) {
      const isFixed = existingLoan.interestType?.startsWith("fixed_emi:") || false;
      const fixedVal = isFixed ? existingLoan.interestType.split(":")[1] : "";

      const rawDesc = existingLoan.description || "";
      let plainDesc = rawDesc;
      let loadedSkipped: Array<{ date: string; amountPaid: string }> = [];
      let loadedAttachments: Array<{ name: string; url: string }> = [];

      const attachParts = plainDesc.split(" ||| attachments:");
      if (attachParts.length >= 2) {
        plainDesc = attachParts[0];
        try {
          const parsed = JSON.parse(attachParts[1]);
          if (Array.isArray(parsed)) {
            loadedAttachments = parsed.map((item: any) => ({
              name: item.name || "Attachment",
              url: item.url || "",
            }));
          }
        } catch (e) {
          console.error("Failed to parse attachments", e);
        }
      }

      const descParts = plainDesc.split(" ||| skipped_emis:");
      if (descParts.length >= 2) {
        plainDesc = descParts[0];
        try {
          const parsed = JSON.parse(descParts[1]);
          if (Array.isArray(parsed)) {
            loadedSkipped = parsed.map((item: any) => ({
              date: item.date || "",
              amountPaid: (item.amountPaid ?? 0).toString(),
            }));
          }
        } catch (e) {
          console.error("Failed to parse skipped EMIs", e);
        }
      }

      const loadedForm = {
        borrowerName: existingLoan.borrowerName,
        principalAmount: existingLoan.principalAmount.toString(),
        interestRate: existingLoan.interestRate.toString(),
        interestType: isFixed ? "standard_emi" : (existingLoan.interestType || "standard_emi"),
        tenureMonths: existingLoan.tenureMonths?.toString() ?? "",
        startDate: existingLoan.startDate,
        dueDate: existingLoan.dueDate,
        bank: existingLoan.bank ?? "",
        description: plainDesc,
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
      setIsFixedEmi(isFixed);
      setFixedEmiValue(fixedVal);
      setIsSkipped(loadedSkipped.length > 0);
      setSkippedEmis(loadedSkipped);
      setAttachments(loadedAttachments);
      baselineRef.current = JSON.stringify({
        form: loadedForm,
        rateChanges: loadedRateChanges,
        isFixedEmi: isFixed,
        fixedEmiValue: fixedVal,
        isSkipped: loadedSkipped.length > 0,
        skippedEmis: loadedSkipped,
        attachments: loadedAttachments,
      });
    }
  }, [existingLoan, isEditing]);

  const isDirty =
    JSON.stringify({ form, rateChanges, isFixedEmi, fixedEmiValue, isSkipped, skippedEmis, attachments }) !== baselineRef.current;

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
        newRate: cleanFloat(rc.newRate),
      }))
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

    const finalInterestType = isFixedEmi && fixedEmiValue
      ? `fixed_emi:${cleanFloat(fixedEmiValue)}`
      : form.interestType;

    const cleanSkipped = isSkipped
      ? skippedEmis
          .filter((se) => se.date)
          .map((se) => ({
            date: se.date,
            amountPaid: cleanFloat(se.amountPaid || "0"),
          }))
      : [];

    const rawDesc = form.description || "";
    let finalDescription = rawDesc;
    if (cleanSkipped.length > 0) {
      finalDescription = `${finalDescription} ||| skipped_emis:${JSON.stringify(cleanSkipped)}`;
    }
    if (attachments.length > 0) {
      finalDescription = `${finalDescription} ||| attachments:${JSON.stringify(attachments)}`;
    }

    const data = {
      borrowerName: form.borrowerName,
      principalAmount: cleanFloat(form.principalAmount),
      interestRate: cleanFloat(form.interestRate),
      interestType: finalInterestType,
      tenureMonths: form.tenureMonths ? parseInt(form.tenureMonths) : undefined,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
      bank: form.bank || undefined,
      description: finalDescription || undefined,
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
  const principalNum = cleanFloat(form.principalAmount);
  const rateNum = cleanFloat(form.interestRate);
  const tenureNum = parseInt(form.tenureMonths);
  const emiInputsValid =
    principalNum > 0 && tenureNum > 0 && !isNaN(rateNum) && rateNum >= 0;
  
  let emi = 0;
  let totalPayable = 0;
  let totalInterest = 0;

  const showMonthlyAccrual = form.interestType === "monthly_simple";
  const monthlyAccrualAmount = principalNum * (rateNum / 100);

  if (showMonthlyAccrual) {
    totalInterest = tenureNum > 0 ? (principalNum * (rateNum / 100) * tenureNum) : 0;
    totalPayable = principalNum + totalInterest;
  } else {
    if (emiInputsValid) {
      const r = rateNum / 12 / 100;
      emi =
        r === 0
          ? principalNum / tenureNum
          : (principalNum * r * Math.pow(1 + r, tenureNum)) /
            (Math.pow(1 + r, tenureNum) - 1);
      totalPayable = emi * tenureNum;
      totalInterest = totalPayable - principalNum;
    }
  }

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
      value: !isNaN(rateNum) ? `${form.interestRate}% ${showMonthlyAccrual ? "p.m. (Simple)" : "p.a."}` : "—",
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
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="interestType">Interest Type</Label>
                  <Select
                    value={form.interestType}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, interestType: value }))
                    }
                  >
                    <SelectTrigger id="interestType" aria-label="Select interest type">
                      <SelectValue placeholder="Select interest type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard_emi">
                        Standard Bank EMI (Compound)
                      </SelectItem>
                      <SelectItem value="monthly_simple">
                        Local Monthly Interest (Desi Byaj)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4 sm:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2">
                    <input
                      id="isFixedEmi"
                      type="checkbox"
                      checked={isFixedEmi}
                      onChange={(e) => setIsFixedEmi(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 rounded"
                    />
                    <Label htmlFor="isFixedEmi" className="cursor-pointer font-bold">
                      Fix EMI Amount (EMI फ़िक्स करें)
                    </Label>
                  </div>
                  {isFixedEmi && (
                    <div className="space-y-1.5 pt-2 max-w-xs animate-in slide-in-from-top-1 duration-200">
                      <Label htmlFor="fixedEmiValue">Fixed EMI Amount (₹)</Label>
                      <Input
                        id="fixedEmiValue"
                        type="number"
                        placeholder="e.g. 15000"
                        min="1"
                        value={fixedEmiValue}
                        onChange={(e) => setFixedEmiValue(e.target.value)}
                        required={isFixedEmi}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        This custom monthly EMI will be fixed in the amortization schedule.
                      </p>
                    </div>
                  )}
                </div>

                {/* Skipped EMI Section */}
                <div className={`space-y-4 sm:col-span-2 p-4 rounded-xl border ${isSkipped ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-950/30' : 'bg-emerald-50/30 dark:bg-emerald-950/5 border-emerald-200 dark:border-emerald-950/20'}`}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">EMI Skipped / Missed Status (किस्त की स्थिति)</Label>
                    {isSkipped ? (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">Skipped (किस्त छूटी है)</span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">On Time (समय पर भुगतान)</span>
                    )}
                  </div>

                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="isSkipped"
                        value="no"
                        checked={!isSkipped}
                        onChange={() => {
                          setIsSkipped(false);
                          setSkippedEmis([]);
                        }}
                        className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">No (कोई किस्त नहीं छूटी)</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="isSkipped"
                        value="yes"
                        checked={isSkipped}
                        onChange={() => {
                          setIsSkipped(true);
                          if (skippedEmis.length === 0) {
                            setSkippedEmis([{ date: new Date().toISOString().split("T")[0], amountPaid: "0" }]);
                          }
                        }}
                        className="h-4 w-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                      />
                      <span className="text-rose-700 dark:text-rose-400 font-semibold">Yes (किस्त छूटी है)</span>
                    </label>
                  </div>

                  {isSkipped && (
                    <div className="space-y-3 pt-2 border-t border-rose-100 dark:border-rose-950/20">
                      <div className="space-y-2">
                        {skippedEmis.map((se, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-border shadow-sm">
                            <div className="space-y-1.5 flex-1 w-full">
                              <Label className="text-xs">When Skipped (कब छूटी)</Label>
                              <Input
                                type="date"
                                value={se.date}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSkippedEmis(prev => prev.map((item, i) => i === idx ? { ...item, date: val } : item));
                                }}
                                required
                              />
                            </div>
                            <div className="space-y-1.5 flex-1 w-full">
                              <Label className="text-xs">How Much Money Paid (कितना पैसा दिया)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                value={se.amountPaid}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSkippedEmis(prev => prev.map((item, i) => i === idx ? { ...item, amountPaid: val } : item));
                                }}
                                required
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSkippedEmis(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-2 h-9 w-9 rounded-lg mt-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSkippedEmis(prev => [...prev, { date: new Date().toISOString().split("T")[0], amountPaid: "0" }]);
                        }}
                        className="w-full sm:w-auto text-xs font-bold gap-1 rounded-xl"
                      >
                        <Plus className="h-3 w-3" /> Add Skip Month (किस्त छूटने का विवरण जोड़ें)
                      </Button>
                    </div>
                  )}
                </div>
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
                  <Label htmlFor="interestRate">
                    {showMonthlyAccrual ? "Interest Rate (% per month)" : "Interest Rate (% p.a.)"}
                  </Label>
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
                <div className="space-y-1.5 sm:col-span-2 pt-2">
                  <Label>Documents & Attachments (रसीद या दस्तावेज - Image/PDF)</Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="rounded-xl cursor-pointer"
                      />
                      {uploading && <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-600 shrink-0" />}
                    </div>

                    {attachments.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {attachments.map((attach, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-border text-xs font-semibold">
                            <span className="truncate max-w-[180px] text-slate-700 dark:text-slate-300">
                              📎 {attach.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttachment(idx)}
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-1 h-7 w-7 rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                   <div className="mt-5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calculator className="h-3.5 w-3.5 text-primary" />
                    {showMonthlyAccrual ? "Monthly Interest Accrual" : "Calculated EMI"}
                  </div>
                  {principalNum > 0 && !isNaN(rateNum) ? (
                    <>
                      <p className="mt-1.5 text-4xl font-bold tracking-tight text-foreground leading-none">
                        {formatRupees(showMonthlyAccrual ? monthlyAccrualAmount : emi)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">per month</p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-background/60 border border-primary/10 p-3">
                          <p className="text-[11px] text-muted-foreground">
                            Total interest {tenureNum > 0 ? "" : "(est. 1 yr)"}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {formatRupees(tenureNum > 0 ? totalInterest : (monthlyAccrualAmount * 12))}
                          </p>
                        </div>
                        <div className="rounded-lg bg-background/60 border border-primary/10 p-3">
                          <p className="text-[11px] text-muted-foreground">
                            Total payable {tenureNum > 0 ? "" : "(est. 1 yr)"}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {formatRupees(tenureNum > 0 ? totalPayable : (principalNum + monthlyAccrualAmount * 12))}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Enter principal, interest rate and tenure to see details.
                    </p>
                  )}
                </div>                </div>
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
