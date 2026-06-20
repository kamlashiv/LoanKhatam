import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Target, Upload, CheckCircle2,
  TrendingDown, BarChart3, Plus, Minus,
  Download, Calculator, Sparkles,
  PiggyBank, ArrowUpRight,
  TrendingUp, Award, Flame, Info, Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  { title: "1 Extra EMI / Year", icon: TrendingUp, colors: "bg-blue-50 border-blue-300", iconColor: "text-blue-700 bg-blue-100", saves: "₹5,14,577 & 3 Yr(s), 3 Mo(s)", detail: "₹21,696/yr" },
  { title: "Micro-Savings (5% Monthly)", icon: Award, colors: "bg-emerald-50 border-emerald-300", iconColor: "text-emerald-700 bg-emerald-100", saves: "₹3,58,882 & 2 Yr(s), 3 Mo(s)", detail: "+₹1,085/mo" },
  { title: "10% Monthly Boost", icon: PiggyBank, colors: "bg-amber-50 border-amber-300", iconColor: "text-amber-700 bg-amber-100", saves: "₹6,26,091 & 4 Yr(s)", detail: "+₹2,170/mo" },
  { title: "Super-Saver Combo", icon: Flame, colors: "bg-rose-50 border-rose-300", iconColor: "text-rose-700 bg-rose-100", saves: "₹9,27,880 & 6 Yr(s)", detail: "+₹2,170/mo · ₹21,696/yr" },
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
    <div className="bg-slate-900 border border-slate-700 text-white rounded shadow-xl px-4 py-3 text-sm z-50">
      <p className="font-bold mb-2 border-b border-slate-700 pb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-6 py-1" style={{ color: p.color }}>
          <span className="opacity-90">{p.name}:</span>
          <span className="font-black">{formatRupees(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function StepperInput({ label, defaultValue, step = 1, type = "number", suffix = "", prefix = "" }: any) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <Label className="text-sm font-bold text-slate-700">{label}</Label>
      <div className="flex items-center">
        <Button variant="outline" className="rounded-r-none h-10 w-10 p-0 bg-slate-100 hover:bg-slate-200 border-slate-300" onClick={() => setVal(Number(val) - step)}>
          <Minus className="h-4 w-4 text-slate-700" />
        </Button>
        <div className="relative flex-1">
          {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{prefix}</span>}
          <Input 
            type={type} 
            value={val} 
            onChange={(e) => setVal(e.target.value)}
            className={`h-10 rounded-none border-x-0 border-slate-300 text-center font-bold text-base focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:z-10 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`} 
          />
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{suffix}</span>}
        </div>
        <Button variant="outline" className="rounded-l-none h-10 w-10 p-0 bg-slate-100 hover:bg-slate-200 border-slate-300" onClick={() => setVal(Number(val) + step)}>
          <Plus className="h-4 w-4 text-slate-700" />
        </Button>
      </div>
    </div>
  );
}

