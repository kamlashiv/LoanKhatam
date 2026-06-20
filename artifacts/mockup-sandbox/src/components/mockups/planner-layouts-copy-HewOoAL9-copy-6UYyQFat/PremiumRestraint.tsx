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
  Target, Download, Upload, TrendingUp, Award, PiggyBank, Flame, Search, ChevronDown, CheckCircle2, FileText, Sparkles, MoveRight
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
  slate900: "#0f172a"
};

const RADIAN = Math.PI / 180;
function renderSliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.2)" }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

const STRAT_VISUAL = [
  { icon: TrendingUp, iconColor: "text-slate-700" },
  { icon: Award, iconColor: "text-slate-700" },
  { icon: PiggyBank, iconColor: "text-slate-700" },
  { icon: Flame, iconColor: "text-slate-700" },
];

export function PremiumRestraint() {
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
    { name: "Principal", value: principal, color: COLORS.slate900 },
    { name: "Total Interest", value: stdInterest, color: COLORS.slate },
  ];
  const pieAccelerated = [
    { name: "Principal", value: principal, color: COLORS.slate900 },
    { name: "Total Interest", value: accInterest, color: COLORS.emerald },
    { name: "Interest Saved", value: intSaved, color: COLORS.grey },
  ];

  const pieMoneyStd = [
    { name: "Loan Amount", value: principal, color: COLORS.slate900 },
    { name: "Interest", value: stdInterest, color: COLORS.slate },
  ];
  const pieMoneySavings = [
    { name: "Loan Amount", value: principal, color: COLORS.slate900 },
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
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-10 font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Target className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Smart Loan Saver</h1>
              <p className="text-sm text-slate-500 mt-1.5 max-w-xl font-medium">
                Plan prepayments, compare strategies, and see exactly how much interest and time you save
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 shrink-0 rounded-lg bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm h-10 px-5">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </header>

        {/* Impact Summary - Refined Premium Slate */}
        <Card className="rounded-2xl border border-slate-800 shadow-xl overflow-hidden bg-slate-900 text-white">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="flex items-start gap-5 max-w-2xl">
                <div className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Your Impact Summary</p>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-100">
                    Paying <span className="text-white font-semibold">{formatRupees(extraEmi)}</span> extra each month saves you{" "}
                    <span className="text-emerald-400 font-semibold">{formatRupees(intSaved)}</span> in interest and clears your loan{" "}
                    <span className="text-emerald-400 font-semibold">{tenureSavedYrs} years sooner</span>.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 lg:gap-12 shrink-0">
                <div>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">{compactRupees(intSaved)}</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Interest Saved</p>
                </div>
                <div className="lg:border-l lg:border-slate-800 lg:pl-12">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">{tenureSavedYrs} Yrs</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Debt-Free Sooner</p>
                </div>
                <div className="lg:border-l lg:border-slate-800 lg:pl-12">
                  <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">{Math.round((intSaved / stdInterest) * 100)}%</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">Less Interest</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Where Your Money Goes */}
        <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white">
          <CardHeader className="text-center pb-4 pt-8">
            <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Where Does Your Money Go?</CardTitle>
            <CardDescription className="text-slate-500 font-medium">A simple look at how much you pay back as the loan amount vs. extra interest</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
              {[
                { label: "Paying the Normal Way", data: pieMoneyStd, share: interestShareStd, total: stdTotal, tone: "text-slate-600", note: `For every ₹100 you repay, about ₹${interestShareStd} is just interest.` },
                { label: "With Smart Prepayments", data: pieMoneySavings, share: interestShareSavings, total: accTotal, tone: "text-emerald-700", note: `With smart payments, only about ₹${interestShareSavings} of every ₹100 is interest.` },
              ].map((p) => (
                <div key={p.label} className="flex flex-col items-center">
                  <p className="font-semibold text-slate-900 mb-6 text-sm uppercase tracking-wide">{p.label}</p>
                  <div className="w-full h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={p.data} cx="50%" cy="50%" outerRadius={105} innerRadius={55} dataKey="value" labelLine={false} label={renderSliceLabel} stroke="#fff" strokeWidth={3} isAnimationActive={false}>
                          {p.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(val: number) => formatRupees(val)}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-6">
                    {p.data.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-medium text-slate-500">{entry.name}</span>
                        <span className="text-sm font-bold text-slate-900">{compactRupees(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl w-full text-center border border-slate-100">
                    <p className={`text-sm font-medium ${p.tone}`}>{p.note}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1.5 uppercase tracking-wide">Total repaid: {formatRupees(p.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-min">
          
          {/* Tile 1: Input Controls (Col span 3) */}
          <Card className="md:col-span-4 lg:col-span-3 row-span-2 rounded-2xl shadow-sm border border-slate-200 bg-white flex flex-col">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Loan Details</CardTitle>
              <CardDescription className="text-xs font-medium">Configure your parameters</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-7 flex-1 overflow-y-auto">
              
              <div className="border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-5 text-center cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Upload className="w-4 h-4 text-slate-600" />
                </div>
                <p className="font-semibold text-sm text-slate-700">Upload document</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">PDF, JSON, CSV</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Principal</Label>
                    <span className="text-sm font-bold text-slate-900">{formatRupees(principal)}</span>
                  </div>
                  <Slider defaultValue={[principal]} max={5000000} step={100000} className="[&_[role=slider]]:border-slate-800 [&_[role=slider]]:bg-white [&_.bg-primary]:bg-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rate (%)</Label>
                    <Input defaultValue={rate} type="number" className="h-10 rounded-lg text-sm font-medium border-slate-200 bg-slate-50/50 focus-visible:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tenure (Mo)</Label>
                    <Input defaultValue={tenureMo} type="number" className="h-10 rounded-lg text-sm font-medium border-slate-200 bg-slate-50/50 focus-visible:bg-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="h-10 rounded-lg text-sm font-medium border-slate-200 bg-slate-50/50 focus-visible:bg-white" />
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <Label className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Extra EMI / month</Label>
                    <span className="text-sm font-bold text-indigo-700">{formatRupees(extraEmi)}</span>
                  </div>
                  <Slider defaultValue={[extraEmi]} max={10000} step={100} className="[&_[role=slider]]:border-indigo-600 [&_[role=slider]]:bg-white [&_.bg-primary]:bg-indigo-500" />
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Top-up Loan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Amt" className="h-9 text-xs font-medium rounded-lg border-slate-200" />
                    <Input placeholder="Rate%" className="h-9 text-xs font-medium rounded-lg border-slate-200" />
                    <Input placeholder="Month" className="h-9 text-xs font-medium rounded-lg border-slate-200" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Years</Label>
                    <span className="text-xs font-semibold text-slate-900">16 Yrs</span>
                  </div>
                  <Slider defaultValue={[16]} max={20} min={1} className="[&_[role=slider]]:border-slate-800 [&_[role=slider]]:bg-white [&_.bg-primary]:bg-slate-800" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-slate-100">
              <Button variant="ghost" className="w-full text-slate-500 font-medium h-10 rounded-lg hover:text-slate-900 hover:bg-slate-100">Reset Defaults</Button>
            </CardFooter>
          </Card>

          {/* Tile 2: Summary Metrics (Col span 9, nested grid) */}
          <div className="md:col-span-4 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-min">
            <Card className="rounded-2xl shadow-sm border border-emerald-200 bg-[#f0fdf4]">
              <CardContent className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">Interest Saved</p>
                <p className="text-3xl font-bold text-emerald-700 tracking-tight">{formatRupees(intSaved)}</p>
                <p className="text-xs font-medium text-emerald-600/80 mt-2">≈23% of standard interest</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm border border-emerald-200 bg-[#f0fdf4]">
              <CardContent className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">Tenure Saved</p>
                <p className="text-3xl font-bold text-emerald-700 tracking-tight">{tenureSavedYrs} Yrs</p>
                <p className="text-xs font-medium text-emerald-600/80 mt-2">Clears in 16 yrs instead of 20</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white">
              <CardContent className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Net Principal</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatRupees(principal)}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -z-0"></div>
              <CardContent className="p-6 relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Monthly EMI</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatRupees(baseEmi)}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-2">+{formatRupees(extraEmi)} extra</p>
              </CardContent>
            </Card>
          </div>

          {/* Tile 3: Main Chart (Col span 5) */}
          <Card className="md:col-span-4 lg:col-span-5 rounded-2xl shadow-sm border border-slate-200 bg-white flex flex-col">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Projection</CardTitle>
              <div className="flex bg-slate-100/80 p-1 rounded-lg">
                <button onClick={() => setChartTab("balance")} className={`px-4 py-1.5 text-xs rounded-md font-semibold transition-all ${chartTab === "balance" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-4 py-1.5 text-xs rounded-md font-semibold transition-all ${chartTab === "costs" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Costs</button>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-[320px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.slate} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={COLORS.slate} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a', fontSize: '12px', fontWeight: 600 }}
                      formatter={(val: number) => formatRupees(val)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke={COLORS.slate} fillOpacity={1} fill="url(#colorStd)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke={COLORS.emerald} fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a', fontSize: '12px', fontWeight: 600 }}
                      formatter={(val: number) => formatRupees(val)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '10px' }} />
                    <Bar dataKey="Principal" stackId="a" fill={COLORS.slate900} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Interest" stackId="a" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tile 4: Strategies Grid (Col span 4) */}
          <Card className="md:col-span-4 lg:col-span-4 rounded-2xl shadow-sm border border-slate-200 bg-white flex flex-col">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Smart Payoff Leverage</CardTitle>
              <CardDescription className="text-xs font-medium">Select a strategy to simulate</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {strategies.map((s, i) => (
                  <div key={i} className="rounded-xl p-4 border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col group cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                         <s.icon className={`w-3.5 h-3.5 ${s.iconColor} group-hover:text-indigo-600`} />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">{s.title}</h4>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 leading-snug mb-4 flex-1">{s.desc}</p>
                    <Button size="sm" variant="ghost" className="w-full h-8 text-[11px] font-semibold rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-100 text-slate-600 transition-colors justify-between px-3">
                      Apply <MoveRight className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp className="w-4 h-4 text-slate-700" />
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  <strong className="text-slate-900">The Mathematics</strong> — Early in a loan, 70–80% of your EMI pays interest. Prepayments skip the interest queue and directly erase core principal.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tile 5 & 6: Donut Charts (Col span 3) */}
          <Card className="md:col-span-4 lg:col-span-3 rounded-2xl shadow-sm border border-slate-200 bg-white flex flex-col">
            <CardHeader className="p-6 pb-2 text-center border-b border-slate-100">
              <CardTitle className="text-sm font-bold tracking-tight text-slate-900">Contract Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Standard Bank Path</p>
                <div className="h-28 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={35} outerRadius={50} stroke="#fff" strokeWidth={2} dataKey="value">
                        {pieStandard.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatRupees(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-slate-500 font-bold mt-2">Total: {formatRupees(stdTotal)}</p>
              </div>
              
              <div className="flex items-center justify-center w-full">
                <div className="h-px bg-slate-100 flex-1"></div>
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white">VS</div>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accelerated Savings
                </p>
                <div className="h-28 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={35} outerRadius={50} stroke="#fff" strokeWidth={2} dataKey="value">
                        {pieAccelerated.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatRupees(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-emerald-700 font-bold mt-2">Total: {formatRupees(accTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full-width Amortization Ledger */}
        <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-slate-400" />
                Repayment Ledger
              </CardTitle>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input placeholder="Search..." className="pl-9 h-10 w-48 sm:w-64 rounded-lg text-sm font-medium bg-white border-slate-200 focus-visible:border-indigo-500 shadow-sm" />
              </div>
              <div className="flex bg-slate-200/50 p-1 rounded-lg">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-1.5 text-xs rounded-md font-semibold transition-all ${tableMode === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-1.5 text-xs rounded-md font-semibold transition-all ${tableMode === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Monthly</button>
              </div>
              <Button variant="outline" className="h-10 gap-2 rounded-lg border-slate-200 font-semibold bg-white shadow-sm">
                Export <ChevronDown className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] text-slate-500 bg-slate-50/80 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4 text-right">Opening Balance</th>
                  <th className="px-6 py-4 text-right">EMI Paid</th>
                  <th className="px-6 py-4 text-right">Extra Prepaid</th>
                  <th className="px-6 py-4 text-right">Interest</th>
                  <th className="px-6 py-4 text-right">Principal</th>
                  <th className="px-6 py-4 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearlyRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">Year {row.year}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-600">{formatRupees(row.opening)}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-600">{formatRupees(row.emiPaid)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end">
                        <Input 
                          defaultValue={row.extraPaid} 
                          className="h-8 w-28 text-right text-xs font-bold bg-white border-slate-200 text-indigo-700 focus-visible:ring-indigo-500 shadow-sm"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-500">{formatRupees(row.interest)}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-900">{formatRupees(row.principal)}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-900">{formatRupees(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td className="px-6 py-5">Total</td>
                  <td className="px-6 py-5 text-right text-slate-400">—</td>
                  <td className="px-6 py-5 text-right">{formatRupees(yearlyRows.reduce((a, b) => a + b.emiPaid, 0))}</td>
                  <td className="px-6 py-5 text-right text-indigo-700">{formatRupees(yearlyRows.reduce((a, b) => a + b.extraPaid, 0))}</td>
                  <td className="px-6 py-5 text-right text-slate-500">{formatRupees(stdInterest)}</td>
                  <td className="px-6 py-5 text-right">{formatRupees(principal)}</td>
                  <td className="px-6 py-5 text-right text-emerald-600">₹0</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Closing CTA */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-900 rounded-2xl p-8 md:p-10 shadow-xl mt-8">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Ready to put this plan into action?</h3>
            <p className="text-slate-400 font-medium mt-1.5">Save this configuration to your loan profile and track it monthly.</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white h-11 px-6 rounded-lg font-semibold">Discard</Button>
            <Button className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600 text-white h-11 px-8 rounded-lg font-semibold shadow-md">Save as Loan</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
