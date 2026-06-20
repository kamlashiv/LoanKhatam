import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Target, Upload, Plus, Download, ChevronDown, Sparkles, ChevronUp,
  PiggyBank, TrendingUp, Award, Flame, Info, Search, Settings2, SlidersHorizontal,
  ChevronRight, BarChart3, PieChart as PieChartIcon, Table as TableIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// --- Helpers & Data ---

const formatRupees = (val: number) => `₹${Math.round(val).toLocaleString("en-IN")}`;
const compactRupees = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
};

const FIXED_DATA = {
  principal: 2500000,
  rate: 8.5,
  tenure: 240,
  baseEmi: 21696,
  extraEmi: 2170,
  standardInterest: 2706939,
  standardTotal: 5206939,
  acceleratedInterest: 2080849,
  acceleratedTotal: 4580849,
  interestSaved: 626091,
  tenureSaved: 48, // 4 years
  payoffStandard: 240,
  payoffAccelerated: 192,
};

const STRATEGIES = [
  { title: "1 Extra EMI / Year", icon: TrendingUp, colors: "from-blue-50 to-indigo-100 border-blue-200", iconColor: "text-blue-600", saves: "₹5,14,577 & 3 Yr(s), 3 Mo(s)", detail: "₹21,696/yr" },
  { title: "Micro-Savings (5% Monthly)", icon: Award, colors: "from-emerald-50 to-teal-100 border-emerald-200", iconColor: "text-emerald-600", saves: "₹3,58,882 & 2 Yr(s), 3 Mo(s)", detail: "+₹1,085/mo" },
  { title: "10% Monthly Boost", icon: PiggyBank, colors: "from-amber-50 to-orange-100 border-amber-200", iconColor: "text-amber-600", saves: "₹6,26,091 & 4 Yr(s)", detail: "+₹2,170/mo" },
  { title: "Super-Saver Combo", icon: Flame, colors: "from-rose-50 to-pink-100 border-rose-200", iconColor: "text-rose-600", saves: "₹9,27,880 & 6 Yr(s)", detail: "+₹2,170/mo · ₹21,696/yr" },
];

const balanceData = Array.from({ length: 21 }, (_, i) => ({
  year: `Year ${i}`,
  "Standard Balance": Math.max(0, 2500000 - i * (2500000 / 20)),
  "Accelerated Balance": Math.max(0, 2500000 - i * (2500000 / 16)),
}));

const costData = [
  { name: "Standard Path", Principal: 2500000, Interest: 2706939 },
  { name: "Savings Plan", Principal: 2500000, Interest: 2080849 },
];

const pieStandard = [
  { name: "Principal", value: 2500000, color: "#6366f1" },
  { name: "Total Interest", value: 2706939, color: "#f59e0b" },
];

const pieAccelerated = [
  { name: "Principal", value: 2500000, color: "#6366f1" },
  { name: "Total Interest", value: 2080849, color: "#10b981" },
  { name: "Interest Saved", value: 626091, color: "#e5e7eb" },
];

const ledgerData = Array.from({ length: 16 }, (_, i) => {
  const opening = Math.max(0, 2500000 - i * (2500000 / 16));
  const closing = Math.max(0, 2500000 - (i + 1) * (2500000 / 16));
  const emiPaid = 21696 * 12;
  const extraPaid = 2170 * 12;
  const totalPaid = emiPaid + extraPaid;
  const principal = opening - closing;
  const interest = totalPaid - principal;
  return {
    year: i + 1,
    opening,
    emiPaid,
    extraPaid,
    interest: Math.max(0, interest),
    principal,
    closing,
  };
});

