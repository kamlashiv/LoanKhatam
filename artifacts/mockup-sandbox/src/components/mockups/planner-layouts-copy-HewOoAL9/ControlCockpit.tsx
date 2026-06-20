import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target, Download, Upload, FileText, CheckCircle2, AlertCircle, Loader2,
  TrendingDown, Zap, BarChart3, RefreshCw, Plus, Pencil, Save, X, Calculator,
  Sparkles, ChevronDown, PiggyBank, Coins, CalendarRange, Scale, ArrowUpRight,
  TrendingUp, Award, Flame, Info, Search, Table as TableIcon, EyeOff, FileSpreadsheet, FileCode
} from "lucide-react";

// --- Mock Data ---
const MOCK_DATA = {
  principal: 2500000,
  rate: 8.5,
  tenure: 240,
  baseEMI: 21696,
  extra: 2170,
  standardInterest: 2706939,
  standardPaid: 5206939,
  acceleratedInterest: 2080849,
  acceleratedPaid: 4580849,
  interestSaved: 626091,
  tenureSaved: 4,
};

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

const STRATEGIES = [
  {
    title: "1 Extra EMI / Year",
    icon: TrendingUp,
    colors: "from-blue-50 to-indigo-100 border-blue-200 text-blue-600",
    saved: "Saves ₹5,14,577 & 3 Yr(s), 3 Mo(s)",
    detail: "₹21,696/yr",
  },
  {
    title: "Micro-Savings (5% Monthly)",
    icon: Award,
    colors: "from-emerald-50 to-teal-100 border-emerald-200 text-emerald-600",
    saved: "Saves ₹3,58,882 & 2 Yr(s), 3 Mo(s)",
    detail: "+₹1,085/mo",
  },
  {
    title: "10% Monthly Boost",
    icon: PiggyBank,
    colors: "from-amber-50 to-orange-100 border-amber-200 text-amber-600",
    saved: "Saves ₹6,26,091 & 4 Yr(s)",
    detail: "+₹2,170/mo",
  },
  {
    title: "Super-Saver Combo",
    icon: Flame,
    colors: "from-rose-50 to-pink-100 border-rose-200 text-rose-600",
    saved: "Saves ₹9,27,880 & 6 Yr(s)",
    detail: "+₹2,170/mo · ₹21,696/yr",
  },
];

const BALANCE_DATA = Array.from({ length: 21 }).map((_, i) => ({
  year: `Year ${i}`,
  "Standard Balance": Math.max(0, MOCK_DATA.principal - i * (MOCK_DATA.principal / 20)),
  "Accelerated Balance": Math.max(0, MOCK_DATA.principal - i * (MOCK_DATA.principal / 16)),
}));

const COST_DATA = [
  { name: "Standard Path", Principal: MOCK_DATA.principal, Interest: MOCK_DATA.standardInterest },
  { name: "Savings Plan", Principal: MOCK_DATA.principal, Interest: MOCK_DATA.acceleratedInterest },
];

const PIE_STANDARD = [
  { name: "Principal", value: MOCK_DATA.principal, color: "#6366f1" },
  { name: "Total Interest", value: MOCK_DATA.standardInterest, color: "#f59e0b" },
];

const PIE_ACCELERATED = [
  { name: "Principal", value: MOCK_DATA.principal, color: "#6366f1" },
  { name: "Total Interest", value: MOCK_DATA.acceleratedInterest, color: "#10b981" },
  { name: "Interest Saved", value: MOCK_DATA.interestSaved, color: "#e5e7eb" },
];

const LEDGER_ROWS = Array.from({ length: 17 }).map((_, i) => {
  const opening = Math.max(0, MOCK_DATA.principal - i * (MOCK_DATA.principal / 16));
  const interest = opening * 0.085;
  const principal = (MOCK_DATA.baseEMI + MOCK_DATA.extra) * 12 - interest;
  const closing = Math.max(0, opening - principal);
  return {
    year: i + 1,
    opening,
    emi: MOCK_DATA.baseEMI * 12,
    extra: MOCK_DATA.extra * 12,
    interest,
    principal,
    closing,
  };
});

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-lg shadow-md px-3 py-2.5 text-xs">
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

