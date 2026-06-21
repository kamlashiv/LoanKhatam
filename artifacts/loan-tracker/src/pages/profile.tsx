import { useCallback, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  UserCircle, Wallet, Receipt, ShoppingBag, Landmark, Target, Gauge,
  RefreshCw, Sparkles, TrendingUp, FileText, Upload, X, Loader2,
  CheckCircle, CheckCircle2, AlertTriangle, AlertCircle, Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { averageMonths, type MonthState } from "@/lib/month-breakdown";
import { formatRupees } from "@/lib/loan-utils";
import { GOAL_OPTIONS, type RiskProfile } from "@/lib/strategy-engine";
import {
  useProfile, EMPTY_PROFILE, type ProfileData,
  totalIncome, totalFixedExpenses, totalVariableExpenses, monthlySurplus,
  profileCompleteness,
} from "@/lib/profile";
import { useDerivedLoans } from "@/lib/loan-derive";
import { SaveIndicator } from "@/components/save-indicator";
import {
  extractProfileFromFile, PROFILE_FIELD_LABELS,
  type ExtractedProfile, type ExtractedProfileFields, type ExpenseMonth,
  type ExpenseKey,
} from "@/lib/file-extract";

type UploadStatus = "idle" | "loading" | "success" | "error";

// "YYYY-MM" → short month label, with the year appended only when the
// breakdown straddles more than one calendar year (so "Jan" stays "Jan" but a
// Dec-2025/Jan-2026 split reads "Dec '25" / "Jan '26").
function monthLabel(month: string, withYear: boolean): string {
  const [y, m] = month.split("-");
  const idx = Number(m) - 1;
  const name = MONTH_NAMES[idx] ?? month;
  return withYear ? `${name} '${y.slice(2)}` : name;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Shows the per-month totals that were averaged into a category's figure, so
// the user can spot an off month (e.g. a one-off purchase) before applying.
// Each month can be edited or excluded, and the category's value recomputes
// from the kept months.
function MonthBreakdown({
  fieldKey,
  months,
  state,
  disabled,
  onEditMonth,
  onToggleMonth,
}: {
  fieldKey: ExpenseKey;
  months: ExpenseMonth[];
  state: Record<string, MonthState>;
  disabled: boolean;
  onEditMonth: (key: ExpenseKey, month: string, value: string) => void;
  onToggleMonth: (key: ExpenseKey, month: string) => void;
}) {
  const multiYear = new Set(months.map((m) => m.month.slice(0, 4))).size > 1;
  const keptCount = months.filter((m) => !state[m.month]?.excluded).length;
  return (
    <div className="mt-1.5 ml-7 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="text-[11px] text-muted-foreground/70">
        Avg of {keptCount} {keptCount === 1 ? "month" : "months"}:
      </span>
      {months.map((m) => {
        const st = state[m.month] ?? { value: String(m.total), excluded: false };
        const label = monthLabel(m.month, multiYear);
        return (
          <span
            key={m.month}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] tabular-nums",
              st.excluded ? "border-dashed border-border/60 opacity-50" : "border-border",
            )}
          >
            <span className="text-muted-foreground/80">₹</span>
            <input
              type="number"
              inputMode="numeric"
              value={st.value}
              disabled={disabled || st.excluded}
              onChange={(e) => onEditMonth(fieldKey, m.month, e.target.value)}
              aria-label={`${PROFILE_FIELD_LABELS[fieldKey]} amount for ${label}`}
              className={cn(
                "w-12 bg-transparent text-right font-medium text-foreground/80 outline-none",
                st.excluded && "line-through",
              )}
            />
            <span className="text-muted-foreground">{label}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onToggleMonth(fieldKey, m.month)}
              aria-label={`${st.excluded ? "Include" : "Exclude"} ${label}`}
              title={st.excluded ? "Include this month" : "Exclude this month"}
              className="text-muted-foreground/60 transition-colors hover:text-foreground disabled:opacity-40"
            >
              {st.excluded ? <Undo2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </button>
          </span>
        );
      })}
    </div>
  );
}

