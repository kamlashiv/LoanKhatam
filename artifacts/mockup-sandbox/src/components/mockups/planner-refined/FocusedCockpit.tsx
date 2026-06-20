import "./_group.css";
import "./FocusedCockpit.css";
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
  Plus, List, Sparkles, LayoutDashboard, Clock, DollarSign
} from "lucide-react";

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
  { title: "1 Extra EMI / Year", desc: `Saves ${formatRupees(514577)} & 3 Yr(s), 3 Mo(s)`, note: `${formatRupees(21696)}/yr`, icon: TrendingUp },
  { title: "Micro-Savings (5% Monthly)", desc: `Saves ${formatRupees(358882)} & 2 Yr(s), 3 Mo(s)`, note: `+${formatRupees(1085)}/mo`, icon: Award },
  { title: "10% Monthly Boost", desc: `Saves ${formatRupees(626091)} & 4 Yr(s)`, note: `+${formatRupees(2170)}/mo`, icon: PiggyBank },
  { title: "Super-Saver Combo", desc: `Saves ${formatRupees(927880)} & 6 Yr(s)`, note: `+${formatRupees(2170)}/mo · ${formatRupees(21696)}/yr`, icon: Flame },
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

export function FocusedCockpit() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans text-slate-900 cockpit-theme" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="max-w-[1400px] mx-auto space-y-4">
        
        {/* Header - Compact & Dashboard-like */}
        <header className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-lg leading-tight">SMART Strategy</h1>
              <p className="text-xs text-slate-500 font-medium">Loan Payoff Control Center</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-md border-slate-200 text-xs font-semibold"><RefreshCw className="w-3.5 h-3.5" /> Reset</Button>
            <Button size="sm" className="h-8 gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold shadow-sm"><Download className="w-3.5 h-3.5" /> Export</Button>
          </div>
        </header>

        {/* Top Highlight Metrics - dominating information hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interest Saved</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono-numbers mt-0.5">{formatRupees(d.intSaved)}</h3>
              <p className="text-[11px] font-medium text-emerald-600 mt-1">23% total interest avoided</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Time Saved</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono-numbers mt-0.5">{d.tenureSavedYrs} Years</h3>
              <p className="text-[11px] font-medium text-indigo-600 mt-1">Debt-free {d.payoffYears} years sooner</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm flex items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="w-full">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Outflow</p>
              <div className="flex items-end justify-between mt-0.5">
                <h3 className="text-2xl font-black font-mono-numbers">{formatRupees(d.baseEmi + d.extraEmi)}</h3>
                <span className="text-[11px] font-medium text-slate-400 mb-1">Base + Extra</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
                <div className="bg-indigo-500 h-full" style={{ width: `${(d.baseEmi / (d.baseEmi + d.extraEmi)) * 100}%` }}></div>
                <div className="bg-emerald-400 h-full" style={{ width: `${(d.extraEmi / (d.baseEmi + d.extraEmi)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT: Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" /> Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Import */}
                <div className="p-4 border-b border-slate-100">
                  <div className="border border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-3 text-center cursor-pointer transition-colors bg-slate-50/50">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <p className="font-semibold text-xs text-slate-700">Import from File</p>
                    </div>
                    <p className="text-[10px] text-slate-500">PDF · JSON · CSV auto-fill</p>
                  </div>
                </div>

                {/* Sliders */}
                <div className="p-4 space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold text-slate-700">Principal Amount</Label>
                      <span className="text-xs font-black font-mono-numbers text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{formatRupees(d.principal)}</span>
                    </div>
                    <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="py-1" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-slate-700">Interest %</Label>
                        <span className="text-xs font-black font-mono-numbers">{d.rate}%</span>
                      </div>
                      <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="py-1" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 mb-1 block">Tenure (Yrs)</Label>
                      <Input defaultValue={20} className="h-8 rounded-md text-xs font-mono-numbers" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">EMI Start Month</Label>
                    <Input type="month" defaultValue="2024-01" className="h-8 rounded-md text-xs font-mono-numbers" />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold text-emerald-800">Extra Prepayment</Label>
                      <span className="text-xs font-black font-mono-numbers text-emerald-700">{formatRupees(d.extraEmi)}</span>
                    </div>
                    <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="py-1 [&_[role=slider]]:border-emerald-600 [&_[role=slider]]:bg-emerald-600 [&_.bg-primary]:bg-emerald-500" />
                    <Input type="month" defaultValue="2024-06" className="h-7 rounded text-[11px] font-mono-numbers border-emerald-200 bg-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 rounded-xl bg-indigo-50/80 border border-indigo-100 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <p className="font-bold text-[13px] text-indigo-900">Client PDF Report</p>
              </div>
              <Button size="sm" className="h-7 text-[11px] px-3 gap-1.5 rounded-md bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 shadow-sm w-full sm:w-auto"><Download className="w-3 h-3" /> Download</Button>
            </div>

          </div>

          {/* MIDDLE: Charts & Strategies (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Visual Chart */}
            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" /> Projection
                </CardTitle>
                <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                  <button onClick={() => setChartTab("balance")} className={`px-3 py-1 text-[11px] rounded font-bold transition-all ${chartTab === "balance" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>Balance</button>
                  <button onClick={() => setChartTab("costs")} className={`px-3 py-1 text-[11px] rounded font-bold transition-all ${chartTab === "costs" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>Costs</button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[260px]">
                  {chartTab === "balance" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="b_std" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} /><stop offset="95%" stopColor="#94a3b8" stopOpacity={0} /></linearGradient>
                          <linearGradient id="b_acc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontFamily: "'Space Mono', monospace" }} />
                        <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontFamily: "'Space Mono', monospace" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 11, fontFamily: "'Space Mono', monospace" }} formatter={(v: number) => formatRupees(v)} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, marginTop: "10px" }} />
                        <Area type="monotone" name="Standard" dataKey="Standard Balance" stroke="#94a3b8" fill="url(#b_std)" strokeWidth={2} />
                        <Area type="monotone" name="Accelerated" dataKey="Accelerated Balance" stroke="#4f46e5" fill="url(#b_acc)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
                        <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontFamily: "'Space Mono', monospace" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#fff", fontSize: 11, fontFamily: "'Space Mono', monospace" }} formatter={(v: number) => formatRupees(v)} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                        <Bar dataKey="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} barSize={40} />
                        <Bar dataKey="Interest" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Smart Strategies */}
            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-slate-100">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Leverage Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {STRATEGIES.map((s, i) => (
                    <div key={i} className="cockpit-strategy-card rounded-xl p-3 border border-slate-200 bg-white cursor-pointer group flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2"><s.icon className="w-4 h-4 text-indigo-600" /><h3 className="font-bold text-[13px] text-slate-900 group-hover:text-indigo-600 transition-colors">{s.title}</h3></div>
                          <span className="text-[10px] font-bold font-mono-numbers bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">{s.note}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* BOTTOM: Split Donut & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
             <Card className="rounded-xl border-slate-200 shadow-sm h-full flex flex-col">
              <CardHeader className="py-3 px-4 border-b border-slate-100 text-center flex-shrink-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600">Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-grow flex flex-col gap-4">
                <div className="flex-1 min-h-[140px] bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-center text-slate-500 mb-1">Standard</p>
                  <div className="h-36 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={PIE_STANDARD} cx="50%" cy="50%" innerRadius={45} outerRadius={60} stroke="none" dataKey="value">
                          {PIE_STANDARD.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatRupees(v)} contentStyle={{fontSize: 10, fontFamily: "'Space Mono', monospace"}} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Total</span>
                      <span className="text-[12px] font-black font-mono-numbers text-slate-800">{compactRupees(d.stdTotal)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center relative">
                  <p className="text-[11px] font-bold text-center text-emerald-700 mb-2 flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Accelerated</p>
                  <div className="h-36 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={PIE_ACCELERATED} cx="50%" cy="50%" innerRadius={45} outerRadius={60} stroke="none" dataKey="value">
                          {PIE_ACCELERATED.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatRupees(v)} contentStyle={{fontSize: 10, fontFamily: "'Space Mono', monospace"}} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-emerald-700/80 font-bold uppercase">Total</span>
                      <span className="text-[12px] font-black font-mono-numbers text-emerald-800">{compactRupees(d.accTotal)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="rounded-xl border-slate-200 shadow-sm h-full flex flex-col">
              <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between flex-shrink-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2"><List className="w-4 h-4 text-slate-400"/> Ledger</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative"><Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" /><Input placeholder="Search" className="pl-7 h-7 w-32 rounded-md text-[11px] bg-slate-50 border-slate-200" /></div>
                  <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
                    <button onClick={() => setTableMode("yearly")} className={`px-2 py-0.5 text-[10px] rounded font-bold ${tableMode === "yearly" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>YRLY</button>
                    <button onClick={() => setTableMode("monthly")} className={`px-2 py-0.5 text-[10px] rounded font-bold ${tableMode === "monthly" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>MO</button>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Year</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Opening</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">EMI Paid</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Extra</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Interest</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Principal</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Closing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12px] font-mono-numbers">
                    {YEARLY_ROWS.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-2 font-bold text-slate-700 font-sans">Yr {r.year}</td>
                        <td className="px-4 py-2 text-right text-slate-500">{formatRupees(r.opening)}</td>
                        <td className="px-4 py-2 text-right text-slate-500">{formatRupees(r.emiPaid)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Input defaultValue={formatRupees(r.extraPaid)} className="h-7 w-[90px] text-right text-[11px] font-mono-numbers font-bold bg-emerald-50 border-emerald-200 text-emerald-700 ml-auto focus-visible:ring-emerald-500 hover:border-emerald-300 transition-colors shadow-sm" />
                        </td>
                        <td className="px-4 py-2 text-right text-slate-400">{formatRupees(r.interest)}</td>
                        <td className="px-4 py-2 text-right text-slate-600">{formatRupees(r.principal)}</td>
                        <td className="px-4 py-2 text-right font-black text-slate-800">{formatRupees(r.closing)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
