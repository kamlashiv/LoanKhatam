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
  Plus, List, Sparkles, Leaf
} from "lucide-react";

import { formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA, YEARLY_ROWS, PIE_STANDARD, PIE_ACCELERATED } from "./_Baseline";
import "./OrganicEarthy.css";

const SAGE_DARK = "#5d6f54";
const SAGE_LIGHT = "#9ab08f";
const TERRACOTTA = "#c86b5e";
const SAND = "#e5ded5";
const OFF_WHITE = "#f4f3ef";
const CLAY = "#c7a793";

const PIE_STD_ORGANIC = [
  { name: "Principal", value: DATA.principal, color: CLAY },
  { name: "Total Interest", value: DATA.stdInterest, color: TERRACOTTA },
];
const PIE_ACC_ORGANIC = [
  { name: "Principal", value: DATA.principal, color: CLAY },
  { name: "Total Interest", value: DATA.accInterest, color: SAGE_LIGHT },
  { name: "Interest Saved", value: DATA.intSaved, color: SAND },
];

export function OrganicEarthy() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  return (
    <div className="organic-earthy-wrapper min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-[#e5ded5]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#e8efe4] flex items-center justify-center shrink-0 border border-[#c4d2bf]">
              <Leaf className="w-7 h-7 text-[#5d6f54]" />
            </div>
            <div>
              <h1 className="font-display font-semibold tracking-tight text-4xl text-[#3d3b38]">SMART Strategy</h1>
              <p className="text-[15px] text-[#86837c] mt-1 font-medium">Plan prepayments and see exactly how much interest and time you save.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 rounded-full border-[#d8d3cb] text-[#6d6961] bg-transparent hover:bg-[#eae6de] hover:text-[#3d3b38] h-10 px-5 shadow-none"><RefreshCw className="w-4 h-4" /> Reset</Button>
            <Button className="gap-2 rounded-full bg-[#5d6f54] text-white hover:bg-[#4a5d45] border-none h-10 px-6 shadow-sm"><Download className="w-4 h-4" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: inputs */}
          <div className="space-y-6">
            {/* Import */}
            <Card className="rounded-[24px] border border-[#e5ded5] bg-[#fbfaf8] card-shadow">
              <CardHeader className="pb-3 pt-5 px-6"><CardTitle className="text-base font-display text-[#5d6f54]">Import from File</CardTitle></CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="border border-dashed border-[#c4d2bf] bg-[#f2f6f0] hover:bg-[#e8efe4] rounded-2xl p-6 text-center cursor-pointer transition-colors duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"><Upload className="w-5 h-5 text-[#7c8f72]" /></div>
                  <p className="font-medium text-sm text-[#4a5d45]">Upload or drag a file</p>
                  <p className="text-[11px] text-[#8b9d83] mt-1.5">PNG · JPG · PDF · JSON · CSV — fills in automatically</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="rounded-[24px] border border-[#e5ded5] bg-white card-shadow">
              <CardHeader className="pb-4 pt-6 px-6"><CardTitle className="text-[17px] font-display text-[#3d3b38]">Loan Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-[13px] font-medium text-[#86837c]">Principal (₹)</Label><span className="text-[15px] font-semibold text-[#5d6f54]">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="[&_[role=slider]]:bg-[#5d6f54] [&_[role=slider]]:border-none [&_.relative]:bg-[#e8efe4]" />
                  <div className="flex justify-between text-[11px] text-[#b3b0a7] font-medium"><span>₹1L</span><span>₹50L</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-[13px] font-medium text-[#86837c]">Interest Rate (%)</Label><span className="text-[15px] font-semibold text-[#5d6f54]">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="[&_[role=slider]]:bg-[#5d6f54] [&_[role=slider]]:border-none [&_.relative]:bg-[#e8efe4]" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[13px] font-medium text-[#86837c]">Tenure</Label>
                    <div className="flex rounded-full border border-[#e5ded5] p-1 text-[12px] font-medium bg-[#fbfaf8]">
                      <button className="px-3 py-1 rounded-full bg-[#5d6f54] text-white shadow-sm">Yr</button>
                      <button className="px-3 py-1 rounded-full text-[#86837c] hover:text-[#3d3b38]">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="h-11 rounded-xl text-[15px] bg-[#fbfaf8] border-[#e5ded5] focus-visible:ring-[#9ab08f]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-[#86837c]">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-11 rounded-xl text-[15px] bg-[#fbfaf8] border-[#e5ded5] focus-visible:ring-[#9ab08f]" />
                </div>
                <div className="space-y-3 pt-5 border-t border-[#e5ded5]">
                  <div className="flex justify-between items-center"><Label className="text-[13px] font-medium text-[#c86b5e]">Extra Monthly Payment</Label><span className="text-[15px] font-semibold text-[#c86b5e]">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="[&_[role=slider]]:bg-[#c86b5e] [&_[role=slider]]:border-none [&_.relative]:bg-[#f7e6e3]" />
                  <Input type="month" defaultValue="2024-06" className="h-10 rounded-xl text-[14px] bg-[#fbfaf8] border-[#e5ded5] focus-visible:ring-[#c86b5e]" />
                </div>
                <div className="pt-5 border-t border-[#e5ded5] space-y-3">
                  <Label className="text-[13px] font-medium text-[#86837c]">Top-up Loan (optional)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="Amt" className="h-10 text-[14px] rounded-xl bg-[#fbfaf8] border-[#e5ded5] focus-visible:ring-[#9ab08f]" />
                    <Input placeholder="Rate%" className="h-10 text-[14px] rounded-xl bg-[#fbfaf8] border-[#e5ded5] focus-visible:ring-[#9ab08f]" />
                    <Input placeholder="Month" className="h-10 text-[14px] rounded-xl bg-[#fbfaf8] border-[#e5ded5] focus-visible:ring-[#9ab08f]" />
                  </div>
                </div>
                <div className="pt-5 border-t border-[#e5ded5] space-y-3">
                  <Label className="text-[13px] font-medium text-[#86837c]">Reverse Calculator — Target Years</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="[&_[role=slider]]:bg-[#c7a793] [&_[role=slider]]:border-none [&_.relative]:bg-[#f0e8e3]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-[20px] bg-[#f0e8e3] border border-[#e5ded5] px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm"><FileText className="w-5 h-5 text-[#b5927e]" /></div>
                <div>
                  <p className="font-semibold text-[#5e4b41] text-[15px]">Print-Ready Client PDF Report</p>
                  <p className="text-[13px] text-[#8e7a6f] mt-0.5">A polished one-page summary of this strategy.</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2 rounded-full bg-white border-[#d8d3cb] text-[#5e4b41] hover:bg-[#fbfaf8] shrink-0 h-10 px-5 shadow-sm"><Download className="w-4 h-4" /> Download PDF</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-[24px] p-7 sage-gradient text-white shadow-lg shadow-[#5d6f54]/20 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <p className="text-[13px] font-medium flex items-center gap-2 text-[#e8efe4]"><PiggyBank className="w-4 h-4" /> Total Net Interest Saved</p>
                <h3 className="mt-3 text-4xl font-display font-semibold tracking-tight">{formatRupees(d.intSaved)}</h3>
                <p className="text-[13px] text-[#c4d2bf] mt-2 font-medium">≈23% of standard interest avoided</p>
              </div>
              <div className="rounded-[24px] p-7 terracotta-gradient text-white shadow-lg shadow-[#c86b5e]/20 relative overflow-hidden">
                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <p className="text-[13px] font-medium flex items-center gap-2 text-[#f7e6e3]"><CalendarRange className="w-4 h-4" /> Accelerated Payoff Timeline</p>
                <h3 className="mt-3 text-3xl font-display font-semibold tracking-tight leading-tight">{d.payoffYears} years <span className="text-lg font-medium text-[#f1cdcb]">(−{d.tenureSavedYrs} yrs)</span></h3>
                <p className="text-[13px] text-[#e8c0bd] mt-2 font-medium">Debt-free 4 years sooner</p>
              </div>
              <div className="md:col-span-2 rounded-[24px] p-7 bg-white border border-[#e5ded5] shadow-sm">
                <p className="text-[15px] font-semibold flex items-center gap-2 mb-5 text-[#3d3b38]"><Scale className="w-4 h-4 text-[#c7a793]" /> Monthly Installment Breakdown</p>
                <div className="grid grid-cols-2 gap-y-3.5 text-[15px]">
                  <span className="text-[#86837c]">Base EMI</span><span className="text-right font-medium text-[#3d3b38]">{formatRupees(d.baseEmi)}</span>
                  <span className="text-[#86837c]">Extra Prepayment</span><span className="text-right font-medium text-[#c86b5e]">+{formatRupees(d.extraEmi)}</span>
                  <div className="col-span-2 h-px bg-[#f4f3ef] my-1"></div>
                  <span className="text-[#5d6f54] font-medium">Total Monthly Outflow</span><span className="text-right font-semibold text-[#5d6f54]">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-[#5d6f54] font-medium">Total Repaid (Accelerated)</span><span className="text-right font-semibold text-[#5d6f54]">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="rounded-[24px] border border-[#e5ded5] bg-white card-shadow">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#fdf8f0] flex items-center justify-center border border-[#f2e6d5]"><Sparkles className="w-6 h-6 text-[#d9a86c]" /></div>
              <div>
                <h2 className="text-2xl font-display font-semibold tracking-tight text-[#3d3b38]">Smart Payoff Leverage Strategies</h2>
                <p className="text-[14px] text-[#86837c] mt-1">Tap any strategy to load it into the calculator.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="rounded-[20px] p-6 border border-[#e5ded5] bg-[#fbfaf8] hover:bg-white hover:border-[#c4d2bf] transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3"><div className="p-2 bg-[#e8efe4] rounded-full group-hover:bg-[#d8e6d2] transition-colors"><s.icon className="w-5 h-5 text-[#5d6f54]" /></div><h3 className="font-semibold text-[15px] text-[#3d3b38]">{s.title}</h3></div>
                    <span className="text-[11px] font-semibold bg-[#e8efe4] text-[#4a5d45] px-3 py-1 rounded-full">{s.note}</span>
                  </div>
                  <div className="space-y-2 mb-5">
                    <p className="text-[14px] text-[#6d6961] leading-relaxed">{s.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-10 text-[13px] font-medium rounded-full bg-white border-[#e5ded5] text-[#5d6f54] hover:bg-[#f2f6f0] hover:text-[#4a5d45]">Apply to Calculator</Button>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[20px] bg-[#fdf8f0] border border-[#f2e6d5] p-5 flex items-start gap-4">
              <div className="bg-[#fcf1e1] p-1.5 rounded-full shrink-0"><Zap className="w-4 h-4 text-[#d9a86c]" /></div>
              <p className="text-[14px] text-[#8e7b64] leading-relaxed"><strong className="text-[#7d674c] font-semibold">The Prepayment Acceleration Magic</strong> — In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="rounded-[24px] border border-[#e5ded5] bg-white card-shadow">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
              <h3 className="font-display font-semibold text-[20px] text-[#3d3b38] flex items-center gap-3"><TrendingUp className="w-6 h-6 text-[#c7a793]" /> Comparative Progress Visual Chart</h3>
              <div className="flex bg-[#f4f3ef] p-1.5 rounded-full border border-[#e5ded5]">
                <button onClick={() => setChartTab("balance")} className={`px-5 py-2 text-[13px] rounded-full font-medium transition-colors ${chartTab === "balance" ? "bg-white shadow-sm text-[#3d3b38]" : "text-[#86837c] hover:text-[#3d3b38]"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-5 py-2 text-[13px] rounded-full font-medium transition-colors ${chartTab === "costs" ? "bg-white shadow-sm text-[#3d3b38]" : "text-[#86837c] hover:text-[#3d3b38]"}`}>Costs</button>
              </div>
            </div>
            <div className="h-[360px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std_org" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={TERRACOTTA} stopOpacity={0.2} /><stop offset="95%" stopColor={TERRACOTTA} stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc_org" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={SAGE_DARK} stopOpacity={0.2} /><stop offset="95%" stopColor={SAGE_DARK} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5ded5" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#86837c", fontFamily: "DM Sans" }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#86837c", fontFamily: "DM Sans" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#3d3b38", border: "none", borderRadius: 12, color: "#f4f3ef", fontSize: 13, fontFamily: "DM Sans" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: "20px", fontFamily: "DM Sans" }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke={TERRACOTTA} fill="url(#b_std_org)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke={SAGE_DARK} fill="url(#b_acc_org)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5ded5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#86837c", fontFamily: "DM Sans" }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#86837c", fontFamily: "DM Sans" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#3d3b38", border: "none", borderRadius: 12, color: "#f4f3ef", fontSize: 13, fontFamily: "DM Sans" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: "20px", fontFamily: "DM Sans" }} />
                    <Bar dataKey="Principal" stackId="a" fill={CLAY} radius={[0, 0, 6, 6]} />
                    <Bar dataKey="Interest" stackId="a" fill={TERRACOTTA} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="rounded-[24px] border border-[#e5ded5] bg-white card-shadow overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap border-b border-[#e5ded5] bg-[#fbfaf8] px-8 py-6">
            <CardTitle className="text-[18px] font-display text-[#3d3b38] flex items-center gap-3"><FileText className="w-5 h-5 text-[#5d6f54]" /> Detailed Amortization &amp; Repayment Ledger</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative"><Search className="w-4 h-4 text-[#a39f96] absolute left-3.5 top-1/2 -translate-y-1/2" /><Input placeholder="Search..." className="pl-10 h-10 w-48 rounded-full text-[14px] bg-white border-[#e5ded5] focus-visible:ring-[#9ab08f]" /></div>
              <div className="flex bg-[#e5ded5] p-1 rounded-full">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-1.5 text-[12px] rounded-full font-medium transition-colors ${tableMode === "yearly" ? "bg-white shadow-sm text-[#3d3b38]" : "text-[#6d6961] hover:text-[#3d3b38]"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-1.5 text-[12px] rounded-full font-medium transition-colors ${tableMode === "monthly" ? "bg-white shadow-sm text-[#3d3b38]" : "text-[#6d6961] hover:text-[#3d3b38]"}`}>Monthly</button>
              </div>
              <Button variant="outline" size="sm" className="h-10 px-4 gap-2 rounded-full border-[#d8d3cb] text-[#5e4b41] hover:bg-[#fbfaf8]">Export <ChevronDown className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-[14px] text-left">
              <thead className="text-[12px] text-[#86837c] font-medium border-b border-[#e5ded5]">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wide">Year</th>
                  <th className="px-6 py-4 font-medium tracking-wide text-right">Opening</th>
                  <th className="px-6 py-4 font-medium tracking-wide text-right">EMI Paid</th>
                  <th className="px-6 py-4 font-medium tracking-wide text-right">Extra Prepaid</th>
                  <th className="px-6 py-4 font-medium tracking-wide text-right">Interest</th>
                  <th className="px-6 py-4 font-medium tracking-wide text-right">Principal</th>
                  <th className="px-6 py-4 font-medium tracking-wide text-right">Closing</th>
                </tr>
              </thead>
              <tbody>
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="border-b border-[#f4f3ef] hover:bg-[#fbfaf8] transition-colors">
                    <td className="px-6 py-3.5 font-medium text-[#3d3b38]">Year {r.year}</td>
                    <td className="px-6 py-3.5 text-right text-[#6d6961]">{formatRupees(r.opening)}</td>
                    <td className="px-6 py-3.5 text-right text-[#6d6961]">{formatRupees(r.emiPaid)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Input defaultValue={r.extraPaid} className="h-8 w-24 text-right text-[13px] bg-[#e8efe4] border-transparent text-[#4a5d45] font-medium ml-auto rounded-lg focus-visible:ring-[#9ab08f]" />
                    </td>
                    <td className="px-6 py-3.5 text-right text-[#c86b5e]">{formatRupees(r.interest)}</td>
                    <td className="px-6 py-3.5 text-right text-[#6d6961]">{formatRupees(r.principal)}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-[#5d6f54]">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[24px] border border-[#e5ded5] bg-white card-shadow">
            <CardHeader className="pb-0 pt-8 text-center"><CardTitle className="text-[16px] font-display text-[#3d3b38]">Traditional Bank Contract</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_STD_ORGANIC} cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="none" dataKey="value">
                      {PIE_STD_ORGANIC.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#3d3b38", border: "none", borderRadius: 8, color: "#f4f3ef", fontSize: 13, fontFamily: "DM Sans" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontFamily: "DM Sans" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[14px] text-[#86837c] font-medium mt-2">Total: <span className="text-[#3d3b38]">{formatRupees(d.stdTotal)}</span></p>
            </CardContent>
          </Card>
          <Card className="rounded-[24px] border border-[#c4d2bf] bg-[#fbfaf8] card-shadow">
            <CardHeader className="pb-0 pt-8 text-center"><CardTitle className="text-[16px] font-display text-[#5d6f54] flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Accelerated Prepayment</CardTitle></CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PIE_ACC_ORGANIC} cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="none" dataKey="value">
                      {PIE_ACC_ORGANIC.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#3d3b38", border: "none", borderRadius: 8, color: "#f4f3ef", fontSize: 13, fontFamily: "DM Sans" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontFamily: "DM Sans" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[14px] text-[#5d6f54] font-semibold mt-2">Total: {formatRupees(d.accTotal)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 pb-12">
          <Button className="gap-2 rounded-full bg-[#5d6f54] text-white hover:bg-[#4a5d45] border-none h-12 px-8 text-[15px] font-medium shadow-sm"><Plus className="w-5 h-5" /> Add Loan</Button>
          <Button variant="outline" className="gap-2 rounded-full bg-white border-[#d8d3cb] text-[#5e4b41] hover:bg-[#fbfaf8] h-12 px-8 text-[15px] font-medium shadow-sm"><List className="w-5 h-5" /> View All Loans</Button>
        </div>

      </div>
    </div>
  );
}
