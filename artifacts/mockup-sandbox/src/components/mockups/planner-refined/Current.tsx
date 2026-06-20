import "./_group.css";
import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Target, Download, Upload, TrendingUp, Award, PiggyBank, Flame, Search,
  ChevronDown, CheckCircle2, FileText, CalendarRange, Scale, Zap, RefreshCw,
  Plus, List, Sparkles,
} from "lucide-react";

/*
 * CANONICAL BASELINE — Current "SMART Strategy" planner layout.
 * Vibe variants copy this structure 1:1 and only restyle.
 * Not a preview target (underscore prefix).
 */

export function formatRupees(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(val);
}
export function compactRupees(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
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
  { title: "Micro-Savings (5% Monthly)", desc: "Saves ₹3,58,882 & 2 Yr(s), 3 Mo(s)", note: "+₹1,085/mo", icon: Award },
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
  { name: "Principal", value: DATA.principal, color: "#6366f1" },
  { name: "Total Interest", value: DATA.stdInterest, color: "#f59e0b" },
];
export const PIE_ACCELERATED = [
  { name: "Principal", value: DATA.principal, color: "#6366f1" },
  { name: "Total Interest", value: DATA.accInterest, color: "#10b981" },
  { name: "Interest Saved", value: DATA.intSaved, color: "#e5e7eb" },
];

