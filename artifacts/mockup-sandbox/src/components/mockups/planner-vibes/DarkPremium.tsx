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

import {
  formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA,
  YEARLY_ROWS, PIE_STANDARD, PIE_ACCELERATED
} from "./_Baseline";

import "./DarkPremium.css";

export function DarkPremium() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  // Custom colors for charts
  const CHART_STD = "#475569"; // slate-600
  const CHART_ACC = "#34d399"; // emerald-400
  const CHART_INT_STD = "#64748b"; // slate-500
  const CHART_INT_SAVED = "#0f172a"; // slate-900

  const pieStandard = [
    { name: "Principal", value: d.principal, color: "#334155" }, // slate-700
    { name: "Total Interest", value: d.stdInterest, color: "#64748b" }, // slate-500
  ];

  const pieAccelerated = [
    { name: "Principal", value: d.principal, color: "#334155" }, // slate-700
    { name: "Total Interest", value: d.accInterest, color: "#34d399" }, // emerald-400
    { name: "Interest Saved", value: d.intSaved, color: "#0f172a" }, // slate-900 (blank)
  ];

  return (
    <div className="min-h-screen dark-premium-theme p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Target className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="font-display font-bold tracking-tight text-[30px] leading-none text-white">SMART Strategy</h1>
              <p className="text-sm text-slate-400 mt-1">Plan prepayments and see exactly how much interest and time you save.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-lg bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"><RefreshCw className="w-4 h-4" /> Reset</Button>
            <Button className="gap-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-medium btn-glow"><Download className="w-4 h-4" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: inputs */}
          <div className="space-y-6">
            {/* Import */}
            <Card className="rounded-xl glass-card border-slate-700/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-300">Import from File</CardTitle></CardHeader>
              <CardContent>
                <div className="border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-5 text-center cursor-pointer transition-all glass-card-hover bg-slate-900/30">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mx-auto mb-3 border border-slate-700"><Upload className="w-5 h-5 text-emerald-400" /></div>
                  <p className="font-medium text-sm text-slate-200">Upload or drag a file</p>
                  <p className="text-[10px] text-slate-500 mt-1">PNG · JPG · PDF · JSON · CSV — fills in automatically</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="rounded-xl glass-card border-slate-700/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-300">Loan Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-medium text-slate-400">Principal (₹)</Label><span className="text-sm font-display font-bold text-white">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="[&_[role=slider]]:bg-emerald-400 [&_[role=slider]]:border-emerald-400 [&_[role=track]]:bg-slate-700 [&_[role=range]]:bg-emerald-500" />
                  <div className="flex justify-between text-[10px] text-slate-500 font-display"><span>₹1L</span><span>₹50L</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-medium text-slate-400">Interest Rate (%)</Label><span className="text-sm font-display font-bold text-white">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="[&_[role=slider]]:bg-emerald-400 [&_[role=slider]]:border-emerald-400 [&_[role=track]]:bg-slate-700 [&_[role=range]]:bg-emerald-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-slate-400">Tenure</Label>
                    <div className="flex rounded-md bg-slate-800 p-0.5 text-[11px] font-medium border border-slate-700">
                      <button className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 shadow-sm">Yr</button>
                      <button className="px-2.5 py-0.5 rounded text-slate-400 hover:text-slate-200 transition-colors">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="h-9 rounded-lg text-sm input-dark font-display" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-400">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-9 rounded-lg text-sm input-dark font-display" />
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-800/60">
                  <div className="flex justify-between items-center"><Label className="text-xs font-medium text-emerald-400">Extra Monthly Payment</Label><span className="text-sm font-display font-bold text-emerald-400">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=track]]:bg-slate-700 [&_[role=range]]:bg-cyan-500" />
                  <Input type="month" defaultValue="2024-06" className="h-9 rounded-lg text-sm input-dark font-display" />
                </div>
                <div className="pt-4 border-t border-slate-800/60 space-y-3">
                  <Label className="text-xs font-medium text-slate-400">Top-up Loan (optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Amt" className="h-9 text-sm rounded-lg input-dark font-display placeholder:text-slate-600" />
                    <Input placeholder="Rate%" className="h-9 text-sm rounded-lg input-dark font-display placeholder:text-slate-600" />
                    <Input placeholder="Month" className="h-9 text-sm rounded-lg input-dark font-display placeholder:text-slate-600" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800/60 space-y-3">
                  <Label className="text-xs font-medium text-slate-400">Reverse Calculator — Target Years</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="[&_[role=slider]]:bg-slate-300 [&_[role=slider]]:border-slate-300 [&_[role=track]]:bg-slate-700 [&_[role=range]]:bg-slate-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 px-5 py-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><FileText className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="font-semibold text-sm text-emerald-50">Print-Ready Client PDF Report</p>
                  <p className="text-xs text-slate-400 mt-0.5">A polished one-page summary of this strategy.</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 rounded-lg border-emerald-500/30 bg-slate-950 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 shrink-0 relative z-10"><Download className="w-4 h-4" /> Download PDF</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-6 bg-slate-900/80 border border-slate-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                <div className="absolute -inset-x-20 -inset-y-20 bg-gradient-to-br from-emerald-500/5 to-transparent blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-xs font-medium flex items-center gap-2 text-slate-400"><PiggyBank className="w-4 h-4 text-emerald-400" /> Total Net Interest Saved</p>
                  <h3 className="mt-3 text-[32px] font-display font-bold text-white tracking-tight">{formatRupees(d.intSaved)}</h3>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                    <TrendingUp className="w-3 h-3" /> ≈23% of standard interest avoided
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-slate-900/80 border border-slate-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                <div className="absolute -inset-x-20 -inset-y-20 bg-gradient-to-br from-cyan-500/5 to-transparent blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-xs font-medium flex items-center gap-2 text-slate-400"><CalendarRange className="w-4 h-4 text-cyan-400" /> Accelerated Payoff Timeline</p>
                  <h3 className="mt-3 text-[28px] font-display font-bold text-white tracking-tight leading-none">{d.payoffYears} years</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-medium font-display">−{d.tenureSavedYrs} yrs</span>
                    <span className="text-[11px] text-slate-400">Debt-free 4 years sooner</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 rounded-xl p-6 glass-card">
                <p className="text-sm font-medium flex items-center gap-2 mb-4 text-slate-300"><Scale className="w-4 h-4 text-slate-400" /> Monthly Installment Breakdown</p>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-slate-400">Base EMI</span><span className="text-right font-display text-slate-200">{formatRupees(d.baseEmi)}</span>
                  <span className="text-slate-400">Extra Prepayment</span><span className="text-right font-display text-cyan-400 font-medium">+{formatRupees(d.extraEmi)}</span>
                  <div className="col-span-2 h-px bg-slate-800/60 my-1"></div>
                  <span className="text-slate-300 font-medium">Total Monthly Outflow</span><span className="text-right font-display font-bold text-white">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-slate-400 mt-1">Total Repaid (Accelerated)</span><span className="text-right font-display font-medium text-slate-300 mt-1">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="rounded-xl glass-card border-slate-700/50">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0"><Sparkles className="w-6 h-6 text-cyan-400" /></div>
              <div>
                <h2 className="text-xl font-display font-bold tracking-tight text-white">Smart Payoff Leverage Strategies</h2>
                <p className="text-sm text-slate-400 mt-1">Tap any strategy to load it into the calculator.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="rounded-xl p-5 border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-colors"><s.icon className="w-4 h-4" /></div><h3 className="font-semibold text-sm text-slate-200">{s.title}</h3></div>
                    <span className="text-[10px] font-display font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded">{s.note}</span>
                  </div>
                  <div className="space-y-1.5 p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80 mb-4 relative z-10">
                    <p className="text-xs text-slate-300 leading-relaxed font-display tracking-wide">{s.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs rounded-lg border-slate-700 bg-slate-900/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 relative z-10">Apply to Calculator</Button>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-slate-900/80 border border-slate-800 p-4.5 flex items-start gap-3 shadow-inner">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-slate-200 font-medium">The Prepayment Acceleration Magic</strong> — In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="rounded-xl glass-card border-slate-700/50">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="font-semibold text-base flex items-center gap-2 text-white"><TrendingUp className="w-5 h-5 text-emerald-400" /> Comparative Progress Visual Chart</h3>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button onClick={() => setChartTab("balance")} className={`px-4 py-1.5 text-xs rounded-md font-medium transition-colors ${chartTab === "balance" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-4 py-1.5 text-xs rounded-md font-medium transition-colors ${chartTab === "costs" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>Costs</button>
              </div>
            </div>
            <div className="h-[340px] w-full">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_STD} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART_STD} stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CHART_ACC} stopOpacity={0.4} /><stop offset="95%" stopColor={CHART_ACC} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontFamily: "Space Grotesk" }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontFamily: "Space Grotesk" }} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: 8, color: "#f8fafc", fontSize: 12, fontFamily: "Space Grotesk", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }} itemStyle={{ color: "#f8fafc" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: "20px", color: "#94a3b8" }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke={CHART_STD} fill="url(#b_std)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke={CHART_ACC} fill="url(#b_acc)" strokeWidth={2} activeDot={{ r: 6, fill: CHART_ACC, stroke: "#020617", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b", fontFamily: "Space Grotesk" }} dx={-10} />
                    <Tooltip cursor={{ fill: "#0f172a" }} contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: 8, color: "#f8fafc", fontSize: 12, fontFamily: "Space Grotesk" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: "20px", color: "#94a3b8" }} />
                    <Bar dataKey="Principal" stackId="a" fill="#334155" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Interest" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="rounded-xl glass-card border-slate-700/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap border-b border-slate-800 bg-slate-900/30 p-5 md:p-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2.5 text-white"><FileText className="w-4 h-4 text-slate-400" /> Detailed Amortization &amp; Repayment Ledger</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative"><Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search..." className="pl-9 h-9 w-40 rounded-lg text-xs bg-slate-900 border-slate-700 text-slate-300 placeholder:text-slate-600 focus-visible:ring-emerald-500/30" /></div>
              <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800">
                <button onClick={() => setTableMode("yearly")} className={`px-3 py-1 text-[11px] rounded font-medium ${tableMode === "yearly" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-3 py-1 text-[11px] rounded font-medium ${tableMode === "monthly" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}>Monthly</button>
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs">Export <ChevronDown className="w-3 h-3" /></Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-slate-400 bg-slate-900/80 uppercase tracking-wider font-medium border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4 text-right">Opening</th>
                  <th className="px-6 py-4 text-right">EMI Paid</th>
                  <th className="px-6 py-4 text-right">Extra Prepaid</th>
                  <th className="px-6 py-4 text-right">Interest</th>
                  <th className="px-6 py-4 text-right">Principal</th>
                  <th className="px-6 py-4 text-right">Closing</th>
                </tr>
              </thead>
              <tbody className="font-display">
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="table-row-dark transition-colors">
                    <td className="px-6 py-3.5 text-xs font-medium text-slate-300">Year {r.year}</td>
                    <td className="px-6 py-3.5 text-right text-slate-400">{formatRupees(r.opening)}</td>
                    <td className="px-6 py-3.5 text-right text-slate-400">{formatRupees(r.emiPaid)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Input defaultValue={r.extraPaid} className="h-8 w-24 text-right text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-400 ml-auto font-display focus-visible:ring-cyan-500/30" />
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-500">{formatRupees(r.interest)}</td>
                    <td className="px-6 py-3.5 text-right text-emerald-400/80">{formatRupees(r.principal)}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-200">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-xl glass-card border-slate-700/50">
            <CardHeader className="pb-2 text-center"><CardTitle className="text-sm font-medium text-slate-300">Traditional Bank Contract</CardTitle></CardHeader>
            <CardContent className="p-5 flex flex-col items-center">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="#0f172a" strokeWidth={2} dataKey="value" paddingAngle={2}>
                      {pieStandard.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: 8, color: "#f8fafc", fontSize: 12, fontFamily: "Space Grotesk" }} itemStyle={{ color: "#f8fafc" }} formatter={(v: number) => formatRupees(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total</span>
                  <span className="text-sm font-display font-bold text-slate-300">{compactRupees(d.stdTotal)}</span>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-700"></span> Principal</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Interest</span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl bg-slate-900/80 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
            <CardHeader className="pb-2 text-center relative z-10"><CardTitle className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Accelerated Prepayment</CardTitle></CardHeader>
            <CardContent className="p-5 flex flex-col items-center relative z-10">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="#0f172a" strokeWidth={2} dataKey="value" paddingAngle={2}>
                      {pieAccelerated.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: 8, color: "#f8fafc", fontSize: 12, fontFamily: "Space Grotesk" }} itemStyle={{ color: "#f8fafc" }} formatter={(v: number) => formatRupees(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-4">
                  <span className="text-[10px] text-emerald-500/70 uppercase tracking-wider font-semibold">Total</span>
                  <span className="text-sm font-display font-bold text-white">{compactRupees(d.accTotal)}</span>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-700"></span> Principal</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span> Interest</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 pb-10">
          <Button className="gap-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-medium btn-glow h-10 px-6"><Plus className="w-4 h-4" /> Add Loan</Button>
          <Button variant="outline" className="gap-2 rounded-lg border-slate-700 bg-slate-900/50 text-slate-300 hover:text-white hover:bg-slate-800 h-10 px-6"><List className="w-4 h-4" /> View All Loans</Button>
        </div>

      </div>
    </div>
  );
}
