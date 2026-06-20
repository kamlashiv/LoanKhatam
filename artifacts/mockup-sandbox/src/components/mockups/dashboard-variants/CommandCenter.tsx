import React, { useState, useMemo } from "react";
import { 
  Wallet, 
  LayoutDashboard, 
  List, 
  BarChart3, 
  Target, 
  AlertCircle, 
  Plus, 
  Search, 
  ArrowUpDown, 
  Download, 
  CheckCircle2, 
  Clock,
  TerminalSquare
} from "lucide-react";

// --- Data Model ---
const SUMMARY = {
  totalLent: 2500000,
  outstanding: 940000,
  collected: 1560000,
  overdue: 2,
  totalLoans: 8,
  active: 4,
  fullyPaid: 2,
};

type LoanStatus = "active" | "overdue" | "paid";

interface Loan {
  id: string;
  borrower: string;
  principal: number;
  remaining: number;
  status: LoanStatus;
  dueDate: string;
  rate: number;
}

const LOANS: Loan[] = [
  { id: "1", borrower: "Rohan Mehta", principal: 500000, remaining: 210000, status: "active", dueDate: "15/07/2026", rate: 12 },
  { id: "2", borrower: "Priya Sharma", principal: 300000, remaining: 0, status: "paid", dueDate: "01/05/2026", rate: 10 },
  { id: "3", borrower: "Arjun Nair", principal: 450000, remaining: 450000, status: "overdue", dueDate: "10/06/2026", rate: 14 },
  { id: "4", borrower: "Kavya Reddy", principal: 200000, remaining: 80000, status: "active", dueDate: "20/08/2026", rate: 11 },
  { id: "5", borrower: "Vikram Singh", principal: 600000, remaining: 360000, status: "active", dueDate: "05/09/2026", rate: 13 },
  { id: "6", borrower: "Ananya Iyer", principal: 150000, remaining: 150000, status: "overdue", dueDate: "28/05/2026", rate: 15 },
  { id: "7", borrower: "Karan Gupta", principal: 200000, remaining: 90000, status: "active", dueDate: "12/10/2026", rate: 9 },
  { id: "8", borrower: "Meera Joshi", principal: 100000, remaining: 0, status: "paid", dueDate: "18/04/2026", rate: 8 },
];

function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseDate(dateStr: string) {
  const [d, m, y] = dateStr.split("/");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getTime();
}

