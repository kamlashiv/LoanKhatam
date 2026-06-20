import React from "react";
import { 
  Wallet, LayoutDashboard, List, BarChart3, Target, 
  Plus, Upload, ArrowUpRight, ArrowDownRight, AlertCircle, 
  CheckCircle2, Clock, MoreHorizontal, HandCoins, ArrowRight,
  PieChart, Activity, CheckCircle, Flame, BellRing
} from "lucide-react";

const loans = [
  { id: 1, borrower: "Rohan Mehta", principal: 500000, remaining: 210000, status: "active", due: "15/07/2026", rate: 12 },
  { id: 2, borrower: "Priya Sharma", principal: 300000, remaining: 0, status: "paid", due: "01/05/2026", rate: 10 },
  { id: 3, borrower: "Arjun Nair", principal: 450000, remaining: 450000, status: "overdue", due: "10/06/2026", rate: 14 },
  { id: 4, borrower: "Kavya Reddy", principal: 200000, remaining: 80000, status: "active", due: "20/08/2026", rate: 11 },
  { id: 5, borrower: "Vikram Singh", principal: 600000, remaining: 360000, status: "active", due: "05/09/2026", rate: 13 },
  { id: 6, borrower: "Ananya Iyer", principal: 150000, remaining: 150000, status: "overdue", due: "28/05/2026", rate: 15 },
  { id: 7, borrower: "Karan Gupta", principal: 200000, remaining: 90000, status: "active", due: "12/10/2026", rate: 9 },
  { id: 8, borrower: "Meera Joshi", principal: 100000, remaining: 0, status: "paid", due: "18/04/2026", rate: 8 },
];

const formatRs = (val: number) => "₹" + val.toLocaleString("en-IN");

export function BentoOverview() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .bento-shadow { box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
        .bento-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .bento-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
      `}} />
      
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/60 p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Wallet className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-800">Ledger</span>
            </div>
            
            <nav className="space-y-2">
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white text-indigo-700 font-bold rounded-2xl shadow-sm border border-slate-100">
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-white/50 font-semibold rounded-2xl transition-all">
                <List className="w-5 h-5" /> All Loans
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-white/50 font-semibold rounded-2xl transition-all">
                <BarChart3 className="w-5 h-5" /> Amortization
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 hover:bg-white/50 font-semibold rounded-2xl transition-all">
                <Target className="w-5 h-5" /> Payoff Planner
              </a>
            </nav>
          </div>
          
          <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-indigo-600">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Stay on top</h4>
            <p className="text-sm text-slate-500 mb-4 font-medium leading-relaxed">You have 2 overdue loans that need your attention.</p>
            <button className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              Review Now
            </button>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <header className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Portfolio Overview</h1>
              <p className="text-slate-500 font-medium">As of 20/06/2026</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                <Upload className="w-4 h-4" /> Import Data
              </button>
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                <Plus className="w-4 h-4" /> New Loan
              </button>
            </div>
          </header>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 auto-rows-[160px]">
            
            {/* Tile 1: Total Lent (Large) */}
            <div className="col-span-2 row-span-1 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-8 text-white flex flex-col justify-between bento-shadow bento-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Wallet className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-3 text-indigo-200 font-semibold z-10">
                <HandCoins className="w-5 h-5" /> Total Lent
              </div>
              <div className="z-10">
                <div className="text-5xl font-extrabold tracking-tight mb-1">{formatRs(2500000)}</div>
                <div className="text-indigo-200 font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Across 8 total loans
                </div>
              </div>
            </div>

            {/* Tile 2: Outstanding */}
            <div className="col-span-1 row-span-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-[2rem] p-6 text-white flex flex-col justify-between bento-shadow bento-hover">
              <div className="flex items-center justify-between text-blue-100 font-semibold">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Outstanding</span>
                <ArrowUpRight className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">{formatRs(940000)}</div>
                <div className="text-blue-100/80 text-sm mt-1 font-medium">To be collected</div>
              </div>
            </div>

            {/* Tile 3: Collected */}
            <div className="col-span-1 row-span-1 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] p-6 text-white flex flex-col justify-between bento-shadow bento-hover">
              <div className="flex items-center justify-between text-emerald-100 font-semibold">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Collected</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight">{formatRs(1560000)}</div>
                <div className="text-emerald-100/80 text-sm mt-1 font-medium">Safely returned</div>
              </div>
            </div>

            {/* Tile 4: Overdue Alert */}
            <div className="col-span-1 row-span-1 bg-rose-500 rounded-[2rem] p-6 text-white flex flex-col justify-between bento-shadow bento-hover relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-2 text-rose-100 font-bold">
                <BellRing className="w-5 h-5 animate-pulse" /> Urgent Attention
              </div>
              <div>
                <div className="text-5xl font-extrabold">{2}</div>
                <div className="text-rose-100 font-semibold mt-1">Loans Overdue</div>
              </div>
            </div>

            {/* Tile 5: Portfolio Mix */}
            <div className="col-span-1 row-span-1 bg-white rounded-[2rem] p-6 flex flex-col justify-between bento-shadow bento-hover border border-slate-100">
              <div className="text-slate-500 font-bold flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Loan Status Mix
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div> Active
                  </div>
                  <span className="font-bold text-slate-900">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Paid
                  </div>
                  <span className="font-bold text-slate-900">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div> Overdue
                  </div>
                  <span className="font-bold text-slate-900">2</span>
                </div>
              </div>
            </div>

            {/* Tile 6: Recent Loans (Spans 2 cols, 2 rows) */}
            <div className="col-span-2 row-span-2 bg-white rounded-[2rem] p-6 flex flex-col bento-shadow border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <List className="w-5 h-5 text-slate-400" /> Recent Loans
                </h3>
                <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {loans.map(loan => (
                  <div key={loan.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        {loan.borrower.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{loan.borrower}</div>
                        <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                          Due {loan.due} • {loan.rate}% rate
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="font-bold text-slate-900">{formatRs(loan.principal)}</div>
                        <div className="text-xs font-semibold text-slate-500">{formatRs(loan.remaining)} left</div>
                      </div>
                      {loan.status === 'active' && <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">Active</div>}
                      {loan.status === 'paid' && <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">Paid</div>}
                      {loan.status === 'overdue' && <div className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase tracking-wider">Overdue</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tile 7: Quick Action Area */}
            <div className="col-span-2 row-span-1 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[2rem] p-6 flex items-center justify-center text-center bento-hover cursor-pointer group">
              <div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-indigo-900 text-lg">Drop statements here</h4>
                <p className="text-indigo-600/70 font-medium text-sm mt-1">PDF, CSV, or screenshots to auto-import</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
