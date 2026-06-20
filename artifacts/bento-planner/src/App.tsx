import { useState, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles, CalendarClock, Wallet, TrendingDown, Clock3, PiggyBank,
  CheckCircle2, ChevronDown, ChevronRight, ArrowRight, CalendarRange,
  Coins, Banknote, Repeat, Rocket, Layers, Pencil, Upload, Loader2,
  AlertCircle, X, FileSpreadsheet, FileText, FileCode, RefreshCw,
  Target, BarChart3,
} from "lucide-react";
import {
  simulatePlan, reverseFromTargetMonths, STRATEGY_PRESETS,
  type PlannerResult,
} from "@/lib/planner-engine";
import { exportPlannerCSV, exportPlannerPDF } from "@/lib/export";
import { extractFromFile, type ExtractedData } from "@/lib/file-extract";

/* ------------------------------------------------------------------ */
/* Brand tokens (RinMukti, light)                                      */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#f0f2f5",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
  indigo: "#4f46e5",
  indigoSoft: "#eef2ff",
  emerald: "#10b981",
  emeraldSoft: "#ecfdf5",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

const mono = "'Space Mono', Menlo, monospace";
const sans = "'Plus Jakarta Sans', 'Outfit', sans-serif";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const inr = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;
const inrCompact = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
};

function savedTimeLabel(months: number) {
  const y = Math.floor(months / 12);
  const mo = months % 12;
  if (y > 0 && mo > 0) return `${y} yr ${mo} mo`;
  if (y > 0) return `${y} yr${y > 1 ? "s" : ""}`;
  if (mo > 0) return `${mo} mo`;
  return "0 mo";
}

function startParts(startMonth: string) {
  const [y, m] = startMonth.split("-").map(Number);
  return { year: y || new Date().getFullYear(), month: m || 1 };
}

function monthLabel(startMonth: string, m: number, long = false) {
  const { year, month } = startParts(startMonth);
  const d = new Date(year, month - 1 + Math.max(0, m - 1), 1);
  return d.toLocaleDateString("en-US", { month: long ? "long" : "short", year: "numeric" });
}

function yearRange(startMonth: string, yearIdx: number, monthsInYear: number) {
  const { year, month } = startParts(startMonth);
  const begin = new Date(year, month - 1 + (yearIdx - 1) * 12, 1);
  const end = new Date(year, month - 1 + (yearIdx - 1) * 12 + Math.max(0, monthsInYear - 1), 1);
  const by = begin.getFullYear();
  const ey = end.getFullYear();
  return by === ey ? `${by}` : `${by}–${String(ey).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* Types & state                                                      */
/* ------------------------------------------------------------------ */
interface LoanParams {
  principal: number;
  rate: number;
  tenureMonths: number;
  startMonth: string;
  extraEMI: number;
}

const STRAT_META: Record<string, { icon: any; recommended?: boolean }> = {
  "one-extra-emi": { icon: Repeat },
  "round-up": { icon: Coins },
  "ten-percent": { icon: Rocket, recommended: true },
  "super-saver": { icon: Layers },
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */
function AssistantBubble({
  children,
  step,
}: {
  children: React.ReactNode;
  step?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
        style={{ background: C.indigo }}
      >
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        {step && (
          <div
            className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: C.indigo }}
          >
            {step}
          </div>
        )}
        <div
          className="inline-block rounded-2xl rounded-tl-md px-5 py-4 text-[17px] leading-relaxed"
          style={{ background: C.indigoSoft, color: C.text, border: `1px solid #e0e7ff` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function GoalToggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
      style={{
        background: active ? C.indigo : C.card,
        color: active ? "#fff" : C.muted,
        border: `1px solid ${active ? C.indigo : C.border}`,
        boxShadow: active ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
      }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-medium transition-all"
      style={{
        background: active ? C.indigo : "#fff",
        color: active ? "#fff" : C.text,
        border: `1px solid ${active ? C.indigo : C.border}`,
        fontFamily: mono,
      }}
    >
      {children}
    </button>
  );
}

function PlanStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl p-5" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${accent}14` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        <span className="text-[12px] font-medium uppercase tracking-wide" style={{ color: C.muted }}>
          {label}
        </span>
      </div>
      <div className="mt-3 text-[26px] font-bold leading-none" style={{ fontFamily: mono, color: C.text }}>
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 text-[13px]" style={{ color: C.muted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StrategyCard({
  icon: Icon,
  title,
  desc,
  saveAmt,
  saveTime,
  recommended,
  selected,
  onClick,
}: {
  icon: any;
  title: string;
  desc: string;
  saveAmt: string;
  saveTime: string;
  recommended?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full flex-col rounded-[2rem] p-5 text-left bento-hover"
      style={{
        background: selected ? C.emeraldSoft : "#fff",
        border: `1.5px solid ${selected ? C.emerald : C.border}`,
        boxShadow: selected ? "0 4px 14px rgba(16,185,129,0.18)" : "0 8px 30px rgba(0,0,0,0.04)",
      }}
    >
      {recommended && (
        <span
          className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: C.indigo }}
        >
          Recommended
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: selected ? C.emerald : C.indigoSoft }}
        >
          <Icon className="h-5 w-5" style={{ color: selected ? "#fff" : C.indigo }} />
        </div>
        <div className="font-semibold" style={{ color: C.text }}>
          {title}
        </div>
        {selected && <CheckCircle2 className="ml-auto h-5 w-5" style={{ color: C.emerald }} />}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed" style={{ color: C.muted }}>
        {desc}
      </p>
      <div
        className="mt-4 flex items-center justify-between border-t pt-3"
        style={{ borderColor: selected ? "#bbf7d0" : C.border }}
      >
        <div>
          <div className="text-[15px] font-bold" style={{ fontFamily: mono, color: C.emerald }}>
            {saveAmt}
          </div>
          <div className="text-[11px]" style={{ color: C.muted }}>
            interest saved
          </div>
        </div>
        <div className="text-right">
          <div className="text-[15px] font-bold" style={{ fontFamily: mono, color: C.text }}>
            {saveTime}
          </div>
          <div className="text-[11px]" style={{ color: C.muted }}>
            sooner
          </div>
        </div>
      </div>
    </button>
  );
}

