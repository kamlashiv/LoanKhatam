import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Target, TrendingUp, Award, PiggyBank, Flame, Sparkles, Download } from "lucide-react";

const CANONICAL_DOMAIN = "https://loan-khatam.replit.app";

function fmt(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function compact(val: number) {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)} Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

function calcEmi(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

interface AmortResult {
  totalInterest: number;
  totalPaid: number;
  monthsToPayoff: number;
  yearlyRows: YearRow[];
  balanceCurve: { year: string; balance: number }[];
}

interface YearRow {
  year: number;
  opening: number;
  emiPaid: number;
  extraPaid: number;
  interest: number;
  principal: number;
  closing: number;
}

function amortize(
  principal: number,
  annualRate: number,
  months: number,
  extraPerMonth: number,
): AmortResult {
  const r = annualRate / 12 / 100;
  const emi = calcEmi(principal, annualRate, months);
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let monthCount = 0;

  const yearlyRows: YearRow[] = [];
  const balanceCurve: { year: string; balance: number }[] = [];
  balanceCurve.push({ year: "Yr 0", balance: Math.round(principal) });

  let yearInterest = 0;
  let yearPrincipal = 0;
  let yearEmi = 0;
  let yearExtra = 0;
  let yearOpening = principal;

  while (balance > 0.01 && monthCount < months * 2) {
    const interestCharge = balance * r;
    const principalPart = Math.min(balance, emi - interestCharge + extraPerMonth);
    balance -= principalPart;
    totalInterest += interestCharge;
    totalPaid += emi + extraPerMonth;
    yearInterest += interestCharge;
    yearPrincipal += principalPart;
    yearEmi += emi;
    yearExtra += extraPerMonth;
    monthCount++;

    if (monthCount % 12 === 0 || balance <= 0.01) {
      const yr = Math.ceil(monthCount / 12);
      yearlyRows.push({
        year: yr,
        opening: Math.round(yearOpening),
        emiPaid: Math.round(yearEmi),
        extraPaid: Math.round(yearExtra),
        interest: Math.round(yearInterest),
        principal: Math.round(yearPrincipal),
        closing: Math.max(0, Math.round(balance)),
      });
      balanceCurve.push({ year: `Yr ${yr}`, balance: Math.max(0, Math.round(balance)) });
      yearOpening = balance;
      yearInterest = 0;
      yearPrincipal = 0;
      yearEmi = 0;
      yearExtra = 0;
    }
  }

  return {
    totalInterest,
    totalPaid,
    monthsToPayoff: monthCount,
    yearlyRows,
    balanceCurve,
  };
}

const STRAT_VISUAL = [
  { icon: TrendingUp, card: "from-blue-50 to-indigo-100 border-blue-200", iconColor: "text-blue-600" },
  { icon: Award, card: "from-emerald-50 to-teal-100 border-emerald-200", iconColor: "text-emerald-600" },
  { icon: PiggyBank, card: "from-amber-50 to-orange-100 border-amber-200", iconColor: "text-amber-600" },
  { icon: Flame, card: "from-rose-50 to-pink-100 border-rose-200", iconColor: "text-rose-600" },
];

function ShareButton({ principal, rate, tenure, extraEmi }: { principal: number; rate: number; tenure: number; extraEmi: number }) {
  const url = `${CANONICAL_DOMAIN}/bento-planner/`;
  const text = `I just discovered I can save ${compact(extraEmi * 12 * 3)} in interest on my home loan by paying a little extra each month. Try the Smart Loan Saver planner!`;

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: "Smart Loan Saver", text, url });
    } else {
      navigator.clipboard?.writeText(`${text} ${url}`);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
      aria-label="Share Smart Loan Saver"
    >
      <Download className="w-4 h-4" />
      Share
    </button>
  );
}

