import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { ChartTooltip } from "@/lib/chart-theme";
import { useTheme } from "@/lib/theme";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Wallet, Receipt, ShoppingBag, Landmark, Target, Download,
  RefreshCw, ShieldCheck, PiggyBank, TrendingUp, Coins,
  Trophy, AlertTriangle, Lightbulb, CheckCircle2, Activity, Gauge, Info,
} from "lucide-react";
import { formatRupees } from "@/lib/loan-utils";
import { exportStrategyPDF } from "@/lib/export";
import { EmiInvestmentAnalyzer } from "@/components/emi-investment-analyzer";
import {
  computeStrategy, monthsToLabel, compactRupees, GOAL_OPTIONS,
  type StrategyInputs, type RiskProfile, type HealthCategory,
} from "@/lib/strategy-engine";
import {
  useProfile, EMPTY_PROFILE, totalIncome, totalExpenses, type ProfileData,
} from "@/lib/profile";
import { useDerivedLoans, type DerivedLoans } from "@/lib/loan-derive";
import { useListLoans } from "@workspace/api-client-react";
import { SaveIndicator } from "@/components/save-indicator";
import { OverspendAlert } from "@/components/budget-warnings";
import { StrategyBrief } from "@/components/strategy-brief";
import type { BriefLoan } from "@/lib/strategy-brief";

/**
 * Map the shared financial profile onto the strategy engine's input shape.
 * Loan figures (aggregate EMI, outstanding debts) are derived from the real
 * loans in the database — never re-entered — so they can't drift.
 */
function profileToStrategyInputs(p: ProfileData, derived: DerivedLoans): StrategyInputs {
  return {
    age: p.age,
    monthlyIncome: p.monthlyIncome,
    additionalIncome: p.additionalIncome,
    rent: p.rent,
    emi: derived.aggregateEmi,
    insurance: p.insurance,
    utilities: p.utilities,
    schoolFees: p.schoolFees,
    internet: p.internet,
    otherFixed: p.otherFixed,
    food: p.food,
    fuel: p.fuel,
    travel: p.travel,
    entertainment: p.entertainment,
    shopping: p.shopping,
    medical: p.medical,
    miscellaneous: p.miscellaneous,
    currentSavings: p.currentSavings,
    existingInvestments: p.existingInvestments,
    creditCardDebt: p.creditCardDebt,
    loans: derived.debtItems,
    goals: p.goals,
    riskProfile: p.riskProfile,
  };
}