// --- Components ---

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-lg shadow-md px-3 py-2.5 text-xs z-50">
      <p className="font-semibold mb-1 text-slate-300">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span className="font-black">{formatRupees(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function HierarchyFirst() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-32">
      
      {/* 1. Header (Minimal, focused on brand) */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Smart Loan Saver</span>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 h-8 text-xs">
            <Download className="h-3.5 w-3.5 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      {/* 2. Top-level Configuration (Collapsed by default to focus on the result) */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6">
          <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full py-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Loan Parameters & Scenarios</span>
                  {!isConfigOpen && (
                    <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] uppercase font-bold tracking-wider">
                      ₹25L • 8.5% • 20Y
                    </span>
                  )}
                </div>
                {isConfigOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-6 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Principal</Label>
                  <Input type="number" defaultValue="2500000" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate (%)</Label>
                  <Input type="number" defaultValue="8.5" step="0.1" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenure (Mo)</Label>
                  <Input type="number" defaultValue="240" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</Label>
                  <Input type="month" defaultValue="2023-01" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Extra EMI/Mo</Label>
                  <Input type="number" defaultValue="2170" className="h-9 text-sm border-indigo-200 bg-indigo-50 font-medium" />
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                   <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Upload className="h-3.5 w-3.5"/> Auto-fill</Label>
                   <Button size="sm" variant="outline" className="w-full h-8 text-xs font-normal text-slate-500">Upload Loan Document</Button>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Plus className="h-3.5 w-3.5"/> Top-Up</Label>
                   <Button size="sm" variant="outline" className="w-full h-8 text-xs font-normal text-slate-500">Add Top-up Loan</Button>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Target className="h-3.5 w-3.5"/> Target Payoff</Label>
                   <div className="px-2 pt-2">
                     <Slider defaultValue={[10]} max={30} step={1} className="py-2" />
                     <p className="text-[10px] text-slate-500 mt-1 text-center">Set to 10 Years</p>
                   </div>
                 </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* 3. Primary Outcome (Huge, immediate impact) */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="mb-12">
          <p className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> The Bottom Line
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
            You save <span className="text-emerald-500">₹6,26,091</span><br/>
            and <span className="text-emerald-500">4 years</span>.
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            A small monthly addition of ₹2,170 drastically cuts down your interest burden, bringing your total payoff from 20 years down to 16.
          </p>
        </div>

        {/* 4. Supporting Context (Secondary Stats) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 mb-16">
          <div className="border-l-2 border-emerald-500 pl-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Interest Saved</p>
            <p className="text-2xl font-bold text-slate-900">₹6.26 L</p>
            <p className="text-sm text-emerald-600 font-medium">23% reduction</p>
          </div>
          <div className="border-l-2 border-indigo-500 pl-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tenure Trimmed</p>
            <p className="text-2xl font-bold text-slate-900">4 Years</p>
            <p className="text-sm text-indigo-600 font-medium">Out in 16 yrs</p>
          </div>
          <div className="border-l-2 border-slate-200 pl-4 opacity-70">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Principal</p>
            <p className="text-2xl font-bold text-slate-900">₹25.00 L</p>
          </div>
          <div className="border-l-2 border-slate-200 pl-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">New Monthly</p>
            <p className="text-2xl font-bold text-slate-900">₹23,866</p>
            <p className="text-sm text-slate-500 font-medium">₹21,696 + ₹2,170</p>
          </div>
        </div>

        {/* 5. Recommended Actions (Strategies) */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Ways to achieve this</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STRATEGIES.map((s, i) => (
              <div key={i} className="group relative border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    <div className={`mt-0.5 ${s.iconColor}`}><s.icon className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{s.title}</h3>
                      <p className="text-sm text-slate-500">{s.detail}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between group-hover:bg-slate-100 transition-colors">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Savings</span>
                  <span className="text-sm font-bold text-emerald-600">{s.saves}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Evidence & Details (Progressive Disclosure) */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">The Evidence</h2>
          <p className="text-slate-500 mb-8 max-w-2xl">
            Dive into the math. Explore how your balance decreases over time, compare the raw costs, or review the year-by-year amortization ledger.
          </p>

          <div className="space-y-4">
            {/* Chart Evidence */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <button 
                onClick={() => setExpandedEvidence(expandedEvidence === "charts" ? null : "charts")}
                className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 text-lg">Visual Projections</h3>
                    <p className="text-sm text-slate-500">Balance over time & total cost comparisons</p>
                  </div>
                </div>
                {expandedEvidence === "charts" ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
              </button>
              
              {expandedEvidence === "charts" && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-end mb-6">
                    <div className="bg-slate-100 p-1 rounded-lg flex text-sm">
                      <button onClick={() => setChartTab("balance")} className={`px-4 py-1.5 rounded-md font-medium transition-colors ${chartTab === "balance" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>Balance</button>
                      <button onClick={() => setChartTab("costs")} className={`px-4 py-1.5 rounded-md font-medium transition-colors ${chartTab === "costs" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>Costs</button>
                    </div>
                  </div>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartTab === "balance" ? (
                        <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorStandard2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorAccel2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                          </defs>
                          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} minTickGap={30} />
                          <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                          <Area type="monotone" dataKey="Standard Balance" stroke="#f43f5e" strokeWidth={2} fill="url(#colorStandard2)" />
                          <Area type="monotone" dataKey="Accelerated Balance" stroke="#10b981" strokeWidth={2} fill="url(#colorAccel2)" />
                        </AreaChart>
                      ) : (
                        <BarChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={60}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} dy={10} />
                          <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                          <Bar dataKey="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="Interest" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Ledger Evidence */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <button 
                onClick={() => setExpandedEvidence(expandedEvidence === "ledger" ? null : "ledger")}
                className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <TableIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 text-lg">Amortization Ledger</h3>
                    <p className="text-sm text-slate-500">Year-by-year breakdown with editable inputs</p>
                  </div>
                </div>
                {expandedEvidence === "ledger" ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
              </button>
              
              {expandedEvidence === "ledger" && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 animate-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search year..." className="pl-9 h-8 text-sm w-[180px] bg-slate-50" />
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs"><Download className="h-3 w-3 mr-2"/> Export</Button>
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Year</th>
                          <th className="px-4 py-3 text-right">Opening</th>
                          <th className="px-4 py-3 text-right">EMI Paid</th>
                          <th className="px-4 py-3 text-right">Extra</th>
                          <th className="px-4 py-3 text-right">Interest</th>
                          <th className="px-4 py-3 text-right">Principal</th>
                          <th className="px-4 py-3 text-right">Closing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledgerData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-medium text-slate-900">{row.year}</td>
                            <td className="px-4 py-2 text-right text-slate-500">{formatRupees(row.opening)}</td>
                            <td className="px-4 py-2 text-right text-slate-500">{formatRupees(row.emiPaid)}</td>
                            <td className="px-4 py-2 text-right">
                              <Input type="number" defaultValue={row.extraPaid} className="h-7 w-20 text-right text-xs ml-auto" />
                            </td>
                            <td className="px-4 py-2 text-right text-amber-600">{formatRupees(row.interest)}</td>
                            <td className="px-4 py-2 text-right text-indigo-600">{formatRupees(row.principal)}</td>
                            <td className="px-4 py-2 text-right font-medium text-slate-900">{formatRupees(row.closing)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Pie Evidence */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <button 
                onClick={() => setExpandedEvidence(expandedEvidence === "pies" ? null : "pies")}
                className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <PieChartIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 text-lg">Total Contract Comparison</h3>
                    <p className="text-sm text-slate-500">Standard 20-year vs Accelerated scenario</p>
                  </div>
                </div>
                {expandedEvidence === "pies" ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
              </button>
              
              {expandedEvidence === "pies" && (
                <div className="px-6 pb-8 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="text-center">
                    <h4 className="font-bold text-slate-900 mb-1">Bank Contract</h4>
                    <p className="text-sm text-slate-500 mb-6">Cost: ₹52,06,939</p>
                    <div className="h-56 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                            {pieStandard.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-2xl font-bold">20</span>
                        <span className="text-xs text-slate-500 uppercase">Yrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-bold text-slate-900 mb-1">Accelerated</h4>
                    <p className="text-sm text-emerald-600 font-medium mb-6">Cost: ₹45,80,849</p>
                    <div className="h-56 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                            {pieAccelerated.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-2xl font-bold text-emerald-600">16</span>
                        <span className="text-xs text-emerald-600 uppercase">Yrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
