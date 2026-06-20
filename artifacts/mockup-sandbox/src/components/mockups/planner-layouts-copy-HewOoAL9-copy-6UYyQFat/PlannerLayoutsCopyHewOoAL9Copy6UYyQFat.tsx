import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Target, Upload, FileText, CheckCircle2, AlertCircle, Loader2,
  TrendingDown, Zap, BarChart3, RefreshCw, Plus,
  Download, Pencil, Save, X, Calculator, Sparkles, ChevronDown,
  PiggyBank, Coins, CalendarRange, Scale, ArrowUpRight, CheckCircle,
  TrendingUp, Award, Flame, Info, Search, Table as TableIcon, EyeOff, ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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

export function PlannerLayoutsCopyHewOoAL9Copy6UYyQFat() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Pinned Top Control Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center">
                <Target className="h-4 w-4 text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Smart Loan Saver</h1>
              <span className="text-slate-400 mx-2">|</span>
              <p className="text-sm text-slate-500 hidden sm:block">Plan prepayments, compare strategies, and see exactly how much you save.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center gap-6">
            <div className="flex-1 min-w-[200px] space-y-1">
              <Label className="text-xs text-slate-500">Principal (₹)</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="2500000" className="h-8 text-sm" />
              </div>
            </div>
            <div className="flex-1 min-w-[120px] space-y-1">
              <Label className="text-xs text-slate-500">Interest Rate (%)</Label>
              <Input type="number" defaultValue="8.5" step="0.1" className="h-8 text-sm" />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1">
              <Label className="text-xs text-slate-500">Tenure (20 yrs)</Label>
              <Input type="number" defaultValue="240" className="h-8 text-sm" />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1">
              <Label className="text-xs text-slate-500">Start Month</Label>
              <Input type="month" defaultValue="2023-01" className="h-8 text-sm" />
            </div>
            <div className="flex-1 min-w-[180px] space-y-1">
              <Label className="text-xs font-semibold text-indigo-600">Extra EMI / month (₹)</Label>
              <Input type="number" defaultValue="2170" className="h-8 text-sm border-indigo-200 bg-indigo-50/50" />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="h-8 text-xs text-slate-500 hover:text-slate-900">
                {showAdvanced ? "Less" : "Advanced"} {showAdvanced ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
              <Card className="shadow-none border-dashed bg-slate-50/50">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Upload className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Auto-fill from Document</p>
                    <p className="text-xs text-slate-500 mb-2">Upload or drag a file — PNG • JPG • PDF • JSON • CSV — data fills in automatically</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs w-full">Select File</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <p className="text-sm font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Top-Up Loan</p>
                <div className="flex gap-2">
                  <div className="flex-1"><Label className="text-xs">Amount</Label><Input className="h-7 text-xs" placeholder="₹0" /></div>
                  <div className="w-16"><Label className="text-xs">Rate</Label><Input className="h-7 text-xs" placeholder="9%" /></div>
                  <div className="w-16"><Label className="text-xs">Month</Label><Input className="h-7 text-xs" placeholder="12" /></div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold flex items-center gap-2"><Target className="h-4 w-4" /> Reverse Calculator</p>
                <Label className="text-xs">Target Payoff: 10 Years</Label>
                <Slider defaultValue={[10]} max={30} step={1} className="py-2" />
                <p className="text-xs text-slate-500 mt-1">Requires ₹30,996/mo (+₹9,300 extra)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-12 space-y-16">
        
        {/* Hero Savings Band */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Impact Summary
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            You save <span className="text-emerald-600">₹6,26,091</span> <br/>and <span className="text-emerald-600">4 years</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            By adding just ₹2,170 to your monthly payment, you transform a 20-year burden into a 16-year victory.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-slate-200 shadow-sm text-center py-6 bg-emerald-50/30">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">Interest Saved</p>
            <p className="text-2xl font-bold text-emerald-600 mb-1">₹6,26,091</p>
            <p className="text-xs text-emerald-600/70">≈23% of standard interest</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 shadow-sm text-center py-6 bg-indigo-50/30">
            <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Tenure Saved</p>
            <p className="text-2xl font-bold text-indigo-600 mb-1">4 Yrs</p>
            <p className="text-xs text-indigo-600/70">Clears in 16 yrs instead of 20</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 shadow-sm text-center py-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Net Principal</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">₹25,00,000</p>
            <p className="text-xs text-slate-400">Total borrowed</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 shadow-sm text-center py-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Monthly EMI</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">₹21,696</p>
            <p className="text-xs font-medium text-emerald-600">+₹2,170 extra</p>
          </Card>
        </div>

        <hr className="border-slate-200" />

        {/* Strategies Section */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Smart Payoff Leverage Strategies</h3>
            <p className="text-slate-500 text-sm">Select any strategy below to instantly load it into the prepayment dashboard.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STRATEGIES.map((s, i) => (
              <Card key={i} className={`rounded-2xl shadow-sm border bg-gradient-to-br ${s.colors} hover:shadow-md transition-all`}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl bg-white/60 shadow-sm flex items-center justify-center shrink-0 ${s.iconColor}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{s.title}</h4>
                    <p className="text-xs text-slate-700 mb-3">{s.detail}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="bg-white/60 text-slate-800 border-none font-semibold">
                        Saves {s.saves}
                      </Badge>
                    </div>
                    <Button size="sm" variant="secondary" className="w-full bg-white/80 hover:bg-white text-xs font-semibold shadow-sm">
                      Apply to Calculator
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-slate-100/50 border-slate-200 shadow-none rounded-xl">
            <CardContent className="p-4 flex gap-3 text-sm text-slate-600">
              <Info className="h-5 w-5 shrink-0 text-slate-400 mt-0.5" />
              <p>
                <strong>The Prepayment Acceleration Magic —</strong> In the early years of a loan, 70–80% of your EMI goes strictly to interest while principal decreases slowly. Any extra prepayment directly reduces the core principal...
              </p>
            </CardContent>
          </Card>
        </div>

        <hr className="border-slate-200" />

        {/* Charts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Visual Comparison</h3>
            <div className="bg-slate-100 p-1 rounded-lg flex text-sm">
              <button 
                onClick={() => setChartTab("balance")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${chartTab === "balance" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                Balance Over Time
              </button>
              <button 
                onClick={() => setChartTab("costs")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${chartTab === "costs" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                Total Costs Saved
              </button>
            </div>
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-sm p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === "balance" ? (
                <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAccel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} minTickGap={30} />
                  <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Standard Balance" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorStandard)" />
                  <Area type="monotone" dataKey="Accelerated Balance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAccel)" />
                </AreaChart>
              ) : (
                <BarChart data={costData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={60}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Interest" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </Card>
        </div>

        <hr className="border-slate-200" />

        {/* Ledger Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-xl font-bold">Amortization Ledger</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search..." className="pl-9 h-9 text-sm w-[180px]" />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                Yearly <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Download className="h-3.5 w-3.5" /> Export Report
              </Button>
            </div>
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3 text-right">Opening Balance</th>
                    <th className="px-4 py-3 text-right">EMI Paid</th>
                    <th className="px-4 py-3 text-right">Extra Prepaid</th>
                    <th className="px-4 py-3 text-right">Interest</th>
                    <th className="px-4 py-3 text-right">Principal</th>
                    <th className="px-4 py-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">Year {row.year}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatRupees(row.opening)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatRupees(row.emiPaid)}</td>
                      <td className="px-4 py-3 text-right">
                        <Input 
                          type="number" 
                          defaultValue={row.extraPaid}
                          className="h-7 w-24 text-right text-xs bg-slate-50 border-slate-200 ml-auto focus:bg-white"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600">{formatRupees(row.interest)}</td>
                      <td className="px-4 py-3 text-right text-indigo-600">{formatRupees(row.principal)}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">{formatRupees(row.closing)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-900">
                  <tr>
                    <td className="px-4 py-4">Total</td>
                    <td className="px-4 py-4"></td>
                    <td className="px-4 py-4 text-right">{formatRupees(21696 * 12 * 16)}</td>
                    <td className="px-4 py-4 text-right">{formatRupees(2170 * 12 * 16)}</td>
                    <td className="px-4 py-4 text-right text-amber-600">{formatRupees(2080849)}</td>
                    <td className="px-4 py-4 text-right text-indigo-600">{formatRupees(2500000)}</td>
                    <td className="px-4 py-4 text-right text-slate-400">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        <hr className="border-slate-200" />

        {/* Pies Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          <div className="text-center">
            <h4 className="font-bold text-slate-900 mb-1">Traditional Bank Contract</h4>
            <p className="text-sm text-slate-500 mb-6">Total Cost: ₹52,06,939</p>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieStandard}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                    paddingAngle={2} dataKey="value" stroke="none"
                  >
                    {pieStandard.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">20</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Years</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h4 className="font-bold text-slate-900 mb-1">Accelerated Prepayout</h4>
            <p className="text-sm text-emerald-600 font-medium mb-6">Total Cost: ₹45,80,849</p>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieAccelerated}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                    paddingAngle={2} dataKey="value" stroke="none"
                  >
                    {pieAccelerated.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-bold text-emerald-600">16</span>
                <span className="text-xs text-emerald-600/70 uppercase tracking-wider">Years</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
