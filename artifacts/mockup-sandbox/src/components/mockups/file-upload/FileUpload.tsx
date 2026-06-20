import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";
type Confidence = "high" | "medium" | "low";

interface ExtractedData {
  borrowerName: string | null;
  principalAmount: number | null;
  interestRate: number | null;
  startDate: string | null;
  dueDate: string | null;
  description: string | null;
  confidence: Confidence;
  notes: string;
}

const MOCK_DATA: ExtractedData = {
  borrowerName: "Rajesh Kumar",
  principalAmount: 250000,
  interestRate: 12.5,
  startDate: "2025-01-15",
  dueDate: "2026-01-15",
  description: "Home renovation loan",
  confidence: "high",
  notes: "Extracted from bank statement header. All fields clearly visible.",
};

const MOCK_LOW: ExtractedData = {
  borrowerName: null,
  principalAmount: 50000,
  interestRate: null,
  startDate: "2024-03-01",
  dueDate: null,
  description: null,
  confidence: "low",
  notes: "Partial data — interest rate and due date not found in document.",
};

const confidenceStyle: Record<Confidence, string> = {
  high: "bg-emerald-100 text-emerald-800 border-emerald-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-red-100 text-red-800 border-red-300",
};

const confidenceLabel: Record<Confidence, string> = {
  high: "✓ High Confidence",
  medium: "~ Medium Confidence",
  low: "⚠ Low Confidence",
};

function FieldRow({ label, value }: { label: string; value: string | number | null }) {
  if (value === null) return null;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function UploadZone({
  onFile,
  disabled,
}: {
  onFile: (f: File) => void;
  disabled: boolean;
}) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer select-none transition-all ${
        disabled
          ? "opacity-40 cursor-not-allowed border-slate-200"
          : drag
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
      }`}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (!disabled && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      }}
      onClick={() => !disabled && ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.pdf,.json,.csv"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-sm">
          <Upload className="h-7 w-7 text-emerald-700" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">
            File upload करें या यहाँ खींचें
          </p>
          <p className="text-sm text-slate-500 mt-1">
            PNG • JPG • PDF • JSON • CSV
          </p>
          <p className="text-xs text-slate-400 mt-2">
            AI document से loan data निकालेगा — कोई गलती नहीं
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center mt-1">
          {["📄 Bank Statement", "🖼 Screenshot", "📊 CSV", "📋 JSON"].map((t) => (
            <span key={t} className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ fileName }: { fileName: string }) {
  return (
    <div className="border-2 border-emerald-300 border-dashed rounded-xl p-8 text-center bg-emerald-50">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
          <FileText className="h-5 w-5 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <p className="font-semibold text-emerald-800">AI extract कर रहा है…</p>
          <p className="text-sm text-emerald-600 mt-1">{fileName}</p>
          <p className="text-xs text-emerald-500 mt-2">Document पढ़ रहा है, loan data निकाल रहा है</p>
        </div>
        <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

function SuccessState({
  data,
  fileName,
  onReset,
}: {
  data: ExtractedData;
  fileName: string;
  onReset: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="border-2 border-emerald-400 rounded-xl p-4 bg-emerald-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-800">Data निकाल लिया!</p>
            <p className="text-sm text-emerald-600 truncate">{fileName}</p>
          </div>
          <button
            onClick={onReset}
            className="text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-800">Extracted Fields</span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${confidenceStyle[data.confidence]}`}>
            {confidenceLabel[data.confidence]}
          </span>
        </div>
        {data.notes && (
          <p className="text-xs text-slate-500 italic mb-3 leading-relaxed">{data.notes}</p>
        )}
        <div className="space-y-0">
          <FieldRow label="Borrower" value={data.borrowerName} />
          <FieldRow
            label="Principal"
            value={data.principalAmount ? `₹${data.principalAmount.toLocaleString("en-IN")}` : null}
          />
          <FieldRow label="Rate" value={data.interestRate ? `${data.interestRate}% p.a.` : null} />
          <FieldRow label="Start Date" value={data.startDate} />
          <FieldRow label="Due Date" value={data.dueDate} />
          {data.description && <FieldRow label="Description" value={data.description} />}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors">
            Form में Auto-Fill करें
          </button>
        </div>
      </div>

      <button
        onClick={onReset}
        className="text-xs text-slate-500 hover:text-slate-700 font-medium text-center w-full transition-colors"
      >
        दूसरी file upload करें
      </button>
    </div>
  );
}

function ErrorState({ msg, onReset }: { msg: string; onReset: () => void }) {
  return (
    <div className="border-2 border-red-300 border-dashed rounded-xl p-6 bg-red-50">
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <div>
          <p className="font-semibold text-red-800">Error आया</p>
          <p className="text-sm text-red-600 mt-1">{msg}</p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          फिर कोशिश करें
        </button>
      </div>
    </div>
  );
}

export function FileUpload() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState<ExtractedData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [useHighConf, setUseHighConf] = useState(true);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setStatus("loading");

    setTimeout(() => {
      if (file.name.includes("error")) {
        setErrorMsg("Document unclear — kripya dobara upload karein");
        setStatus("error");
      } else {
        setData(useHighConf ? MOCK_DATA : MOCK_LOW);
        setStatus("success");
      }
    }, 2200);
  }, [useHighConf]);

  const reset = () => {
    setStatus("idle");
    setData(null);
    setErrorMsg("");
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Document से Import</h2>
          <p className="text-sm text-slate-500 mt-1">Bank statement, screenshot या CSV upload करें</p>
        </div>

        {/* Demo toggle */}
        <div className="flex gap-2 p-1 bg-slate-200 rounded-lg">
          <button
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${useHighConf ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
            onClick={() => setUseHighConf(true)}
          >
            High Confidence
          </button>
          <button
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${!useHighConf ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
            onClick={() => setUseHighConf(false)}
          >
            Low Confidence
          </button>
        </div>

        {status === "idle" && <UploadZone onFile={handleFile} disabled={false} />}
        {status === "loading" && <LoadingState fileName={fileName} />}
        {status === "success" && data && (
          <SuccessState data={data} fileName={fileName} onReset={reset} />
        )}
        {status === "error" && <ErrorState msg={errorMsg} onReset={reset} />}

        {status === "idle" && (
          <p className="text-center text-xs text-slate-400">
            🔒 Data secure है — AI extract करके सीधे form fill होगा
          </p>
        )}
      </div>
    </div>
  );
}
