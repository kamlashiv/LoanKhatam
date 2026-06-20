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
  Plus, List, Sparkles, Sun
} from "lucide-react";

import { formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA, YEARLY_ROWS } from "./_Baseline";
import "./WarmSunrise.css";

const WS_COLORS = {
  primary: "#f97316", // orange-500
  secondary: "#f43f5e", // rose-500
  accent: "#f59e0b", // amber-500
  muted: "#fed7aa", // orange-200
  bg: "#fff7ed", // orange-50
  text: "#431407", // orange-950
  textMuted: "#9a3412" // orange-800
};

export const PIE_STANDARD = [
  { name: "Principal", value: DATA.principal, color: WS_COLORS.primary },
  { name: "Total Interest", value: DATA.stdInterest, color: WS_COLORS.accent },
];
export const PIE_ACCELERATED = [
  { name: "Principal", value: DATA.principal, color: WS_COLORS.primary },
  { name: "Total Interest", value: DATA.accInterest, color: WS_COLORS.secondary },
  { name: "Interest Saved", value: DATA.intSaved, color: WS_COLORS.muted },
];

export function WarmSunrise() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  return (
    <div className="warm-sunrise-theme min-h-screen bg-[#fffcf9] p-6 md:p-8 text-[#431407]">
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Soft glowing ambient background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-3xl pointer-events-none translate-x-1/3"></div>

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shrink-0 ws-soft-glow">
              <Sun className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-[32px] leading-none ws-gradient-text">SMART Strategy</h1>
              <p className="text-sm text-orange-900/60 mt-1.5 font-medium">Plan prepayments and see exactly how much interest and time you save.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 rounded-full bg-white text-orange-800 border-orange-200 hover:bg-orange-50 hover:text-orange-900"><RefreshCw className="w-4 h-4" /> Reset</Button>
            <Button className="gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-0 ws-soft-glow"><Download className="w-4 h-4" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

          {/* LEFT: inputs */}
          <div className="space-y-6">
            {/* Import */}
            <Card className="rounded-[2rem] ws-card-border shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2 px-6 pt-6"><CardTitle className="text-[15px] font-bold text-orange-950">Import from File</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="border-2 border-dashed border-orange-200 hover:border-orange-400 bg-orange-50/50 rounded-2xl p-6 text-center cursor-pointer transition-colors">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><Upload className="w-5 h-5 text-orange-500" /></div>
                  <p className="font-bold text-[13px] text-orange-900">Upload or drag a file</p>
                  <p className="text-[11px] text-orange-700/60 mt-1.5 font-medium">PNG · JPG · PDF · JSON · CSV — fills in automatically</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="rounded-[2rem] ws-card-border shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 px-6 pt-6"><CardTitle className="text-[15px] font-bold text-orange-950">Loan Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold text-orange-800">Principal (₹)</Label><span className="text-sm font-extrabold text-rose-600">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="py-1" />
                  <div className="flex justify-between text-[10px] font-bold text-orange-400"><span>₹1L</span><span>₹50L</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold text-orange-800">Interest Rate (%)</Label><span className="text-sm font-extrabold text-orange-600">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="py-1" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-orange-800">Tenure</Label>
                    <div className="flex rounded-full bg-orange-100 p-0.5 text-[11px] font-bold">
                      <button className="px-3 py-1 rounded-full bg-white text-orange-600 shadow-sm">Yr</button>
                      <button className="px-3 py-1 rounded-full text-orange-700/60 hover:text-orange-800">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="h-11 rounded-2xl text-sm font-medium border-orange-200 bg-orange-50/30 focus-visible:ring-orange-400" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-orange-800">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-11 rounded-2xl text-sm font-medium border-orange-200 bg-orange-50/30 focus-visible:ring-orange-400" />
                </div>
                <div className="space-y-3 pt-4 border-t border-orange-100">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold text-amber-600">Extra Monthly Payment</Label><span className="text-sm font-extrabold text-amber-700">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="py-1" />
                  <Input type="month" defaultValue="2024-06" className="h-10 rounded-xl text-xs font-medium border-orange-200 bg-orange-50/30 focus-visible:ring-orange-400" />
                </div>
                <div className="pt-4 border-t border-orange-100 space-y-3">
                  <Label className="text-xs font-bold text-orange-800">Top-up Loan (optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Amt" className="h-10 text-xs font-medium rounded-xl border-orange-200 bg-orange-50/30 focus-visible:ring-orange-400" />
                    <Input placeholder="Rate%" className="h-10 text-xs font-medium rounded-xl border-orange-200 bg-orange-50/30 focus-visible:ring-orange-400" />
                    <Input placeholder="Month" className="h-10 text-xs font-medium rounded-xl border-orange-200 bg-orange-50/30 focus-visible:ring-orange-400" />
                  </div>
                </div>
                <div className="pt-4 border-t border-orange-100 space-y-3">
                  <Label className="text-xs font-bold text-orange-800">Reverse Calculator — Target Years</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="py-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-3xl bg-gradient-to-r from-rose-50 to-orange-50 border border-orange-200/60 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm"><FileText className="w-5 h-5 text-rose-500" /></div>
                <div>
                  <p className="font-extrabold text-[15px] text-orange-950">Print-Ready Client PDF Report</p>
                  <p className="text-[13px] text-orange-800/70 font-medium">A polished one-page summary of this strategy.</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 rounded-full bg-white text-rose-600 border-rose-200 hover:bg-rose-50 shrink-0 font-bold"><Download className="w-4 h-4" /> Download PDF</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-[2rem] p-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white ws-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <p className="text-sm font-bold flex items-center gap-2 text-white/90"><PiggyBank className="w-5 h-5" /> Total Net Interest Saved</p>
                <h3 className="mt-3 text-4xl font-black tracking-tight">{formatRupees(d.intSaved)}</h3>
                <p className="text-[13px] font-medium text-amber-50 mt-2 bg-white/20 inline-block px-3 py-1 rounded-full">≈23% of standard interest avoided</p>
              </div>
              <div className="rounded-[2rem] p-6 bg-gradient-to-br from-rose-400 to-rose-600 text-white ws-shadow relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                <p className="text-sm font-bold flex items-center gap-2 text-white/90"><CalendarRange className="w-5 h-5" /> Accelerated Payoff Timeline</p>
                <h3 className="mt-3 text-[32px] font-black tracking-tight leading-none">{d.payoffYears} years <span className="text-lg font-bold text-rose-100 ml-1">(−{d.tenureSavedYrs} yrs)</span></h3>
                <p className="text-[13px] font-medium text-rose-50 mt-2 bg-white/20 inline-block px-3 py-1 rounded-full">Debt-free 4 years sooner</p>
              </div>
              <div className="md:col-span-2 rounded-[2rem] p-6 bg-white ws-card-border shadow-sm">
                <p className="text-[15px] font-extrabold flex items-center gap-2 mb-4 text-orange-950"><Scale className="w-5 h-5 text-orange-500" /> Monthly Installment Breakdown</p>
                <div className="grid grid-cols-2 gap-y-3 text-[14px]">
                  <span className="text-orange-800/70 font-medium">Base EMI</span><span className="text-right font-bold text-orange-950">{formatRupees(d.baseEmi)}</span>
                  <span className="text-orange-800/70 font-medium">Extra Prepayment</span><span className="text-right font-bold text-rose-500">+{formatRupees(d.extraEmi)}</span>
                  <div className="col-span-2 h-px bg-orange-100 my-1"></div>
                  <span className="text-orange-800/70 font-medium">Total Monthly Outflow</span><span className="text-right font-black text-orange-950">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-orange-800/70 font-medium">Total Repaid (Accelerated)</span><span className="text-right font-black text-orange-950">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="rounded-[2rem] ws-card-border shadow-sm bg-white/80 backdrop-blur-sm relative z-10">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><Sparkles className="w-6 h-6 text-amber-500" /></div>
              <div>
                <h2 className="text-[22px] font-extrabold tracking-tight text-orange-950">Smart Payoff Leverage Strategies</h2>
                <p className="text-[13px] font-medium text-orange-800/60 mt-1">Tap any strategy to load it into the calculator.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="rounded-3xl p-5 border border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition-colors group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3"><s.icon className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" /><h3 className="font-bold text-[15px] text-orange-950">{s.title}</h3></div>
                    <span className="text-[11px] font-extrabold bg-gradient-to-r from-orange-400 to-rose-400 text-white px-3 py-1 rounded-full">{s.note}</span>
                  </div>
                  <div className="space-y-1.5 p-4 rounded-2xl bg-white border border-orange-100 mb-4 shadow-sm">
                    <p className="text-[13px] font-medium text-orange-800">{s.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-10 text-[13px] font-bold rounded-xl bg-white border-orange-200 text-orange-700 hover:text-orange-900 hover:bg-orange-50">Apply to Calculator</Button>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-5 flex items-start gap-4">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[13px] text-orange-800 font-medium leading-relaxed"><strong className="text-orange-950 font-extrabold">The Prepayment Acceleration Magic</strong> — In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="rounded-[2rem] ws-card-border shadow-sm bg-white/80 backdrop-blur-sm relative z-10">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-orange-100 pb-5">
              <h3 className="font-extrabold text-[18px] flex items-center gap-3 text-orange-950"><TrendingUp className="w-6 h-6 text-rose-500" /> Comparative Progress Visual Chart</h3>
              <div className="flex bg-orange-50 p-1 rounded-full border border-orange-100">
                <button onClick={() => setChartTab("balance")} className={`px-5 py-2 text-[13px] rounded-full font-bold transition-colors ${chartTab === "balance" ? "bg-white text-orange-600 shadow-sm" : "text-orange-800/60 hover:text-orange-800"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-5 py-2 text-[13px] rounded-full font-bold transition-colors ${chartTab === "costs" ? "bg-white text-rose-600 shadow-sm" : "text-orange-800/60 hover:text-orange-800"}`}>Costs</button>
              </div>
            </div>
            <div className="h-[360px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#fed7aa" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9a3412", fontWeight: 600 }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9a3412", fontWeight: 600 }} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: "#431407", border: "none", borderRadius: 16, color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.5)" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color: "#431407", paddingTop: 20 }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke="#f59e0b" fill="url(#b_std)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke="#f43f5e" fill="url(#b_acc)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barSize={60}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#fed7aa" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#9a3412", fontWeight: 600 }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9a3412", fontWeight: 600 }} dx={-10} />
                    <Tooltip cursor={{ fill: "#fff7ed" }} contentStyle={{ backgroundColor: "#431407", border: "none", borderRadius: 16, color: "#fff", fontSize: 13, fontWeight: 600 }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color: "#431407", paddingTop: 20 }} />
                    <Bar dataKey="Principal" stackId="a" fill="#f97316" radius={[0, 0, 8, 8]} />
                    <Bar dataKey="Interest" stackId="a" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="rounded-[2rem] ws-card-border shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden relative z-10">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap border-b border-orange-100 p-6 bg-white">
            <CardTitle className="text-[18px] font-extrabold flex items-center gap-3 text-orange-950"><FileText className="w-6 h-6 text-orange-500" /> Detailed Amortization &amp; Repayment Ledger</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative"><Search className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search..." className="pl-10 h-10 w-48 rounded-full text-[13px] font-medium bg-orange-50 border-orange-100 focus-visible:ring-orange-400" /></div>
              <div className="flex bg-orange-50 p-1 rounded-full border border-orange-100">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-1.5 text-[13px] rounded-full font-bold ${tableMode === "yearly" ? "bg-white text-orange-600 shadow-sm" : "text-orange-800/60 hover:text-orange-800"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-1.5 text-[13px] rounded-full font-bold ${tableMode === "monthly" ? "bg-white text-orange-600 shadow-sm" : "text-orange-800/60 hover:text-orange-800"}`}>Monthly</button>
              </div>
              <Button variant="outline" size="sm" className="h-10 px-4 gap-2 rounded-full border-orange-200 text-orange-800 font-bold hover:bg-orange-50 hover:text-orange-900">Export <ChevronDown className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto bg-white/50">
            <table className="w-full text-[13px] text-left">
              <thead className="text-[11px] text-orange-800/70 bg-orange-50/50 uppercase border-b border-orange-100">
                <tr>
                  <th className="px-6 py-4 font-extrabold tracking-wider">Year</th>
                  <th className="px-6 py-4 font-extrabold tracking-wider text-right">Opening</th>
                  <th className="px-6 py-4 font-extrabold tracking-wider text-right">EMI Paid</th>
                  <th className="px-6 py-4 font-extrabold tracking-wider text-right">Extra Prepaid</th>
                  <th className="px-6 py-4 font-extrabold tracking-wider text-right">Interest</th>
                  <th className="px-6 py-4 font-extrabold tracking-wider text-right">Principal</th>
                  <th className="px-6 py-4 font-extrabold tracking-wider text-right">Closing</th>
                </tr>
              </thead>
              <tbody>
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="border-b border-orange-50/50 hover:bg-orange-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-orange-950">Year {r.year}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-orange-800/80">{formatRupees(r.opening)}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-orange-800/80">{formatRupees(r.emiPaid)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Input defaultValue={r.extraPaid} className="h-8 w-24 text-right text-[13px] font-bold bg-amber-50 border-amber-200 text-amber-700 ml-auto focus-visible:ring-amber-400 rounded-lg" />
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-rose-500">{formatRupees(r.interest)}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-orange-800/80">{formatRupees(r.principal)}</td>
                    <td className="px-6 py-3.5 text-right font-black text-orange-950">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <Card className="rounded-[2rem] ws-card-border shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-0 text-center pt-8"><CardTitle className="text-[15px] font-extrabold text-orange-950">Traditional Bank Contract</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_STANDARD} cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="none" dataKey="value" paddingAngle={2}>
                      {PIE_STANDARD.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#431407", border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600 }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color: "#431407" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[13px] text-orange-800/60 font-bold bg-orange-50 px-4 py-1.5 rounded-full mt-2">Total: <span className="text-orange-950 ml-1">{formatRupees(d.stdTotal)}</span></p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-2 border-rose-200 shadow-sm bg-rose-50/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <CardHeader className="pb-0 text-center pt-8 relative z-10"><CardTitle className="text-[15px] font-extrabold text-rose-600 flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Accelerated Prepayment</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center relative z-10">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_ACCELERATED} cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="none" dataKey="value" paddingAngle={2}>
                      {PIE_ACCELERATED.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#431407", border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600 }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color: "#431407" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[13px] text-rose-600 font-bold bg-rose-100/50 px-4 py-1.5 rounded-full mt-2">Total: <span className="text-rose-700 ml-1">{formatRupees(d.accTotal)}</span></p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 pb-12 relative z-10">
          <Button className="gap-2 rounded-full h-12 px-8 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-[15px] ws-soft-glow border-0"><Plus className="w-5 h-5" /> Add Loan</Button>
          <Button variant="outline" className="gap-2 rounded-full h-12 px-8 bg-white border-orange-200 text-orange-800 font-bold text-[15px] hover:bg-orange-50 hover:text-orange-900"><List className="w-5 h-5" /> View All Loans</Button>
        </div>

      </div>
    </div>
  );
}
