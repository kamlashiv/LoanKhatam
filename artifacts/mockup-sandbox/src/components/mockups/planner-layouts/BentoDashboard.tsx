import React, { useState } from "react";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, Download, Upload, TrendingUp, Award, PiggyBank, Flame, Search, ChevronDown, CheckCircle2, ChevronRight, FileText, Sparkles
} from "lucide-react";

function formatRupees(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function compactRupees(val: number) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

const COLORS = {
  indigo: "#6366f1",
  emerald: "#10b981",
  rose: "#f43f5e",
  amber: "#f59e0b",
  slate: "#64748b",
  grey: "#e5e7eb"
};

const STRAT_VISUAL = [
  { icon: TrendingUp, card: "from-blue-50 to-indigo-100 border-blue-200", iconColor: "text-blue-600" },
  { icon: Award, card: "from-emerald-50 to-teal-100 border-emerald-200", iconColor: "text-emerald-600" },
  { icon: PiggyBank, card: "from-amber-50 to-orange-100 border-amber-200", iconColor: "text-amber-600" },
  { icon: Flame, card: "from-rose-50 to-pink-100 border-rose-200", iconColor: "text-rose-600" },
];

export function BentoDashboard() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");

  // Fixed Data
  const principal = 2500000;
  const rate = 8.5;
  const tenureMo = 240;
  const baseEmi = 21696;
  const extraEmi = 2170;

  const stdInterest = 2706939;
  const stdTotal = 5206939;
  
  const accInterest = 2080849;
  const accTotal = 4580849;

  const intSaved = 626091;
  const tenureSavedYrs = 4;

  // Chart Data Synthesis
  const balanceData = Array.from({ length: 21 }, (_, i) => {
    const stdRatio = Math.max(0, 1 - i / 20);
    const accRatio = Math.max(0, 1 - i / 16);
    return {
      year: `Yr ${i}`,
      "Standard Balance": Math.round(principal * (stdRatio * stdRatio)),
      "Accelerated Balance": Math.round(principal * (accRatio * accRatio))
    };
  });

  const costData = [
    {
      name: "Standard Path",
      Principal: principal,
      Interest: stdInterest,
    },
    {
      name: "Savings Plan",
      Principal: principal,
      Interest: accInterest,
    },
  ];

  const pieStandard = [
    { name: "Principal", value: principal, color: COLORS.indigo },
    { name: "Total Interest", value: stdInterest, color: COLORS.amber },
  ];
  const pieAccelerated = [
    { name: "Principal", value: principal, color: COLORS.indigo },
    { name: "Total Interest", value: accInterest, color: COLORS.emerald },
    { name: "Interest Saved", value: intSaved, color: COLORS.grey },
  ];

  const strategies = [
    {
      title: "1 Extra EMI / Year",
      desc: "Saves ₹5,14,577 & 3 Yr(s), 3 Mo(s) · ₹21,696/yr",
      ...STRAT_VISUAL[0]
    },
    {
      title: "Micro-Savings (5% Monthly)",
      desc: "Saves ₹3,58,882 & 2 Yr(s), 3 Mo(s) · +₹1,085/mo",
      ...STRAT_VISUAL[1]
    },
    {
      title: "10% Monthly Boost",
      desc: "Saves ₹6,26,091 & 4 Yr(s) · +₹2,170/mo",
      ...STRAT_VISUAL[2]
    },
    {
      title: "Super-Saver Combo",
      desc: "Saves ₹9,27,880 & 6 Yr(s) · +₹2,170/mo · ₹21,696/yr",
      ...STRAT_VISUAL[3]
    }
  ];

  const yearlyRows = Array.from({ length: 17 }, (_, i) => {
    const opening = Math.max(0, principal * Math.pow(0.85, i));
    const closing = Math.max(0, principal * Math.pow(0.85, i + 1));
    const principalPaid = opening - closing;
    const interest = stdInterest / 16 * (1 - i / 16); 
    return {
      year: i + 1,
      opening: Math.round(opening),
      emiPaid: 21696 * 12,
      extraPaid: 2170 * 12,
      interest: Math.round(interest),
      principal: Math.round(principalPaid),
      closing: Math.round(closing)
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Smart Loan Saver</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Plan prepayments, compare strategies, and see exactly how much interest and time you save
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 shrink-0 rounded-xl bg-white">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </header>

        {/* Impact Summary */}
        <Card className="rounded-3xl border-0 shadow-sm overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-emerald-600 text-white">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4 max-w-xl">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Your Impact Summary</p>
                  <p className="text-lg md:text-xl font-bold leading-snug">
                    Paying {formatRupees(extraEmi)} extra each month saves you{" "}
                    <span className="text-emerald-200">{formatRupees(intSaved)}</span> in interest and clears your loan{" "}
                    <span className="text-emerald-200">{tenureSavedYrs} years sooner</span>.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 lg:gap-8 shrink-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl md:text-3xl font-bold tracking-tight">{compactRupees(intSaved)}</p>
                  <p className="text-xs text-white/70 mt-1">Interest Saved</p>
                </div>
                <div className="text-center lg:text-left lg:border-l lg:border-white/20 lg:pl-8">
                  <p className="text-2xl md:text-3xl font-bold tracking-tight">{tenureSavedYrs} Yrs</p>
                  <p className="text-xs text-white/70 mt-1">Debt-Free Sooner</p>
                </div>
                <div className="text-center lg:text-left lg:border-l lg:border-white/20 lg:pl-8">
                  <p className="text-2xl md:text-3xl font-bold tracking-tight">{Math.round((intSaved / stdInterest) * 100)}%</p>
                  <p className="text-xs text-white/70 mt-1">Less Interest</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-min">
          
          {/* Tile 1: Input Controls (Col span 3) */}
          <Card className="md:col-span-4 lg:col-span-3 row-span-2 rounded-3xl shadow-sm border-slate-200 overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
              <CardTitle className="text-lg">Loan Details</CardTitle>
              <CardDescription>Configure your loan parameters</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-6 flex-1 overflow-y-auto">
              
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50 rounded-2xl p-4 text-center cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="font-semibold text-sm text-slate-700">Upload or drag a file</p>
                <p className="text-[10px] text-slate-500 mt-1">PNG • JPG • PDF • JSON • CSV — data fills in automatically</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs font-semibold text-slate-600">Principal (₹)</Label>
                    <span className="text-xs font-medium text-slate-900">{formatRupees(principal)}</span>
                  </div>
                  <Slider defaultValue={[principal]} max={5000000} step={100000} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">Rate (%)</Label>
                    <Input defaultValue={rate} type="number" className="h-9 rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">Tenure (Mo)</Label>
                    <Input defaultValue={tenureMo} type="number" className="h-9 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-9 rounded-xl text-sm" />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <Label className="text-xs font-semibold text-emerald-600">Extra EMI / month</Label>
                    <span className="text-xs font-medium text-emerald-700">{formatRupees(extraEmi)}</span>
                  </div>
                  <Slider defaultValue={[extraEmi]} max={10000} step={100} className="[&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-emerald-500" />
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <Label className="text-xs font-semibold text-slate-600">Top-up Loan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Amt" className="h-8 text-xs rounded-lg" />
                    <Input placeholder="Rate%" className="h-8 text-xs rounded-lg" />
                    <Input placeholder="Month" className="h-8 text-xs rounded-lg" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Reverse Calculator: Target Yrs</Label>
                  <Slider defaultValue={[16]} max={20} min={1} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Button variant="ghost" className="w-full text-slate-500 h-9 rounded-xl">Reset All</Button>
            </CardFooter>
          </Card>

          {/* Tile 2: Summary Metrics (Col span 9, nested grid) */}
          <div className="md:col-span-4 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min">
            <Card className="rounded-3xl shadow-sm border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-emerald-800 mb-1">Interest Saved</p>
                <p className="text-2xl font-bold text-emerald-600">{formatRupees(intSaved)}</p>
                <p className="text-xs text-emerald-600/80 mt-1">≈23% of standard interest</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-emerald-800 mb-1">Tenure Saved</p>
                <p className="text-2xl font-bold text-emerald-600">{tenureSavedYrs} Yrs</p>
                <p className="text-xs text-emerald-600/80 mt-1">Clears in 16 yrs instead of 20</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-slate-200">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-slate-500 mb-1">Net Principal</p>
                <p className="text-2xl font-bold text-slate-900">{formatRupees(principal)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-slate-200">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-slate-500 mb-1">Monthly EMI</p>
                <p className="text-2xl font-bold text-slate-900">{formatRupees(baseEmi)}</p>
                <p className="text-xs text-indigo-600 font-medium mt-1">+{formatRupees(extraEmi)} extra</p>
              </CardContent>
            </Card>
          </div>

          {/* Tile 3: Main Chart (Col span 5) */}
          <Card className="md:col-span-4 lg:col-span-5 rounded-3xl shadow-sm border-slate-200 flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Projection</CardTitle>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setChartTab("balance")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${chartTab === "balance" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${chartTab === "costs" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Costs</button>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex-1 min-h-[300px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.slate }} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.slate }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val: number) => formatRupees(val)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke={COLORS.rose} fillOpacity={1} fill="url(#colorStd)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke={COLORS.emerald} fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.slate }} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.slate }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: number) => formatRupees(val)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Principal" stackId="a" fill={COLORS.indigo} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Interest" stackId="a" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tile 4: Strategies Grid (Col span 4) */}
          <Card className="md:col-span-4 lg:col-span-4 rounded-3xl shadow-sm border-slate-200 bg-white flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Smart Payoff Leverage Strategies</CardTitle>
              <CardDescription className="text-xs">Select any strategy below to instantly load it into the prepayment dashboard</CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategies.map((s, i) => (
                  <div key={i} className={`rounded-2xl p-4 border bg-gradient-to-br ${s.card} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                      <h4 className="font-semibold text-sm text-slate-900 leading-tight">{s.title}</h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-snug mb-3 flex-1">{s.desc}</p>
                    <Button size="sm" variant="outline" className="w-full h-8 text-[11px] rounded-lg bg-white/50 hover:bg-white border-white/40 shadow-sm">
                      Apply to Calculator
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">The Prepayment Acceleration Magic</strong> — In the early years of a loan, 70–80% of your EMI goes strictly to interest while principal decreases slowly. Any extra prepayment directly reduces the core principal...
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tile 5 & 6: Donut Charts (Col span 3) */}
          <Card className="md:col-span-4 lg:col-span-3 rounded-3xl shadow-sm border-slate-200 flex flex-col">
            <CardHeader className="pb-0 text-center">
              <CardTitle className="text-sm font-bold">Comparison Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex-1 min-h-[140px] flex flex-col items-center">
                <p className="text-xs font-medium text-slate-500 mb-1 text-center">Traditional Bank Contract</p>
                <div className="h-28 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={30} outerRadius={45} stroke="none" dataKey="value">
                        {pieStandard.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatRupees(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Total: {formatRupees(stdTotal)}</p>
              </div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="flex-1 min-h-[140px] flex flex-col items-center">
                <p className="text-xs font-medium text-emerald-600 mb-1 text-center flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Accelerated Prepayout
                </p>
                <div className="h-28 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={30} outerRadius={45} stroke="none" dataKey="value">
                        {pieAccelerated.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatRupees(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-emerald-600 font-medium">Total: {formatRupees(accTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full-width Amortization Ledger */}
        <Card className="rounded-3xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Detailed Amortization & Repayment Ledger
              </CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input placeholder="Search..." className="pl-9 h-9 w-48 rounded-xl text-sm bg-slate-50 border-transparent focus-visible:border-indigo-500" />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setTableMode("yearly")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${tableMode === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${tableMode === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Monthly</button>
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-1 rounded-xl">
                Export Report <ChevronDown className="w-4 h-4 ml-1 text-slate-500" />
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Year</th>
                  <th className="px-6 py-4 font-semibold text-right">Opening Balance</th>
                  <th className="px-6 py-4 font-semibold text-right">EMI Paid</th>
                  <th className="px-6 py-4 font-semibold text-right">Extra Prepaid</th>
                  <th className="px-6 py-4 font-semibold text-right">Interest</th>
                  <th className="px-6 py-4 font-semibold text-right">Principal</th>
                  <th className="px-6 py-4 font-semibold text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearlyRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">Year {row.year}</td>
                    <td className="px-6 py-3 text-right text-slate-600">{formatRupees(row.opening)}</td>
                    <td className="px-6 py-3 text-right text-slate-600">{formatRupees(row.emiPaid)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center justify-end">
                        <Input 
                          defaultValue={row.extraPaid} 
                          className="h-7 w-28 text-right text-xs bg-emerald-50/50 border-emerald-100 text-emerald-700 font-medium focus-visible:ring-emerald-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-amber-600/80">{formatRupees(row.interest)}</td>
                    <td className="px-6 py-3 text-right text-indigo-600/80">{formatRupees(row.principal)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">{formatRupees(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t-2 border-slate-200">
                <tr>
                  <td className="px-6 py-4">Total</td>
                  <td className="px-6 py-4 text-right">—</td>
                  <td className="px-6 py-4 text-right">{formatRupees(yearlyRows.reduce((a, b) => a + b.emiPaid, 0))}</td>
                  <td className="px-6 py-4 text-right text-emerald-600">{formatRupees(yearlyRows.reduce((a, b) => a + b.extraPaid, 0))}</td>
                  <td className="px-6 py-4 text-right text-amber-600">{formatRupees(stdInterest)}</td>
                  <td className="px-6 py-4 text-right text-indigo-600">{formatRupees(principal)}</td>
                  <td className="px-6 py-4 text-right">₹0</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
