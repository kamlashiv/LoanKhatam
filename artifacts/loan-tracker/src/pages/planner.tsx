import { useState, useRef, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { ChartTooltip } from "@/lib/chart-theme";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  /** YYYY-MM month from which the recurring extra payment begins. */
  extraStartMonth: string;
}

/** Whole-month difference from `from` to `to` (both YYYY-MM). */
function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  if (!fy || !fm || !ty || !tm) return 0;
  return (ty - fy) * 12 + (tm - fm);
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

// On-slice percentage label for the "Where Does Your Money Go?" pies.
const RADIAN = Math.PI / 180;
function renderSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
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
    extraStartMonth: new Date().toISOString().slice(0, 7),
  });
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
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
    if (draft.startDate) {
      updates.startMonth = draft.startDate.slice(0, 7);
      // Re-anchor the extra-payment start to the imported loan start.
      updates.extraStartMonth = updates.startMonth;
    }
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

  // 1-based month offset where the recurring extra payment kicks in.
  const extraStartOffset = Math.max(1, monthsBetween(params.startMonth, params.extraStartMonth) + 1);

  const plan: PlannerResult = useMemo(
    () => simulatePlan({
      principal: params.principal,
      rate: params.rate,
      tenureMonths: params.tenureMonths,
      extraEMI: params.extraEMI,
      extraStartMonth: extraStartOffset,
      lumpPrepayments,
      topUp: topUpInput,
    }),
    [params, extraStartOffset, lumpPrepayments, topUpInput]
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
        extraStartMonth: extraStartOffset,
        lumpPrepayments: lumps,
        topUp: topUpInput,
      });
      const saved = Math.max(0, baseline.totalInterest - sim.totalInterest);
      const mSaved = Math.max(0, baseline.payoffMonths - sim.payoffMonths);
      return { ...s, res, saved, mSaved, ...STRAT_VISUAL[i % STRAT_VISUAL.length] };
    });
  }, [plan.baseEMI, params.principal, params.rate, params.tenureMonths, extraStartOffset, topUpInput, baseline]);

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
    const now = new Date().toISOString().slice(0, 7);
    setParams({ principal: 2500000, rate: 8.5, tenureMonths: 240, startMonth: now, extraEMI: 0, extraStartMonth: now });
    setTenureUnit("years");
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


  // ── "Where Does Your Money Go?" money pies (loan amount vs interest) ────────
  const moneyLoanAmt = plan.totalPrincipalBorrowed;
  const stdMoneyInterest = baseline.totalInterest;
  const planMoneyInterest = plan.totalInterest;
  const stdIntShare = moneyLoanAmt + stdMoneyInterest > 0
    ? Math.round((stdMoneyInterest / (moneyLoanAmt + stdMoneyInterest)) * 100) : 0;
  const planIntShare = moneyLoanAmt + planMoneyInterest > 0
    ? Math.round((planMoneyInterest / (moneyLoanAmt + planMoneyInterest)) * 100) : 0;
  const moneyPies = [
    {
      label: "Paying the Normal Way",
      data: [
        { name: "Loan Amount", value: moneyLoanAmt, color: "#6366f1" },
        { name: "Interest", value: stdMoneyInterest, color: "#f59e0b" },
      ],
      caption: `For every ₹100 you repay, about ₹${stdIntShare} is just interest.`,
      captionColor: "text-amber-600",
      total: moneyLoanAmt + stdMoneyInterest,
    },
    {
      label: "With Smart Prepayments",
      data: [
        { name: "Loan Amount", value: moneyLoanAmt, color: "#6366f1" },
        { name: "Interest", value: planMoneyInterest, color: "#10b981" },
      ],
      caption: `With smart payments, only about ₹${planIntShare} of every ₹100 is interest.`,
      captionColor: "text-emerald-600",
      total: moneyLoanAmt + planMoneyInterest,
    },
  ];

  const rows = viewMode === "yearly" ? yearlyRows : monthlyRows;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Target className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">SMART Strategy</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Plan prepayments, compare strategies, and see exactly how much interest and time you save.
            </p>
          </div>
        </div>
        <div className="relative">
          <Button variant="outline" className="gap-2" onClick={() => setExportOpen((o) => !o)}>
            <Download className="h-4 w-4" /> Export
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
          {exportOpen && (
            <div className="absolute right-0 mt-1 z-20 w-44 rounded-lg border border-slate-200 bg-white shadow-lg p-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-50 text-left"
                onClick={() => { exportPlannerCSV(exportMeta, baseline, plan); setExportOpen(false); }}
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> CSV Ledger
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-50 text-left disabled:opacity-60"
                disabled={exporting}
                onClick={handlePDF}
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 text-rose-600" />} PDF Report
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-50 text-left"
                onClick={exportJSON}
              >
                <FileCode className="h-4 w-4 text-indigo-600" /> JSON Data
              </button>
            </div>
          )}
        </div>
      </div>
      {/* ── Impact summary banner ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white p-6 shadow-sm">
        {monthsSaved > 0 ? (
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">Your Impact Summary</p>
                <p className="text-lg sm:text-xl font-bold leading-snug mt-1">
                  Paying {formatRupees(params.extraEMI)} extra each month saves you{" "}
                  <span className="text-emerald-100">{formatRupees(interestSaved)}</span> in interest and clears your loan{" "}
                  <span className="text-emerald-100">{savedTimeLabel(monthsSaved)}</span> sooner.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div>
                <p className="text-2xl sm:text-3xl font-black leading-none">{compactRupees(interestSaved)}</p>
                <p className="text-xs text-white/70 mt-1">Interest Saved</p>
              </div>
              <div className="h-10 w-px bg-white/25" />
              <div>
                <p className="text-2xl sm:text-3xl font-black leading-none">{savedTimeLabel(monthsSaved)}</p>
                <p className="text-xs text-white/70 mt-1">Debt-Free Sooner</p>
              </div>
              <div className="h-10 w-px bg-white/25" />
              <div>
                <p className="text-2xl sm:text-3xl font-black leading-none">{Math.round(interestSavingPct)}%</p>
                <p className="text-xs text-white/70 mt-1">Less Interest</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">Your Impact Summary</p>
              <p className="text-lg sm:text-xl font-bold leading-snug mt-1">
                Add an extra monthly payment or a yearly prepayment to see how much interest and time you could save.
              </p>
            </div>
          </div>
        )}
      </div>
      {/* ── Where Does Your Money Go? ───────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Where Does Your Money Go?</h2>
            <p className="text-sm text-slate-500">
              A simple look at how much you pay back as the loan amount vs. extra interest
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moneyPies.map((p) => (
              <div key={p.label} className="flex flex-col items-center">
                <p className="font-semibold text-slate-700 mb-3">{p.label}</p>
                <div className="w-full h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={p.data} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={renderSliceLabel} stroke="#fff" strokeWidth={2} isAnimationActive={false}>
                        {p.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-5 mt-2">
                  {p.data.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-slate-600">{entry.name}</span>
                      <span className="text-sm font-bold text-slate-900">{compactRupees(entry.value)}</span>
                    </div>
                  ))}
                </div>
                <p className={`text-sm font-semibold mt-3 text-center ${p.captionColor}`}>{p.caption}</p>
                <p className="text-xs text-slate-400 mt-1">Total repaid: {formatRupees(p.total)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* ── Bento grid: inputs + outputs ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column — loan controls */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Configure your loan parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FileUploadZone onExtracted={handleExtracted} />
              {draft && (
                <ExtractedReview
                  draft={draft}
                  onChange={setDraft}
                  onApply={applyDraft}
                  onDiscard={() => setDraft(null)}
                />
              )}

              <div className="space-y-1.5">
                <Label htmlFor="planner-profile">Profile Name</Label>
                <Input
                  id="planner-profile"
                  placeholder="e.g. Home Loan"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="planner-principal">Principal (₹)</Label>
                  <span className="text-sm font-bold text-slate-900">{compactRupees(params.principal)}</span>
                </div>
                <Input
                  id="planner-principal"
                  type="number"
                  value={params.principal}
                  onChange={(e) => { set("principal", Number(e.target.value) || 0); setActiveStrategy(null); }}
                />
                <Slider
                  value={[params.principal]}
                  min={50000}
                  max={20000000}
                  step={50000}
                  onValueChange={([v]) => { set("principal", v); setActiveStrategy(null); }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="planner-rate">Rate (%)</Label>
                  <Input
                    id="planner-rate"
                    type="number"
                    step="0.1"
                    value={params.rate}
                    onChange={(e) => { set("rate", Number(e.target.value) || 0); setActiveStrategy(null); }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="planner-tenure">Tenure</Label>
                    <div className="flex rounded-md border border-slate-200 overflow-hidden text-[11px]">
                      <button
                        type="button"
                        className={`px-2 py-0.5 ${tenureUnit === "years" ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}
                        onClick={() => setTenureUnit("years")}
                      >
                        Yr
                      </button>
                      <button
                        type="button"
                        className={`px-2 py-0.5 ${tenureUnit === "months" ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}
                        onClick={() => setTenureUnit("months")}
                      >
                        Mo
                      </button>
                    </div>
                  </div>
                  <Input
                    id="planner-tenure"
                    type="number"
                    value={tenureUnit === "years" ? Math.round((params.tenureMonths / 12) * 10) / 10 : params.tenureMonths}
                    onChange={(e) => {
                      const n = Number(e.target.value) || 0;
                      set("tenureMonths", tenureUnit === "years" ? Math.round(n * 12) : Math.round(n));
                      setActiveStrategy(null);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="planner-start">Start Month</Label>
                <Input
                  id="planner-start"
                  type="month"
                  value={params.startMonth}
                  onChange={(e) => set("startMonth", e.target.value)}
                />
              </div>

              <div className="space-y-2 rounded-lg bg-emerald-50/60 border border-emerald-100 p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="planner-extra-emi" className="text-emerald-800">Extra Monthly Payment (₹)</Label>
                  <span className="text-sm font-bold text-emerald-700">{formatRupees(params.extraEMI)}</span>
                </div>
                <Input
                  id="planner-extra-emi"
                  type="number"
                  value={params.extraEMI}
                  onChange={(e) => { set("extraEMI", Number(e.target.value) || 0); setActiveStrategy(null); }}
                />
                <Slider
                  value={[params.extraEMI]}
                  min={0}
                  max={Math.max(50000, Math.round(plan.baseEMI * 2))}
                  step={500}
                  onValueChange={([v]) => { set("extraEMI", v); setActiveStrategy(null); }}
                />
                <p className="text-xs text-slate-500">Base EMI is {compactRupees(plan.baseEMI)}/month before extras.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="planner-extra-start">Extra Payment Starts</Label>
                <Input
                  id="planner-extra-start"
                  type="month"
                  value={params.extraStartMonth}
                  onChange={(e) => set("extraStartMonth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Top-up Loan</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="topup-amount" className="text-xs text-slate-500">Amount (₹)</Label>
                    <Input
                      id="topup-amount"
                      type="number"
                      value={topUp.amount || ""}
                      onChange={(e) => setTopUp((t) => ({ ...t, amount: Number(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="topup-rate" className="text-xs text-slate-500">Rate (%)</Label>
                    <Input
                      id="topup-rate"
                      type="number"
                      step="0.1"
                      value={topUp.rate}
                      onChange={(e) => setTopUp((t) => ({ ...t, rate: Number(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="topup-month" className="text-xs text-slate-500">Month</Label>
                    <Input
                      id="topup-month"
                      type="number"
                      value={topUp.month}
                      onChange={(e) => setTopUp((t) => ({ ...t, month: Number(e.target.value) || 1 }))}
                    />
                  </div>
                </div>
                {topUp.amount > 0 && (
                  <p className="text-xs text-slate-500">
                    {formatRupees(topUp.amount)} will be added in month {topUp.month} — the EMI will be recalculated.
                  </p>
                )}
              </div>

              <div className="space-y-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5 text-indigo-600" /> Reverse Calculator: Target Yrs
                  </Label>
                  <span className="text-sm font-bold text-indigo-700">{targetYears} yrs</span>
                </div>
                <Slider
                  value={[targetYears]}
                  min={1}
                  max={Math.max(1, Math.ceil(params.tenureMonths / 12))}
                  step={1}
                  onValueChange={([v]) => setTargetYears(v)}
                />
                <p className="text-xs text-slate-600">
                  To finish in {targetYears} years, pay {formatRupees(reverse.requiredPayment)}/mo
                  {reverse.requiredExtra > 0 && (
                    <> (<span className="font-semibold text-emerald-700">+{formatRupees(reverse.requiredExtra)}</span> extra)</>
                  )}.
                </p>
                {reverse.requiredExtra > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 gap-1.5 text-xs bg-white"
                    onClick={() => { setActiveStrategy(null); set("extraEMI", Math.round(reverse.requiredExtra)); }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Apply to Calculator
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full gap-2 text-slate-500 hover:text-slate-700" onClick={resetAll}>
                <RefreshCw className="h-4 w-4" /> Reset All
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right column — outputs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Interest Saved</p>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">{formatRupees(interestSaved)}</p>
                <p className="text-xs text-slate-500 mt-1">≈{Math.round(interestSavingPct)}% of standard interest</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarRange className="h-4 w-4 text-emerald-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Tenure Saved</p>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">
                  {monthsSaved > 0 ? savedTimeLabel(monthsSaved) : "0 Months"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {monthsSaved > 0 ? `Clears ${Math.round(timeSavingPct)}% sooner` : "Repaying on time as scheduled"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                  <span>{payoffDate(params.startMonth, baseline.payoffMonths)}</span>
                  <span>→</span>
                  <span className="text-emerald-600 font-semibold">{payoffDate(params.startMonth, plan.payoffMonths)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 pb-[20px]">
                <div className="flex items-center gap-2 text-slate-500">
                  <Scale className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Net Principal</p>
                </div>
                <p className="font-black text-slate-900 mt-2 text-[23px]">{formatRupees(netPrincipal)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Borrowed amount
                  {disbursedTopUp > 0 && (
                    <span className="text-indigo-600 font-semibold"> + {formatRupees(disbursedTopUp)}</span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <Coins className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Monthly EMI</p>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">{formatRupees(plan.baseEMI)}</p>
                <p className="text-xs mt-1">
                  {params.extraEMI > 0
                    ? <span className="text-emerald-600 font-semibold">+{formatRupees(params.extraEMI)} extra</span>
                    : <span className="text-slate-500">No extra payment yet</span>}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projection + Strategies */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600" /> Projection
                </CardTitle>
                <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs">
                  <button
                    className={`px-3 py-1 ${chartTab === "balance" ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}
                    onClick={() => setChartTab("balance")}
                  >
                    Balance
                  </button>
                  <button
                    className={`px-3 py-1 ${chartTab === "costs" ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}
                    onClick={() => setChartTab("costs")}
                  >
                    Costs
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartTab === "balance" ? (
                      <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gStd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gAcc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => compactRupees(v)} width={60} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="Standard Balance" stroke="#f43f5e" fill="url(#gStd)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Accelerated Balance" stroke="#10b981" fill="url(#gAcc)" strokeWidth={2} />
                      </AreaChart>
                    ) : (
                      <BarChart data={costData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => compactRupees(v)} width={60} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Bar dataKey="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Interest" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-600" /> Smart Payoff Leverage Strategies
                </CardTitle>
                <CardDescription>Select a strategy to instantly load it into the calculator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {strategyCards.map((s) => {
                    const Icon = s.icon;
                    const active = activeStrategy === s.id;
                    return (
                      <div
                        key={s.id}
                        className={`rounded-xl border bg-gradient-to-br p-3 ${s.card} ${active ? "ring-2 ring-indigo-500" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${s.iconColor}`} />
                          <p className="font-semibold text-sm text-slate-800 leading-tight">{s.title}</p>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Saves {compactRupees(s.saved)} &amp; {savedTimeLabel(s.mSaved)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 h-7 text-[11px] bg-white/70"
                          onClick={() => applyStrategy(s.id, s.res.extraEMI, s.res.yearlyLump)}
                        >
                          Apply to Calculator
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">The Prepayment Acceleration Magic</span> — In the early
                    years of a loan, 70–80% of your EMI goes to interest while principal falls slowly. Any extra prepayment
                    attacks the core principal directly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison breakdown donuts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-indigo-600" /> Comparison Breakdown
              </CardTitle>
              <CardDescription>Principal vs. interest, standard path vs. your savings plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Standard Path", data: pieStandard, total: params.principal + baseline.totalInterest },
                  { label: "Savings Plan", data: pieAccelerated, total: plan.totalPaid },
                ].map((d) => (
                  <div key={d.label} className="flex flex-col items-center">
                    <p className="font-semibold text-slate-700 text-sm mb-2">{d.label}</p>
                    <div className="w-full h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={d.data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="#fff" strokeWidth={2}>
                            {d.data.map((entry, index) => (
                              <Cell key={`donut-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Total: {formatRupees(d.total)}</p>
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                      {d.data.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-[11px] text-slate-600">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* ── Repayment ledger ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-4 w-4 text-indigo-600" /> Repayment Ledger
            </CardTitle>
            <CardDescription>
              {viewMode === "yearly" ? "Yearly summary — edit a year's extra prepayment inline" : "Month-by-month schedule"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                className="h-8 w-40 pl-8 text-xs"
                aria-label="Search ledger rows"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs">
              <button
                className={`px-3 py-1 ${viewMode === "yearly" ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}
                onClick={() => setViewMode("yearly")}
              >
                Yearly
              </button>
              <button
                className={`px-3 py-1 ${viewMode === "monthly" ? "bg-indigo-600 text-white" : "bg-white text-slate-500"}`}
                onClick={() => setViewMode("monthly")}
              >
                Monthly
              </button>
            </div>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setTableExpanded((v) => !v)}>
              {tableExpanded ? <EyeOff className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {tableExpanded ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>
        {tableExpanded && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="py-2 pr-3 font-medium">{viewMode === "yearly" ? "Year" : "Month"}</th>
                    <th className="py-2 px-3 font-medium text-right">Opening</th>
                    <th className="py-2 px-3 font-medium text-right">Interest</th>
                    <th className="py-2 px-3 font-medium text-right">Principal</th>
                    {viewMode === "yearly" && <th className="py-2 px-3 font-medium text-right">Extra Prepaid</th>}
                    <th className="py-2 pl-3 font-medium text-right">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {viewMode === "yearly"
                    ? yearlyRows.map((y) => (
                        <tr key={y.year} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 pr-3 font-medium text-slate-800">Year {y.year}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{formatRupees(y.opening)}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-amber-600">{formatRupees(y.interest)}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{formatRupees(y.principal)}</td>
                          <td className="py-2 px-3 text-right">
                            <Input
                              type="number"
                              aria-label={`Extra prepayment for year ${y.year}`}
                              className="h-7 w-28 ml-auto text-right text-xs border-emerald-200 focus-visible:ring-emerald-400"
                              placeholder="0"
                              value={yearLumps[y.year] ?? ""}
                              onChange={(e) => {
                                setActiveStrategy(null);
                                setYearLumps((prev) => ({ ...prev, [y.year]: Number(e.target.value) || 0 }));
                              }}
                            />
                          </td>
                          <td className="py-2 pl-3 text-right tabular-nums font-semibold text-slate-900">{formatRupees(y.closing)}</td>
                        </tr>
                      ))
                    : monthlyRows.map((m) => (
                        <tr key={m.month} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 pr-3 font-medium text-slate-800">{m.label}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{formatRupees(m.opening)}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-amber-600">{formatRupees(m.interest)}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{formatRupees(m.principal)}</td>
                          <td className="py-2 pl-3 text-right tabular-nums font-semibold text-slate-900">{formatRupees(m.closing)}</td>
                        </tr>
                      ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 font-semibold text-slate-900">
                    <td className="py-2 pr-3">Total Interest</td>
                    <td className="py-2 px-3" />
                    <td className="py-2 px-3 text-right tabular-nums text-amber-600">{formatRupees(plan.totalInterest)}</td>
                    <td className="py-2 px-3" />
                    {viewMode === "yearly" && <td className="py-2 px-3" />}
                    <td className="py-2 pl-3" />
                  </tr>
                </tfoot>
              </table>
              {rows.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-6">No rows match your search.</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <Card className="bg-gradient-to-r from-indigo-600 to-emerald-500 text-white border-0">
        <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold">Ready to put this plan into action?</p>
            <p className="text-sm text-white/80">Save this loan to your tracker and start logging payments.</p>
          </div>
          <Button asChild variant="secondary" className="gap-2 shrink-0">
            <Link href="/loans/new">
              <Plus className="h-4 w-4" /> Save as Loan
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
