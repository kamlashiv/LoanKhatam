import React, { useState } from "react";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Target, Download, Upload, TrendingUp, Award, PiggyBank, Flame, Search, ChevronDown, CheckCircle2, FileText, Sparkles, Save
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
  grey: "#e5e7eb",
  white: "#ffffff",
};

const RADIAN = Math.PI / 180;
function renderSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

const STRAT_VISUAL = [
  { icon: TrendingUp, card: "from-indigo-50/50 to-indigo-100/50 border-indigo-100", iconColor: "text-indigo-600" },
  { icon: Award, card: "from-emerald-50/50 to-emerald-100/50 border-emerald-100", iconColor: "text-emerald-600" },
  { icon: PiggyBank, card: "from-amber-50/50 to-amber-100/50 border-amber-100", iconColor: "text-amber-600" },
  { icon: Flame, card: "from-rose-50/50 to-rose-100/50 border-rose-100", iconColor: "text-rose-600" },
];

export function RefinedLight() {
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

  const pieMoneyStd = [
    { name: "Loan Amount", value: principal, color: COLORS.indigo },
    { name: "Interest", value: stdInterest, color: COLORS.amber },
  ];
  const pieMoneySavings = [
    { name: "Loan Amount", value: principal, color: COLORS.indigo },
    { name: "Interest", value: accInterest, color: COLORS.emerald },
  ];
  const interestShareStd = Math.round((stdInterest / (principal + stdInterest)) * 100);
  const interestShareSavings = Math.round((accInterest / (principal + accInterest)) * 100);

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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-['Plus_Jakarta_Sans'] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 text-indigo-600">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Smart Loan Saver</h1>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
                Plan prepayments, compare strategies, and see exactly how much interest and time you save
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 shrink-0 rounded-xl bg-white border-slate-200 shadow-sm font-semibold hover:bg-slate-50 hover:text-indigo-600 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </header>

        {/* Impact Summary */}
        <Card className="rounded-[2rem] border-0 shadow-lg shadow-indigo-600/10 overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-600 text-white relative">
          <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none">
            <Sparkles className="w-64 h-64" />
          </div>
          <CardContent className="p-8 md:p-10 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-start gap-5 max-w-2xl">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">Your Impact Summary</p>
                  <p className="text-xl md:text-2xl font-bold leading-relaxed text-white/90">
                    Paying <span className="text-white bg-white/10 px-2 py-0.5 rounded-lg">{formatRupees(extraEmi)}</span> extra each month saves you{" "}
                    <span className="text-emerald-300 font-extrabold">{formatRupees(intSaved)}</span> in interest and clears your loan{" "}
                    <span className="text-emerald-300 font-extrabold">{tenureSavedYrs} years sooner</span>.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 lg:gap-10 shrink-0 bg-black/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
                <div className="text-center lg:text-left">
                  <p className="text-3xl md:text-4xl font-extrabold tracking-tight">{compactRupees(intSaved)}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mt-2">Interest Saved</p>
                </div>
                <div className="text-center lg:text-left lg:border-l lg:border-white/20 lg:pl-10">
                  <p className="text-3xl md:text-4xl font-extrabold tracking-tight">{tenureSavedYrs} <span className="text-2xl">Yrs</span></p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mt-2">Debt-Free Sooner</p>
                </div>
                <div className="text-center lg:text-left lg:border-l lg:border-white/20 lg:pl-10">
                  <p className="text-3xl md:text-4xl font-extrabold tracking-tight">{Math.round((intSaved / stdInterest) * 100)}%</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mt-2">Less Interest</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Where Your Money Goes */}
        <Card className="rounded-3xl shadow-sm border-slate-200/60 bg-white overflow-hidden">
          <CardHeader className="text-center pb-0 pt-8">
            <CardTitle className="text-xl font-bold text-slate-900">Where Does Your Money Go?</CardTitle>
            <CardDescription className="text-sm font-medium mt-1">A simple look at how much you pay back as the loan amount vs. extra interest</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {[
                { label: "Paying the Normal Way", data: pieMoneyStd, share: interestShareStd, total: stdTotal, tone: "text-amber-600", note: `For every ₹100 you repay, about ₹${interestShareStd} is just interest.` },
                { label: "With Smart Prepayments", data: pieMoneySavings, share: interestShareSavings, total: accTotal, tone: "text-emerald-600", note: `With smart payments, only about ₹${interestShareSavings} of every ₹100 is interest.` },
              ].map((p, i) => (
                <div key={p.label} className={`flex flex-col items-center ${i === 1 ? 'md:pl-12 pt-8 md:pt-0' : 'md:pr-12 pb-8 md:pb-0'}`}>
                  <p className="text-base font-bold text-slate-800 mb-6">{p.label}</p>
                  <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={p.data} cx="50%" cy="50%" outerRadius={110} dataKey="value" labelLine={false} label={renderSliceLabel} stroke="#ffffff" strokeWidth={3} isAnimationActive={false}>
                          {p.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(val: number) => formatRupees(val)}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 mt-6">
                    {p.data.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs font-medium text-slate-600">{entry.name}</span>
                        <span className="text-xs font-bold text-slate-900">{compactRupees(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-6 p-4 rounded-2xl w-full text-center ${i === 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    <p className={`text-sm font-semibold ${p.tone}`}>{p.note}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-2 uppercase tracking-wide">Total repaid: {formatRupees(p.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-min">
          
          {/* Tile 1: Input Controls (Col span 3) */}
          <Card className="md:col-span-4 lg:col-span-3 row-span-2 rounded-3xl shadow-sm border-slate-200/60 bg-white flex flex-col">
            <CardHeader className="bg-slate-50/50 pb-5 border-b border-slate-100/80 rounded-t-3xl">
              <CardTitle className="text-lg font-bold">Loan Details</CardTitle>
              <CardDescription className="text-xs font-medium">Configure your loan parameters</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-7 flex-1 overflow-y-auto">
              
              <div className="border-2 border-dashed border-indigo-100 hover:border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/50 rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 group">
                <div className="w-12 h-12 bg-white shadow-sm border border-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="font-bold text-sm text-slate-800">Upload or drag a file</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1.5 px-2">PNG • JPG • PDF • JSON • CSV data fills in automatically</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Principal (₹)</Label>
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">{formatRupees(principal)}</span>
                  </div>
                  <Slider defaultValue={[principal]} max={5000000} step={100000} className="py-2" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rate (%)</Label>
                    <Input defaultValue={rate} type="number" className="h-10 rounded-xl text-sm font-semibold border-slate-200 focus-visible:ring-indigo-500 bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tenure (Mo)</Label>
                    <Input defaultValue={tenureMo} type="number" className="h-10 rounded-xl text-sm font-semibold border-slate-200 focus-visible:ring-indigo-500 bg-slate-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-10 rounded-xl text-sm font-semibold border-slate-200 focus-visible:ring-indigo-500 bg-slate-50" />
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Extra EMI / month</Label>
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">{formatRupees(extraEmi)}</span>
                  </div>
                  <Slider defaultValue={[extraEmi]} max={10000} step={100} className="py-2 [&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:shadow-emerald-200" />
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Top-up Loan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Amt" className="h-9 text-xs font-medium rounded-lg bg-slate-50 border-slate-200" />
                    <Input placeholder="Rate%" className="h-9 text-xs font-medium rounded-lg bg-slate-50 border-slate-200" />
                    <Input placeholder="Month" className="h-9 text-xs font-medium rounded-lg bg-slate-50 border-slate-200" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reverse Calculator: Target Yrs</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="py-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
              <Button variant="ghost" className="w-full text-slate-500 font-bold hover:text-slate-800 hover:bg-slate-200/50 h-10 rounded-xl transition-colors">Reset All Parameters</Button>
            </CardFooter>
          </Card>

          {/* Tile 2: Summary Metrics (Col span 9, nested grid) */}
          <div className="md:col-span-4 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-min">
            <Card className="rounded-3xl shadow-sm border-0 bg-emerald-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <PiggyBank className="w-20 h-20 text-emerald-900" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800/70 mb-2">Interest Saved</p>
                <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">{formatRupees(intSaved)}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-800">
                  <TrendingUp className="w-3.5 h-3.5" /> ≈23% of standard interest
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-0 bg-emerald-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <Target className="w-20 h-20 text-emerald-900" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800/70 mb-2">Tenure Saved</p>
                <p className="text-3xl font-extrabold text-emerald-700 tracking-tight">{tenureSavedYrs} <span className="text-xl">Yrs</span></p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-800">
                  Clears in 16 yrs instead of 20
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-slate-200/60 bg-white">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Net Principal</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatRupees(principal)}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-600">
                  Total borrowed amount
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-sm border-slate-200/60 bg-white">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Monthly EMI</p>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatRupees(baseEmi)}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md text-[11px] font-bold text-indigo-700">
                  +{formatRupees(extraEmi)} extra/mo
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tile 3: Main Chart (Col span 5) */}
          <Card className="md:col-span-4 lg:col-span-5 rounded-3xl shadow-sm border-slate-200/60 bg-white flex flex-col">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between border-b border-slate-100/50">
              <CardTitle className="text-lg font-bold">Projection</CardTitle>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setChartTab("balance")} className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${chartTab === "balance" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${chartTab === "costs" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>Costs</button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-6 flex-1 min-h-[320px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.rose} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS.rose} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.slate, fontWeight: 500 }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.slate, fontWeight: 500 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a', fontSize: '13px', fontWeight: 600 }}
                      formatter={(val: number) => formatRupees(val)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke={COLORS.rose} fillOpacity={1} fill="url(#colorStd)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke={COLORS.emerald} fillOpacity={1} fill="url(#colorAcc)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barSize={60}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: COLORS.slate, fontWeight: 600 }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.slate, fontWeight: 500 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a', fontSize: '13px', fontWeight: 600 }}
                      formatter={(val: number) => formatRupees(val)}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, paddingTop: '20px' }} />
                    <Bar dataKey="Principal" stackId="a" fill={COLORS.indigo} radius={[0, 0, 8, 8]} />
                    <Bar dataKey="Interest" stackId="a" fill={COLORS.amber} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tile 4: Strategies Grid (Col span 4) */}
          <Card className="md:col-span-4 lg:col-span-4 rounded-3xl shadow-sm border-slate-200/60 bg-white flex flex-col">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg font-bold">Smart Payoff Leverage Strategies</CardTitle>
              <CardDescription className="text-sm font-medium mt-1">Select any strategy below to instantly load it into the prepayment dashboard</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.map((s, i) => (
                  <div key={i} className={`rounded-2xl p-5 border bg-gradient-to-br ${s.card} flex flex-col hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white p-1.5 rounded-lg shadow-sm">
                        <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                      </div>
                      <h4 className="font-bold text-[13px] text-slate-900 leading-tight">{s.title}</h4>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-4 flex-1">{s.desc}</p>
                    <Button size="sm" variant="outline" className="w-full h-9 text-xs font-bold rounded-xl bg-white/80 hover:bg-white border-white/60 shadow-sm transition-colors text-slate-700 hover:text-indigo-600">
                      Apply to Calculator
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 font-bold block mb-1">The Prepayment Acceleration Magic</strong> In the early years of a loan, 70–80% of your EMI goes strictly to interest while principal decreases slowly. Any extra prepayment directly reduces the core principal...
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tile 5 & 6: Donut Charts (Col span 3) */}
          <Card className="md:col-span-4 lg:col-span-3 rounded-3xl shadow-sm border-slate-200/60 bg-white flex flex-col">
            <CardHeader className="p-6 pb-2 text-center">
              <CardTitle className="text-lg font-bold">Comparison Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <div className="flex-1 flex flex-col items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">Traditional Bank Contract</p>
                <div className="h-32 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={35} outerRadius={55} stroke="none" dataKey="value">
                        {pieStandard.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatRupees(val)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-2 bg-white px-3 py-1 rounded-full shadow-sm">Total: {formatRupees(stdTotal)}</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Accelerated Prepayout
                </p>
                <div className="h-32 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={35} outerRadius={55} stroke="none" dataKey="value">
                        {pieAccelerated.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatRupees(val)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs font-bold text-emerald-800 mt-2 bg-white px-3 py-1 rounded-full shadow-sm">Total: {formatRupees(accTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full-width Amortization Ledger */}
        <Card className="rounded-3xl shadow-sm border-slate-200/60 bg-white overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                Detailed Amortization & Repayment Ledger
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input placeholder="Search records..." className="pl-10 h-10 w-full md:w-64 rounded-xl text-sm font-medium bg-white border-slate-200 focus-visible:ring-indigo-500 shadow-sm" />
              </div>
              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all ${tableMode === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-1.5 text-sm rounded-lg font-bold transition-all ${tableMode === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Monthly</button>
              </div>
              <Button variant="outline" size="sm" className="h-10 px-4 font-bold rounded-xl border-slate-200 shadow-sm hover:bg-slate-50">
                Export <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-5">Year</th>
                  <th className="px-6 py-5 text-right">Opening Balance</th>
                  <th className="px-6 py-5 text-right">EMI Paid</th>
                  <th className="px-6 py-5 text-right">Extra Prepaid</th>
                  <th className="px-6 py-5 text-right">Interest</th>
                  <th className="px-6 py-5 text-right">Principal</th>
                  <th className="px-6 py-5 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearlyRows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-800">Year {row.year}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{formatRupees(row.opening)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{formatRupees(row.emiPaid)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end">
                        <Input 
                          defaultValue={row.extraPaid} 
                          className="h-8 w-28 text-right text-sm font-bold bg-emerald-50/50 border-emerald-200 text-emerald-700 focus-visible:ring-emerald-500 rounded-lg group-hover:bg-white transition-colors"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-amber-600/80">{formatRupees(row.interest)}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600/80">{formatRupees(row.principal)}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">{formatRupees(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold text-slate-900 border-t-2 border-slate-200">
                <tr>
                  <td className="px-6 py-5">Total</td>
                  <td className="px-6 py-5 text-right text-slate-400">—</td>
                  <td className="px-6 py-5 text-right">{formatRupees(yearlyRows.reduce((a, b) => a + b.emiPaid, 0))}</td>
                  <td className="px-6 py-5 text-right text-emerald-600 bg-emerald-50/50">{formatRupees(yearlyRows.reduce((a, b) => a + b.extraPaid, 0))}</td>
                  <td className="px-6 py-5 text-right text-amber-600">{formatRupees(stdInterest)}</td>
                  <td className="px-6 py-5 text-right text-indigo-600">{formatRupees(principal)}</td>
                  <td className="px-6 py-5 text-right">₹0</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Closing CTA */}
        <div className="flex flex-col items-center justify-center p-12 text-center bg-indigo-50/50 rounded-3xl border border-indigo-100/50 mt-12 mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">Ready to put this plan into action?</h2>
          <p className="text-slate-600 font-medium max-w-lg mb-8">Save this scenario to your dashboard to track your real-world payments against this goal.</p>
          <Button className="h-12 px-8 text-base font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 gap-2">
            <Save className="w-5 h-5" /> Save as Loan Plan
          </Button>
        </div>

      </div>
    </div>
  );
}