export function ControlCockpit() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableExpanded, setTableExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Target className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none mb-1">Smart Loan Saver</h1>
            <p className="text-xs text-slate-500 hidden md:block">
              Plan prepayments, compare strategies, and see exactly how much interest and time you save
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs h-9">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Sticky Control Rail */}
        <aside className="w-80 border-r border-slate-200 bg-white flex flex-col overflow-y-auto hidden md:flex sticky top-[73px] h-[calc(100vh-73px)] shrink-0 shadow-sm z-20">
          <div className="p-4 flex-1">
            <Tabs defaultValue="loan" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                <TabsTrigger value="loan" className="text-[10px] px-1">Loan</TabsTrigger>
                <TabsTrigger value="topup" className="text-[10px] px-1">Top-up</TabsTrigger>
                <TabsTrigger value="reverse" className="text-[10px] px-1">Target</TabsTrigger>
                <TabsTrigger value="import" className="text-[10px] px-1">Import</TabsTrigger>
              </TabsList>

              <TabsContent value="loan" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Principal Amount</Label>
                    <span className="text-xs font-bold text-indigo-600">₹25,00,000</span>
                  </div>
                  <Slider defaultValue={[2500000]} max={50000000} step={100000} />
                  <Input type="number" defaultValue="2500000" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Interest Rate</Label>
                    <span className="text-xs font-bold text-indigo-600">8.5%</span>
                  </div>
                  <Slider defaultValue={[8.5]} max={20} step={0.1} />
                  <Input type="number" defaultValue="8.5" className="h-8 text-sm" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Tenure</Label>
                    <span className="text-xs font-bold text-indigo-600">240 mo (20 yr)</span>
                  </div>
                  <Slider defaultValue={[240]} max={360} step={1} />
                  <Input type="number" defaultValue="240" className="h-8 text-sm" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Extra EMI / month</Label>
                    <span className="text-xs font-bold text-emerald-600">+₹2,170</span>
                  </div>
                  <Slider defaultValue={[2170]} max={50000} step={500} />
                  <Input type="number" defaultValue="2170" className="h-8 text-sm" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-8 text-sm" />
                </div>
              </TabsContent>

              <TabsContent value="topup" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Top-up Amount</Label>
                  <Input type="number" defaultValue="0" className="h-8 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Top-up Rate (%)</Label>
                  <Input type="number" defaultValue="9.0" className="h-8 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Disbursement Month</Label>
                  <Input type="number" defaultValue="12" className="h-8 text-sm" />
                </div>
              </TabsContent>

              <TabsContent value="reverse" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Target Payoff Years</Label>
                    <span className="text-xs font-bold text-indigo-600">10 Yrs</span>
                  </div>
                  <Slider defaultValue={[10]} max={30} step={1} />
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Required Monthly Payment</p>
                  <p className="text-lg font-bold text-indigo-700">₹30,996</p>
                  <p className="text-[10px] text-indigo-600 mt-1">Extra +₹9,300/mo needed</p>
                </div>
              </TabsContent>

              <TabsContent value="import" className="space-y-4 mt-0">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="font-semibold text-xs mb-1">Upload or drag a file</p>
                  <p className="text-[10px] text-slate-500">PNG • JPG • PDF • JSON • CSV — data fills in automatically</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <Button variant="ghost" className="w-full text-xs h-8 gap-2 text-slate-600 hover:text-slate-900">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset All
            </Button>
          </div>
        </aside>

        {/* RIGHT PANEL: Results Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8 pb-20">
            
            {/* Top Stat Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-emerald-800 mb-1 flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5" /> Interest Saved
                  </p>
                  <p className="text-2xl font-black text-emerald-600">{formatRupees(MOCK_DATA.interestSaved)}</p>
                  <p className="text-[10px] text-emerald-600/80 mt-1">≈23% of standard interest</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-blue-800 mb-1 flex items-center gap-1.5">
                    <CalendarRange className="h-3.5 w-3.5" /> Tenure Saved
                  </p>
                  <p className="text-2xl font-black text-blue-600">4 Yrs</p>
                  <p className="text-[10px] text-blue-600/80 mt-1">loan clears in 16 yrs instead of 20</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                    <Coins className="h-3.5 w-3.5" /> Net Principal
                  </p>
                  <p className="text-2xl font-black text-slate-800">{formatRupees(MOCK_DATA.principal)}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5" /> Monthly EMI
                  </p>
                  <p className="text-2xl font-black text-slate-800">{formatRupees(MOCK_DATA.baseEMI)}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">+₹2,170 extra applied</p>
                </CardContent>
              </Card>
            </div>

            {/* Strategies */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Smart Payoff Leverage Strategies
                </h2>
                <p className="text-sm text-slate-500">Select any strategy below to instantly load it into the prepayment dashboard</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STRATEGIES.map((strat, i) => {
                  const Icon = strat.icon;
                  return (
                    <Card key={i} className={`rounded-xl border ${strat.colors} bg-gradient-to-br shadow-sm`}>
                      <CardContent className="p-4">
                        <Icon className="h-6 w-6 mb-3 opacity-80" />
                        <h3 className="font-bold text-sm mb-1">{strat.title}</h3>
                        <p className="text-[10px] opacity-80 mb-3">{strat.saved}</p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-[10px] font-medium bg-white/50 px-2 py-0.5 rounded-full">{strat.detail}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full bg-white/50 hover:bg-white">
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="mt-4 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                <p className="text-xs text-indigo-900/80 leading-relaxed flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
                  <span className="font-medium">The Prepayment Acceleration Magic</span> — In the early years of a loan, 70–80% of your EMI goes strictly to interest while principal decreases slowly. Any extra prepayment directly reduces the core principal...
                </p>
              </div>
            </div>

            {/* Charts & Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Comparative Chart */}
              <Card className="lg:col-span-2 rounded-2xl shadow-sm border-slate-200">
                <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                    Comparison
                  </CardTitle>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      className={`text-xs px-3 py-1 rounded-md transition-colors ${chartTab === "balance" ? "bg-white shadow-sm font-medium" : "text-slate-500 hover:text-slate-900"}`}
                      onClick={() => setChartTab("balance")}
                    >
                      Balance Over Time
                    </button>
                    <button
                      className={`text-xs px-3 py-1 rounded-md transition-colors ${chartTab === "costs" ? "bg-white shadow-sm font-medium" : "text-slate-500 hover:text-slate-900"}`}
                      onClick={() => setChartTab("costs")}
                    >
                      Total Costs
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartTab === "balance" ? (
                      <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorAccelerated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} minTickGap={30} />
                        <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="Standard Balance" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorStandard)" />
                        <Area type="monotone" dataKey="Accelerated Balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAccelerated)" />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </AreaChart>
                    ) : (
                      <BarChart data={COST_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={60}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#334155' }} dy={10} />
                        <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Interest" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Charts */}
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Scale className="h-4 w-4 text-indigo-600" />
                    Contract vs Savings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                  <div className="h-[120px] flex items-center">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={PIE_STANDARD} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                            {PIE_STANDARD.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2">
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Traditional Bank</p>
                      <p className="text-sm font-bold">{compactRupees(MOCK_DATA.standardPaid)}</p>
                    </div>
                  </div>
                  
                  <div className="h-[120px] flex items-center border-t border-slate-100 pt-4">
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={PIE_ACCELERATED} innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                            {PIE_ACCELERATED.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2">
                      <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-1">Accelerated Path</p>
                      <p className="text-sm font-bold text-emerald-700">{compactRupees(MOCK_DATA.acceleratedPaid)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ledger */}
            <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <TableIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Amortization & Repayment Ledger</CardTitle>
                    <CardDescription className="text-xs">Detailed year-by-year breakdown</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                    <Input placeholder="Search year..." className="h-7 w-32 pl-8 text-xs bg-white" />
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white">
                    Yearly <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => setTableExpanded(!tableExpanded)}>
                    {tableExpanded ? "Collapse" : "Expand"}
                  </Button>
                </div>
              </CardHeader>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100/50 text-slate-500 font-medium">
                    <tr>
                      <th className="p-3 text-left w-20">Year</th>
                      <th className="p-3">Opening Bal</th>
                      <th className="p-3">EMI Paid</th>
                      <th className="p-3">Extra Prepaid</th>
                      <th className="p-3">Interest</th>
                      <th className="p-3">Principal</th>
                      <th className="p-3">Closing Bal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(tableExpanded ? LEDGER_ROWS : LEDGER_ROWS.slice(0, 5)).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-left font-medium text-slate-700">Year {row.year}</td>
                        <td className="p-3">{formatRupees(row.opening)}</td>
                        <td className="p-3 text-slate-500">{formatRupees(row.emi)}</td>
                        <td className="p-3">
                          <Input 
                            defaultValue={row.extra} 
                            className="h-6 w-20 text-xs text-right ml-auto px-2 py-0" 
                          />
                        </td>
                        <td className="p-3 text-amber-600">{formatRupees(row.interest)}</td>
                        <td className="p-3 text-indigo-600">{formatRupees(row.principal)}</td>
                        <td className="p-3 font-semibold text-slate-700">{formatRupees(row.closing)}</td>
                      </tr>
                    ))}
                    {!tableExpanded && (
                      <tr>
                        <td colSpan={7} className="p-3 text-center text-slate-500 text-xs italic bg-slate-50/30">
                          ... {LEDGER_ROWS.length - 5} more rows hidden
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <tr>
                      <td className="p-3 text-left">Totals</td>
                      <td className="p-3">—</td>
                      <td className="p-3">{formatRupees(MOCK_DATA.baseEMI * 192)}</td>
                      <td className="p-3">{formatRupees(MOCK_DATA.extra * 192)}</td>
                      <td className="p-3 text-amber-600">{formatRupees(MOCK_DATA.acceleratedInterest)}</td>
                      <td className="p-3 text-indigo-600">{formatRupees(MOCK_DATA.principal)}</td>
                      <td className="p-3">₹0</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
