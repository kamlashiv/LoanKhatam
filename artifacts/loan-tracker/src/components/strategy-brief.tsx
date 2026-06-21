import { useMemo, useState } from "react";
import {
  Sparkles, Upload, CheckCircle2, AlertTriangle, Lightbulb,
  Wallet, PiggyBank, ShieldCheck, TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/loan-utils";
import { monthsToLabel, compactRupees, type StrategyInputs } from "@/lib/strategy-engine";
import { buildStrategyBrief, type BriefLoan, type BriefTone } from "@/lib/strategy-brief";
import { ImportProfileModal } from "@/pages/profile";
import type { ProfileData } from "@/lib/profile";

const TONE_ICON: Record<BriefTone, React.ElementType> = {
  good: CheckCircle2,
  warn: AlertTriangle,
  tip: Lightbulb,
};
const TONE_COLOR: Record<BriefTone, string> = {
  good: "text-emerald-500",
  warn: "text-rose-500",
  tip: "text-amber-500",
};

function StatChip({
  icon: Icon, label, value, accent,
}: { icon: React.ElementType; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/40 backdrop-blur px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-base font-black mt-0.5 truncate ${accent ?? "text-slate-900 dark:text-slate-50"}`}>{value}</p>
    </div>
  );
}

/**
 * The combined Smart + Financial strategy brief. Reads the user's profile
 * inputs and real loans, and lets them upload any supported document to feed
 * income/expense data straight into the brief.
 */
export function StrategyBrief({
  inputs,
  loans,
  onImport,
}: {
  inputs: StrategyInputs;
  loans: BriefLoan[];
  onImport: (patch: Partial<ProfileData>) => void;
}) {
  const [importOpen, setImportOpen] = useState(false);
  const brief = useMemo(() => buildStrategyBrief(inputs, loans), [inputs, loans]);
  const { strategy: s, prepayment } = brief;

  const debtFree =
    !s.hasDebt
      ? "Debt-free"
      : s[s.recommendedStrategy].unbounded
        ? "Raise payment"
        : monthsToLabel(s[s.recommendedStrategy].months);

  return (
    <>
      <Card className="overflow-hidden border-indigo-200/70 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/30">
        <CardContent className="pt-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/15 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Your Strategy Brief</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl">{brief.headline}</p>
              </div>
            </div>
            <Button onClick={() => setImportOpen(true)} variant="outline" className="gap-2 shrink-0 bg-white/70 dark:bg-slate-900/50">
              <Upload className="h-4 w-4" /> Upload document
            </Button>
          </div>

          {!brief.hasData ? (
            <div className="rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-white/60 dark:bg-slate-900/40 px-4 py-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Upload a salary slip, bank statement, or financial summary in any format
                (PDF, image, CSV, JSON, or text). We'll read your income and expenses and
                instantly brief you on both your smart loan strategy and your overall
                financial strategy.
              </p>
              <Button onClick={() => setImportOpen(true)} className="gap-2 mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Upload className="h-4 w-4" /> Upload a document
              </Button>
            </div>
          ) : (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatChip
                  icon={Wallet}
                  label="Free Cash Flow"
                  value={`${formatRupees(s.freeCashFlow)}/mo`}
                  accent={s.freeCashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}
                />
                <StatChip icon={PiggyBank} label="Savings Rate" value={`${Math.round(s.savingsRate * 100)}%`} />
                <StatChip icon={ShieldCheck} label="Debt-free in" value={debtFree} />
                <StatChip
                  icon={TrendingDown}
                  label="Prepay Saves"
                  value={prepayment.applicable && prepayment.interestSaved > 0 ? compactRupees(prepayment.interestSaved) : "—"}
                  accent={prepayment.interestSaved > 0 ? "text-emerald-600 dark:text-emerald-400" : undefined}
                />
              </div>

              {/* Talking points */}
              <div className="space-y-2.5">
                {brief.points.map((p, i) => {
                  const Icon = TONE_ICON[p.tone];
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${TONE_COLOR[p.tone]}`} />
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{p.text}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {importOpen && (
        <ImportProfileModal onClose={() => setImportOpen(false)} onApply={onImport} />
      )}
    </>
  );
}
