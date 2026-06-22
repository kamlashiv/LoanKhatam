import React, { useState } from "react";
import { 
  TrendingUp, 
  Coins, 
  Lock, 
  ShieldCheck, 
  ChevronRight, 
  Mail, 
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UnlockVault() {
  const [email, setEmail] = useState("");

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Google Font Link */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      <style>{`
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        .vault-glass {
          background: rgba(15, 15, 20, 0.65);
          backdrop-filter: blur(20px) saturate(120%);
          -webkit-backdrop-filter: blur(20px) saturate(120%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        .blurred-bg {
          filter: blur(8px) brightness(0.6) contrast(1.1);
          transform: scale(1.02);
          pointer-events: none;
        }

        .gradient-text {
          background: linear-gradient(to right, #818cf8, #a78bfa, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .emerald-text {
          color: #34d399;
        }
      `}</style>

      {/* --- BACKGROUND MOCK DASHBOARD (BLURRED) --- */}
      <div className="absolute inset-0 z-0 blurred-bg p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 opacity-60">
        {/* Header */}
        <div className="col-span-1 lg:col-span-12 flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Loan Khatam</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>

        {/* Stats Row */}
        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium">Total Lent</p>
            <p className="text-3xl font-semibold text-white mt-2">₹ 1,45,000</p>
            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[65%]"></div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium">Outstanding</p>
            <p className="text-3xl font-semibold text-rose-400 mt-2">₹ 45,000</p>
            <p className="text-sm text-slate-500 mt-2">From 3 people</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm font-medium">Collected</p>
            <p className="text-3xl font-semibold emerald-text mt-2">₹ 1,00,000</p>
            <p className="text-sm text-slate-500 mt-2">+₹12,000 this month</p>
          </div>
        </div>

        {/* Ledger Rows */}
        <div className="col-span-1 lg:col-span-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mt-2">
          <h3 className="text-lg font-medium text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">R</div>
                  <div>
                    <p className="text-white font-medium">Rahul Sharma</p>
                    <p className="text-slate-500 text-sm">Given for medical emergency</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">₹ 15,000</p>
                  <p className="text-rose-400 text-xs">Pending</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOREGROUND AUTH PANEL --- */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 font-outfit">
        {/* Glow effect behind panel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-[420px] vault-glass rounded-[2rem] p-8 sm:p-10 text-center relative overflow-hidden">
          {/* subtle noise texture overlay could go here, omitting for performance */}
          
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full"></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-xl flex items-center justify-center relative z-10 border border-indigo-400/30">
                <Lock className="text-white w-7 h-7" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Unlock your ledger.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mb-8">
            Your personal financial data is encrypted and waiting for you.
          </p>

          <div className="space-y-4 text-left">
            <Button 
              variant="outline" 
              className="w-full h-12 bg-white hover:bg-slate-50 text-slate-900 border-0 rounded-xl font-medium transition-all"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-700/50"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-medium uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-slate-700/50"></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">Email address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-600 pl-10 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 rounded-xl"
                />
              </div>
            </div>

            <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 group">
              Open Vault
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-emerald-400/80 bg-emerald-400/10 py-2 px-3 rounded-lg w-fit mx-auto border border-emerald-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bank-grade encryption</span>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            New here?{" "}
            <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create your ledger
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
