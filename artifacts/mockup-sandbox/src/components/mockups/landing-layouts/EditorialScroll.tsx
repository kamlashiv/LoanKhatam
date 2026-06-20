import "./_group.css";
import { Button } from "@/components/ui/button";
import { Wallet, ShieldCheck, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Loan Register",
    description: "Track every rupee you lend — principal, interest rate, due date, all in one place.",
  },
  {
    icon: TrendingUp,
    title: "Payment Tracking",
    description: "Record each payment and watch the outstanding balance update automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Status at a Glance",
    description: "Know instantly which loans are active, overdue, or fully paid.",
  },
  {
    icon: Users,
    title: "Personal Ledger",
    description: "Your private ledger for loans to friends and family — organized and secure.",
  },
];

export function EditorialScroll() {
  return (
    <div className="landing-root min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <Wallet className="h-6 w-6 text-primary" />
            <span>Ledger</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-medium px-6">Sign In</Button>
            <Button className="font-medium px-6 rounded-full">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 text-primary rounded-full px-5 py-2 text-sm font-semibold mb-12 uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" />
            Personal loan management, simplified
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] mb-8">
            Your money,
            <span className="block text-primary mt-2">accounted for.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 leading-relaxed max-w-2xl text-balance">
            Keep a trusted record of every loan you've given — to friends, family, or colleagues.
            Track payments, monitor balances, and never lose sight of what's owed.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-lg">
            <Button size="lg" className="w-full text-lg h-16 rounded-full font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-105">
              Start tracking for free
            </Button>
            <Button size="lg" variant="outline" className="w-full text-lg h-16 rounded-full font-semibold border-2 hover:bg-muted transition-all">
              Sign in to your ledger
            </Button>
          </div>
        </div>
      </section>

      {/* Editorial Features Introduction */}
      <section className="py-32 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Everything you need to track loans
          </h2>
          <div className="h-24 w-px bg-primary mx-auto opacity-20"></div>
        </div>
      </section>

      {/* Numbered Editorial Features */}
      <section className="flex flex-col w-full">
        {features.map((f, i) => {
          const isEven = i % 2 !== 0;
          return (
            <div key={f.title} className="w-full border-b border-border/40 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="max-w-6xl mx-auto px-6 py-32 md:py-48 flex flex-col md:flex-row items-center gap-16 md:gap-24">
                
                {/* Index Numeral */}
                <div className={`text-[12rem] md:text-[16rem] font-black leading-none text-muted/20 select-none ${isEven ? 'md:order-last' : ''}`}>
                  0{i + 1}
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-background border border-border flex items-center justify-center mb-8 shadow-sm bento-hover">
                    <f.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{f.title}</h3>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-balance">
                    {f.description}
                  </p>
                </div>

              </div>
            </div>
          );
        })}
      </section>

      {/* Final CTA */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-32 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Ready to start?</h2>
          <p className="text-2xl text-primary-foreground/80 mb-12 text-balance leading-relaxed">
            Create your personal ledger in seconds. No complexity, just clarity.
          </p>
          <Button size="lg" variant="secondary" className="text-xl px-12 py-8 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform text-primary">
            Create your free account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-16 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3 font-bold text-2xl tracking-tight mb-4">
            <Wallet className="h-8 w-8 text-primary" />
            Ledger
          </div>
          <p className="text-lg text-muted-foreground">
            Your trusted personal loan register.
          </p>
        </div>
      </footer>
    </div>
  );
}
