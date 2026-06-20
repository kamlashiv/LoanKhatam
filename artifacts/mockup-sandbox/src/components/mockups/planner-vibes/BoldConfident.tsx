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
import { formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA, YEARLY_ROWS, PIE_STANDARD, PIE_ACCELERATED } from "./_Baseline";

export function BoldConfident() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  const fontStyle = (
    <style dangerouslySetInnerHTML={{
      __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        .font-space { font-family: 'Space Grotesk', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `
    }} />
  );

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-8 font-inter text-zinc-300 selection:bg-[#ccff00] selection:text-black">
      {fontStyle}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-none bg-[#ccff00] flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#fff]">
              <Target className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-space font-black tracking-tighter text-4xl text-white uppercase uppercase">SMART Strategy</h1>
              <p className="text-sm text-zinc-400 mt-1 font-medium tracking-wide">Plan prepayments and see exactly how much interest and time you save.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 rounded-none border-2 border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white uppercase font-bold tracking-wider h-11 px-5"><RefreshCw className="w-4 h-4" /> Reset</Button>
            <Button className="gap-2 rounded-none bg-white text-black hover:bg-zinc-200 uppercase font-bold tracking-wider h-11 px-6 shadow-[4px_4px_0px_#ccff00] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"><Download className="w-4 h-4" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: inputs */}
          <div className="space-y-6">
            {/* Import */}
            <Card className="rounded-none border-2 border-zinc-800 bg-[#0a0a0a] shadow-none">
              <CardHeader className="pb-3 border-b border-zinc-800 bg-zinc-900/50"><CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Import from File</CardTitle></CardHeader>
              <CardContent className="p-5">
                <div className="border-2 border-dashed border-zinc-700 hover:border-[#ccff00] hover:bg-[#ccff00]/5 rounded-none p-6 text-center cursor-pointer transition-all duration-200">
                  <div className="w-12 h-12 bg-zinc-800 rounded-none flex items-center justify-center mx-auto mb-3"><Upload className="w-6 h-6 text-[#ccff00]" /></div>
                  <p className="font-bold text-white uppercase text-sm tracking-wide">Upload or drag a file</p>
                  <p className="text-[11px] text-zinc-500 mt-2 font-medium">PNG · JPG · PDF · JSON · CSV</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="rounded-none border-2 border-zinc-800 bg-[#0a0a0a] shadow-none">
              <CardHeader className="pb-3 border-b border-zinc-800 bg-zinc-900/50"><CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Loan Parameters</CardTitle></CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Principal (₹)</Label><span className="text-lg font-space font-bold text-[#ccff00]">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="[&_[role=slider]]:border-[#ccff00] [&_[role=slider]]:bg-[#ccff00] [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-[#ccff00] [&_.bg-secondary]:bg-zinc-800" />
                  <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase"><span>₹1L</span><span>₹50L</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Interest Rate (%)</Label><span className="text-lg font-space font-bold text-white">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="[&_[role=slider]]:border-white [&_[role=slider]]:bg-white [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-zinc-800" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Tenure</Label>
                    <div className="flex border-2 border-zinc-800 p-0.5 text-[11px] font-bold uppercase tracking-wider">
                      <button className="px-3 py-1 bg-white text-black">Yr</button>
                      <button className="px-3 py-1 text-zinc-500 hover:text-white transition-colors">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="h-10 rounded-none border-zinc-700 bg-zinc-900 text-white font-space font-bold text-base focus-visible:ring-[#ccff00] focus-visible:ring-1 focus-visible:ring-offset-0" />
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-zinc-400">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-10 rounded-none border-zinc-700 bg-zinc-900 text-white font-space font-bold text-sm focus-visible:ring-[#ccff00] focus-visible:ring-1 focus-visible:ring-offset-0" />
                </div>
                <div className="space-y-3 pt-5 border-t-2 border-zinc-800">
                  <div className="flex justify-between items-center"><Label className="text-xs font-bold uppercase tracking-wide text-[#ccff00]">Extra Monthly Payment</Label><span className="text-lg font-space font-bold text-[#ccff00]">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="[&_[role=slider]]:border-[#ccff00] [&_[role=slider]]:bg-[#ccff00] [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-[#ccff00] [&_.bg-secondary]:bg-zinc-800" />
                  <Input type="month" defaultValue="2024-06" className="h-9 rounded-none border-zinc-700 bg-zinc-900 text-white font-space font-bold text-xs focus-visible:ring-[#ccff00] focus-visible:ring-1 focus-visible:ring-offset-0 mt-2" />
                </div>
                <div className="pt-5 border-t-2 border-zinc-800 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Top-up Loan (optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Amt" className="h-9 text-xs rounded-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-white focus-visible:ring-1 focus-visible:ring-offset-0" />
                    <Input placeholder="Rate%" className="h-9 text-xs rounded-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-white focus-visible:ring-1 focus-visible:ring-offset-0" />
                    <Input placeholder="Month" className="h-9 text-xs rounded-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-white focus-visible:ring-1 focus-visible:ring-offset-0" />
                  </div>
                </div>
                <div className="pt-5 border-t-2 border-zinc-800 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Reverse Calculator — Target Years</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="[&_[role=slider]]:border-white [&_[role=slider]]:bg-white [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-zinc-800" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#ccff00] px-6 py-5 border-4 border-white shadow-[6px_6px_0px_#fff]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black flex items-center justify-center"><FileText className="w-6 h-6 text-[#ccff00]" strokeWidth={2.5} /></div>
                <div>
                  <p className="font-space font-bold text-black text-lg uppercase tracking-tight leading-none">Print-Ready Client PDF Report</p>
                  <p className="text-sm text-zinc-800 font-medium mt-1">A polished one-page summary of this strategy.</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 rounded-none border-2 border-black bg-transparent text-black hover:bg-black hover:text-[#ccff00] uppercase font-bold tracking-wider shrink-0 h-11"><Download className="w-4 h-4" /> Download PDF</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-zinc-900 border-2 border-zinc-800 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl group-hover:bg-[#ccff00]/20 transition-all duration-500"></div>
                <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-400 mb-2"><PiggyBank className="w-4 h-4 text-[#ccff00]" /> Total Net Interest Saved</p>
                <h3 className="mt-1 text-4xl sm:text-5xl font-space font-black tracking-tighter text-[#ccff00]">{formatRupees(d.intSaved)}</h3>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-500 font-medium">≈23% of standard interest avoided</p>
                </div>
              </div>
              <div className="p-6 bg-zinc-900 border-2 border-zinc-800 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-500"></div>
                <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-400 mb-2"><CalendarRange className="w-4 h-4 text-white" /> Accelerated Payoff Timeline</p>
                <h3 className="mt-1 text-4xl sm:text-5xl font-space font-black tracking-tighter text-white">{d.payoffYears} yrs</h3>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-sm font-bold bg-white text-black px-2 py-0.5 uppercase tracking-wide">(−{d.tenureSavedYrs} yrs)</span>
                  <p className="text-sm text-zinc-500 font-medium">Debt-free 4 years sooner</p>
                </div>
              </div>
              <div className="md:col-span-2 p-6 bg-black border-2 border-zinc-800 shadow-[4px_4px_0px_#3f3f46]">
                <p className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-5 text-white border-b-2 border-zinc-800 pb-3"><Scale className="w-5 h-5 text-[#ccff00]" /> Monthly Installment Breakdown</p>
                <div className="grid grid-cols-2 gap-y-4 text-sm font-medium">
                  <span className="text-zinc-400 uppercase tracking-wide text-xs flex items-center">Base EMI</span>
                  <span className="text-right font-space font-bold text-lg text-white">{formatRupees(d.baseEmi)}</span>
                  
                  <span className="text-zinc-400 uppercase tracking-wide text-xs flex items-center">Extra Prepayment</span>
                  <span className="text-right font-space font-bold text-lg text-[#ccff00]">+{formatRupees(d.extraEmi)}</span>
                  
                  <span className="text-zinc-300 uppercase tracking-wide text-xs font-bold pt-3 border-t border-zinc-800 flex items-center">Total Monthly Outflow</span>
                  <span className="text-right font-space font-bold text-xl text-white pt-3 border-t border-zinc-800">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  
                  <span className="text-zinc-300 uppercase tracking-wide text-xs font-bold pt-3 border-t border-zinc-800 flex items-center">Total Repaid (Accelerated)</span>
                  <span className="text-right font-space font-bold text-xl text-white pt-3 border-t border-zinc-800">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="rounded-none border-2 border-zinc-800 bg-[#0a0a0a] shadow-[4px_4px_0px_#18181b]">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white flex items-center justify-center shrink-0"><Sparkles className="w-6 h-6 text-black" fill="black" /></div>
              <div>
                <h2 className="font-space text-2xl font-black uppercase tracking-tight text-white">Smart Payoff Leverage Strategies</h2>
                <p className="text-sm text-zinc-400 mt-1">Tap any strategy to load it into the calculator.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="p-5 border-2 border-zinc-800 bg-black hover:border-[#ccff00] transition-colors group cursor-pointer flex flex-col">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center group-hover:bg-[#ccff00] transition-colors">
                        <s.icon className="w-5 h-5 text-white group-hover:text-black transition-colors" />
                      </div>
                      <h3 className="font-space font-bold text-lg text-white uppercase tracking-tight">{s.title}</h3>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-[#ccff00] text-black px-2 py-1 shrink-0 whitespace-nowrap">{s.note}</span>
                  </div>
                  <div className="mb-6 flex-grow">
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">{s.desc}</p>
                  </div>
                  <Button variant="outline" className="w-full h-10 rounded-none border-2 border-zinc-700 bg-transparent text-white hover:bg-white hover:text-black uppercase font-bold tracking-wider">Apply to Calculator</Button>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-[#ccff00]/10 border-l-4 border-[#ccff00] p-5 flex items-start gap-4">
              <Zap className="w-6 h-6 text-[#ccff00] shrink-0" fill="#ccff00" />
              <p className="text-sm text-zinc-300 leading-relaxed font-medium"><strong className="text-white font-bold uppercase tracking-wide">The Prepayment Acceleration Magic</strong> — In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="rounded-none border-2 border-zinc-800 bg-[#0a0a0a] shadow-[4px_4px_0px_#18181b]">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b-2 border-zinc-800 pb-5">
              <h3 className="font-space font-black text-xl uppercase tracking-tight text-white flex items-center gap-3"><TrendingUp className="w-6 h-6 text-[#ccff00]" strokeWidth={3} /> Comparative Progress</h3>
              <div className="flex border-2 border-zinc-800 p-0.5">
                <button onClick={() => setChartTab("balance")} className={`px-5 py-2 text-xs uppercase tracking-wider font-bold transition-colors ${chartTab === "balance" ? "bg-[#ccff00] text-black" : "text-zinc-400 hover:text-white"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-5 py-2 text-xs uppercase tracking-wider font-bold transition-colors ${chartTab === "costs" ? "bg-[#ccff00] text-black" : "text-zinc-400 hover:text-white"}`}>Costs</button>
              </div>
            </div>
            <div className="h-[350px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} /><stop offset="95%" stopColor="#ffffff" stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ccff00" stopOpacity={0.4} /><stop offset="95%" stopColor="#ccff00" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600, fontFamily: "Inter" }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600, fontFamily: "Inter" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#000", border: "2px solid #27272a", borderRadius: 0, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "Space Grotesk", textTransform: "uppercase" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", paddingTop: "20px" }} />
                    <Area type="step" dataKey="Standard Balance" stroke="#ffffff" fill="url(#b_std)" strokeWidth={3} activeDot={{ r: 6, fill: "#ffffff", stroke: "#000", strokeWidth: 2 }} />
                    <Area type="step" dataKey="Accelerated Balance" stroke="#ccff00" fill="url(#b_acc)" strokeWidth={3} activeDot={{ r: 6, fill: "#ccff00", stroke: "#000", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600, fontFamily: "Inter" }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa", fontWeight: 600, fontFamily: "Inter" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#000", border: "2px solid #27272a", borderRadius: 0, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "Space Grotesk", textTransform: "uppercase" }} formatter={(v: number) => formatRupees(v)} cursor={{ fill: "#18181b" }} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", paddingTop: "20px" }} />
                    <Bar dataKey="Principal" stackId="a" fill="#ffffff" />
                    <Bar dataKey="Interest" stackId="a" fill="#ccff00" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="rounded-none border-2 border-zinc-800 bg-[#0a0a0a] shadow-[4px_4px_0px_#18181b] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap border-b-2 border-zinc-800 bg-zinc-900/30 pb-5">
            <CardTitle className="font-space font-black text-xl uppercase tracking-tight text-white flex items-center gap-3"><FileText className="w-6 h-6 text-white" /> Repayment Ledger</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative"><Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search..." className="pl-10 h-10 w-48 rounded-none border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500 focus-visible:ring-[#ccff00] focus-visible:ring-1 focus-visible:ring-offset-0 text-sm" /></div>
              <div className="flex border-2 border-zinc-800 p-0.5">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-colors ${tableMode === "yearly" ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-colors ${tableMode === "monthly" ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>Monthly</button>
              </div>
              <Button variant="outline" className="h-10 px-4 gap-2 rounded-none border-2 border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white uppercase font-bold tracking-wider text-xs">Export <ChevronDown className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-zinc-400 bg-zinc-900/50 uppercase tracking-widest border-b-2 border-zinc-800 font-bold">
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
              <tbody className="font-space">
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-3 font-bold text-white uppercase tracking-wide">Year {r.year}</td>
                    <td className="px-6 py-3 text-right text-zinc-300 font-medium">{formatRupees(r.opening)}</td>
                    <td className="px-6 py-3 text-right text-zinc-300 font-medium">{formatRupees(r.emiPaid)}</td>
                    <td className="px-6 py-3 text-right">
                      <Input defaultValue={r.extraPaid} className="h-8 w-24 text-right text-xs bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] font-bold ml-auto rounded-none focus-visible:ring-[#ccff00]" />
                    </td>
                    <td className="px-6 py-3 text-right text-rose-400 font-medium">{formatRupees(r.interest)}</td>
                    <td className="px-6 py-3 text-right text-zinc-300 font-medium">{formatRupees(r.principal)}</td>
                    <td className="px-6 py-3 text-right font-bold text-white">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-none border-2 border-zinc-800 bg-[#0a0a0a] shadow-[4px_4px_0px_#18181b]">
            <CardHeader className="pb-2 border-b border-zinc-800 bg-zinc-900/30 text-center"><CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Traditional Bank Contract</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_STANDARD} cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="#0a0a0a" strokeWidth={3} dataKey="value">
                      {PIE_STANDARD.map((e, i) => <Cell key={i} fill={i === 0 ? "#ffffff" : "#4b5563"} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#000", border: "2px solid #27272a", borderRadius: 0, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "Space Grotesk", textTransform: "uppercase" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Output</p>
                <p className="text-xl font-space font-black text-white mt-1">{formatRupees(d.stdTotal)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border-2 border-[#ccff00] bg-[#0a0a0a] shadow-[4px_4px_0px_#ccff00]">
            <CardHeader className="pb-2 border-b-2 border-[#ccff00] bg-[#ccff00]/5 text-center"><CardTitle className="text-sm font-bold uppercase tracking-wider text-[#ccff00] flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Accelerated Prepayment</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_ACCELERATED} cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="#0a0a0a" strokeWidth={3} dataKey="value">
                      {PIE_ACCELERATED.map((e, i) => <Cell key={i} fill={i === 0 ? "#ffffff" : i === 1 ? "#ccff00" : "#27272a"} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#000", border: "2px solid #27272a", borderRadius: 0, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "Space Grotesk", textTransform: "uppercase" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-[#ccff00] uppercase font-bold tracking-wider">Total Output</p>
                <p className="text-xl font-space font-black text-[#ccff00] mt-1">{formatRupees(d.accTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 pb-12 border-t border-zinc-800">
          <Button className="gap-2 rounded-none bg-[#ccff00] text-black hover:bg-white uppercase font-bold tracking-wider h-12 px-8 shadow-[4px_4px_0px_#fff] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none text-sm"><Plus className="w-5 h-5" strokeWidth={2.5} /> Add Loan</Button>
          <Button variant="outline" className="gap-2 rounded-none border-2 border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white uppercase font-bold tracking-wider h-12 px-8 text-sm"><List className="w-5 h-5" /> View All Loans</Button>
        </div>

      </div>
    </div>
  );
}
