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

import "./EditorialRefined.css";
import { formatRupees, compactRupees, DATA, STRATEGIES, BALANCE_DATA, COST_DATA, YEARLY_ROWS, PIE_STANDARD, PIE_ACCELERATED } from "./_Baseline";

export function EditorialRefined() {
  const [chartTab, setChartTab] = useState<"balance" | "costs">("balance");
  const [tableMode, setTableMode] = useState<"yearly" | "monthly">("yearly");
  const d = DATA;

  const pieStandardColors = ["var(--text-ink)", "var(--accent-burgundy)"];
  const pieAcceleratedColors = ["var(--text-ink)", "var(--accent-forest)", "var(--bg-ivory)"];

  const customPieStandard = PIE_STANDARD.map((item, i) => ({ ...item, color: pieStandardColors[i] }));
  const customPieAccelerated = PIE_ACCELERATED.map((item, i) => ({ ...item, color: pieAcceleratedColors[i] }));

  return (
    <div className="editorial-vibe min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap hairline-b pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-[var(--border-dark)] flex items-center justify-center shrink-0 bg-[var(--bg-paper)]">
              <Target className="w-5 h-5 text-[var(--text-ink)]" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-serif italic text-4xl text-[var(--text-ink)]">SMART Strategy</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1 font-light tracking-wide uppercase">Plan prepayments &bull; Track interest &bull; Save time</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="btn-outline gap-2"><RefreshCw className="w-3.5 h-3.5" /> Reset</Button>
            <Button className="btn-ink gap-2"><Download className="w-3.5 h-3.5" /> Export</Button>
          </div>
        </header>

        {/* Main 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: inputs */}
          <div className="space-y-8">
            {/* Import */}
            <Card className="card-paper">
              <CardHeader className="pb-4 hairline-b"><CardTitle className="font-serif italic text-xl font-normal">Import from File</CardTitle></CardHeader>
              <CardContent className="pt-4">
                <div className="border border-dashed border-[var(--border-dark)] p-6 text-center cursor-pointer transition-colors hover:bg-[var(--bg-ivory)]">
                  <div className="w-10 h-10 bg-[var(--bg-ivory)] border border-[var(--border-hairline)] flex items-center justify-center mx-auto mb-3"><Upload className="w-4 h-4 text-[var(--text-ink)]" strokeWidth={1.5} /></div>
                  <p className="font-serif text-sm">Upload or drag a document</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 uppercase tracking-widest">PNG &middot; JPG &middot; PDF &middot; JSON</p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card className="card-paper">
              <CardHeader className="pb-4 hairline-b"><CardTitle className="font-serif italic text-xl font-normal">Loan Parameters</CardTitle></CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Principal (₹)</Label><span className="font-serif text-lg">{formatRupees(d.principal)}</span></div>
                  <Slider defaultValue={[d.principal]} max={5000000} step={100000} className="[&_[role=slider]]:border-[var(--text-ink)] [&_[role=slider]]:bg-[var(--text-ink)] [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-[var(--text-ink)]" />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-serif italic"><span>₹1L</span><span>₹50L</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><Label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Interest Rate (%)</Label><span className="font-serif text-lg">{d.rate}%</span></div>
                  <Slider defaultValue={[d.rate]} max={18} min={5} step={0.1} className="[&_[role=slider]]:border-[var(--text-ink)] [&_[role=slider]]:bg-[var(--text-ink)] [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-[var(--text-ink)]" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Tenure</Label>
                    <div className="flex border border-[var(--border-dark)] text-[10px] uppercase tracking-widest">
                      <button className="px-3 py-1 bg-[var(--text-ink)] text-white">Yr</button>
                      <button className="px-3 py-1 text-[var(--text-ink)]">Mo</button>
                    </div>
                  </div>
                  <Input defaultValue={20} className="input-editorial h-10 text-sm font-serif" />
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">EMI Start Month</Label>
                  <Input type="month" defaultValue="2024-01" className="input-editorial h-10 text-sm font-serif" />
                </div>
                <div className="space-y-3 pt-6 hairline-t">
                  <div className="flex justify-between items-center"><Label className="text-[11px] uppercase tracking-wider text-[var(--accent-forest)] font-bold">Extra Monthly Payment</Label><span className="font-serif text-lg text-[var(--accent-forest)]">{formatRupees(d.extraEmi)}</span></div>
                  <Slider defaultValue={[d.extraEmi]} max={10000} step={100} className="[&_[role=slider]]:border-[var(--accent-forest)] [&_[role=slider]]:bg-[var(--accent-forest)] [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-[var(--accent-forest)]" />
                  <Input type="month" defaultValue="2024-06" className="input-editorial h-9 text-sm font-serif mt-2" />
                </div>
                <div className="pt-6 hairline-t space-y-3">
                  <Label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Top-up Loan (optional)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="Amt" className="input-editorial h-9 text-sm font-serif" />
                    <Input placeholder="Rate%" className="input-editorial h-9 text-sm font-serif" />
                    <Input placeholder="Month" className="input-editorial h-9 text-sm font-serif" />
                  </div>
                </div>
                <div className="pt-6 hairline-t space-y-3">
                  <Label className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">Reverse Calculator — Target Years</Label>
                  <Slider defaultValue={[16]} max={20} min={1} className="[&_[role=slider]]:border-[var(--text-ink)] [&_[role=slider]]:bg-[var(--text-ink)] [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-[var(--text-ink)]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: PDF banner + summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* PDF banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-[var(--border-dark)] bg-[var(--bg-paper)] p-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--text-ink)]"></div>
              <div className="flex items-center gap-4 pl-2">
                <FileText className="w-6 h-6 text-[var(--text-ink)]" strokeWidth={1} />
                <div>
                  <h3 className="font-serif italic text-lg">Client Report</h3>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-1">A polished one-page summary</p>
                </div>
              </div>
              <Button variant="outline" className="btn-outline shrink-0"><Download className="w-3.5 h-3.5 mr-2" /> Download PDF</Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-paper p-8 flex flex-col justify-center border-[var(--border-dark)] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-forest)]"></div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 mb-2"><PiggyBank className="w-3.5 h-3.5" /> Total Net Interest Saved</p>
                <h3 className="text-4xl font-serif text-[var(--text-ink)] py-2">{formatRupees(d.intSaved)}</h3>
                <p className="text-xs font-serif italic text-[var(--text-muted)]">≈23% of standard interest avoided</p>
              </div>
              <div className="card-paper p-8 flex flex-col justify-center border-[var(--border-dark)] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-navy)]"></div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 mb-2"><CalendarRange className="w-3.5 h-3.5" /> Accelerated Payoff</p>
                <h3 className="text-4xl font-serif text-[var(--text-ink)] py-2">{d.payoffYears} years <span className="text-xl font-normal text-[var(--text-muted)] italic">(−{d.tenureSavedYrs} yrs)</span></h3>
                <p className="text-xs font-serif italic text-[var(--text-muted)]">Debt-free 4 years sooner</p>
              </div>
              <div className="md:col-span-2 card-paper p-8 border-[var(--border-dark)]">
                <div className="flex items-center gap-2 mb-6 pb-4 hairline-b">
                  <Scale className="w-4 h-4 text-[var(--text-ink)]" strokeWidth={1} />
                  <h3 className="font-serif italic text-xl">Monthly Installment Breakdown</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-4 text-sm font-serif">
                  <span className="text-[var(--text-muted)]">Base EMI</span><span className="text-right text-lg">{formatRupees(d.baseEmi)}</span>
                  <span className="text-[var(--text-muted)]">Extra Prepayment</span><span className="text-right text-lg text-[var(--accent-forest)]">+{formatRupees(d.extraEmi)}</span>
                  <div className="col-span-2 hairline-t my-1"></div>
                  <span className="text-[var(--text-ink)] uppercase tracking-wider text-xs font-sans font-bold">Total Monthly Outflow</span><span className="text-right text-xl font-bold">{formatRupees(d.baseEmi + d.extraEmi)}</span>
                  <span className="text-[var(--text-ink)] uppercase tracking-wider text-xs font-sans">Total Repaid (Accelerated)</span><span className="text-right text-lg">{formatRupees(d.accTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Payoff Leverage Strategies */}
        <Card className="card-paper">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8 pb-4 hairline-b">
              <Sparkles className="w-6 h-6 text-[var(--accent-gold)]" strokeWidth={1} />
              <div>
                <h2 className="font-serif text-2xl">Smart Payoff Leverage Strategies</h2>
                <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Tap any strategy to apply it</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STRATEGIES.map((s, i) => (
                <div key={i} className="border border-[var(--border-dark)] p-6 bg-[var(--bg-paper)] hover:border-[var(--text-ink)] transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3"><s.icon className="w-4 h-4 text-[var(--text-ink)]" strokeWidth={1.5} /><h3 className="font-serif text-lg">{s.title}</h3></div>
                    <span className="text-[10px] uppercase tracking-widest border border-[var(--text-ink)] px-2 py-1">{s.note}</span>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm font-serif italic text-[var(--text-muted)]">{s.desc}</p>
                  </div>
                  <Button variant="outline" className="btn-outline w-full text-[10px]">Apply Strategy</Button>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-[var(--accent-gold)] pt-6 flex items-start gap-4">
              <Zap className="w-5 h-5 text-[var(--accent-gold)] shrink-0 mt-1" strokeWidth={1} />
              <p className="text-sm font-serif leading-relaxed text-[var(--text-muted)]"><strong className="text-[var(--text-ink)] font-sans uppercase tracking-wider text-xs mr-2">The Prepayment Magic:</strong> In the early years, 70–80% of your EMI goes to interest. Any extra prepayment attacks the principal directly, compounding your savings over time.</p>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Progress Visual Chart */}
        <Card className="card-paper">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 hairline-b">
              <h3 className="font-serif text-2xl flex items-center gap-3"><TrendingUp className="w-5 h-5 text-[var(--text-ink)]" strokeWidth={1} /> Comparative Progress</h3>
              <div className="flex border border-[var(--border-dark)] text-[11px] uppercase tracking-widest">
                <button onClick={() => setChartTab("balance")} className={`px-5 py-2 transition-colors ${chartTab === "balance" ? "bg-[var(--text-ink)] text-white" : "text-[var(--text-ink)] hover:bg-[var(--bg-ivory)]"}`}>Balance</button>
                <button onClick={() => setChartTab("costs")} className={`px-5 py-2 border-l border-[var(--border-dark)] transition-colors ${chartTab === "costs" ? "bg-[var(--text-ink)] text-white" : "text-[var(--text-ink)] hover:bg-[var(--bg-ivory)]"}`}>Costs</button>
              </div>
            </div>
            <div className="h-[360px] mt-4 font-serif">
              {chartTab === "balance" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BALANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="b_std_ed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent-burgundy)" stopOpacity={0.1} /><stop offset="95%" stopColor="var(--accent-burgundy)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="b_acc_ed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent-forest)" stopOpacity={0.1} /><stop offset="95%" stopColor="var(--accent-forest)" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--bg-paper)", border: "1px solid var(--border-dark)", borderRadius: 0, color: "var(--text-ink)", fontFamily: "inherit" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "20px" }} />
                    <Area type="monotone" dataKey="Standard Balance" stroke="var(--accent-burgundy)" fill="url(#b_std_ed)" strokeWidth={1} activeDot={{ r: 4, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="Accelerated Balance" stroke="var(--accent-forest)" fill="url(#b_acc_ed)" strokeWidth={1} activeDot={{ r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={COST_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-hairline)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "var(--text-muted)" }} />
                    <YAxis tickFormatter={compactRupees} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--bg-paper)", border: "1px solid var(--border-dark)", borderRadius: 0, color: "var(--text-ink)" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", paddingTop: "20px" }} />
                    <Bar dataKey="Principal" stackId="a" fill="var(--text-ink)" radius={0} />
                    <Bar dataKey="Interest" stackId="a" fill="var(--accent-burgundy)" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Amortization Ledger */}
        <Card className="card-paper overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap pb-6 hairline-b bg-[var(--bg-cream)] px-8 pt-8">
            <CardTitle className="font-serif text-2xl flex items-center gap-3"><FileText className="w-5 h-5 text-[var(--text-ink)]" strokeWidth={1} /> Amortization Ledger</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative"><Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" /><Input placeholder="Search records..." className="input-editorial pl-9 h-10 w-48 text-sm font-serif bg-[var(--bg-paper)]" /></div>
              <div className="flex border border-[var(--border-dark)] text-[10px] uppercase tracking-widest bg-[var(--bg-paper)]">
                <button onClick={() => setTableMode("yearly")} className={`px-4 py-2 ${tableMode === "yearly" ? "bg-[var(--text-ink)] text-white" : "text-[var(--text-ink)]"}`}>Yearly</button>
                <button onClick={() => setTableMode("monthly")} className={`px-4 py-2 border-l border-[var(--border-dark)] ${tableMode === "monthly" ? "bg-[var(--text-ink)] text-white" : "text-[var(--text-ink)]"}`}>Monthly</button>
              </div>
              <Button variant="outline" className="btn-outline h-10 gap-2"><Download className="w-3.5 h-3.5" /> Export</Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm text-left font-serif">
              <thead className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] hairline-b">
                <tr>
                  <th className="px-6 py-4 font-normal">Period</th>
                  <th className="px-6 py-4 font-normal text-right">Opening Bal.</th>
                  <th className="px-6 py-4 font-normal text-right">Base EMI</th>
                  <th className="px-6 py-4 font-normal text-right">Prepayment</th>
                  <th className="px-6 py-4 font-normal text-right">Interest</th>
                  <th className="px-6 py-4 font-normal text-right">Principal</th>
                  <th className="px-6 py-4 font-normal text-right text-[var(--text-ink)]">Closing Bal.</th>
                </tr>
              </thead>
              <tbody>
                {YEARLY_ROWS.map((r, i) => (
                  <tr key={i} className="hairline-b hover:bg-[var(--bg-ivory)] transition-colors">
                    <td className="px-6 py-4 font-bold text-[var(--text-ink)] font-sans text-xs uppercase tracking-wider">Year {r.year}</td>
                    <td className="px-6 py-4 text-right text-[var(--text-muted)]">{formatRupees(r.opening)}</td>
                    <td className="px-6 py-4 text-right text-[var(--text-muted)]">{formatRupees(r.emiPaid)}</td>
                    <td className="px-6 py-4 text-right">
                      <Input defaultValue={r.extraPaid} className="input-editorial h-8 w-24 text-right text-sm font-serif bg-transparent text-[var(--accent-forest)] ml-auto" />
                    </td>
                    <td className="px-6 py-4 text-right text-[var(--accent-burgundy)]">{formatRupees(r.interest)}</td>
                    <td className="px-6 py-4 text-right text-[var(--text-muted)]">{formatRupees(r.principal)}</td>
                    <td className="px-6 py-4 text-right font-bold text-[var(--text-ink)] text-base">{formatRupees(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Two doughnut charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="card-paper">
            <CardHeader className="text-center hairline-b pb-4"><CardTitle className="font-serif italic text-lg font-normal">Traditional Bank Contract</CardTitle></CardHeader>
            <CardContent className="p-8 flex flex-col items-center">
              <div className="h-48 w-full font-serif">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customPieStandard} cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="var(--bg-paper)" strokeWidth={2} dataKey="value">
                      {customPieStandard.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--bg-paper)", border: "1px solid var(--border-dark)", borderRadius: 0, fontFamily: "inherit" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 hairline-t w-full text-center">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Outflow</p>
                <p className="font-serif text-2xl text-[var(--text-ink)]">{formatRupees(d.stdTotal)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-paper border-[var(--accent-forest)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-forest)]"></div>
            <CardHeader className="text-center hairline-b pb-4"><CardTitle className="font-serif italic text-lg font-normal text-[var(--accent-forest)] flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Accelerated Path</CardTitle></CardHeader>
            <CardContent className="p-8 flex flex-col items-center">
              <div className="h-48 w-full font-serif">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={customPieAccelerated} cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="var(--bg-paper)" strokeWidth={2} dataKey="value">
                      {customPieAccelerated.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--bg-paper)", border: "1px solid var(--border-dark)", borderRadius: 0, fontFamily: "inherit" }} formatter={(v: number) => formatRupees(v)} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 hairline-t border-[var(--accent-forest)]/20 w-full text-center">
                <p className="text-[10px] uppercase tracking-widest text-[var(--accent-forest)]/70 mb-1">Total Outflow</p>
                <p className="font-serif text-2xl text-[var(--accent-forest)]">{formatRupees(d.accTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 pt-8 pb-12 hairline-t">
          <Button className="btn-ink px-8 py-6 text-xs gap-3"><Plus className="w-4 h-4" /> Add Another Loan</Button>
          <Button variant="outline" className="btn-outline px-8 py-6 text-xs gap-3"><List className="w-4 h-4" /> View Portfolio</Button>
        </div>

      </div>
    </div>
  );
}
