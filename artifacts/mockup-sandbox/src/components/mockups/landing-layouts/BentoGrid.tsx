import "./_group.css";
import { Button } from "@/components/ui/button";
import { Wallet, ShieldCheck, TrendingUp, Users, ArrowRight } from "lucide-react";

export function BentoGrid() {
  return (
    <div className="landing-root min-h-screen bg-background text-foreground flex flex-col p-4 md:p-6 lg:p-8 lg:h-screen lg:overflow-hidden">
      {/* Header - integrated loosely above the grid or as a small bar */}
      <header className="flex items-center justify-between mb-6 shrink-0 max-w-[1400px] w-full mx-auto px-2">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Wallet className="h-5 w-5" />
          </div>
          <span>Ledger</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-medium hidden sm:flex">Sign In</Button>
          <Button size="sm" className="font-medium">Get Started</Button>
        </div>
      </header>

      {/* Main Bento Grid */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 lg:grid-rows-3 gap-4 lg:gap-6 min-h-0">
        
        {/* 1. Hero Block (Large, focal point) */}
        <div className="bg-card border border-border rounded-3xl p-8 lg:p-12 xl:col-span-2 lg:row-span-2 bento-shadow flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              Personal loan management, simplified
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Your money,
              <br />
              <span className="text-primary">accounted for.</span>
            </h1>
            
            <p className="text-base lg:text-lg text-muted-foreground mb-10 leading-relaxed max-w-md">
              Keep a trusted record of every loan you've given — to friends, family, or colleagues.
              Track payments, monitor balances, and never lose sight of what's owed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button size="lg" className="w-full sm:w-auto text-base px-6 py-6 font-semibold shadow-sm rounded-xl">
                Start tracking for free
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-6 py-6 font-semibold rounded-xl bg-transparent hover:bg-muted/50 border-2">
                Sign in to your ledger
              </Button>
            </div>
          </div>
        </div>

        {/* 2. Feature: Loan Register */}
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 bento-shadow bento-hover flex flex-col justify-between group">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-3">Loan Register</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track every rupee you lend — principal, interest rate, due date, all in one place.
            </p>
          </div>
        </div>

        {/* 3. Feature: Payment Tracking */}
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 bento-shadow bento-hover flex flex-col justify-between group">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-3">Payment Tracking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Record each payment and watch the outstanding balance update automatically.
            </p>
          </div>
        </div>

        {/* 4. Feature: Status at a Glance */}
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 bento-shadow bento-hover flex flex-col justify-between group">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-3">Status at a Glance</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Know instantly which loans are active, overdue, or fully paid.
            </p>
          </div>
        </div>

        {/* 5. Feature: Personal Ledger */}
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 bento-shadow bento-hover flex flex-col justify-between group">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-3">Personal Ledger</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your private ledger for loans to friends and family — organized and secure.
            </p>
          </div>
        </div>

        {/* 6. CTA Block */}
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 lg:p-10 xl:col-span-2 bento-shadow flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          
          <div className="relative z-10 text-center sm:text-left flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 tracking-tight">Ready to start?</h2>
            <p className="text-primary-foreground/80 text-sm lg:text-base max-w-md">
              Create your personal ledger in seconds. No complexity, just clarity.
            </p>
          </div>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto relative z-10 text-primary font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            Create your free account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* 7. Small footer-like block in the grid */}
        <div className="bg-transparent rounded-3xl p-6 xl:col-span-2 flex items-end justify-center lg:justify-end pb-8">
          <div className="text-center lg:text-right">
            <div className="flex items-center justify-center lg:justify-end gap-2 font-bold text-foreground mb-1">
              <Wallet className="h-4 w-4 text-primary" />
              Ledger
            </div>
            <p className="text-xs text-muted-foreground">
              Your trusted personal loan register.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
