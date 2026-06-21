import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SocialConnect } from "@/components/social-connect";
import { useTheme } from "@/lib/theme";
import { LogoGlyph } from "@/components/logo";
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export function LandingPage() {
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <LogoGlyph className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">Ledger</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" className="font-medium hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-medium">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero: Split Left/Right */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column: Copy & CTAs */}
          <div className="text-left space-y-8 z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Personal loan management, simplified
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
              Your money,
              <br />
              <span className="text-primary">accounted for.</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Keep a trusted record of every loan you've given — to friends, family, or colleagues.
              Track payments, monitor balances, and never lose sight of what's owed.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 font-semibold shadow-lg shadow-primary/20">
                  Start tracking for free
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 font-semibold bg-background/50 backdrop-blur-sm">
                  Sign in to your ledger
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Product Preview */}
          <div className="relative w-full h-[500px] lg:h-[600px] rounded-2xl bg-gradient-to-tr from-primary/5 to-muted border border-border p-4 sm:p-8 flex items-center justify-center overflow-hidden bento-shadow">
            {/* Mock Dashboard UI */}
            <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col relative z-10 transform rotate-[-1deg] transition-transform hover:rotate-0 duration-500">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground font-medium mb-1">Total Outstanding</div>
                  <div className="text-2xl font-bold font-mono tracking-tight">₹4,25,000</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* List */}
              <div className="p-2 flex flex-col gap-1">
                <div className="p-3 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
                      MK
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Mohan (Car Repair)</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-destructive" />
                        Due in 5 days
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm font-mono">₹1,20,000</div>
                    <div className="text-xs text-destructive font-medium">Pending</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                      SJ
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Sneha (Rent Share)</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowDownRight className="h-3 w-3 text-success" />
                        Paid yesterday
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm font-mono">₹85,000</div>
                    <div className="text-xs text-success font-medium flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Paid
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                      DT
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Dev (Startup)</div>
                      <div className="text-xs text-muted-foreground">
                        Monthly • 5% APR
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm font-mono">₹2,20,000</div>
                    <div className="text-xs text-muted-foreground font-medium">Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative background blobs */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          </div>

        </div>
      </section>

      {/* Features: Horizontal Row */}
      <section className="py-20 px-6 border-y border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Everything you need to track loans
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-background rounded-2xl p-6 border border-border flex flex-col items-start text-left bento-hover"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Ready to start?</h2>
          <p className="text-primary-foreground/80 text-xl mb-10 max-w-xl mx-auto">
            Create your personal ledger in seconds. No complexity, just clarity.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="text-base px-10 py-6 font-semibold shadow-xl hover:scale-105 transition-transform text-primary">
              Create your free account
            </Button>
          </Link>
        </div>
      </section>

      {/* Connect with us */}
      <SocialConnect />

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-3 text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <LogoGlyph className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Ledger</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your trusted personal loan register.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <Link href="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</Link>
            <Link href="/data-usage" className="hover:text-foreground transition-colors">Data Usage</Link>
            <Link href="/license" className="hover:text-foreground transition-colors">License</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
