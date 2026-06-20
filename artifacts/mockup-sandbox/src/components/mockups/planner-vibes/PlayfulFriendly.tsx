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

import { formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA, YEARLY_ROWS } from "./_Baseline";
import "./PlayfulFriendly.css";

const PIE_STANDARD_PF = [
  { name: "Principal", value: DATA.principal, color: "#a3daff" }, // sky
  { name: "Total Interest", value: DATA.stdInterest, color: "#ffdfba" }, // yellow
];
const PIE_ACCELERATED_PF = [
  { name: "Principal", value: DATA.principal, color: "#a3daff" }, // sky
  { name: "Total Interest", value: DATA.accInterest, color: "#a8e6cf" }, // mint
  { name: "Interest Saved", value: DATA.intSaved, color: "#ffb7b2" }, // pink
];

export function PlayfulFriendly() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  return (
    <div className="playful-friendly-theme min-h-screen bg-[#fff0f5] p-6 md:p-8 text-[#4a4a4a]">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-[#ffb7b2] flex items-center justify-center shrink-0 shadow-[0_4px_0_#ff9a9e]">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-black tracking-tight text-[36px] leading-none text-[#ff6b6b]">SMART Strategy</h1>
              <p className="text-base font-semibold text-[#8b8b8b] mt-2">Plan prepayments and see exactly how much interest and time you save! ✨</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="pf-btn bg-white text-[#ff6b6b] border-2 border-[#ffd1d1] hover:bg-[#fff9fa] gap-2 h-12 px-5 text-base"><RefreshCw className="w-5 h-5" /> Reset</Button>
            <Button className="pf-btn bg-[#a3daff] text-[#1e3a8a] border-2 border-[#82cfff] hover:bg-[#82cfff] gap-2 h-12 px-5 text-base"><Download className="w-5 h-5" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: inputs */}
          <div className="space-y-8">
            {/* Import */}
            <Card className="pf-card">
              <CardHeader className="pb-2 bg-[#fff9fa] border-b-2 border-[#ffd1d1]"><CardTitle className="text-xl font-bold text-[#ff6b6b]">Import from File 📁</CardTitle></CardHeader>
              <CardContent className="pt-6">
                <div className="border-4 border-dashed border-[#ffb7b2] hover:border-[#ff9a9e] bg-white rounded-[2rem] p-6 text-center cursor-pointer transition-colors">
                  <div className="w-16 h-16 bg-[#ffdfba] rounded-[1.5rem] flex items-center justify-center mx-auto mb-3 shadow-[0_4px_0_#ffc891]"><Upload className="w-8 h-8 text-[#d97706]" /></div>
                  <p className="font-bold text-lg text-[#d97706]">Drop it here!</p>
                  <p className="text-sm font-semibold text-[#f59e0b] mt-1">PNG · JPG · PDF · JSON · CSV</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="pf-card">
              <CardHeader className="pb-2 bg-[#f0f9ff] border-b-2 border-[#bae6fd]"><CardTitle className="text-xl font-bold text-[#0284c7]">Loan Parameters 🧮</CardTitle></CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-sm font-bold text-[#0284c7]">Principal (₹)</Label><span className="text-lg font-black text-[#0369a1] bg-[#bae6fd] px-3 py-1 rounded-xl">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-[#38bdf8] [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-[0_2px_0_#0284c7]" />
                  <div className="flex justify-between text-xs font-bold text-[#7dd3fc]"><span>₹1L</span><span>₹50L</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-sm font-bold text-[#0284c7]">Interest Rate (%)</Label><span className="text-lg font-black text-[#0369a1] bg-[#bae6fd] px-3 py-1 rounded-xl">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-[#38bdf8] [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-[0_2px_0_#0284c7]" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold text-[#0284c7]">Tenure</Label>
                    <div className="flex rounded-xl border-2 border-[#bae6fd] p-1 text-xs font-black bg-white">
                      <button className="px-3 py-1 rounded-lg bg-[#38bdf8] text-white shadow-[0_2px_0_#0284c7]">Yr</button>
                      <button className="px-3 py-1 rounded-lg text-[#38bdf8]">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="pf-input h-12 text-base text-center border-[#bae6fd] focus:border-[#38bdf8]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#0284c7]">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="pf-input h-12 text-base border-[#bae6fd] focus:border-[#38bdf8]" />
                </div>
                <div className="space-y-4 pt-6 border-t-4 border-dashed border-[#e0f2fe]">
                  <div className="flex justify-between items-center"><Label className="text-sm font-bold text-[#059669]">Extra Monthly Payment 🌟</Label><span className="text-lg font-black text-[#047857] bg-[#a8e6cf] px-3 py-1 rounded-xl">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-[#10b981] [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-[0_2px_0_#059669]" />
                  <Input type="month" defaultValue="2024-06" className="pf-input h-10 text-sm border-[#a8e6cf] focus:border-[#10b981]" />
                </div>
                <div className="pt-6 border-t-4 border-dashed border-[#e0f2fe] space-y-3">
                  <Label className="text-sm font-bold text-[#9333ea]">Top-up Loan (optional) 🎁</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="Amt" className="pf-input h-10 text-sm border-[#dcb0ff] focus:border-[#a855f7]" />
                    <Input placeholder="Rate%" className="pf-input h-10 text-sm border-[#dcb0ff] focus:border-[#a855f7]" />
                    <Input placeholder="Month" className="pf-input h-10 text-sm border-[#dcb0ff] focus:border-[#a855f7]" />
                  </div>
                </div>
                <div className="pt-6 border-t-4 border-dashed border-[#e0f2fe] space-y-3">
                  <Label className="text-sm font-bold text-[#d97706]">Reverse Calculator — Target Years 🎯</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-[#f59e0b] [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-[0_2px_0_#d97706]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-[2rem] bg-[#dcb0ff] border-4 border-[#c084fc] px-6 py-5 shadow-[0_6px_0_#c084fc]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.5rem] bg-white flex items-center justify-center shadow-[0_3px_0_rgba(0,0,0,0.1)]"><FileText className="w-7 h-7 text-[#a855f7]" /></div>
                <div>
                  <p className="font-black text-xl text-[#581c87]">Print-Ready Client PDF Report 📄</p>
                  <p className="text-sm font-bold text-[#7e22ce]">A super polished one-page summary!</p>
                </div>
              </div>
              <Button className="pf-btn bg-white text-[#7e22ce] hover:bg-[#faf5ff] border-2 border-[#e9d5ff] gap-2 h-12 px-6 text-base"><Download className="w-5 h-5" /> Download</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-[2rem] p-6 bg-[#a8e6cf] border-4 border-[#34d399] shadow-[0_6px_0_#34d399] text-[#064e3b]">
                <p className="text-sm font-black flex items-center gap-2 text-[#065f46]"><PiggyBank className="w-5 h-5" /> Total Net Interest Saved</p>
                <h3 className="mt-4 text-4xl font-black tracking-tight">{formatRupees(d.intSaved)}</h3>
                <p className="text-sm font-bold text-[#047857] mt-2 bg-white/40 inline-block px-3 py-1 rounded-full">≈23% of interest avoided! 🎉</p>
              </div>
              <div className="rounded-[2rem] p-6 bg-[#a3daff] border-4 border-[#38bdf8] shadow-[0_6px_0_#38bdf8] text-[#0c4a6e]">
                <p className="text-sm font-black flex items-center gap-2 text-[#0ea5e9]"><CalendarRange className="w-5 h-5" /> Accelerated Payoff Timeline</p>
                <h3 className="mt-4 text-3xl font-black tracking-tight leading-snug">{d.payoffYears} years <br/><span className="text-xl font-bold bg-[#38bdf8] text-white px-3 py-1 rounded-xl inline-block mt-2 shadow-[0_2px_0_#0284c7]">−{d.tenureSavedYrs} yrs! 🚀</span></h3>
              </div>
              <div className="md:col-span-2 rounded-[2rem] p-6 bg-white border-4 border-[#ffd1d1] shadow-[0_6px_0_#ffd1d1]">
                <p className="text-lg font-black flex items-center gap-2 mb-4 text-[#ff6b6b]"><Scale className="w-6 h-6 text-[#ff6b6b]" /> Monthly Installment Breakdown 📊</p>
                <div className="grid grid-cols-2 gap-y-4 text-base bg-[#fff0f5] p-5 rounded-[1.5rem]">
                  <span className="text-[#8b8b8b] font-bold">Base EMI</span><span className="text-right font-black text-[#4a4a4a]">{formatRupees(d.baseEmi)}</span>
                  <span className="text-[#8b8b8b] font-bold">Extra Prepayment</span><span className="text-right font-black text-[#10b981] bg-[#a8e6cf] px-2 py-0.5 rounded-lg justify-self-end">+{formatRupees(d.extraEmi)}</span>
                  <div className="col-span-2 h-1 bg-[#ffd1d1] rounded-full my-1" />
                  <span className="text-[#ff6b6b] font-black text-lg">Total Monthly</span><span className="text-right font-black text-lg text-[#ff6b6b]">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-[#8b8b8b] font-bold mt-2">Total Repaid (Accelerated)</span><span className="text-right font-black text-[#4a4a4a] mt-2">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="pf-card border-4 border-[#ffdfba]">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-[1.5rem] bg-[#ffdfba] flex items-center justify-center shadow-[0_3px_0_#f59e0b]"><Sparkles className="w-7 h-7 text-[#d97706]" /></div>
              <div>
                <h2 className="text-2xl font-black text-[#d97706]">Smart Payoff Leverage Strategies 💡</h2>
                <p className="text-base font-bold text-[#f59e0b]">Tap any strategy to load it into the calculator.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="rounded-[2rem] p-6 border-4 border-[#ffdfba] bg-white hover:-translate-y-1 hover:shadow-[0_6px_0_#ffdfba] transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3"><div className="bg-[#fff3e0] p-2 rounded-xl"><s.icon className="w-6 h-6 text-[#f59e0b]" /></div><h3 className="font-black text-lg text-[#d97706]">{s.title}</h3></div>
                    <span className="text-xs font-black bg-[#a8e6cf] text-[#065f46] px-3 py-1 rounded-xl shadow-[0_2px_0_#10b981]">{s.note}</span>
                  </div>
                  <div className="p-4 rounded-[1.5rem] bg-[#fffaf0] mb-4">
                    <p className="text-sm font-bold text-[#b45309]">{s.desc}</p>
                  </div>
                  <Button className="pf-btn w-full h-12 text-sm bg-[#ffdfba] text-[#b45309] hover:bg-[#fcd34d]">Apply Magic Wand 🪄</Button>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.5rem] bg-[#a3daff] border-4 border-[#7dd3fc] p-5 flex items-start gap-4 shadow-[0_4px_0_#7dd3fc]">
              <div className="bg-white p-2 rounded-xl shadow-sm"><Zap className="w-6 h-6 text-[#0284c7]" /></div>
              <p className="text-sm font-bold text-[#0369a1] leading-relaxed"><strong className="font-black text-[#0c4a6e]">The Prepayment Acceleration Magic ✨</strong> — In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="pf-card border-4 border-[#dcb0ff]">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="font-black text-2xl flex items-center gap-3 text-[#7e22ce]"><TrendingUp className="w-7 h-7" /> Comparative Progress 📈</h3>
              <div className="flex bg-[#f3e8ff] p-1.5 rounded-2xl shadow-inner">
                <button onClick={() => setChartTab("balance")} className={`px-5 py-2 text-sm rounded-xl font-black transition-all ${chartTab === "balance" ? "bg-white text-[#9333ea] shadow-[0_2px_0_#d8b4fe]" : "text-[#a855f7]"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-5 py-2 text-sm rounded-xl font-black transition-all ${chartTab === "costs" ? "bg-white text-[#9333ea] shadow-[0_2px_0_#d8b4fe]" : "text-[#a855f7]"}`}>Costs</button>
              </div>
            </div>
            <div className="h-[400px] bg-[#faf5ff] rounded-[2rem] p-4 border-2 border-[#f3e8ff]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pf_std" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffb7b2" stopOpacity={0.5} /><stop offset="95%" stopColor="#ffb7b2" stopOpacity={0} /></linearGradient>
                      <linearGradient id="pf_acc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a8e6cf" stopOpacity={0.5} /><stop offset="95%" stopColor="#a8e6cf" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e9d5ff" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#a855f7", fontWeight: 'bold' }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#a855f7", fontWeight: 'bold' }} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "4px solid #dcb0ff", borderRadius: 16, color: "#7e22ce", fontSize: 14, fontWeight: 'bold', boxShadow: "0 4px 12px rgba(220,176,255,0.3)" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 14, fontWeight: 'bold', paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke="#ff6b6b" fill="url(#pf_std)" strokeWidth={4} activeDot={{ r: 8, fill: "#ff6b6b", stroke: "#fff", strokeWidth: 3 }} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke="#10b981" fill="url(#pf_acc)" strokeWidth={4} activeDot={{ r: 8, fill: "#10b981", stroke: "#fff", strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barSize={60}>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e9d5ff" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: "#a855f7", fontWeight: 'bold' }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#a855f7", fontWeight: 'bold' }} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "4px solid #dcb0ff", borderRadius: 16, color: "#7e22ce", fontSize: 14, fontWeight: 'bold', boxShadow: "0 4px 12px rgba(220,176,255,0.3)" }} formatter={(v: number) => formatRupees(v)} cursor={{fill: '#f3e8ff'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 14, fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="Principal" stackId="a" fill="#a3daff" radius={[0, 0, 12, 12]} />
                    <Bar dataKey="Interest" stackId="a" fill="#ffdfba" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="pf-card border-4 border-[#a3daff]">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap bg-[#f0f9ff] border-b-4 border-[#bae6fd] pb-6 pt-6">
            <CardTitle className="text-2xl font-black text-[#0284c7] flex items-center gap-3"><FileText className="w-7 h-7" /> Detailed Ledger 📒</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative"><Search className="w-5 h-5 text-[#38bdf8] absolute left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search..." className="pf-input pl-10 h-12 w-48 text-sm border-white shadow-sm" /></div>
              <div className="flex bg-[#e0f2fe] p-1.5 rounded-2xl">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-2 text-sm rounded-xl font-black transition-all ${tableMode === "yearly" ? "bg-white text-[#0369a1] shadow-[0_2px_0_#bae6fd]" : "text-[#0ea5e9]"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-2 text-sm rounded-xl font-black transition-all ${tableMode === "monthly" ? "bg-white text-[#0369a1] shadow-[0_2px_0_#bae6fd]" : "text-[#0ea5e9]"}`}>Monthly</button>
              </div>
              <Button className="pf-btn bg-white text-[#0284c7] border-2 border-[#bae6fd] hover:bg-[#e0f2fe] h-12 gap-2 text-sm"><Download className="w-4 h-4" /> Export</Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto p-4 bg-white">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
              <thead className="text-xs font-black text-[#0284c7] uppercase">
                <tr>
                  <th className="px-5 py-3">Year</th>
                  <th className="px-5 py-3 text-right">Opening</th>
                  <th className="px-5 py-3 text-right">EMI Paid</th>
                  <th className="px-5 py-3 text-right">Extra Prepaid</th>
                  <th className="px-5 py-3 text-right">Interest</th>
                  <th className="px-5 py-3 text-right">Principal</th>
                  <th className="px-5 py-3 text-right">Closing</th>
                </tr>
              </thead>
              <tbody>
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="bg-[#f0f9ff] hover:bg-[#bae6fd] transition-colors rounded-[1rem] [&>td]:first:rounded-l-[1rem] [&>td]:last:rounded-r-[1rem] [&>td]:border-y-2 [&>td]:border-[#bae6fd] [&>td]:first:border-l-2 [&>td]:last:border-r-2 shadow-sm">
                    <td className="px-5 py-4 font-black text-[#0369a1]">Year {r.year}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#0ea5e9]">{formatRupees(r.opening)}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#0ea5e9]">{formatRupees(r.emiPaid)}</td>
                    <td className="px-5 py-4 text-right">
                      <Input defaultValue={r.extraPaid} className="pf-input h-9 w-24 text-right text-sm bg-[#a8e6cf] border-[#34d399] text-[#064e3b] font-black ml-auto shadow-[0_2px_0_#34d399]" />
                    </td>
                    <td className="px-5 py-4 text-right font-black text-[#ff6b6b]">{formatRupees(r.interest)}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#0ea5e9]">{formatRupees(r.principal)}</td>
                    <td className="px-5 py-4 text-right font-black text-[#0284c7]">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="pf-card border-4 border-[#ffdfba]">
            <CardHeader className="pb-0 text-center pt-6"><CardTitle className="text-xl font-black text-[#d97706]">Traditional Bank Contract 🏦</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_STANDARD_PF} cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="#fff" strokeWidth={4} dataKey="value">
                      {PIE_STANDARD_PF.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} contentStyle={{ borderRadius: 16, border: '4px solid #ffdfba', fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 14, fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm font-black text-[#b45309] bg-[#fff3e0] px-4 py-2 rounded-xl mt-2 shadow-[0_2px_0_#fcd34d]">Total: {formatRupees(d.stdTotal)}</p>
            </CardContent>
          </Card>
          <Card className="pf-card border-4 border-[#a8e6cf]">
            <CardHeader className="pb-0 text-center pt-6"><CardTitle className="text-xl font-black text-[#059669] flex items-center justify-center gap-2"><CheckCircle2 className="w-6 h-6" /> Accelerated Prepayment 🚀</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_ACCELERATED_PF} cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="#fff" strokeWidth={4} dataKey="value">
                      {PIE_ACCELERATED_PF.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} contentStyle={{ borderRadius: 16, border: '4px solid #a8e6cf', fontWeight: 'bold' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 14, fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm font-black text-[#047857] bg-[#d1fae5] px-4 py-2 rounded-xl mt-2 shadow-[0_2px_0_#6ee7b7]">Total: {formatRupees(d.accTotal)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 pb-12">
          <Button className="pf-btn bg-[#ffb7b2] text-[#be123c] border-4 border-[#fda4af] hover:bg-[#fda4af] h-14 px-8 text-lg shadow-[0_4px_0_#f43f5e] gap-3"><Plus className="w-6 h-6" /> Add a New Loan! 🎈</Button>
          <Button className="pf-btn bg-white text-[#ff6b6b] border-4 border-[#ffd1d1] hover:bg-[#fff9fa] h-14 px-8 text-lg shadow-[0_4px_0_#ffb7b2] gap-3"><List className="w-6 h-6" /> View All Loans 📚</Button>
        </div>

      </div>
    </div>
  );
}
