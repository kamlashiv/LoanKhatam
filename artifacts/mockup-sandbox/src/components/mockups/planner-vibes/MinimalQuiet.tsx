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
  formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA, YEARLY_ROWS
} from "./_Baseline";
import "./MinimalQuiet.css";

// Override colors for the minimal quiet vibe (monochrome greys with one restrained accent - subtle blue/grey)
const ACCENT = "#64748b"; // slate-500
const GREY = "#cbd5e1"; // slate-300
const LIGHT_GREY = "#f1f5f9"; // slate-100

const PIE_STANDARD = [
  { name: "Principal", value: DATA.principal, color: ACCENT },
  { name: "Total Interest", value: DATA.stdInterest, color: GREY },
];

const PIE_ACCELERATED = [
  { name: "Principal", value: DATA.principal, color: ACCENT },
  { name: "Total Interest", value: DATA.accInterest, color: "#94a3b8" },
  { name: "Interest Saved", value: DATA.intSaved, color: LIGHT_GREY },
];

export function MinimalQuiet() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  return (
    <div className="pv-minimal-quiet min-h-screen bg-[#fafafa] p-6 md:p-12 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex items-end justify-between gap-6 flex-wrap pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-slate-300 bg-white flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-slate-600 stroke-[1.5]" />
            </div>
            <div>
              <h1 className="font-medium text-2xl tracking-tight text-slate-900">SMART Strategy</h1>
              <p className="text-sm text-slate-500 mt-1 font-light">Plan prepayments and see exactly how much interest and time you save.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 rounded-none border-slate-200 bg-transparent hover:bg-slate-50 text-slate-600 shadow-none font-medium h-9 px-4"><RefreshCw className="w-3.5 h-3.5" /> Reset</Button>
            <Button className="gap-2 rounded-none bg-slate-800 hover:bg-slate-900 text-white shadow-none font-medium h-9 px-4"><Download className="w-3.5 h-3.5" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: inputs */}
          <div className="space-y-8">
            {/* Import */}
            <Card className="rounded-none border border-slate-200 shadow-none bg-white">
              <CardHeader className="pb-4 pt-6 px-6"><CardTitle className="text-sm font-medium text-slate-800">Import from File</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 p-6 text-center cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
                  <p className="font-medium text-sm text-slate-700">Upload or drag a file</p>
                  <p className="text-xs text-slate-500 mt-1 font-light">PNG, JPG, PDF, JSON, CSV</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="rounded-none border border-slate-200 shadow-none bg-white">
              <CardHeader className="pb-4 pt-6 px-6"><CardTitle className="text-sm font-medium text-slate-800">Loan Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Principal</Label><span className="text-sm font-medium">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="[&_[role=slider]]:border-slate-800 [&_[role=slider]]:bg-slate-800 [&_.bg-primary]:bg-slate-800 [&_.bg-secondary]:bg-slate-100" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Interest Rate</Label><span className="text-sm font-medium">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="[&_[role=slider]]:border-slate-800 [&_[role=slider]]:bg-slate-800 [&_.bg-primary]:bg-slate-800 [&_.bg-secondary]:bg-slate-100" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tenure</Label>
                    <div className="flex border border-slate-200 text-xs">
                      <button className="px-3 py-1 bg-slate-800 text-white">Yr</button>
                      <button className="px-3 py-1 text-slate-500 hover:bg-slate-50">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="h-9 rounded-none border-slate-200 shadow-none focus-visible:ring-0 focus-visible:border-slate-400" />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-9 rounded-none border-slate-200 shadow-none focus-visible:ring-0 focus-visible:border-slate-400" />
                </div>
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center"><Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Extra Prepayment</Label><span className="text-sm font-medium">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="[&_[role=slider]]:border-slate-800 [&_[role=slider]]:bg-slate-800 [&_.bg-primary]:bg-slate-800 [&_.bg-secondary]:bg-slate-100" />
                  <Input type="month" defaultValue="2024-06" className="h-9 rounded-none border-slate-200 shadow-none focus-visible:ring-0 focus-visible:border-slate-400" />
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top-up Loan (optional)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="Amt" className="h-9 rounded-none border-slate-200 shadow-none focus-visible:ring-0 focus-visible:border-slate-400 text-xs" />
                    <Input placeholder="Rate%" className="h-9 rounded-none border-slate-200 shadow-none focus-visible:ring-0 focus-visible:border-slate-400 text-xs" />
                    <Input placeholder="Month" className="h-9 rounded-none border-slate-200 shadow-none focus-visible:ring-0 focus-visible:border-slate-400 text-xs" />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Target Years (Reverse Calc)</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="[&_[role=slider]]:border-slate-800 [&_[role=slider]]:bg-slate-800 [&_.bg-primary]:bg-slate-800 [&_.bg-secondary]:bg-slate-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-slate-400 stroke-[1.5]" />
                <div>
                  <p className="font-medium text-sm text-slate-800">Print-Ready Client PDF Report</p>
                  <p className="text-sm text-slate-500 font-light mt-0.5">A polished one-page summary of this strategy.</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 rounded-none bg-transparent border-slate-300 hover:bg-slate-50 text-slate-700 shadow-none h-9 shrink-0"><Download className="w-3.5 h-3.5" /> Download PDF</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 bg-white p-8">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Net Interest Saved</p>
                <h3 className="text-4xl font-light tracking-tight text-slate-900">{formatRupees(d.intSaved)}</h3>
                <p className="text-sm text-slate-500 mt-2 font-light">≈23% of standard interest avoided</p>
              </div>
              <div className="border border-slate-200 bg-white p-8">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Payoff Timeline</p>
                <h3 className="text-4xl font-light tracking-tight text-slate-900 leading-none">{d.payoffYears} <span className="text-lg text-slate-400">years</span></h3>
                <p className="text-sm text-slate-500 mt-2 font-light">Debt-free {d.tenureSavedYrs} years sooner</p>
              </div>
              <div className="md:col-span-2 border border-slate-200 bg-white p-8">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-6">Monthly Installment Breakdown</p>
                <div className="grid grid-cols-2 gap-y-4 text-sm font-light">
                  <span className="text-slate-500">Base EMI</span><span className="text-right text-slate-800">{formatRupees(d.baseEmi)}</span>
                  <span className="text-slate-500">Extra Prepayment</span><span className="text-right text-slate-800">+{formatRupees(d.extraEmi)}</span>
                  <div className="col-span-2 border-t border-slate-100 my-1"></div>
                  <span className="text-slate-700 font-medium">Total Monthly Outflow</span><span className="text-right font-medium text-slate-900">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-slate-500">Total Repaid (Accelerated)</span><span className="text-right text-slate-800">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <div className="border border-slate-200 bg-white p-8">
          <div className="mb-8 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-medium text-slate-900">Smart Payoff Leverage Strategies</h2>
            <p className="text-sm text-slate-500 mt-1 font-light">Tap any strategy to load it into the calculator.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STRATEGIES.map((s, i) => (
              <div key={i} className="group border border-slate-200 p-6 hover:border-slate-400 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-800 flex items-center gap-3">
                    <s.icon className="w-4 h-4 text-slate-400 stroke-[1.5]" />
                    {s.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1">{s.note}</span>
                </div>
                <p className="text-sm text-slate-600 font-light mb-6">{s.desc}</p>
                <div className="text-xs font-medium text-slate-400 group-hover:text-slate-800 transition-colors flex items-center gap-1 uppercase tracking-wider">
                  Apply Strategy <Zap className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600 font-light leading-relaxed max-w-3xl">
              <span className="font-medium text-slate-800">The Prepayment Acceleration Magic</span> — In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.
            </p>
          </div>
        </div>

        {/* Comparative Progress Visual Chart */}
        <div className="border border-slate-200 bg-white p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-lg font-medium text-slate-900">Comparative Progress</h3>
            <div className="flex border border-slate-200 text-xs font-medium">
              <button onClick={() => setChartTab("balance")} className={`px-4 py-1.5 transition-colors ${chartTab === "balance" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Balance</button>
              <button onClick={() => setChartTab("costs")} className={`px-4 py-1.5 transition-colors ${chartTab === "costs" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Costs</button>
            </div>
          </div>
          <div className="h-[360px]">
            {chartTab === "balance" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 300 }} dy={10} />
                  <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 300 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 0, color: "#0f172a", fontSize: 13, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }} 
                    formatter={(v: number) => formatRupees(v)} 
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 20, color: "#64748b" }} />
                  <Area type="monotone" dataKey="Standard Balance" stroke="#cbd5e1" fill="transparent" strokeWidth={2} />
                  <Area type="monotone" dataKey="Accelerated Balance" stroke="#475569" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COST_DATA} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 300 }} dy={10} />
                  <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 300 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 0, color: "#0f172a", fontSize: 13, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }} 
                    formatter={(v: number) => formatRupees(v)} 
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 20, color: "#64748b" }} />
                  <Bar dataKey="Principal" stackId="a" fill="#475569" />
                  <Bar dataKey="Interest" stackId="a" fill="#cbd5e1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Amortization Ledger */}
        <div className="border border-slate-200 bg-white">
          <div className="flex flex-row items-center justify-between gap-4 flex-wrap border-b border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-medium text-slate-900">Amortization Ledger</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
                <Input placeholder="Search..." className="pl-9 h-9 w-48 rounded-none border-slate-200 shadow-none text-sm focus-visible:ring-0 focus-visible:border-slate-400" />
              </div>
              <div className="flex border border-slate-200 text-xs font-medium">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-1.5 transition-colors ${tableMode === "yearly" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-1.5 transition-colors ${tableMode === "monthly" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Monthly</button>
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-2 rounded-none border-slate-200 text-slate-600 shadow-none font-medium px-4">Export <ChevronDown className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 font-medium uppercase tracking-wider border-b border-slate-200 bg-slate-50/50">
                <tr>
                  <th className="px-6 sm:px-8 py-4">Year</th>
                  <th className="px-6 sm:px-8 py-4 text-right">Opening</th>
                  <th className="px-6 sm:px-8 py-4 text-right">EMI Paid</th>
                  <th className="px-6 sm:px-8 py-4 text-right">Extra Prepaid</th>
                  <th className="px-6 sm:px-8 py-4 text-right">Interest</th>
                  <th className="px-6 sm:px-8 py-4 text-right">Principal</th>
                  <th className="px-6 sm:px-8 py-4 text-right">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-light">
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 sm:px-8 py-4 font-normal text-slate-800">Year {r.year}</td>
                    <td className="px-6 sm:px-8 py-4 text-right text-slate-600">{formatRupees(r.opening)}</td>
                    <td className="px-6 sm:px-8 py-4 text-right text-slate-600">{formatRupees(r.emiPaid)}</td>
                    <td className="px-6 sm:px-8 py-4 text-right">
                      <Input defaultValue={r.extraPaid} className="h-8 w-28 rounded-none text-right text-sm bg-transparent border-slate-200 text-slate-800 shadow-none focus-visible:ring-0 focus-visible:border-slate-400 ml-auto" />
                    </td>
                    <td className="px-6 sm:px-8 py-4 text-right text-slate-500">{formatRupees(r.interest)}</td>
                    <td className="px-6 sm:px-8 py-4 text-right text-slate-600">{formatRupees(r.principal)}</td>
                    <td className="px-6 sm:px-8 py-4 text-right font-normal text-slate-800">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-slate-200 bg-white p-8">
            <h3 className="text-sm font-medium text-slate-900 text-center uppercase tracking-wider mb-8">Traditional Contract</h3>
            <div className="flex flex-col items-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_STANDARD} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" dataKey="value">
                      {PIE_STANDARD.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} contentStyle={{ borderRadius: 0, border: '1px solid #e2e8f0', boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-500 font-light mt-4">Total Output: <span className="font-medium text-slate-800">{formatRupees(d.stdTotal)}</span></p>
            </div>
          </div>
          <div className="border border-slate-200 bg-white p-8">
            <h3 className="text-sm font-medium text-slate-900 text-center uppercase tracking-wider mb-8">Accelerated Plan</h3>
            <div className="flex flex-col items-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_ACCELERATED} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" dataKey="value">
                      {PIE_ACCELERATED.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRupees(v)} contentStyle={{ borderRadius: 0, border: '1px solid #e2e8f0', boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-500 font-light mt-4">Total Output: <span className="font-medium text-slate-800">{formatRupees(d.accTotal)}</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 pb-12">
          <Button className="gap-2 rounded-none bg-slate-800 hover:bg-slate-900 text-white shadow-none font-medium h-10 px-6"><Plus className="w-4 h-4" /> Add Loan</Button>
          <Button variant="outline" className="gap-2 rounded-none border-slate-300 hover:bg-slate-50 text-slate-700 shadow-none font-medium h-10 px-6 bg-transparent"><List className="w-4 h-4" /> View All Loans</Button>
        </div>

      </div>
    </div>
  );
}