export function AffordanceForward() {
  const [targetYears, setTargetYears] = useState([10]);

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 font-sans pb-32">
      {/* Heavy Sticky Top Control Bar */}
      <div className="sticky top-0 z-40 bg-white border-b-4 border-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-inner">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Smart Loan Saver</h1>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Interactive Planner</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="gap-2 h-10 px-5 font-bold shadow-md bg-slate-900 hover:bg-slate-800 text-white">
                <Download className="h-4 w-4" />
                Export CSV Report
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner mb-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-600" />
                Live Loan Variables
              </h2>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 animate-pulse">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Auto-recalculating
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StepperInput label="Principal Amount" defaultValue="2500000" step={100000} prefix="₹" />
              <StepperInput label="Interest Rate" defaultValue="8.5" step={0.1} suffix="%" />
              <StepperInput label="Tenure (Months)" defaultValue="240" step={12} />
              <div className="flex flex-col space-y-1.5 w-full">
                <Label className="text-sm font-bold text-slate-700">Start Month</Label>
                <Input type="month" defaultValue="2023-01" className="h-10 border-slate-300 font-bold" />
              </div>
              <div className="flex flex-col space-y-1.5 w-full">
                <Label className="text-sm font-black text-indigo-700">Extra EMI / month</Label>
                <div className="flex items-center">
                  <Input type="number" defaultValue="2170" className="h-10 border-2 border-indigo-400 bg-indigo-50 font-black text-lg text-indigo-900 focus-visible:ring-indigo-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Controls Surface */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-14 justify-start px-4 border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 group transition-all">
              <div className="h-8 w-8 rounded bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mr-3 shrink-0">
                <Upload className="h-4 w-4 text-slate-500 group-hover:text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-slate-800">Auto-fill from Document</div>
                <div className="text-xs text-slate-500">Upload PDF/CSV to populate fields</div>
              </div>
            </Button>
            
            <div className="flex border-2 border-slate-200 rounded-lg overflow-hidden h-14 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <div className="bg-slate-100 px-3 flex flex-col justify-center border-r border-slate-200 shrink-0">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1"><Plus className="h-3 w-3"/> Top-Up</div>
              </div>
              <Input placeholder="Amount ₹" className="border-0 h-full rounded-none focus-visible:ring-0 text-sm font-medium" />
              <div className="w-px bg-slate-200 h-full shrink-0"></div>
              <Input placeholder="Rate %" className="border-0 h-full rounded-none focus-visible:ring-0 text-sm font-medium w-20" />
            </div>

            <div className="border-2 border-slate-200 rounded-lg p-2 bg-white flex flex-col justify-center h-14 relative">
               <div className="flex justify-between items-center mb-1">
                 <Label className="text-xs font-bold text-slate-700 flex items-center gap-1"><Target className="h-3 w-3"/> Target Payoff: {targetYears[0]} Years</Label>
                 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 rounded">₹30,996/mo</span>
               </div>
               <Slider value={targetYears} onValueChange={setTargetYears} max={30} min={1} step={1} className="py-1 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {/* Massive Impact Summary */}
        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-none shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-64 h-64 text-white" />
          </div>
          <CardContent className="p-10 md:p-14 text-center relative z-10">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm px-4 py-1.5 mb-6 shadow-lg border-2 border-emerald-400">
              IMPACT SUMMARY
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-md">
              You save <span className="text-emerald-400 border-b-4 border-emerald-400 pb-1">₹6,26,091</span><br className="hidden md:block"/>
              and <span className="text-emerald-400 border-b-4 border-emerald-400 pb-1">4 years</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-medium">
              By adding <strong className="text-white bg-white/10 px-2 py-0.5 rounded">₹2,170</strong> to your monthly payment, you transform a 20-year burden into a 16-year victory.
            </p>
          </CardContent>
        </Card>

        {/* 4 Massive Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 border-emerald-500 shadow-lg bg-emerald-50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 rounded-bl-full flex items-start justify-end p-3">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <CardContent className="p-6">
              <p className="text-sm font-black text-emerald-800 uppercase tracking-widest mb-2">Interest Saved</p>
              <p className="text-4xl font-black text-emerald-600 mb-2 drop-shadow-sm">₹6,26,091</p>
              <p className="text-sm font-bold text-emerald-700/80 bg-emerald-200/50 inline-block px-2 py-1 rounded">≈23% of standard interest</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-indigo-500 shadow-lg bg-indigo-50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
             <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 rounded-bl-full flex items-start justify-end p-3">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <CardContent className="p-6">
              <p className="text-sm font-black text-indigo-800 uppercase tracking-widest mb-2">Tenure Saved</p>
              <p className="text-4xl font-black text-indigo-600 mb-2 drop-shadow-sm">4 Years</p>
              <p className="text-sm font-bold text-indigo-700/80 bg-indigo-200/50 inline-block px-2 py-1 rounded">Clears in 16 yrs instead of 20</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-slate-300 shadow-md bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Net Principal</p>
              <p className="text-3xl font-black text-slate-900 mb-2">₹25,00,000</p>
              <p className="text-sm font-medium text-slate-500">Total borrowed amount</p>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-slate-300 shadow-md bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Monthly EMI</p>
              <p className="text-3xl font-black text-slate-900 mb-2">₹21,696</p>
              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm">+₹2,170 extra</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Highly Actionable Strategies */}
        <Card className="border-2 border-slate-300 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-100 border-b border-slate-200 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Flame className="h-6 w-6 text-rose-500" />
                  1-Click Payoff Strategies
                </CardTitle>
                <CardDescription className="text-base font-medium text-slate-600 mt-2">
                  Tap any strategy to instantly apply it to your calculator above.
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2 font-bold bg-white shadow-sm border-slate-300">
                <Info className="h-4 w-4" /> How this works
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STRATEGIES.map((s, i) => (
                <button 
                  key={i} 
                  className={`text-left group relative w-full flex flex-col h-full rounded-xl border-2 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden focus:outline-none focus:ring-4 focus:ring-indigo-500 ${s.colors}`}
                >
                  <div className="p-5 flex-grow">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 shadow-sm ${s.iconColor}`}>
                      <s.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-black text-lg text-slate-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors">{s.title}</h4>
                    <p className="text-sm font-bold text-slate-600 mb-4 bg-white/60 inline-block px-2 py-1 rounded">{s.detail}</p>
                    <div className="bg-white rounded-lg p-3 border border-slate-200/50 shadow-sm mt-auto">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Savings</p>
                      <p className="font-black text-emerald-600">{s.saves}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 text-white p-3 text-center font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-colors">
                    APPLY NOW <ArrowUpRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prominent Charts */}
        <Card className="border-2 border-slate-300 shadow-xl">
          <CardHeader className="border-b border-slate-200 bg-white">
             <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-500" />
                Visual Comparison
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="balance" className="w-full">
              <div className="bg-slate-100 p-2 border-b border-slate-200">
                <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-slate-200/50">
                  <TabsTrigger value="balance" className="font-bold text-base data-[state=active]:bg-white data-[state=active]:shadow-md">Balance Over Time</TabsTrigger>
                  <TabsTrigger value="costs" className="font-bold text-base data-[state=active]:bg-white data-[state=active]:shadow-md">Total Costs</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="balance" className="p-6 m-0 h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStandard2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAccel2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#475569', fontWeight: 600 }} dy={15} minTickGap={30} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#475569', fontWeight: 600 }} />
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#cbd5e1" />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: '14px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Area type="monotone" name="Standard Bank Contract" dataKey="Standard Balance" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorStandard2)" activeDot={{ r: 8 }} />
                    <Area type="monotone" name="Accelerated Saver Plan" dataKey="Accelerated Balance" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorAccel2)" activeDot={{ r: 8 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="costs" className="p-6 m-0 h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} maxBarSize={100}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 16, fill: '#1e293b', fontWeight: 800 }} dy={15} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#475569', fontWeight: 600 }} />
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#cbd5e1" />
                    <Tooltip content={<ChartTooltip />} cursor={{fill: '#f1f5f9'}} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: '14px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Bar dataKey="Principal" name="Base Principal" stackId="a" fill="#6366f1" radius={[0, 0, 8, 8]} />
                    <Bar dataKey="Interest" name="Total Interest Paid" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editable Ledger - Takes 2 cols */}
          <Card className="lg:col-span-2 border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col">
            <CardHeader className="bg-slate-100 border-b border-slate-200 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-xl font-black text-slate-900">Interactive Amortization Ledger</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 font-bold" />
                <Input placeholder="Search years..." className="pl-10 h-10 font-bold border-2 border-slate-300 focus-visible:ring-indigo-500 w-48" />
              </div>
            </CardHeader>
            <div className="overflow-x-auto flex-grow bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800 text-white font-bold">
                  <tr>
                    <th className="px-4 py-4 whitespace-nowrap">Year</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">Opening Bal</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">EMI Paid</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap bg-indigo-900 border-b-4 border-indigo-500">Edit Extra Paid (₹)</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">Interest</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">Principal</th>
                    <th className="px-4 py-4 text-right whitespace-nowrap">Closing Bal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ledgerData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">Year {row.year}</td>
                      <td className="px-4 py-3 text-right text-slate-600 font-medium whitespace-nowrap">{formatRupees(row.opening)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 font-medium whitespace-nowrap">{formatRupees(row.emiPaid)}</td>
                      <td className="px-4 py-2 text-right bg-indigo-50/50 group-hover:bg-indigo-50">
                        <div className="flex items-center justify-end">
                          <Input 
                            type="number" 
                            defaultValue={row.extraPaid}
                            className="h-9 w-28 text-right font-black text-indigo-700 bg-white border-2 border-indigo-200 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600 font-bold whitespace-nowrap">{formatRupees(row.interest)}</td>
                      <td className="px-4 py-3 text-right text-indigo-600 font-bold whitespace-nowrap">{formatRupees(row.principal)}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 whitespace-nowrap">{formatRupees(row.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
              <Button className="font-bold gap-2">
                <Download className="h-4 w-4" /> Download Full Ledger CSV
              </Button>
            </div>
          </Card>

          {/* Pies - Takes 1 col */}
          <div className="space-y-6 flex flex-col">
            <Card className="border-2 border-rose-200 shadow-lg bg-rose-50/30 flex-1">
              <CardHeader className="text-center pb-0">
                <Badge variant="outline" className="mx-auto bg-rose-100 text-rose-800 border-rose-300 font-black mb-2">BASELINE</Badge>
                <CardTitle className="text-lg font-black text-slate-900">Traditional Bank Contract</CardTitle>
                <p className="text-rose-600 font-black text-xl mt-1">Total: ₹52,06,939</p>
              </CardHeader>
              <CardContent className="h-64 relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieStandard} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                      {pieStandard.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mt-4">
                  <span className="text-3xl font-black text-slate-900">20</span>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Years</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-400 shadow-xl bg-emerald-50/30 flex-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg z-10">RECOMMENDED</div>
              <CardHeader className="text-center pb-0">
                <Badge variant="outline" className="mx-auto bg-emerald-100 text-emerald-800 border-emerald-400 font-black mb-2">WITH EXTRA EMI</Badge>
                <CardTitle className="text-lg font-black text-slate-900">Accelerated Prepayout</CardTitle>
                <p className="text-emerald-600 font-black text-xl mt-1">Total: ₹45,80,849</p>
              </CardHeader>
              <CardContent className="h-64 relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieAccelerated} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                      {pieAccelerated.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mt-4">
                  <span className="text-3xl font-black text-emerald-600">16</span>
                  <span className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Years</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
