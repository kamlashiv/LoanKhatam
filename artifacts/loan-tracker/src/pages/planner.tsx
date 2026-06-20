import { useState, useRef, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Loader2,
  TrendingDown, Target, Zap, BarChart3, RefreshCw, Plus,
  Download, Pencil, Save, X, Calculator, Sparkles, ChevronDown,
} from "lucide-react";
import { formatRupees } from "@/lib/loan-utils";
import {
  simulatePlan, reverseFromTargetMonths, STRATEGY_PRESETS,
  type PlannerResult,
} from "@/lib/planner-engine";
import { exportPlannerCSV, exportPlannerPDF } from "@/lib/export";
import { useAuth } from "@clerk/react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface LoanParams {
  principal: number;
  rate: number;
  tenureMonths: number;
  startMonth: string;
  extraEMI: number;
}

interface TopUpState {
  amount: number;
  rate: number;
  month: number;
}

interface ExtractedData {
  borrowerName: string | null;
  principalAmount: number | null;
  interestRate: number | null;
  startDate: string | null;
  dueDate: string | null;
  description: string | null;
  confidence: "high" | "medium" | "low";
  notes: string;
}

function monthsToStr(m: number) {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} महीने`;
  if (mo === 0) return `${y} साल`;
  return `${y} साल ${mo} महीने`;
}

// ─── File upload component ───────────────────────────────────────────────────
function FileUploadZone({
  onExtracted,
}: {
  onExtracted: (data: ExtractedData) => void;
}) {
  const { getToken } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus("loading");
    setErrorMsg("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-loan", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Extraction failed");
      setStatus("success");
      onExtracted(json.data);
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus("error");
    }
  }, [getToken, onExtracted]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        dragOver
          ? "border-primary bg-primary/5"
          : status === "success"
          ? "border-emerald-400 bg-emerald-50"
          : status === "error"
          ? "border-red-400 bg-red-50"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      }`}
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.pdf,.json,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
      />

      {status === "loading" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-primary">AI extract कर रहा है…</p>
          <p className="text-xs text-muted-foreground">{fileName}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-800">Data निकाल लिया — नीचे check & edit करें</p>
          <p className="text-xs text-muted-foreground">{fileName}</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-semibold text-red-700">Error आया</p>
          <p className="text-xs text-red-600">{errorMsg}</p>
        </div>
      )}

      {status === "idle" && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">File upload करें या खींचें</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG • JPG • PDF • JSON • CSV — AI data extract करेगा
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Editable extracted-data review ──────────────────────────────────────────
function ExtractedReview({
  draft,
  onChange,
  onApply,
  onDiscard,
}: {
  draft: ExtractedData;
  onChange: (d: ExtractedData) => void;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const confidenceColor = {
    high: "bg-emerald-100 text-emerald-800 border-emerald-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    low: "bg-red-100 text-red-800 border-red-300",
  };

  const set = <K extends keyof ExtractedData>(k: K, v: ExtractedData[K]) =>
    onChange({ ...draft, [k]: v });

  const saveQuery = new URLSearchParams();
  if (draft.borrowerName) saveQuery.set("borrowerName", draft.borrowerName);
  if (draft.principalAmount) saveQuery.set("principalAmount", String(draft.principalAmount));
  if (draft.interestRate) saveQuery.set("interestRate", String(draft.interestRate));
  if (draft.startDate) saveQuery.set("startDate", draft.startDate);
  if (draft.dueDate) saveQuery.set("dueDate", draft.dueDate);
  if (draft.description) saveQuery.set("description", draft.description);

  return (
    <div className="bg-slate-50 border border-border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm flex items-center gap-1.5">
          <Pencil className="h-3.5 w-3.5 text-primary" />
          Extracted Data — Edit करें
        </span>
        <Badge className={`${confidenceColor[draft.confidence]} border text-xs`}>
          Confidence: {draft.confidence}
        </Badge>
      </div>
      {draft.notes && (
        <p className="text-xs text-muted-foreground italic">{draft.notes}</p>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Borrower / Profile Name</Label>
          <Input
            className="h-8 text-xs"
            value={draft.borrowerName ?? ""}
            onChange={(e) => set("borrowerName", e.target.value || null)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Loan Amount (₹)</Label>
          <Input
            className="h-8 text-xs"
            type="number"
            value={draft.principalAmount ?? ""}
            onChange={(e) => set("principalAmount", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Interest Rate (%)</Label>
          <Input
            className="h-8 text-xs"
            type="number"
            step="0.1"
            value={draft.interestRate ?? ""}
            onChange={(e) => set("interestRate", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Start Date</Label>
          <Input
            className="h-8 text-xs"
            type="date"
            value={draft.startDate ?? ""}
            onChange={(e) => set("startDate", e.target.value || null)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Due Date</Label>
          <Input
            className="h-8 text-xs"
            type="date"
            value={draft.dueDate ?? ""}
            onChange={(e) => set("dueDate", e.target.value || null)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={onApply}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Apply to Calculator
        </Button>
        <Link href={`/loans/new?${saveQuery.toString()}`}>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" />
            Save as Loan
          </Button>
        </Link>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs" onClick={onDiscard}>
          <X className="h-3.5 w-3.5" />
          Discard
        </Button>
      </div>
    </div>
  );
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-4 py-3 text-sm min-w-[180px]">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{formatRupees(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export function Planner() {
  const [params, setParams] = useState<LoanParams>({
    principal: 2500000,
    rate: 8.5,
    tenureMonths: 240,
    startMonth: new Date().toISOString().slice(0, 7),
    extraEMI: 0,
  });
  const [profileName, setProfileName] = useState("");
  const [topUp, setTopUp] = useState<TopUpState>({ amount: 0, rate: 9, month: 12 });
  const [yearLumps, setYearLumps] = useState<Record<number, number>>({});
  const [targetYears, setTargetYears] = useState(10);
  const [view, setView] = useState<"balance" | "interest">("balance");
  const [draft, setDraft] = useState<ExtractedData | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(true);
  const [exporting, setExporting] = useState(false);

  const set = (k: keyof LoanParams, v: number | string) =>
    setParams((p) => ({ ...p, [k]: v }));

  const handleExtracted = useCallback((data: ExtractedData) => {
    setDraft(data);
    if (data.borrowerName) setProfileName(data.borrowerName);
  }, []);

  const applyDraft = useCallback(() => {
    if (!draft) return;
    const updates: Partial<LoanParams> = {};
    if (draft.principalAmount) updates.principal = draft.principalAmount;
    if (draft.interestRate) updates.rate = draft.interestRate;
    if (draft.startDate && draft.dueDate) {
      const s = new Date(draft.startDate);
      const e = new Date(draft.dueDate);
      const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
      if (months > 0) updates.tenureMonths = months;
    }
    if (draft.startDate) updates.startMonth = draft.startDate.slice(0, 7);
    if (draft.borrowerName) setProfileName(draft.borrowerName);
    setParams((p) => ({ ...p, ...updates }));
    setYearLumps({});
    setDraft(null);
  }, [draft]);

  // Convert per-year lumps to month-indexed prepayments (end of each year).
  const lumpPrepayments = useMemo(() => {
    const out: Record<number, number> = {};
    for (const [yr, amt] of Object.entries(yearLumps)) {
      const n = Number(amt);
      if (n > 0) out[Number(yr) * 12] = n;
    }
    return out;
  }, [yearLumps]);

  const topUpInput = useMemo(
    () =>
      topUp.amount > 0
        ? {
            amount: topUp.amount,
            rate: topUp.rate,
            month: Math.min(params.tenureMonths, Math.max(1, topUp.month)),
          }
        : null,
    [topUp.amount, topUp.rate, topUp.month, params.tenureMonths]
  );

  const plan: PlannerResult = useMemo(
    () => simulatePlan({
      principal: params.principal,
      rate: params.rate,
      tenureMonths: params.tenureMonths,
      extraEMI: params.extraEMI,
      lumpPrepayments,
      topUp: topUpInput,
    }),
    [params, lumpPrepayments, topUpInput]
  );

  const baseline: PlannerResult = useMemo(
    () => simulatePlan({
      principal: params.principal,
      rate: params.rate,
      tenureMonths: params.tenureMonths,
      extraEMI: 0,
    }),
    [params.principal, params.rate, params.tenureMonths]
  );

  const interestSaved = Math.max(0, baseline.totalInterest - plan.totalInterest);
  const monthsSaved = Math.max(0, baseline.payoffMonths - plan.payoffMonths);
  const totalMonthly = plan.baseEMI + params.extraEMI;
  const tenureYears = Math.round(params.tenureMonths / 12 * 10) / 10;

  const reverse = useMemo(
    () => reverseFromTargetMonths(params.principal, params.rate, plan.baseEMI, targetYears * 12),
    [params.principal, params.rate, plan.baseEMI, targetYears]
  );

  // Chart data: balance runoff or cumulative interest, year by year.
  const chartData = useMemo(() => {
    const maxYears = Math.max(baseline.years.length, plan.years.length);
    let bc = 0, pc = 0;
    const baseCum: number[] = [];
    const planCum: number[] = [];
    baseline.years.forEach((y) => { bc += y.interest; baseCum.push(bc); });
    plan.years.forEach((y) => { pc += y.interest; planCum.push(pc); });

    const data: Array<{ label: string; "Standard EMI": number; "Extra Payment": number }> = [{
      label: "Start",
      "Standard EMI": view === "balance" ? params.principal : 0,
      "Extra Payment": view === "balance" ? params.principal : 0,
    }];
    for (let i = 0; i < maxYears; i++) {
      data.push({
        label: `Year ${i + 1}`,
        "Standard EMI": view === "balance"
          ? (baseline.years[i]?.closing ?? 0)
          : (baseCum[i] ?? baseCum[baseCum.length - 1] ?? 0),
        "Extra Payment": view === "balance"
          ? (plan.years[i]?.closing ?? 0)
          : (planCum[i] ?? planCum[planCum.length - 1] ?? 0),
      });
    }
    return data;
  }, [baseline, plan, view, params.principal]);

  const pieStandard = [
    { name: "मूलधन", value: params.principal, color: "#1d5c42" },
    { name: "कुल ब्याज", value: baseline.totalInterest, color: "#f59e0b" },
  ];
  const pieAccelerated = [
    { name: "मूलधन", value: plan.totalPrincipalBorrowed, color: "#1d5c42" },
    { name: "कुल ब्याज", value: plan.totalInterest, color: "#34d399" },
    ...(interestSaved > 0 ? [{ name: "बचत", value: interestSaved, color: "#e5e7eb" }] : []),
  ];

  const applyStrategy = (extraEMI: number, yearlyLump: number) => {
    setParams((p) => ({ ...p, extraEMI: Math.round(extraEMI) }));
    if (yearlyLump > 0) {
      const totalYears = Math.ceil(params.tenureMonths / 12);
      const next: Record<number, number> = {};
      for (let y = 1; y <= totalYears; y++) next[y] = Math.round(yearlyLump);
      setYearLumps(next);
    } else {
      setYearLumps({});
    }
  };

  const resetAll = () => {
    setParams({ principal: 2500000, rate: 8.5, tenureMonths: 240, startMonth: new Date().toISOString().slice(0, 7), extraEMI: 0 });
    setTopUp({ amount: 0, rate: 9, month: 12 });
    setYearLumps({});
    setProfileName("");
  };

  const exportMeta = {
    borrowerName: profileName,
    principal: params.principal,
    rate: params.rate,
    tenureMonths: params.tenureMonths,
    extraEMI: params.extraEMI,
    topUp: topUpInput,
  };

  const handlePDF = async () => {
    setExporting(true);
    try {
      await exportPlannerPDF(exportMeta, baseline, plan);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Loan Payoff Planner</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            File upload करके data extract करें, edit करें, और amortization schedule देखें
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => exportPlannerCSV(exportMeta, baseline, plan)}
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button
            size="sm"
            className="gap-2 text-xs"
            onClick={handlePDF}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            PDF Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Panel: Inputs ── */}
        <div className="space-y-5">
          {/* File upload + review */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                File से Import करें
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <FileUploadZone onExtracted={handleExtracted} />
              {draft && (
                <ExtractedReview
                  draft={draft}
                  onChange={setDraft}
                  onApply={applyDraft}
                  onDiscard={() => setDraft(null)}
                />
              )}
            </CardContent>
          </Card>

          {/* Loan parameters */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Loan Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              {/* Profile name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Profile Name</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Home Loan — SBI"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              {/* Principal */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium">Loan Amount (₹)</Label>
                  <Input
                    className="w-32 h-7 text-xs text-right"
                    type="number"
                    value={params.principal}
                    onChange={(e) => set("principal", Math.max(1000, Number(e.target.value)))}
                  />
                </div>
                <Slider
                  min={100000}
                  max={10000000}
                  step={50000}
                  value={[params.principal]}
                  onValueChange={([v]) => set("principal", v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹1L</span><span>₹1Cr</span>
                </div>
              </div>

              {/* Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium">Interest Rate (% p.a.)</Label>
                  <Input
                    className="w-20 h-7 text-xs text-right"
                    type="number"
                    step="0.1"
                    value={params.rate}
                    onChange={(e) => set("rate", Math.max(0, Math.min(50, Number(e.target.value))))}
                  />
                </div>
                <Slider
                  min={1}
                  max={30}
                  step={0.1}
                  value={[params.rate]}
                  onValueChange={([v]) => set("rate", v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span><span>30%</span>
                </div>
              </div>

              {/* Tenure */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium">Tenure</Label>
                  <span className="text-xs font-semibold text-primary">{tenureYears} Years</span>
                </div>
                <Slider
                  min={12}
                  max={360}
                  step={12}
                  value={[params.tenureMonths]}
                  onValueChange={([v]) => set("tenureMonths", v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 Yr</span><span>30 Yrs</span>
                </div>
              </div>

              {/* EMI start month */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">EMI Start Month</Label>
                <Input
                  className="h-8 text-xs"
                  type="month"
                  value={params.startMonth}
                  onChange={(e) => set("startMonth", e.target.value)}
                />
              </div>

              {/* Extra EMI */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-emerald-700">
                    Extra Monthly Payment (₹)
                  </Label>
                  <Input
                    className="w-28 h-7 text-xs text-right border-emerald-300 focus:border-emerald-500"
                    type="number"
                    min={0}
                    value={params.extraEMI}
                    onChange={(e) => set("extraEMI", Math.max(0, Number(e.target.value)))}
                  />
                </div>
                <Slider
                  min={0}
                  max={Math.max(1000, Math.round(plan.baseEMI))}
                  step={500}
                  value={[params.extraEMI]}
                  onValueChange={([v]) => set("extraEMI", v)}
                  className="[&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-emerald-500"
                />
                <p className="text-xs text-muted-foreground">
                  Base EMI: <span className="font-medium text-foreground">{formatRupees(plan.baseEMI)}</span>/month
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={resetAll}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </CardContent>
          </Card>

          {/* Top-up loan */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Top-Up Loan (optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Amount (₹)</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    min={0}
                    value={topUp.amount}
                    onChange={(e) => setTopUp((t) => ({ ...t, amount: Math.max(0, Number(e.target.value)) }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rate (%)</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    step="0.1"
                    value={topUp.rate}
                    onChange={(e) => setTopUp((t) => ({ ...t, rate: Math.max(0, Number(e.target.value)) }))}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Disbursed after (months from start)</Label>
                  <Input
                    className="h-8 text-xs"
                    type="number"
                    min={1}
                    max={params.tenureMonths}
                    value={topUp.month}
                    onChange={(e) => setTopUp((t) => ({ ...t, month: Math.max(1, Number(e.target.value)) }))}
                  />
                </div>
              </div>
              {topUp.amount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Month {topUp.month} पर ₹{topUp.amount.toLocaleString("en-IN")} जुड़ेगा — EMI recalculate होगी।
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reverse calculator */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                Reverse Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium">Target payoff in</Label>
                  <span className="text-xs font-semibold text-primary">{targetYears} Years</span>
                </div>
                <Slider
                  min={1}
                  max={Math.max(1, Math.round(params.tenureMonths / 12))}
                  step={1}
                  value={[targetYears]}
                  onValueChange={([v]) => setTargetYears(v)}
                />
              </div>
              <div className="rounded-lg bg-slate-50 border border-border p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Required monthly payment</span>
                  <span className="font-semibold">{formatRupees(reverse.requiredPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra over base EMI</span>
                  <span className="font-semibold text-emerald-700">+{formatRupees(reverse.requiredExtra)}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2 text-xs"
                onClick={() => set("extraEMI", Math.round(reverse.requiredExtra))}
              >
                <Zap className="h-3.5 w-3.5" />
                Apply to Calculator
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Panel: Charts & Results ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className={`shadow-sm ${interestSaved > 0 ? "border-amber-200 bg-amber-50" : "border-border"}`}>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-amber-700 font-medium">Net Interest Saved</p>
                <p className={`text-base font-bold mt-1 ${interestSaved > 0 ? "text-amber-800" : "text-muted-foreground"}`}>
                  {interestSaved > 0 ? formatRupees(interestSaved) : "₹0"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-emerald-700 font-medium">Accelerated Payoff</p>
                <p className="text-base font-bold mt-1 text-emerald-800">{monthsToStr(plan.payoffMonths)}</p>
                <p className="text-xs text-emerald-700">{monthsSaved > 0 ? `${monthsSaved} महीने जल्दी` : "Same tenure"}</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">Net Principal</p>
                <p className="text-base font-bold mt-1">{formatRupees(plan.totalPrincipalBorrowed)}</p>
                <p className="text-xs text-muted-foreground">{topUpInput ? "incl. top-up" : "borrowed"}</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">Monthly Installment</p>
                <p className="text-base font-bold mt-1">{formatRupees(totalMonthly)}</p>
                <p className="text-xs text-muted-foreground">EMI {formatRupees(plan.baseEMI)} + {formatRupees(params.extraEMI)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Savings banner */}
          {interestSaved > 0 && (
            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
              <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-emerald-800">
                  {formatRupees(interestSaved)} बचेगा — loan {monthsSaved} महीने पहले खत्म होगा!
                </p>
                <p className="text-xs text-emerald-700">
                  कुल {formatRupees(totalMonthly)}/month देकर
                </p>
              </div>
              <TrendingDown className="h-6 w-6 text-emerald-600 shrink-0" />
            </div>
          )}

          {/* Area chart */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-bold">Old vs New Payment Schedule</CardTitle>
                <div className="flex rounded-md border border-border overflow-hidden">
                  <button
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "balance" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    onClick={() => setView("balance")}
                  >
                    Balance Runoff
                  </button>
                  <button
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "interest" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    onClick={() => setView("interest")}
                  >
                    Interest Paid
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {view === "balance"
                  ? "Remaining principal — accelerated plan में जल्दी zero होता है"
                  : "Cumulative interest paid — standard vs accelerated"}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradStd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d5c42" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1d5c42" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="Standard EMI"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fill="url(#gradStd)"
                    strokeDasharray="5 5"
                  />
                  <Area
                    type="monotone"
                    dataKey="Extra Payment"
                    stroke="#1d5c42"
                    strokeWidth={2.5}
                    fill="url(#gradAcc)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Editable amortization ledger */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Detailed Amortization & Repayment Ledger
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setLedgerOpen((o) => !o)}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${ledgerOpen ? "rotate-180" : ""}`} />
                  {ledgerOpen ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                किसी भी साल का "Extra Prepaid" edit करें — schedule तुरंत recalculate होगा।
              </p>
            </CardHeader>
            {ledgerOpen && (
              <CardContent className="pt-0 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-primary/5">
                      {["Year", "Opening Balance", "EMI Paid", "Extra Prepaid (edit)", "Interest", "Principal", "Closing Balance"].map((h) => (
                        <th key={h} className="px-2 py-2 text-right font-semibold border-b border-border whitespace-nowrap first:text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plan.years.map((y) => (
                      <tr key={y.year} className="hover:bg-muted/30">
                        <td className="px-2 py-1.5 text-left font-medium border-b border-border/50">Year {y.year}</td>
                        <td className="px-2 py-1.5 text-right border-b border-border/50">{formatRupees(y.opening)}</td>
                        <td className="px-2 py-1.5 text-right border-b border-border/50">{formatRupees(y.emiPaid)}</td>
                        <td className="px-2 py-1.5 text-right border-b border-border/50">
                          <Input
                            className="h-7 w-28 ml-auto text-xs text-right border-emerald-200"
                            type="number"
                            min={0}
                            placeholder="0"
                            value={yearLumps[y.year] ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setYearLumps((prev) => {
                                const next = { ...prev };
                                if (!v || Number(v) <= 0) delete next[y.year];
                                else next[y.year] = Number(v);
                                return next;
                              });
                            }}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right text-amber-700 border-b border-border/50">{formatRupees(y.interest)}</td>
                        <td className="px-2 py-1.5 text-right text-primary border-b border-border/50">{formatRupees(y.principal)}</td>
                        <td className="px-2 py-1.5 text-right font-medium border-b border-border/50">{formatRupees(y.closing)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/40 font-semibold">
                      <td className="px-2 py-2 text-left">Total</td>
                      <td className="px-2 py-2 text-right">—</td>
                      <td className="px-2 py-2 text-right">{formatRupees(plan.years.reduce((s, y) => s + y.emiPaid, 0))}</td>
                      <td className="px-2 py-2 text-right">{formatRupees(plan.years.reduce((s, y) => s + y.extraPaid, 0))}</td>
                      <td className="px-2 py-2 text-right text-amber-700">{formatRupees(plan.totalInterest)}</td>
                      <td className="px-2 py-2 text-right text-primary">{formatRupees(plan.totalPrincipalBorrowed)}</td>
                      <td className="px-2 py-2 text-right">₹0</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            )}
          </Card>

          {/* Smart payoff strategies */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Smart Payoff Leverage Strategies
              </CardTitle>
              <p className="text-xs text-muted-foreground">एक click में calculator पर apply करें</p>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STRATEGY_PRESETS.map((s) => {
                const res = s.compute(plan.baseEMI, params.principal);
                return (
                  <div key={s.id} className="rounded-xl border border-border p-3 flex flex-col gap-2 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-sm">{s.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex-1">{s.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {res.extraEMI > 0 && `+${formatRupees(res.extraEMI)}/mo`}
                        {res.extraEMI > 0 && res.yearlyLump > 0 && " · "}
                        {res.yearlyLump > 0 && `${formatRupees(res.yearlyLump)}/yr`}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => applyStrategy(res.extraEMI, res.yearlyLump)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Pie charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Traditional Bank Contract
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieStandard.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">{formatRupees(params.principal + baseline.totalInterest)}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Accelerated Prepayout
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieAccelerated.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-muted-foreground">
                  Total: <span className="font-semibold text-emerald-700">{formatRupees(plan.totalPaid)}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="flex gap-3 flex-wrap">
            <Link href="/loans/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Loan Add करें
              </Button>
            </Link>
            <Link href="/loans">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                All Loans देखें
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
