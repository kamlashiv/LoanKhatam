import { useState, useRef, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
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
  PiggyBank, Coins, CalendarRange, Scale, ArrowUpRight, CheckCircle,
  TrendingUp, Award, Flame, Info, Search, Table as TableIcon, EyeOff,
  FileSpreadsheet, FileCode,
} from "lucide-react";
import { formatRupees } from "@/lib/loan-utils";
import {
  simulatePlan, reverseFromTargetMonths, STRATEGY_PRESETS,
  type PlannerResult,
} from "@/lib/planner-engine";
import { exportPlannerCSV, exportPlannerPDF } from "@/lib/export";
import { extractFromFile, type ExtractedData } from "@/lib/file-extract";

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

function payoffDate(startMonth: string, months: number) {
  const [y, m] = startMonth.split("-").map(Number);
  if (!y || !m || months <= 0) return "—";
  const d = new Date(y, m - 1 + (months - 1), 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function monthLabel(startMonth: string, m: number) {
  const [y, mo] = startMonth.split("-").map(Number);
  if (!y || !mo) return `Month ${m}`;
  const d = new Date(y, mo - 1 + (m - 1), 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function savedTimeLabel(months: number) {
  const y = Math.floor(months / 12);
  const mo = months % 12;
  if (y > 0 && mo > 0) return `${y} Yr(s), ${mo} Mo(s)`;
  if (y > 0) return `${y} Yr(s)`;
  if (mo > 0) return `${mo} Mo(s)`;
  return "0 Months";
}

function compactRupees(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

// ─── File upload component ───────────────────────────────────────────────────
function FileUploadZone({
  onExtracted,
}: {
  onExtracted: (data: ExtractedData) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus("loading");
    setErrorMsg("");
    setProgress(null);
    try {
      const data = await extractFromFile(file, (info) => {
        if (info.stage === "ocr" && info.percent != null) setProgress(info.percent);
      });
      setStatus("success");
      onExtracted(data);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Couldn't read the file");
      setStatus("error");
    }
  }, [onExtracted]);

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
          ? "border-indigo-500 bg-indigo-50"
          : status === "success"
          ? "border-emerald-400 bg-emerald-50"
          : status === "error"
          ? "border-red-400 bg-red-50"
          : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
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
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-indigo-600">
            {progress != null ? `Reading file… ${progress}%` : "Reading file…"}
          </p>
          <p className="text-xs text-slate-500">{fileName}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-800">Data extracted — review &amp; edit below</p>
          <p className="text-xs text-slate-500">{fileName}</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-semibold text-red-700">Something went wrong</p>
          <p className="text-xs text-red-600">{errorMsg}</p>
        </div>
      )}

      {status === "idle" && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Upload className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">Upload or drag a file</p>
            <p className="text-xs text-slate-500 mt-1">
              PNG • JPG • PDF • JSON • CSV — data fills in automatically
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
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm flex items-center gap-1.5">
          <Pencil className="h-3.5 w-3.5 text-indigo-600" />
          Extracted Data — Edit
        </span>
        <Badge className={`${confidenceColor[draft.confidence]} border text-xs`}>
          Confidence: {draft.confidence}
        </Badge>
      </div>
      {draft.notes && (
        <p className="text-xs text-slate-500 italic">{draft.notes}</p>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="extracted-borrower-name" className="text-xs">Borrower / Profile Name</Label>
          <Input
            id="extracted-borrower-name"
            className="h-8 text-xs"
            value={draft.borrowerName ?? ""}
            onChange={(e) => set("borrowerName", e.target.value || null)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="extracted-principal" className="text-xs">Loan Amount (₹)</Label>
          <Input
            id="extracted-principal"
            className="h-8 text-xs"
            type="number"
            value={draft.principalAmount ?? ""}
            onChange={(e) => set("principalAmount", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="extracted-interest-rate" className="text-xs">Interest Rate (%)</Label>
          <Input
            id="extracted-interest-rate"
            className="h-8 text-xs"
            type="number"
            step="0.1"
            value={draft.interestRate ?? ""}
            onChange={(e) => set("interestRate", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="extracted-start-date" className="text-xs">Start Date</Label>
          <Input
            id="extracted-start-date"
            className="h-8 text-xs"
            type="date"
            value={draft.startDate ?? ""}
            onChange={(e) => set("startDate", e.target.value || null)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="extracted-due-date" className="text-xs">Due Date</Label>
          <Input
            id="extracted-due-date"
            className="h-8 text-xs"
            type="date"
            value={draft.dueDate ?? ""}
            onChange={(e) => set("dueDate", e.target.value || null)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={onApply}>
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

// ─── Chart tooltip (RinMukti dark style) ─────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-lg shadow-md px-3 py-2.5 text-xs">
      <p className="font-semibold mb-1 text-slate-300">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-black">{formatRupees(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Visual config for the 4 strategy cards (RinMukti palette).
const STRAT_VISUAL = [
  { icon: TrendingUp, card: "from-blue-50 to-indigo-100 border-blue-200", iconColor: "text-blue-600" },
  { icon: Award, card: "from-emerald-50 to-teal-100 border-emerald-200", iconColor: "text-emerald-600" },
  { icon: PiggyBank, card: "from-amber-50 to-orange-100 border-amber-200", iconColor: "text-amber-600" },
  { icon: Flame, card: "from-rose-50 to-pink-100 border-rose-200", iconColor: "text-rose-600" },
];

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
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [draft, setDraft] = useState<ExtractedData | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);

  // Amortization table state
  const [tableExpanded, setTableExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
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
    setActiveStrategy(null);
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

  // Baseline keeps the same loan context (incl. top-up) but no acceleration,
  // so deltas isolate the prepayment effect rather than loan-definition changes.
  const baseline: PlannerResult = useMemo(
    () => simulatePlan({
      principal: params.principal,
      rate: params.rate,
      tenureMonths: params.tenureMonths,
      extraEMI: 0,
      topUp: topUpInput,
    }),
    [params.principal, params.rate, params.tenureMonths, topUpInput]
  );

  const interestSaved = Math.max(0, baseline.totalInterest - plan.totalInterest);
  const monthsSaved = Math.max(0, baseline.payoffMonths - plan.payoffMonths);
  const tenureYears = Math.round(params.tenureMonths / 12 * 10) / 10;
  const interestSavingPct = baseline.totalInterest > 0 ? (interestSaved / baseline.totalInterest) * 100 : 0;
  const timeSavingPct = baseline.payoffMonths > 0 ? (monthsSaved / baseline.payoffMonths) * 100 : 0;
  // Actual borrowed principal from the engine (top-up only counts once disbursed).
  const netPrincipal = plan.totalPrincipalBorrowed;
  const disbursedTopUp = Math.max(0, plan.totalPrincipalBorrowed - params.principal);

  const reverse = useMemo(
    () => reverseFromTargetMonths(params.principal, params.rate, plan.baseEMI, targetYears * 12),
    [params.principal, params.rate, plan.baseEMI, targetYears]
  );

  // Balance-over-time chart (yearly closing balances).
  const balanceData = useMemo(() => {
    const maxYears = Math.max(baseline.years.length, plan.years.length);
    const data: Array<{ year: string; "Standard Balance": number; "Accelerated Balance": number }> = [{
      year: "Start",
      "Standard Balance": Math.round(params.principal),
      "Accelerated Balance": Math.round(params.principal),
    }];
    for (let i = 0; i < maxYears; i++) {
      data.push({
        year: `Year ${i + 1}`,
        "Standard Balance": Math.round(baseline.years[i]?.closing ?? 0),
        "Accelerated Balance": Math.round(plan.years[i]?.closing ?? 0),
      });
    }
    return data;
  }, [baseline, plan, params.principal]);

  const costData = useMemo(() => [
    {
      name: "Standard Path",
      Principal: Math.round(params.principal),
      Interest: Math.round(baseline.totalInterest),
    },
    {
      name: "Savings Plan",
      Principal: Math.round(plan.totalPrincipalBorrowed),
      Interest: Math.round(plan.totalInterest),
    },
  ], [params.principal, baseline.totalInterest, plan.totalPrincipalBorrowed, plan.totalInterest]);

  const pieStandard = [
    { name: "Principal", value: params.principal, color: "#6366f1" },
    { name: "Total Interest", value: baseline.totalInterest, color: "#f59e0b" },
  ];
  const pieAccelerated = [
    { name: "Principal", value: plan.totalPrincipalBorrowed, color: "#6366f1" },
    { name: "Total Interest", value: plan.totalInterest, color: "#10b981" },
    ...(interestSaved > 0 ? [{ name: "Interest Saved", value: interestSaved, color: "#e5e7eb" }] : []),
  ];

  // Strategy cards: compute each strategy's savings via the engine.
  const strategyCards = useMemo(() => {
    const totalYears = Math.ceil(params.tenureMonths / 12);
    return STRATEGY_PRESETS.map((s, i) => {
      const res = s.compute(plan.baseEMI, params.principal);
      const lumps: Record<number, number> = {};
      if (res.yearlyLump > 0) for (let y = 1; y <= totalYears; y++) lumps[y * 12] = Math.round(res.yearlyLump);
      const sim = simulatePlan({
        principal: params.principal,
        rate: params.rate,
        tenureMonths: params.tenureMonths,
        extraEMI: Math.round(res.extraEMI),
        lumpPrepayments: lumps,
        topUp: topUpInput,
      });
      const saved = Math.max(0, baseline.totalInterest - sim.totalInterest);
      const mSaved = Math.max(0, baseline.payoffMonths - sim.payoffMonths);
      return { ...s, res, saved, mSaved, ...STRAT_VISUAL[i % STRAT_VISUAL.length] };
    });
  }, [plan.baseEMI, params.principal, params.rate, params.tenureMonths, topUpInput, baseline]);

  const applyStrategy = (id: string, extraEMI: number, yearlyLump: number) => {
    setActiveStrategy(id);
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
    setActiveStrategy(null);
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

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ meta: exportMeta, baseline, plan }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loan-planner-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // Monthly rows filtered by search.
  const monthlyRows = useMemo(() => {
    const term = search.toLowerCase().trim();
    return plan.months
      .map((m) => ({ ...m, label: monthLabel(params.startMonth, m.month) }))
      .filter((m) =>
        !term ||
        m.label.toLowerCase().includes(term) ||
        `month ${m.month}`.includes(term) ||
        String(m.month).includes(term)
      );
  }, [plan.months, params.startMonth, search]);

  const yearlyRows = useMemo(() => {
    const term = search.toLowerCase().trim();
    return plan.years.filter((y) =>
      !term || `year ${y.year}`.includes(term) || String(y.year).includes(term)
    );
  }, [plan.years, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="font-black tracking-tight text-[30px] text-left">SMART Strategy</h1>
          </div>
          <p className="text-slate-500 ml-12 text-[16px]">
            Plan prepayments, compare strategies, and see exactly how much interest and time you save
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
            Export CSV
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Panel: Inputs ── */}
        <div className="space-y-5">
          {/* File upload + review */}
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Import from File
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
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                Loan Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              {/* Profile name */}
              <div className="space-y-1.5">
                <Label htmlFor="planner-profile-name" className="text-xs font-medium">Profile Name</Label>
                <Input
                  id="planner-profile-name"
                  className="h-8 text-xs"
                  placeholder="e.g. Home Loan — SBI"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              {/* Principal */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="planner-principal" className="text-xs font-medium">Loan Amount (₹)</Label>
                  <Input
                    id="planner-principal"
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
                  className="w-full [&_[role=slider]]:border-indigo-500 [&_[role=slider]]:bg-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>₹1L</span><span>₹1Cr</span>
                </div>
              </div>

              {/* Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="planner-rate" className="text-xs font-medium">Interest Rate (% p.a.)</Label>
                  <Input
                    id="planner-rate"
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
                  className="[&_[role=slider]]:border-indigo-500 [&_[role=slider]]:bg-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1%</span><span>30%</span>
                </div>
              </div>

              {/* Tenure */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label id="planner-tenure-label" className="text-xs font-medium">Tenure</Label>
                  <span className="text-xs font-semibold text-indigo-600">{tenureYears} Years</span>
                </div>
                <Slider
                  min={12}
                  max={360}
                  step={12}
                  value={[params.tenureMonths]}
                  onValueChange={([v]) => set("tenureMonths", v)}
                  aria-labelledby="planner-tenure-label"
                  className="[&_[role=slider]]:border-indigo-500 [&_[role=slider]]:bg-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1 Yr</span><span>30 Yrs</span>
                </div>
              </div>

              {/* EMI start month */}
              <div className="space-y-1.5">
                <Label htmlFor="planner-start-month" className="text-xs font-medium">EMI Start Month</Label>
                <Input
                  id="planner-start-month"
                  className="h-8 text-xs"
                  type="month"
                  value={params.startMonth}
                  onChange={(e) => set("startMonth", e.target.value)}
                />
              </div>

              {/* Extra EMI */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="planner-extra-emi" className="text-xs font-medium text-emerald-700">
                    Extra Monthly Payment (₹)
                  </Label>
                  <Input
                    id="planner-extra-emi"
                    className="w-28 h-7 text-xs text-right border-emerald-300 focus:border-emerald-500"
                    type="number"
                    min={0}
                    value={params.extraEMI}
                    onChange={(e) => { setActiveStrategy(null); set("extraEMI", Math.max(0, Number(e.target.value))); }}
                  />
                </div>
                <Slider
                  min={0}
                  max={Math.max(1000, Math.round(plan.baseEMI))}
                  step={500}
                  value={[params.extraEMI]}
                  onValueChange={([v]) => { setActiveStrategy(null); set("extraEMI", v); }}
                  className="[&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-emerald-500"
                />
                <p className="text-xs text-slate-500">
                  Base EMI: <span className="font-medium text-slate-900">{formatRupees(plan.baseEMI)}</span>/month
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
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" />
                Top-Up Loan (optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label htmlFor="topup-amount" className="text-xs">Amount (₹)</Label>
                  <Input
                    id="topup-amount"
                    className="h-8 text-xs"
                    type="number"
                    min={0}
                    value={topUp.amount}
                    onChange={(e) => setTopUp((t) => ({ ...t, amount: Math.max(0, Number(e.target.value)) }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="topup-rate" className="text-xs">Rate (%)</Label>
                  <Input
                    id="topup-rate"
                    className="h-8 text-xs"
                    type="number"
                    step="0.1"
                    value={topUp.rate}
                    onChange={(e) => setTopUp((t) => ({ ...t, rate: Math.max(0, Number(e.target.value)) }))}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="topup-month" className="text-xs">Disbursed after (months from start)</Label>
                  <Input
                    id="topup-month"
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
                <p className="text-xs text-slate-500">
                  ₹{topUp.amount.toLocaleString("en-IN")} will be added in month {topUp.month} — the EMI will be recalculated.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reverse calculator */}
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calculator className="h-4 w-4 text-indigo-600" />
                Reverse Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label id="planner-target-payoff-label" className="text-xs font-medium">Target payoff in</Label>
                  <span className="text-xs font-semibold text-indigo-600">{targetYears} Years</span>
                </div>
                <Slider
                  min={1}
                  max={Math.max(1, Math.round(params.tenureMonths / 12))}
                  step={1}
                  value={[targetYears]}
                  onValueChange={([v]) => setTargetYears(v)}
                  aria-labelledby="planner-target-payoff-label"
                  className="[&_[role=slider]]:border-indigo-500 [&_[role=slider]]:bg-indigo-500"
                />
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Required monthly payment</span>
                  <span className="font-semibold">{formatRupees(reverse.requiredPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Extra over base EMI</span>
                  <span className="font-semibold text-emerald-700">+{formatRupees(reverse.requiredExtra)}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2 text-xs"
                onClick={() => { setActiveStrategy(null); set("extraEMI", Math.round(reverse.requiredExtra)); }}
              >
                <Zap className="h-3.5 w-3.5" />
                Apply to Calculator
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Panel: Results ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Print-ready PDF report bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Print-Ready Client PDF Report</p>
                <p className="text-[11px] text-slate-500">Includes payoff roadmap and comparative graphs</p>
              </div>
            </div>
            <Button
              size="sm"
              className="gap-2 bg-indigo-600 hover:bg-slate-900 text-white shrink-0 w-full sm:w-auto"
              onClick={handlePDF}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download PDF Summary
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total interest saved */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-md">
              <PiggyBank className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-36 w-36 text-white opacity-10" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <PiggyBank className="h-4 w-4 text-emerald-100" /> Total Net Interest Saved
                </div>
                <p className="mt-4 text-sm font-medium text-emerald-100">Your Net Cash Interest Savings:</p>
                <h3 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {interestSaved > 0 ? `₹${Math.round(interestSaved).toLocaleString("en-IN")}` : "₹0"}
                </h3>
                {interestSaved > 0 ? (
                  <p className="mt-1 text-xs text-emerald-50 font-medium flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1 shrink-0" />
                    Slashed total compounding interest by {interestSavingPct.toFixed(1)}%!
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-emerald-100 opacity-90">
                    Add prepayment parameters to simulate high compound interest savings here
                  </p>
                )}
                <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block opacity-75">Standard Cost:</span>
                    <span className="font-semibold text-[13px]">₹{Math.round(baseline.totalInterest).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="block opacity-75">Savings Plan Cost:</span>
                    <span className="font-semibold text-[13px]">₹{Math.round(plan.totalInterest).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tenure saved */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-6 text-white shadow-md">
              <CalendarRange className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-36 w-36 text-white opacity-10" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <CalendarRange className="h-4 w-4 text-indigo-100" /> Accelerated Payoff Timeline
                </div>
                <p className="mt-4 text-sm font-medium text-indigo-100">Saves Time &amp; Slashes Years:</p>
                <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                  {monthsSaved > 0 ? savedTimeLabel(monthsSaved) : "0 Months"}
                </h3>
                {monthsSaved > 0 ? (
                  <p className="mt-1 text-xs text-indigo-50 font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 shrink-0" />
                    Your loan timeline is reduced by {timeSavingPct.toFixed(1)}%!
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-indigo-100 opacity-90">Repaying on time as scheduled</p>
                )}
                <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block opacity-75">Standard payoff date:</span>
                    <span className="font-semibold text-[13px]">{payoffDate(params.startMonth, baseline.payoffMonths)}</span>
                  </div>
                  <div>
                    <span className="block opacity-75">Savings plan date:</span>
                    <span className="font-semibold text-[13px]">{payoffDate(params.startMonth, plan.payoffMonths)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net principal */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 p-6 text-white shadow-md">
              <Coins className="absolute right-0 top-0 translate-x-4 -translate-y-4 h-36 w-36 text-white opacity-10" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  <Coins className="h-4 w-4 text-rose-100" /> Net Principal (Total)
                </div>
                <p className="mt-4 text-sm font-medium text-rose-100">Total actual loan amount borrowed</p>
                <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
                  ₹{Math.round(netPrincipal).toLocaleString("en-IN")}
                </h3>
                <div className="mt-5 pt-4 border-t border-white/20 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-75">Base Principal</span>
                    <span className="font-semibold text-[13px]">₹{Math.round(params.principal).toLocaleString("en-IN")}</span>
                  </div>
                  {disbursedTopUp > 0 ? (
                    <div className="flex justify-between text-amber-100 font-bold">
                      <span className="opacity-90">Top-Up Loan</span>
                      <span className="text-[13px]">+ ₹{Math.round(disbursedTopUp).toLocaleString("en-IN")}</span>
                    </div>
                  ) : topUpInput ? (
                    <div className="flex justify-between text-rose-100">
                      <span className="opacity-75">Top-Up Loan</span>
                      <span className="italic text-[11px] opacity-85">Paid off before disbursal</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-rose-100">
                      <span className="opacity-75">Top-Up Loan</span>
                      <span className="italic text-[11px] opacity-85">No Active Top-up</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comparison / EMI breakdown */}
            <div className="rounded-2xl bg-card p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Scale className="h-4 w-4 text-indigo-500" /> Monthly Installment Breakdown
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Base Monthly EMI:</span>
                    <span className="font-bold text-slate-800 text-[15px]">{formatRupees(plan.baseEMI)}</span>
                  </div>
                  {params.extraEMI > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Monthly Extra Prepayment:</span>
                      <span className="font-bold text-emerald-600 text-[14px]">+ {formatRupees(params.extraEMI)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Paid (Standard Path):</span>
                    <span className="font-semibold text-slate-700">{formatRupees(baseline.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Paid (Savings Plan Path):</span>
                    <span className="font-bold text-emerald-600">{formatRupees(plan.totalPaid)}</span>
                  </div>
                </div>
              </div>
              {interestSaved > 0 && (
                <div className="mt-4 relative inline-block group/tip w-fit">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50/60 px-3 py-1.5 rounded-lg border border-emerald-100 text-[10px] font-bold cursor-help select-none">
                    <AlertCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[9px] font-black uppercase text-emerald-700">Bonus Insight</span>
                    <span className="text-emerald-500 font-bold">&#9662;</span>
                  </div>
                  <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-emerald-950 text-emerald-100 rounded-xl shadow-2xl text-[10.5px] leading-relaxed font-semibold transition-all duration-200 opacity-0 pointer-events-none scale-95 translate-y-1 group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:translate-y-0 z-50">
                    <div className="font-extrabold text-[8.5px] uppercase text-emerald-300 mb-1 tracking-wider">Wealth Integration Fact</div>
                    <p>Redeemed cash can buy a brand new vehicle or fund your family&apos;s future!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Educational hacks / strategies */}
          <div className="rounded-2xl bg-card p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Smart Payoff Leverage Strategies</h2>
                <p className="text-sm text-slate-500">Select any strategy below to instantly load it into the prepayment dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {strategyCards.map((strat) => {
                const Icon = strat.icon;
                const isActive = activeStrategy === strat.id;
                return (
                  <div
                    key={strat.id}
                    className={`flex flex-col justify-between p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 ${strat.card} ${
                      isActive ? "ring-2 ring-indigo-500 ring-offset-2 scale-[1.01]" : "hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-xl bg-white shadow-sm ${strat.iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <h3 className="font-semibold text-slate-800 text-sm sm:text-base leading-tight">{strat.title}</h3>
                        </div>
                        {isActive && (
                          <span className="flex items-center text-xs font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">{strat.description}</p>
                      <div className="space-y-1.5 p-3 rounded-xl bg-white/70 border border-white/50 mb-4">
                        <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {strat.saved > 0
                            ? `Saves ${formatRupees(strat.saved)} & ${savedTimeLabel(strat.mSaved)}`
                            : "Loads this plan into the calculator"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {strat.res.extraEMI > 0 && `+${formatRupees(strat.res.extraEMI)}/mo`}
                          {strat.res.extraEMI > 0 && strat.res.yearlyLump > 0 && " · "}
                          {strat.res.yearlyLump > 0 && `${formatRupees(strat.res.yearlyLump)}/yr`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => applyStrategy(strat.id, strat.res.extraEMI, strat.res.yearlyLump)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                        isActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-800 hover:bg-slate-900 text-white"
                      }`}
                    >
                      {isActive ? "Strategy Active!" : "Apply to Calculator"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs sm:text-sm text-slate-600">
              <h4 className="font-semibold text-indigo-900 mb-1 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> The Prepayment Acceleration Magic
              </h4>
              <p className="leading-relaxed">
                In the early years of a loan, 70–80% of your EMI goes strictly to interest while principal decreases
                slowly. Any extra prepayment directly reduces the core principal — dropping the compound interest
                immediately and slicing years off your loan!
              </p>
            </div>
          </div>

          {/* Comparative charts */}
          <div className="rounded-2xl bg-card p-5 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Comparative Progress Visual Chart</h3>
                <p className="text-xs text-slate-500 mt-0.5">Visualize how your balance decreases faster under the savings plan</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
                <button
                  onClick={() => setChartTab("balance")}
                  className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    chartTab === "balance" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5" /> Balance Over Time
                </button>
                <button
                  onClick={() => setChartTab("costs")}
                  className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    chartTab === "costs" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" /> Total Costs Saved
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAccelerated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={{ stroke: "#e2e8f0" }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={compactRupees} tickLine={{ stroke: "#e2e8f0" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                    <Area name="Standard Balance" type="monotone" dataKey="Standard Balance" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorStandard)" />
                    <Area name="Accelerated Balance" type="monotone" dataKey="Accelerated Balance" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAccelerated)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 550 }} tickLine={{ stroke: "#e2e8f0" }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={compactRupees} tickLine={{ stroke: "#e2e8f0" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar name="Principal Loan Capital" dataKey="Principal" stackId="a" fill="#6366f1" />
                    <Bar name="Total Interest Cost" dataKey="Interest" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl text-xs">
              <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="text-[11px] text-slate-500">
                {chartTab === "balance"
                  ? "The green line is your accelerated payoff — the steeper decline means big savings in tenure."
                  : "The amber bar (interest) shrinks dramatically once smart prepayments are applied."}
              </span>
            </div>
          </div>

          {/* Amortization schedule */}
          <div className="rounded-2xl bg-card shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 pb-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <TableIcon className="h-5 w-5 text-indigo-500" />
                  Detailed Amortization &amp; Repayment Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {viewMode === "yearly"
                    ? "Edit the “Extra Prepaid” amount for any year — the schedule recalculates instantly."
                    : "Month-by-month breakdown of every payment."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                  <button
                    onClick={() => { setViewMode("yearly"); setSearch(""); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      viewMode === "yearly" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => { setViewMode("monthly"); setSearch(""); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      viewMode === "monthly" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                <button
                  onClick={() => setTableExpanded((o) => !o)}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 border border-slate-200/40"
                >
                  {tableExpanded ? <EyeOff className="h-3.5 w-3.5 text-indigo-500" /> : <ChevronDown className="h-3.5 w-3.5 text-indigo-500" />}
                  {tableExpanded ? "Collapse" : "Expand"}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setExportOpen((o) => !o)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Report
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
                  </button>
                  {exportOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-50">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-3 py-1.5">Select format</p>
                        <button
                          onClick={() => { exportPlannerCSV(exportMeta, baseline, plan); setExportOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 cursor-pointer"
                        >
                          <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                          <span className="flex-1">Download Excel/CSV Report</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">.csv</span>
                        </button>
                        <button
                          onClick={() => { handlePDF(); setExportOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 cursor-pointer"
                        >
                          <FileText className="h-4 w-4 text-rose-500" />
                          <span className="flex-1">Download PDF Report</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">.pdf</span>
                        </button>
                        <button
                          onClick={exportJSON}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 cursor-pointer"
                        >
                          <FileCode className="h-4 w-4 text-amber-500" />
                          <span className="flex-1">Download JSON Data</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">.json</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {tableExpanded && (
              <div className="p-5 pt-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4">
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      aria-label={viewMode === "yearly" ? "Search amortization schedule by year" : "Search amortization schedule by month"}
                      placeholder={viewMode === "yearly" ? "Search years (e.g. Year 2)…" : "Search months (e.g. Jul 2028)…"}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 w-full text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {viewMode === "yearly"
                      ? `${plan.years.length} year(s)`
                      : `${plan.months.length} month(s)`}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  {viewMode === "yearly" ? (
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-indigo-50/60">
                          {["Year", "Opening Balance", "EMI Paid", "Extra Prepaid (edit)", "Interest", "Principal", "Closing Balance"].map((h) => (
                            <th key={h} className="px-2 py-2 text-right font-semibold border-b border-slate-200 whitespace-nowrap first:text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyRows.map((y) => (
                          <tr key={y.year} className="hover:bg-slate-50">
                            <td className="px-2 py-1.5 text-left font-medium border-b border-slate-100">Year {y.year}</td>
                            <td className="px-2 py-1.5 text-right border-b border-slate-100">{formatRupees(y.opening)}</td>
                            <td className="px-2 py-1.5 text-right border-b border-slate-100">{formatRupees(y.emiPaid)}</td>
                            <td className="px-2 py-1.5 text-right border-b border-slate-100">
                              <Input
                                className="h-7 w-28 ml-auto text-xs text-right border-emerald-200"
                                type="number"
                                min={0}
                                placeholder="0"
                                aria-label={`Extra prepaid amount for Year ${y.year}`}
                                value={yearLumps[y.year] ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setActiveStrategy(null);
                                  setYearLumps((prev) => {
                                    const next = { ...prev };
                                    if (!v || Number(v) <= 0) delete next[y.year];
                                    else next[y.year] = Number(v);
                                    return next;
                                  });
                                }}
                              />
                            </td>
                            <td className="px-2 py-1.5 text-right text-amber-700 border-b border-slate-100">{formatRupees(y.interest)}</td>
                            <td className="px-2 py-1.5 text-right text-indigo-600 border-b border-slate-100">{formatRupees(y.principal)}</td>
                            <td className="px-2 py-1.5 text-right font-medium border-b border-slate-100">{formatRupees(y.closing)}</td>
                          </tr>
                        ))}
                        {yearlyRows.length === 0 && (
                          <tr><td colSpan={7} className="px-2 py-6 text-center text-slate-400">No matching rows</td></tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-semibold">
                          <td className="px-2 py-2 text-left">Total</td>
                          <td className="px-2 py-2 text-right">—</td>
                          <td className="px-2 py-2 text-right">{formatRupees(plan.years.reduce((s, y) => s + y.emiPaid, 0))}</td>
                          <td className="px-2 py-2 text-right">{formatRupees(plan.years.reduce((s, y) => s + y.extraPaid, 0))}</td>
                          <td className="px-2 py-2 text-right text-amber-700">{formatRupees(plan.totalInterest)}</td>
                          <td className="px-2 py-2 text-right text-indigo-600">{formatRupees(plan.totalPrincipalBorrowed)}</td>
                          <td className="px-2 py-2 text-right">₹0</td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-indigo-50/60">
                          {["Month", "Opening", "EMI", "Extra", "Interest", "Principal", "Closing"].map((h) => (
                            <th key={h} className="px-2 py-2 text-right font-semibold border-b border-slate-200 whitespace-nowrap first:text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyRows.map((m) => (
                          <tr key={m.month} className="hover:bg-slate-50">
                            <td className="px-2 py-1.5 text-left font-medium border-b border-slate-100 whitespace-nowrap">{m.label}</td>
                            <td className="px-2 py-1.5 text-right border-b border-slate-100">{formatRupees(m.opening)}</td>
                            <td className="px-2 py-1.5 text-right border-b border-slate-100">{formatRupees(m.emi)}</td>
                            <td className="px-2 py-1.5 text-right text-emerald-700 border-b border-slate-100">{m.extra > 0 ? formatRupees(m.extra) : "—"}</td>
                            <td className="px-2 py-1.5 text-right text-amber-700 border-b border-slate-100">{formatRupees(m.interest)}</td>
                            <td className="px-2 py-1.5 text-right text-indigo-600 border-b border-slate-100">{formatRupees(m.principal)}</td>
                            <td className="px-2 py-1.5 text-right font-medium border-b border-slate-100">{formatRupees(m.closing)}</td>
                          </tr>
                        ))}
                        {monthlyRows.length === 0 && (
                          <tr><td colSpan={7} className="px-2 py-6 text-center text-slate-400">No matching rows</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pie comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-card border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Traditional Bank Contract</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieStandard.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatRupees(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-slate-500">
                Total: <span className="font-semibold text-slate-800">{formatRupees(params.principal + baseline.totalInterest)}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-card border border-emerald-200 shadow-sm p-5">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Accelerated Prepayout</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieAccelerated.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatRupees(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-slate-500">
                Total: <span className="font-semibold text-emerald-700">{formatRupees(plan.totalPaid)}</span>
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 flex-wrap">
            <Link href="/loans/new">
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                Add Loan
              </Button>
            </Link>
            <Link href="/loans">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                View All Loans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
