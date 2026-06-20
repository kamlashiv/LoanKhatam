import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useGetDashboardSummary, useGetRecentLoans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, AlertCircle, CheckCircle2, Clock,
  Upload, FileText, X, Loader2, CheckCircle, AlertTriangle,
  HandCoins,
} from "lucide-react";
import { formatRupees, formatDate, getLoanStatusConfig } from "@/lib/loan-utils";
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
  high: "bg-emerald-100 text-emerald-800 border-emerald-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-red-100 text-red-800 border-red-300",
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
            <div className="border-2 border-red-300 border-dashed rounded-xl p-6 bg-red-50 text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Extraction failed</p>
                <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => setStatus("idle")}
              >
                Try again
              </Button>
            </div>
          )}

          {/* Success */}
          {status === "success" && data && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800 truncate">{fileName}</p>
                  {data.notes && <p className="text-xs text-emerald-600 line-clamp-2">{data.notes}</p>}
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
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <p className="text-xs text-amber-800">Confidence is low — please verify the details manually in the form</p>
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

export function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: recentLoans, isLoading: loansLoading } = useGetRecentLoans();
  const [showImport, setShowImport] = useState(false);

  const summaryCards = summary
    ? [
        {
          label: "Total Lent",
          caption: "Across your portfolio",
          value: formatRupees(summary.totalLent),
          icon: HandCoins,
          gradient: "from-emerald-500 to-teal-600",
        },
        {
          label: "Outstanding",
          caption: "Yet to be collected",
          value: formatRupees(summary.totalOutstanding),
          icon: Clock,
          gradient: "from-blue-500 to-indigo-600",
        },
        {
          label: "Collected",
          caption: "Repaid so far",
          value: formatRupees(summary.totalCollected),
          icon: CheckCircle2,
          gradient: "from-orange-500 to-red-500",
        },
        {
          label: "Overdue Loans",
          caption: summary.overdueLoans > 0 ? "Past their due date" : "All on track",
          value: summary.overdueLoans.toString(),
          icon: AlertCircle,
          gradient: summary.overdueLoans > 0 ? "from-rose-500 to-red-600" : "from-slate-500 to-slate-600",
        },
      ]
    : [];

  return (
    <>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your loan portfolio at a glance</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="gap-2 shadow-sm" onClick={() => setShowImport(true)}>
              <Upload className="h-4 w-4" />
              File Import
            </Button>
            <Link href="/loans/new">
              <Button className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                Add Loan
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-border shadow-sm">
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))
            : summaryCards.map((card) => (
                <div
                  key={card.label}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-md transition-shadow hover:shadow-lg`}
                >
                  <card.icon className="absolute -right-3 -bottom-3 h-24 w-24 text-white/10" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{card.label}</p>
                      <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                        <card.icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight">{card.value}</p>
                    <p className="mt-1 text-[11px] text-white/80">{card.caption}</p>
                  </div>
                </div>
              ))}
        </div>

        {/* Stats Row */}
        {summary && (
          <div className="flex gap-3 flex-wrap">
            <div className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{summary.totalLoans}</span>
              <span className="text-sm text-muted-foreground">Total Loans</span>
            </div>
            <div className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">{summary.activeLoans}</span>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="bg-card rounded-lg border border-border px-4 py-3 flex items-center gap-3">
              <span className="text-2xl font-bold text-emerald-700">{summary.paidLoans}</span>
              <span className="text-sm text-muted-foreground">Fully Paid</span>
            </div>
            <button
              onClick={() => setShowImport(true)}
              className="bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-2 transition-colors"
            >
              <Upload className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Import from File</span>
            </button>
          </div>
        )}

        {/* Recent Loans */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-bold">Recent Loans</CardTitle>
            <Link href="/loans">
              <Button variant="ghost" size="sm" className="text-primary font-medium">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loansLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentLoans && recentLoans.length > 0 ? (
              <div className="divide-y divide-border">
                {recentLoans.map((loan) => {
                  const statusConfig = getLoanStatusConfig(loan.status);
                  return (
                    <Link key={loan.id} href={`/loans/${loan.id}`}>
                      <div className="px-6 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer">
                        <div>
                          <p className="font-semibold text-foreground">{loan.borrowerName}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">Due {formatDate(loan.dueDate)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-foreground">{formatRupees(loan.principalAmount)}</p>
                            <p className="text-xs text-muted-foreground">{formatRupees(loan.remainingAmount)} remaining</p>
                          </div>
                          <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border font-medium text-xs`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-muted-foreground mb-4">No loans yet. Add your first loan to get started.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/loans/new">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add your first loan
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2" onClick={() => setShowImport(true)}>
                    <Upload className="h-4 w-4" />
                    Import from file
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
