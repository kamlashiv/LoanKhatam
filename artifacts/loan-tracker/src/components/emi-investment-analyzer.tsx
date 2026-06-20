import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
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
import {
  Scale, TrendingUp, Landmark, Wallet, CalendarClock, Coins,
  Lightbulb, ShieldCheck, Sparkles, Info, RefreshCw,
} from "lucide-react";
import { formatRupees } from "@/lib/loan-utils";
import {
  analyzeEmiInvestment, monthsToLabel, compactRupees,
  EMI_PCT_OPTIONS, EMPTY_EMI_INVEST,
  type EmiInvestInputs,
} from "@/lib/strategy-engine";
import { useProfile, totalIncome, totalExpenses } from "@/lib/profile";

const STORAGE_KEY = "loan-tracker:emi-invest";

const NUMERIC_KEYS: (keyof EmiInvestInputs)[] = [
  "totalLoanAmount", "remainingBalance", "annualRate", "currentEmi",
  "remainingTenureMonths", "monthlyIncome", "monthlyExpenses",
  "assumedReturnPct", "investPct", "customPct",
];

function sanitize(parsed: unknown): EmiInvestInputs {
  if (typeof parsed !== "object" || parsed === null) return { ...EMPTY_EMI_INVEST };
  const raw = parsed as Record<string, unknown>;
  const out = { ...EMPTY_EMI_INVEST };
  for (const k of NUMERIC_KEYS) {
    const v = raw[k];
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function loadInputs(): EmiInvestInputs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return sanitize(JSON.parse(raw));
  } catch {
    /* ignore corrupt storage */
  }
  return { ...EMPTY_EMI_INVEST };
}