const confStyle = {
  high: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  medium: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  low: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
};
const confLabel = { high: "✓ High", medium: "~ Medium", low: "⚠ Low" };

// Fields the extractor returns, in display order. `name` is shown but the rest
// are money values rendered in rupees.
const PROFILE_FIELD_ORDER = Object.keys(PROFILE_FIELD_LABELS) as (keyof ExtractedProfileFields)[];

export function ImportProfileModal({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (patch: Partial<ProfileData>) => void;
}) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState<ExtractedProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  // Per-field state for the review card: which extracted fields are checked to
  // apply, and the (editable) string value for each. Both keyed by field name.
  const [enabled, setEnabled] = useState<
    Partial<Record<keyof ExtractedProfileFields, boolean>>
  >({});
  const [edits, setEdits] = useState<
    Partial<Record<keyof ExtractedProfileFields, string>>
  >({});
  // Per-month state for averaged categories, so the user can edit or exclude an
  // off month and have the category's average recompute. Keyed by category, then
  // by "YYYY-MM".
  const [monthEdits, setMonthEdits] = useState<
    Partial<Record<ExpenseKey, Record<string, MonthState>>>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus("loading");
    setErrorMsg("");
    setProgress(null);
    try {
      const extracted = await extractProfileFromFile(file, (info) => {
        if (info.stage === "ocr" && info.percent != null) setProgress(info.percent);
      });
      // Seed per-field selection (all on by default) and editable values from
      // the non-empty extracted fields.
      const en: Partial<Record<keyof ExtractedProfileFields, boolean>> = {};
      const ed: Partial<Record<keyof ExtractedProfileFields, string>> = {};
      for (const key of PROFILE_FIELD_ORDER) {
        const v = extracted[key];
        if (v == null || v === "") continue;
        en[key] = true;
        ed[key] = String(v);
      }
      // Seed per-month state from the breakdown so the chips are editable and
      // start unchanged (no month excluded).
      const me: Partial<Record<ExpenseKey, Record<string, MonthState>>> = {};
      for (const [k, months] of Object.entries(extracted.breakdown)) {
        if (!months) continue;
        const rec: Record<string, MonthState> = {};
        for (const m of months) rec[m.month] = { value: String(m.total), excluded: false };
        me[k as ExpenseKey] = rec;
      }
      setEnabled(en);
      setEdits(ed);
      setMonthEdits(me);
      setData(extracted);
      setStatus("success");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Couldn't read the file");
      setStatus("error");
    }
  }, []);

  const resetUpload = () => {
    setStatus("idle");
    setData(null);
    setFileName("");
    setEnabled({});
    setEdits({});
    setMonthEdits({});
  };

  // Apply a per-month mutation for a category and recompute that category's
  // averaged value into `edits` so the row's final figure and what gets applied
  // both stay in sync with the kept months. Uses functional updaters so rapid
  // sequential edits/toggles never clobber each other (no stale-closure reads).
  const mutateMonth = (
    key: ExpenseKey,
    month: string,
    mutate: (cur: MonthState) => MonthState,
  ) => {
    setMonthEdits((prev) => {
      const rec = { ...(prev[key] ?? {}) };
      const cur = rec[month] ?? { value: "", excluded: false };
      rec[month] = mutate(cur);
      const avg = averageMonths(rec);
      setEdits((e) => ({ ...e, [key]: avg == null ? "" : String(avg) }));
      return { ...prev, [key]: rec };
    });
  };

  const editMonth = (key: ExpenseKey, month: string, value: string) =>
    mutateMonth(key, month, (cur) => ({ ...cur, value }));

  const toggleMonth = (key: ExpenseKey, month: string) =>
    mutateMonth(key, month, (cur) => ({ ...cur, excluded: !cur.excluded }));

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // Build a profile patch from only the checked fields, using the (possibly
  // edited) values. Unchecked fields are omitted so the existing profile keeps
  // its value. Nothing is saved until the user clicks confirm.
  const handleApply = () => {
    if (!data) return;
    const patch: Partial<ProfileData> = {};
    for (const key of reviewKeys) {
      if (!enabled[key]) continue;
      const raw = (edits[key] ?? "").trim();
      if (raw === "") continue;
      if (key === "name") {
        patch.name = raw;
      } else {
        const n = Number(raw);
        if (Number.isFinite(n)) (patch as Record<string, number>)[key] = n;
      }
    }
    onApply(patch);
    onClose();
  };

  const toggleField = (key: keyof ExtractedProfileFields, on: boolean) =>
    setEnabled((prev) => ({ ...prev, [key]: on }));
  const editField = (key: keyof ExtractedProfileFields, value: string) =>
    setEdits((prev) => ({ ...prev, [key]: value }));

  // Keys with a non-empty extracted value, in display order — these are the
  // rows shown for review.
  const reviewKeys = data
    ? PROFILE_FIELD_ORDER.filter((key) => {
        const v = data[key];
        return v != null && v !== "";
      })
    : [];
  const appliedCount = reviewKeys.filter((key) => {
    if (!enabled[key]) return false;
    const raw = (edits[key] ?? "").trim();
    if (raw === "") return false;
    // Numeric fields must parse to a finite number to actually be applied.
    return key === "name" || Number.isFinite(Number(raw));
  }).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base">Import from statement</h2>
              <p className="text-xs text-muted-foreground">Salary slip or bank statement</p>
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
                  accept=".png,.jpg,.jpeg,.webp,.pdf,.json,.csv,.txt"
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
                      Income and expenses are read and filled in for you to review
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {["📄 Salary slip PDF", "🏦 Bank statement", "📊 CSV", "📋 JSON"].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                🔒 Read on your device only — nothing is saved until you confirm
              </p>
            </>
          )}

          {status === "loading" && (
            <div className="border-2 border-primary/30 border-dashed rounded-xl p-8 text-center bg-primary/5">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div>
                  <p className="font-semibold text-sm text-primary">
                    {progress != null ? `Reading file… ${progress}%` : "Reading file…"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{fileName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Extracting income and expenses</p>
                </div>
                <div className="w-full bg-primary/20 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "65%" }} />
                </div>
              </div>
            </div>
          )}

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

              {reviewKeys.length > 0 ? (
                <>
                  <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                    {reviewKeys.map((key) => {
                      const checked = enabled[key] ?? false;
                      const months = data.breakdown[key as ExpenseKey];
                      return (
                        <div key={key} className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`field-${key}`}
                              checked={checked}
                              onCheckedChange={(c) => toggleField(key, c === true)}
                              aria-label={`Apply ${PROFILE_FIELD_LABELS[key]}`}
                            />
                            <Label
                              htmlFor={`field-${key}`}
                              className="text-xs text-muted-foreground flex-1 min-w-0 truncate cursor-pointer"
                            >
                              {PROFILE_FIELD_LABELS[key]}
                            </Label>
                            <Input
                              type={key === "name" ? "text" : "number"}
                              inputMode={key === "name" ? undefined : "numeric"}
                              value={edits[key] ?? ""}
                              disabled={!checked}
                              onChange={(e) => editField(key, e.target.value)}
                              aria-label={`${PROFILE_FIELD_LABELS[key]} value`}
                              className="h-8 w-32 text-xs text-right disabled:opacity-50"
                            />
                          </div>
                          {months && months.length > 1 && (
                            <MonthBreakdown
                              fieldKey={key as ExpenseKey}
                              months={months}
                              state={monthEdits[key as ExpenseKey] ?? {}}
                              disabled={!checked}
                              onEditMonth={editMonth}
                              onToggleMonth={toggleMonth}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {data.confidence === "low" && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs text-amber-800 dark:text-amber-300">Confidence is low — review each value before applying</p>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground text-center">
                    Only the checked fields are written to your profile. Untick any value you don't trust, or edit it inline.
                  </p>
                  <Button
                    className="w-full gap-2"
                    onClick={handleApply}
                    disabled={appliedCount === 0}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {appliedCount === 0
                      ? "Select a field to apply"
                      : `Apply ${appliedCount} ${appliedCount === 1 ? "field" : "fields"} to profile`}
                  </Button>
                </>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">No income or expense values were found — try a clearer file or fill the form manually.</p>
                </div>
              )}

              <button
                className="text-xs text-muted-foreground hover:text-foreground font-medium text-center w-full transition-colors"
                onClick={resetUpload}
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

function MoneyField({
  label, value, onChange, placeholder = "0",
}: { label: string; value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-500 dark:text-slate-400">{label}</Label>
      <Input
        type="number"
        min={0}
        inputMode="numeric"
        className="h-9 text-sm"
        value={value === 0 ? "" : value}
        placeholder={placeholder}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      />
    </div>
  );
}

function DerivedField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-500 dark:text-slate-400">{label}</Label>
      <div className="flex h-9 items-center rounded-md border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        {value}
      </div>
      {hint && <p className="text-[10px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
      <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      <h3 className="text-sm font-semibold uppercase tracking-wide">{children}</h3>
    </div>
  );
}

const RISK_PROFILES: RiskProfile[] = ["conservative", "moderate", "aggressive"];

export function ProfilePage() {
  const { profile, update, replace, saveStatus, updatedAt } = useProfile();
  const derived = useDerivedLoans();
  const [importOpen, setImportOpen] = useState(false);

  const set = useCallback(
    <K extends keyof ProfileData>(key: K, val: ProfileData[K]) => {
      update({ [key]: val } as Partial<ProfileData>);
    },
    [update],
  );

  const toggleGoal = (g: string) =>
    set("goals", profile.goals.includes(g) ? profile.goals.filter((x) => x !== g) : [...profile.goals, g]);

  const reset = () => replace({ ...EMPTY_PROFILE });

  const income = totalIncome(profile);
  const fixed = totalFixedExpenses(profile, derived.aggregateEmi);
  const variable = totalVariableExpenses(profile);
  const surplus = monthlySurplus(profile, derived.aggregateEmi);
  const completeness = Math.round(profileCompleteness(profile) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
            <UserCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Financial Profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Enter your finances once. Every planner and strategy across Ledger reads from this
              profile and stays in sync automatically.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportOpen(true)}>
            <FileText className="h-4 w-4" />
            Import from statement
          </Button>
          <SaveIndicator status={saveStatus} updatedAt={updatedAt} />
        </div>
      </div>

      {importOpen && (
        <ImportProfileModal onClose={() => setImportOpen(false)} onApply={update} />
      )}

      {/* Snapshot */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SnapshotStat label="Monthly Income" value={income} tone="text-emerald-600 dark:text-emerald-400" />
        <SnapshotStat label="Fixed Expenses" value={fixed} tone="text-rose-600 dark:text-rose-400" />
        <SnapshotStat label="Variable Expenses" value={variable} tone="text-amber-600 dark:text-amber-400" />
        <SnapshotStat
          label="Monthly Surplus"
          value={surplus}
          tone={surplus >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"}
        />
      </div>

      {/* Completeness */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Profile completeness
              </span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {completeness}%
              </span>
            </div>
            <Progress value={completeness} className="h-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {completeness >= 100
                ? "Your profile is complete — every tool has what it needs."
                : "Fill in more details to unlock sharper insights across your planners."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About you</CardTitle>
            <CardDescription>Basic details used to personalise guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle icon={UserCircle}>Personal</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-slate-500 dark:text-slate-400">Full Name</Label>
                <Input
                  className="h-9 text-sm"
                  value={profile.name}
                  placeholder="Your name"
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500 dark:text-slate-400">Occupation</Label>
                <Input
                  className="h-9 text-sm"
                  value={profile.occupation}
                  placeholder="e.g. Engineer"
                  onChange={(e) => set("occupation", e.target.value)}
                />
              </div>
              <MoneyField label="Age" value={profile.age} onChange={(n) => set("age", n)} placeholder="30" />
            </div>

            <Separator />

            <SectionTitle icon={Wallet}>Income</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Monthly Income" value={profile.monthlyIncome} onChange={(n) => set("monthlyIncome", n)} />
              <MoneyField label="Additional Income" value={profile.additionalIncome} onChange={(n) => set("additionalIncome", n)} />
            </div>

            <Separator />

            <SectionTitle icon={Gauge}>Risk Profile</SectionTitle>
            <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
              {RISK_PROFILES.map((rp) => (
                <button
                  key={rp}
                  onClick={() => set("riskProfile", rp)}
                  className={`flex-1 px-2 py-2 capitalize transition-colors ${
                    profile.riskProfile === rp
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {rp}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly expenses</CardTitle>
            <CardDescription>What goes out each month, fixed and variable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle icon={Receipt}>Fixed Expenses</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Rent" value={profile.rent} onChange={(n) => set("rent", n)} />
              <DerivedField label="Loan EMI" value={formatRupees(derived.aggregateEmi)} hint="From your loans" />
              <MoneyField label="Insurance" value={profile.insurance} onChange={(n) => set("insurance", n)} />
              <MoneyField label="Utilities" value={profile.utilities} onChange={(n) => set("utilities", n)} />
              <MoneyField label="School Fees" value={profile.schoolFees} onChange={(n) => set("schoolFees", n)} />
              <MoneyField label="Internet" value={profile.internet} onChange={(n) => set("internet", n)} />
              <MoneyField label="Other Fixed" value={profile.otherFixed} onChange={(n) => set("otherFixed", n)} />
            </div>

            <Separator />

            <SectionTitle icon={ShoppingBag}>Variable Expenses</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Food" value={profile.food} onChange={(n) => set("food", n)} />
              <MoneyField label="Fuel" value={profile.fuel} onChange={(n) => set("fuel", n)} />
              <MoneyField label="Travel" value={profile.travel} onChange={(n) => set("travel", n)} />
              <MoneyField label="Entertainment" value={profile.entertainment} onChange={(n) => set("entertainment", n)} />
              <MoneyField label="Shopping" value={profile.shopping} onChange={(n) => set("shopping", n)} />
              <MoneyField label="Medical" value={profile.medical} onChange={(n) => set("medical", n)} />
              <MoneyField label="Miscellaneous" value={profile.miscellaneous} onChange={(n) => set("miscellaneous", n)} />
            </div>
          </CardContent>
        </Card>

        {/* Assets & liabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets &amp; liabilities</CardTitle>
            <CardDescription>Savings, investments, and what you owe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle icon={TrendingUp}>Assets</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Current Savings" value={profile.currentSavings} onChange={(n) => set("currentSavings", n)} />
              <MoneyField label="Existing Investments" value={profile.existingInvestments} onChange={(n) => set("existingInvestments", n)} />
              <MoneyField label="Credit Card Debt" value={profile.creditCardDebt} onChange={(n) => set("creditCardDebt", n)} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <SectionTitle icon={Landmark}>Your Debts</SectionTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                <Link href="/loans">Manage</Link>
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Pulled live from your loan list — add or edit loans on the Loans page and they sync here automatically.
            </p>
            {derived.debtItems.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                No active loans yet. Add loans on the Loans page to model payoff strategies.
              </p>
            ) : (
              <div className="space-y-2">
                {derived.debtItems.map((debt) => (
                  <div key={debt.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{debt.name}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{formatRupees(debt.balance)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{debt.rate}% rate</span>
                      <span>{debt.minPayment > 0 ? `${formatRupees(debt.minPayment)}/mo EMI` : "no fixed EMI"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial goals</CardTitle>
            <CardDescription>What you&apos;re working toward.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle icon={Target}>Goals</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => {
                const active = profile.goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <Separator />

            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Synced everywhere</span>
              </div>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
                These numbers power your Smart Strategy and Financial Strategy tabs. Update them here
                once and the rest of Ledger follows.
              </p>
            </div>

            <Button
              variant="ghost"
              className="w-full gap-2 text-slate-500 dark:text-slate-400"
              onClick={reset}
            >
              <RefreshCw className="h-4 w-4" /> Reset profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SnapshotStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`mt-1 text-xl font-bold tracking-tight ${tone}`}>{formatRupees(value)}</p>
      </CardContent>
    </Card>
  );
}
