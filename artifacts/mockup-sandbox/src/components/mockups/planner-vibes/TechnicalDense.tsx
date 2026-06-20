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
  Plus, List, Sparkles, Terminal
} from "lucide-react";

import { formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA, YEARLY_ROWS, PIE_STANDARD, PIE_ACCELERATED } from "./_Baseline";
import "./TechnicalDense.css";

export function TechnicalDense() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  // Custom colors for charts to fit the dark tech theme
  const TECH_STD_COLORS = ["#3b82f6", "#f59e0b", "#64748b"];
  const TECH_ACC_COLORS = ["#3b82f6", "#10b981", "#06b6d4"];

  const customPieStandard = PIE_STANDARD.map((item, i) => ({ ...item, color: TECH_STD_COLORS[i % TECH_STD_COLORS.length] }));
  const customPieAccelerated = PIE_ACCELERATED.map((item, i) => ({ ...item, color: TECH_ACC_COLORS[i % TECH_ACC_COLORS.length] }));

  return (
    <div className="vibe-technical-dense p-4 md:p-6 text-sm">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-xl text-slate-100 flex items-center gap-2">
                SMART_STRATEGY_ENGINE <span className="text-[10px] font-normal bg-cyan-950/50 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800 mono-num">v2.4.1</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 mono-num">SYS.MODE: Prepayment Optimization & Analysis</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-8 text-xs"><RefreshCw className="w-3.5 h-3.5" /> RESET</Button>
            <Button className="gap-2 rounded bg-cyan-600 text-white hover:bg-cyan-500 h-8 text-xs"><Download className="w-3.5 h-3.5" /> EXPORT_DATA</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT: inputs */}
          <div className="space-y-4">
            {/* Import */}
            <Card className="tech-panel border-slate-800 rounded-none">
              <CardHeader className="py-2.5 px-3 border-b border-slate-800 bg-slate-900/50">
                <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider"><Upload className="w-3.5 h-3.5 text-cyan-500" /> Import_From_File</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="border border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950 p-4 text-center cursor-pointer transition-colors group">
                  <Upload className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 mx-auto mb-1.5" />
                  <p className="font-medium text-xs text-slate-300">Upload or drag a file</p>
                  <p className="text-[9px] text-slate-500 mt-1 mono-num">PNG | JPG | PDF | JSON | CSV</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="tech-panel border-slate-800 rounded-none">
              <CardHeader className="py-2.5 px-3 border-b border-slate-800 bg-slate-900/50">
                <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider"><Target className="w-3.5 h-3.5 text-cyan-500" /> Loan_Parameters</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center"><Label className="text-[11px] font-medium text-slate-400 uppercase">Principal (INR)</Label><span className="text-xs font-semibold text-cyan-400 mono-num">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="py-1" />
                  <div className="flex justify-between text-[9px] text-slate-600 mono-num"><span>100K</span><span>50M</span></div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center"><Label className="text-[11px] font-medium text-slate-400 uppercase">Interest Rate</Label><span className="text-xs font-semibold text-cyan-400 mono-num">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="py-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label className="text-[11px] font-medium text-slate-400 uppercase">Tenure</Label>
                      <div className="flex border border-slate-700 text-[9px] font-bold uppercase">
                        <button className="px-1.5 py-0.5 bg-cyan-900/50 text-cyan-400 border-r border-slate-700">Yr</button>
                        <button className="px-1.5 py-0.5 text-slate-500 hover:text-slate-300">Mo</button>
                      </div>
                    </div>
                    <Input defaultValue={20} className="h-7 text-xs bg-slate-950 border-slate-700 rounded-none mono-num" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-slate-400 uppercase">Start_Month</Label>
                    <Input type="month" defaultValue="2024-01" className="h-7 text-xs bg-slate-950 border-slate-700 rounded-none mono-num" />
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center"><Label className="text-[11px] font-medium text-emerald-400 uppercase">Extra_Monthly_Pmt</Label><span className="text-xs font-bold text-emerald-400 mono-num">+{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="py-1" />
                  <Input type="month" defaultValue="2024-06" className="h-7 text-xs bg-slate-950 border-slate-700 rounded-none mono-num w-full" />
                </div>
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <Label className="text-[11px] font-medium text-slate-400 uppercase">Top_Up_Loan (Opt)</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Input placeholder="Amt" className="h-7 text-[11px] bg-slate-950 border-slate-700 rounded-none mono-num" />
                    <Input placeholder="Rate%" className="h-7 text-[11px] bg-slate-950 border-slate-700 rounded-none mono-num" />
                    <Input placeholder="Month" className="h-7 text-[11px] bg-slate-950 border-slate-700 rounded-none mono-num" />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[11px] font-medium text-slate-400 uppercase">Reverse_Calc [TGT_YRS]</Label>
                    <span className="text-[10px] text-cyan-400 mono-num">16 YRS</span>
                  </div>
                  <Slider defaultValue={[16]} max={20} min={1} className="py-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-4">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-500" />
                <div>
                  <p className="font-semibold text-xs text-slate-200 uppercase tracking-wide">Client_Report_Generator</p>
                  <p className="text-[10px] text-slate-500 mono-num">COMPILE_PDF_SUMMARY.EXE</p>
                </div>
              </div>
              <Button variant="outline" className="gap-1.5 rounded-none border-cyan-800 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300 h-7 text-[10px] uppercase font-bold shrink-0"><Download className="w-3 h-3" /> Execute</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 tech-panel border-emerald-900/50 bg-emerald-950/20 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3" />
                <p className="text-[10px] font-semibold flex items-center gap-1.5 text-emerald-400 uppercase tracking-widest"><PiggyBank className="w-3.5 h-3.5" /> Net_Interest_Saved</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-emerald-300 mono-num">{formatRupees(d.intSaved)}</h3>
                <p className="text-[10px] text-emerald-500/80 mt-1 mono-num">≈23% OF STD_INTEREST_AVOIDED</p>
              </div>
              <div className="p-4 tech-panel border-blue-900/50 bg-blue-950/20 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3" />
                <p className="text-[10px] font-semibold flex items-center gap-1.5 text-blue-400 uppercase tracking-widest"><CalendarRange className="w-3.5 h-3.5" /> Accel_Payoff_Timeline</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-blue-300 mono-num flex items-baseline gap-2">
                  {d.payoffYears} YRS <span className="text-xs font-normal text-blue-400/80">[−{d.tenureSavedYrs} YRS]</span>
                </h3>
                <p className="text-[10px] text-blue-500/80 mt-1 mono-num">DEBT_FREE_4_YRS_EARLY</p>
              </div>
              
              <div className="md:col-span-2 p-4 tech-panel bg-slate-900/40">
                <p className="text-[10px] font-semibold flex items-center gap-1.5 mb-3 text-slate-300 uppercase tracking-widest"><Scale className="w-3.5 h-3.5 text-cyan-500" /> Monthly_Outflow_Analysis</p>
                <div className="grid grid-cols-2 gap-y-2 text-xs mono-num border-t border-slate-800 pt-2">
                  <span className="text-slate-500">BASE_EMI...................</span><span className="text-right text-slate-300">{formatRupees(d.baseEmi)}</span>
                  <span className="text-slate-500">EXTRA_PREPAYMENT...........</span><span className="text-right text-emerald-400">+{formatRupees(d.extraEmi)}</span>
                  <span className="text-slate-400 mt-1 pt-1 border-t border-slate-800/50">TOTAL_MONTHLY_OUTFLOW......</span><span className="text-right text-cyan-300 font-bold mt-1 pt-1 border-t border-slate-800/50">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-slate-400">TOTAL_REPAID_(ACCEL).......</span><span className="text-right text-cyan-300 font-bold">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="tech-panel border-slate-800 rounded-none mt-2">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">Payoff_Leverage_Protocols</h2>
                <p className="text-[10px] text-slate-500 mono-num mt-0.5">SELECT_PROTOCOL_TO_LOAD</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="p-3 border border-slate-800 bg-slate-900/30 hover:border-cyan-800/50 transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2"><s.icon className="w-3.5 h-3.5 text-cyan-500 group-hover:text-cyan-400" /><h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">{s.title}</h3></div>
                    <span className="text-[9px] font-bold bg-emerald-950/50 border border-emerald-900 text-emerald-400 px-1.5 py-0.5 mono-num">{s.note}</span>
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-800 mb-3">
                    <p className="text-[10px] text-slate-400 mono-num uppercase">{s.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-6 text-[10px] rounded-none border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 uppercase font-bold">Apply_Protocol</Button>
                </div>
              ))}
            </div>
            <div className="mt-4 border-l-2 border-amber-500 bg-amber-950/10 p-3 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed mono-num uppercase"><strong className="text-amber-500/90 font-bold">INFO: Prepayment_Accel_Magic //</strong> IN_EARLY_YEARS, 70-80%_OF_EMI_GOES_TO_INTEREST. EXTRA_PREPAYMENT_ATTACKS_PRINCIPAL_DIRECTLY, COMPOUNDING_SAVINGS.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="tech-panel border-slate-800 rounded-none">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-slate-800 pb-3">
              <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-slate-200"><TrendingUp className="w-4 h-4 text-cyan-500" /> Progress_Telemetry</h3>
              <div className="flex border border-slate-700 bg-slate-900 p-0.5">
                <button onClick={() => setChartTab("balance")} className={`px-3 py-1 text-[10px] uppercase font-bold transition-colors mono-num ${chartTab === "balance" ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}>Balance_Curve</button>
                <button onClick={() => setChartTab("costs")} className={`px-3 py-1 text-[10px] uppercase font-bold transition-colors mono-num ${chartTab === "costs" ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}>Cost_Distribution</button>
              </div>
            </div>
            <div className="h-[280px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std_tech" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc_tech" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="year" axisLine={{stroke: "#334155"}} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontFamily: "JetBrains Mono" }} />
                    <YAxis tickFormatter={compactRupees} axisLine={{stroke: "#334155"}} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontFamily: "JetBrains Mono" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: 0, color: "#f8fafc", fontSize: 11, fontFamily: "JetBrains Mono" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono", textTransform: "uppercase" }} />
                    <Area type="step" dataKey="Standard Balance" stroke="#f43f5e" fill="url(#b_std_tech)" strokeWidth={1.5} />
                    <Area type="step" dataKey="Accelerated Balance" stroke="#06b6d4" fill="url(#b_acc_tech)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" axisLine={{stroke: "#334155"}} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontFamily: "JetBrains Mono" }} />
                    <YAxis tickFormatter={compactRupees} axisLine={{stroke: "#334155"}} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontFamily: "JetBrains Mono" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: 0, color: "#f8fafc", fontSize: 11, fontFamily: "JetBrains Mono" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono", textTransform: "uppercase" }} />
                    <Bar dataKey="Principal" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Interest" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="tech-panel border-slate-800 rounded-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap border-b border-slate-800 py-3 px-4 bg-slate-900/50">
            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-slate-200"><FileText className="w-4 h-4 text-cyan-500" /> Amortization_Log</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input placeholder="QUERY..." className="pl-7 h-7 w-32 rounded-none text-[10px] bg-slate-950 border-slate-700 text-slate-300 mono-num focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
              </div>
              <div className="flex border border-slate-700 bg-slate-900 p-0.5">
                <button onClick={() => setTableMode("yearly")} className={`px-2 py-0.5 text-[9px] uppercase font-bold mono-num ${tableMode === "yearly" ? "bg-slate-800 text-cyan-400" : "text-slate-500"}`}>YRLY</button>
                <button onClick={() => setTableMode("monthly")} className={`px-2 py-0.5 text-[9px] uppercase font-bold mono-num ${tableMode === "monthly" ? "bg-slate-800 text-cyan-400" : "text-slate-500"}`}>MNTH</button>
              </div>
              <Button variant="outline" size="sm" className="h-7 gap-1 rounded-none border-slate-700 bg-slate-900 text-[10px] uppercase font-bold hover:bg-slate-800">EXPORT_CSV <ChevronDown className="w-3 h-3" /></Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left mono-num">
              <thead className="text-[9px] text-slate-500 bg-slate-950 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2 font-normal">PERIOD</th>
                  <th className="px-4 py-2 font-normal text-right">OPENING_BAL</th>
                  <th className="px-4 py-2 font-normal text-right">EMI_PAID</th>
                  <th className="px-4 py-2 font-normal text-right">EXTRA_PREPAID</th>
                  <th className="px-4 py-2 font-normal text-right">INTEREST</th>
                  <th className="px-4 py-2 font-normal text-right">PRINCIPAL</th>
                  <th className="px-4 py-2 font-normal text-right">CLOSING_BAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-900/20">
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-2 text-slate-400">YR_{String(r.year).padStart(2, '0')}</td>
                    <td className="px-4 py-2 text-right text-slate-500">{formatRupees(r.opening)}</td>
                    <td className="px-4 py-2 text-right text-slate-500">{formatRupees(r.emiPaid)}</td>
                    <td className="px-4 py-2 text-right">
                      <Input defaultValue={r.extraPaid} className="h-6 w-20 text-right text-[10px] bg-slate-950 border-slate-700 text-emerald-400 ml-auto rounded-none font-medium focus-visible:ring-1 focus-visible:ring-cyan-500/50" />
                    </td>
                    <td className="px-4 py-2 text-right text-amber-500/80">{formatRupees(r.interest)}</td>
                    <td className="px-4 py-2 text-right text-cyan-400/80">{formatRupees(r.principal)}</td>
                    <td className="px-4 py-2 text-right text-slate-300 font-medium">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="tech-panel border-slate-800 rounded-none">
            <CardHeader className="py-3 px-4 border-b border-slate-800 text-center bg-slate-900/50"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">STD_CONTRACT_DIST</CardTitle></CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-40 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customPieStandard} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="#0f172a" strokeWidth={2} dataKey="value">
                      {customPieStandard.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: 0, color: "#f8fafc", fontSize: 10, fontFamily: "JetBrains Mono" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 9, fontFamily: "JetBrains Mono", textTransform: "uppercase" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-500 mono-num mt-2 border-t border-slate-800 pt-2 w-full text-center">TOTAL_OBLIGATION: <span className="text-slate-300">{formatRupees(d.stdTotal)}</span></p>
            </CardContent>
          </Card>
          <Card className="tech-panel border-cyan-900/50 rounded-none">
            <CardHeader className="py-3 px-4 border-b border-slate-800 text-center bg-slate-900/50"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 flex items-center justify-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> ACCEL_CONTRACT_DIST</CardTitle></CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customPieAccelerated} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="#0f172a" strokeWidth={2} dataKey="value">
                      {customPieAccelerated.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: 0, color: "#f8fafc", fontSize: 10, fontFamily: "JetBrains Mono" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 9, fontFamily: "JetBrains Mono", textTransform: "uppercase" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-cyan-600/80 mono-num mt-2 border-t border-slate-800 pt-2 w-full text-center">TOTAL_OBLIGATION: <span className="text-cyan-400">{formatRupees(d.accTotal)}</span></p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 pb-8 border-t border-slate-800 mt-4">
          <Button className="gap-2 rounded-none bg-cyan-600 hover:bg-cyan-500 text-xs font-bold uppercase tracking-wider h-9 px-6"><Plus className="w-3.5 h-3.5" /> INIT_NEW_LOAN</Button>
          <Button variant="outline" className="gap-2 rounded-none bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider h-9 px-6"><List className="w-3.5 h-3.5" /> VIEW_REGISTRY</Button>
        </div>

      </div>
    </div>
  );
}
