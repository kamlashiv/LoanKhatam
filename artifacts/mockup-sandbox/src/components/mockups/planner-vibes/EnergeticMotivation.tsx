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
  Plus, List, Sparkles, Rocket, ZapIcon, Medal
} from "lucide-react";
import "./EnergeticMotivation.css";

import { 
  formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA, 
  YEARLY_ROWS, PIE_STANDARD, PIE_ACCELERATED 
} from "./_Baseline";

export function EnergeticMotivation() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  // Vivid Palette Overrides for Charts
  const chartColors = {
    std: "#fbbf24", // amber-400
    acc: "#10b981", // emerald-500
    accInt: "#34d399", // emerald-400
    saved: "#d1fae5" // emerald-100
  };

  const customPieStandard = [
    { name: "Principal", value: d.principal, color: chartColors.std },
    { name: "Total Interest", value: d.stdInterest, color: "#f59e0b" },
  ];

  const customPieAccelerated = [
    { name: "Principal", value: d.principal, color: chartColors.acc },
    { name: "Total Interest", value: d.accInterest, color: chartColors.accInt },
    { name: "Interest Saved", value: d.intSaved, color: chartColors.saved },
  ];

  return (
    <div className="min-h-screen vibe-energetic p-6 md:p-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-lime-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap bg-white/50 p-4 rounded-3xl backdrop-blur-xl border border-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 animate-float">
              <Rocket className="w-7 h-7 text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold tracking-tight text-[32px] md:text-[36px] leading-none text-emerald-950 uppercase">
                SMART STRATEGY
              </h1>
              <p className="text-sm font-medium text-emerald-700 mt-1">Crush your debt. Level up your wealth. Track your victory.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 rounded-xl bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 font-bold shadow-sm">
              <RefreshCw className="w-4 h-4" /> Reset
            </Button>
            <Button className="gap-2 rounded-xl btn-vivid font-bold uppercase tracking-wide">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: inputs */}
          <div className="space-y-6">
            {/* Import */}
            <Card className="rounded-3xl glass-card border-emerald-200">
              <CardHeader className="pb-3 border-b border-emerald-100 bg-white/50 rounded-t-3xl">
                <CardTitle className="text-base font-display font-bold text-emerald-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-500" /> Auto-Fill Data
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group">
                  <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
                    <ZapIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-bold text-emerald-900 text-sm">Drop your statement here!</p>
                  <p className="text-[11px] font-medium text-emerald-600 mt-1">PNG, PDF, CSV • Instant Setup</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="rounded-3xl glass-card border-emerald-200">
              <CardHeader className="pb-3 border-b border-emerald-100 bg-white/50 rounded-t-3xl">
                <CardTitle className="text-base font-display font-bold text-emerald-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" /> Mission Brief
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Target Amount (₹)</Label>
                    <span className="text-sm font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-md">{formatRupees(d.principal)}</span>
                  </div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="[&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-white [&_[role=track]]:bg-emerald-100 [&_[data-orientation=horizontal]>div]:bg-emerald-500" />
                  <div className="flex justify-between text-[11px] font-bold text-emerald-400"><span>₹1L</span><span>₹50L</span></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Difficulty (%)</Label>
                    <span className="text-sm font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">{d.rate}%</span>
                  </div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="[&_[role=slider]]:border-amber-500 [&_[role=slider]]:bg-white [&_[role=track]]:bg-amber-100 [&_[data-orientation=horizontal]>div]:bg-amber-500" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Time Limit</Label>
                    <div className="flex rounded-lg border-2 border-emerald-100 p-0.5 text-[12px] font-bold bg-white">
                      <button className="px-3 py-1 rounded-md bg-emerald-500 text-white shadow-sm">Yr</button>
                      <button className="px-3 py-1 rounded-md text-emerald-600 hover:bg-emerald-50">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="h-10 rounded-xl text-sm font-bold border-2 border-emerald-100 focus-visible:ring-emerald-500 focus-visible:border-emerald-500" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Start Date</Label>
                  <Input type="month" defaultValue="2024-01" className="h-10 rounded-xl text-sm font-bold border-2 border-emerald-100 focus-visible:ring-emerald-500 focus-visible:border-emerald-500" />
                </div>

                <div className="space-y-3 pt-5 border-t-2 border-emerald-100 border-dashed">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-lime-700 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-4 h-4 text-lime-500" /> Boost Power
                    </Label>
                    <span className="text-sm font-black text-lime-800 bg-lime-200 px-2 py-0.5 rounded-md">+{formatRupees(d.extraEmi)}</span>
                  </div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="[&_[role=slider]]:border-lime-500 [&_[role=slider]]:bg-white [&_[role=track]]:bg-lime-100 [&_[data-orientation=horizontal]>div]:bg-lime-500" />
                  <Input type="month" defaultValue="2024-06" className="h-9 rounded-xl text-xs font-bold border-2 border-lime-100 focus-visible:ring-lime-500 focus-visible:border-lime-500 bg-lime-50" />
                </div>

                <div className="pt-5 border-t-2 border-emerald-100 border-dashed space-y-3">
                  <Label className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Top-up Load (Optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Amt" className="h-9 text-xs font-bold rounded-xl border-2 border-emerald-100" />
                    <Input placeholder="Rate%" className="h-9 text-xs font-bold rounded-xl border-2 border-emerald-100" />
                    <Input placeholder="Month" className="h-9 text-xs font-bold rounded-xl border-2 border-emerald-100" />
                  </div>
                </div>

                <div className="pt-5 border-t-2 border-emerald-100 border-dashed space-y-3">
                  <Label className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Medal className="w-4 h-4 text-emerald-500" /> Reverse Goal — Target Years
                  </Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="[&_[role=slider]]:border-emerald-500 [&_[role=slider]]:bg-white [&_[role=track]]:bg-emerald-100 [&_[data-orientation=horizontal]>div]:bg-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-3xl bg-emerald-800 border-4 border-emerald-900 px-6 py-5 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 progress-bg"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-emerald-950 flex items-center justify-center transform -rotate-6 shadow-md"><FileText className="w-6 h-6" /></div>
                <div>
                  <p className="font-display font-black text-lg text-emerald-50 uppercase tracking-wide">Generate Victory Report</p>
                  <p className="text-sm font-medium text-emerald-300">Get your personalized attack plan in PDF.</p>
                </div>
              </div>
              <Button className="gap-2 rounded-xl bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/50 border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all relative z-10">
                <Download className="w-4 h-4" /> Download Now
              </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-3xl p-6 bg-gradient-to-br from-lime-400 to-emerald-500 text-emerald-950 shadow-lg border-2 border-lime-300 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute right-[-20px] top-[-20px] opacity-20 transform rotate-12 group-hover:rotate-45 transition-transform duration-700">
                  <PiggyBank className="w-32 h-32" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-emerald-800 mb-1">
                  <PiggyBank className="w-4 h-4" /> Loot Saved
                </p>
                <h3 className="text-4xl md:text-5xl font-display font-black tracking-tighter drop-shadow-sm">{formatRupees(d.intSaved)}</h3>
                <div className="mt-4 inline-block bg-white/30 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-emerald-900 border border-white/40">
                  🔥 ≈23% of interest DESTROYED
                </div>
              </div>

              <div className="rounded-3xl p-6 bg-emerald-950 text-white shadow-lg border-2 border-emerald-800 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute right-[-10px] bottom-[-10px] opacity-20 transform group-hover:scale-110 transition-transform duration-700">
                  <Rocket className="w-28 h-28" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-emerald-400 mb-1">
                  <CalendarRange className="w-4 h-4" /> Finish Line
                </p>
                <h3 className="text-4xl font-display font-black tracking-tight leading-none mt-2">
                  {d.payoffYears} <span className="text-2xl">YRS</span>
                </h3>
                <p className="text-emerald-300 font-bold text-lg mt-1 tracking-tight">
                  (<span className="text-lime-400">-{d.tenureSavedYrs} years</span> faster)
                </p>
                <div className="mt-3 inline-block bg-emerald-800 px-3 py-1 rounded-lg text-xs font-bold text-emerald-200">
                  ⚡ Debt-free 4 years sooner!
                </div>
              </div>

              <div className="md:col-span-2 rounded-3xl p-6 bg-white border-2 border-emerald-100 shadow-lg">
                <p className="text-sm font-bold flex items-center gap-2 mb-4 text-emerald-900 uppercase tracking-wider font-display border-b-2 border-emerald-50 pb-2">
                  <Scale className="w-5 h-5 text-emerald-500" /> Ammo Breakdown
                </p>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <span className="text-emerald-600 font-bold">Base Ammo (EMI)</span>
                  <span className="text-right font-black text-emerald-900 text-base">{formatRupees(d.baseEmi)}</span>
                  
                  <span className="text-emerald-600 font-bold flex items-center gap-1"><Flame className="w-3 h-3 text-lime-500"/> Boost Ammo</span>
                  <span className="text-right font-black text-lime-600 text-base">+{formatRupees(d.extraEmi)}</span>
                  
                  <span className="text-emerald-800 font-black uppercase pt-3 border-t-2 border-emerald-50">Total Firepower</span>
                  <span className="text-right font-black text-emerald-950 text-xl pt-3 border-t-2 border-emerald-50">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  
                  <span className="text-emerald-800 font-black uppercase pt-1">Final Damage Done</span>
                  <span className="text-right font-black text-emerald-950 text-xl pt-1">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="rounded-3xl glass-card border-emerald-200">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 transform rotate-3">
                <Sparkles className="w-6 h-6 text-amber-950" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black tracking-tight text-emerald-950 uppercase">Power-Ups</h2>
                <p className="text-sm font-bold text-emerald-600">Equip a strategy to turbocharge your progress.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="rounded-3xl p-5 border-2 border-emerald-100 bg-white hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                        <s.icon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-display font-black text-emerald-900 text-lg">{s.title}</h3>
                    </div>
                    <span className="text-xs font-black gamified-badge px-3 py-1 rounded-xl shadow-sm">{s.note}</span>
                  </div>
                  <div className="space-y-2 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 mb-5">
                    <p className="text-sm font-bold text-emerald-800">{s.desc}</p>
                  </div>
                  <Button className="w-full h-10 font-bold uppercase tracking-wider text-xs rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-500 hover:text-white transition-colors border-none">
                    Equip Power-Up
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-emerald-950 border-4 border-emerald-900 p-5 flex items-start gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-lime-400 flex items-center justify-center shrink-0 shadow-lg shadow-lime-500/20">
                <Zap className="w-5 h-5 text-emerald-950" />
              </div>
              <p className="text-sm text-emerald-200 font-medium leading-relaxed">
                <strong className="text-lime-300 font-black uppercase tracking-wide">The Multiplier Effect</strong><br/>
                In the early stages, the boss (interest) eats 70–80% of your attacks (EMI). Extra attacks bypass the shield and hit the core principal directly, triggering massive combo savings over time!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="rounded-3xl glass-card border-emerald-200">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8 border-b-2 border-emerald-100 pb-5">
              <h3 className="font-display font-black text-2xl text-emerald-950 flex items-center gap-3 uppercase">
                <TrendingUp className="w-6 h-6 text-emerald-500" /> Progress Tracker
              </h3>
              <div className="flex bg-emerald-50 p-1.5 rounded-xl border border-emerald-100">
                <button 
                  onClick={() => setChartTab("balance")} 
                  className={`px-5 py-2 text-sm rounded-lg font-bold transition-all ${chartTab === "balance" ? "bg-white text-emerald-900 shadow-md" : "text-emerald-600 hover:text-emerald-800"}`}
                >
                  HP Balance
                </button>
                <button 
                  onClick={() => setChartTab("costs")} 
                  className={`px-5 py-2 text-sm rounded-lg font-bold transition-all ${chartTab === "costs" ? "bg-white text-emerald-900 shadow-md" : "text-emerald-600 hover:text-emerald-800"}`}
                >
                  Damage Cost
                </button>
              </div>
            </div>
            <div className="h-[360px]">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} /><stop offset="95%" stopColor="#fbbf24" stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.6} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d1fae5" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#047857", fontWeight: "bold" }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#047857", fontWeight: "bold" }} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: "#064e3b", border: "2px solid #10b981", borderRadius: 16, color: "#fff", fontSize: 14, fontWeight: "bold", boxShadow: "0 10px 25px -5px rgba(16,185,129,0.4)" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 13, fontWeight: "bold", paddingTop: 20 }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke="#fbbf24" fill="url(#b_std)" strokeWidth={4} name="Slow Path" />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke="#10b981" fill="url(#b_acc)" strokeWidth={4} name="Fast Path" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barSize={60}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d1fae5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#047857", fontWeight: "bold" }} dy={10} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#047857", fontWeight: "bold" }} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: "#064e3b", border: "2px solid #10b981", borderRadius: 16, color: "#fff", fontSize: 14, fontWeight: "bold" }} formatter={(v: number) => formatRupees(v)} cursor={{fill: '#ecfdf5'}} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 13, fontWeight: "bold", paddingTop: 20 }} />
                    <Bar dataKey="Principal" stackId="a" fill="#10b981" radius={[0, 0, 8, 8]} />
                    <Bar dataKey="Interest" stackId="a" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="rounded-3xl glass-card border-emerald-200 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap border-b-2 border-emerald-100 bg-white/50 p-6">
            <CardTitle className="text-xl font-display font-black text-emerald-950 uppercase flex items-center gap-3">
              <List className="w-6 h-6 text-emerald-500" /> Action Log
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input placeholder="Search..." className="pl-9 h-10 w-44 rounded-xl text-sm font-bold bg-white border-2 border-emerald-100 focus-visible:border-emerald-500 focus-visible:ring-emerald-500 placeholder:text-emerald-300 text-emerald-900" />
              </div>
              <div className="flex bg-emerald-50 p-1 rounded-xl border border-emerald-100">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${tableMode === "yearly" ? "bg-white text-emerald-900 shadow-sm" : "text-emerald-600"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${tableMode === "monthly" ? "bg-white text-emerald-900 shadow-sm" : "text-emerald-600"}`}>Monthly</button>
              </div>
              <Button variant="outline" size="sm" className="h-10 gap-2 rounded-xl font-bold uppercase border-2 border-emerald-200 text-emerald-800 bg-white hover:bg-emerald-50 hover:text-emerald-900">
                Export <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto bg-white/30 p-2">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
              <thead className="text-[11px] font-black text-emerald-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 rounded-l-xl">Level (Year)</th>
                  <th className="px-5 py-3 text-right">Opening HP</th>
                  <th className="px-5 py-3 text-right">Base Attack</th>
                  <th className="px-5 py-3 text-right text-lime-600">Boost Attack</th>
                  <th className="px-5 py-3 text-right text-amber-500">Boss Dmg (Int)</th>
                  <th className="px-5 py-3 text-right">Core Hit (Prin)</th>
                  <th className="px-5 py-3 text-right rounded-r-xl">Closing HP</th>
                </tr>
              </thead>
              <tbody>
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="bg-white hover:bg-emerald-50/80 transition-colors shadow-sm rounded-xl">
                    <td className="px-5 py-3.5 font-black text-emerald-950 rounded-l-xl">Lvl {r.year}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700">{formatRupees(r.opening)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700">{formatRupees(r.emiPaid)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Input defaultValue={r.extraPaid} className="h-8 w-28 text-right text-xs font-black bg-lime-100 border-lime-200 text-lime-800 ml-auto focus-visible:ring-lime-500 rounded-lg shadow-inner" />
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-amber-500">{formatRupees(r.interest)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700">{formatRupees(r.principal)}</td>
                    <td className="px-5 py-3.5 text-right font-black text-emerald-950 rounded-r-xl">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-3xl glass-card border-amber-200">
            <CardHeader className="pb-0 pt-6 text-center">
              <CardTitle className="text-base font-display font-black text-amber-800 uppercase tracking-wide">
                Standard Playthrough
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customPieStandard} cx="50%" cy="50%" innerRadius={65} outerRadius={90} stroke="none" dataKey="value" paddingAngle={5}>
                      {customPieStandard.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 12, color: "#fff", fontWeight: "bold" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: "bold", marginTop: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-amber-50 border-2 border-amber-100 px-6 py-2 rounded-xl">
                <p className="text-sm font-black text-amber-900 uppercase">Total Drain: {formatRupees(d.stdTotal)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl glass-card border-4 border-emerald-400 relative overflow-hidden">
            <div className="absolute inset-0 progress-bg opacity-[0.03]"></div>
            <CardHeader className="pb-0 pt-6 text-center relative z-10">
              <CardTitle className="text-base font-display font-black text-emerald-700 flex items-center justify-center gap-2 uppercase tracking-wide">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Speedrun Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center relative z-10">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customPieAccelerated} cx="50%" cy="50%" innerRadius={65} outerRadius={90} stroke="none" dataKey="value" paddingAngle={5}>
                      {customPieAccelerated.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#064e3b", border: "2px solid #10b981", borderRadius: 12, color: "#fff", fontWeight: "bold" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: "bold", marginTop: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-emerald-500 px-6 py-2 rounded-xl shadow-lg shadow-emerald-500/30">
                <p className="text-sm font-black text-white uppercase">Fast Total: {formatRupees(d.accTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 pb-10">
          <Button className="gap-2 rounded-xl h-12 px-8 btn-vivid font-black uppercase tracking-wider text-sm shadow-xl">
            <Plus className="w-5 h-5" /> Start New Mission
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl h-12 px-8 bg-white border-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-bold uppercase tracking-wider shadow-sm">
            <List className="w-5 h-5" /> All Quests
          </Button>
        </div>

      </div>
    </div>
  );
}
