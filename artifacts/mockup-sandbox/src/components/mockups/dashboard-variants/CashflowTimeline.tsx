import React from "react";
import { 
  Wallet, LayoutDashboard, List, BarChart3, Target, 
  Search, Bell, Settings, LogOut, Plus, ChevronRight, 
  CalendarDays, ArrowUpRight, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Data
const summary = {
  totalLent: 2500000,
  outstanding: 940000,
  collected: 1560000,
  overdue: 2,
  totalLoans: 8,
  active: 4,
  fullyPaid: 2
};

const loans = [
  { id: 1, borrower: "Rohan Mehta", principal: 500000, remaining: 210000, status: "active", dueDate: "15/07/2026", rate: 12 },
  { id: 2, borrower: "Priya Sharma", principal: 300000, remaining: 0, status: "paid", dueDate: "01/05/2026", rate: 10 },
  { id: 3, borrower: "Arjun Nair", principal: 450000, remaining: 450000, status: "overdue", dueDate: "10/06/2026", rate: 14 },
  { id: 4, borrower: "Kavya Reddy", principal: 200000, remaining: 80000, status: "active", dueDate: "20/08/2026", rate: 11 },
  { id: 5, borrower: "Vikram Singh", principal: 600000, remaining: 360000, status: "active", dueDate: "05/09/2026", rate: 13 },
  { id: 6, borrower: "Ananya Iyer", principal: 150000, remaining: 150000, status: "overdue", dueDate: "28/05/2026", rate: 15 },
  { id: 7, borrower: "Karan Gupta", principal: 200000, remaining: 90000, status: "active", dueDate: "12/10/2026", rate: 9 },
  { id: 8, borrower: "Meera Joshi", principal: 100000, remaining: 0, status: "paid", dueDate: "18/04/2026", rate: 8 },
];

const formatRupees = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function CashflowTimeline() {
  return (
    <div className="flex h-screen bg-[#F8F9FA] text-slate-900 font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}} />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="font-bold text-xl tracking-tight">Ledger</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-slate-100 text-slate-900 rounded-md font-medium text-sm">
            <CalendarDays className="h-4 w-4 text-slate-700" />
            Agenda
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md font-medium text-sm transition-colors">
            <List className="h-4 w-4 text-slate-400" />
            All Loans
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md font-medium text-sm transition-colors">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            Amortization
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md font-medium text-sm transition-colors">
            <Target className="h-4 w-4 text-slate-400" />
            Payoff Planner
          </a>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Button className="w-full justify-start gap-2 bg-black text-white hover:bg-slate-800" size="sm">
            <Plus className="h-4 w-4" />
            New Loan
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold">Cashflow Agenda</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Today is 20/06/2026</span>
            <div className="h-4 w-px bg-slate-200"></div>
            <Search className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
            <Bell className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-medium">JD</div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Top Metrics Strip */}
            <div className="flex gap-4">
              <Card className="flex-1 p-4 shadow-sm border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Lent</p>
                  <p className="text-xl font-bold font-mono mt-1">{formatRupees(summary.totalLent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Loans</p>
                  <p className="text-sm font-semibold mt-1">{summary.totalLoans}</p>
                </div>
              </Card>
              <Card className="flex-1 p-4 shadow-sm border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Outstanding</p>
                  <p className="text-xl font-bold font-mono mt-1">{formatRupees(summary.outstanding)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active</p>
                  <p className="text-sm font-semibold mt-1">{summary.active}</p>
                </div>
              </Card>
              <Card className="flex-1 p-4 shadow-sm border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Collected</p>
                  <p className="text-xl font-bold font-mono mt-1 text-emerald-600">{formatRupees(summary.collected)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Fully Paid</p>
                  <p className="text-sm font-semibold mt-1 text-emerald-600">{summary.fullyPaid}</p>
                </div>
              </Card>
            </div>

            {/* Expected Inflows Chart (Mock) */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                Expected Cashflow (Next 6 Months)
              </h2>
              <div className="flex items-end gap-2 h-32">
                {[
                  { month: 'Jun', amount: 600000, overdue: true },
                  { month: 'Jul', amount: 210000, overdue: false },
                  { month: 'Aug', amount: 80000, overdue: false },
                  { month: 'Sep', amount: 360000, overdue: false },
                  { month: 'Oct', amount: 90000, overdue: false },
                  { month: 'Nov', amount: 0, overdue: false }
                ].map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full flex items-end justify-center h-24 rounded-sm bg-slate-50 relative">
                      <div 
                        className={`w-full max-w-[48px] rounded-t-sm transition-all duration-300 ${m.overdue ? 'bg-red-500/80 group-hover:bg-red-500' : 'bg-slate-800/80 group-hover:bg-slate-800'}`}
                        style={{ height: m.amount ? `${Math.max(10, (m.amount / 600000) * 100)}%` : '4px' }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{m.month}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline */}
            <section className="space-y-6">
              
              {/* Overdue Pin */}
              <div className="relative">
                <div className="absolute left-[27px] top-8 bottom-0 w-px bg-red-200"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-6 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0 z-10">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">NOW</span>
                  </div>
                  <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                    Action Required
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px]">{summary.overdue} Overdue</Badge>
                  </h3>
                </div>
                
                <div className="pl-14 space-y-3">
                  {[loans[5], loans[2]].map(loan => (
                    <Card key={loan.id} className="p-0 overflow-hidden border-red-200 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-center border-l-4 border-red-500 bg-white">
                        <div className="w-32 py-4 px-5 border-r border-slate-100 flex flex-col justify-center bg-red-50/30">
                          <span className="text-xs text-slate-500 mb-1">Due</span>
                          <span className="font-semibold text-red-600">{loan.dueDate.substring(0, 5)}</span>
                        </div>
                        <div className="flex-1 py-4 px-5 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{loan.borrower}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>Principal: {formatRupees(loan.principal)}</span>
                              <span>•</span>
                              <span>{loan.rate}% Rate</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-6">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Outstanding</p>
                              <p className="font-mono font-bold text-red-600">{formatRupees(loan.remaining)}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* July 2026 */}
              <div className="relative pt-4">
                <div className="absolute left-[27px] top-8 bottom-0 w-px bg-slate-200"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">JUL</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">July 2026</h3>
                </div>
                
                <div className="pl-14 space-y-3">
                  {[loans[0]].map(loan => (
                    <Card key={loan.id} className="p-0 overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-center border-l-4 border-slate-800 bg-white">
                        <div className="w-32 py-4 px-5 border-r border-slate-100 flex flex-col justify-center bg-slate-50/50">
                          <span className="text-xs text-slate-500 mb-1">Due</span>
                          <span className="font-semibold text-slate-900">{loan.dueDate.substring(0, 5)}</span>
                        </div>
                        <div className="flex-1 py-4 px-5 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{loan.borrower}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>Principal: {formatRupees(loan.principal)}</span>
                              <span>•</span>
                              <span>{loan.rate}% Rate</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-6">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Expected</p>
                              <p className="font-mono font-bold text-slate-900">{formatRupees(loan.remaining)}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* August 2026 */}
              <div className="relative pt-4">
                <div className="absolute left-[27px] top-8 bottom-0 w-px bg-slate-200"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">AUG</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">August 2026</h3>
                </div>
                
                <div className="pl-14 space-y-3">
                  {[loans[3]].map(loan => (
                    <Card key={loan.id} className="p-0 overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-center border-l-4 border-slate-800 bg-white">
                        <div className="w-32 py-4 px-5 border-r border-slate-100 flex flex-col justify-center bg-slate-50/50">
                          <span className="text-xs text-slate-500 mb-1">Due</span>
                          <span className="font-semibold text-slate-900">{loan.dueDate.substring(0, 5)}</span>
                        </div>
                        <div className="flex-1 py-4 px-5 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{loan.borrower}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>Principal: {formatRupees(loan.principal)}</span>
                              <span>•</span>
                              <span>{loan.rate}% Rate</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-6">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Expected</p>
                              <p className="font-mono font-bold text-slate-900">{formatRupees(loan.remaining)}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* September & October (Combined visually for brevity) */}
              <div className="relative pt-4 pb-8">
                <div className="absolute left-[27px] top-8 bottom-0 w-px bg-slate-200"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">SEP+</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Later this year</h3>
                </div>
                
                <div className="pl-14 space-y-3">
                  {[loans[4], loans[6]].map(loan => (
                    <Card key={loan.id} className="p-0 overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-center border-l-4 border-slate-300 bg-white opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-32 py-4 px-5 border-r border-slate-100 flex flex-col justify-center bg-slate-50/50">
                          <span className="text-xs text-slate-500 mb-1">Due</span>
                          <span className="font-semibold text-slate-600">{loan.dueDate.substring(0, 5)}</span>
                        </div>
                        <div className="flex-1 py-4 px-5 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{loan.borrower}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>Principal: {formatRupees(loan.principal)}</span>
                              <span>•</span>
                              <span>{loan.rate}% Rate</span>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-6">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Expected</p>
                              <p className="font-mono font-bold text-slate-700">{formatRupees(loan.remaining)}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Settled/Past */}
              <div className="relative pt-4 pb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Settled & Closed</h3>
                </div>
                
                <div className="pl-14 space-y-2">
                  {[loans[1], loans[7]].map(loan => (
                    <div key={loan.id} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{loan.borrower}</p>
                          <p className="text-xs text-slate-500">Paid on {loan.dueDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-medium text-slate-700">{formatRupees(loan.principal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
