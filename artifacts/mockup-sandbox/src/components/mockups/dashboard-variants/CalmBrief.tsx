import React from "react";
import { Wallet, Bell, Menu, Plus, User, Search, ChevronRight, Activity, HandCoins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CalmBrief() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#4A443E] font-sans selection:bg-[#EBDDD0]">
      {/* Import Google Font for this variant */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Inter:wght@400;500;600&display=swap');
        .font-serif-calm { font-family: 'Fraunces', serif; }
        .font-sans-calm { font-family: 'Inter', sans-serif; }
        .progress-ring {
          stroke-dasharray: 283;
          stroke-dashoffset: 107.54; /* 62% of 283 */
          transition: stroke-dashoffset 1s ease-in-out;
        }
        `
      }} />

      {/* App Chrome */}
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-[#EBDDD0]/50">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#5A524A]">
            <Wallet className="h-6 w-6 text-[#A68A6D]" />
            <span className="font-serif-calm font-medium tracking-tight text-xl">Ledger</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-sans-calm text-sm font-medium text-[#7D736A]">
            <a href="#" className="text-[#4A443E]">Dashboard</a>
            <a href="#" className="hover:text-[#4A443E] transition-colors">All Loans</a>
            <a href="#" className="hover:text-[#4A443E] transition-colors">Amortization</a>
            <a href="#" className="hover:text-[#4A443E] transition-colors">Planner</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-[#F2ECE7] transition-colors text-[#7D736A]">
              <Search className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-[#EBDDD0]/50 hover:bg-[#EBDDD0] transition-colors text-[#4A443E]">
              <User className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pt-20 pb-24 font-sans-calm">
        {/* Narrative Insight */}
        <section className="text-center mb-16 space-y-6">
          <p className="text-sm font-medium tracking-widest uppercase text-[#A68A6D]">June 20, 2026</p>
          <h1 className="font-serif-calm text-4xl md:text-5xl leading-[1.15] text-[#2C2825]">
            You have collected <br/>
            <span className="text-[#8B9D83] italic">62% of the money</span><br/>
            you’ve lent out.
          </h1>
          <p className="text-lg text-[#7D736A] max-w-md mx-auto">
            You are making steady progress. Out of the ₹25,00,000 you lent, you've safely brought back ₹15,60,000.
          </p>

          <div className="flex justify-center mt-8">
            <div className="relative h-40 w-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#F2ECE7" strokeWidth="6" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#8B9D83" strokeWidth="6" strokeLinecap="round" className="progress-ring" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif-calm text-4xl text-[#2C2825]">62<span className="text-2xl">%</span></span>
                <span className="text-xs uppercase tracking-widest text-[#A68A6D] mt-1">Collected</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Actionable Nudge */}
        <section className="bg-[#FFF8F3] border border-[#E8D8CA] rounded-3xl p-8 mb-16 shadow-sm shadow-[#EBDDD0]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Bell className="w-24 h-24 text-[#C96A5B]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="bg-[#C96A5B]/10 p-3 rounded-2xl shrink-0">
              <Bell className="w-6 h-6 text-[#C96A5B]" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif-calm text-xl text-[#2C2825] mb-2">2 loans need your attention</h2>
              <p className="text-[#7D736A] leading-relaxed">
                Arjun Nair and Ananya Iyer have missed their due dates. Together, they owe an outstanding balance of <strong className="text-[#2C2825] font-medium">₹6,00,000</strong>.
              </p>
            </div>
            <button className="shrink-0 bg-[#C96A5B] text-white px-5 py-3 rounded-xl font-medium text-sm hover:bg-[#B35C4E] transition-colors shadow-sm">
              Send Reminders
            </button>
          </div>
        </section>

        {/* Soft Metrics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="space-y-1">
            <div className="text-sm text-[#7D736A] flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#EBDDD0]"></div>Total Lent</div>
            <div className="font-serif-calm text-xl text-[#2C2825]">₹25,00,000</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-[#7D736A] flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#A68A6D]"></div>Outstanding</div>
            <div className="font-serif-calm text-xl text-[#2C2825]">₹9,40,000</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-[#7D736A] flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#8B9D83]"></div>Collected</div>
            <div className="font-serif-calm text-xl text-[#2C2825]">₹15,60,000</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-[#7D736A] flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#2C2825]"></div>Portfolio</div>
            <div className="font-sans-calm font-medium text-lg text-[#2C2825]">8 <span className="text-[#7D736A] text-sm font-normal">loans total</span></div>
          </div>
        </section>

        {/* Airy List of Recent Loans */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif-calm text-2xl text-[#2C2825]">Recent Loans</h2>
            <a href="#" className="text-[#A68A6D] text-sm font-medium hover:text-[#7D736A] flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="space-y-3">
            {[
              { name: "Rohan Mehta", amt: "₹5,00,000", rem: "₹2,10,000 left", stat: "active", date: "Jul 15, 2026" },
              { name: "Kavya Reddy", amt: "₹2,00,000", rem: "₹80,000 left", stat: "active", date: "Aug 20, 2026" },
              { name: "Priya Sharma", amt: "₹3,00,000", rem: "Fully settled", stat: "paid", date: "May 1, 2026" },
            ].map((loan, i) => (
              <div key={i} className="group bg-white border border-[#F2ECE7] hover:border-[#EBDDD0] rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDFCFB] border border-[#EBDDD0] flex items-center justify-center text-[#A68A6D] font-serif-calm text-lg">
                    {loan.name[0]}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2C2825]">{loan.name}</h3>
                    <p className="text-sm text-[#7D736A] mt-0.5">Due {loan.date} • {loan.rem}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="hidden sm:block">
                    <div className="font-serif-calm text-lg text-[#2C2825]">{loan.amt}</div>
                  </div>
                  {loan.stat === "active" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F2ECE7] text-[#5A524A]">
                      Active
                    </span>
                  )}
                  {loan.stat === "paid" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0F5EE] text-[#6A8060]">
                      Paid
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-[#D4C8BC] group-hover:text-[#A68A6D] transition-colors" />
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-[#EBDDD0] text-[#A68A6D] font-medium flex items-center justify-center gap-2 hover:bg-[#FDFCFB] hover:border-[#D4C8BC] transition-colors">
            <Plus className="w-5 h-5" />
            Add a new loan
          </button>
        </section>
      </main>
    </div>
  );
}