export function Current() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-[30px] leading-none">SMART Strategy</h1>
              <p className="text-sm text-slate-500 mt-1">Plan prepayments and see exactly how much interest and time you save.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl bg-white"><RefreshCw className="w-4 h-4" /> Reset</Button>
            <Button className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"><Download className="w-4 h-4" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: inputs */}
          <div className="space-y-5">
            {/* Import */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Import from File</CardTitle></CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center cursor-pointer transition-colors">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-2"><Upload className="w-5 h-5 text-indigo-600" /></div>
                  <p className="font-semibold text-sm">Upload or drag a file</p>
                  <p className="text-[10px] text-slate-500 mt-1">PNG · JPG · PDF · JSON · CSV — fills in automatically</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Loan Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><Label className="text-xs font-semibold text-slate-600">Principal (₹)</Label><span className="text-xs font-bold">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} />
                  <div className="flex justify-between text-[10px] text-slate-400"><span>₹1L</span><span>₹50L</span></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><Label className="text-xs font-semibold text-slate-600">Interest Rate (%)</Label><span className="text-xs font-bold">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-slate-600">Tenure</Label>
                    <div className="flex rounded-lg border border-slate-200 p-0.5 text-[11px] font-semibold">
                      <button className="px-2 py-0.5 rounded-md bg-indigo-600 text-white">Yr</button>
                      <button className="px-2 py-0.5 rounded-md text-slate-500">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="h-9 rounded-xl text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-9 rounded-xl text-sm" />
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center"><Label className="text-xs font-semibold text-emerald-600">Extra Monthly Payment</Label><span className="text-xs font-bold text-emerald-700">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} />
                  <Input type="month" defaultValue="2024-06" className="h-8 rounded-lg text-xs" />
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Top-up Loan (optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Amt" className="h-8 text-xs rounded-lg" />
                    <Input placeholder="Rate%" className="h-8 text-xs rounded-lg" />
                    <Input placeholder="Month" className="h-8 text-xs rounded-lg" />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Reverse Calculator — Target Years</Label>
                  <Slider defaultValue={[16]} max={20} min={1} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center"><FileText className="w-5 h-5 text-indigo-600" /></div>
                <div>
                  <p className="font-bold text-sm">Print-Ready Client PDF Report</p>
                  <p className="text-xs text-slate-500">A polished one-page summary of this strategy.</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 rounded-xl bg-white shrink-0"><Download className="w-4 h-4" /> Download PDF</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <p className="text-xs font-semibold flex items-center gap-1.5 text-emerald-50"><PiggyBank className="w-4 h-4" /> Total Net Interest Saved</p>
                <h3 className="mt-2 text-3xl font-extrabold tracking-tight">{formatRupees(d.intSaved)}</h3>
                <p className="text-xs text-emerald-100 mt-1">≈23% of standard interest avoided</p>
              </div>
              <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                <p className="text-xs font-semibold flex items-center gap-1.5 text-indigo-50"><CalendarRange className="w-4 h-4" /> Accelerated Payoff Timeline</p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight leading-snug">{d.payoffYears} years <span className="text-base font-bold text-indigo-100">(−{d.tenureSavedYrs} yrs)</span></h3>
                <p className="text-xs text-indigo-100 mt-1">Debt-free 4 years sooner</p>
              </div>
              <div className="md:col-span-2 rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
                <p className="text-sm font-bold flex items-center gap-1.5 mb-3"><Scale className="w-4 h-4 text-indigo-500" /> Monthly Installment Breakdown</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-slate-500">Base EMI</span><span className="text-right font-semibold">{formatRupees(d.baseEmi)}</span>
                  <span className="text-slate-500">Extra Prepayment</span><span className="text-right font-semibold text-emerald-600">+{formatRupees(d.extraEmi)}</span>
                  <span className="text-slate-500">Total Monthly Outflow</span><span className="text-right font-bold">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-slate-500">Total Repaid (Accelerated)</span><span className="text-right font-bold">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Sparkles className="w-5 h-5 text-amber-600" /></div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Smart Payoff Leverage Strategies</h2>
                <p className="text-xs text-slate-500">Tap any strategy to load it into the calculator.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="rounded-2xl p-5 border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><s.icon className="w-5 h-5 text-indigo-600" /><h3 className="font-semibold text-sm sm:text-base">{s.title}</h3></div>
                    <span className="text-xs font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">{s.note}</span>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-100 mb-4">
                    <p className="text-xs text-slate-600">{s.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-8 text-[11px] rounded-lg bg-white">Apply to Calculator</Button>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed"><strong className="text-slate-800">The Prepayment Acceleration Magic</strong> — In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-base flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600" /> Comparative Progress Visual Chart</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setChartTab("balance")} className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-colors ${chartTab === "balance" ? "bg-white shadow-sm" : "text-slate-500"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-colors ${chartTab === "costs" ? "bg-white shadow-sm" : "text-slate-500"}`}>Costs</button>
              </div>
            </div>
            <div className="h-[320px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke="#f43f5e" fill="url(#b_std)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke="#10b981" fill="url(#b_acc)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Interest" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> Detailed Amortization &amp; Repayment Ledger</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search..." className="pl-9 h-9 w-40 rounded-xl text-sm bg-slate-50 border-transparent" /></div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setTableMode("yearly")} className={`px-3 py-1 text-xs rounded-md font-medium ${tableMode === "yearly" ? "bg-white shadow-sm" : "text-slate-500"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-3 py-1 text-xs rounded-md font-medium ${tableMode === "monthly" ? "bg-white shadow-sm" : "text-slate-500"}`}>Monthly</button>
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-1 rounded-xl">Export <ChevronDown className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Year</th>
                  <th className="px-5 py-3 font-semibold text-right">Opening</th>
                  <th className="px-5 py-3 font-semibold text-right">EMI Paid</th>
                  <th className="px-5 py-3 font-semibold text-right">Extra Prepaid</th>
                  <th className="px-5 py-3 font-semibold text-right">Interest</th>
                  <th className="px-5 py-3 font-semibold text-right">Principal</th>
                  <th className="px-5 py-3 font-semibold text-right">Closing</th>
                </tr>
              </thead>
              <tbody>
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-2.5 font-medium">Year {r.year}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{formatRupees(r.opening)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{formatRupees(r.emiPaid)}</td>
                    <td className="px-5 py-2.5 text-right">
                      <Input defaultValue={r.extraPaid} className="h-7 w-24 text-right text-xs bg-emerald-50 border-emerald-100 text-emerald-700 ml-auto" />
                    </td>
                    <td className="px-5 py-2.5 text-right text-rose-600">{formatRupees(r.interest)}</td>
                    <td className="px-5 py-2.5 text-right text-slate-600">{formatRupees(r.principal)}</td>
                    <td className="px-5 py-2.5 text-right font-semibold">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-0 text-center"><CardTitle className="text-sm font-bold">Traditional Bank Contract</CardTitle></CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_STANDARD} cx="50%" cy="50%" innerRadius={50} outerRadius={75} stroke="none" dataKey="value">
                      {PIE_STANDARD.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 font-medium">Total: {formatRupees(d.stdTotal)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-emerald-200 shadow-sm">
            <CardHeader className="pb-0 text-center"><CardTitle className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Accelerated Prepayment</CardTitle></CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_ACCELERATED} cx="50%" cy="50%" innerRadius={50} outerRadius={75} stroke="none" dataKey="value">
                      {PIE_ACCELERATED.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-emerald-600 font-medium">Total: {formatRupees(d.accTotal)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 pb-6">
          <Button className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Loan</Button>
          <Button variant="outline" className="gap-2 rounded-xl bg-white"><List className="w-4 h-4" /> View All Loans</Button>
        </div>

      </div>
    </div>
  );
}
