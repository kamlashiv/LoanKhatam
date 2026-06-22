import React from "react";
import { TrendingUp, Coins, CheckCircle2, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SplitShowcase() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-white selection:bg-indigo-500 selection:text-white">
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: `
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}} />

      {/* Left Pane - Immersive Showcase */}
      <div className="lg:w-[58%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-10 lg:p-20 flex flex-col justify-between font-jakarta z-0">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500 opacity-30 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500 opacity-20 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg border border-indigo-300/30">
              <div className="relative">
                <TrendingUp className="text-white w-6 h-6" strokeWidth={2.5} />
                <Coins className="text-emerald-300 w-3 h-3 absolute -bottom-1 -right-1" strokeWidth={3} />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white/90">Loan Khatam</span>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Track what you lend.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-100">Get your money back.</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-12 max-w-xl leading-relaxed">
              The smartest way to manage personal loans with friends and family. Clear records, gentle reminders, zero awkwardness.
            </p>

            {/* Value Props */}
            <div className="flex flex-col gap-5 mb-16">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-lg text-indigo-50 font-medium">Keep perfect track of every rupee lent or borrowed</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-lg text-indigo-50 font-medium">Auto-sync payments and balance calculations</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <p className="text-lg text-indigo-50 font-medium">Your financial data is private and securely encrypted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Preview Card (Tasteful visual) */}
        <div className="relative z-10 glass-card rounded-2xl p-6 shadow-2xl max-w-lg transform rotate-[-2deg] transition-transform hover:rotate-0 duration-500 mt-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-lg">
                R
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">Rahul Sharma</h4>
                <p className="text-sm text-indigo-200">Lent on 12 Oct, 2023</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-200 uppercase tracking-wider font-semibold">Outstanding</p>
              <h3 className="text-3xl font-extrabold text-emerald-300">₹45,000</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-indigo-100 font-medium">
              <span>Repayment Progress</span>
              <span>₹15,000 / ₹60,000</span>
            </div>
            <div className="h-3 w-full bg-indigo-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-1/4"></div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="absolute bottom-8 right-12 z-10 glass-card px-4 py-2 rounded-full hidden lg:flex items-center gap-2 shadow-lg">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-indigo-400 border border-indigo-600"></div>
            ))}
          </div>
          <span className="text-sm font-semibold text-white ml-2">Over ₹10 Lakh+ tracked today</span>
        </div>

      </div>

      {/* Right Pane - Form */}
      <div className="lg:w-[42%] flex items-center justify-center p-8 lg:p-24 bg-white relative font-jakarta">
        <div className="w-full max-w-[440px] space-y-10">
          
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 text-lg">Sign in to access your ledger</p>
          </div>

          <div className="space-y-6">
            <Button 
              variant="outline" 
              className="w-full h-14 text-base font-semibold border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm flex items-center justify-center gap-3 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.71 17.59V20.35H19.28C21.36 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.16 22.02 18.72 20.35L15.15 17.59C14.31 18.15 13.25 18.49 12 18.49C9.58 18.49 7.53 16.86 6.79 14.67H3.11V17.52C4.75 20.77 8.11 23 12 23Z" fill="#34A853"/>
                <path d="M6.79 14.67C6.60 14.11 6.49 13.51 6.49 12.9C6.49 12.29 6.60 11.69 6.79 11.13V8.28H3.11C2.42 9.64 2 11.23 2 12.9C2 14.57 2.42 16.16 3.11 17.52L6.79 14.67Z" fill="#FBBC05"/>
                <path d="M12 7.31C13.62 7.31 15.06 7.87 16.21 8.94L19.36 5.8C17.16 3.82 14.97 2.8 12 2.8C8.11 2.8 4.75 5.03 3.11 8.28L6.79 11.13C7.53 8.94 9.58 7.31 12 7.31Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">or sign in with email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="h-14 bg-slate-50 border-slate-200 text-base focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                />
              </div>

              <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold shadow-md shadow-indigo-600/20 group">
                Continue
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-8">
              Don't have an account?{" "}
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
