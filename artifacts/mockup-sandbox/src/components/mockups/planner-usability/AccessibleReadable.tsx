import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Target, Upload, FileText, CheckCircle2, AlertCircle, Loader2,
  TrendingDown, Zap, BarChart3, RefreshCw, Plus,
  Download, Pencil, Save, X, Calculator, Sparkles, ChevronDown,
  PiggyBank, Coins, CalendarRange, Scale, ArrowUpRight, CheckCircle,
  TrendingUp, Award, Flame, Info, Search, Table as TableIcon, EyeOff, ChevronUp,
  ArrowRight
} from "lucide-react";

// --- Helpers & Data ---

const formatRupees = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;
const compactRupees = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
};

const FIXED_DATA = {
  principal: 2500000,
  rate: 8.5,
  tenure: 240,
  baseEmi: 21696,
  extraEmi: 2170,
  standardInterest: 2706939,
  standardTotal: 5206939,
  acceleratedInterest: 2080849,
  acceleratedTotal: 4580849,
  interestSaved: 626091,
  tenureSaved: 48, // 4 years
  payoffStandard: 240,
  payoffAccelerated: 192,
};

const STRATEGIES = [
  { title: "1 Extra EMI / Year", icon: TrendingUp, colors: "bg-blue-50 border-blue-800 text-blue-900", iconColor: "text-blue-900", saves: "₹5,14,577 & 3 Yr(s), 3 Mo(s)", detail: "₹21,696/yr" },
  { title: "Micro-Savings (5% Monthly)", icon: Award, colors: "bg-emerald-50 border-emerald-800 text-emerald-900", iconColor: "text-emerald-900", saves: "₹3,58,882 & 2 Yr(s), 3 Mo(s)", detail: "+₹1,085/mo" },
  { title: "10% Monthly Boost", icon: PiggyBank, colors: "bg-amber-50 border-amber-800 text-amber-900", iconColor: "text-amber-900", saves: "₹6,26,091 & 4 Yr(s)", detail: "+₹2,170/mo" },
  { title: "Super-Saver Combo", icon: Flame, colors: "bg-rose-50 border-rose-800 text-rose-900", iconColor: "text-rose-900", saves: "₹9,27,880 & 6 Yr(s)", detail: "+₹2,170/mo · ₹21,696/yr" },
];

const balanceData = Array.from({ length: 21 }, (_, i) => ({
  year: `Year ${i}`,
  "Standard Balance": Math.max(0, 2500000 - i * (2500000 / 20)),
  "Accelerated Balance": Math.max(0, 2500000 - i * (2500000 / 16)),
}));

const costData = [
  { name: "Standard Path", Principal: 2500000, Interest: 2706939 },
  { name: "Savings Plan", Principal: 2500000, Interest: 2080849 },
];

const pieStandard = [
  { name: "Principal", value: 2500000, color: "#312e81" }, // indigo-900
  { name: "Total Interest", value: 2706939, color: "#78350f" }, // amber-900
];

const pieAccelerated = [
  { name: "Principal", value: 2500000, color: "#312e81" }, // indigo-900
  { name: "Total Interest", value: 2080849, color: "#064e3b" }, // emerald-900
  { name: "Interest Saved", value: 626091, color: "#e2e8f0" }, // slate-200
];

const ledgerData = Array.from({ length: 16 }, (_, i) => {
  const opening = Math.max(0, 2500000 - i * (2500000 / 16));
  const closing = Math.max(0, 2500000 - (i + 1) * (2500000 / 16));
  const emiPaid = 21696 * 12;
  const extraPaid = 2170 * 12;
  const totalPaid = emiPaid + extraPaid;
  const principal = opening - closing;
  const interest = totalPaid - principal;
  return {
    year: i + 1,
    opening,
    emiPaid,
    extraPaid,
    interest: Math.max(0, interest),
    principal,
    closing,
  };
});

// --- Accessible Components ---

const FocusableButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button 
    ref={ref} 
    className={`focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-colors ${className}`}
    {...props} 
  />
));
FocusableButton.displayName = "FocusableButton";

const FocusableInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input 
    ref={ref} 
    className={`focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 border-2 border-slate-400 rounded-md px-4 py-3 text-base text-slate-900 font-medium ${className}`}
    {...props} 
  />
));
FocusableInput.displayName = "FocusableInput";

export function AccessibleReadable() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans text-base lg:text-lg leading-relaxed selection:bg-indigo-200">
      {/* Header & Controls */}
      <header className="bg-slate-100 border-b-4 border-slate-300 py-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-900 text-white flex items-center justify-center shrink-0" aria-hidden="true">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Smart Loan Saver</h1>
                <p className="text-lg font-medium text-slate-700">Prepayment Planner & Report</p>
              </div>
            </div>
            <div>
              <FocusableButton className="flex items-center gap-3 bg-slate-900 text-white hover:bg-slate-800 px-6 py-3 rounded-lg font-bold text-lg shadow-sm">
                <Download className="h-5 w-5" aria-hidden="true" />
                <span>Export Data as CSV</span>
              </FocusableButton>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-slate-300 shadow-sm mb-6">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 border-b-2 border-slate-200 pb-2">Loan Details Input</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label htmlFor="principal" className="text-lg font-bold text-slate-900">Principal Amount (₹)</label>
                <FocusableInput id="principal" type="number" defaultValue="2500000" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="interest" className="text-lg font-bold text-slate-900">Interest Rate (%)</label>
                <FocusableInput id="interest" type="number" defaultValue="8.5" step="0.1" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="tenure" className="text-lg font-bold text-slate-900">Loan Tenure (Months)</label>
                <FocusableInput id="tenure" type="number" defaultValue="240" aria-describedby="tenure-desc" />
                <span id="tenure-desc" className="text-base text-slate-600 font-medium">Example: 240 months = 20 years</span>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="start-month" className="text-lg font-bold text-slate-900">Start Month</label>
                <FocusableInput id="start-month" type="month" defaultValue="2023-01" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
                <label htmlFor="extra-emi" className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                  <Plus className="h-6 w-6" aria-hidden="true"/>
                  Extra Monthly Payment (₹)
                </label>
                <p className="text-base text-indigo-800 font-medium mb-2">How much extra can you pay each month?</p>
                <FocusableInput id="extra-emi" type="number" defaultValue="2170" className="border-indigo-400 bg-white text-xl font-bold py-4" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-slate-200">
              <FocusableButton 
                onClick={() => setShowAdvanced(!showAdvanced)} 
                className="flex items-center gap-3 text-lg font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-6 py-4 rounded-lg w-full md:w-auto"
                aria-expanded={showAdvanced}
                aria-controls="advanced-panel"
              >
                <span>{showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}</span>
                {showAdvanced ? <ChevronUp className="h-6 w-6" aria-hidden="true" /> : <ChevronDown className="h-6 w-6" aria-hidden="true" />}
              </FocusableButton>

              {showAdvanced && (
                <div id="advanced-panel" className="mt-6 grid grid-cols-1 gap-8">
                  <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                      <Upload className="h-6 w-6" aria-hidden="true" /> Auto-fill from Document
                    </h3>
                    <p className="text-base text-slate-700 font-medium mb-4">Upload a PDF or Image of your loan document to fill out the form automatically.</p>
                    <FocusableButton className="bg-white border-2 border-slate-400 text-slate-900 font-bold px-6 py-3 rounded-lg hover:bg-slate-100 flex items-center gap-3">
                      <FileText className="h-5 w-5" aria-hidden="true" /> Select File to Upload
                    </FocusableButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 space-y-16">
        
        {/* Impact Summary - Aria Live Region */}
        <section aria-labelledby="impact-summary-heading">
          <div className="bg-emerald-50 border-4 border-emerald-600 rounded-2xl p-8 md:p-12 text-center" aria-live="polite">
            <h2 id="impact-summary-heading" className="text-2xl font-bold text-emerald-900 mb-6 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8" aria-hidden="true" />
              Your Savings Impact
            </h2>
            <p className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
              You save <span className="text-emerald-700 underline decoration-4 underline-offset-4">₹6,26,091</span> <br/>
              and <span className="text-emerald-700 underline decoration-4 underline-offset-4">4 years</span> of payments.
            </p>
            <p className="text-xl text-slate-800 font-medium max-w-2xl mx-auto">
              By adding just <strong>₹2,170</strong> to your monthly payment, your 20-year loan is paid off in 16 years.
            </p>
          </div>
        </section>

        {/* 4 Stat Cards */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Key Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm flex flex-col">
              <span className="text-lg font-bold text-slate-600 mb-2">Total Interest Saved</span>
              <span className="text-3xl font-black text-emerald-700 mb-2">₹6,26,091</span>
              <span className="text-base text-slate-700 font-medium flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                Saves 23% of total interest
              </span>
            </div>
            <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm flex flex-col">
              <span className="text-lg font-bold text-slate-600 mb-2">Time Saved</span>
              <span className="text-3xl font-black text-indigo-700 mb-2">4 Years</span>
              <span className="text-base text-slate-700 font-medium flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                Finished in 16 years (not 20)
              </span>
            </div>
            <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm flex flex-col">
              <span className="text-lg font-bold text-slate-600 mb-2">Original Principal</span>
              <span className="text-3xl font-black text-slate-900 mb-2">₹25,00,000</span>
              <span className="text-base text-slate-700 font-medium flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-slate-500" aria-hidden="true" />
                Amount borrowed
              </span>
            </div>
            <div className="bg-white border-2 border-slate-300 rounded-xl p-6 shadow-sm flex flex-col">
              <span className="text-lg font-bold text-slate-600 mb-2">New Monthly EMI</span>
              <span className="text-3xl font-black text-slate-900 mb-2">₹23,866</span>
              <span className="text-base text-slate-700 font-medium flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-slate-500" aria-hidden="true" />
                Base ₹21,696 + Extra ₹2,170
              </span>
            </div>
          </div>
        </section>

        <hr className="border-2 border-slate-200" />

        {/* Strategies Section */}
        <section aria-labelledby="strategies-heading">
          <div className="mb-8">
            <h2 id="strategies-heading" className="text-3xl font-black text-slate-900 mb-4">Recommended Prepayment Strategies</h2>
            <p className="text-xl text-slate-700 font-medium">Choose a strategy below to apply it to your calculator.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-8">
            {STRATEGIES.map((s, i) => (
              <div key={i} className={`border-4 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 ${s.colors}`}>
                <div className={`p-4 bg-white rounded-lg border-2 border-current shrink-0 ${s.iconColor}`} aria-hidden="true">
                  <s.icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{s.title}</h3>
                  <p className="text-lg font-medium mb-4">{s.detail}</p>
                  <p className="text-lg font-bold flex items-center gap-2 bg-white inline-flex px-4 py-2 rounded-md border-2 border-current">
                    <CheckCircle className="h-6 w-6" aria-hidden="true" />
                    Saves {s.saves}
                  </p>
                </div>
                <div className="w-full md:w-auto">
                  <FocusableButton className="w-full bg-white text-slate-900 hover:bg-slate-100 border-2 border-slate-900 font-bold text-lg px-8 py-4 rounded-lg whitespace-nowrap">
                    Apply Strategy
                  </FocusableButton>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-100 border-l-8 border-slate-600 p-6 rounded-r-xl">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-3 text-slate-900">
              <Info className="h-7 w-7 text-slate-700" aria-hidden="true" />
              How Prepayment Works
            </h3>
            <p className="text-lg text-slate-800 font-medium">
              In the early years of a loan, 70–80% of your EMI pays for interest, while your principal decreases slowly. Any extra money you pay directly reduces the principal, which means you pay less interest in all future months.
            </p>
          </div>
        </section>

        <hr className="border-2 border-slate-200" />

        {/* Charts Section */}
        <section aria-labelledby="charts-heading">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <h2 id="charts-heading" className="text-3xl font-black text-slate-900">Visual Comparison</h2>
            
            <div className="flex flex-col sm:flex-row bg-slate-200 p-2 rounded-xl w-full md:w-auto gap-2">
              <FocusableButton 
                onClick={() => setChartTab("balance")}
                className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors ${chartTab === "balance" ? "bg-white text-slate-900 shadow-sm border-2 border-slate-900" : "text-slate-700 hover:bg-slate-300 border-2 border-transparent"}`}
                aria-pressed={chartTab === "balance"}
              >
                Loan Balance Over Time
              </FocusableButton>
              <FocusableButton 
                onClick={() => setChartTab("costs")}
                className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors ${chartTab === "costs" ? "bg-white text-slate-900 shadow-sm border-2 border-slate-900" : "text-slate-700 hover:bg-slate-300 border-2 border-transparent"}`}
                aria-pressed={chartTab === "costs"}
              >
                Total Costs Paid
              </FocusableButton>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-300 rounded-xl p-4 md:p-8 h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === "balance" ? (
                <AreaChart data={balanceData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 16, fill: '#1e293b', fontWeight: 600 }} dy={15} minTickGap={30} />
                  <YAxis tickFormatter={compactRupees} tick={{ fontSize: 16, fill: '#1e293b', fontWeight: 600 }} dx={-10} width={80} />
                  <CartesianGrid strokeDasharray="5 5" stroke="#cbd5e1" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #1e293b', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }} 
                    itemStyle={{ color: '#1e293b' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '18px', fontWeight: 'bold', paddingTop: '20px' }} />
                  {/* Using highly contrasting thick strokes for accessibility. No gradients. */}
                  <Area type="step" dataKey="Standard Balance" stroke="#b91c1c" strokeWidth={5} fill="#fecaca" fillOpacity={0.5} name="Standard Plan (Slower)" />
                  <Area type="step" dataKey="Accelerated Balance" stroke="#047857" strokeWidth={5} fill="#d1fae5" fillOpacity={0.5} name="Savings Plan (Faster)" />
                </AreaChart>
              ) : (
                <BarChart data={costData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }} maxBarSize={100}>
                  <XAxis dataKey="name" tick={{ fontSize: 18, fill: '#1e293b', fontWeight: 700 }} dy={15} />
                  <YAxis tickFormatter={compactRupees} tick={{ fontSize: 16, fill: '#1e293b', fontWeight: 600 }} dx={-10} width={80} />
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#cbd5e1" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #1e293b', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '18px', fontWeight: 'bold', paddingTop: '20px' }} />
                  <Bar dataKey="Principal" stackId="a" fill="#1e3a8a" name="Principal (Fixed)" />
                  <Bar dataKey="Interest" stackId="a" fill="#b45309" name="Interest Paid (Varies)" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        <hr className="border-2 border-slate-200" />

        {/* Ledger Section */}
        <section aria-labelledby="ledger-heading">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 id="ledger-heading" className="text-3xl font-black text-slate-900 mb-2">Yearly Breakdown</h2>
              <p className="text-xl text-slate-700 font-medium">Review exactly where your money goes each year.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <label htmlFor="search-ledger" className="sr-only">Search breakdown table</label>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-600" aria-hidden="true" />
                <FocusableInput id="search-ledger" placeholder="Search by year..." className="pl-12 w-full sm:w-auto" />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-lg text-left whitespace-nowrap">
                <caption className="sr-only">Amortization schedule broken down by year</caption>
                <thead className="bg-slate-100 border-b-4 border-slate-300 text-slate-900 font-bold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Year</th>
                    <th scope="col" className="px-6 py-4 text-right">Opening Balance</th>
                    <th scope="col" className="px-6 py-4 text-right">Standard EMI Paid</th>
                    <th scope="col" className="px-6 py-4 text-right">Extra Payment</th>
                    <th scope="col" className="px-6 py-4 text-right">Interest Paid</th>
                    <th scope="col" className="px-6 py-4 text-right">Principal Reduced</th>
                    <th scope="col" className="px-6 py-4 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200">
                  {ledgerData.map((row, i) => (
                    <tr key={i} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">Year {row.year}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">{formatRupees(row.opening)}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">{formatRupees(row.emiPaid)}</td>
                      <td className="px-6 py-4 text-right">
                        <label htmlFor={`extra-paid-${row.year}`} className="sr-only">Extra payment for Year {row.year}</label>
                        <FocusableInput 
                          id={`extra-paid-${row.year}`}
                          type="number" 
                          defaultValue={row.extraPaid}
                          className="w-32 text-right py-2 px-3 border-2 border-slate-400 bg-white ml-auto"
                        />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-amber-900">{formatRupees(row.interest)}</td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-900">{formatRupees(row.principal)}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 bg-slate-50">{formatRupees(row.closing)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-800 text-white font-bold border-t-4 border-slate-900">
                  <tr>
                    <th scope="row" className="px-6 py-5">Grand Total</th>
                    <td className="px-6 py-5"></td>
                    <td className="px-6 py-5 text-right">{formatRupees(21696 * 12 * 16)}</td>
                    <td className="px-6 py-5 text-right">{formatRupees(2170 * 12 * 16)}</td>
                    <td className="px-6 py-5 text-right">{formatRupees(2080849)}</td>
                    <td className="px-6 py-5 text-right">{formatRupees(2500000)}</td>
                    <td className="px-6 py-5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        <hr className="border-2 border-slate-200" />

        {/* Pies Section */}
        <section aria-labelledby="pies-heading">
          <h2 id="pies-heading" className="text-3xl font-black text-slate-900 mb-8 text-center">Summary Breakdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-16">
            <div className="bg-white border-2 border-slate-300 rounded-xl p-8 flex flex-col items-center shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Without Extra Payments</h3>
              <p className="text-xl text-slate-700 font-medium mb-8">Total Paid: <span className="font-bold">₹52,06,939</span></p>
              
              <div className="w-full max-w-[300px] h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieStandard}
                      cx="50%" cy="50%" innerRadius={80} outerRadius={120}
                      paddingAngle={5} dataKey="value" stroke="none"
                    >
                      {pieStandard.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #1e293b', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none" aria-hidden="true">
                  <span className="text-4xl font-black text-slate-900">20</span>
                  <span className="text-xl font-bold text-slate-700 uppercase tracking-wider">Years</span>
                </div>
              </div>
              
              <div className="mt-8 w-full flex flex-col gap-3">
                <div className="flex justify-between items-center bg-slate-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#312e81] border-2 border-slate-900" aria-hidden="true"></span>
                    <span className="text-lg font-bold text-slate-800">Principal</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">₹25L</span>
                </div>
                <div className="flex justify-between items-center bg-slate-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#78350f] border-2 border-slate-900" aria-hidden="true"></span>
                    <span className="text-lg font-bold text-slate-800">Interest</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">₹27L</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border-4 border-emerald-600 rounded-xl p-8 flex flex-col items-center shadow-sm">
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">With Extra Payments</h3>
              <p className="text-xl text-emerald-800 font-medium mb-8">Total Paid: <span className="font-bold underline">₹45,80,849</span></p>
              
              <div className="w-full max-w-[300px] h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieAccelerated}
                      cx="50%" cy="50%" innerRadius={80} outerRadius={120}
                      paddingAngle={5} dataKey="value" stroke="none"
                    >
                      {pieAccelerated.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #1e293b', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none" aria-hidden="true">
                  <span className="text-4xl font-black text-emerald-900">16</span>
                  <span className="text-xl font-bold text-emerald-800 uppercase tracking-wider">Years</span>
                </div>
              </div>
              
              <div className="mt-8 w-full flex flex-col gap-3">
                <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border-2 border-emerald-200">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#312e81] border-2 border-slate-900" aria-hidden="true"></span>
                    <span className="text-lg font-bold text-slate-800">Principal</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">₹25L</span>
                </div>
                <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border-2 border-emerald-200">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#064e3b] border-2 border-slate-900" aria-hidden="true"></span>
                    <span className="text-lg font-bold text-slate-800">Interest</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">₹20.8L</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-100 px-4 py-3 rounded-lg border-2 border-emerald-500 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#e2e8f0] border-2 border-slate-900 flex items-center justify-center" aria-hidden="true">
                      <CheckCircle className="h-4 w-4 text-emerald-700" />
                    </span>
                    <span className="text-lg font-bold text-emerald-900">Interest Saved</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700">₹6.2L</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