const CATEGORY_STYLE: Record<HealthCategory, { text: string; bar: string; ring: string }> = {
  Critical: { text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", ring: "stroke-rose-500" },
  Weak: { text: "text-orange-600 dark:text-orange-400", bar: "bg-orange-500", ring: "stroke-orange-500" },
  Average: { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", ring: "stroke-amber-500" },
  Good: { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", ring: "stroke-emerald-500" },
  Excellent: { text: "text-green-600 dark:text-green-400", bar: "bg-green-600", ring: "stroke-green-600" },
};

// ── Small reusable field ─────────────────────────────────────────────────────
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

export default function Strategy() {
  const { isDark } = useTheme();
  const { profile, update, replace, saveStatus, updatedAt } = useProfile();
  const derived = useDerivedLoans();
  const { data: loanList } = useListLoans();
  const [exporting, setExporting] = useState(false);

  const inputs = useMemo(() => profileToStrategyInputs(profile, derived), [profile, derived]);

  // Real loans reduced to what the prepayment what-if needs (Smart Strategy).
  const briefLoans = useMemo<BriefLoan[]>(
    () =>
      (Array.isArray(loanList) ? loanList : [])
        .filter((l) => l.status !== "paid" && l.remainingAmount > 0)
        .map((l) => ({
          name: l.borrowerName,
          principal: l.principalAmount,
          outstanding: l.remainingAmount,
          rate: l.interestRate,
          tenureMonths: l.tenureMonths ?? null,
        })),
    [loanList],
  );

  const set = useCallback(
    <K extends keyof StrategyInputs>(key: K, val: StrategyInputs[K]) => {
      update({ [key]: val } as Partial<ProfileData>);
    },
    [update],
  );

  const resetInputs = useCallback(() => {
    replace({ ...EMPTY_PROFILE, name: profile.name, occupation: profile.occupation });
  }, [replace, profile.name, profile.occupation]);

  const result = useMemo(() => computeStrategy(inputs), [inputs]);
  const hasData = result.totalIncome > 0 || result.totalExpenses > 0;
  const cat = CATEGORY_STYLE[result.healthCategory];

  // Negative-surplus signal from the shared profile helpers (single source of
  // truth), with live EMI folded in so it matches every other screen.
  const profIncome = totalIncome(profile);
  const profExpenses = totalExpenses(profile, derived.aggregateEmi);

  const toggleGoal = (g: string) =>
    set("goals", inputs.goals.includes(g) ? inputs.goals.filter((x) => x !== g) : [...inputs.goals, g]);

  const gridStroke = isDark ? "#334155" : "#e2e8f0";
  const axisTick = { fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" } as const;

  const moneyFlow = [
    { name: "Fixed Expenses", value: result.totalFixed, color: "#f43f5e" },
    { name: "Variable Expenses", value: result.totalVariable, color: "#f59e0b" },
    { name: "Free Cash Flow", value: Math.max(0, result.freeCashFlow), color: "#10b981" },
  ].filter((d) => d.value > 0);

  const cashFlowBars = [
    { name: "Income", Income: result.totalIncome, Expenses: 0, Savings: 0 },
    { name: "Expenses", Income: 0, Expenses: result.totalExpenses, Savings: 0 },
    { name: "Savings", Income: 0, Expenses: 0, Savings: Math.max(0, result.freeCashFlow) },
  ];

  const emergencyPct = result.emergencyFundRequirement > 0
    ? Math.min(100, (inputs.currentSavings / result.emergencyFundRequirement) * 100)
    : 0;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportStrategyPDF(inputs, result);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Smart Financial Strategy</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Understand how to save more, clear debt faster, build an emergency fund, and invest intelligently — based on your numbers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SaveIndicator status={saveStatus} updatedAt={updatedAt} />
          <Button onClick={handleExport} disabled={!hasData || exporting} className="gap-2">
            <Download className="h-4 w-4" /> {exporting ? "Preparing…" : "Download Report"}
          </Button>
        </div>
      </div>

      {/* ── Combined Smart + Financial strategy brief (upload-driven) ── */}
      <StrategyBrief inputs={inputs} loans={briefLoans} onImport={update} />

      <div className="grid grid-cols-1 gap-6">
        {/* ── Results ── */}
        <div className="space-y-6">
          {!hasData ? (
            <Card>
              <CardContent className="py-16 flex flex-col items-center text-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Activity className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Your strategy appears here</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Add your income and expenses in your{" "}
                  <Link href="/profile" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Financial Profile</Link>{" "}
                  to generate a personalised financial health score, savings plan, debt strategy, and investment guidance.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <OverspendAlert income={profIncome} expenses={profExpenses} />

              {/* Health score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-5">
                    <div className="relative h-24 w-24 shrink-0">
                      <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-slate-800" />
                        <circle
                          cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
                          className={cat.ring}
                          strokeDasharray={`${(result.healthScore / 100) * 264} 264`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-50">{result.healthScore}</span>
                        <span className="text-[10px] text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Financial Health Score</p>
                      <p className={`text-2xl font-bold ${cat.text}`}>{result.healthCategory}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Based on your savings rate, debt load, emergency reserves, and high-interest debt.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key metrics */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard label="Net Worth" value={formatRupees(result.netWorth)} sub="Assets minus debts" icon={Landmark} />
                <MetricCard label="Free Cash Flow" value={formatRupees(result.freeCashFlow)} sub="Income minus expenses" icon={Wallet}
                  accent={result.freeCashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
                <MetricCard label="Savings Rate" value={`${Math.round(result.savingsRate * 100)}%`} sub="Of total income" icon={PiggyBank} />
                <MetricCard label="Debt-to-Income" value={`${Math.round(result.dti * 100)}%`} sub="Monthly obligations" icon={Receipt}
                  accent={result.dti > 0.4 ? "text-rose-600 dark:text-rose-400" : undefined} />
              </div>

              {/* Recommendation cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RecCard icon={ShieldCheck} tone="emerald" title="Debt Freedom Plan">
                  {!result.hasDebt ? (
                    <>No active debt detected. You're already debt-free — focus on saving and investing.</>
                  ) : result[result.recommendedStrategy].unbounded ? (
                    <>Your current payments aren't enough to outpace interest. Increase your monthly payment to start clearing the balance.</>
                  ) : (
                    <>Clear all debt in <b>{monthsToLabel(result[result.recommendedStrategy].months)}</b> using the{" "}
                      <b>{result.recommendedStrategy === "avalanche" ? "Avalanche" : "Snowball"}</b> method — saving about{" "}
                      <b>{compactRupees(result.interestSavedVsBaseline)}</b> in interest.</>
                  )}
                </RecCard>

                <RecCard icon={PiggyBank} tone="indigo" title="Monthly Savings Plan">
                  You can safely save <b>{formatRupees(result.monthlySavingTarget)}</b> per month
                  {result.expenseCuts.length > 0 && <> — more if you trim {result.expenseCuts[0].label.toLowerCase()}.</>}
                </RecCard>

                <RecCard icon={ShieldCheck} tone="sky" title="Emergency Fund Plan">
                  Target <b>{formatRupees(result.emergencyFundRequirement)}</b> (6 months of expenses).{" "}
                  {result.emergencyMonthsToGoal === 0
                    ? "You've already reached it. ✅"
                    : result.emergencyMonthsToGoal === null
                      ? "Free up some cash flow to start building it."
                      : <>At your saving rate you'll get there in <b>{result.emergencyMonthsToGoal} months</b>.</>}
                </RecCard>

                <RecCard icon={Coins} tone="amber" title="Investment Allocation">
                  Suggested {inputs.riskProfile} split: {result.allocation.map((a) => `${a.pct}% ${a.name.replace(" Funds", "")}`).join(", ")}.
                </RecCard>

                <RecCard icon={TrendingUp} tone="violet" title="Wealth Building Strategy">
                  Automate <b>{formatRupees(result.monthlySavingTarget)}</b>/month into your allocation. Consistency compounds far more than timing the market.
                </RecCard>

                <RecCard icon={Trophy} tone="emerald" title="Retirement Readiness">
                  {inputs.age < 35
                    ? "Time is your biggest asset — early, steady investing now sets up a comfortable retirement."
                    : inputs.age < 50
                      ? "Mid-career: step up long-term contributions to stay on track for retirement."
                      : "Prioritise capital preservation and maximise retirement contributions in your remaining earning years."}
                </RecCard>
              </div>

              {/* Risk warnings */}
              {result.healthScore < 50 && (
                <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
                  <CardContent className="pt-5 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-700 dark:text-rose-300 text-sm">Financial Risk Warning</p>
                      <p className="text-xs text-rose-600/90 dark:text-rose-300/80 mt-1">
                        Your health score is in the {result.healthCategory.toLowerCase()} range. Focus first on building a cash buffer and reducing high-interest debt before investing for growth.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Where Your Money Goes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px]">
                      {moneyFlow.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={moneyFlow} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke={isDark ? "#0f172a" : "#fff"} strokeWidth={2}>
                              {moneyFlow.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {moneyFlow.map((e) => (
                        <div key={e.name} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                          <span className="text-[11px] text-slate-600 dark:text-slate-300">{e.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Coins className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Suggested Investment Mix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={result.allocation} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="pct" stroke={isDark ? "#0f172a" : "#fff"} strokeWidth={2}>
                            {result.allocation.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {result.allocation.map((e) => (
                        <div key={e.name} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                          <span className="text-[11px] text-slate-600 dark:text-slate-300">{e.pct}% {e.name.replace(" Funds", "")}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cash flow + progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Monthly Cash Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashFlowBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                        <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                        <YAxis tick={axisTick} tickFormatter={(v) => compactRupees(v)} width={56} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? "#1e293b55" : "#f1f5f955" }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Income" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={70} />
                        <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={70} />
                        <Bar dataKey="Savings" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={70} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Emergency Fund Progress</span>
                        <span className="text-slate-500 dark:text-slate-400">{formatRupees(inputs.currentSavings)} / {formatRupees(result.emergencyFundRequirement)}</span>
                      </div>
                      <Progress value={emergencyPct} className="h-2" />
                    </div>
                    {result.hasDebt && (
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Outstanding Debt</span>
                          <span className="text-slate-500 dark:text-slate-400">{formatRupees(result.totalDebt)}</span>
                        </div>
                        <Progress value={100} className="h-2 [&>div]:bg-rose-500" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Debt strategy comparison */}
              {result.hasDebt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Debt Elimination Strategy
                    </CardTitle>
                    <CardDescription>Snowball (smallest balance first) vs. Avalanche (highest rate first).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <StrategyBox
                        title="Debt Snowball"
                        subtitle="Quick psychological wins"
                        months={result.snowball.months}
                        interest={result.snowball.totalInterest}
                        recommended={result.recommendedStrategy === "snowball"}
                        unbounded={result.snowball.unbounded}
                      />
                      <StrategyBox
                        title="Debt Avalanche"
                        subtitle="Lowest total interest"
                        months={result.avalanche.months}
                        interest={result.avalanche.totalInterest}
                        recommended={result.recommendedStrategy === "avalanche"}
                        unbounded={result.avalanche.unbounded}
                      />
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 p-3">
                      <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {result[result.recommendedStrategy].unbounded ? (
                          <>Even with <b>{formatRupees(result.debtExtraPayment)}</b> extra per month, your payments don't yet outpace interest. Raise your monthly payment to start reducing the balance.</>
                        ) : (
                          <>With <b>{formatRupees(result.debtExtraPayment)}</b> extra per month, the{" "}
                          <b>{result.recommendedStrategy === "avalanche" ? "Avalanche" : "Snowball"}</b> method clears your debt in{" "}
                          <b>{monthsToLabel(result[result.recommendedStrategy].months)}</b> and saves about{" "}
                          <b>{compactRupees(result.interestSavedVsBaseline)}</b> versus paying only the minimums.</>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Smart insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Smart Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {result.insights.map((ins, i) => {
                    const Icon = ins.kind === "warning" ? AlertTriangle : ins.kind === "positive" ? CheckCircle2 : Lightbulb;
                    const color =
                      ins.kind === "warning" ? "text-rose-500" : ins.kind === "positive" ? "text-emerald-500" : "text-amber-500";
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
                        <p className="text-sm text-slate-600 dark:text-slate-300">{ins.text}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}

          {/* Disclaimer (always visible) */}
          <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 px-1">
            This tool provides educational financial guidance and is not personalized investment advice. Users should consult a qualified financial professional before making investment decisions.
          </p>
        </div>
      </div>

      {/* ── EMI vs Investment Analyzer ── */}
      <EmiInvestmentAnalyzer />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string; sub: string; icon: React.ElementType; accent?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Icon className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
        </div>
        <p className={`text-xl font-black mt-2 truncate ${accent ?? "text-slate-900 dark:text-slate-50"}`}>{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

const REC_TONES: Record<string, string> = {
  emerald: "from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-950/30 dark:to-teal-950/20 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400",
  indigo: "from-indigo-50 to-blue-50 border-indigo-200 dark:from-indigo-950/30 dark:to-blue-950/20 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400",
  sky: "from-sky-50 to-cyan-50 border-sky-200 dark:from-sky-950/30 dark:to-cyan-950/20 dark:border-sky-900/50 text-sky-600 dark:text-sky-400",
  amber: "from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/30 dark:to-orange-950/20 dark:border-amber-900/50 text-amber-600 dark:text-amber-400",
  violet: "from-violet-50 to-purple-50 border-violet-200 dark:from-violet-950/30 dark:to-purple-950/20 dark:border-violet-900/50 text-violet-600 dark:text-violet-400",
};

function RecCard({
  icon: Icon, tone, title, children,
}: { icon: React.ElementType; tone: keyof typeof REC_TONES; title: string; children: React.ReactNode }) {
  const cls = REC_TONES[tone];
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${cls}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{title}</p>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{children}</p>
    </div>
  );
}

function StrategyBox({
  title, subtitle, months, interest, recommended, unbounded,
}: { title: string; subtitle: string; months: number; interest: number; recommended: boolean; unbounded: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${recommended ? "border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/40" : "border-slate-200 dark:border-slate-700"}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{title}</p>
        {recommended && <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px]">Recommended</Badge>}
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">{subtitle}</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Debt-free in</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {unbounded ? "Not reachable" : monthsToLabel(months)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Total interest</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">{formatRupees(interest)}</span>
        </div>
      </div>
      {unbounded && (
        <p className="mt-2 text-[10px] text-rose-600 dark:text-rose-400 leading-snug">
          Current payments don't outpace interest — increase your monthly payment to make progress.
        </p>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
      Add expenses to see the breakdown
    </div>
  );
}
