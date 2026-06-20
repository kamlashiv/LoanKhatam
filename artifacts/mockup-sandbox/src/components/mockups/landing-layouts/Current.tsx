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

export function Current() {
  return (
    <div className="landing-root min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Wallet className="h-6 w-6 text-primary" />
            <span>Ledger</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-medium">Sign In</Button>
            <Button className="font-medium">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <ShieldCheck className="h-4 w-4" />
            Personal loan management, simplified
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Your money,
            <br />
            <span className="text-primary">accounted for.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
            Keep a trusted record of every loan you've given — to friends, family, or colleagues.
            Track payments, monitor balances, and never lose sight of what's owed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 py-6 font-semibold shadow-md">
              Start tracking for free
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6 font-semibold">
              Sign in to your ledger
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
            Everything you need to track loans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Ready to start?</h2>
          <p className="text-muted-foreground mb-8">
            Create your personal ledger in seconds. No complexity, just clarity.
          </p>
          <Button size="lg" className="text-base px-10 py-6 font-semibold shadow-md">
            Create your free account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 font-semibold text-foreground mb-2">
          <Wallet className="h-4 w-4 text-primary" />
          Ledger
        </div>
        Your trusted personal loan register.
      </footer>
    </div>
  );
}