function NumField({
  label, value, onChange, suffix, placeholder = "0",
}: { label: string; value: number; onChange: (n: number) => void; suffix?: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-500 dark:text-slate-400">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          className="h-9 text-sm"
          value={value === 0 ? "" : value}
          placeholder={placeholder}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function StatTile({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string; sub?: string; icon: React.ElementType; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-lg font-black mt-1.5 truncate ${accent ?? "text-slate-900 dark:text-slate-50"}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function EmiInvestmentAnalyzer() {
  const { isDark } = useTheme();
  const { profile } = useProfile();
  const [inputs, setInputs] = useState<EmiInvestInputs>(loadInputs);
  const seededRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      /* ignore quota errors */
    }
  }, [inputs]);

  // One-time seed of income/expenses from the global financial profile so the
  // analyzer starts from the same numbers the user already entered elsewhere.
  useEffect(() => {
    if (seededRef.current) return;
    const profIncome = totalIncome(profile);
    const profExpenses = totalExpenses(profile);
    if (profIncome <= 0 && profExpenses <= 0) return;
    seededRef.current = true;
    setInputs((prev) => ({
      ...prev,
      monthlyIncome: prev.monthlyIncome === 0 ? profIncome : prev.monthlyIncome,
      monthlyExpenses: prev.monthlyExpenses === 0 ? profExpenses : prev.monthlyExpenses,
    }));
  }, [profile]);

  const set = useCallback(<K extends keyof EmiInvestInputs>(key: K, val: EmiInvestInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  }, []);

  const result = useMemo(() => analyzeEmiInvestment(inputs), [inputs]);

  const gridStroke = isDark ? "#334155" : "#e2e8f0";
  const axisTick = { fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" } as const;

  const comparisonBars = [
    { name: "Pay Off Debt", "Guaranteed Interest Saved": Math.round(result.guaranteedInterestSaved) },
    { name: "Invest EMI %", "Potential Investment Profit": Math.round(result.potentialProfitAtTenure) },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/30 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">EMI vs Investment Analyzer</CardTitle>
            <CardDescription className="mt-1">
              See how a portion of your EMI could potentially build wealth if invested — with the trade-offs spelled out. Educational planning only; never skip an EMI to invest.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <NumField label="Total Loan Amount" value={inputs.totalLoanAmount} onChange={(n) => set("totalLoanAmount", n)} />
            <NumField label="Remaining Balance" value={inputs.remainingBalance} onChange={(n) => set("remainingBalance", n)} />
            <NumField label="Interest Rate" value={inputs.annualRate} onChange={(n) => set("annualRate", n)} suffix="%" />
            <NumField label="Current EMI" value={inputs.currentEmi} onChange={(n) => set("currentEmi", n)} />
            <NumField label="Remaining Tenure" value={inputs.remainingTenureMonths} onChange={(n) => set("remainingTenureMonths", n)} suffix="mo" />
            <NumField label="Monthly Income" value={inputs.monthlyIncome} onChange={(n) => set("monthlyIncome", n)} />
            <NumField label="Monthly Expenses" value={inputs.monthlyExpenses} onChange={(n) => set("monthlyExpenses", n)} />
            <NumField label="Assumed Return" value={inputs.assumedReturnPct} onChange={(n) => set("assumedReturnPct", n)} suffix="%" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Invest this % of EMI:
            </span>
            <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
              {EMI_PCT_OPTIONS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => set("investPct", pct)}
                  className={`px-3 py-1.5 transition-colors ${
                    inputs.investPct === pct
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Custom scenario:</span>
              <div className="relative w-24">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  className="h-9 text-sm pr-6"
                  value={inputs.customPct === 0 ? "" : inputs.customPct}
                  placeholder="15"
                  onChange={(e) => set("customPct", Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">%</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-500 dark:text-slate-400 ml-auto"
              onClick={() => setInputs({ ...EMPTY_EMI_INVEST })}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        {!result.hasData ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-12 flex flex-col items-center text-center gap-2">
            <Scale className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Enter your current EMI and remaining balance (or tenure) to compare paying down debt against investing.
            </p>
          </div>
        ) : (
          <>
            <Separator />

            {result.payoffUnbounded && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3">
                <Info className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-600/90 dark:text-rose-300/80 leading-relaxed">
                  At this EMI the balance never clears — your payment doesn't yet cover the monthly interest. Increase the EMI (or enter a remaining tenure) to see an accurate payoff timeline.
                </p>
              </div>
            )}

            {/* Derived metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatTile label="Total EMI Remaining" value={result.payoffUnbounded ? "—" : formatRupees(result.totalEmiRemaining)} icon={Wallet}
                sub={result.payoffUnbounded ? "not reachable" : `over ${monthsToLabel(result.debtFreeMonths)}`} />
              <StatTile label="Interest Yet To Pay" value={result.payoffUnbounded ? "—" : formatRupees(result.totalInterestRemaining)} icon={Coins}
                accent="text-amber-600 dark:text-amber-400" sub="guaranteed if repaid" />
              <StatTile label="Debt-Free In" value={result.payoffUnbounded ? "Not reachable" : monthsToLabel(result.debtFreeMonths)} icon={CalendarClock} />
              <StatTile label="Monthly Surplus" value={formatRupees(result.monthlySurplus)} icon={TrendingUp}
                accent={result.monthlySurplus >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}
                sub="income − expenses − EMI" />
            </div>

            {/* Scenarios */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">EMI Investment Scenarios</h3>
                <span className="text-[11px] text-slate-400">over {monthsToLabel(result.contributionMonths)}</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <th className="text-left font-semibold px-3 py-2.5">Scenario</th>
                      <th className="text-right font-semibold px-3 py-2.5">Monthly</th>
                      <th className="text-right font-semibold px-3 py-2.5">Contributions</th>
                      <th className="text-right font-semibold px-3 py-2.5">Portfolio</th>
                      <th className="text-right font-semibold px-3 py-2.5">Profit</th>
                      <th className="text-right font-semibold px-3 py-2.5">Net Worth Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.scenarios.map((s) => (
                      <tr key={s.key} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2.5">
                          <span className="font-medium text-slate-800 dark:text-slate-100">{s.label}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">{formatRupees(s.monthlyInvestment)}</td>
                        <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">{compactRupees(s.totalContributions)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-100">{compactRupees(s.portfolioValue)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">{compactRupees(s.profit)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-indigo-600 dark:text-indigo-400">{compactRupees(s.netWorthImpact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compounding projections */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Compounding Calculator</h3>
                <span className="text-[11px] text-slate-400">
                  investing {formatRupees(result.selectedMonthlyInvestment)}/mo at {inputs.assumedReturnPct}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {result.projections.map((p) => (
                  <div key={p.years} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{p.years} Year{p.years > 1 ? "s" : ""}</p>
                    <p className="text-base font-black text-slate-900 dark:text-slate-50 mt-1.5">{compactRupees(p.portfolio)}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">+{compactRupees(p.profit)} profit</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ChartCard title="Debt Remaining" icon={Wallet}>
                <AreaChart data={result.timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emiDebt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="year" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(y) => `${y}y`} />
                  <YAxis tick={axisTick} tickFormatter={(v) => compactRupees(v)} width={56} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="debtRemaining" name="Debt" stroke="#f43f5e" fill="url(#emiDebt)" strokeWidth={2} />
                </AreaChart>
              </ChartCard>

              <ChartCard title="Investment Growth" icon={TrendingUp}>
                <AreaChart data={result.timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emiGrow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="year" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(y) => `${y}y`} />
                  <YAxis tick={axisTick} tickFormatter={(v) => compactRupees(v)} width={56} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="portfolio" name="Portfolio" stroke="#10b981" fill="url(#emiGrow)" strokeWidth={2} />
                </AreaChart>
              </ChartCard>

              <ChartCard title="Net Worth Growth" icon={Landmark}>
                <LineChart data={result.timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="year" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(y) => `${y}y`} />
                  <YAxis tick={axisTick} tickFormatter={(v) => compactRupees(v)} width={56} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="netWorth" name="Net Worth" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ChartCard>

              <ChartCard title="EMI vs Investment" icon={Scale}>
                <BarChart data={comparisonBars} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} tickFormatter={(v) => compactRupees(v)} width={56} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? "#1e293b55" : "#f1f5f955" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Guaranteed Interest Saved" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={90} />
                  <Bar dataKey="Potential Investment Profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={90} />
                </BarChart>
              </ChartCard>
            </div>

            {/* Smart comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-4">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="font-semibold text-sm">Aggressive Debt Repayment</p>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                  <li>Faster debt freedom</li>
                  <li>Lower total interest cost</li>
                  <li>Guaranteed, risk-free saving</li>
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <p className="font-semibold text-sm">Balanced Debt + Investing</p>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                  <li>Potential long-term wealth accumulation</li>
                  <li>Diversification of financial progress</li>
                  <li>Benefits from compounding over time</li>
                </ul>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Lightbulb className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Insights</h3>
                <Badge variant="secondary" className="text-[10px]">educational</Badge>
              </div>
              {result.insights.map((text, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Investment returns are not guaranteed. Loan interest savings are certain, while investment outcomes depend on market performance. This comparison is for educational purposes only and is not investment advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title, icon: Icon, children,
}: { title: string; icon: React.ElementType; children: React.ReactElement }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-200">
        <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