// --- Component ---
export function CommandCenter() {
  const [filter, setFilter] = useState<"all" | LoanStatus>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Loan | "progress"; direction: "asc" | "desc" } | null>({ key: "dueDate", direction: "asc" });

  const sortedAndFilteredLoans = useMemo(() => {
    let filtered = LOANS;
    if (filter !== "all") {
      filtered = LOANS.filter(l => l.status === filter);
    }
    
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof Loan];
        let bVal: any = b[sortConfig.key as keyof Loan];
        
        if (sortConfig.key === "progress") {
          aVal = ((a.principal - a.remaining) / a.principal);
          bVal = ((b.principal - b.remaining) / b.principal);
        } else if (sortConfig.key === "dueDate") {
          aVal = parseDate(a.dueDate);
          bVal = parseDate(b.dueDate);
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [filter, sortConfig]);

  const requestSort = (key: keyof Loan | "progress") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const statusColors = {
    active: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    overdue: "text-red-500 bg-red-500/10 border-red-500/20",
    paid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col md:flex-row selection:bg-zinc-800">
      {/* Sidebar - Terminal Aesthetic */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800/60 flex flex-col font-mono text-sm hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3 text-zinc-100 border-b border-zinc-800/60">
          <TerminalSquare className="h-6 w-6 text-zinc-400" />
          <span className="font-bold tracking-wider text-base uppercase">LEDGER_OS</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: "dashboard", label: "01_DASHBOARD", icon: LayoutDashboard, active: true },
            { id: "loans", label: "02_ALL_LOANS", icon: List },
            { id: "amortization", label: "03_AMORTIZATION", icon: BarChart3 },
            { id: "planner", label: "04_PAYOFF_PLANNER", icon: Target },
          ].map(item => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left ${
                item.active 
                  ? "bg-zinc-800/80 text-zinc-100 border border-zinc-700/50" 
                  : "hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <item.icon className={`h-4 w-4 ${item.active ? "text-zinc-300" : ""}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-zinc-800/60">
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3">
            <div className="text-xs text-zinc-500 mb-1">SYSTEM_STATUS</div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ONLINE
            </div>
            <div className="text-[10px] text-zinc-600 mt-2">Today: 20/06/2026</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        
        {/* Top Header & Instrumentation */}
        <header className="border-b border-zinc-800/60 bg-zinc-950 p-4 md:p-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-100 font-mono tracking-tight">PORTFOLIO_OVERVIEW</h1>
                <p className="text-zinc-500 text-xs font-mono mt-1 uppercase tracking-widest">Command Center / Metrics</p>
              </div>
              <button className="bg-zinc-100 text-zinc-900 hover:bg-white px-4 py-2 rounded flex items-center gap-2 font-mono text-sm font-bold transition-colors">
                <Plus className="h-4 w-4" />
                NEW_LOAN
              </button>
            </div>

            {/* Instrument Cluster */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col">
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div> Total Lent
                </span>
                <span className="text-2xl font-mono text-zinc-100 tracking-tight">{formatRupees(SUMMARY.totalLent)}</span>
              </div>
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col">
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div> Outstanding
                </span>
                <span className="text-2xl font-mono text-blue-400 tracking-tight">{formatRupees(SUMMARY.outstanding)}</span>
              </div>
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex flex-col">
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div> Collected
                </span>
                <span className="text-2xl font-mono text-emerald-400 tracking-tight">{formatRupees(SUMMARY.collected)}</span>
              </div>
              
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex flex-col relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/10 rounded-bl-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
                <span className="text-red-400/80 text-xs font-mono uppercase tracking-wider mb-2 flex items-center gap-2 z-10">
                  <AlertCircle className="h-3 w-3" /> Overdue
                </span>
                <span className="text-2xl font-mono text-red-500 tracking-tight z-10 flex items-baseline gap-2">
                  {SUMMARY.overdue} <span className="text-xs text-red-500/50">LOANS</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dense Data Table Area */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col max-w-7xl mx-auto w-full">
          
          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-4 shrink-0">
            <div className="flex bg-zinc-900 p-1 rounded-md border border-zinc-800/80 font-mono text-xs w-full sm:w-auto">
              {[
                { id: "all", label: "ALL" },
                { id: "active", label: "ACTIVE" },
                { id: "overdue", label: "OVERDUE" },
                { id: "paid", label: "PAID" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-4 py-1.5 rounded transition-all flex-1 sm:flex-none text-center ${
                    filter === tab.id 
                      ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="SEARCH_BORROWER..." 
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 w-full sm:w-64 placeholder:text-zinc-600"
                />
              </div>
              <button className="p-2 border border-zinc-800 bg-zinc-900 rounded-md text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 bg-zinc-900/30 border border-zinc-800/80 rounded-lg overflow-hidden flex flex-col shadow-2xl relative">
            
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                    <th className="p-4 font-semibold cursor-pointer hover:text-zinc-300 transition-colors group" onClick={() => requestSort("borrower")}>
                      <div className="flex items-center gap-2">Borrower <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" /></div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:text-zinc-300 transition-colors group text-right" onClick={() => requestSort("principal")}>
                      <div className="flex items-center justify-end gap-2"><ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" /> Principal</div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:text-zinc-300 transition-colors group text-right" onClick={() => requestSort("remaining")}>
                      <div className="flex items-center justify-end gap-2"><ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" /> Remaining</div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:text-zinc-300 transition-colors group" onClick={() => requestSort("progress")}>
                      <div className="flex items-center gap-2">Progress <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" /></div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:text-zinc-300 transition-colors group" onClick={() => requestSort("status")}>
                      <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" /></div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:text-zinc-300 transition-colors group text-right" onClick={() => requestSort("dueDate")}>
                      <div className="flex items-center justify-end gap-2"><ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" /> Due Date</div>
                    </th>
                    <th className="p-4 font-semibold cursor-pointer hover:text-zinc-300 transition-colors group text-right" onClick={() => requestSort("rate")}>
                      <div className="flex items-center justify-end gap-2"><ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" /> Rate</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs divide-y divide-zinc-800/50">
                  {sortedAndFilteredLoans.map((loan) => {
                    const isOverdue = loan.status === "overdue";
                    const progress = ((loan.principal - loan.remaining) / loan.principal) * 100;
                    
                    return (
                      <tr 
                        key={loan.id} 
                        className={`group hover:bg-zinc-800/40 transition-colors cursor-default ${isOverdue ? "bg-red-500/[0.02]" : ""}`}
                      >
                        <td className="p-4 text-zinc-200 font-sans font-medium whitespace-nowrap">
                          {loan.borrower}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap text-zinc-400">
                          {formatRupees(loan.principal)}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <span className={`${isOverdue ? "text-red-400 font-bold" : "text-zinc-100"}`}>
                            {formatRupees(loan.remaining)}
                          </span>
                        </td>
                        <td className="p-4 w-48">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  loan.status === 'paid' ? 'bg-emerald-500' : 
                                  loan.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'
                                }`} 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-zinc-500 w-8">{Math.round(progress)}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-widest ${statusColors[loan.status]}`}>
                            {loan.status === 'overdue' && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                            {loan.status}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <span className={`${isOverdue ? "text-red-400" : "text-zinc-400"}`}>
                            {loan.dueDate}
                          </span>
                        </td>
                        <td className="p-4 text-right text-zinc-500">
                          {loan.rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="border-t border-zinc-800 bg-zinc-950/80 p-3 flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-auto">
              <span>Showing {sortedAndFilteredLoans.length} of {LOANS.length} records</span>
              <div className="flex gap-4">
                <span>Active: {SUMMARY.active}</span>
                <span>Fully Paid: {SUMMARY.fullyPaid}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
