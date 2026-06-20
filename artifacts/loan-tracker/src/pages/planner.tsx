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
} from "lucide-react";
import { formatRupees } from "@/lib/loan-utils";
import { useAuth } from "@clerk/react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface LoanParams {
  principal: number;
  rate: number;
  tenureMonths: number;
  startMonth: string;
  extraEMI: number;
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

// ─── Math helpers ───────────────────────────────────────────────────────────
function calcEMI(principal: number, annualRate: number, months: number) {
  if (months <= 0 || principal <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

function r2(n: number) { return Math.round(n * 100) / 100; }

interface SchedulePoint {
  label: string;
  standard: number;
  accelerated: number;
  standardInterestPaid: number;
  acceleratedInterestPaid: number;
}

function buildSchedules(params: LoanParams): {
  schedule: SchedulePoint[];
  stdMonths: number;
  accMonths: number;
  stdTotalInterest: number;
  accTotalInterest: number;
  stdEMI: number;
  accEMI: number;
} {
  const { principal, rate, tenureMonths, extraEMI } = params;
  const r = rate / 12 / 100;
  const stdEMI = r2(calcEMI(principal, rate, tenureMonths));
  const accPayment = stdEMI + extraEMI;

  // build yearly snapshots
  const points: SchedulePoint[] = [];
  let stdBal = principal, accBal = principal;
  let stdIntPaid = 0, accIntPaid = 0;
  let stdDone = false, accDone = false;
  let stdMonths = tenureMonths, accMonths = tenureMonths;

  const maxYears = Math.ceil(tenureMonths / 12) + 1;

  for (let yr = 0; yr <= maxYears; yr++) {
    points.push({
      label: yr === 0 ? "Start" : `Year ${yr}`,
      standard: r2(Math.max(0, stdBal)),
      accelerated: r2(Math.max(0, accBal)),
      standardInterestPaid: r2(stdIntPaid),
      acceleratedInterestPaid: r2(accIntPaid),
    });

    // simulate 12 months
    for (let m = 0; m < 12; m++) {
      if (!stdDone && stdBal > 0) {
        const intC = stdBal * r;
        const prinC = Math.min(stdBal, stdEMI - intC);
        stdIntPaid += intC;
        stdBal = Math.max(0, stdBal - prinC);
        stdMonths = yr * 12 + m + 1;
        if (stdBal <= 0) { stdDone = true; stdMonths = yr * 12 + m + 1; }
      }
      if (!accDone && accBal > 0) {
        const intC = accBal * r;
        const emi = Math.min(accPayment, accBal + intC);
        const prinC = Math.min(accBal, emi - intC);
        accIntPaid += intC;
        accBal = Math.max(0, accBal - prinC);
        if (accBal <= 0) { accDone = true; accMonths = yr * 12 + m + 1; }
      }
    }
    if (stdDone && accDone) break;
  }

  return {
    schedule: points,
    stdMonths: stdDone ? stdMonths : tenureMonths,
    accMonths: accDone ? accMonths : tenureMonths,
    stdTotalInterest: r2(stdIntPaid),
    accTotalInterest: r2(accIntPaid),
    stdEMI,
    accEMI: r2(accPayment),
  };
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
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
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
      setExtractedData(json.data);
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

  const confidenceColor = {
    high: "bg-emerald-100 text-emerald-800 border-emerald-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    low: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div className="space-y-3">
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
            <p className="text-sm font-semibold text-emerald-800">Data निकाल लिया!</p>
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

      {status === "success" && extractedData && (
        <div className="bg-slate-50 border border-border rounded-lg p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Extracted Data</span>
            <Badge className={`${confidenceColor[extractedData.confidence]} border text-xs`}>
              Confidence: {extractedData.confidence}
            </Badge>
          </div>
          {extractedData.notes && (
            <p className="text-muted-foreground italic">{extractedData.notes}</p>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {extractedData.principalAmount && <span>💰 ₹{extractedData.principalAmount.toLocaleString("en-IN")}</span>}
            {extractedData.interestRate && <span>📈 {extractedData.interestRate}% p.a.</span>}
            {extractedData.startDate && <span>📅 Start: {extractedData.startDate}</span>}
            {extractedData.dueDate && <span>📅 Due: {extractedData.dueDate}</span>}
            {extractedData.borrowerName && <span className="col-span-2">👤 {extractedData.borrowerName}</span>}
          </div>
          <button
            className="text-xs text-primary font-medium hover:underline mt-1"
            onClick={(e) => { e.stopPropagation(); setStatus("idle"); setExtractedData(null); }}
          >
            दूसरी file upload करें
          </button>
        </div>
      )}
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

  const [view, setView] = useState<"balance" | "interest">("balance");

  const set = (k: keyof LoanParams, v: number | string) =>
    setParams((p) => ({ ...p, [k]: v }));

  const handleExtracted = useCallback((data: ExtractedData) => {
    const updates: Partial<LoanParams> = {};
    if (data.principalAmount) updates.principal = data.principalAmount;
    if (data.interestRate) updates.rate = data.interestRate;
    if (data.startDate && data.dueDate) {
      const s = new Date(data.startDate);
      const e = new Date(data.dueDate);
      const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
      if (months > 0) updates.tenureMonths = months;
    }
    if (data.startDate) updates.startMonth = data.startDate.slice(0, 7);
    setParams((p) => ({ ...p, ...updates }));
  }, []);

  const result = useMemo(() => buildSchedules(params), [params]);

  const monthsSaved = result.stdMonths - result.accMonths;
  const interestSaved = result.stdTotalInterest - result.accTotalInterest;

  const pieStandard = [
    { name: "मूलधन", value: params.principal, color: "#1d5c42" },
    { name: "कुल ब्याज", value: result.stdTotalInterest, color: "#f59e0b" },
  ];
  const pieAccelerated = [
    { name: "मूलधन", value: params.principal, color: "#1d5c42" },
    { name: "कुल ब्याज", value: result.accTotalInterest, color: "#34d399" },
    ...(interestSaved > 0 ? [{ name: "बचत", value: interestSaved, color: "#e5e7eb" }] : []),
  ];

  const chartData = result.schedule.map((pt) => ({
    label: pt.label,
    "Standard EMI": view === "balance" ? pt.standard : pt.standardInterestPaid,
    "Extra Payment": view === "balance" ? pt.accelerated : pt.acceleratedInterestPaid,
  }));

  const tenureYears = Math.round(params.tenureMonths / 12 * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Loan Payoff Planner</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          देखें कि extra payment से कितना ब्याज बचेगा — या file upload करके loan data import करें
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Panel: Inputs ── */}
        <div className="space-y-5">
          {/* File upload */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                File से Import करें
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <FileUploadZone onExtracted={handleExtracted} />
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
                  <span>₹1L</span><span>₹2.5Cr</span>
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
                  max={Math.round(result.stdEMI)}
                  step={500}
                  value={[params.extraEMI]}
                  onValueChange={([v]) => set("extraEMI", v)}
                  className="[&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-emerald-500"
                />
                <p className="text-xs text-muted-foreground">
                  Standard EMI: <span className="font-medium text-foreground">{formatRupees(result.stdEMI)}</span>/month
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => setParams({ principal: 2500000, rate: 8.5, tenureMonths: 240, startMonth: new Date().toISOString().slice(0, 7), extraEMI: 0 })}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Panel: Charts & Results ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Comparison header */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border shadow-sm">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground">Standard Contract</p>
                <p className="text-base font-bold mt-1">{formatRupees(params.principal + result.stdTotalInterest)}</p>
                <p className="text-xs text-muted-foreground">Interest: {formatRupees(result.stdTotalInterest)}</p>
                <Badge className="mt-2 bg-slate-100 text-slate-700 border-slate-300 border text-xs">
                  {monthsToStr(result.stdMonths)}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-emerald-700 font-medium">Accelerated Plan</p>
                <p className="text-base font-bold mt-1 text-emerald-800">
                  {formatRupees(params.principal + result.accTotalInterest)}
                </p>
                <p className="text-xs text-emerald-700">Interest: {formatRupees(result.accTotalInterest)}</p>
                <Badge className="mt-2 bg-emerald-200 text-emerald-800 border-emerald-400 border text-xs">
                  {monthsToStr(result.accMonths)}
                </Badge>
              </CardContent>
            </Card>

            <Card className={`shadow-sm ${interestSaved > 0 ? "border-amber-200 bg-amber-50" : "border-border"}`}>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-amber-700 font-medium">बचत</p>
                <p className={`text-base font-bold mt-1 ${interestSaved > 0 ? "text-amber-800" : "text-muted-foreground"}`}>
                  {interestSaved > 0 ? formatRupees(interestSaved) : "₹0"}
                </p>
                <p className="text-xs text-amber-700">Interest saved</p>
                <Badge className={`mt-2 text-xs border ${interestSaved > 0 ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-muted text-muted-foreground border-border"}`}>
                  {monthsSaved > 0 ? `${monthsSaved} महीने जल्दी` : "Same tenure"}
                </Badge>
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
                  सिर्फ {formatRupees(params.extraEMI)}/month extra देकर
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
                  Total: <span className="font-semibold text-foreground">{formatRupees(params.principal + result.stdTotalInterest)}</span>
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
                  Total: <span className="font-semibold text-emerald-700">{formatRupees(params.principal + result.accTotalInterest)}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Road map */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Road to Zero Debt
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative">
                {/* track */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4 pl-10">
                  {[
                    {
                      pct: 0,
                      label: "Loan शुरू",
                      sub: `${formatRupees(params.principal)} borrowed`,
                      color: "bg-slate-400",
                    },
                    {
                      pct: 25,
                      label: "25% चुकाया",
                      sub: `${formatRupees(params.principal * 0.25)} principal repaid`,
                      color: "bg-amber-400",
                    },
                    {
                      pct: 50,
                      label: "Halfway!",
                      sub: `${formatRupees(params.principal * 0.5)} remaining`,
                      color: "bg-amber-500",
                    },
                    {
                      pct: 75,
                      label: "75% Done",
                      sub: `Almost there — ${formatRupees(params.principal * 0.25)} left`,
                      color: "bg-emerald-500",
                    },
                    {
                      pct: 100,
                      label: "🎉 Debt Free!",
                      sub: params.extraEMI > 0
                        ? `${monthsToStr(result.accMonths)} में — ${monthsSaved > 0 ? `${monthsSaved} महीने जल्दी` : "standard time"}`
                        : `${monthsToStr(result.stdMonths)} में`,
                      color: params.extraEMI > 0 ? "bg-primary" : "bg-slate-500",
                    },
                  ].map((step, i) => {
                    const monthsAtPct = params.extraEMI > 0
                      ? Math.round((step.pct / 100) * result.accMonths)
                      : Math.round((step.pct / 100) * result.stdMonths);
                    const yrs = Math.floor(monthsAtPct / 12);
                    const mos = monthsAtPct % 12;
                    const timeLabel = monthsAtPct === 0 ? "Day 1" : yrs > 0 ? `${yrs}y ${mos}m` : `${mos}m`;

                    return (
                      <div key={i} className="relative flex items-start gap-3">
                        <div className={`absolute -left-[34px] mt-0.5 h-4 w-4 rounded-full ${step.color} border-2 border-white shadow-sm`} />
                        <div className="flex-1 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">{step.label}</p>
                            <p className="text-xs text-muted-foreground">{step.sub}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">{timeLabel}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

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
