import { useState, useRef, useMemo, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Target, Download, Upload, FileText, CheckCircle2, AlertCircle, Loader2,
  TrendingDown, BarChart3, RefreshCw, Plus, Pencil, X, Calculator, Sparkles,
  ChevronDown, PiggyBank, Coins, CalendarRange, TrendingUp,
  Award, Flame, Search, EyeOff, FileSpreadsheet, FileCode, Zap,
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
      className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
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
          <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-indigo-600">
            {progress != null ? `Reading file… ${progress}%` : "Reading file…"}
          </p>
          <p className="text-xs text-slate-500">{fileName}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-800">Data extracted — review &amp; edit below</p>
          <p className="text-xs text-slate-500">{fileName}</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <AlertCircle className="h-7 w-7 text-red-500" />
          <p className="text-sm font-semibold text-red-700">Something went wrong</p>
          <p className="text-xs text-red-600">{errorMsg}</p>
        </div>
      )}

      {status === "idle" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="font-semibold text-sm text-slate-700">Upload or drag a file</p>
          <p className="text-[10px] text-slate-500">PNG • JPG • PDF • JSON • CSV — data fills in automatically</p>
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

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-3">
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
        <Button size="sm" className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={onApply}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Apply to Calculator
        </Button>
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

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
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
      Principal: Math.round(baseline.totalPrincipalBorrowed),
      Interest: Math.round(baseline.totalInterest),
    },
    {
      name: "Savings Plan",
      Principal: Math.round(plan.totalPrincipalBorrowed),
      Interest: Math.round(plan.totalInterest),
    },
  ], [baseline.totalPrincipalBorrowed, baseline.totalInterest, plan.totalPrincipalBorrowed, plan.totalInterest]);

  const pieStandard = [
    { name: "Principal", value: baseline.totalPrincipalBorrowed, color: "#6366f1" },
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

  const targetYearsMax = Math.max(1, Math.round(params.tenureMonths / 12));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Smart Loan Saver</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Plan prepayments, compare strategies, and see exactly how much interest and time you save
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 shrink-0 rounded-xl bg-white"
            onClick={() => exportPlannerCSV(exportMeta, baseline, plan)}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-min font-bold">

          {/* Tile 1: Input Controls */}
          <Card className="md:col-span-4 lg:col-span-3 lg:row-span-2 rounded-3xl shadow-sm border-slate-200 overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" /> Loan Details
              </CardTitle>
              <CardDescription>Configure your loan parameters</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5 flex-1 lg:max-h-[1100px] lg:overflow-y-auto">

              {/* File upload + review */}
              <FileUploadZone onExtracted={handleExtracted} />
              {draft && (
                <ExtractedReview
                  draft={draft}
                  onChange={setDraft}
                  onApply={applyDraft}
                  onDiscard={() => setDraft(null)}
                />
              )}

              {/* Profile name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Profile Name</Label>
                <Input
                  className="h-9 rounded-xl text-sm"
                  placeholder="e.g. Home Loan — SBI"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              {/* Principal */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-600">Loan Amount (₹)</Label>
                  <Input
                    className="w-32 h-7 text-xs text-right rounded-lg"
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
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₹1L</span><span>₹1Cr</span>
                </div>
              </div>

              {/* Rate + Tenure */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Rate (% p.a.)</Label>
                  <Input
                    className="h-9 rounded-xl text-sm"
                    type="number"
                    step="0.1"
                    value={params.rate}
                    onChange={(e) => set("rate", Math.max(0, Math.min(50, Number(e.target.value))))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Tenure (Mo)</Label>
                  <Input
                    className="h-9 rounded-xl text-sm"
                    type="number"
                    value={params.tenureMonths}
                    onChange={(e) => set("tenureMonths", Math.max(1, Math.min(360, Number(e.target.value))))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Slider
                  min={12}
                  max={360}
                  step={12}
                  value={[params.tenureMonths]}
                  onValueChange={([v]) => set("tenureMonths", v)}
                  className="[&_[role=slider]]:border-indigo-500 [&_[role=slider]]:bg-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 Yr</span><span className="font-semibold text-indigo-600">{tenureYears} Yrs</span><span>30 Yrs</span>
                </div>
              </div>

              {/* Start month */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">EMI Start Month</Label>
                <Input
                  className="h-9 rounded-xl text-sm"
                  type="month"
                  value={params.startMonth}
                  onChange={(e) => set("startMonth", e.target.value)}
                />
              </div>

              {/* Extra EMI */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-emerald-600">Extra EMI / month (₹)</Label>
                  <Input
                    className="w-28 h-7 text-xs text-right rounded-lg border-emerald-300 focus:border-emerald-500"
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
                <p className="text-[11px] text-slate-500">
                  Base EMI: <span className="font-medium text-slate-900">{formatRupees(plan.baseEMI)}</span>/month
                </p>
              </div>

              {/* Top-up loan */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-indigo-600" /> Top-Up Loan (optional)
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Amount</Label>
                    <Input
                      className="h-8 text-xs rounded-lg"
                      type="number"
                      min={0}
                      value={topUp.amount}
                      onChange={(e) => setTopUp((t) => ({ ...t, amount: Math.max(0, Number(e.target.value)) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Rate %</Label>
                    <Input
                      className="h-8 text-xs rounded-lg"
                      type="number"
                      step="0.1"
                      value={topUp.rate}
                      onChange={(e) => setTopUp((t) => ({ ...t, rate: Math.max(0, Number(e.target.value)) }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400">Month</Label>
                    <Input
                      className="h-8 text-xs rounded-lg"
                      type="number"
                      min={1}
                      max={params.tenureMonths}
                      value={topUp.month}
                      onChange={(e) => setTopUp((t) => ({ ...t, month: Math.max(1, Number(e.target.value)) }))}
                    />
                  </div>
                </div>
                {topUp.amount > 0 && (
                  <p className="text-[11px] text-slate-500">
                    ₹{topUp.amount.toLocaleString("en-IN")} added in month {topUp.month} — EMI recalculated.
                  </p>
                )}
              </div>

              {/* Reverse calculator */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-indigo-600" /> Reverse Calculator
                </Label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">Target payoff in</span>
                    <span className="text-xs font-semibold text-indigo-600">{targetYears} Years</span>
                  </div>
                  <Slider
                    min={1}
                    max={targetYearsMax}
                    step={1}
                    value={[Math.min(targetYears, targetYearsMax)]}
                    onValueChange={([v]) => setTargetYears(v)}
                    className="[&_[role=slider]]:border-indigo-500 [&_[role=slider]]:bg-indigo-500"
                  />
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
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
                  className="w-full gap-2 text-xs rounded-xl"
                  onClick={() => { setActiveStrategy(null); set("extraEMI", Math.round(reverse.requiredExtra)); }}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Apply to Calculator
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Button variant="ghost" className="w-full text-slate-500 h-9 rounded-xl gap-2" onClick={resetAll}>
                <RefreshCw className="h-3.5 w-3.5" /> Reset All
              </Button>
            </CardFooter>
          </Card>

          {/* Tile 2: Summary Metrics */}
          <div className="md:col-span-4 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min">
            <Card className="rounded-3xl shadow-sm border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-emerald-800 mb-1 flex items-center gap-1.5">
                  <PiggyBank className="h-4 w-4" /> Interest Saved
                </p>
                <p className="text-2xl font-bold text-emerald-600">{compactRupees(interestSaved)}</p>
                <p className="text-xs text-emerald-600/80 mt-1">
                  {interestSaved > 0 ? `≈${interestSavingPct.toFixed(1)}% of standard interest` : "Add prepayments to save"}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-emerald-800 mb-1 flex items-center gap-1.5">
                  <CalendarRange className="h-4 w-4" /> Tenure Saved
                </p>
                <p className="text-2xl font-bold text-emerald-600">{monthsSaved > 0 ? savedTimeLabel(monthsSaved) : "0 Mo"}</p>
                <p className="text-xs text-emerald-600/80 mt-1">
                  {monthsSaved > 0 ? `Reduced by ${timeSavingPct.toFixed(1)}%` : "On schedule"}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-slate-200">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                  <Coins className="h-4 w-4" /> Net Principal
                </p>
                <p className="text-2xl font-bold text-slate-900">{compactRupees(netPrincipal)}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {disbursedTopUp > 0 ? `incl. +${compactRupees(disbursedTopUp)} top-up` : "No active top-up"}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-slate-200">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" /> Monthly EMI
                </p>
                <p className="text-2xl font-bold text-slate-900">{compactRupees(plan.baseEMI)}</p>
                {params.extraEMI > 0 && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">+{compactRupees(params.extraEMI)} extra</p>
                )}
              </CardContent>
            </Card>

            {/* PDF report bar (full width within summary block) */}
            <div className="col-span-2 md:col-span-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 px-5 py-4">
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
                className="gap-2 bg-indigo-600 hover:bg-slate-900 text-white shrink-0 w-full sm:w-auto rounded-xl"
                onClick={handlePDF}
                disabled={exporting}
              >
                {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download PDF Summary
              </Button>
            </div>
          </div>

          {/* Tile 3: Main Chart */}
          <Card className="md:col-span-4 lg:col-span-5 rounded-3xl shadow-sm border-slate-200 flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Projection</CardTitle>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setChartTab("balance")}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${chartTab === "balance" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <TrendingDown className="h-3 w-3" /> Balance
                </button>
                <button
                  onClick={() => setChartTab("costs")}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${chartTab === "costs" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <BarChart3 className="h-3 w-3" /> Costs
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex-1 min-h-[320px] text-[12px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAccelerated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    <Area name="Standard Balance" type="monotone" dataKey="Standard Balance" stroke="#f43f5e" fillOpacity={1} fill="url(#colorStandard)" strokeWidth={2} />
                    <Area name="Accelerated Balance" type="monotone" dataKey="Accelerated Balance" stroke="#10b981" fillOpacity={1} fill="url(#colorAccelerated)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    <Bar name="Principal Loan Capital" dataKey="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                    <Bar name="Total Interest Cost" dataKey="Interest" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tile 4: Strategies Grid */}
          <Card className="md:col-span-4 lg:col-span-4 rounded-3xl shadow-sm border-slate-200 bg-white flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" /> Smart Payoff Leverage Strategies
              </CardTitle>
              <CardDescription className="text-xs">Select any strategy below to instantly load it into the prepayment dashboard</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategyCards.map((strat) => {
                  const Icon = strat.icon;
                  const isActive = activeStrategy === strat.id;
                  return (
                    <div
                      key={strat.id}
                      className={`rounded-2xl p-4 border bg-gradient-to-br ${strat.card} flex flex-col transition-all ${
                        isActive ? "ring-2 ring-indigo-500 ring-offset-1" : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${strat.iconColor}`} />
                        <h4 className="font-semibold text-sm text-slate-900 leading-tight">{strat.title}</h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-snug mb-1 flex-1">{strat.description}</p>
                      <p className="text-[11px] font-semibold text-emerald-700 mb-1">
                        {strat.saved > 0
                          ? `Saves ${compactRupees(strat.saved)} & ${savedTimeLabel(strat.mSaved)}`
                          : "Loads this plan"}
                      </p>
                      <p className="text-[10px] text-slate-500 mb-3">
                        {strat.res.extraEMI > 0 && `+${compactRupees(strat.res.extraEMI)}/mo`}
                        {strat.res.extraEMI > 0 && strat.res.yearlyLump > 0 && " · "}
                        {strat.res.yearlyLump > 0 && `${compactRupees(strat.res.yearlyLump)}/yr`}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`w-full h-8 text-[11px] rounded-lg shadow-sm ${
                          isActive ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" : "bg-white/50 hover:bg-white border-white/40"
                        }`}
                        onClick={() => applyStrategy(strat.id, strat.res.extraEMI, strat.res.yearlyLump)}
                      >
                        {isActive ? "Strategy Active!" : "Apply to Calculator"}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">The Prepayment Acceleration Magic</strong> — In the early years of a loan, 70–80% of your EMI goes strictly to interest while principal decreases slowly. Any extra prepayment directly reduces the core principal — slicing years off your loan.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tile 5/6: Donut Charts */}
          <Card className="md:col-span-4 lg:col-span-3 rounded-3xl shadow-sm border-slate-200 flex flex-col">
            <CardHeader className="pb-0 text-center">
              <CardTitle className="text-sm font-bold">Comparison Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex-1 min-h-[150px] flex flex-col items-center">
                <p className="text-xs font-medium text-slate-500 mb-1 text-center">Traditional Bank Contract</p>
                <div className="h-28 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={30} outerRadius={45} stroke="none" dataKey="value">
                        {pieStandard.map((entry, index) => (
                          <Cell key={`cell-std-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatRupees(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Total: {formatRupees(baseline.totalPrincipalBorrowed + baseline.totalInterest)}</p>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex-1 min-h-[150px] flex flex-col items-center">
                <p className="text-xs font-medium text-emerald-600 mb-1 text-center flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Accelerated Prepayout
                </p>
                <div className="h-28 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={30} outerRadius={45} stroke="none" dataKey="value">
                        {pieAccelerated.map((entry, index) => (
                          <Cell key={`cell-acc-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatRupees(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-emerald-600 font-medium">Total: {formatRupees(plan.totalPaid)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full-width Amortization Ledger */}
        <Card className="rounded-3xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Detailed Amortization &amp; Repayment Ledger
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {viewMode === "yearly"
                  ? "Edit the “Extra Prepaid” amount for any year — the schedule recalculates instantly."
                  : "Month-by-month breakdown of every payment."}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  placeholder={viewMode === "yearly" ? "Search years…" : "Search months…"}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 h-9 w-44 rounded-xl text-sm bg-slate-50 border border-transparent focus:outline-none focus-visible:border-indigo-500"
                />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => { setViewMode("yearly"); setSearch(""); }}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${viewMode === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => { setViewMode("monthly"); setSearch(""); }}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${viewMode === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                >
                  Monthly
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl"
                onClick={() => setTableExpanded((o) => !o)}
              >
                {tableExpanded ? <EyeOff className="h-3.5 w-3.5 text-indigo-500" /> : <ChevronDown className="h-3.5 w-3.5 text-indigo-500" />}
                {tableExpanded ? "Collapse" : "Expand"}
              </Button>
              <div className="relative">
                <Button
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setExportOpen((o) => !o)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Report
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
                </Button>
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
          </CardHeader>

          {tableExpanded && (
            <div className="p-5">
              <div className="flex justify-end mb-3">
                <span className="text-[11px] text-slate-400 font-medium">
                  {viewMode === "yearly" ? `${plan.years.length} year(s)` : `${plan.months.length} month(s)`}
                </span>
              </div>
              <div className="overflow-x-auto">
                {viewMode === "yearly" ? (
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-indigo-50/60">
                        {["Year", "Opening Balance", "EMI Paid", "Extra Prepaid (edit)", "Interest", "Principal", "Closing Balance"].map((h) => (
                          <th key={h} className="px-3 py-3 text-right font-semibold border-b border-slate-200 whitespace-nowrap first:text-left text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyRows.map((y) => (
                        <tr key={y.year} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3 py-2 text-left font-medium border-b border-slate-100 text-slate-900">Year {y.year}</td>
                          <td className="px-3 py-2 text-right border-b border-slate-100 text-slate-600">{formatRupees(y.opening)}</td>
                          <td className="px-3 py-2 text-right border-b border-slate-100 text-slate-600">{formatRupees(y.emiPaid)}</td>
                          <td className="px-3 py-2 text-right border-b border-slate-100">
                            <Input
                              className="h-7 w-28 ml-auto text-xs text-right bg-emerald-50/50 border-emerald-100 text-emerald-700 font-medium focus-visible:ring-emerald-500"
                              type="number"
                              min={0}
                              placeholder="0"
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
                          <td className="px-3 py-2 text-right text-amber-700 border-b border-slate-100">{formatRupees(y.interest)}</td>
                          <td className="px-3 py-2 text-right text-indigo-600 border-b border-slate-100">{formatRupees(y.principal)}</td>
                          <td className="px-3 py-2 text-right font-medium border-b border-slate-100">{formatRupees(y.closing)}</td>
                        </tr>
                      ))}
                      {yearlyRows.length === 0 && (
                        <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">No matching rows</td></tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-semibold">
                        <td className="px-3 py-3 text-left">Total</td>
                        <td className="px-3 py-3 text-right">—</td>
                        <td className="px-3 py-3 text-right">{formatRupees(plan.years.reduce((s, y) => s + y.emiPaid, 0))}</td>
                        <td className="px-3 py-3 text-right">{formatRupees(plan.years.reduce((s, y) => s + y.extraPaid, 0))}</td>
                        <td className="px-3 py-3 text-right text-amber-700">{formatRupees(plan.totalInterest)}</td>
                        <td className="px-3 py-3 text-right text-indigo-600">{formatRupees(plan.totalPrincipalBorrowed)}</td>
                        <td className="px-3 py-3 text-right">₹0</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-indigo-50/60">
                        {["Month", "Opening", "EMI", "Extra", "Interest", "Principal", "Closing"].map((h) => (
                          <th key={h} className="px-3 py-3 text-right font-semibold border-b border-slate-200 whitespace-nowrap first:text-left text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRows.map((m) => (
                        <tr key={m.month} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3 py-2 text-left font-medium border-b border-slate-100 whitespace-nowrap text-slate-900">{m.label}</td>
                          <td className="px-3 py-2 text-right border-b border-slate-100 text-slate-600">{formatRupees(m.opening)}</td>
                          <td className="px-3 py-2 text-right border-b border-slate-100 text-slate-600">{formatRupees(m.emi)}</td>
                          <td className="px-3 py-2 text-right text-emerald-700 border-b border-slate-100">{m.extra > 0 ? formatRupees(m.extra) : "—"}</td>
                          <td className="px-3 py-2 text-right text-amber-700 border-b border-slate-100">{formatRupees(m.interest)}</td>
                          <td className="px-3 py-2 text-right text-indigo-600 border-b border-slate-100">{formatRupees(m.principal)}</td>
                          <td className="px-3 py-2 text-right font-medium border-b border-slate-100">{formatRupees(m.closing)}</td>
                        </tr>
                      ))}
                      {monthlyRows.length === 0 && (
                        <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">No matching rows</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
