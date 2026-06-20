import "./_group.css";
import "./RefinedEditorial.css";
import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Download, Upload, TrendingUp, PiggyBank, Flame, Search,
  ChevronDown, CheckCircle2, FileText, CalendarRange, Scale, Zap, RefreshCw,
  Plus, List, Sparkles, MoveRight
} from "lucide-react";

export function formatRupees(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(val);
}

export function compactRupees(val: number) {
  if (val === 0) return "₹0";
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

export const DATA = {
  principal: 2500000,
  rate: 8.5,
  tenureMo: 240,
  baseEmi: 21696,
  extraEmi: 2170,
  stdInterest: 2706939,
  stdTotal: 5206939,
  accInterest: 2080849,
  accTotal: 4580849,
  intSaved: 626091,
  tenureSavedYrs: 4,
  payoffYears: 16,
};

export const STRATEGIES = [
  { title: "1 Extra EMI / Year", desc: "Saves ₹5,14,577 & 3 Yr(s), 3 Mo(s)", note: "₹21,696/yr", icon: TrendingUp },
  { title: "Micro-Savings (5%)", desc: "Saves ₹3,58,882 & 2 Yr(s), 3 Mo(s)", note: "+₹1,085/mo", icon: PiggyBank },
  { title: "10% Monthly Boost", desc: "Saves ₹6,26,091 & 4 Yr(s)", note: "+₹2,170/mo", icon: PiggyBank },
  { title: "Super-Saver Combo", desc: "Saves ₹9,27,880 & 6 Yr(s)", note: "+₹2,170/mo · ₹21,696/yr", icon: Flame },
];

export const BALANCE_DATA = Array.from({ length: 21 }, (_, i) => {
  const stdRatio = Math.max(0, 1 - i / 20);
  const accRatio = Math.max(0, 1 - i / 16);
  return {
    year: `Yr ${i}`,
    "Standard Balance": Math.round(DATA.principal * (stdRatio * stdRatio)),
    "Accelerated Balance": Math.round(DATA.principal * (accRatio * accRatio)),
  };
});

export const COST_DATA = [
  { name: "Standard Path", Principal: DATA.principal, Interest: DATA.stdInterest },
  { name: "Savings Plan", Principal: DATA.principal, Interest: DATA.accInterest },
];

export const YEARLY_ROWS = Array.from({ length: 16 }, (_, i) => {
  const opening = Math.max(0, DATA.principal * Math.pow(0.84, i));
  const closing = Math.max(0, DATA.principal * Math.pow(0.84, i + 1));
  return {
    year: i + 1,
    opening: Math.round(opening),
    emiPaid: DATA.baseEmi * 12,
    extraPaid: DATA.extraEmi * 12,
    interest: Math.round((DATA.accInterest / 16) * (1 - i / 22)),
    principal: Math.round(opening - closing),
    closing: Math.round(closing),
  };
});

export const PIE_STANDARD = [
  { name: "Principal", value: DATA.principal, color: "#cbd5e1" },
  { name: "Total Interest", value: DATA.stdInterest, color: "#64748b" },
];
export const PIE_ACCELERATED = [
  { name: "Principal", value: DATA.principal, color: "#cbd5e1" },
  { name: "Total Interest", value: DATA.accInterest, color: "#0f172a" },
  { name: "Interest Saved", value: DATA.intSaved, color: "#059669" },
];

export function RefinedEditorial() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const d = DATA;

  return (
    <div className="min-h-screen refined-editorial-root p-6 md:p-12 lg:p-16">
      <div className="max-w-[1400px] mx-auto space-y-12">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="space-y-3">
            <div className="editorial-label text-slate-400">Financial Planning</div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 leading-tight">
              SMART Strategy
            </h1>
            <p className="text-base text-slate-500 max-w-xl leading-relaxed">
              Plan prepayments with precision. See exactly how much interest and time you save over the lifetime of your loan.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="gap-2 rounded-full h-10 px-5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-4 h-4" /> Reset
            </Button>
            <Button className="gap-2 rounded-full h-10 px-6 bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition-all">
              <Download className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT: Inputs & Controls (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Import Area */}
            <div className="refined-editorial-card p-6 md:p-8">
              <h3 className="editorial-label mb-4">Import Data</h3>
              <div className="border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <Upload className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                </div>
                <p className="font-medium text-sm text-slate-800">Upload loan document</p>
                <p className="text-xs text-slate-500 mt-2">PNG, PDF, or CSV supported</p>
              </div>
            </div>

            {/* Loan Parameters */}
            <div className="refined-editorial-card p-6 md:p-8 flex flex-col gap-8 flex-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-medium text-slate-900">Loan Parameters</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="editorial-label">Principal Amount</label>
                    <span className="font-mono tabular-nums text-sm font-medium text-slate-900">{formatRupees(d.principal)}</span>
                  </div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="py-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="editorial-label">Interest Rate</label>
                    <span className="font-mono tabular-nums text-sm font-medium text-slate-900">{d.rate}%</span>
                  </div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="py-2" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="editorial-label">Tenure (Years)</label>
                    <Input defaultValue={20} className="refined-editorial-input h-11 font-mono tabular-nums text-sm" />
                  </div>
                  <div className="space-y-3">
                    <label className="editorial-label">Start Month</label>
                    <Input type="month" defaultValue="2024-01" className="refined-editorial-input h-11 text-sm font-mono tabular-nums" />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-8 mt-auto">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="editorial-label text-emerald-700">Extra Monthly Payment</label>
                    <span className="font-mono tabular-nums text-sm font-medium text-emerald-700">{formatRupees(d.extraEmi)}</span>
                  </div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="py-2 [&_[role=slider]]:border-emerald-500 [&_[role=slider]]:focus-visible:ring-emerald-500/20 [&_.bg-primary]:bg-emerald-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="editorial-label">Target Payoff (Years)</label>
                    <span className="font-mono tabular-nums text-sm font-medium text-slate-900">{d.payoffYears} yrs</span>
                  </div>
                  <Slider defaultValue={[16]} max={20} min={1} className="py-2" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Outcomes & Visuals (Col span 8) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* The Big Outcomes (Editorial Headlines) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="refined-editorial-card p-8 md:p-10 relative overflow-hidden flex flex-col justify-center group hover:shadow-lg transition-shadow duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500">
                  <PiggyBank className="w-32 h-32" />
                </div>
                <div className="editorial-label mb-4 text-slate-500">Interest Saved</div>
                <div className="text-5xl lg:text-6xl font-light tracking-tighter text-slate-900 mb-3 font-mono tabular-nums">
                  {formatRupees(d.intSaved)}
                </div>
                <p className="text-sm text-emerald-600 font-medium tracking-wide">≈ 23% OF TOTAL INTEREST AVOIDED</p>
              </div>

              <div className="refined-editorial-card p-8 md:p-10 relative overflow-hidden flex flex-col justify-center group hover:shadow-lg transition-shadow duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500">
                  <CalendarRange className="w-32 h-32" />
                </div>
                <div className="editorial-label mb-4 text-slate-500">Time Saved</div>
                <div className="text-5xl lg:text-6xl font-light tracking-tighter text-slate-900 mb-3">
                  <span className="font-mono tabular-nums">{d.payoffYears}</span> <span className="text-3xl text-slate-400">yrs</span>
                </div>
                <p className="text-sm text-slate-600 font-medium tracking-wide">DEBT-FREE <span className="text-slate-900 font-bold">{d.tenureSavedYrs} YEARS</span> SOONER</p>
              </div>
            </div>

            {/* Monthly Breakdown Card */}
            <div className="refined-editorial-card p-8 md:p-10">
              <div className="editorial-label mb-8">Monthly Impact</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                <div>
                  <div className="text-xs text-slate-500 mb-2 font-medium tracking-wide uppercase">Base EMI</div>
                  <div className="text-2xl font-mono tabular-nums text-slate-900">{formatRupees(d.baseEmi)}</div>
                </div>
                <div className="hidden sm:flex items-center justify-center text-slate-200">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-emerald-700/70 mb-2 font-medium tracking-wide uppercase">Prepayment</div>
                  <div className="text-2xl font-mono tabular-nums text-emerald-600">+{formatRupees(d.extraEmi)}</div>
                </div>
                <div className="hidden sm:flex items-center justify-center text-slate-200">
                  <MoveRight className="w-6 h-6" />
                </div>
                <div className="sm:col-span-4 lg:col-span-1 pt-6 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-xs text-slate-500 mb-2 font-bold tracking-wide uppercase">Total Outflow</div>
                  <div className="text-3xl font-mono tabular-nums text-slate-900 font-medium">{formatRupees(d.baseEmi + d.extraEmi)}</div>
                </div>
              </div>
            </div>

            {/* Strategies */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light tracking-tight text-slate-900">Leverage Strategies</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {STRATEGIES.map((s, i) => (
                  <div key={i} className="refined-editorial-card p-6 border-slate-200/60 hover:border-slate-400 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col justify-between focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2 outline-none" tabIndex={0}>
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors duration-300">
                          <s.icon className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="text-[11px] font-mono tabular-nums font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">{s.note}</span>
                      </div>
                      <h4 className="text-base font-medium text-slate-900 mb-2 group-hover:text-slate-900">{s.title}</h4>
                      <p className="text-sm text-slate-500 font-mono tabular-nums tracking-tight">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Area Chart */}
            <div className="refined-editorial-card p-8 md:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-light tracking-tight text-slate-900">Projection</h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium">Balance reduction over time</p>
                </div>
                <div className="flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80">
                  <button onClick={() => setChartTab("balance")} className={`px-6 py-2.5 text-sm rounded-full font-medium transition-all ${chartTab === "balance" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>Balance</button>
                  <button onClick={() => setChartTab("costs")} className={`px-6 py-2.5 text-sm rounded-full font-medium transition-all ${chartTab === "costs" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>Costs</button>
                </div>
              </div>
              <div className="h-[400px] w-full">
                {chartTab === "balance" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="b_std" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} /><stop offset="95%" stopColor="#94a3b8" stopOpacity={0} /></linearGradient>
                        <linearGradient id="b_acc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} /><stop offset="95%" stopColor="#0f172a" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontFamily: 'Space Mono' }} dy={15} tickMargin={10} minTickGap={30} />
                      <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontFamily: 'Space Mono' }} dx={-10} width={80} domain={[0, 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#0f172a", fontSize: 13, fontFamily: 'Space Mono', boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", padding: "12px 16px" }} formatter={(v: number) => formatRupees(v)} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: '30px', fontWeight: 500, color: "#334155" }} />
                      <Area name="Standard Track" type="monotone" dataKey="Standard Balance" stroke="#94a3b8" fill="url(#b_std)" strokeWidth={2.5} activeDot={{ r: 6, strokeWidth: 0, fill: "#94a3b8" }} />
                      <Area name="Accelerated Track" type="monotone" dataKey="Accelerated Balance" stroke="#0f172a" fill="url(#b_acc)" strokeWidth={2.5} activeDot={{ r: 6, strokeWidth: 0, fill: "#0f172a" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: 10, bottom: 0 }} barSize={80}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#475569", fontWeight: 500 }} dy={15} />
                      <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontFamily: 'Space Mono' }} dx={-10} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#0f172a", fontSize: 13, fontFamily: 'Space Mono', boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", padding: "12px 16px" }} formatter={(v: number) => formatRupees(v)} cursor={{ fill: "#f8fafc" }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: '30px', fontWeight: 500, color: "#334155" }} />
                      <Bar dataKey="Principal" stackId="a" fill="#cbd5e1" radius={[0, 0, 6, 6]} />
                      <Bar dataKey="Interest" stackId="a" fill="#0f172a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Doughnut Charts (Left Col span 4 to align with top inputs) */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-2xl font-light tracking-tight text-slate-900 px-2">Composition</h3>
            <div className="refined-editorial-card p-8 text-center relative">
              <h4 className="text-sm font-semibold text-slate-600 mb-8 uppercase tracking-wider">Standard Path</h4>
              <div className="h-56 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total</span>
                  <span className="font-mono tabular-nums text-lg font-medium text-slate-900">{compactRupees(d.stdTotal)}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_STANDARD} cx="50%" cy="50%" innerRadius={70} outerRadius={90} stroke="none" dataKey="value" paddingAngle={2}>
                      {PIE_STANDARD.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'Space Mono', fontSize: '12px' }} itemStyle={{ color: '#0f172a' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-2">
                {PIE_STANDARD.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-mono tabular-nums font-medium text-slate-900">{formatRupees(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="refined-editorial-card p-8 text-center border-emerald-100 bg-emerald-50/30 relative">
              <h4 className="text-sm font-semibold text-emerald-800 mb-8 flex items-center justify-center gap-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Accelerated Path
              </h4>
              <div className="h-56 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest mb-1">Total</span>
                  <span className="font-mono tabular-nums text-lg font-medium text-emerald-900">{compactRupees(d.accTotal)}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_ACCELERATED} cx="50%" cy="50%" innerRadius={70} outerRadius={90} stroke="none" dataKey="value" paddingAngle={2}>
                      {PIE_ACCELERATED.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'Space Mono', fontSize: '12px' }} itemStyle={{ color: '#0f172a' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-2">
                {PIE_ACCELERATED.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-emerald-800/80">{item.name}</span>
                    </div>
                    <span className="font-mono tabular-nums font-medium text-emerald-900">{formatRupees(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Amortization Ledger (Right Col span 8) */}
          <div className="lg:col-span-8">
            <div className="refined-editorial-card p-0 overflow-hidden flex flex-col h-full border border-slate-200/80 shadow-sm">
              <div className="p-8 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-light tracking-tight text-slate-900">Ledger</h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium">Detailed yearly breakdown</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input placeholder="Search year..." className="pl-10 h-10 w-48 rounded-full text-sm bg-slate-50 border-slate-200 hover:border-slate-300 focus:bg-white transition-colors" />
                  </div>
                  <Button variant="outline" size="sm" className="h-10 rounded-full px-5 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium">
                    CSV <Download className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto editorial-scroll flex-1 bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-200/80">
                    <tr>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Period</th>
                      <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Opening</th>
                      <th className="px-6 py-4 font-bold text-right whitespace-nowrap">EMI</th>
                      <th className="px-6 py-4 font-bold text-right whitespace-nowrap text-emerald-700">Extra</th>
                      <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Principal</th>
                      <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Interest</th>
                      <th className="px-6 py-4 font-bold text-right whitespace-nowrap">Closing</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums text-[13px]">
                    {YEARLY_ROWS.map((r, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 even:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4.5 font-sans font-medium text-slate-700 whitespace-nowrap">Year {r.year}</td>
                        <td className="px-6 py-4.5 text-right text-slate-500 whitespace-nowrap">{formatRupees(r.opening)}</td>
                        <td className="px-6 py-4.5 text-right text-slate-500 whitespace-nowrap">{formatRupees(r.emiPaid)}</td>
                        <td className="px-6 py-4.5 text-right text-emerald-600 font-medium whitespace-nowrap">+{formatRupees(r.extraPaid)}</td>
                        <td className="px-6 py-4.5 text-right text-slate-700 whitespace-nowrap">{formatRupees(r.principal)}</td>
                        <td className="px-6 py-4.5 text-right text-slate-400 whitespace-nowrap">{formatRupees(r.interest)}</td>
                        <td className="px-6 py-4.5 text-right text-slate-900 font-medium whitespace-nowrap">{formatRupees(r.closing)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