export default function App() {
  const [principal, setPrincipal] = useState(2_500_000);
  const [rate, setRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [extraEmi, setExtraEmi] = useState(2170);
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");

  const tenureMonths = tenureYears * 12;

  const baseEmi = useMemo(() => calcEmi(principal, rate, tenureMonths), [principal, rate, tenureMonths]);

  const stdResult = useMemo(() => amortize(principal, rate, tenureMonths, 0), [principal, rate, tenureMonths]);
  const accResult = useMemo(() => amortize(principal, rate, tenureMonths, extraEmi), [principal, rate, tenureMonths, extraEmi]);

  const intSaved = stdResult.totalInterest - accResult.totalInterest;
  const monthsSaved = stdResult.monthsToPayoff - accResult.monthsToPayoff;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const mosSaved = monthsSaved % 12;
  const pctSaved = stdResult.totalInterest > 0 ? Math.round((intSaved / stdResult.totalInterest) * 100) : 0;

  const balanceCurve = useMemo(() => {
    const maxLen = Math.max(stdResult.balanceCurve.length, accResult.balanceCurve.length);
    return Array.from({ length: maxLen }, (_, i) => ({
      year: stdResult.balanceCurve[i]?.year ?? accResult.balanceCurve[i]?.year ?? `Yr ${i}`,
      "Standard": stdResult.balanceCurve[i]?.balance ?? 0,
      "With Prepayments": accResult.balanceCurve[i]?.balance ?? 0,
    }));
  }, [stdResult, accResult]);

  const costData = [
    { name: "Standard Path", Principal: principal, Interest: Math.round(stdResult.totalInterest) },
    { name: "Savings Plan", Principal: principal, Interest: Math.round(accResult.totalInterest) },
  ];

  const strategies = useMemo(() => {
    const oneExtraYear = amortize(principal, rate, tenureMonths, baseEmi / 12);
    const micro = amortize(principal, rate, tenureMonths, baseEmi * 0.05);
    const boost10 = amortize(principal, rate, tenureMonths, baseEmi * 0.10);
    const combo = amortize(principal, rate, tenureMonths, baseEmi * 0.10 + baseEmi / 12);

    function saved(r: AmortResult) {
      const int = stdResult.totalInterest - r.totalInterest;
      const mo = stdResult.monthsToPayoff - r.monthsToPayoff;
      return { int, yrs: Math.floor(mo / 12), mos: mo % 12 };
    }

    const s1 = saved(oneExtraYear);
    const s2 = saved(micro);
    const s3 = saved(boost10);
    const s4 = saved(combo);

    return [
      {
        title: "1 Extra EMI / Year",
        desc: `Saves ${compact(s1.int)} & ${s1.yrs} yr${s1.yrs !== 1 ? "s" : ""}, ${s1.mos} mo${s1.mos !== 1 ? "s" : ""} · ${fmt(baseEmi / 12)}/mo extra`,
        extra: baseEmi / 12,
        ...STRAT_VISUAL[0],
      },
      {
        title: "Micro-Savings (5% Monthly)",
        desc: `Saves ${compact(s2.int)} & ${s2.yrs} yr${s2.yrs !== 1 ? "s" : ""}, ${s2.mos} mo${s2.mos !== 1 ? "s" : ""} · +${fmt(baseEmi * 0.05)}/mo`,
        extra: baseEmi * 0.05,
        ...STRAT_VISUAL[1],
      },
      {
        title: "10% Monthly Boost",
        desc: `Saves ${compact(s3.int)} & ${s3.yrs} yr${s3.yrs !== 1 ? "s" : ""} · +${fmt(baseEmi * 0.10)}/mo`,
        extra: baseEmi * 0.10,
        ...STRAT_VISUAL[2],
      },
      {
        title: "Super-Saver Combo",
        desc: `Saves ${compact(s4.int)} & ${s4.yrs} yr${s4.yrs !== 1 ? "s" : ""} · +${fmt(baseEmi * 0.10 + baseEmi / 12)}/mo`,
        extra: baseEmi * 0.10 + baseEmi / 12,
        ...STRAT_VISUAL[3],
      },
    ];
  }, [principal, rate, tenureMonths, baseEmi, stdResult]);

  function applyStrategy(extra: number) {
    setExtraEmi(Math.round(extra));
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0" aria-hidden="true">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Smart Loan Saver</h1>
              <p className="text-sm text-slate-500 mt-1">Plan prepayments, compare strategies, see exactly how much interest and time you save</p>
            </div>
          </div>
          <ShareButton principal={principal} rate={rate} tenure={tenureYears} extraEmi={extraEmi} />
        </header>

        {intSaved > 0 && (
          <section
            aria-label="Impact summary"
            className="rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-emerald-600 text-white shadow-lg"
          >
            <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4 max-w-xl">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0" aria-hidden="true">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Your Impact Summary</p>
                  <p className="text-lg md:text-xl font-bold leading-snug">
                    Paying {fmt(extraEmi)} extra each month saves you{" "}
                    <span className="text-emerald-200">{compact(intSaved)}</span> in interest and clears your loan{" "}
                    <span className="text-emerald-200">
                      {yearsSaved > 0 ? `${yearsSaved} year${yearsSaved !== 1 ? "s" : ""}` : ""}
                      {yearsSaved > 0 && mosSaved > 0 ? ", " : ""}
                      {mosSaved > 0 ? `${mosSaved} month${mosSaved !== 1 ? "s" : ""}` : ""}
                      {" "}sooner
                    </span>.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 lg:gap-8 shrink-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-bold tracking-tight">{compact(intSaved)}</p>
                  <p className="text-xs text-white/70 mt-1">Interest Saved</p>
                </div>
                <div className="text-center lg:text-left lg:border-l lg:border-white/20 lg:pl-8">
                  <p className="text-2xl md:text-3xl font-bold tracking-tight">
                    {yearsSaved > 0 ? `${yearsSaved}Y` : ""}{mosSaved > 0 ? ` ${mosSaved}M` : ""}
                  </p>
                  <p className="text-xs text-white/70 mt-1">Debt-Free Sooner</p>
                </div>
                <div className="text-center lg:text-left lg:border-l lg:border-white/20 lg:pl-8">
                  <p className="text-2xl md:text-3xl font-bold tracking-tight">{pctSaved}%</p>
                  <p className="text-xs text-white/70 mt-1">Less Interest</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <section
            aria-label="Loan details"
            className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Loan Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Adjust to match your loan</p>
            </div>
            <div className="p-5 space-y-5 flex-1">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="principal" className="text-xs font-semibold text-slate-600">Principal (₹)</label>
                  <span className="text-xs font-medium text-slate-900">{compact(principal)}</span>
                </div>
                <input
                  id="principal"
                  type="range"
                  min={100000}
                  max={10000000}
                  step={100000}
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="rate" className="text-xs font-semibold text-slate-600">Rate (%)</label>
                  <input
                    id="rate"
                    type="number"
                    min={1}
                    max={30}
                    step={0.1}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="tenure" className="text-xs font-semibold text-slate-600">Tenure (Yrs)</label>
                  <input
                    id="tenure"
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label htmlFor="extra-emi" className="text-xs font-semibold text-emerald-600">Extra payment / month</label>
                  <span className="text-xs font-medium text-emerald-700">{fmt(extraEmi)}</span>
                </div>
                <input
                  id="extra-emi"
                  type="range"
                  min={0}
                  max={Math.round(baseEmi * 0.5)}
                  step={100}
                  value={extraEmi}
                  onChange={(e) => setExtraEmi(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">Monthly EMI: <span className="font-semibold text-slate-900">{fmt(baseEmi)}</span></p>
            </div>
          </section>

          <div className="lg:col-span-9 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Interest Saved", value: compact(intSaved), sub: `${pctSaved}% of standard interest`, color: "border-emerald-200 bg-emerald-50/50", val: "text-emerald-600", sub2: "text-emerald-600/80" },
                { label: "Tenure Saved", value: yearsSaved > 0 || mosSaved > 0 ? `${yearsSaved > 0 ? yearsSaved + "Y " : ""}${mosSaved > 0 ? mosSaved + "M" : ""}` : "—", sub: `Payoff in ${Math.ceil(accResult.monthsToPayoff / 12)} yrs`, color: "border-emerald-200 bg-emerald-50/50", val: "text-emerald-600", sub2: "text-emerald-600/80" },
                { label: "Net Principal", value: compact(principal), sub: "Your loan amount", color: "border-slate-200 bg-white", val: "text-slate-900", sub2: "text-slate-500" },
                { label: "Monthly EMI", value: fmt(baseEmi), sub: extraEmi > 0 ? `+${fmt(extraEmi)} extra` : "No extra payment", color: "border-slate-200 bg-white", val: "text-slate-900", sub2: "text-indigo-600 font-medium" },
              ].map((c) => (
                <div key={c.label} className={`rounded-3xl shadow-sm border p-5 ${c.color}`}>
                  <p className="text-sm font-medium text-slate-600 mb-1">{c.label}</p>
                  <p className={`text-2xl font-bold ${c.val}`}>{c.value}</p>
                  <p className={`text-xs mt-1 ${c.sub2}`}>{c.sub}</p>
                </div>
              ))}
            </div>

            <section aria-label="Loan projection chart" className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col">
              <div className="px-5 pt-5 pb-2 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Loan Projection</h2>
                <div className="flex bg-slate-100 p-1 rounded-lg" role="tablist" aria-label="Chart type">
                  {(["balance", "costs"] as const).map((tab) => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={chartTab === tab}
                      onClick={() => setChartTab(tab)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${chartTab === tab ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                    >
                      {tab === "balance" ? "Balance" : "Total Cost"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5 min-h-[260px]">
                {chartTab === "balance" ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={balanceCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tickFormatter={compact} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                        formatter={(val: number) => [fmt(val)]}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                      <Area type="monotone" dataKey="Standard" stroke="#f43f5e" fillOpacity={1} fill="url(#colorStd)" strokeWidth={2} />
                      <Area type="monotone" dataKey="With Prepayments" stroke="#10b981" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                      <YAxis tickFormatter={compact} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                        formatter={(val: number) => [fmt(val)]}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="Interest" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>
        </main>

        <section aria-label="Prepayment strategies" className="bg-white rounded-3xl shadow-sm border border-slate-200">
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-base font-bold text-slate-900">Smart Payoff Strategies</h2>
            <p className="text-xs text-slate-500 mt-1">Select a strategy to load it into the calculator above</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {strategies.map((s) => (
              <article key={s.title} className={`rounded-2xl p-4 border bg-gradient-to-br ${s.card} flex flex-col`}>
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`w-4 h-4 ${s.iconColor}`} aria-hidden="true" />
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight">{s.title}</h3>
                </div>
                <p className="text-xs text-slate-700 leading-snug mb-3 flex-1">{s.desc}</p>
                <button
                  onClick={() => applyStrategy(s.extra)}
                  className="w-full h-8 text-[11px] font-medium rounded-lg bg-white/60 hover:bg-white border border-white/40 shadow-sm transition-colors"
                >
                  Apply to Calculator
                </button>
              </article>
            ))}
          </div>
          <div className="mx-4 mb-4 mt-1 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0" aria-hidden="true">
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Why prepayment works so well</strong> — In the early years of a home loan, 70–80% of your EMI goes towards interest. Any extra payment directly reduces the outstanding principal, so every subsequent EMI charges interest on a smaller base. The savings compound over the life of the loan.
            </p>
          </div>
        </section>

        <section aria-label="Amortisation schedule" className="bg-white rounded-3xl shadow-sm border border-slate-200">
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Amortisation Schedule</h2>
            <div className="flex bg-slate-100 p-1 rounded-lg" role="tablist" aria-label="Schedule view">
              {(["yearly", "monthly"] as const).map((mode) => (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={tableMode === mode}
                  onClick={() => setTableMode(mode)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${tableMode === mode ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {mode === "yearly" ? "Yearly" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto px-1 pb-4">
            <table className="w-full text-xs text-left" aria-label="Amortisation schedule">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="px-4 py-2 font-semibold">Year</th>
                  <th className="px-4 py-2 font-semibold text-right">Opening</th>
                  <th className="px-4 py-2 font-semibold text-right">EMI Paid</th>
                  {extraEmi > 0 && <th className="px-4 py-2 font-semibold text-right text-emerald-600">Extra</th>}
                  <th className="px-4 py-2 font-semibold text-right text-amber-600">Interest</th>
                  <th className="px-4 py-2 font-semibold text-right text-indigo-600">Principal</th>
                  <th className="px-4 py-2 font-semibold text-right">Closing</th>
                </tr>
              </thead>
              <tbody>
                {accResult.yearlyRows.map((row) => (
                  <tr key={row.year} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-medium text-slate-700">{row.year}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{compact(row.opening)}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{compact(row.emiPaid)}</td>
                    {extraEmi > 0 && <td className="px-4 py-2 text-right text-emerald-600 font-medium">{compact(row.extraPaid)}</td>}
                    <td className="px-4 py-2 text-right text-amber-600">{compact(row.interest)}</td>
                    <td className="px-4 py-2 text-right text-indigo-600">{compact(row.principal)}</td>
                    <td className="px-4 py-2 text-right text-slate-900 font-medium">{compact(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center pb-8">
          <p className="text-xs text-slate-400">
            Smart Loan Saver is a free planning tool. Results are estimates based on the inputs you provide.
            Always consult your lender for official prepayment terms and charges.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Part of <a href="https://loan-khatam.replit.app/" className="text-indigo-500 hover:underline" rel="noopener">Loan Khatam</a> — your personal loan tracker.
          </p>
        </footer>
      </div>
    </div>
  );
}