/* Real payoff projection: standard vs accelerated, from engine year rows. */
function PayoffChart({
  baseline,
  plan,
  principal,
  startMonth,
}: {
  baseline: PlannerResult;
  plan: PlannerResult;
  principal: number;
  startMonth: string;
}) {
  const w = 760;
  const h = 240;
  const padL = 8;
  const padB = 28;
  const padT = 16;
  const innerW = w - padL - 8;
  const innerH = h - padB - padT;

  const startBal = Math.max(1, principal);
  const maxMonths = Math.max(baseline.payoffMonths, plan.payoffMonths, 1);
  const yFor = (bal: number) => padT + (1 - Math.max(0, bal) / startBal) * innerH;
  const xFor = (months: number) => padL + (months / maxMonths) * innerW;

  const buildPts = (res: PlannerResult): [number, number][] => {
    const pts: [number, number][] = [[xFor(0), yFor(startBal)]];
    let cum = 0;
    for (const yr of res.years) {
      cum += yr.monthsInYear;
      pts.push([xFor(cum), yFor(yr.closing)]);
    }
    return pts;
  };

  const stdPts = buildPts(baseline);
  const accPts = buildPts(plan);

  const toPath = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const lastAcc = accPts[accPts.length - 1];
  const accArea = toPath(accPts) + ` L${lastAcc[0].toFixed(1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  const { year: startYear } = startParts(startMonth);
  const maxYears = Math.max(1, Math.ceil(maxMonths / 12));
  const xLabels = [0, 1, 2, 3, 4].map((i) => String(startYear + Math.round((i / 4) * maxYears)));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.emerald} stopOpacity="0.22" />
          <stop offset="100%" stopColor={C.emerald} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={padL}
          x2={padL + innerW}
          y1={padT + g * innerH}
          y2={padT + g * innerH}
          stroke={C.border}
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}
      <path d={accArea} fill="url(#accFill)" />
      <path d={toPath(stdPts)} fill="none" stroke={C.muted} strokeWidth={2.5} strokeDasharray="5 5" />
      <path d={toPath(accPts)} fill="none" stroke={C.emerald} strokeWidth={3} />
      <circle cx={lastAcc[0]} cy={lastAcc[1]} r={5} fill={C.emerald} />
      <circle cx={stdPts[stdPts.length - 1][0]} cy={stdPts[stdPts.length - 1][1]} r={5} fill={C.muted} />
      {xLabels.map((yr, i) => (
        <text
          key={`${yr}-${i}`}
          x={padL + (i / 4) * innerW}
          y={h - 6}
          fontSize={11}
          fill={C.muted}
          textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
          fontFamily={mono}
        >
          {yr}
        </text>
      ))}
    </svg>
  );
}

function ScheduleRow({
  year,
  date,
  emi,
  extra,
  interest,
  balance,
}: {
  year: number;
  date: string;
  emi: string;
  extra: string;
  interest: string;
  balance: string;
}) {
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td className="py-2.5 pl-5 pr-3 text-[13px] font-medium" style={{ color: C.text }}>
        Year {year}
        <span className="ml-2 text-[12px] font-normal" style={{ color: C.muted }}>
          {date}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right text-[13px]" style={{ fontFamily: mono, color: C.text }}>
        {emi}
      </td>
      <td className="px-3 py-2.5 text-right text-[13px]" style={{ fontFamily: mono, color: C.emerald }}>
        {extra}
      </td>
      <td className="px-3 py-2.5 text-right text-[13px]" style={{ fontFamily: mono, color: C.amber }}>
        {interest}
      </td>
      <td className="px-3 py-2.5 pr-5 text-right text-[13px]" style={{ fontFamily: mono, color: C.text }}>
        {balance}
      </td>
    </tr>
  );
}

function CompareRow({
  label,
  value,
  color,
  strong,
}: {
  label: string;
  value: string;
  color: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px]" style={{ color: C.muted }}>
        {label}
      </span>
      <span
        className="text-[14px]"
        style={{ fontFamily: mono, color, fontWeight: strong ? 700 : 500 }}
      >
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* File upload (re-used inside "Adjust loan details")                  */
/* ------------------------------------------------------------------ */
function FileUploadZone({ onExtracted }: { onExtracted: (data: ExtractedData) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
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
    },
    [onExtracted]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
        dragOver
          ? "border-indigo-500 bg-indigo-50"
          : status === "success"
          ? "border-emerald-400 bg-emerald-50"
          : status === "error"
          ? "border-red-400 bg-red-50"
          : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
      }`}
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.pdf,.json,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
        }}
      />
      {status === "loading" && (
        <div className="flex flex-col items-center gap-2 py-2">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Upload className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Upload or drag a statement</p>
          <p className="text-[10px] text-slate-500">PNG • JPG • PDF • JSON • CSV — fields fill in automatically</p>
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Pencil className="h-3.5 w-3.5 text-indigo-600" />
          Extracted data — edit
        </span>
        <Badge className={`${confidenceColor[draft.confidence]} border text-xs`}>
          Confidence: {draft.confidence}
        </Badge>
      </div>
      {draft.notes && <p className="text-xs italic text-slate-500">{draft.notes}</p>}
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
        <Button size="sm" className="h-8 gap-1.5 bg-indigo-600 text-xs hover:bg-indigo-700" onClick={onApply}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Apply
        </Button>
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs" onClick={onDiscard}>
          <X className="h-3.5 w-3.5" />
          Discard
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  const [params, setParams] = useState<LoanParams>({
    principal: 2500000,
    rate: 8.5,
    tenureMonths: 240,
    startMonth: new Date().toISOString().slice(0, 7),
    extraEMI: 0,
  });
  const [profileName, setProfileName] = useState("");
  // Yearly lump prepayments are driven by strategy selection (no per-row editor
  // in this guided flow), so the advertised strategy savings stay accurate.
  const [yearLumps, setYearLumps] = useState<Record<number, number>>({});
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);

  const [goalMode, setGoalMode] = useState<"date" | "budget">("budget");
  const [targetSel, setTargetSel] = useState<number | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [draft, setDraft] = useState<ExtractedData | null>(null);

  const setBudget = (v: number) => {
    setActiveStrategy(null);
    setYearLumps({});
    setTargetSel(null);
    setParams((p) => ({ ...p, extraEMI: Math.max(0, Math.round(v)) }));
  };

  const lumpPrepayments = useMemo(() => {
    const out: Record<number, number> = {};
    for (const [yr, amt] of Object.entries(yearLumps)) {
      const n = Number(amt);
      if (n > 0) out[Number(yr) * 12] = n;
    }
    return out;
  }, [yearLumps]);

  const plan: PlannerResult = useMemo(
    () =>
      simulatePlan({
        principal: params.principal,
        rate: params.rate,
        tenureMonths: params.tenureMonths,
        extraEMI: params.extraEMI,
        lumpPrepayments,
      }),
    [params, lumpPrepayments]
  );

  const baseline: PlannerResult = useMemo(
    () =>
      simulatePlan({
        principal: params.principal,
        rate: params.rate,
        tenureMonths: params.tenureMonths,
        extraEMI: 0,
      }),
    [params.principal, params.rate, params.tenureMonths]
  );

  const interestSaved = Math.max(0, baseline.totalInterest - plan.totalInterest);
  const monthsSaved = Math.max(0, baseline.payoffMonths - plan.payoffMonths);
  const hasSavings = interestSaved > 0 || monthsSaved > 0;
  const tenureYears = Math.round((params.tenureMonths / 12) * 10) / 10;
  const debtFreeDate = monthLabel(params.startMonth, Math.max(1, plan.payoffMonths), true);
  const baselineDebtFreeDate = monthLabel(params.startMonth, Math.max(1, baseline.payoffMonths), true);
  const accBarWidth = baseline.payoffMonths > 0
    ? Math.min(100, Math.max(8, (plan.payoffMonths / baseline.payoffMonths) * 100))
    : 100;

  // Strategy cards — engine-computed savings for each preset.
  const strategyCards = useMemo(() => {
    const totalYears = Math.ceil(params.tenureMonths / 12);
    return STRATEGY_PRESETS.map((s) => {
      const res = s.compute(plan.baseEMI, params.principal);
      const lumps: Record<number, number> = {};
      if (res.yearlyLump > 0) for (let y = 1; y <= totalYears; y++) lumps[y * 12] = Math.round(res.yearlyLump);
      const sim = simulatePlan({
        principal: params.principal,
        rate: params.rate,
        tenureMonths: params.tenureMonths,
        extraEMI: Math.round(res.extraEMI),
        lumpPrepayments: lumps,
      });
      const saved = Math.max(0, baseline.totalInterest - sim.totalInterest);
      const mSaved = Math.max(0, baseline.payoffMonths - sim.payoffMonths);
      const meta = STRAT_META[s.id] ?? { icon: Rocket };
      return { ...s, res, saved, mSaved, icon: meta.icon, recommended: meta.recommended };
    });
  }, [plan.baseEMI, params.principal, params.rate, params.tenureMonths, baseline]);

  const applyStrategy = (id: string, extraEMI: number, yearlyLump: number) => {
    setActiveStrategy(id);
    setTargetSel(null);
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

  // Date-goal options: a few earlier payoff targets and the extra they require.
  const targetOptions = useMemo(() => {
    const baseYears = Math.max(2, Math.round(baseline.payoffMonths / 12));
    const cuts = [0.85, 0.72, 0.6].map((f) => Math.max(1, Math.round(baseYears * f)));
    const seen = new Set<number>();
    return cuts
      .filter((c) => (seen.has(c) ? false : (seen.add(c), true)))
      .map((years) => {
        const months = years * 12;
        const rev = reverseFromTargetMonths(params.principal, params.rate, plan.baseEMI, months);
        return {
          years,
          months,
          label: monthLabel(params.startMonth, months, true),
          extra: Math.round(rev.requiredExtra),
        };
      });
  }, [baseline.payoffMonths, params.principal, params.rate, params.startMonth, plan.baseEMI]);

  // Guard against a stale selection when targetOptions shrinks (e.g. tenure edited).
  const safeTargetSel =
    targetSel != null && targetSel < targetOptions.length ? targetSel : 0;

  const selectTarget = (i: number) => {
    setTargetSel(i);
    setActiveStrategy(null);
    setYearLumps({});
    setParams((p) => ({ ...p, extraEMI: targetOptions[i]?.extra ?? 0 }));
  };

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
    setTargetSel(null);
    setDraft(null);
  }, [draft]);

  const resetAll = () => {
    setParams({
      principal: 2500000,
      rate: 8.5,
      tenureMonths: 240,
      startMonth: new Date().toISOString().slice(0, 7),
      extraEMI: 0,
    });
    setYearLumps({});
    setProfileName("");
    setActiveStrategy(null);
    setTargetSel(null);
  };

  const exportMeta = {
    borrowerName: profileName,
    principal: params.principal,
    rate: params.rate,
    tenureMonths: params.tenureMonths,
    extraEMI: params.extraEMI,
    topUp: null,
  };

  const handlePDF = async () => {
    setExporting(true);
    try {
      await exportPlannerPDF(exportMeta, baseline, plan);
    } finally {
      setExporting(false);
      setExportOpen(false);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ meta: exportMeta, baseline, plan }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loan-planner-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const sliderMax = Math.max(15000, Math.ceil(params.extraEMI / 500) * 500);

  const accountInitial = (profileName || "You").trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full" style={{ background: C.bg, color: C.text, fontFamily: sans }}>
      {/* Sidebar */}
      <aside
        className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-between border-r bg-white/70 p-6 backdrop-blur-xl lg:flex"
        style={{ borderColor: C.border }}
      >
        <div>
          <div className="mb-9 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ background: C.indigo, boxShadow: "0 8px 20px rgba(79,70,229,0.25)" }}
            >
              <PiggyBank className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-[19px] font-extrabold leading-none tracking-tight">Smart Loan Saver</div>
              <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                RinMukti · debt-free planner
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: "goal", label: "Set your goal", icon: Target },
              { id: "strategies", label: "Strategies", icon: Rocket },
              { id: "plan", label: "Your plan", icon: BarChart3 },
              { id: "schedule", label: "Schedule", icon: CalendarRange },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition-all ${
                    i === 0
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                  }`}
                  style={i === 0 ? { border: `1px solid ${C.border}` } : undefined}
                >
                  <Icon className="h-5 w-5" /> {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Account holder + website settings */}
        <div className="rounded-3xl border p-5" style={{ background: C.indigoSoft, borderColor: "#e0e7ff" }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[16px] font-bold shadow-sm"
              style={{ color: C.indigo }}
            >
              {accountInitial}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-bold" style={{ color: C.text }}>
                {profileName || "Your account"}
              </div>
              <div className="text-[11px]" style={{ color: C.muted }}>
                Account holder
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2.5 border-t pt-3.5" style={{ borderColor: "#e0e7ff" }}>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>
              Website settings
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 font-medium" style={{ color: C.muted }}>
                <Coins className="h-3.5 w-3.5" /> Currency
              </span>
              <span className="font-bold" style={{ color: C.text }}>
                INR · ₹
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 font-medium" style={{ color: C.muted }}>
                <CalendarClock className="h-3.5 w-3.5" /> Date format
              </span>
              <span className="font-bold" style={{ color: C.text }}>
                DD/MM/YYYY
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 font-medium" style={{ color: C.muted }}>
                <FileSpreadsheet className="h-3.5 w-3.5" /> Auto-import
              </span>
              <span className="font-bold" style={{ color: C.emerald }}>
                On
              </span>
            </div>
            <button
              onClick={resetAll}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-[12px] font-bold transition-colors hover:bg-slate-50"
              style={{ color: C.indigo, border: `1px solid ${C.border}` }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset planner
            </button>
          </div>
        </div>
      </aside>

      {/* Main scroll area */}
      <div className="min-w-0 flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-[980px] px-6 pb-24 pt-10 md:px-10">
          {/* Header */}
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-extrabold leading-tight tracking-tight md:text-[40px]">
                Let's plan your way to <span style={{ color: C.emerald }}>debt-free</span>.
              </h1>
              <p className="mt-2 max-w-[560px] text-[15px] font-medium" style={{ color: C.muted }}>
                Starting from your {inr(params.principal)} {profileName ? `${profileName} ` : ""}loan at {params.rate}% for{" "}
                {tenureYears} years.
              </p>
            </div>
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
              style={{ borderColor: C.border, color: C.muted, background: "#fff" }}
            >
              <Banknote className="h-3.5 w-3.5" />
              Home Loan · {inrCompact(params.principal)}
            </Badge>
          </header>

          {/* Account holder + website settings — mobile fallback (sidebar hidden below lg) */}
          <div className="mb-6 rounded-[2rem] border p-5 bento-shadow lg:hidden" style={{ background: "#fff", borderColor: C.border }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[16px] font-bold"
                  style={{ background: C.indigoSoft, color: C.indigo }}
                >
                  {accountInitial}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-bold" style={{ color: C.text }}>
                    {profileName || "Your account"}
                  </div>
                  <div className="text-[11px]" style={{ color: C.muted }}>
                    Account holder
                  </div>
                </div>
              </div>
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors hover:bg-slate-50"
                style={{ color: C.indigo, border: `1px solid ${C.border}` }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-3 text-[12px]" style={{ borderColor: C.border }}>
              <span className="flex items-center gap-1.5" style={{ color: C.muted }}>
                <Coins className="h-3.5 w-3.5" /> Currency <strong style={{ color: C.text }}>INR · ₹</strong>
              </span>
              <span className="flex items-center gap-1.5" style={{ color: C.muted }}>
                <CalendarClock className="h-3.5 w-3.5" /> Dates <strong style={{ color: C.text }}>DD/MM/YYYY</strong>
              </span>
              <span className="flex items-center gap-1.5" style={{ color: C.muted }}>
                <FileSpreadsheet className="h-3.5 w-3.5" /> Auto-import <strong style={{ color: C.emerald }}>On</strong>
              </span>
            </div>
          </div>

          {/* Savings message — you've saved interest & time */}
          <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-indigo-950 p-7 text-white bento-shadow bento-hover md:col-span-2">
              <div className="pointer-events-none absolute right-0 top-0 p-6 opacity-10">
                <PiggyBank className="h-28 w-28" />
              </div>
              <div className="relative z-10 flex items-center gap-2 font-semibold text-indigo-200">
                <Sparkles className="h-5 w-5" /> {hasSavings ? "You've saved interest & time" : "Your savings preview"}
              </div>
              <div className="relative z-10 mt-5">
                {hasSavings ? (
                  <p className="text-[22px] font-extrabold leading-snug md:text-[26px]">
                    You're keeping <span className="text-emerald-300">{inrCompact(interestSaved)}</span> in interest and
                    becoming debt-free <span className="text-emerald-300">{savedTimeLabel(monthsSaved)} sooner</span>.
                  </p>
                ) : (
                  <p className="text-[19px] font-bold leading-snug text-indigo-100 md:text-[21px]">
                    Add an extra amount or pick a strategy below to see how much interest and time you'll save.
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-rows-2 gap-5">
              <div className="rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-500 p-5 text-white bento-shadow bento-hover">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-50">
                  <TrendingDown className="h-4 w-4" /> Interest saved
                </div>
                <div className="mt-2 text-[26px] font-extrabold tracking-tight" style={{ fontFamily: mono }}>
                  {hasSavings ? inrCompact(interestSaved) : "—"}
                </div>
              </div>
              <div className="rounded-[2rem] bg-gradient-to-b from-blue-400 to-indigo-500 p-5 text-white bento-shadow bento-hover">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-blue-50">
                  <Clock3 className="h-4 w-4" /> Time saved
                </div>
                <div className="mt-2 text-[26px] font-extrabold tracking-tight" style={{ fontFamily: mono }}>
                  {monthsSaved > 0 ? savedTimeLabel(monthsSaved) : "—"}
                </div>
              </div>
            </div>
          </div>

        {/* Step 1 — Goal */}
        <section id="goal" className="mb-8 scroll-mt-6">
          <AssistantBubble step="Step 1 · Your goal">
            How would you like to plan? You can give me a <strong>monthly budget</strong> you can spare, or pick a{" "}
            <strong>date</strong> you want to be debt-free by.
          </AssistantBubble>

          <div className="ml-0 mt-5 sm:ml-[60px]">
            <div className="flex flex-wrap gap-3">
              <GoalToggle
                active={goalMode === "budget"}
                onClick={() => setGoalMode("budget")}
                icon={Wallet}
                label="I have a monthly budget"
              />
              <GoalToggle
                active={goalMode === "date"}
                onClick={() => setGoalMode("date")}
                icon={CalendarClock}
                label="I have a target date"
              />
            </div>

            <div className="mt-5 rounded-[2rem] p-6 bento-shadow" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
              {goalMode === "budget" ? (
                <>
                  <label className="text-[14px] font-medium" style={{ color: C.text }}>
                    How much extra can you set aside each month?
                  </label>
                  <div className="mt-4 flex flex-wrap items-end gap-6">
                    <div className="text-[40px] font-bold leading-none" style={{ fontFamily: mono, color: C.indigo }}>
                      {inr(params.extraEMI)}
                      <span className="text-[18px]" style={{ color: C.muted }}>
                        /mo
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pb-1">
                      {[2000, 5000, 8000, 12000].map((b) => (
                        <Chip key={b} active={params.extraEMI === b} onClick={() => setBudget(b)}>
                          {inrCompact(b)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={sliderMax}
                    step={500}
                    value={Math.min(params.extraEMI, sliderMax)}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-5 w-full"
                    style={{ accentColor: C.indigo }}
                    aria-label="Extra monthly payment"
                  />
                  <div className="mt-2 flex justify-between text-[12px]" style={{ color: C.muted }}>
                    <span style={{ fontFamily: mono }}>₹0</span>
                    <span style={{ fontFamily: mono }}>{inrCompact(sliderMax)}</span>
                  </div>
                </>
              ) : (
                <>
                  <label className="text-[14px] font-medium" style={{ color: C.text }}>
                    When do you want to be debt-free?
                  </label>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {targetOptions.map((opt, i) => {
                      const active = targetSel === i;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => selectTarget(i)}
                          className="rounded-xl px-5 py-3 text-left transition-all"
                          style={{
                            background: active ? C.indigoSoft : "#fff",
                            border: `1.5px solid ${active ? C.indigo : C.border}`,
                          }}
                        >
                          <div className="text-[18px] font-bold" style={{ fontFamily: mono, color: active ? C.indigo : C.text }}>
                            {opt.label}
                          </div>
                          <div className="text-[12px]" style={{ color: C.muted }}>
                            in {opt.years} years
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {targetOptions.length > 0 && (
                    <p className="mt-4 text-[13px]" style={{ color: C.muted }}>
                      To hit{" "}
                      <strong>{targetOptions[safeTargetSel].label}</strong>, you'd need about{" "}
                      <strong style={{ color: C.indigo, fontFamily: mono }}>
                        {inr(targetOptions[safeTargetSel].extra)}/mo
                      </strong>{" "}
                      extra.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Step 2 — Strategy suggestions */}
        <section id="strategies" className="mb-8 scroll-mt-6">
          <AssistantBubble step="Step 2 · Pick an approach">
            Based on a <strong style={{ fontFamily: mono }}>{inr(params.extraEMI)}/mo</strong> budget, here are four ways to
            get there. I'd suggest the <strong>10% Monthly Boost</strong> — it fits neatly and saves the most for the
            effort.
          </AssistantBubble>

          <div className="ml-0 mt-5 grid grid-cols-1 gap-4 sm:ml-[60px] sm:grid-cols-2">
            {strategyCards.map((s) => (
              <StrategyCard
                key={s.id}
                icon={s.icon}
                title={s.title}
                desc={s.description}
                saveAmt={s.saved > 0 ? inrCompact(s.saved) : "—"}
                saveTime={s.mSaved > 0 ? savedTimeLabel(s.mSaved) : "—"}
                recommended={s.recommended}
                selected={activeStrategy === s.id}
                onClick={() => applyStrategy(s.id, s.res.extraEMI, s.res.yearlyLump)}
              />
            ))}
          </div>
        </section>

        {/* Step 3 — Your plan response */}
        <section id="plan" className="mb-8 scroll-mt-6">
          <AssistantBubble step="Step 3 · Your plan">
            {hasSavings ? (
              <>
                Here's what that does to your loan. You'll be{" "}
                <strong style={{ color: C.emerald }}>debt-free {savedTimeLabel(monthsSaved)} sooner</strong> and keep{" "}
                <strong style={{ color: C.emerald }}>{inrCompact(interestSaved)}</strong> in interest in your pocket.
              </>
            ) : (
              <>Add an extra monthly amount or pick a strategy above and I'll show you how much time and interest you'd save.</>
            )}
          </AssistantBubble>

          <div className="ml-0 mt-5 sm:ml-[60px]">
            {/* Hero outcome card */}
            <div className="overflow-hidden rounded-[2rem] bento-shadow" style={{ border: `1.5px solid ${C.emerald}`, background: "#fff" }}>
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ background: C.emeraldSoft, borderBottom: `1px solid #bbf7d0` }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" style={{ color: C.emerald }} />
                  <div>
                    <div className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: C.emerald }}>
                      New debt-free date
                    </div>
                    <div className="text-[28px] font-bold leading-tight" style={{ fontFamily: mono }}>
                      {debtFreeDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px]" style={{ color: C.muted }}>
                    was {baselineDebtFreeDate}
                  </div>
                  <div
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold text-white"
                    style={{ background: C.emerald }}
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                    {monthsSaved > 0 ? `${savedTimeLabel(monthsSaved)} earlier` : "no change yet"}
                  </div>
                </div>
              </div>

              {/* Plan stats grid */}
              <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
                <PlanStat
                  icon={Wallet}
                  label="Monthly EMI"
                  value={inr(plan.baseEMI)}
                  sub={params.extraEMI > 0 ? `+ ${inr(params.extraEMI)} extra` : "no extra yet"}
                  accent={C.indigo}
                />
                <PlanStat
                  icon={TrendingDown}
                  label="Interest saved"
                  value={inrCompact(interestSaved)}
                  sub={`of ${inrCompact(baseline.totalInterest)} baseline`}
                  accent={C.emerald}
                />
                <PlanStat
                  icon={Clock3}
                  label="Time saved"
                  value={savedTimeLabel(monthsSaved)}
                  sub={`${monthsSaved} months sooner`}
                  accent={C.amber}
                />
                <PlanStat
                  icon={Coins}
                  label="New total interest"
                  value={inrCompact(plan.totalInterest)}
                  sub={`net principal ${inrCompact(plan.totalPrincipalBorrowed)}`}
                  accent={C.rose}
                />
              </div>
            </div>

            {/* Projection */}
            <div className="mt-4 rounded-[2rem] p-6 bento-shadow" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold">Your payoff journey</div>
                  <div className="text-[13px]" style={{ color: C.muted }}>
                    Balance over time — standard vs your accelerated plan
                  </div>
                </div>
                <div className="flex items-center gap-5 text-[12px]">
                  <span className="flex items-center gap-2" style={{ color: C.muted }}>
                    <span className="inline-block h-0.5 w-5" style={{ borderTop: `2px dashed ${C.muted}` }} />
                    Standard
                  </span>
                  <span className="flex items-center gap-2" style={{ color: C.text }}>
                    <span className="inline-block h-1 w-5 rounded" style={{ background: C.emerald }} />
                    Your plan
                  </span>
                </div>
              </div>
              <div className="mt-5">
                <PayoffChart baseline={baseline} plan={plan} principal={params.principal} startMonth={params.startMonth} />
              </div>
            </div>

            {/* Comparison strip */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
                <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                  Standard plan
                </div>
                <div className="mt-3 space-y-2.5">
                  <CompareRow label="Total interest" value={inrCompact(baseline.totalInterest)} color={C.muted} />
                  <CompareRow label="Total paid" value={inrCompact(baseline.totalPaid)} color={C.muted} />
                  <CompareRow label="Debt-free" value={baselineDebtFreeDate} color={C.muted} />
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: C.border }}>
                  <div className="h-full rounded-full" style={{ width: "100%", background: C.muted }} />
                </div>
              </div>
              <div className="rounded-2xl p-5" style={{ background: C.emeraldSoft, border: `1.5px solid ${C.emerald}` }}>
                <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.emerald }}>
                  Your accelerated plan
                </div>
                <div className="mt-3 space-y-2.5">
                  <CompareRow label="Total interest" value={inrCompact(plan.totalInterest)} color={C.text} strong />
                  <CompareRow label="Total paid" value={inrCompact(plan.totalPaid)} color={C.text} strong />
                  <CompareRow label="Debt-free" value={debtFreeDate} color={C.text} strong />
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: "#bbf7d0" }}>
                  <div className="h-full rounded-full" style={{ width: `${accBarWidth}%`, background: C.emerald }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4 — schedule (collapsed) */}
        <section id="schedule" className="ml-0 scroll-mt-6 sm:ml-[60px]">
          <button
            onClick={() => setScheduleOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl px-6 py-4 transition-all"
            style={{ background: "#fff", border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.indigoSoft }}>
                <CalendarRange className="h-4 w-4" style={{ color: C.indigo }} />
              </div>
              <div className="text-left">
                <div className="text-[15px] font-semibold">View full repayment schedule</div>
                <div className="text-[13px]" style={{ color: C.muted }}>
                  Year-by-year breakdown of EMI, extra payments &amp; balance
                </div>
              </div>
            </div>
            {scheduleOpen ? (
              <ChevronDown className="h-5 w-5" style={{ color: C.muted }} />
            ) : (
              <ChevronRight className="h-5 w-5" style={{ color: C.muted }} />
            )}
          </button>

          {scheduleOpen && (
            <div className="mt-3 overflow-hidden rounded-2xl" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}` }}>
                      <th className="py-3 pl-5 pr-3 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                        Period
                      </th>
                      <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                        EMI paid
                      </th>
                      <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                        Extra
                      </th>
                      <th className="px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                        Interest
                      </th>
                      <th className="px-3 py-3 pr-5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.years.map((y) => (
                      <ScheduleRow
                        key={y.year}
                        year={y.year}
                        date={yearRange(params.startMonth, y.year, y.monthsInYear)}
                        emi={inr(y.emiPaid)}
                        extra={y.extraPaid > 0 ? `+${inr(y.extraPaid)}` : "—"}
                        interest={inr(y.interest)}
                        balance={inr(y.closing)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 text-[12px]" style={{ color: C.muted, background: "#f8fafc" }}>
                Year-by-year breakdown · loan fully repaid by{" "}
                <strong style={{ color: C.emerald }}>{debtFreeDate}</strong>
              </div>
            </div>
          )}
        </section>

        {/* Footer CTA */}
        <div className="ml-0 mt-8 flex flex-wrap items-center gap-3 sm:ml-[60px]">
          <div className="relative">
            <Button
              className="h-12 gap-2 rounded-xl px-6 text-[15px] font-semibold text-white hover:opacity-90"
              style={{ background: C.indigo }}
              onClick={() => setExportOpen((o) => !o)}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Lock in this plan
              <ArrowRight className="h-4 w-4" />
            </Button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                <div className="absolute bottom-full left-0 z-50 mb-2 w-60 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Save your plan
                  </p>
                  <button
                    onClick={() => {
                      exportPlannerCSV(exportMeta, baseline, plan);
                      setExportOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                    <span className="flex-1">Download Excel/CSV report</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">.csv</span>
                  </button>
                  <button
                    onClick={handlePDF}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4 text-rose-500" />
                    <span className="flex-1">Download PDF report</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">.pdf</span>
                  </button>
                  <button
                    onClick={exportJSON}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FileCode className="h-4 w-4 text-amber-500" />
                    <span className="flex-1">Download JSON data</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">.json</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <Button
            variant="outline"
            className="h-12 gap-2 rounded-xl px-5 text-[15px]"
            style={{ borderColor: C.border, color: C.text, background: "#fff" }}
            onClick={() => setAdjustOpen((o) => !o)}
          >
            <Pencil className="h-4 w-4" />
            Adjust loan details
          </Button>
        </div>

        {/* Adjust loan details (collapsible editor + file import) */}
        {adjustOpen && (
          <div className="ml-0 mt-4 rounded-2xl p-6 sm:ml-[60px]" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[15px] font-semibold">Loan details</div>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={resetAll}>
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Profile / borrower name</Label>
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="e.g. Home Loan" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Loan amount (₹)</Label>
                <Input
                  type="number"
                  value={params.principal}
                  onChange={(e) => setParams((p) => ({ ...p, principal: Math.max(0, Number(e.target.value)) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Interest rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={params.rate}
                  onChange={(e) => setParams((p) => ({ ...p, rate: Math.max(0, Number(e.target.value)) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tenure (years)</Label>
                <Input
                  type="number"
                  value={Math.round(params.tenureMonths / 12)}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, tenureMonths: Math.max(1, Math.round(Number(e.target.value) * 12)) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Start month</Label>
                <Input
                  type="month"
                  value={params.startMonth}
                  onChange={(e) => setParams((p) => ({ ...p, startMonth: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <FileUploadZone onExtracted={handleExtracted} />
              {draft && (
                <ExtractedReview
                  draft={draft}
                  onChange={setDraft}
                  onApply={applyDraft}
                  onDiscard={() => setDraft(null)}
                />
              )}
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
