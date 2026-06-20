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
  Plus, List, Sparkles, ShieldCheck
} from "lucide-react";

import {
  formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA,
  YEARLY_ROWS, PIE_STANDARD, PIE_ACCELERATED
} from "./_Baseline";

export function SereneTrust() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  // Custom colors for charts
  const C_STD_BAL = "#94a3b8"; // slate-400
  const C_ACC_BAL = "#0ea5e9"; // teal-500
  const C_PRIN = "#3b82f6"; // blue-500
  const C_INT = "#64748b"; // slate-500
  const C_INT_ACC = "#14b8a6"; // teal-500
  const C_INT_SAV = "#e2e8f0"; // slate-200

  const pieStandard = [
    { name: "Principal", value: d.principal, color: C_PRIN },
    { name: "Total Interest", value: d.stdInterest, color: C_INT },
  ];
  const pieAccelerated = [
    { name: "Principal", value: d.principal, color: C_PRIN },
    { name: "Total Interest", value: d.accInterest, color: C_INT_ACC },
    { name: "Interest Saved", value: d.intSaved, color: C_INT_SAV },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .st-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.04), 0 4px 10px -5px rgba(15, 23, 42, 0.02);
        }
        .st-btn-primary {
          background-color: #0369a1;
          color: #ffffff;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .st-btn-primary:hover {
          background-color: #0284c7;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
        }
        .st-input {
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          transition: all 0.2s ease;
        }
        .st-input:focus {
          border-color: #38bdf8;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
        }
        .st-slider .relative > div:first-child {
          background-color: #e2e8f0;
        }
        .st-slider .absolute {
          background-color: #0284c7;
        }
        .st-slider [role="slider"] {
          border-color: #0284c7;
          box-shadow: 0 2px 6px rgba(2, 132, 199, 0.2);
        }
      `}} />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100">
              <ShieldCheck className="w-7 h-7 text-sky-600" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-3xl text-slate-900 leading-tight">SMART Strategy</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Plan prepayments and see exactly how much interest and time you save.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 rounded-xl bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"><RefreshCw className="w-4 h-4" /> Reset</Button>
            <Button className="gap-2 st-btn-primary"><Download className="w-4 h-4" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: inputs */}
          <div className="space-y-6">
            {/* Import */}
            <Card className="st-card">
              <CardHeader className="pb-3 border-b border-slate-50"><CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Import from File</CardTitle></CardHeader>
              <CardContent className="pt-4">
                <div className="border-2 border-dashed border-slate-200 hover:border-sky-300 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-sky-50/50">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><Upload className="w-5 h-5 text-sky-600" /></div>
                  <p className="font-semibold text-sm text-slate-800">Upload or drag a file</p>
                  <p className="text-xs text-slate-500 mt-1.5">PNG · JPG · PDF · JSON · CSV</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="st-card">
              <CardHeader className="pb-3 border-b border-slate-50"><CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Loan Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Principal (₹)</Label><span className="text-sm font-extrabold text-slate-900">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="st-slider" />
                  <div className="flex justify-between text-[10px] font-medium text-slate-400"><span>₹1L</span><span>₹50L</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interest Rate (%)</Label><span className="text-sm font-extrabold text-slate-900">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="st-slider" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenure</Label>
                    <div className="flex rounded-md bg-slate-100 p-0.5 text-xs font-semibold">
                      <button className="px-3 py-1 rounded bg-white shadow-sm text-slate-800">Yr</button>
                      <button className="px-3 py-1 rounded text-slate-500">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="h-10 st-input text-sm font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-10 st-input text-sm font-medium" />
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold text-teal-600 uppercase tracking-wider">Extra Monthly Payment</Label><span className="text-sm font-extrabold text-teal-700">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="st-slider [&_.absolute]:bg-teal-500 [&_[role=slider]]:border-teal-500 [&_[role=slider]]:shadow-teal-500/20" />
                  <Input type="month" defaultValue="2024-06" className="h-9 st-input text-xs font-medium" />
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top-up Loan (optional)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="Amt" className="h-9 st-input text-xs" />
                    <Input placeholder="Rate%" className="h-9 st-input text-xs" />
                    <Input placeholder="Month" className="h-9 st-input text-xs" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reverse Calculator — Target Years</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="st-slider" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl bg-white border border-slate-200 px-6 py-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><FileText className="w-6 h-6 text-slate-600" /></div>
                <div>
                  <p className="font-bold text-slate-900">Print-Ready Client PDF Report</p>
                  <p className="text-sm text-slate-500 mt-0.5">A polished one-page summary of this strategy.</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 rounded-xl bg-white border-slate-200 shrink-0 font-semibold"><Download className="w-4 h-4" /> Download PDF</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl p-6 bg-teal-50 border border-teal-100/50 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-100 rounded-full opacity-50 pointer-events-none"></div>
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-teal-700 mb-1"><PiggyBank className="w-4 h-4" /> Total Net Interest Saved</p>
                <h3 className="mt-3 text-4xl font-extrabold tracking-tight text-teal-900">{formatRupees(d.intSaved)}</h3>
                <p className="text-sm font-medium text-teal-700/80 mt-2">≈23% of standard interest avoided</p>
              </div>
              <div className="rounded-2xl p-6 bg-sky-50 border border-sky-100/50 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-100 rounded-full opacity-50 pointer-events-none"></div>
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-sky-700 mb-1"><CalendarRange className="w-4 h-4" /> Accelerated Payoff Timeline</p>
                <h3 className="mt-3 text-3xl font-extrabold tracking-tight leading-none text-sky-900">{d.payoffYears} years <span className="text-lg font-bold text-sky-700/70 ml-1">(−{d.tenureSavedYrs} yrs)</span></h3>
                <p className="text-sm font-medium text-sky-700/80 mt-3">Debt-free 4 years sooner</p>
              </div>
              <div className="md:col-span-2 rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
                <p className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-800"><Scale className="w-4 h-4 text-sky-600" /> Monthly Installment Breakdown</p>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-slate-500 font-medium">Base EMI</span><span className="text-right font-bold text-slate-900">{formatRupees(d.baseEmi)}</span>
                  <span className="text-slate-500 font-medium">Extra Prepayment</span><span className="text-right font-bold text-teal-600">+{formatRupees(d.extraEmi)}</span>
                  <span className="text-slate-500 font-medium border-t border-slate-100 pt-2 mt-1">Total Monthly Outflow</span><span className="text-right font-extrabold text-slate-900 border-t border-slate-100 pt-2 mt-1">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-slate-500 font-medium">Total Repaid (Accelerated)</span><span className="text-right font-extrabold text-slate-900">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="st-card">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><Sparkles className="w-6 h-6 text-slate-600" /></div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Smart Payoff Leverage Strategies</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Tap any strategy to load it into the calculator.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="rounded-xl p-5 border border-slate-200 bg-white hover:border-sky-300 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-sky-50 transition-colors"><s.icon className="w-4 h-4 text-slate-600 group-hover:text-sky-600" /></div><h3 className="font-bold text-slate-800">{s.title}</h3></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-md">{s.note}</span>
                  </div>
                  <div className="mb-5">
                    <p className="text-sm font-medium text-slate-600">{s.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-9 text-xs rounded-lg font-semibold border-slate-200 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200 transition-colors">Apply to Calculator</Button>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-xl bg-slate-50 border border-slate-200 p-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100"><Zap className="w-4 h-4 text-slate-600" /></div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed pt-1"><strong className="text-slate-900 font-bold">The Prepayment Acceleration Magic</strong> — In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="st-card">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="font-extrabold text-lg flex items-center gap-3 text-slate-900"><TrendingUp className="w-5 h-5 text-sky-600" /> Comparative Progress Visual Chart</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setChartTab("balance")} className={`px-5 py-1.5 text-xs rounded-md font-bold transition-all ${chartTab === "balance" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-5 py-1.5 text-xs rounded-md font-bold transition-all ${chartTab === "costs" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Costs</button>
              </div>
            </div>
            <div className="h-[360px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std_st" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C_STD_BAL} stopOpacity={0.2} /><stop offset="95%" stopColor={C_STD_BAL} stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc_st" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C_ACC_BAL} stopOpacity={0.2} /><stop offset="95%" stopColor={C_ACC_BAL} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#0f172a", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 500, paddingTop: 20 }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke={C_STD_BAL} fill="url(#b_std_st)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: C_STD_BAL }} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke={C_ACC_BAL} fill="url(#b_acc_st)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: C_ACC_BAL }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#64748b", fontWeight: 600 }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }} dx={-10} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#0f172a", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 500, paddingTop: 20 }} />
                    <Bar dataKey="Principal" stackId="a" fill={C_PRIN} radius={[0, 0, 6, 6]} />
                    <Bar dataKey="Interest" stackId="a" fill={C_INT} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="st-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap border-b border-slate-100 bg-white p-6">
            <CardTitle className="text-lg font-extrabold flex items-center gap-3 text-slate-900"><FileText className="w-5 h-5 text-sky-600" /> Detailed Amortization &amp; Repayment Ledger</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search..." className="pl-9 h-10 w-48 st-input text-sm font-medium" /></div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-1.5 text-xs rounded-md font-bold transition-all ${tableMode === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-1.5 text-xs rounded-md font-bold transition-all ${tableMode === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>Monthly</button>
              </div>
              <Button variant="outline" className="h-10 gap-2 rounded-xl font-semibold border-slate-200">Export <ChevronDown className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Year</th>
                  <th className="px-6 py-4 font-bold text-right">Opening</th>
                  <th className="px-6 py-4 font-bold text-right">EMI Paid</th>
                  <th className="px-6 py-4 font-bold text-right">Extra Prepaid</th>
                  <th className="px-6 py-4 font-bold text-right">Interest</th>
                  <th className="px-6 py-4 font-bold text-right">Principal</th>
                  <th className="px-6 py-4 font-bold text-right">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">Year {r.year}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">{formatRupees(r.opening)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">{formatRupees(r.emiPaid)}</td>
                    <td className="px-6 py-4 text-right">
                      <Input defaultValue={r.extraPaid} className="h-8 w-28 text-right text-xs font-bold bg-teal-50 border-teal-100 text-teal-700 ml-auto focus:border-teal-300 focus:ring-2 focus:ring-teal-100" />
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">{formatRupees(r.interest)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">{formatRupees(r.principal)}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="st-card">
            <CardHeader className="pb-2 text-center"><CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Traditional Bank Contract</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="none" dataKey="value" paddingAngle={2}>
                      {pieStandard.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#0f172a", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Repayment</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">{formatRupees(d.stdTotal)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="st-card border-teal-100 bg-teal-50/10">
            <CardHeader className="pb-2 text-center"><CardTitle className="text-sm font-bold uppercase tracking-wider text-teal-600 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Accelerated Prepayment</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="none" dataKey="value" paddingAngle={2}>
                      {pieAccelerated.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, color: "#0f172a", fontSize: 13, fontWeight: 600, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs font-bold text-teal-600/70 uppercase tracking-wider">Total Repayment</p>
                <p className="text-xl font-extrabold text-teal-700 mt-1">{formatRupees(d.accTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 pb-10 border-t border-slate-200 mt-4">
          <Button className="gap-2 rounded-xl st-btn-primary h-12 px-6 font-bold"><Plus className="w-5 h-5" /> Add Loan</Button>
          <Button variant="outline" className="gap-2 rounded-xl bg-white h-12 px-6 font-bold border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"><List className="w-5 h-5" /> View All Loans</Button>
        </div>

      </div>
    </div>
  );
}
