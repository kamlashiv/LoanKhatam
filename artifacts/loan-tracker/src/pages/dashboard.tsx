import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useGetDashboardSummary, useGetRecentLoans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, AlertCircle, CheckCircle2, Clock,
  Upload, FileText, X, Loader2, CheckCircle, AlertTriangle,
  HandCoins, Wallet, Activity, ArrowUpRight, ArrowDownRight,
  PieChart, List, BellRing,
} from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatRupees, formatDate } from "@/lib/loan-utils";
import { STATUS_COLORS, CHART_COLORS } from "@/lib/chart-theme";
import { extractFromFile } from "@/lib/file-extract";

interface ExtractedLoan {
  borrowerName: string | null;
  principalAmount: number | null;
  interestRate: number | null;
  startDate: string | null;
  dueDate: string | null;
  description: string | null;
  confidence: "high" | "medium" | "low";
  notes: string;
}

type UploadStatus = "idle" | "loading" | "success" | "error";

const confStyle = {
  high: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  medium: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  low: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
};
const confLabel = { high: "✓ High", medium: "~ Medium", low: "⚠ Low" };

function ImportModal({ onClose }: { onClose: () => void }) {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState<ExtractedLoan | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus("loading");
    setErrorMsg("");
    setProgress(null);
    try {
      const extracted = await extractFromFile(file, (info) => {
        if (info.stage === "ocr" && info.percent != null) setProgress(info.percent);
      });
      setData(extracted);
      setStatus("success");
    } catch (e: any) {
      setErrorMsg(e.message ?? "Couldn't read the file");
      setStatus("error");
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleUseData = () => {
    if (!data) return;
    const params = new URLSearchParams();
    if (data.borrowerName) params.set("borrowerName", data.borrowerName);
    if (data.principalAmount) params.set("principalAmount", data.principalAmount.toString());
    if (data.interestRate) params.set("interestRate", data.interestRate.toString());
    if (data.startDate) params.set("startDate", data.startDate);
    if (data.dueDate) params.set("dueDate", data.dueDate);
    if (data.description) params.set("description", data.description);
    setLocation(`/loans/new?${params.toString()}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base">Import Loan from File</h2>
              <p className="text-xs text-muted-foreground">Amortization schedule, bank statement, CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close import dialog"
            className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Idle — upload zone */}
          {status === "idle" && (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  drag
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf,.json,.csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Upload or drag a file</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Loan data is read and filled in automatically
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {["📄 Amortization PDF", "🖼 Screenshot", "📊 CSV", "📋 JSON"].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                🔒 Data is read on your device only — it auto-fills the Add Loan form
              </p>
            </>
          )}

          {/* Loading */}
          {status === "loading" && (
            <div className="border-2 border-primary/30 border-dashed rounded-xl p-8 text-center bg-primary/5">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div>
                  <p className="font-semibold text-sm text-primary">
                    {progress != null ? `Reading file… ${progress}%` : "Reading file…"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{fileName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Extracting loan data from the document</p>
                </div>
                <div className="w-full bg-primary/20 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "65%" }} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="border-2 border-red-300 dark:border-red-800 border-dashed rounded-xl p-6 bg-red-50 dark:bg-red-950/30 text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300 text-sm">Extraction failed</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errorMsg}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50"
                onClick={() => setStatus("idle")}
              >
                Try again
              </Button>
            </div>
          )}

          {/* Success */}
          {status === "success" && data && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 truncate">{fileName}</p>
                  {data.notes && <p className="text-xs text-emerald-600 dark:text-emerald-400 line-clamp-2">{data.notes}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${confStyle[data.confidence]}`}>
                  {confLabel[data.confidence]}
                </span>
              </div>

              <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                {[
                  { label: "Borrower", value: data.borrowerName },
                  { label: "Principal", value: data.principalAmount ? `₹${data.principalAmount.toLocaleString("en-IN")}` : null },
                  { label: "Interest Rate", value: data.interestRate ? `${data.interestRate}% p.a.` : null },
                  { label: "Start Date", value: data.startDate },
                  { label: "Due Date", value: data.dueDate },
                  { label: "Description", value: data.description },
                ].filter(f => f.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-semibold text-foreground max-w-[60%] text-right truncate">{value}</span>
                  </div>
                ))}
              </div>

              {data.confidence === "low" && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">Confidence is low — please verify the details manually in the form</p>
                </div>
              )}

              <Button className="w-full gap-2" onClick={handleUseData}>
                <CheckCircle2 className="h-4 w-4" />
                Fill the Add Loan Form
              </Button>
              <button
                className="text-xs text-muted-foreground hover:text-foreground font-medium text-center w-full transition-colors"
                onClick={() => { setStatus("idle"); setData(null); setFileName(""); }}
              >
                Upload another file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const statusPill: Record<string, string> = {
  active: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  overdue: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
};
const statusLabel: Record<string, string> = {
  active: "Active",
  paid: "Paid",
  overdue: "Overdue",
};

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: recentLoans, isLoading: loansLoading } = useGetRecentLoans();
  const [showImport, setShowImport] = useState(false);

  const today = new Date().toLocaleDateString("en-GB");
  const overdue = summary?.overdueLoans ?? 0;

  const statusData = [
    { label: "Active", value: summary?.activeLoans ?? 0, color: STATUS_COLORS.active },
    { label: "Paid", value: summary?.paidLoans ?? 0, color: STATUS_COLORS.paid },
    { label: "Overdue", value: summary?.overdueLoans ?? 0, color: STATUS_COLORS.overdue },
  ];
  const statusTotal = statusData.reduce((sum, d) => sum + d.value, 0);
  const pieData =
    statusTotal > 0
      ? statusData.filter((d) => d.value > 0)
      : [{ label: "None", value: 1, color: CHART_COLORS.muted }];

  const insight = summaryLoading
    ? null
    : overdue > 0
      ? {
          icon: AlertCircle,
          title: "Needs your attention",
          text: `${overdue} ${overdue === 1 ? "loan is" : "loans are"} overdue. Follow up soon to keep your collections on track.`,
          bg: "bg-rose-50 dark:bg-rose-950/30",
          border: "border-rose-100 dark:border-rose-900/50",
          iconBg: "bg-rose-100 dark:bg-rose-900/40",
          iconText: "text-rose-600 dark:text-rose-400",
          titleColor: "text-rose-900 dark:text-rose-200",
          bodyColor: "text-rose-700/80 dark:text-rose-300/80",
        }
      : (summary?.totalLoans ?? 0) === 0
        ? {
            icon: Wallet,
            title: "Welcome to Ledger",
            text: "Add your first loan to start tracking repayments, balances, and due dates.",
            bg: "bg-indigo-50 dark:bg-indigo-950/30",
            border: "border-indigo-100 dark:border-indigo-900/50",
            iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
            iconText: "text-indigo-600 dark:text-indigo-400",
            titleColor: "text-indigo-900 dark:text-indigo-200",
            bodyColor: "text-indigo-700/80 dark:text-indigo-300/80",
          }
        : {
            icon: CheckCircle,
            title: "You're on track",
            text: `No overdue loans. ${formatRupees(summary?.totalOutstanding ?? 0)} still to be collected across ${summary?.activeLoans ?? 0} active ${(summary?.activeLoans ?? 0) === 1 ? "loan" : "loans"}.`,
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
            border: "border-emerald-100 dark:border-emerald-900/50",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
            iconText: "text-emerald-600 dark:text-emerald-400",
            titleColor: "text-emerald-900 dark:text-emerald-200",
            bodyColor: "text-emerald-700/80 dark:text-emerald-300/80",
          };

  return (
    <>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      {/* Header */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
            Portfolio Overview
          </h1>
          <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">As of {today}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/60"
            onClick={() => setShowImport(true)}
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <Button
            asChild
            className="gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
          >
            <Link href="/loans/new">
              <Plus className="h-4 w-4" />
              New Loan
            </Link>
          </Button>
        </div>
      </header>

      {/* Insight message */}
      {insight && (
        <div
          className={`mb-6 flex items-start gap-4 rounded-[1.5rem] border p-5 ${insight.bg} ${insight.border}`}
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${insight.iconBg}`}
          >
            <insight.icon className={`h-5 w-5 ${insight.iconText}`} />
          </div>
          <div>
            <p className={`font-bold ${insight.titleColor}`}>{insight.title}</p>
            <p className={`mt-0.5 text-sm font-medium ${insight.bodyColor}`}>{insight.text}</p>
          </div>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid auto-rows-[minmax(160px,auto)] grid-cols-1 gap-5 md:grid-cols-4">
        {/* Total Lent — large */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 to-indigo-950 p-8 text-white bento-shadow bento-hover md:col-span-2">
          <div className="pointer-events-none absolute right-0 top-0 p-8 opacity-10">
            <Wallet className="h-32 w-32" />
          </div>
          <div className="z-10 flex items-center gap-3 font-semibold text-indigo-200">
            <HandCoins className="h-5 w-5" /> Total Lent
          </div>
          <div className="z-10">
            {summaryLoading ? (
              <Skeleton className="h-12 w-48 bg-white dark:bg-slate-900/20" />
            ) : (
              <div className="mb-1 text-4xl font-extrabold tracking-tight md:text-5xl">
                {formatRupees(summary?.totalLent ?? 0)}
              </div>
            )}
            <div className="flex items-center gap-2 font-medium text-indigo-200">
              <Activity className="h-4 w-4" /> Across {summary?.totalLoans ?? 0} total loans
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <div className="flex flex-col justify-between rounded-[2rem] bg-gradient-to-b from-blue-400 to-indigo-500 p-6 text-white bento-shadow bento-hover">
          <div className="flex items-center justify-between font-semibold text-blue-100">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Outstanding</span>
            <ArrowUpRight className="h-4 w-4 text-blue-200" />
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">
              {summaryLoading ? "—" : formatRupees(summary?.totalOutstanding ?? 0)}
            </div>
            <div className="mt-1 text-sm font-medium text-blue-100/80">To be collected</div>
          </div>
        </div>

        {/* Collected */}
        <div className="flex flex-col justify-between rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-500 p-6 text-white bento-shadow bento-hover">
          <div className="flex items-center justify-between font-semibold text-emerald-100">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Collected</span>
            <ArrowDownRight className="h-4 w-4 text-emerald-200" />
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">
              {summaryLoading ? "—" : formatRupees(summary?.totalCollected ?? 0)}
            </div>
            <div className="mt-1 text-sm font-medium text-emerald-100/80">Safely returned</div>
          </div>
        </div>

        {/* Overdue alert */}
        <div
          className={`relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-6 text-white bento-shadow bento-hover ${
            overdue > 0 ? "bg-rose-500" : "bg-slate-600"
          }`}
        >
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white dark:bg-slate-900/10 blur-2xl" />
          <div className="flex items-center gap-2 font-bold text-rose-100">
            <BellRing className={`h-5 w-5 ${overdue > 0 ? "animate-pulse" : ""}`} />
            {overdue > 0 ? "Urgent Attention" : "All Clear"}
          </div>
          <div>
            <div className="text-5xl font-extrabold">{overdue}</div>
            <div className="mt-1 font-semibold text-rose-100">
              {overdue === 1 ? "Loan Overdue" : "Loans Overdue"}
            </div>
          </div>
        </div>

        {/* Loan status mix */}
        <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 bento-shadow bento-hover">
          <div className="flex items-center gap-2 font-bold text-slate-500 dark:text-slate-400">
            <PieChart className="h-4 w-4" /> Loan Status Mix
          </div>
          <div className="flex items-center gap-4">
            {summaryLoading ? (
              <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
            ) : (
              <div
                className="relative h-24 w-24 shrink-0"
                role="img"
                aria-label={`Loan status mix: ${statusData
                  .map((d) => `${d.value} ${d.label.toLowerCase()}`)
                  .join(", ")}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={32}
                      outerRadius={46}
                      paddingAngle={statusTotal > 0 ? 3 : 0}
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive={false}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.label} fill={d.color} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold leading-none text-slate-900 dark:text-slate-100">
                    {statusTotal}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Loans
                  </span>
                </div>
              </div>
            )}
            <div className="flex-1 space-y-2">
              {statusData.map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />{" "}
                    {row.label}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {summaryLoading ? "—" : row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent loans — large */}
        <div className="flex flex-col rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 bento-shadow md:col-span-2 md:row-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
              <List className="h-5 w-5 text-slate-400 dark:text-slate-500" /> Recent Loans
            </h3>
            <Link href="/loans" className="text-sm font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="-mr-2 flex-1 space-y-4 overflow-y-auto pr-2">
            {loansLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : recentLoans && recentLoans.length > 0 ? (
              recentLoans.map((loan) => (
                <Link key={loan.id} href={`/loans/${loan.id}`} className="block">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/50 font-bold text-indigo-700 dark:text-indigo-300">
                        {loan.borrowerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-slate-900 dark:text-slate-100">{loan.borrowerName}</div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {loan.dueDate ? `Due ${formatDate(loan.dueDate)} • ` : ""}{loan.interestRate}% rate
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{formatRupees(loan.principalAmount)}</div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {formatRupees(loan.remainingAmount)} left
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          statusPill[loan.status] ?? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {statusLabel[loan.status] ?? loan.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                <p className="font-medium text-slate-500 dark:text-slate-400">No loans yet. Add your first loan to get started.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild className="gap-2 rounded-xl">
                    <Link href="/loans/new">
                      <Plus className="h-4 w-4" />
                      Add your first loan
                    </Link>
                  </Button>
                  <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setShowImport(true)}>
                    <Upload className="h-4 w-4" />
                    Import from file
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick action — drop statements */}
        <button
          onClick={() => setShowImport(true)}
          className="group flex items-center justify-center rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/30 p-6 text-center bento-hover md:col-span-2"
        >
          <div>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110">
              <Upload className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">Drop statements here</h4>
            <p className="mt-1 text-sm font-medium text-indigo-600/70 dark:text-indigo-300/70">
              PDF, CSV, or screenshots to auto-import
            </p>
          </div>
        </button>
      </div>
    </>
  );
}
